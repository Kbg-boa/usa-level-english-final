import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, ThumbsUp, Lightbulb, Sparkles, Shield, Users, MapPin, AlertTriangle, Briefcase, Zap, Award, Target, TrendingUp } from "lucide-react";
import { fullSlangDatabase, type SlangItem } from "../data/slang-database";

type SafetyLevel = "safe" | "casual" | "risky";
type Generation = "Gen Z" | "Millennial" | "All Ages";
type Region = "Nationwide" | "NY vibe" | "Cali vibe" | "Southern vibe";

interface EnhancedSlangItem extends SlangItem {
  safetyLevel: SafetyLevel;
  generation: Generation;
  region: Region;
  professionalAlternatives: string[];
  overuseWarning: string;
}

interface ResponseDrill {
  situation: string;
  correctResponse: string;
  alternativeResponses: string[];
}

export default function Slang() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDrill, setShowDrill] = useState(false);
  const [userResponse, setUserResponse] = useState("");
  const [drillResult, setDrillResult] = useState<"correct" | "alternative" | "incorrect" | null>(null);
  const [naturalScore, setNaturalScore] = useState<number | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const categories = ["All", ...Array.from(new Set(fullSlangDatabase.map(s => s.category)))];

  // Enhance slang items with advanced metadata
  const enhanceSlangItem = (item: SlangItem): EnhancedSlangItem => {
    const enhancements: Record<string, Partial<EnhancedSlangItem>> = {
      "No cap": {
        safetyLevel: "casual",
        generation: "Gen Z",
        region: "Nationwide",
        professionalAlternatives: ["Honestly", "To be frank", "In all seriousness"],
        overuseWarning: "Don't use it in every sentence - sounds forced. Once per conversation max."
      },
      "It's fire": {
        safetyLevel: "safe",
        generation: "All Ages",
        region: "Nationwide",
        professionalAlternatives: ["That's impressive", "That's excellent", "Outstanding work"],
        overuseWarning: "Don't call everything 'fire' - save it for things that genuinely impress you."
      },
      "Bet": {
        safetyLevel: "safe",
        generation: "All Ages",
        region: "Nationwide",
        professionalAlternatives: ["Sounds good", "I agree", "Absolutely"],
        overuseWarning: "Versatile but don't respond 'bet' to everything. Mix it up."
      },
      "Bussin'": {
        safetyLevel: "risky",
        generation: "Gen Z",
        region: "Nationwide",
        professionalAlternatives: ["Delicious", "Really good", "Excellent"],
        overuseWarning: "Very Gen Z - might sound forced if you're over 25. Use sparingly."
      },
      "Deadass": {
        safetyLevel: "casual",
        generation: "Millennial",
        region: "NY vibe",
        professionalAlternatives: ["Seriously", "I'm serious", "For real"],
        overuseWarning: "NYC slang - might sound out of place in other regions."
      },
      "Lowkey": {
        safetyLevel: "safe",
        generation: "All Ages",
        region: "Nationwide",
        professionalAlternatives: ["Somewhat", "Kind of", "A bit"],
        overuseWarning: "Don't start every sentence with 'lowkey' - it loses meaning."
      },
      "Y'all": {
        safetyLevel: "safe",
        generation: "All Ages",
        region: "Southern vibe",
        professionalAlternatives: ["You all", "Everyone", "All of you"],
        overuseWarning: "Southern classic - perfectly acceptable nationwide now."
      }
    };

    const enhancement = enhancements[item.phrase] || {
      safetyLevel: "safe" as SafetyLevel,
      generation: "All Ages" as Generation,
      region: "Nationwide" as Region,
      professionalAlternatives: ["Standard English equivalent"],
      overuseWarning: "Use naturally - don't force it."
    };

    return { ...item, ...enhancement } as EnhancedSlangItem;
  };

  const filteredSlang = (selectedCategory === "All"
    ? fullSlangDatabase
    : fullSlangDatabase.filter(s => s.category === selectedCategory)
  ).map(enhanceSlangItem);

  const current = filteredSlang[currentIndex];

  // Response Drills
  const getResponseDrills = (phrase: string): ResponseDrill[] => {
    const drills: Record<string, ResponseDrill[]> = {
      "No cap": [
        {
          situation: "Your friend asks if you really finished the project in 2 hours",
          correctResponse: "No cap, I did!",
          alternativeResponses: ["For real, it took exactly 2 hours", "Seriously, I'm not joking"]
        },
        {
          situation: "Someone doubts your story about meeting a celebrity",
          correctResponse: "No cap, I saw them at Starbucks",
          alternativeResponses: ["I'm serious, it really happened", "Honestly, I'm not making this up"]
        },
        {
          situation: "Your coworker questions if the meeting is really canceled",
          correctResponse: "No cap, just got the email",
          alternativeResponses: ["For real, check your inbox", "Seriously, it's canceled"]
        }
      ],
      "It's fire": [
        {
          situation: "Your friend shows you their new car",
          correctResponse: "Yo, that car is fire!",
          alternativeResponses: ["That's sick!", "That's amazing!"]
        },
        {
          situation: "Someone sends you a new song they produced",
          correctResponse: "This beat is fire! 🔥",
          alternativeResponses: ["This goes hard!", "This is incredible!"]
        },
        {
          situation: "A colleague shows you their presentation",
          correctResponse: "This presentation is fire! Great work",
          alternativeResponses: ["This is really impressive", "Outstanding work"]
        }
      ],
      "Bet": [
        {
          situation: "Your friend asks if you want to grab lunch at 1pm",
          correctResponse: "Bet, see you then",
          alternativeResponses: ["Sounds good", "Perfect, I'll be there"]
        },
        {
          situation: "Someone suggests a new restaurant to try",
          correctResponse: "Bet, let's check it out",
          alternativeResponses: ["I'm down", "Let's do it"]
        },
        {
          situation: "Your manager asks if you can finish by Friday",
          correctResponse: "Bet, I'll have it done",
          alternativeResponses: ["Absolutely", "Will do"]
        }
      ]
    };

    return drills[phrase] || [
      {
        situation: "Practice using this in conversation",
        correctResponse: `Use "${phrase}" naturally`,
        alternativeResponses: ["Mix with other expressions"]
      }
    ];
  };

  const [currentDrill, setCurrentDrill] = useState(0);
  const drills = getResponseDrills(current.phrase);

  const checkResponse = () => {
    const drill = drills[currentDrill];
    const userLower = userResponse.toLowerCase().trim();
    const correctLower = drill.correctResponse.toLowerCase();
    
    if (userLower.includes(current.phrase.toLowerCase())) {
      setDrillResult("correct");
    } else if (drill.alternativeResponses.some(alt => userLower.includes(alt.toLowerCase().split(' ')[0]))) {
      setDrillResult("alternative");
    } else {
      setDrillResult("incorrect");
    }
  };

  // Natural Score Calculator
  const calculateNaturalScore = (text: string): number => {
    const words = text.split(/\s+/);
    let score = 10;

    // Detect overuse of same phrase
    const phraseCounts: Record<string, number> = {};
    fullSlangDatabase.forEach(item => {
      const count = (text.match(new RegExp(item.phrase, 'gi')) || []).length;
      if (count > 0) phraseCounts[item.phrase] = count;
    });

    // Penalize overuse
    Object.values(phraseCounts).forEach(count => {
      if (count > 2) score -= 3;
      else if (count > 1) score -= 1;
    });

    // Check for repetitive patterns
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const repetitionRatio = uniqueWords.size / words.length;
    if (repetitionRatio < 0.6) score -= 2;

    // Check sentence structure variety
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.every(s => s.length < 30)) score -= 1;

    return Math.max(0, Math.min(10, score));
  };

  const analyzeText = () => {
    if (!userResponse.trim()) return;
    const score = calculateNaturalScore(userResponse);
    setNaturalScore(score);
  };

  // Basic to Natural upgrades
  const basicUpgrades = [
    { basic: "Very good", natural: "Fire / Amazing / Sick", context: "Casual praise" },
    { basic: "Very expensive", natural: "Crazy expensive / Costs a bag", context: "Price discussion" },
    { basic: "Very tired", natural: "Exhausted / Dead tired / Wiped out", context: "Energy level" },
    { basic: "I agree", natural: "Bet / For sure / Facts", context: "Agreement" },
    { basic: "That's true", natural: "No cap / Real talk / Straight up", context: "Confirming truth" },
    { basic: "I don't know", natural: "No clue / Not sure / Beats me", context: "Uncertainty" },
    { basic: "Let's go", natural: "Let's get it / We out / Let's bounce", context: "Leaving/Starting" },
    { basic: "That's funny", natural: "I'm dead / That's hilarious / Bruh", context: "Humor" },
    { basic: "I'm excited", natural: "I'm hyped / Pumped / Can't wait", context: "Enthusiasm" },
    { basic: "Be quiet", natural: "Chill / Relax / Take it easy", context: "Calming someone" }
  ];

  const getSafetyColor = (level: SafetyLevel) => {
    switch (level) {
      case "safe": return "text-green-400";
      case "casual": return "text-yellow-400";
      case "risky": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const getSafetyIcon = (level: SafetyLevel) => {
    switch (level) {
      case "safe": return "🟢";
      case "casual": return "🟡";
      case "risky": return "🔴";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <MessageSquare className="w-10 h-10 text-green-400" />
          Slang & Natural Expressions
        </h1>
        <p className="text-xl text-gray-300">
          Talk like a <span className="text-green-400 font-bold">real American</span> 🇺🇸
        </p>
        <p className="text-sm text-gray-400 mt-2">
          {fullSlangDatabase.length} expressions • Safety-rated • Generation-tagged • Performance-focused
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              setCurrentIndex(0);
            }}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedCategory === category
                ? "bg-green-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Main Slang Card */}
      <motion.div
        key={`${selectedCategory}-${currentIndex}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 shadow-2xl text-white"
      >
        <div className="space-y-6">
          {/* Header with metadata */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
              {current.category}
            </span>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* Safety Level */}
              <div className={`px-3 py-1 bg-black/20 rounded-lg text-sm font-semibold ${getSafetyColor(current.safetyLevel)}`}>
                {getSafetyIcon(current.safetyLevel)} {current.safetyLevel.toUpperCase()}
              </div>
              
              {/* Generation */}
              <div className="px-3 py-1 bg-purple-500/30 rounded-lg text-sm font-semibold">
                <Users className="w-4 h-4 inline mr-1" />
                {current.generation}
              </div>
              
              {/* Region */}
              <div className="px-3 py-1 bg-blue-500/30 rounded-lg text-sm font-semibold">
                <MapPin className="w-4 h-4 inline mr-1" />
                {current.region}
              </div>
            </div>
          </div>

          {/* Main phrase */}
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-6">{current.phrase}</h2>
          </div>

          {/* Grid layout for info */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Meaning */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-yellow-300" />
                <h3 className="text-lg font-semibold">Meaning</h3>
              </div>
              <p className="text-base">{current.meaning}</p>
            </div>

            {/* Usage */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-300" />
                <h3 className="text-lg font-semibold">When to Use</h3>
              </div>
              <p className="text-base">{current.usage}</p>
            </div>
          </div>

          {/* Example */}
          <div className="bg-green-800/30 backdrop-blur-sm rounded-xl p-6 border-2 border-green-400/50">
            <h3 className="text-xl font-semibold mb-3">💬 Real Example</h3>
            <p className="text-2xl italic">"{current.example}"</p>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
              <ThumbsUp className="w-5 h-5 text-yellow-300" />
              <span className="text-base"><strong>Vibe:</strong> {current.vibe}</span>
            </div>
          </div>

          {/* Professional Alternatives */}
          <div className="bg-blue-600/20 border border-blue-400/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-5 h-5 text-blue-300" />
              <h3 className="text-lg font-semibold">Professional Alternatives</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {current.professionalAlternatives.map((alt, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-500/30 rounded-lg text-sm">
                  "{alt}"
                </span>
              ))}
            </div>
          </div>

          {/* Overuse Warning */}
          <div className="bg-orange-600/20 border border-orange-400/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-300 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">⚠️ Overuse Warning</h4>
                <p className="text-sm text-orange-100">{current.overuseWarning}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Response Drill Section */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6" />
            <h3 className="text-2xl font-bold">🎯 Response Drill</h3>
          </div>
          <button
            onClick={() => setShowDrill(!showDrill)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
          >
            {showDrill ? "Hide" : "Practice"}
          </button>
        </div>

        <AnimatePresence>
          {showDrill && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <p className="text-purple-100 text-sm mb-4">
                Practice using "{current.phrase}" in real situations
              </p>

              <div className="bg-white/10 rounded-xl p-6">
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Situation {currentDrill + 1}/{drills.length}:</h4>
                  <p className="text-lg">{drills[currentDrill].situation}</p>
                </div>

                <div className="space-y-3">
                  <textarea
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    placeholder="Type your response here..."
                    className="w-full h-24 bg-white/10 border border-white/20 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={checkResponse}
                      disabled={!userResponse.trim()}
                      className="px-6 py-3 bg-white text-purple-600 hover:bg-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg font-bold transition-all"
                    >
                      Check Response
                    </button>

                    {currentDrill < drills.length - 1 && (
                      <button
                        onClick={() => {
                          setCurrentDrill(currentDrill + 1);
                          setUserResponse("");
                          setDrillResult(null);
                        }}
                        className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all"
                      >
                        Next Situation →
                      </button>
                    )}
                  </div>
                </div>

                {/* Drill Result */}
                <AnimatePresence>
                  {drillResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 p-4 rounded-lg ${
                        drillResult === "correct" 
                          ? "bg-green-500/30 border border-green-400" 
                          : drillResult === "alternative"
                          ? "bg-blue-500/30 border border-blue-400"
                          : "bg-red-500/30 border border-red-400"
                      }`}
                    >
                      {drillResult === "correct" && (
                        <>
                          <div className="font-bold text-green-200 mb-2">✅ Perfect! Natural response!</div>
                          <p className="text-sm">You used the slang naturally in context.</p>
                        </>
                      )}
                      {drillResult === "alternative" && (
                        <>
                          <div className="font-bold text-blue-200 mb-2">👍 Good alternative!</div>
                          <p className="text-sm">You could also say: "{drills[currentDrill].correctResponse}"</p>
                        </>
                      )}
                      {drillResult === "incorrect" && (
                        <>
                          <div className="font-bold text-red-200 mb-2">❌ Try using "{current.phrase}"</div>
                          <p className="text-sm">Example: "{drills[currentDrill].correctResponse}"</p>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sound Natural Score */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-6 h-6" />
          <h3 className="text-2xl font-bold">🎯 Sound Natural Score</h3>
        </div>
        <p className="text-indigo-100 text-sm mb-4">
          Test how natural your slang usage sounds
        </p>

        <textarea
          value={userResponse}
          onChange={(e) => setUserResponse(e.target.value)}
          placeholder="Write a few sentences using slang..."
          className="w-full h-32 bg-white/10 border border-white/20 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40 mb-4"
        />

        <button
          onClick={analyzeText}
          disabled={!userResponse.trim()}
          className="px-6 py-3 bg-white text-indigo-600 hover:bg-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg font-bold transition-all"
        >
          Analyze Naturalness
        </button>

        {naturalScore !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Naturalness Score</span>
              <span className="text-3xl font-bold text-yellow-400">{naturalScore}/10</span>
            </div>
            <div className="h-3 bg-black/30 rounded-full overflow-hidden mb-4">
              <motion.div
                className={`h-full ${
                  naturalScore >= 8 ? "bg-green-500" :
                  naturalScore >= 6 ? "bg-yellow-500" :
                  "bg-red-500"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${naturalScore * 10}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <div className="text-sm">
              {naturalScore >= 8 && "🔥 Sounds natural! You're using slang like a native."}
              {naturalScore >= 6 && naturalScore < 8 && "👍 Pretty good! Try varying your expressions more."}
              {naturalScore < 6 && "⚠️ Overuse detected. Mix slang with normal English for better flow."}
            </div>
          </motion.div>
        )}
      </div>

      {/* Basic to Natural Upgrades */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            <h3 className="text-2xl font-bold">⚡ Replace Basic English</h3>
          </div>
          <button
            onClick={() => setShowUpgrade(!showUpgrade)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
          >
            {showUpgrade ? "Hide" : "Show"}
          </button>
        </div>

        <AnimatePresence>
          {showUpgrade && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <p className="text-emerald-100 text-sm mb-4">
                Upgrade basic phrases to sound more natural and fluent
              </p>

              <div className="grid md:grid-cols-2 gap-3">
                {basicUpgrades.map((upgrade, idx) => (
                  <div key={idx} className="bg-white/10 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="text-sm text-red-300">
                        ❌ Basic: "{upgrade.basic}"
                      </div>
                      <div className="text-base text-white font-semibold">
                        ✅ Natural: "{upgrade.natural}"
                      </div>
                      <div className="text-xs text-emerald-200 pt-2 border-t border-white/20">
                        {upgrade.context}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all disabled:opacity-50"
        >
          ← Previous
        </button>
        <span className="text-gray-300 font-semibold">
          {currentIndex + 1} / {filteredSlang.length}
        </span>
        <button
          onClick={() => setCurrentIndex(Math.min(filteredSlang.length - 1, currentIndex + 1))}
          disabled={currentIndex === filteredSlang.length - 1}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all disabled:opacity-50"
        >
          Next →
        </button>
      </div>

      {/* Context Guide */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="font-bold text-xl mb-4">🎯 Context Matters!</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">✅ With Friends</h4>
            <p className="text-blue-100">Use freely, be yourself, have fun</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">⚠️ At Work</h4>
            <p className="text-blue-100">Be selective, know your audience, use professional alternatives</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">❌ Formal Settings</h4>
            <p className="text-blue-100">Avoid slang completely, use professional language</p>
          </div>
        </div>
      </div>

      {/* Practice Tips */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">✅ Do's</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Check the safety level before using</li>
            <li>• Match the generation and region</li>
            <li>• Use professional alternatives at work</li>
            <li>• Practice with response drills</li>
            <li>• Mix slang with normal English</li>
          </ul>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">❌ Don'ts</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Don't overuse one phrase repeatedly</li>
            <li>• Don't force Gen Z slang if you're older</li>
            <li>• Don't use regional slang out of context</li>
            <li>• Don't ignore the overuse warning</li>
            <li>• Don't use risky slang in professional settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
