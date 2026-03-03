import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Volume2, CheckCircle2, XCircle, Target, TrendingUp, Award, AlertCircle, Lightbulb, Briefcase, MessageCircle, Coffee, ArrowRight, Clock, Mic2, Lock, Unlock } from "lucide-react";

type VerbCategory = "Essential" | "Business" | "Phrasal" | "Irregular";
type DrillMode = "speed" | "pattern" | "speaking" | "context";

interface TenseUsage {
  tense: string;
  form: string;
  when: string;
  example: string;
}

interface PhrasalVariation {
  phrasal: string;
  meaning: string;
  example: string;
  context: "casual" | "business" | "both";
}

interface Verb {
  id: string;
  category: VerbCategory;
  level: 1 | 2 | 3;
  base: string;
  past: string;
  pastParticiple: string;
  ingForm: string;
  thirdPerson: string;
  meaning: string;
  pronunciation?: string;
  frequency: "very-high" | "high" | "medium";
  tenseUsage: TenseUsage[];
  phrasalVariations?: PhrasalVariation[];
  examples: {
    conversation: string;
    business: string;
    casual: string;
  };
  commonMistake: {
    wrong: string;
    right: string;
    explanation: string;
  };
  speedDrill: {
    sentence: string;
    correctAnswer: string;
    tense: string;
  }[];
  patternRecognition: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  proTip: string;
}

interface VerbProgress {
  verbId: string;
  practiced: number;
  mastered: boolean;
  lastReviewed: number;
  recognitionScore: number;
  usageScore: number;
  speakingScore: number;
  speedDrillScore: number;
  totalAttempts: number;
  correctAttempts: number;
}

export default function VerbEngine() {
  const [selectedCategory, setSelectedCategory] = useState<VerbCategory>("Essential");
  const [currentVerbIndex, setCurrentVerbIndex] = useState(0);
  const [drillMode, setDrillMode] = useState<DrillMode | null>(null);
  const [progress, setProgress] = useState<Map<string, VerbProgress>>(new Map());
  const [unlockedLevel, setUnlockedLevel] = useState<1 | 2 | 3>(1);

  // Drill states
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3);
  const [timerActive, setTimerActive] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem("verbEngineProgress");
    if (saved) {
      const parsed = JSON.parse(saved);
      setProgress(new Map(Object.entries(parsed)));
    }

    const savedLevel = localStorage.getItem("verbEngineLevel");
    if (savedLevel) {
      setUnlockedLevel(parseInt(savedLevel) as 1 | 2 | 3);
    }
  }, []);

  // Timer for speed drill
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timerActive && timeLeft === 0) {
      handleSpeedDrillAnswer(false);
    }
  }, [timerActive, timeLeft]);

  // Enhanced verb database with ALL features
  const verbs: Verb[] = [
    // LEVEL 1 - TOP 20 ESSENTIAL
    {
      id: "ess-1",
      category: "Essential",
      level: 1,
      base: "go",
      past: "went",
      pastParticiple: "gone",
      ingForm: "going",
      thirdPerson: "goes",
      meaning: "Move from one place to another",
      pronunciation: "/ɡoʊ/",
      frequency: "very-high",
      tenseUsage: [
        {
          tense: "Past Simple",
          form: "went",
          when: "Finished action in the past",
          example: "I went to Dubai yesterday."
        },
        {
          tense: "Present Perfect",
          form: "have/has gone",
          when: "Experience or connection to now",
          example: "She's gone to the store (she's not here now)."
        },
        {
          tense: "Present Perfect (been)",
          form: "have/has been",
          when: "Experience with return (NOT gone)",
          example: "I've been to Japan (and came back)."
        }
      ],
      phrasalVariations: [
        {
          phrasal: "go over",
          meaning: "Review, examine carefully",
          example: "Let's go over the contract before signing.",
          context: "business"
        },
        {
          phrasal: "go through",
          meaning: "Experience, examine in detail",
          example: "We've gone through the proposal.",
          context: "business"
        },
        {
          phrasal: "go ahead",
          meaning: "Proceed, continue",
          example: "Go ahead with the plan.",
          context: "both"
        },
        {
          phrasal: "go out",
          meaning: "Leave home for social activity",
          example: "I'm going out tonight.",
          context: "casual"
        },
        {
          phrasal: "go back",
          meaning: "Return to a place or topic",
          example: "Let's go back to the main point.",
          context: "both"
        }
      ],
      examples: {
        conversation: "I went to Dubai yesterday.",
        business: "We've gone through the proposal.",
        casual: "I'm going out tonight."
      },
      commonMistake: {
        wrong: "I have went to the store",
        right: "I have gone to the store",
        explanation: "After 'have/has', always use past participle 'gone', not past 'went'"
      },
      speedDrill: [
        {
          sentence: "Yesterday I ____ (go) to the meeting.",
          correctAnswer: "went",
          tense: "past simple"
        },
        {
          sentence: "I have ____ (go) there before.",
          correctAnswer: "gone",
          tense: "present perfect"
        },
        {
          sentence: "She ____ (go) to work every day.",
          correctAnswer: "goes",
          tense: "present simple"
        },
        {
          sentence: "I am ____ (go) right now.",
          correctAnswer: "going",
          tense: "present continuous"
        }
      ],
      patternRecognition: [
        {
          question: "Which sounds natural?",
          options: ["I have went", "I have gone", "I have go", "I has gone"],
          correctAnswer: 1
        },
        {
          question: "Complete: She ___ to Paris last year.",
          options: ["has gone", "went", "have been", "goes"],
          correctAnswer: 1
        }
      ],
      proTip: "Americans say 'gonna' in casual speech: 'I'm gonna go' = 'I'm going to go'. Phrasal verbs with GO are EVERYWHERE in business!"
    },
    {
      id: "ess-2",
      category: "Essential",
      level: 1,
      base: "get",
      past: "got",
      pastParticiple: "gotten (US) / got (UK)",
      ingForm: "getting",
      thirdPerson: "gets",
      meaning: "Obtain, receive, become",
      pronunciation: "/ɡet/",
      frequency: "very-high",
      tenseUsage: [
        {
          tense: "Past Simple",
          form: "got",
          when: "Received or obtained in the past",
          example: "I got your message this morning."
        },
        {
          tense: "Present Perfect",
          form: "have/has gotten",
          when: "Recently obtained, or change that matters now",
          example: "We've gotten approval (US) / We've got approval (UK)."
        }
      ],
      phrasalVariations: [
        {
          phrasal: "get back to",
          meaning: "Reply, respond to someone",
          example: "I'll get back to you by EOD.",
          context: "business"
        },
        {
          phrasal: "get on with",
          meaning: "Continue doing something",
          example: "Let's get on with the meeting.",
          context: "business"
        },
        {
          phrasal: "get over",
          meaning: "Recover from, accept",
          example: "It took me time to get over the rejection.",
          context: "casual"
        }
      ],
      examples: {
        conversation: "I got your message this morning.",
        business: "We've gotten approval from the board.",
        casual: "Let's get some coffee!"
      },
      commonMistake: {
        wrong: "I have got it yesterday",
        right: "I got it yesterday",
        explanation: "With specific past time (yesterday), use simple past, not present perfect"
      },
      speedDrill: [
        {
          sentence: "I ____ (get) the email an hour ago.",
          correctAnswer: "got",
          tense: "past simple"
        },
        {
          sentence: "We have ____ (get) the results.",
          correctAnswer: "gotten",
          tense: "present perfect"
        },
        {
          sentence: "She ____ (get) coffee every morning.",
          correctAnswer: "gets",
          tense: "present simple"
        }
      ],
      patternRecognition: [
        {
          question: "Which is correct for American English?",
          options: ["I have got the package", "I have gotten the package", "I got the package", "Both B and C"],
          correctAnswer: 3
        }
      ],
      proTip: "'Get' is THE most versatile verb in American English. Get it, get up, get going, get together - master this!"
    },
    {
      id: "ess-3",
      category: "Essential",
      level: 1,
      base: "make",
      past: "made",
      pastParticiple: "made",
      ingForm: "making",
      thirdPerson: "makes",
      meaning: "Create, produce, cause to happen",
      pronunciation: "/meɪk/",
      frequency: "very-high",
      tenseUsage: [
        {
          tense: "Past Simple",
          form: "made",
          when: "Created or caused in the past",
          example: "She made a great presentation."
        },
        {
          tense: "Present Perfect",
          form: "have/has made",
          when: "Created with result that matters now",
          example: "We've made significant progress."
        }
      ],
      phrasalVariations: [
        {
          phrasal: "make up",
          meaning: "Invent, compensate for",
          example: "I'll make up for lost time.",
          context: "both"
        },
        {
          phrasal: "make up one's mind",
          meaning: "Decide",
          example: "Have you made up your mind?",
          context: "both"
        }
      ],
      examples: {
        conversation: "She made dinner for everyone.",
        business: "Let's make a decision by Friday.",
        casual: "I'm making plans for the weekend."
      },
      commonMistake: {
        wrong: "I did a mistake",
        right: "I made a mistake",
        explanation: "In English: MAKE a mistake, not DO a mistake (common error for non-natives)"
      },
      speedDrill: [
        {
          sentence: "Yesterday I ____ (make) a big decision.",
          correctAnswer: "made",
          tense: "past simple"
        },
        {
          sentence: "We have ____ (make) great progress.",
          correctAnswer: "made",
          tense: "present perfect"
        },
        {
          sentence: "She ____ (make) coffee every morning.",
          correctAnswer: "makes",
          tense: "present simple"
        }
      ],
      patternRecognition: [
        {
          question: "Which is correct?",
          options: ["I did a mistake", "I made a mistake", "I maked a mistake", "I have make a mistake"],
          correctAnswer: 1
        }
      ],
      proTip: "Make vs Do: Make = create something new. Do = perform an action. Make money, make plans, make a difference!"
    },

    // BUSINESS VERBS
    {
      id: "biz-1",
      category: "Business",
      level: 1,
      base: "implement",
      past: "implemented",
      pastParticiple: "implemented",
      ingForm: "implementing",
      thirdPerson: "implements",
      meaning: "Put a plan or system into action",
      pronunciation: "/ˈɪmpləment/",
      frequency: "high",
      tenseUsage: [
        {
          tense: "Present Simple",
          form: "implement/implements",
          when: "General process or policy",
          example: "We implement new features every quarter."
        },
        {
          tense: "Present Continuous",
          form: "am/is/are implementing",
          when: "Currently in progress",
          example: "We're implementing the new policy next month."
        },
        {
          tense: "Present Perfect",
          form: "have/has implemented",
          when: "Recently completed with current impact",
          example: "We've implemented significant changes."
        }
      ],
      examples: {
        conversation: "They're implementing the new policy next month.",
        business: "We need to implement these changes immediately.",
        casual: "My company is implementing a hybrid work model."
      },
      commonMistake: {
        wrong: "We must to implement this",
        right: "We must implement this",
        explanation: "After 'must', use base form (no 'to')"
      },
      speedDrill: [
        {
          sentence: "We ____ (implement) the system last year.",
          correctAnswer: "implemented",
          tense: "past simple"
        },
        {
          sentence: "The team is ____ (implement) changes now.",
          correctAnswer: "implementing",
          tense: "present continuous"
        }
      ],
      patternRecognition: [
        {
          question: "Which sounds most professional?",
          options: ["We are putting the plan", "We implement the plan", "We are implementing the plan", "We implementation the plan"],
          correctAnswer: 2
        }
      ],
      proTip: "This verb makes you sound professional instantly. Use it in presentations and business discussions!"
    },

    // PHRASAL VERBS
    {
      id: "phr-1",
      category: "Phrasal",
      level: 1,
      base: "follow up",
      past: "followed up",
      pastParticiple: "followed up",
      ingForm: "following up",
      thirdPerson: "follows up",
      meaning: "Continue action after initial contact/meeting",
      pronunciation: "/ˈfɑːloʊ ʌp/",
      frequency: "very-high",
      tenseUsage: [
        {
          tense: "Future",
          form: "will follow up",
          when: "Promising future action",
          example: "I'll follow up with you next week."
        },
        {
          tense: "Present Continuous",
          form: "am/is/are following up",
          when: "Currently doing the follow-up",
          example: "I'm following up on our last conversation."
        }
      ],
      examples: {
        conversation: "I need to follow up with Sarah about that project.",
        business: "Let's follow up next week to review progress.",
        casual: "Did you ever follow up on that job lead?"
      },
      commonMistake: {
        wrong: "I will follow-up you tomorrow",
        right: "I will follow up with you tomorrow",
        explanation: "Follow up WITH someone (not follow up + person directly)"
      },
      speedDrill: [
        {
          sentence: "I need to ____ (follow up) with the client.",
          correctAnswer: "follow up",
          tense: "infinitive"
        },
        {
          sentence: "She ____ (follow up) yesterday.",
          correctAnswer: "followed up",
          tense: "past simple"
        }
      ],
      patternRecognition: [
        {
          question: "Which is correct?",
          options: ["Follow up him", "Follow him up", "Follow up with him", "Follow with him up"],
          correctAnswer: 2
        }
      ],
      proTip: "Essential in business. Also used as noun: 'Send a follow-up email'. Americans use this constantly!"
    },

    // IRREGULAR VERBS
    {
      id: "irr-1",
      category: "Irregular",
      level: 1,
      base: "see",
      past: "saw",
      pastParticiple: "seen",
      ingForm: "seeing",
      thirdPerson: "sees",
      meaning: "Perceive with eyes, understand",
      pronunciation: "/siː/",
      frequency: "very-high",
      tenseUsage: [
        {
          tense: "Past Simple",
          form: "saw",
          when: "Observed at a specific past time",
          example: "I saw Sarah at the mall yesterday."
        },
        {
          tense: "Present Perfect",
          form: "have/has seen",
          when: "Experience or recent observation",
          example: "Have you seen the new movie?"
        }
      ],
      examples: {
        conversation: "Did you see that new movie?",
        business: "I see what you mean - good point.",
        casual: "I saw Sarah at the mall yesterday."
      },
      commonMistake: {
        wrong: "I seen it yesterday / I have saw it",
        right: "I saw it yesterday / I have seen it",
        explanation: "Saw = past. Seen = past participle (needs 'have/has'). NEVER 'I seen'!"
      },
      speedDrill: [
        {
          sentence: "I ____ (see) him last week.",
          correctAnswer: "saw",
          tense: "past simple"
        },
        {
          sentence: "Have you ____ (see) this movie?",
          correctAnswer: "seen",
          tense: "present perfect"
        },
        {
          sentence: "She ____ (see) the problem now.",
          correctAnswer: "sees",
          tense: "present simple"
        }
      ],
      patternRecognition: [
        {
          question: "Which is WRONG?",
          options: ["I saw it", "I have seen it", "I seen it", "She sees it"],
          correctAnswer: 2
        }
      ],
      proTip: "Never say 'I seen' - this is a huge error Americans notice immediately! It's the #1 grammar mistake."
    }
  ];

  const filteredVerbs = verbs.filter(v => 
    v.category === selectedCategory && v.level <= unlockedLevel
  );
  const currentVerb = filteredVerbs[currentVerbIndex];
  const verbProgress = currentVerb ? progress.get(currentVerb.id) : undefined;

  const updateProgress = (updates: Partial<VerbProgress>) => {
    if (!currentVerb) return;

    const current = verbProgress || {
      verbId: currentVerb.id,
      practiced: 0,
      mastered: false,
      lastReviewed: Date.now(),
      recognitionScore: 0,
      usageScore: 0,
      speakingScore: 0,
      speedDrillScore: 0,
      totalAttempts: 0,
      correctAttempts: 0
    };

    const updated = { ...current, ...updates, lastReviewed: Date.now() };
    const newProgress = new Map(progress);
    newProgress.set(currentVerb.id, updated);
    setProgress(newProgress);
    localStorage.setItem("verbEngineProgress", JSON.stringify(Object.fromEntries(newProgress)));

    // Check for level unlock
    checkLevelUnlock(newProgress);
  };

  const checkLevelUnlock = (progressMap: Map<string, VerbProgress>) => {
    const level1Verbs = verbs.filter(v => v.level === 1);
    const level1Mastered = level1Verbs.filter(v => progressMap.get(v.id)?.mastered).length;
    
    if (level1Mastered >= level1Verbs.length * 0.8 && unlockedLevel === 1) {
      setUnlockedLevel(2);
      localStorage.setItem("verbEngineLevel", "2");
      setFeedback({ type: "success", message: "🎉 LEVEL 2 UNLOCKED! You've mastered the basics!" });
    }

    const level2Verbs = verbs.filter(v => v.level <= 2);
    const level2Mastered = level2Verbs.filter(v => progressMap.get(v.id)?.mastered).length;
    
    if (level2Mastered >= level2Verbs.length * 0.8 && unlockedLevel === 2) {
      setUnlockedLevel(3);
      localStorage.setItem("verbEngineLevel", "3");
      setFeedback({ type: "success", message: "🔥 LEVEL 3 UNLOCKED! You're becoming fluent!" });
    }
  };

  const handleSpeedDrillAnswer = (correct: boolean) => {
    setTimerActive(false);

    if (correct) {
      setFeedback({ type: "success", message: "⚡ Lightning fast! Perfect!" });
      updateProgress({
        speedDrillScore: (verbProgress?.speedDrillScore || 0) + 1,
        totalAttempts: (verbProgress?.totalAttempts || 0) + 1,
        correctAttempts: (verbProgress?.correctAttempts || 0) + 1
      });
    } else {
      const drill = currentVerb.speedDrill[currentDrillIndex];
      setFeedback({ 
        type: "error", 
        message: `Time's up! Correct: "${drill.correctAnswer}"` 
      });
      updateProgress({
        totalAttempts: (verbProgress?.totalAttempts || 0) + 1
      });
    }

    setTimeout(() => {
      setFeedback(null);
      setUserAnswer("");
      if (currentDrillIndex < currentVerb.speedDrill.length - 1) {
        setCurrentDrillIndex(currentDrillIndex + 1);
        setTimeLeft(3);
        setTimerActive(true);
      } else {
        setDrillMode(null);
        setCurrentDrillIndex(0);
      }
    }, 2000);
  };

  const checkSpeedAnswer = () => {
    const drill = currentVerb.speedDrill[currentDrillIndex];
    const correct = userAnswer.trim().toLowerCase() === drill.correctAnswer.toLowerCase();
    handleSpeedDrillAnswer(correct);
  };

  const handlePatternAnswer = (optionIndex: number) => {
    const pattern = currentVerb.patternRecognition[currentDrillIndex];
    const correct = optionIndex === pattern.correctAnswer;

    if (correct) {
      setFeedback({ type: "success", message: "🎯 Correct! Great instinct!" });
      updateProgress({
        recognitionScore: (verbProgress?.recognitionScore || 0) + 1,
        totalAttempts: (verbProgress?.totalAttempts || 0) + 1,
        correctAttempts: (verbProgress?.correctAttempts || 0) + 1
      });
    } else {
      setFeedback({ 
        type: "error", 
        message: `Not quite. Correct: "${pattern.options[pattern.correctAnswer]}"` 
      });
      updateProgress({
        totalAttempts: (verbProgress?.totalAttempts || 0) + 1
      });
    }

    setTimeout(() => {
      setFeedback(null);
      setSelectedOption(null);
      if (currentDrillIndex < currentVerb.patternRecognition.length - 1) {
        setCurrentDrillIndex(currentDrillIndex + 1);
      } else {
        setDrillMode(null);
        setCurrentDrillIndex(0);
      }
    }, 2000);
  };

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const nextVerb = () => {
    setCurrentVerbIndex((prev) => (prev + 1) % filteredVerbs.length);
    setDrillMode(null);
    setUserAnswer("");
    setFeedback(null);
  };

  const previousVerb = () => {
    setCurrentVerbIndex((prev) => (prev - 1 + filteredVerbs.length) % filteredVerbs.length);
    setDrillMode(null);
    setUserAnswer("");
    setFeedback(null);
  };

  const startDrill = (mode: DrillMode) => {
    setDrillMode(mode);
    setCurrentDrillIndex(0);
    if (mode === "speed") {
      setTimeLeft(3);
      setTimerActive(true);
    }
  };

  // Calculate stats
  const totalMastered = Array.from(progress.values()).filter(p => p.mastered).length;
  const totalPracticed = Array.from(progress.values()).reduce((sum, p) => sum + p.practiced, 0);
  const totalAttempts = Array.from(progress.values()).reduce((sum, p) => sum + (p.totalAttempts || 0), 0);
  const totalCorrect = Array.from(progress.values()).reduce((sum, p) => sum + (p.correctAttempts || 0), 0);
  const masteryScore = verbs.filter(v => v.level <= unlockedLevel).length > 0 
    ? Math.round((totalMastered / verbs.filter(v => v.level <= unlockedLevel).length) * 100) 
    : 0;

  // Confidence meter
  const getConfidenceLevel = () => {
    if (!verbProgress) return { recognition: 0, usage: 0, naturalness: 0 };
    
    const total = verbProgress.totalAttempts || 1;
    const correct = verbProgress.correctAttempts || 0;
    const accuracy = Math.round((correct / total) * 100);

    return {
      recognition: Math.min(100, verbProgress.recognitionScore * 20),
      usage: Math.min(100, verbProgress.speedDrillScore * 25),
      naturalness: Math.min(100, verbProgress.speakingScore * 20)
    };
  };

  const confidence = currentVerb ? getConfidenceLevel() : { recognition: 0, usage: 0, naturalness: 0 };
  const overallConfidence = Math.round((confidence.recognition + confidence.usage + confidence.naturalness) / 3);

  if (!currentVerb) {
    return (
      <div className="max-w-6xl mx-auto text-center text-white">
        <p>No verbs available in this category at your current level.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Zap className="w-10 h-10 text-yellow-400" />
          Verb Engine
        </h1>
        <p className="text-xl text-gray-300">
          Train verbs. Build <span className="text-yellow-400 font-bold">instinct</span>. Speak naturally.
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-6 text-white text-center">
          <Award className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{masteryScore}%</div>
          <div className="text-yellow-100 text-sm mt-1">Mastery Score</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white text-center">
          <Target className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{overallConfidence}%</div>
          <div className="text-blue-100 text-sm mt-1">Verb Confidence</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">Level {unlockedLevel}</div>
          <div className="text-purple-100 text-sm mt-1">Current Level</div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">🎯 Progression System</h3>
          <span className="text-sm text-gray-400">Unlock levels by mastering verbs</span>
        </div>
        <div className="flex gap-4">
          <div className={`flex-1 p-4 rounded-xl border-2 ${unlockedLevel >= 1 ? 'bg-green-500/20 border-green-400/50' : 'bg-gray-500/20 border-gray-400/50'}`}>
            <div className="flex items-center gap-2 mb-2">
              {unlockedLevel >= 1 ? <Unlock className="w-5 h-5 text-green-400" /> : <Lock className="w-5 h-5 text-gray-400" />}
              <span className="font-bold text-white">Level 1</span>
            </div>
            <p className="text-sm text-gray-300">Top 20 Essential Verbs</p>
          </div>
          <div className={`flex-1 p-4 rounded-xl border-2 ${unlockedLevel >= 2 ? 'bg-green-500/20 border-green-400/50' : 'bg-gray-500/20 border-gray-400/50'}`}>
            <div className="flex items-center gap-2 mb-2">
              {unlockedLevel >= 2 ? <Unlock className="w-5 h-5 text-green-400" /> : <Lock className="w-5 h-5 text-gray-400" />}
              <span className="font-bold text-white">Level 2</span>
            </div>
            <p className="text-sm text-gray-300">Top 50 Verbs</p>
          </div>
          <div className={`flex-1 p-4 rounded-xl border-2 ${unlockedLevel >= 3 ? 'bg-green-500/20 border-green-400/50' : 'bg-gray-500/20 border-gray-400/50'}`}>
            <div className="flex items-center gap-2 mb-2">
              {unlockedLevel >= 3 ? <Unlock className="w-5 h-5 text-green-400" /> : <Lock className="w-5 h-5 text-gray-400" />}
              <span className="font-bold text-white">Level 3</span>
            </div>
            <p className="text-sm text-gray-300">Top 100 Verbs</p>
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📚 Choose Category</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <button
            onClick={() => { setSelectedCategory("Essential"); setCurrentVerbIndex(0); setDrillMode(null); }}
            className={`p-6 rounded-xl transition-all ${
              selectedCategory === "Essential"
                ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            <Coffee className="w-8 h-8 mx-auto mb-2" />
            <div className="font-bold text-lg">Essential</div>
            <div className="text-xs mt-1 opacity-80">Daily speech verbs</div>
          </button>

          <button
            onClick={() => { setSelectedCategory("Business"); setCurrentVerbIndex(0); setDrillMode(null); }}
            className={`p-6 rounded-xl transition-all ${
              selectedCategory === "Business"
                ? "bg-gradient-to-br from-orange-600 to-red-600 text-white shadow-lg"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            <Briefcase className="w-8 h-8 mx-auto mb-2" />
            <div className="font-bold text-lg">Business</div>
            <div className="text-xs mt-1 opacity-80">Professional verbs</div>
          </button>

          <button
            onClick={() => { setSelectedCategory("Phrasal"); setCurrentVerbIndex(0); setDrillMode(null); }}
            className={`p-6 rounded-xl transition-all ${
              selectedCategory === "Phrasal"
                ? "bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            <MessageCircle className="w-8 h-8 mx-auto mb-2" />
            <div className="font-bold text-lg">Phrasal</div>
            <div className="text-xs mt-1 opacity-80">Sound American!</div>
          </button>

          <button
            onClick={() => { setSelectedCategory("Irregular"); setCurrentVerbIndex(0); setDrillMode(null); }}
            className={`p-6 rounded-xl transition-all ${
              selectedCategory === "Irregular"
                ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <div className="font-bold text-lg">Irregular</div>
            <div className="text-xs mt-1 opacity-80">Fix mistakes</div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {!drillMode ? (
        <>
          {/* Verb Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategory}-${currentVerbIndex}`}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold text-white mb-3">
                    {currentVerb.category} • Level {currentVerb.level}
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-4xl font-bold text-white">{currentVerb.base}</h2>
                    {currentVerb.pronunciation && (
                      <span className="text-lg text-indigo-200">{currentVerb.pronunciation}</span>
                    )}
                  </div>
                  <p className="text-indigo-100 text-lg italic">{currentVerb.meaning}</p>
                </div>
                <button
                  onClick={() => speakWord(currentVerb.base)}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all"
                >
                  <Volume2 className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* All Forms */}
              <div className="bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">📝 All Forms</h3>
                <div className="grid md:grid-cols-5 gap-4">
                  <div>
                    <div className="text-xs text-indigo-200 mb-1">Base</div>
                    <div className="text-xl font-bold text-white">{currentVerb.base}</div>
                  </div>
                  <div>
                    <div className="text-xs text-indigo-200 mb-1">Past</div>
                    <div className="text-xl font-bold text-white">{currentVerb.past}</div>
                  </div>
                  <div>
                    <div className="text-xs text-indigo-200 mb-1">Past Participle</div>
                    <div className="text-xl font-bold text-white">{currentVerb.pastParticiple}</div>
                  </div>
                  <div>
                    <div className="text-xs text-indigo-200 mb-1">-ing</div>
                    <div className="text-xl font-bold text-white">{currentVerb.ingForm}</div>
                  </div>
                  <div>
                    <div className="text-xs text-indigo-200 mb-1">3rd Person</div>
                    <div className="text-xl font-bold text-white">{currentVerb.thirdPerson}</div>
                  </div>
                </div>
              </div>

              {/* WHEN TO USE (Tense Power Section) */}
              <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">🎯 When to Use Each Tense</h3>
                <div className="space-y-3">
                  {currentVerb.tenseUsage.map((tense, idx) => (
                    <div key={idx} className="bg-white/10 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-bold text-green-200">{tense.tense}</span>
                        <span className="text-white font-mono">{tense.form}</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-1">→ {tense.when}</p>
                      <p className="text-white italic">"{tense.example}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phrasal Variations */}
              {currentVerb.phrasalVariations && (
                <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">🔥 Phrasal Verb Expansion</h3>
                  <div className="space-y-2">
                    {currentVerb.phrasalVariations.map((phrasal, idx) => (
                      <div key={idx} className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-yellow-200">{phrasal.phrasal}</span>
                          <span className="text-xs px-2 py-1 bg-white/20 rounded-full">
                            {phrasal.context}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-1">{phrasal.meaning}</p>
                        <p className="text-white text-sm italic">"{phrasal.example}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real Usage */}
              <div className="space-y-3 mb-6">
                <h3 className="text-lg font-semibold text-white">💬 Real Usage</h3>
                <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-5 h-5 text-blue-300" />
                    <h4 className="font-semibold text-blue-200">Conversation</h4>
                  </div>
                  <p className="text-white italic">"{currentVerb.examples.conversation}"</p>
                </div>
                <div className="bg-orange-500/20 border border-orange-400/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5 text-orange-300" />
                    <h4 className="font-semibold text-orange-200">Business</h4>
                  </div>
                  <p className="text-white italic">"{currentVerb.examples.business}"</p>
                </div>
              </div>

              {/* Common Mistake */}
              <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                  <h3 className="text-sm font-semibold text-red-200">⚠️ Common Mistake</h3>
                </div>
                <div className="space-y-2 ml-7">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                    <p className="text-red-200 line-through">{currentVerb.commonMistake.wrong}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                    <p className="text-green-200 font-semibold">{currentVerb.commonMistake.right}</p>
                  </div>
                  <p className="text-xs text-gray-300 italic mt-2">
                    💡 {currentVerb.commonMistake.explanation}
                  </p>
                </div>
              </div>

              {/* Pro Tip */}
              <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-yellow-200 mb-1">🎯 Pro Tip</h3>
                    <p className="text-white">{currentVerb.proTip}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={previousVerb} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
              ← Previous
            </button>
            <button onClick={nextVerb} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
              Next →
            </button>
          </div>

          {/* Verb Confidence Meter */}
          {verbProgress && (
            <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl p-6 text-white">
              <h3 className="text-2xl font-bold mb-4">📊 Verb Confidence Meter</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Recognition</span>
                    <span className="font-bold">{confidence.recognition}%</span>
                  </div>
                  <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${confidence.recognition}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Usage</span>
                    <span className="font-bold">{confidence.usage}%</span>
                  </div>
                  <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-cyan-500 h-full rounded-full transition-all"
                      style={{ width: `${confidence.usage}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Naturalness</span>
                    <span className="font-bold">{confidence.naturalness}%</span>
                  </div>
                  <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all"
                      style={{ width: `${confidence.naturalness}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-sm opacity-80 mb-1">Mastery Level</div>
                <div className="text-3xl font-bold">
                  {overallConfidence < 30 ? "Beginner" : overallConfidence < 60 ? "Intermediate" : overallConfidence < 85 ? "Advanced" : "Expert"}
                </div>
              </div>
            </div>
          )}

          {/* Practice Modes */}
          <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 text-white">
            <h3 className="text-2xl font-bold mb-4">⚡ Practice Drills</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => startDrill("speed")}
                className="bg-white/20 hover:bg-white/30 rounded-xl p-6 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-8 h-8" />
                  <div>
                    <div className="font-bold text-lg">Speed Drill</div>
                    <div className="text-sm opacity-80">3-second instinct training</div>
                  </div>
                </div>
                <div className="text-xs opacity-70 mt-2">
                  Score: {verbProgress?.speedDrillScore || 0}
                </div>
              </button>

              <button
                onClick={() => startDrill("pattern")}
                className="bg-white/20 hover:bg-white/30 rounded-xl p-6 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-8 h-8" />
                  <div>
                    <div className="font-bold text-lg">Pattern Recognition</div>
                    <div className="text-sm opacity-80">Instinctive correction</div>
                  </div>
                </div>
                <div className="text-xs opacity-70 mt-2">
                  Score: {verbProgress?.recognitionScore || 0}
                </div>
              </button>

              <button
                onClick={() => startDrill("speaking")}
                className="bg-white/20 hover:bg-white/30 rounded-xl p-6 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Mic2 className="w-8 h-8" />
                  <div>
                    <div className="font-bold text-lg">Speaking Drill</div>
                    <div className="text-sm opacity-80">Accent + verb practice</div>
                  </div>
                </div>
                <div className="text-xs opacity-70 mt-2">
                  Score: {verbProgress?.speakingScore || 0}
                </div>
              </button>

              <button
                onClick={() => {
                  updateProgress({
                    mastered: true,
                    practiced: (verbProgress?.practiced || 0) + 1
                  });
                  setFeedback({ type: "success", message: "✅ Marked as mastered!" });
                  setTimeout(() => setFeedback(null), 2000);
                }}
                className="bg-white/20 hover:bg-white/30 rounded-xl p-6 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8" />
                  <div>
                    <div className="font-bold text-lg">Mark as Mastered</div>
                    <div className="text-sm opacity-80">I've got this verb!</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Speed Drill Mode */}
          {drillMode === "speed" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-8 text-white"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">⚡ Speed Drill - Complete in 3 Seconds!</h3>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5" />
                  <span className="text-3xl font-bold">{timeLeft}s</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-6 mb-6">
                <p className="text-lg mb-4">{currentVerb.speedDrill[currentDrillIndex].sentence}</p>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkSpeedAnswer()}
                  placeholder="Type answer..."
                  autoFocus
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-xl placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>

              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg mb-4 flex items-center gap-2 ${
                    feedback.type === "success" 
                      ? "bg-green-500/20 border border-green-400/50" 
                      : "bg-red-500/20 border border-red-400/50"
                  }`}
                >
                  {feedback.type === "success" ? <CheckCircle2 /> : <XCircle />}
                  <span>{feedback.message}</span>
                </motion.div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={checkSpeedAnswer}
                  disabled={!userAnswer.trim()}
                  className="flex-1 px-6 py-3 bg-white text-red-600 hover:bg-gray-100 disabled:bg-gray-400 rounded-lg font-bold"
                >
                  Submit
                </button>
                <button
                  onClick={() => setDrillMode(null)}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          )}

          {/* Pattern Recognition Mode */}
          {drillMode === "pattern" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-white"
            >
              <h3 className="text-2xl font-bold mb-6">🎯 Pattern Recognition</h3>

              <div className="bg-white/10 rounded-xl p-6 mb-6">
                <p className="text-2xl font-semibold mb-6">
                  {currentVerb.patternRecognition[currentDrillIndex].question}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {currentVerb.patternRecognition[currentDrillIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedOption(idx);
                        handlePatternAnswer(idx);
                      }}
                      disabled={selectedOption !== null}
                      className={`p-4 rounded-xl font-semibold text-lg transition-all ${
                        selectedOption === null
                          ? "bg-white/20 hover:bg-white/30"
                          : selectedOption === idx
                          ? idx === currentVerb.patternRecognition[currentDrillIndex].correctAnswer
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
                  className={`p-4 rounded-lg mb-4 ${
                    feedback.type === "success"
                      ? "bg-green-500/20 border border-green-400/50"
                      : "bg-red-500/20 border border-red-400/50"
                  }`}
                >
                  {feedback.message}
                </motion.div>
              )}

              <button
                onClick={() => setDrillMode(null)}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg"
              >
                Exit Drill
              </button>
            </motion.div>
          )}

          {/* Speaking Drill Mode */}
          {drillMode === "speaking" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl p-8 text-white"
            >
              <h3 className="text-2xl font-bold mb-6">🎙 Speaking Drill - Say Naturally</h3>

              <div className="bg-white/10 rounded-xl p-6 mb-6">
                <p className="text-sm opacity-80 mb-2">Practice this sentence with correct pronunciation:</p>
                <p className="text-2xl font-semibold mb-4">"{currentVerb.examples.business}"</p>

                <button
                  onClick={() => speakWord(currentVerb.examples.business)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>Listen to Native Speaker</span>
                </button>
              </div>

              <div className="bg-white/10 rounded-xl p-4 mb-6">
                <p className="text-sm mb-2">💡 Focus on:</p>
                <ul className="text-sm space-y-1 opacity-90">
                  <li>• Correct verb form + natural pronunciation</li>
                  <li>• Rhythm and stress patterns</li>
                  <li>• Connection between words (linking)</li>
                </ul>
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
                    updateProgress({
                      speakingScore: (verbProgress?.speakingScore || 0) + 1
                    });
                    setFeedback({ type: "success", message: "🎉 Great practice! Your accent is improving!" });
                    setTimeout(() => {
                      setFeedback(null);
                      setDrillMode(null);
                    }, 2000);
                  }}
                  className="flex-1 px-6 py-3 bg-white text-green-600 hover:bg-gray-100 rounded-lg font-bold"
                >
                  ✅ I Practiced This
                </button>
                <button
                  onClick={() => setDrillMode(null)}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Global Feedback */}
      {feedback && !drillMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-8 right-8 p-6 rounded-xl shadow-2xl ${
            feedback.type === "success" 
              ? "bg-green-500 text-white" 
              : "bg-red-500 text-white"
          }`}
        >
          {feedback.message}
        </motion.div>
      )}
    </div>
  );
}
