import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Volume2, Check, Star, Filter, Trophy, Zap, TrendingUp, Target, Award, Clock, Mic, Edit3, AlertCircle, BarChart3, CheckCircle2, Eye, Brain, MessageCircle, Sparkles } from "lucide-react";
import { vocabularyDatabase, vocabularyCategories, type VocabWord } from "../data/vocabulary";

type MasteryLevel = 0 | 1 | 2 | 3 | 4;
type FrequencyTag = "high" | "medium" | "advanced";
type ContextLevel = "casual" | "safe" | "business" | "formal";
type VocabularyType = "passive" | "active";

interface WordProgress {
  word: string;
  masteryLevel: MasteryLevel;
  lastReviewed: number;
  nextReview: number;
  timesUsed: number;
  type: VocabularyType;
}

interface EnhancedVocabWord extends VocabWord {
  frequency: FrequencyTag;
  contextLevel: ContextLevel;
  professionalAlternative?: string;
  example2?: string;
  speakingPrompt: string;
  writingPrompt: string;
}

export default function Vocabulary() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [wordProgress, setWordProgress] = useState<Map<string, WordProgress>>(new Map());
  const [showActiveUse, setShowActiveUse] = useState(false);
  const [userSentence, setUserSentence] = useState("");
  const [wordsInReview, setWordsInReview] = useState<string[]>([]);
  const [showRetention, setShowRetention] = useState(false);
  const [activeScore, setActiveScore] = useState(0);

  useEffect(() => {
    const savedProgress = localStorage.getItem("wordProgress");
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      setWordProgress(new Map(Object.entries(parsed)));
    }

    // Calculate words in review (due today)
    const now = Date.now();
    const due = Array.from(wordProgress.values()).filter(
      p => p.nextReview <= now && p.masteryLevel < 4
    );
    setWordsInReview(due.map(d => d.word));

    // Calculate active mastery score
    const activeWords = Array.from(wordProgress.values()).filter(p => p.type === "active");
    const avgMastery = activeWords.length > 0 
      ? activeWords.reduce((sum, w) => sum + w.masteryLevel, 0) / activeWords.length 
      : 0;
    setActiveScore(Math.round((avgMastery / 4) * 100));
  }, []);

  // Enhance vocabulary with additional metadata
  const enhanceWord = (word: VocabWord): EnhancedVocabWord => {
    const enhancements: Record<string, Partial<EnhancedVocabWord>> = {
      "run into": {
        frequency: "high",
        contextLevel: "safe",
        professionalAlternative: "Encounter unexpectedly",
        example2: "I ran into my old boss at the conference.",
        speakingPrompt: "Tell about a time you ran into someone unexpectedly.",
        writingPrompt: "Write about an interesting person you ran into recently."
      },
      "network": {
        frequency: "high",
        contextLevel: "business",
        professionalAlternative: "Professional connections",
        example2: "She built a strong professional network.",
        speakingPrompt: "Describe your professional network in one sentence.",
        writingPrompt: "Write about how to build a strong network."
      },
      "strategy": {
        frequency: "high",
        contextLevel: "business",
        professionalAlternative: "Approach / Plan",
        example2: "What's your strategy for this quarter?",
        speakingPrompt: "Explain a successful strategy you've used.",
        writingPrompt: "Outline a strategy for achieving a goal."
      },
      "awesome": {
        frequency: "high",
        contextLevel: "casual",
        professionalAlternative: "Excellent / Outstanding",
        example2: "The concert was awesome!",
        speakingPrompt: "Tell someone about something awesome that happened.",
        writingPrompt: "Describe an awesome experience."
      }
    };

    const enhancement = enhancements[word.word.toLowerCase()] || {
      frequency: word.usFrequency >= 4 ? "high" : word.usFrequency >= 2 ? "medium" : "advanced",
      contextLevel: "safe" as ContextLevel,
      example2: `Another example with "${word.word}"`,
      speakingPrompt: `Use "${word.word}" in a sentence out loud.`,
      writingPrompt: `Write a sentence using "${word.word}".`
    };

    return { ...word, ...enhancement } as EnhancedVocabWord;
  };

  const filteredWords = (selectedCategory === "All" 
    ? vocabularyDatabase 
    : vocabularyDatabase.filter(w => w.category === selectedCategory)
  ).map(enhanceWord);

  const currentWord = filteredWords[currentIndex];
  const progress = wordProgress.get(currentWord.word);

  // Mastery level progression
  const updateMasteryLevel = (newLevel: MasteryLevel) => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    // Spaced repetition intervals
    const reviewIntervals: Record<MasteryLevel, number> = {
      0: dayMs * 1,      // 1 day
      1: dayMs * 3,      // 3 days
      2: dayMs * 7,      // 7 days
      3: dayMs * 14,     // 14 days
      4: dayMs * 30      // 30 days (mastered)
    };

    const newProgress: WordProgress = {
      word: currentWord.word,
      masteryLevel: newLevel,
      lastReviewed: now,
      nextReview: now + reviewIntervals[newLevel],
      timesUsed: (progress?.timesUsed || 0) + 1,
      type: newLevel >= 2 ? "active" : "passive"
    };

    const updated = new Map(wordProgress);
    updated.set(currentWord.word, newProgress);
    setWordProgress(updated);

    // Save to localStorage
    const obj = Object.fromEntries(updated);
    localStorage.setItem("wordProgress", JSON.stringify(obj));

    // Update global stats
    const stats = JSON.parse(localStorage.getItem("englishStats") || "{}");
    stats.wordsLearned = updated.size;
    localStorage.setItem("englishStats", JSON.stringify(stats));
  };

  const nextWord = () => {
    setShowAnswer(false);
    setShowActiveUse(false);
    setUserSentence("");
    setCurrentIndex((prev) => (prev + 1) % filteredWords.length);
  };

  const previousWord = () => {
    setShowAnswer(false);
    setShowActiveUse(false);
    setUserSentence("");
    setCurrentIndex((prev) => (prev - 1 + filteredWords.length) % filteredWords.length);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Check if sentence contains the word
  const checkSentence = () => {
    const sentence = userSentence.toLowerCase().trim();
    const word = currentWord.word.toLowerCase().trim();
    
    // Calculate Levenshtein distance for typo detection
    const levenshteinDistance = (str1: string, str2: string): number => {
      const matrix: number[][] = [];
      
      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
      }
      
      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
      }
      
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1, // substitution
              matrix[i][j - 1] + 1,     // insertion
              matrix[i - 1][j] + 1      // deletion
            );
          }
        }
      }
      
      return matrix[str2.length][str1.length];
    };
    
    // Get the root word (remove common endings)
    const getWordRoot = (w: string): string => {
      // Remove common verb endings: -s, -ed, -ing
      // Remove common noun endings: -s, -es
      return w
        .replace(/ing$/, '')
        .replace(/ed$/, '')
        .replace(/es$/, '')
        .replace(/s$/, '')
        .replace(/d$/, '');
    };
    
    const wordRoot = getWordRoot(word);
    
    // Split sentence into words and check each one
    const sentenceWords = sentence.split(/\s+/).map(w => w.replace(/[.,!?;:'"]/g, '').toLowerCase());
    
    // Check for exact match or variations
    const exactMatch = sentenceWords.some(w => {
      const cleanWord = w;
      return cleanWord === word || 
             cleanWord.startsWith(wordRoot) ||
             getWordRoot(cleanWord) === wordRoot;
    });
    
    if (exactMatch) {
      // Perfect! Word found
      const currentLevel = progress?.masteryLevel || 0;
      updateMasteryLevel(Math.min(4, Math.max(2, currentLevel + 1)) as MasteryLevel);
      alert("✅ Great! Word used correctly. Mastery level increased!");
      nextWord();
      return;
    }
    
    // Check for typos (words that are very close)
    let closestWord = "";
    let minDistance = Infinity;
    
    sentenceWords.forEach(w => {
      const distance = levenshteinDistance(w, word);
      if (distance < minDistance && distance <= 2) {
        minDistance = distance;
        closestWord = w;
      }
    });
    
    if (closestWord && minDistance <= 2) {
      // Found a word that's very close (probably a typo)
      alert(`⚠️ Almost! Check the spelling: you wrote "${closestWord}" but the word is "${currentWord.word}"\n\nCorrect spelling: ${currentWord.word.toUpperCase()}`);
    } else {
      // Word not found at all
      alert(`⚠️ Try to include the word "${currentWord.word}" in your sentence.\n\nYour sentence: "${userSentence}"\n\nMake sure you spell it correctly!`);
    }
  };

  const getMasteryLabel = (level: MasteryLevel): string => {
    const labels = {
      0: "Seen",
      1: "Recognized",
      2: "Used once",
      3: "Used naturally",
      4: "Automatic"
    };
    return labels[level];
  };

  const getMasteryColor = (level: MasteryLevel): string => {
    const colors = {
      0: "from-gray-500 to-gray-600",
      1: "from-blue-500 to-blue-600",
      2: "from-yellow-500 to-yellow-600",
      3: "from-orange-500 to-orange-600",
      4: "from-green-500 to-emerald-600"
    };
    return colors[level];
  };

  const getFrequencyColor = (freq: FrequencyTag): string => {
    return freq === "high" ? "text-red-400" : freq === "medium" ? "text-yellow-400" : "text-blue-400";
  };

  const getFrequencyIcon = (freq: FrequencyTag): string => {
    return freq === "high" ? "🔥" : freq === "medium" ? "⚡" : "🧠";
  };

  const getContextColor = (context: ContextLevel): string => {
    switch (context) {
      case "casual": return "bg-green-500/30 text-green-300";
      case "safe": return "bg-blue-500/30 text-blue-300";
      case "business": return "bg-purple-500/30 text-purple-300";
      case "formal": return "bg-gray-500/30 text-gray-300";
      default: return "bg-gray-500/30 text-gray-300";
    }
  };

  // Calculate retention rate
  const retentionRate = wordProgress.size > 0
    ? Math.round((Array.from(wordProgress.values()).filter(p => p.masteryLevel >= 2).length / wordProgress.size) * 100)
    : 0;

  // Passive vs Active counts
  const passiveCount = Array.from(wordProgress.values()).filter(p => p.type === "passive").length;
  const activeCount = Array.from(wordProgress.values()).filter(p => p.type === "active").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <BookOpen className="w-10 h-10 text-blue-400" />
          Vocabulary Builder
        </h1>
        <p className="text-xl text-gray-300">
          Build fluency. <span className="text-blue-400 font-bold">Think in English.</span>
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Build a 9,000-word American vocabulary system • Spaced repetition • Active mastery
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white text-center">
          <div className="text-3xl font-bold">{wordProgress.size}</div>
          <div className="text-green-100 text-sm mt-1">Words Learned</div>
        </div>
        <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-6 text-white text-center">
          <div className="text-3xl font-bold">{wordsInReview.length}</div>
          <div className="text-orange-100 text-sm mt-1">In Review</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center">
          <div className="text-3xl font-bold">{activeScore}%</div>
          <div className="text-purple-100 text-sm mt-1">Active Mastery</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white text-center">
          <div className="text-3xl font-bold">{retentionRate}%</div>
          <div className="text-blue-100 text-sm mt-1">Retention Rate</div>
        </div>
      </div>

      {/* Passive vs Active Vocabulary */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📊 Vocabulary Type</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-600/20 border border-blue-400/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                <span className="text-white font-semibold">Passive Vocabulary</span>
              </div>
              <span className="text-2xl font-bold text-blue-400">{passiveCount}</span>
            </div>
            <p className="text-xs text-blue-200">Words you understand but don't use yet</p>
          </div>
          <div className="bg-green-600/20 border border-green-400/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold">Active Vocabulary</span>
              </div>
              <span className="text-2xl font-bold text-green-400">{activeCount}</span>
            </div>
            <p className="text-xs text-green-200">Words you use naturally in conversation</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Filter by Category</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedCategory === "All"
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            All ({vocabularyDatabase.length})
          </button>
          {vocabularyCategories.map((category) => {
            const count = vocabularyDatabase.filter(w => w.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Word Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, rotateY: -90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: 90 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 shadow-2xl"
        >
          {/* Card Header with metadata */}
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getContextColor(currentWord.contextLevel)}`}>
                {currentWord.contextLevel}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/20 text-white">
                {currentWord.category}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Frequency Tag */}
              <span className={`text-2xl ${getFrequencyColor(currentWord.frequency)}`}>
                {getFrequencyIcon(currentWord.frequency)}
              </span>
              <span className={`text-sm font-semibold ${getFrequencyColor(currentWord.frequency)}`}>
                {currentWord.frequency.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Main Word */}
          <div className="text-center space-y-6">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">{currentWord.word}</h2>
              <div className="flex items-center justify-center gap-4 mb-4">
                <p className="text-xl text-blue-100">/{currentWord.pronunciation}/</p>
                <button
                  onClick={speakWord}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all"
                >
                  <Volume2 className="w-6 h-6 text-white" />
                </button>
              </div>
              <p className="text-sm text-blue-200 italic">{currentWord.partOfSpeech}</p>
            </div>

            {/* Always show essential info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Meaning */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left">
                <h3 className="text-lg font-semibold text-white mb-2">📖 Meaning</h3>
                <p className="text-base text-blue-100">{currentWord.definition}</p>
              </div>

              {/* Examples */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left">
                <h3 className="text-lg font-semibold text-white mb-3">💬 Examples</h3>
                <div className="space-y-2">
                  <p className="text-base text-blue-100 italic">1. "{currentWord.example}"</p>
                  {currentWord.example2 && (
                    <p className="text-base text-blue-100 italic">2. "{currentWord.example2}"</p>
                  )}
                </div>
              </div>

              {/* Professional Alternative */}
              {currentWord.professionalAlternative && (
                <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-4 text-left">
                  <h3 className="text-sm font-semibold text-purple-200 mb-1">💼 Professional Alternative</h3>
                  <p className="text-base text-white">"{currentWord.professionalAlternative}"</p>
                </div>
              )}

              {/* Additional Deep Learning Sections */}
              {currentWord.word.toLowerCase() === "run into" && (
                <>
                  {/* Synonyms & Related Expressions */}
                  <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4 text-left">
                    <h3 className="text-sm font-semibold text-green-200 mb-2">🔄 Synonyms & Similar Expressions</h3>
                    <div className="space-y-1 text-sm text-white">
                      <p>• <strong>Bump into</strong> - Very casual, exactly same meaning</p>
                      <p>• <strong>Come across</strong> - Slightly more formal</p>
                      <p>• <strong>Encounter</strong> - Formal, business context</p>
                      <p>• <strong>Cross paths with</strong> - Poetic, less common</p>
                    </div>
                  </div>

                  {/* Common Collocations */}
                  <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-4 text-left">
                    <h3 className="text-sm font-semibold text-yellow-200 mb-2">🔗 Common Collocations</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-white">
                      <p>• Run into <strong>someone</strong></p>
                      <p>• Run into <strong>trouble</strong></p>
                      <p>• Run into <strong>problems</strong></p>
                      <p>• Run into <strong>an old friend</strong></p>
                      <p>• Run into <strong>my boss</strong></p>
                      <p>• Run into <strong>difficulties</strong></p>
                    </div>
                  </div>

                  {/* Usage Contexts */}
                  <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4 text-left">
                    <h3 className="text-sm font-semibold text-blue-200 mb-2">📍 When to Use</h3>
                    <div className="space-y-2 text-sm text-white">
                      <div className="flex items-start gap-2">
                        <span className="text-green-400">✅</span>
                        <div>
                          <strong>Casual conversations:</strong> "I ran into Sarah at Starbucks!"
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400">✅</span>
                        <div>
                          <strong>Storytelling:</strong> "You'll never guess who I ran into yesterday..."
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400">✅</span>
                        <div>
                          <strong>Professional (casual tone):</strong> "I ran into Tom from accounting at the conference."
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-400">❌</span>
                        <div>
                          <strong>Formal emails:</strong> Use "encountered" or "met unexpectedly" instead
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Common Mistakes */}
                  <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 text-left">
                    <h3 className="text-sm font-semibold text-red-200 mb-2">⚠️ Common Mistakes to Avoid</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-red-300">❌ "I ran into <u>with</u> my friend"</p>
                        <p className="text-green-300">✅ "I ran into my friend"</p>
                        <p className="text-gray-300 text-xs mt-1">No preposition needed after "run into"</p>
                      </div>
                      <div>
                        <p className="text-red-300">❌ "I ran into <u>to</u> a problem"</p>
                        <p className="text-green-300">✅ "I ran into a problem"</p>
                        <p className="text-gray-300 text-xs mt-1">Don't confuse with "run in<u>to</u> the store" (physical movement)</p>
                      </div>
                      <div>
                        <p className="text-red-300">❌ "I will run into him tomorrow"</p>
                        <p className="text-green-300">✅ "I might run into him tomorrow" / "I'll meet him tomorrow"</p>
                        <p className="text-gray-300 text-xs mt-1">"Run into" implies unexpected encounter - can't plan it</p>
                      </div>
                    </div>
                  </div>

                  {/* Real Context Examples */}
                  <div className="bg-indigo-500/20 border border-indigo-400/50 rounded-xl p-4 text-left">
                    <h3 className="text-sm font-semibold text-indigo-200 mb-2">🎬 Real-World Scenarios</h3>
                    <div className="space-y-3 text-sm text-white">
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="font-semibold text-indigo-300 mb-1">🛒 Shopping</p>
                        <p className="italic">"I was grocery shopping and ran into my neighbor. We chatted for like 20 minutes!"</p>
                      </div>
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="font-semibold text-indigo-300 mb-1">🏢 Work Event</p>
                        <p className="italic">"I ran into our CEO at the networking event. He remembered my name!"</p>
                      </div>
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="font-semibold text-indigo-300 mb-1">✈️ Travel</p>
                        <p className="italic">"Can you believe I ran into my college roommate at the airport in Tokyo? What are the odds?"</p>
                      </div>
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="font-semibold text-indigo-300 mb-1">💼 Problem Context</p>
                        <p className="italic">"We ran into some technical difficulties during the presentation, but we handled it well."</p>
                      </div>
                    </div>
                  </div>

                  {/* Pronunciation Tips */}
                  <div className="bg-pink-500/20 border border-pink-400/50 rounded-xl p-4 text-left">
                    <h3 className="text-sm font-semibold text-pink-200 mb-2">🎙️ Pronunciation & Rhythm</h3>
                    <div className="space-y-2 text-sm text-white">
                      <div>
                        <p className="font-semibold mb-1">Natural American Pronunciation:</p>
                        <p className="text-pink-200 text-lg">"ruh-NIN-too" (stress on middle syllable)</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Connected Speech:</p>
                        <p className="text-pink-200">"I ran into" → sounds like "I ra-NIN-too"</p>
                        <p className="text-xs text-gray-300 mt-1">The words blend together naturally</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Common Reduction:</p>
                        <p className="text-pink-200">"ran into" → "ran-uh" (very casual/fast speech)</p>
                        <p className="text-xs text-gray-300 mt-1">In rapid conversation, "into" becomes "uh"</p>
                      </div>
                    </div>
                  </div>

                  {/* Cultural Notes */}
                  <div className="bg-orange-500/20 border border-orange-400/50 rounded-xl p-4 text-left">
                    <h3 className="text-sm font-semibold text-orange-200 mb-2">🇺🇸 American Cultural Note</h3>
                    <p className="text-sm text-white">
                      Americans use "run into" very frequently in daily conversation. It's one of the most natural ways to talk about unexpected meetings. 
                      Saying "I ran into..." immediately signals a casual story is coming. It's much more common than "I encountered" or "I met unexpectedly."
                    </p>
                    <p className="text-xs text-orange-200 mt-2">
                      💡 <strong>Pro tip:</strong> When Americans say this, they usually follow with a short story or reaction: "I ran into Jake! He looks totally different now."
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Card Footer */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/20">
            <span className="text-white/60">
              {currentIndex + 1} / {filteredWords.length}
            </span>
            {progress && (
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getMasteryColor(progress.masteryLevel)}`}>
                  {getMasteryLabel(progress.masteryLevel)}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <button
          onClick={previousWord}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
        >
          ← Previous
        </button>

        <button
          onClick={nextWord}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
        >
          Next →
        </button>
      </div>

      {/* Mastery Progress */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-semibold text-white">🎯 Mastery Progress</h3>
        </div>

        <div className="grid md:grid-cols-5 gap-3">
          {([0, 1, 2, 3, 4] as MasteryLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => updateMasteryLevel(level)}
              className={`p-4 rounded-xl transition-all ${
                progress?.masteryLevel === level
                  ? `bg-gradient-to-br ${getMasteryColor(level)} shadow-lg`
                  : "bg-white/10 hover:bg-white/20"
              } text-white`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">
                  {level === 0 && <Eye className="w-6 h-6 mx-auto" />}
                  {level === 1 && <Brain className="w-6 h-6 mx-auto" />}
                  {level === 2 && <Edit3 className="w-6 h-6 mx-auto" />}
                  {level === 3 && <MessageCircle className="w-6 h-6 mx-auto" />}
                  {level === 4 && <Sparkles className="w-6 h-6 mx-auto" />}
                </div>
                <div className="text-xs font-semibold">{getMasteryLabel(level)}</div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-400 text-center mt-4">
          Click a level to mark your current mastery of this word
        </p>
      </div>

      {/* Active Use Mode */}
      <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6" />
            <h3 className="text-2xl font-bold">🔥 Active Use Challenge</h3>
          </div>
          <button
            onClick={() => setShowActiveUse(!showActiveUse)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
          >
            {showActiveUse ? "Hide" : "Practice"}
          </button>
        </div>

        <AnimatePresence>
          {showActiveUse && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="bg-white/10 rounded-xl p-4">
                <h4 className="font-semibold mb-2">🎤 Speaking Prompt:</h4>
                <p className="text-sm text-orange-100">{currentWord.speakingPrompt}</p>
              </div>

              <div className="bg-white/10 rounded-xl p-4">
                <h4 className="font-semibold mb-2">✍️ Writing Prompt:</h4>
                <p className="text-sm text-orange-100 mb-3">{currentWord.writingPrompt}</p>
                
                <textarea
                  value={userSentence}
                  onChange={(e) => setUserSentence(e.target.value)}
                  placeholder={`Use "${currentWord.word}" in a sentence...`}
                  className="w-full h-24 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />

                <button
                  onClick={checkSentence}
                  disabled={!userSentence.trim()}
                  className="mt-3 px-6 py-2 bg-white text-orange-600 hover:bg-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg font-bold transition-all"
                >
                  ✅ Check Sentence
                </button>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-4">
                <p className="text-sm text-yellow-100">
                  💡 Using a word in your own sentence moves it from passive to active vocabulary!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Retention System (Spaced Repetition) */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6" />
            <h3 className="text-2xl font-bold">📅 Retention System (SRS)</h3>
          </div>
          <button
            onClick={() => setShowRetention(!showRetention)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
          >
            {showRetention ? "Hide" : "Show"}
          </button>
        </div>

        <AnimatePresence>
          {showRetention && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="bg-white/10 rounded-xl p-4">
                <h4 className="font-semibold mb-3">🧠 Spaced Repetition Schedule</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>📍 Level 0 (Seen)</span>
                    <span className="text-indigo-200">Review after: 1 day</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>👁️ Level 1 (Recognized)</span>
                    <span className="text-indigo-200">Review after: 3 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✍️ Level 2 (Used once)</span>
                    <span className="text-indigo-200">Review after: 7 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>💬 Level 3 (Used naturally)</span>
                    <span className="text-indigo-200">Review after: 14 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>⚡ Level 4 (Automatic)</span>
                    <span className="text-green-300">Review after: 30 days ✅</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-500/20 border border-orange-400/50 rounded-xl p-4">
                <AlertCircle className="w-5 h-5 inline mr-2" />
                <span className="text-sm">
                  Without spaced repetition, you forget 80% of new words within 24 hours!
                </span>
              </div>

              {wordsInReview.length > 0 && (
                <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4">
                  <h4 className="font-semibold mb-2">⚠️ Words Due for Review Today:</h4>
                  <div className="flex flex-wrap gap-2">
                    {wordsInReview.slice(0, 10).map((word, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white/10 rounded text-xs">
                        {word}
                      </span>
                    ))}
                    {wordsInReview.length > 10 && (
                      <span className="px-2 py-1 bg-white/10 rounded text-xs">
                        +{wordsInReview.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-start gap-3">
          <Zap className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg mb-3">💡 Mastery Tips:</h3>
            <ul className="space-y-2 text-yellow-100 text-sm">
              <li>• <strong>Level 0 → 1:</strong> See the word, understand meaning</li>
              <li>• <strong>Level 1 → 2:</strong> Use it once in writing or speaking</li>
              <li>• <strong>Level 2 → 3:</strong> Use it naturally in 3+ different contexts</li>
              <li>• <strong>Level 3 → 4:</strong> Use without thinking - it's automatic!</li>
              <li>• <strong>Active vocabulary</strong> starts at Level 2 - when you actually USE the word</li>
              <li>• Review words on schedule - don't skip or you'll forget!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}