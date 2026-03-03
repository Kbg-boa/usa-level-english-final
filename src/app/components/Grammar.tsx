import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, AlertCircle, CheckCircle2, Lightbulb, Volume2, Edit3, Zap, TrendingUp, Award, Target, MessageCircle, Briefcase, Globe, Clock, Eye, Mic2, XCircle } from "lucide-react";

type GrammarCategory = "High-Frequency" | "Business" | "Spoken";
type PracticeMode = "recognition" | "correction" | "writing" | "speaking";

interface GrammarRule {
  id: string;
  category: GrammarCategory;
  title: string;
  errorType: string;
  commonMistake: string;
  correct: string;
  explanation: string;
  context: string;
  examples: {
    wrong: string;
    right: string;
    context: string;
  }[];
  contextExamples: {
    daily: string;
    business: string;
    email: string;
  };
  recognitionDrill: {
    sentence: string;
    options: string[];
    correctAnswer: number;
  }[];
  errorDetection: {
    wrongSentence: string;
    correctSentence: string;
    explanation: string;
  }[];
  proTip: string;
  audioPhrase?: string;
}

interface UserGrammarProgress {
  ruleId: string;
  understood: boolean;
  practiceCount: number;
  recognitionScore: number;
  correctionScore: number;
  writingScore: number;
  speakingScore: number;
  lastReviewed: number;
  weakAreas: string[];
  totalAttempts: number;
  correctAttempts: number;
}

interface ErrorTracker {
  ruleId: string;
  errorCount: number;
  lastError: number;
}

export default function Grammar() {
  const [selectedCategory, setSelectedCategory] = useState<GrammarCategory>("High-Frequency");
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
  const [practiceMode, setPracticeMode] = useState<PracticeMode | null>(null);
  const [userProgress, setUserProgress] = useState<Map<string, UserGrammarProgress>>(new Map());
  const [errorTracker, setErrorTracker] = useState<Map<string, ErrorTracker>>(new Map());
  
  // Practice states
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const [timerActive, setTimerActive] = useState(false);
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [currentErrorIndex, setCurrentErrorIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showWeakAreas, setShowWeakAreas] = useState(false);

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem("grammarProgress");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserProgress(new Map(Object.entries(parsed)));
    }

    const savedErrors = localStorage.getItem("grammarErrorTracker");
    if (savedErrors) {
      const parsed = JSON.parse(savedErrors);
      setErrorTracker(new Map(Object.entries(parsed)));
    }
  }, []);

  // Timer for recognition drill
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timerActive && timeLeft === 0) {
      // Auto-submit with wrong answer
      handleRecognitionAnswer(null);
    }
  }, [timerActive, timeLeft]);

  // Enhanced grammar database with all features
  const grammarRules: GrammarRule[] = [
    // HIGH-FREQUENCY GRAMMAR
    {
      id: "hf-1",
      category: "High-Frequency",
      title: "Articles: A vs THE",
      errorType: "Missing or wrong article",
      commonMistake: 'Using "a" when you should use "the" (or vice versa)',
      correct: "Use 'a/an' for first mention or non-specific, 'the' for specific/known things",
      explanation: "This is THE most common grammar mistake. Americans notice it immediately.",
      context: "Daily conversation & Writing",
      examples: [
        {
          wrong: "I need to go to a bank (when you mean your regular bank)",
          right: "I need to go to the bank",
          context: "Specific place you both know"
        },
        {
          wrong: "She's the teacher (when just describing job)",
          right: "She's a teacher",
          context: "General profession, not specific person"
        },
        {
          wrong: "Can you close a door?",
          right: "Can you close the door?",
          context: "Specific door in current context"
        }
      ],
      contextExamples: {
        daily: "I'm going to the store. Want anything?",
        business: "Let's schedule the meeting for next Tuesday.",
        email: "Please find the attached report for your review."
      },
      recognitionDrill: [
        {
          sentence: "I need to go to ___ airport to pick up my friend.",
          options: ["a", "the", "an", "no article"],
          correctAnswer: 1
        },
        {
          sentence: "She works as ___ engineer at Google.",
          options: ["a", "the", "an", "no article"],
          correctAnswer: 2
        },
        {
          sentence: "Can you pass me ___ salt please?",
          options: ["a", "the", "an", "no article"],
          correctAnswer: 1
        },
        {
          sentence: "I'm reading ___ book about startups.",
          options: ["a", "the", "an", "no article"],
          correctAnswer: 0
        }
      ],
      errorDetection: [
        {
          wrongSentence: "She's the doctor at hospital.",
          correctSentence: "She's a doctor at the hospital.",
          explanation: "'A doctor' = profession (general), 'the hospital' = specific place"
        },
        {
          wrongSentence: "I went to a bank yesterday to withdraw money.",
          correctSentence: "I went to the bank yesterday to withdraw money.",
          explanation: "Context implies your regular bank (specific), so use 'the'. However, 'a bank' would be correct if you went to any random bank."
        }
      ],
      proTip: "If someone would ask 'which one?', you need 'the'. If it's any random one, use 'a/an'.",
      audioPhrase: "the bank, a teacher, the door"
    },
    {
      id: "hf-2",
      category: "High-Frequency",
      title: "Prepositions: IN / ON / AT",
      errorType: "Wrong preposition with time/place",
      commonMistake: 'Confusion between "in", "on", and "at"',
      correct: "AT = point, ON = surface/day, IN = enclosed space/longer time",
      explanation: "These tiny words change meaning. Americans use them automatically.",
      context: "Time & Location",
      examples: [
        {
          wrong: "I'll call you in Monday",
          right: "I'll call you on Monday",
          context: "Days use ON"
        },
        {
          wrong: "The meeting is on 3pm",
          right: "The meeting is at 3pm",
          context: "Exact time uses AT"
        },
        {
          wrong: "Let's meet in Starbucks",
          right: "Let's meet at Starbucks",
          context: "Meeting point/destination uses AT"
        }
      ],
      contextExamples: {
        daily: "I'll be home at 6pm. Let's have dinner in the kitchen.",
        business: "The conference is on Monday at 2pm in the main office.",
        email: "We'll connect on Friday at 10am to discuss the project."
      },
      recognitionDrill: [
        {
          sentence: "The meeting is scheduled ___ next Tuesday.",
          options: ["in", "on", "at", "for"],
          correctAnswer: 1
        },
        {
          sentence: "I was born ___ 1995.",
          options: ["in", "on", "at", "for"],
          correctAnswer: 0
        },
        {
          sentence: "Let's meet ___ the coffee shop.",
          options: ["in", "on", "at", "for"],
          correctAnswer: 2
        },
        {
          sentence: "I'll see you ___ the morning.",
          options: ["in", "on", "at", "for"],
          correctAnswer: 0
        }
      ],
      errorDetection: [
        {
          wrongSentence: "I'll be there in 5pm on the afternoon.",
          correctSentence: "I'll be there at 5pm in the afternoon.",
          explanation: "Exact time = AT. Part of day = IN."
        }
      ],
      proTip: "AT = specific point (at 5pm, at home, at Starbucks). ON = days/dates. IN = months/years/enclosed spaces.",
      audioPhrase: "on Monday, at 3pm, in the office"
    },
    {
      id: "hf-3",
      category: "High-Frequency",
      title: "Present Perfect: Have/Has Done",
      errorType: 'Using simple past instead of present perfect',
      commonMistake: "Saying 'I didn't do it yet' instead of 'I haven't done it yet'",
      correct: 'Use "have/has done" for actions that matter NOW',
      explanation: "Americans use this constantly. It connects past to present.",
      context: "Daily conversation",
      examples: [
        {
          wrong: "Did you finish the report yet?",
          right: "Have you finished the report yet?",
          context: "With 'yet' - asking about now"
        },
        {
          wrong: "I already ate lunch",
          right: "I've already eaten lunch",
          context: "With 'already' - result matters now"
        }
      ],
      contextExamples: {
        daily: "Have you seen the new Marvel movie? It's amazing!",
        business: "We've completed the first phase of the project.",
        email: "I've attached the updated files for your review."
      },
      recognitionDrill: [
        {
          sentence: "___ you ever ___ to Japan?",
          options: ["Did / go", "Have / been", "Do / go", "Are / going"],
          correctAnswer: 1
        },
        {
          sentence: "She ___ in Boston for 5 years (and still does).",
          options: ["lived", "has lived", "is living", "lives"],
          correctAnswer: 1
        },
        {
          sentence: "I ___ my homework yesterday.",
          options: ["have finished", "finished", "finish", "am finishing"],
          correctAnswer: 1
        }
      ],
      errorDetection: [
        {
          wrongSentence: "I already sent the email. Did you receive it?",
          correctSentence: "I've already sent the email. Have you received it?",
          explanation: "With 'already' and 'yet', use present perfect because the result matters now."
        }
      ],
      proTip: "If it matters NOW or connects to NOW, use 'have/has done'. If it's finished history, use simple past.",
      audioPhrase: "Have you finished? I've already eaten."
    },

    // BUSINESS GRAMMAR
    {
      id: "biz-1",
      category: "Business",
      title: "Email Tenses: Will vs Going to",
      errorType: "Using wrong future form in emails",
      commonMistake: '"I am going to send you the report" sounds too casual',
      correct: '"I\'ll send" (casual) or "I will ensure" (formal commitment)',
      explanation: "Business emails need the right tone. Too formal = robotic. Too casual = unprofessional.",
      context: "Professional emails",
      examples: [
        {
          wrong: "I am going to send you the report tomorrow",
          right: "I'll send you the report tomorrow",
          context: "Simple future promises - use 'I'll'"
        }
      ],
      contextExamples: {
        daily: "I'll text you when I arrive!",
        business: "I'll forward the proposal to the team this afternoon.",
        email: "I will ensure all deliverables are completed by Friday."
      },
      recognitionDrill: [
        {
          sentence: "___ send you the contract by EOD.",
          options: ["I'm going to", "I'll", "I would", "I am"],
          correctAnswer: 1
        },
        {
          sentence: "___ ensure this doesn't happen again.",
          options: ["I'm gonna", "I'll", "I will", "I would"],
          correctAnswer: 2
        }
      ],
      errorDetection: [
        {
          wrongSentence: "I am going to make sure everything is ready.",
          correctSentence: "I will ensure everything is ready.",
          explanation: "In formal emails, 'will ensure' sounds more professional than 'going to make sure'."
        }
      ],
      proTip: "Casual: I'll... / Neutral: I will... / Formal: I will ensure/guarantee...",
      audioPhrase: "I'll send the report. I will ensure quality."
    },
    {
      id: "biz-2",
      category: "Business",
      title: "Conditionals in Negotiations",
      errorType: "Using 'will' after 'if'",
      commonMistake: '"If you will sign, we will proceed" (WRONG!)',
      correct: '"If you sign, we\'ll proceed" - no WILL in IF clause',
      explanation: "Critical business grammar. Get it wrong and you sound non-native.",
      context: "Negotiations, proposals",
      examples: [
        {
          wrong: "If you will approve, we will start",
          right: "If you approve, we'll start",
          context: "First conditional - no 'will' after 'if'"
        }
      ],
      contextExamples: {
        daily: "If you come to the party, I'll introduce you to everyone.",
        business: "If we secure funding, we'll expand to new markets.",
        email: "If you have any questions, I'll be happy to address them."
      },
      recognitionDrill: [
        {
          sentence: "If you ___ the budget, we ___ immediately.",
          options: ["will approve / start", "approve / will start", "will approve / will start", "approve / start"],
          correctAnswer: 1
        }
      ],
      errorDetection: [
        {
          wrongSentence: "If you will need help, I will be available.",
          correctSentence: "If you need help, I'll be available.",
          explanation: "NEVER use 'will' after 'if' in first conditional. If + present, will + infinitive."
        }
      ],
      proTip: "NEVER 'will' after 'if' in conditionals. Say: 'If you do X, I'll do Y'",
      audioPhrase: "If you approve, we'll start."
    },

    // SPOKEN GRAMMAR
    {
      id: "spk-1",
      category: "Spoken",
      title: "Natural Reductions: Gonna/Wanna",
      errorType: "Saying 'going to' in casual speech (sounds textbook)",
      commonMistake: "Not using contractions in conversation",
      correct: "Americans say: gonna, wanna, gotta",
      explanation: "This is how real Americans talk. 'Going to' sounds like reading.",
      context: "Casual conversation",
      examples: [
        {
          wrong: "I am going to call you later",
          right: "I'm gonna call you later",
          context: "Casual future plans"
        }
      ],
      contextExamples: {
        daily: "I'm gonna grab some coffee. Wanna come?",
        business: "We're going to launch next quarter (formal - don't use 'gonna')",
        email: "I am going to review the document (formal writing)"
      },
      recognitionDrill: [
        {
          sentence: "What are you ___ do tonight?",
          options: ["going to", "gonna", "want to", "wanna"],
          correctAnswer: 1
        }
      ],
      errorDetection: [
        {
          wrongSentence: "I am going to go to the store. Do you want to come?",
          correctSentence: "I'm gonna go to the store. Wanna come?",
          explanation: "In casual speech, use reductions to sound natural."
        }
      ],
      proTip: "In casual conversation: going to → gonna, want to → wanna. BUT write formally!",
      audioPhrase: "I'm gonna call you. Wanna grab lunch?"
    },
    {
      id: "spk-2",
      category: "Spoken",
      title: "Tag Questions: Right? You know?",
      errorType: "Not using tag questions = sounds unnatural",
      commonMistake: "Making statements without engagement",
      correct: "Add: right? / you know? / isn't it?",
      explanation: "Americans use tag questions to engage listeners.",
      context: "Conversations",
      examples: [
        {
          wrong: "The weather is nice today",
          right: "The weather is nice today, right?",
          context: "Engaging listener"
        }
      ],
      contextExamples: {
        daily: "That movie was awesome, right?",
        business: "This is a critical issue, you know?",
        email: "This timeline seems reasonable, doesn't it?"
      },
      recognitionDrill: [
        {
          sentence: "We should leave now, ___?",
          options: ["right", "shouldn't we", "isn't it", "both A and B"],
          correctAnswer: 3
        }
      ],
      errorDetection: [
        {
          wrongSentence: "This is important.",
          correctSentence: "This is important, you know? / This is important, right?",
          explanation: "Tag questions make you sound more conversational and engaged."
        }
      ],
      proTip: "Add tags to check agreement (right?), engage listener (you know?), soften (huh?)",
      audioPhrase: "Nice weather, right? This is important, you know?"
    }
  ];

  const filteredRules = grammarRules.filter(r => r.category === selectedCategory);
  const currentRule = filteredRules[currentRuleIndex];
  const progress = userProgress.get(currentRule.id);

  const updateProgress = (updates: Partial<UserGrammarProgress>) => {
    const current = progress || {
      ruleId: currentRule.id,
      understood: false,
      practiceCount: 0,
      recognitionScore: 0,
      correctionScore: 0,
      writingScore: 0,
      speakingScore: 0,
      lastReviewed: Date.now(),
      weakAreas: [],
      totalAttempts: 0,
      correctAttempts: 0
    };

    const updated = { ...current, ...updates, lastReviewed: Date.now() };
    const newProgress = new Map(userProgress);
    newProgress.set(currentRule.id, updated);
    setUserProgress(newProgress);
    localStorage.setItem("grammarProgress", JSON.stringify(Object.fromEntries(newProgress)));
  };

  const trackError = (ruleId: string) => {
    const current = errorTracker.get(ruleId) || { ruleId, errorCount: 0, lastError: 0 };
    const updated = {
      ...current,
      errorCount: current.errorCount + 1,
      lastError: Date.now()
    };

    const newTracker = new Map(errorTracker);
    newTracker.set(ruleId, updated);
    setErrorTracker(newTracker);
    localStorage.setItem("grammarErrorTracker", JSON.stringify(Object.fromEntries(newTracker)));
  };

  // Recognition Drill Handler
  const handleRecognitionAnswer = (optionIndex: number | null) => {
    setTimerActive(false);
    const drill = currentRule.recognitionDrill[currentDrillIndex];
    const correct = optionIndex === drill.correctAnswer;

    if (correct) {
      setFeedback({ type: "success", message: "🎉 Correct! Great instinct!" });
      updateProgress({
        recognitionScore: (progress?.recognitionScore || 0) + 1,
        totalAttempts: (progress?.totalAttempts || 0) + 1,
        correctAttempts: (progress?.correctAttempts || 0) + 1
      });
    } else {
      setFeedback({ 
        type: "error", 
        message: `Not quite. The correct answer is: "${drill.options[drill.correctAnswer]}"` 
      });
      trackError(currentRule.id);
      updateProgress({
        totalAttempts: (progress?.totalAttempts || 0) + 1
      });
    }

    setTimeout(() => {
      setFeedback(null);
      setSelectedOption(null);
      if (currentDrillIndex < currentRule.recognitionDrill.length - 1) {
        setCurrentDrillIndex(currentDrillIndex + 1);
        setTimeLeft(5);
        setTimerActive(true);
      } else {
        setPracticeMode(null);
        setCurrentDrillIndex(0);
      }
    }, 2000);
  };

  // Error Correction Handler
  const checkCorrection = () => {
    const errorExample = currentRule.errorDetection[currentErrorIndex];
    const userCorrect = userAnswer.trim().toLowerCase();
    const actualCorrect = errorExample.correctSentence.toLowerCase();
    
    const isCorrect = userCorrect === actualCorrect || userAnswer.trim().length > 10;

    if (isCorrect) {
      setFeedback({ 
        type: "success", 
        message: `✅ Good job! Correct: "${errorExample.correctSentence}"` 
      });
      updateProgress({
        correctionScore: (progress?.correctionScore || 0) + 1,
        totalAttempts: (progress?.totalAttempts || 0) + 1,
        correctAttempts: (progress?.correctAttempts || 0) + 1
      });
    } else {
      setFeedback({ 
        type: "error", 
        message: `Correct: "${errorExample.correctSentence}". ${errorExample.explanation}` 
      });
      trackError(currentRule.id);
      updateProgress({
        totalAttempts: (progress?.totalAttempts || 0) + 1
      });
    }

    setTimeout(() => {
      setFeedback(null);
      setUserAnswer("");
      if (currentErrorIndex < currentRule.errorDetection.length - 1) {
        setCurrentErrorIndex(currentErrorIndex + 1);
      } else {
        setPracticeMode(null);
        setCurrentErrorIndex(0);
      }
    }, 3000);
  };

  // Start practice mode
  const startPractice = (mode: PracticeMode) => {
    setPracticeMode(mode);
    if (mode === "recognition") {
      setTimeLeft(5);
      setTimerActive(true);
      setCurrentDrillIndex(0);
    }
    if (mode === "correction") {
      setCurrentErrorIndex(0);
    }
  };

  // Detect weak areas
  const getWeakAreas = () => {
    const errors = Array.from(errorTracker.entries())
      .filter(([_, data]) => data.errorCount >= 3)
      .sort((a, b) => b[1].errorCount - a[1].errorCount)
      .slice(0, 3);

    return errors.map(([ruleId, data]) => {
      const rule = grammarRules.find(r => r.id === ruleId);
      return { rule, errorCount: data.errorCount };
    });
  };

  const weakAreas = getWeakAreas();

  // Calculate stats
  const totalUnderstood = Array.from(userProgress.values()).filter(p => p.understood).length;
  const totalPracticed = Array.from(userProgress.values()).reduce((sum, p) => sum + p.practiceCount, 0);
  const totalAttempts = Array.from(userProgress.values()).reduce((sum, p) => sum + (p.totalAttempts || 0), 0);
  const totalCorrect = Array.from(userProgress.values()).reduce((sum, p) => sum + (p.correctAttempts || 0), 0);
  const accuracyScore = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const masteryScore = grammarRules.length > 0 ? Math.round((totalUnderstood / grammarRules.length) * 100) : 0;

  const speakPhrase = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      speechSynthesis.speak(utterance);
    }
  };

  const nextRule = () => {
    setCurrentRuleIndex((prev) => (prev + 1) % filteredRules.length);
    setPracticeMode(null);
    setUserAnswer("");
    setFeedback(null);
  };

  const previousRule = () => {
    setCurrentRuleIndex((prev) => (prev - 1 + filteredRules.length) % filteredRules.length);
    setPracticeMode(null);
    setUserAnswer("");
    setFeedback(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <BookOpen className="w-10 h-10 text-green-400" />
          Grammar & Structure
        </h1>
        <p className="text-xl text-gray-300">
          Precision creates <span className="text-green-400 font-bold">confidence</span>
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white text-center">
          <Award className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{totalUnderstood}</div>
          <div className="text-green-100 text-sm mt-1">Rules Mastered</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white text-center">
          <Target className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{accuracyScore}%</div>
          <div className="text-blue-100 text-sm mt-1">Accuracy Score</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{masteryScore}%</div>
          <div className="text-purple-100 text-sm mt-1">Overall Progress</div>
        </div>
        <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-6 text-white text-center">
          <Zap className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{totalPracticed}</div>
          <div className="text-orange-100 text-sm mt-1">Practice Sessions</div>
        </div>
      </div>

      {/* Weak Areas Alert */}
      {weakAreas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-200 mb-2">⚠️ Weak Areas Detected</h3>
              <p className="text-yellow-100 text-sm mb-3">You're struggling with these patterns. Recommended: 3 extra drills today.</p>
              <div className="space-y-2">
                {weakAreas.map(({ rule, errorCount }) => rule && (
                  <div key={rule.id} className="flex items-center justify-between bg-black/20 rounded-lg p-2">
                    <span className="text-white font-semibold">{rule.title}</span>
                    <span className="text-red-300 text-sm">{errorCount} errors</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Tabs */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📚 Choose Category</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => { setSelectedCategory("High-Frequency"); setCurrentRuleIndex(0); setPracticeMode(null); }}
            className={`p-6 rounded-xl transition-all ${
              selectedCategory === "High-Frequency"
                ? "bg-gradient-to-br from-red-600 to-orange-600 text-white shadow-lg"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            <Zap className="w-8 h-8 mx-auto mb-2" />
            <div className="font-bold text-lg">High-Frequency</div>
            <div className="text-xs mt-1 opacity-80">Top 20 mistakes</div>
          </button>

          <button
            onClick={() => { setSelectedCategory("Business"); setCurrentRuleIndex(0); setPracticeMode(null); }}
            className={`p-6 rounded-xl transition-all ${
              selectedCategory === "Business"
                ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            <Briefcase className="w-8 h-8 mx-auto mb-2" />
            <div className="font-bold text-lg">Business</div>
            <div className="text-xs mt-1 opacity-80">Top 15 pro patterns</div>
          </button>

          <button
            onClick={() => { setSelectedCategory("Spoken"); setCurrentRuleIndex(0); setPracticeMode(null); }}
            className={`p-6 rounded-xl transition-all ${
              selectedCategory === "Spoken"
                ? "bg-gradient-to-br from-green-600 to-teal-600 text-white shadow-lg"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            <MessageCircle className="w-8 h-8 mx-auto mb-2" />
            <div className="font-bold text-lg">Spoken</div>
            <div className="text-xs mt-1 opacity-80">Top 15 natural patterns</div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {!practiceMode ? (
        <>
          {/* Rule Explanation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategory}-${currentRuleIndex}`}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold text-white mb-3">
                    {currentRule.category} Grammar
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">{currentRule.title}</h2>
                  <p className="text-indigo-100 text-sm italic">{currentRule.context}</p>
                </div>
                {currentRule.audioPhrase && (
                  <button
                    onClick={() => speakPhrase(currentRule.audioPhrase!)}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all"
                  >
                    <Volume2 className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>

              {/* Core Pattern */}
              <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-green-200 mb-1">✅ Core Pattern</h3>
                    <p className="text-white font-semibold">{currentRule.correct}</p>
                  </div>
                </div>
              </div>

              {/* Context Examples */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">📝 Same Rule, 3 Contexts</h3>
                <div className="space-y-3">
                  <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-5 h-5 text-blue-300" />
                      <h4 className="font-semibold text-blue-200">Daily Conversation</h4>
                    </div>
                    <p className="text-white italic">"{currentRule.contextExamples.daily}"</p>
                  </div>

                  <div className="bg-orange-500/20 border border-orange-400/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-5 h-5 text-orange-300" />
                      <h4 className="font-semibold text-orange-200">Business Speaking</h4>
                    </div>
                    <p className="text-white italic">"{currentRule.contextExamples.business}"</p>
                  </div>

                  <div className="bg-purple-500/20 border border-purple-400/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Edit3 className="w-5 h-5 text-purple-300" />
                      <h4 className="font-semibold text-purple-200">Professional Email</h4>
                    </div>
                    <p className="text-white italic">"{currentRule.contextExamples.email}"</p>
                  </div>
                </div>
              </div>

              {/* Pro Tip */}
              <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-yellow-200 mb-1">🎯 Pro Tip</h3>
                    <p className="text-white">{currentRule.proTip}</p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/20">
                <span className="text-white/60">{currentRuleIndex + 1} / {filteredRules.length}</span>
                {progress?.understood && (
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                    ✅ Mastered
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={previousRule} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
              ← Previous
            </button>
            <button onClick={nextRule} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
              Next →
            </button>
          </div>

          {/* Practice Modes */}
          <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 text-white">
            <h3 className="text-2xl font-bold mb-4">🎯 Practice Modes</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => startPractice("recognition")}
                className="bg-white/20 hover:bg-white/30 rounded-xl p-6 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="w-8 h-8" />
                  <div>
                    <div className="font-bold text-lg">Quick Recognition</div>
                    <div className="text-sm opacity-80">5-second instinct drill</div>
                  </div>
                </div>
                <div className="text-xs opacity-70 mt-2">
                  Speed: {progress?.recognitionScore || 0} correct
                </div>
              </button>

              <button
                onClick={() => startPractice("correction")}
                className="bg-white/20 hover:bg-white/30 rounded-xl p-6 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Edit3 className="w-8 h-8" />
                  <div>
                    <div className="font-bold text-lg">Correct the Sentence</div>
                    <div className="text-sm opacity-80">Active error detection</div>
                  </div>
                </div>
                <div className="text-xs opacity-70 mt-2">
                  Accuracy: {progress?.correctionScore || 0} correct
                </div>
              </button>

              <button
                onClick={() => startPractice("writing")}
                className="bg-white/20 hover:bg-white/30 rounded-xl p-6 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Edit3 className="w-8 h-8" />
                  <div>
                    <div className="font-bold text-lg">Write Your Own</div>
                    <div className="text-sm opacity-80">Create original sentences</div>
                  </div>
                </div>
                <div className="text-xs opacity-70 mt-2">
                  Practice: {progress?.writingScore || 0} completed
                </div>
              </button>

              <button
                onClick={() => startPractice("speaking")}
                className="bg-white/20 hover:bg-white/30 rounded-xl p-6 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Mic2 className="w-8 h-8" />
                  <div>
                    <div className="font-bold text-lg">Say It Naturally</div>
                    <div className="text-sm opacity-80">Grammar + pronunciation</div>
                  </div>
                </div>
                <div className="text-xs opacity-70 mt-2">
                  Fluency: {progress?.speakingScore || 0} practiced
                </div>
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Recognition Mode */}
          {practiceMode === "recognition" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">🔎 Rapid Recognition Drill</h3>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5" />
                  <span className="text-2xl font-bold">{timeLeft}s</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-6 mb-6">
                <p className="text-2xl font-semibold mb-6">
                  {currentRule.recognitionDrill[currentDrillIndex].sentence}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {currentRule.recognitionDrill[currentDrillIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedOption(idx);
                        handleRecognitionAnswer(idx);
                      }}
                      disabled={selectedOption !== null}
                      className={`p-4 rounded-xl font-semibold text-lg transition-all ${
                        selectedOption === null
                          ? "bg-white/20 hover:bg-white/30"
                          : selectedOption === idx
                          ? idx === currentRule.recognitionDrill[currentDrillIndex].correctAnswer
                            ? "bg-green-500"
                            : "bg-red-500"
                          : "bg-white/10 opacity-50"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg flex items-center gap-2 ${
                    feedback.type === "success"
                      ? "bg-green-500/20 border border-green-400/50"
                      : "bg-red-500/20 border border-red-400/50"
                  }`}
                >
                  {feedback.type === "success" ? <CheckCircle2 /> : <XCircle />}
                  <span>{feedback.message}</span>
                </motion.div>
              )}

              <button
                onClick={() => setPracticeMode(null)}
                className="mt-4 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
              >
                Exit Drill
              </button>
            </motion.div>
          )}

          {/* Correction Mode */}
          {practiceMode === "correction" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white"
            >
              <h3 className="text-2xl font-bold mb-6">✏️ Error Detection Mode</h3>

              <div className="bg-white/10 rounded-xl p-6 mb-4">
                <p className="text-sm opacity-80 mb-2">Correct this sentence:</p>
                <p className="text-2xl font-semibold mb-4 text-red-300">
                  ❌ {currentRule.errorDetection[currentErrorIndex].wrongSentence}
                </p>

                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type the corrected sentence..."
                  className="w-full h-24 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>

              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg mb-4 ${
                    feedback.type === "success"
                      ? "bg-green-500/20 border border-green-400/50"
                      : "bg-red-500/20 border border-red-400/50"
                  }`}
                >
                  <span>{feedback.message}</span>
                </motion.div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={checkCorrection}
                  disabled={!userAnswer.trim()}
                  className="flex-1 px-6 py-3 bg-white text-purple-600 hover:bg-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg font-bold transition-all"
                >
                  Check Answer
                </button>
                <button
                  onClick={() => setPracticeMode(null)}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          )}

          {/* Speaking Mode */}
          {practiceMode === "speaking" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl p-8 text-white"
            >
              <h3 className="text-2xl font-bold mb-6">🎙 Say It Naturally</h3>

              <div className="bg-white/10 rounded-xl p-6 mb-6">
                <p className="text-sm opacity-80 mb-2">Practice saying this correctly:</p>
                <p className="text-2xl font-semibold mb-4">
                  {currentRule.contextExamples.daily}
                </p>

                <button
                  onClick={() => speakPhrase(currentRule.contextExamples.daily)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>Listen to Native Speaker</span>
                </button>
              </div>

              <div className="bg-white/10 rounded-xl p-4 mb-4">
                <p className="text-sm mb-2">💡 Tips for natural pronunciation:</p>
                <ul className="text-sm space-y-1 opacity-90">
                  <li>• Focus on the rhythm and stress patterns</li>
                  <li>• Use contractions naturally (I'm, you're, etc.)</li>
                  <li>• Practice the grammar pattern while maintaining flow</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    updateProgress({
                      speakingScore: (progress?.speakingScore || 0) + 1
                    });
                    setFeedback({ type: "success", message: "Great practice! Keep going!" });
                    setTimeout(() => setFeedback(null), 2000);
                  }}
                  className="flex-1 px-6 py-3 bg-white text-green-600 hover:bg-gray-100 rounded-lg font-bold transition-all"
                >
                  ✅ I Practiced This
                </button>
                <button
                  onClick={() => setPracticeMode(null)}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                >
                  Exit
                </button>
              </div>

              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-lg bg-green-500/20 border border-green-400/50"
                >
                  {feedback.message}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Writing Mode */}
          {practiceMode === "writing" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-8 text-white"
            >
              <h3 className="text-2xl font-bold mb-6">✍️ Write Your Own Sentence</h3>

              <div className="bg-white/10 rounded-xl p-6 mb-4">
                <p className="text-sm opacity-80 mb-2">Create an original sentence using this pattern:</p>
                <p className="text-lg font-semibold mb-4 text-yellow-300">{currentRule.correct}</p>

                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Write your sentence here..."
                  className="w-full h-32 bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>

              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg mb-4 bg-green-500/20 border border-green-400/50"
                >
                  {feedback.message}
                </motion.div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (userAnswer.trim().length > 5) {
                      setFeedback({ 
                        type: "success", 
                        message: "✅ Excellent practice! Your sentence looks good. Keep creating more!" 
                      });
                      updateProgress({
                        writingScore: (progress?.writingScore || 0) + 1,
                        understood: true
                      });
                      setTimeout(() => {
                        setFeedback(null);
                        setUserAnswer("");
                      }, 2000);
                    }
                  }}
                  disabled={!userAnswer.trim()}
                  className="flex-1 px-6 py-3 bg-white text-orange-600 hover:bg-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg font-bold transition-all"
                >
                  Submit Sentence
                </button>
                <button
                  onClick={() => setPracticeMode(null)}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Performance Breakdown */}
      {progress && !practiceMode && (
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 text-white">
          <h3 className="font-bold text-lg mb-4">📊 Your Performance on This Rule</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-sm opacity-80">Accuracy</div>
              <div className="text-3xl font-bold">
                {progress.totalAttempts > 0 
                  ? Math.round((progress.correctAttempts / progress.totalAttempts) * 100)
                  : 0}%
              </div>
              <div className="text-xs opacity-60 mt-1">
                {progress.correctAttempts}/{progress.totalAttempts} correct
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-sm opacity-80">Practice Count</div>
              <div className="text-3xl font-bold">{progress.practiceCount}</div>
              <div className="text-xs opacity-60 mt-1">Total sessions</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-sm opacity-80">Status</div>
              <div className="text-2xl font-bold">
                {progress.understood ? "✅ Mastered" : "📚 Learning"}
              </div>
              <div className="text-xs opacity-60 mt-1">
                {progress.understood ? "Keep practicing!" : "Keep going!"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
