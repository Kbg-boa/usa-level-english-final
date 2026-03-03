import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, Clock, Volume2, Send, Award, TrendingUp, Zap, Target, RotateCcw, Mic2, CheckCircle2, AlertCircle, Lightbulb, User, Bot, Activity, Gauge, Flame, BookmarkPlus, BarChart3, Play, Timer } from "lucide-react";

type Scenario = "small-talk" | "networking" | "restaurant" | "negotiation" | "interview" | "casual" | "dating" | "business";
type Mode = "text" | "voice";
type TimerLevel = "beginner" | "advanced" | "elite";
type EmotionalTone = "flat" | "enthusiastic" | "confident" | "awkward";
type ConversationDepth = "surface" | "developing" | "engaging" | "compelling";

interface Message {
  role: "ai" | "user";
  content: string;
  timestamp: number;
  interrupted?: boolean;
  feedback?: Feedback;
}

interface Feedback {
  naturalness: number;
  grammar: number;
  speed: number;
  confidence: number;
  emotionalTone: EmotionalTone;
  conversationDepth: ConversationDepth;
  hesitationCount: number;
  hesitationRate: "normal" | "needs-improvement" | "weak";
  suggestion: string;
  upgradedVersion?: string[];
  microChallenge?: string;
}

interface ConversationGoal {
  type: "contraction" | "question" | "phrasal-verb" | "detail" | "filler";
  description: string;
  target: number;
  current: number;
  completed: boolean;
}

interface ConversationProgress {
  scenario: Scenario;
  messagesCount: number;
  avgNaturalness: number;
  avgSpeed: number;
  avgConfidence: number;
  avgDepth: number;
  completedAt: number;
  goals: ConversationGoal[];
}

interface WeakPattern {
  type: "grammar" | "vocabulary" | "confidence" | "speed";
  count: number;
  lastDetected: number;
}

interface SavedPhrase {
  original: string;
  upgraded: string;
  scenario: string;
  savedAt: number;
}

interface ScenarioData {
  id: Scenario;
  title: string;
  description: string;
  icon: string;
  color: string;
  context: string;
  aiPersonality: string;
  starterPrompts: string[];
  commonPhrases: string[];
  baseInterruptionLevel: number;
}

export default function ConversationSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [mode, setMode] = useState<Mode>("text");
  const [timerLevel, setTimerLevel] = useState<TimerLevel>("beginner");
  const [conversationStarted, setConversationStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationProgress[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [weakPatterns, setWeakPatterns] = useState<Map<string, WeakPattern>>(new Map());
  const [savedPhrases, setSavedPhrases] = useState<SavedPhrase[]>([]);
  
  // Advanced features
  const [enableInterruptions, setEnableInterruptions] = useState(false);
  const [enableMicroChallenges, setEnableMicroChallenges] = useState(false);
  const [currentMicroChallenge, setCurrentMicroChallenge] = useState<string | null>(null);
  const [conversationDepthScore, setConversationDepthScore] = useState(0);
  const [conversationGoals, setConversationGoals] = useState<ConversationGoal[]>([]);
  const [sessionDuration, setSessionDuration] = useState<"sprint" | "workout" | "custom">("custom");
  const [showReplayRewrite, setShowReplayRewrite] = useState(false);
  const [worstResponses, setWorstResponses] = useState<Message[]>([]);
  const [avgPerformanceScore, setAvgPerformanceScore] = useState(5);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionTimeElapsed, setSessionTimeElapsed] = useState(0);
  const [responseStartTime, setResponseStartTime] = useState<number | null>(null);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(false);
  const [showMicHelp, setShowMicHelp] = useState(false);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem("conversationHistory");
    if (saved) {
      setConversationHistory(JSON.parse(saved));
    }

    const savedPatterns = localStorage.getItem("weakPatterns");
    if (savedPatterns) {
      const parsed = JSON.parse(savedPatterns);
      setWeakPatterns(new Map(Object.entries(parsed)));
    }

    const savedPhrasesData = localStorage.getItem("savedPhrases");
    if (savedPhrasesData) {
      setSavedPhrases(JSON.parse(savedPhrasesData));
    }

    // Load voices for speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices(); // Initial call
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
          speechSynthesis.getVoices(); // Update when voices change
        };
      }
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timerActive && timeLeft === 0) {
      setTimerActive(false);
      trackWeakPattern("speed");
      setCurrentFeedback({
        naturalness: 3,
        grammar: 5,
        speed: 1,
        confidence: 2,
        emotionalTone: "flat",
        conversationDepth: "surface",
        hesitationCount: 0,
        hesitationRate: "weak",
        suggestion: "⚡ Too slow! Practice thinking in English, not translating. Real conversations move fast!",
      });
      setShowFeedback(true);
    }
  }, [timerActive, timeLeft]);

  // Session time tracker
  useEffect(() => {
    if (conversationStarted && sessionStartTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        setSessionTimeElapsed(elapsed);
        
        // Auto-end Sprint after 3 minutes (180 seconds)
        if (sessionDuration === "sprint" && elapsed >= 180) {
          endConversation();
        }
        
        // Auto-end Workout after 10 minutes (600 seconds)
        if (sessionDuration === "workout" && elapsed >= 600) {
          endConversation();
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [conversationStarted, sessionStartTime, sessionDuration]);

  // Adaptive interruption trigger
  useEffect(() => {
    if (enableInterruptions && timerActive && timeLeft > 2) {
      const scenario = scenarios.find(s => s.id === selectedScenario);
      if (!scenario) return;

      // Adaptive rate: increase if user performing well
      const performanceMultiplier = avgPerformanceScore > 7 ? 1.5 : avgPerformanceScore < 5 ? 0.5 : 1;
      const adaptiveRate = scenario.baseInterruptionLevel * performanceMultiplier;

      if (Math.random() < adaptiveRate * 0.01) {
        triggerInterruption();
      }
    }
  }, [timeLeft]);

  const scenarios: ScenarioData[] = [
    {
      id: "small-talk",
      title: "Small Talk",
      description: "Casual everyday conversations",
      icon: "💬",
      color: "from-blue-500 to-cyan-500",
      context: "Coffee shop, elevator, waiting room",
      aiPersonality: "Friendly, casual American",
      baseInterruptionLevel: 10,
      starterPrompts: [
        "Hey! How's it going?",
        "Nice weather today, right?",
        "What do you do for work?"
      ],
      commonPhrases: [
        "Can't complain",
        "Pretty good, you?",
        "Yeah, for sure",
        "That's cool",
        "I feel you"
      ]
    },
    {
      id: "networking",
      title: "Networking",
      description: "Professional connections & events",
      icon: "🤝",
      color: "from-purple-500 to-pink-500",
      context: "Conference, meetup, business event",
      aiPersonality: "Professional but approachable",
      baseInterruptionLevel: 20,
      starterPrompts: [
        "Hi! What brings you to this event?",
        "So, what do you do?",
        "Have you been to one of these before?"
      ],
      commonPhrases: [
        "I work in tech",
        "Let me give you my card",
        "We should connect on LinkedIn",
        "I'd love to pick your brain about...",
        "Let's grab coffee sometime"
      ]
    },
    {
      id: "restaurant",
      title: "Restaurant",
      description: "Ordering food & dining",
      icon: "🍽️",
      color: "from-orange-500 to-red-500",
      context: "Restaurant, café, fast food",
      aiPersonality: "Friendly server",
      baseInterruptionLevel: 5,
      starterPrompts: [
        "Hi! Welcome! Can I get you started with something to drink?",
        "Are you ready to order?",
        "How is everything tasting?"
      ],
      commonPhrases: [
        "I'll have the...",
        "Can I get...",
        "How's the salmon?",
        "Just water is fine",
        "Can we get the check?"
      ]
    },
    {
      id: "negotiation",
      title: "Negotiation",
      description: "Business deals & agreements",
      icon: "💼",
      color: "from-green-500 to-emerald-500",
      context: "Business meeting, contract discussion",
      aiPersonality: "Professional negotiator",
      baseInterruptionLevel: 30,
      starterPrompts: [
        "So, let's talk numbers. What are you thinking?",
        "I see your point, but here's where I'm coming from...",
        "What would make this work for you?"
      ],
      commonPhrases: [
        "Let me run this by my team",
        "I think we can work with that",
        "That's a bit steep for us",
        "How about we meet in the middle?",
        "Let's lock this in"
      ]
    },
    {
      id: "interview",
      title: "Job Interview",
      description: "Professional interviews",
      icon: "🎯",
      color: "from-indigo-500 to-purple-500",
      context: "Job interview, hiring process",
      aiPersonality: "Professional interviewer",
      baseInterruptionLevel: 5,
      starterPrompts: [
        "Tell me about yourself.",
        "Why are you interested in this position?",
        "What's your biggest strength?"
      ],
      commonPhrases: [
        "I have experience in...",
        "I'm passionate about...",
        "In my previous role...",
        "I'd say my strength is...",
        "That's a great question"
      ]
    },
    {
      id: "casual",
      title: "Casual Friend",
      description: "Hanging out with friends",
      icon: "🎮",
      color: "from-yellow-500 to-orange-500",
      context: "Weekend hangout, casual chat",
      aiPersonality: "Chill American friend",
      baseInterruptionLevel: 25,
      starterPrompts: [
        "Yo! What's up?",
        "Dude, did you see the game last night?",
        "Wanna grab drinks later?"
      ],
      commonPhrases: [
        "I'm down",
        "That's dope",
        "No way!",
        "For real?",
        "Let's do it"
      ]
    },
    {
      id: "dating",
      title: "Dating",
      description: "Romantic conversations",
      icon: "💕",
      color: "from-pink-500 to-red-500",
      context: "First date, getting to know someone",
      aiPersonality: "Charming date",
      baseInterruptionLevel: 15,
      starterPrompts: [
        "So, tell me something interesting about yourself!",
        "What do you like to do for fun?",
        "Have you been here before?"
      ],
      commonPhrases: [
        "That's really cool",
        "I love that!",
        "We should totally...",
        "You seem really...",
        "I'd love to hear more about that"
      ]
    },
    {
      id: "business",
      title: "Business Mentor",
      description: "Professional advice & guidance",
      icon: "📊",
      color: "from-teal-500 to-cyan-500",
      context: "Mentorship session, career advice",
      aiPersonality: "Experienced mentor",
      baseInterruptionLevel: 15,
      starterPrompts: [
        "So, what challenges are you facing right now?",
        "Walk me through your current situation.",
        "What are your goals for the next 6 months?"
      ],
      commonPhrases: [
        "Here's my take on that...",
        "I've been in your shoes",
        "The key is to...",
        "Let me share something that worked for me",
        "Focus on..."
      ]
    }
  ];

  const microChallenges = [
    "⚡ Use a contraction in your next response",
    "⚡ Ask a follow-up question",
    "⚡ Add a natural filler word (like, you know, I mean)",
    "⚡ Share a specific detail or example",
    "⚡ Show enthusiasm in your tone",
    "⚡ Use a phrasal verb",
    "⚡ Make your response longer than 10 words"
  ];

  const generateConversationGoals = (): ConversationGoal[] => {
    const allGoals = [
      { type: "contraction" as const, description: "Use 3 contractions (I'm, you're, can't)", target: 3 },
      { type: "question" as const, description: "Ask 2 follow-up questions", target: 2 },
      { type: "phrasal-verb" as const, description: "Use 1 phrasal verb (pick up, figure out, etc.)", target: 1 },
      { type: "detail" as const, description: "Share specific details in 2 responses", target: 2 },
      { type: "filler" as const, description: "Use natural fillers (like, you know) appropriately", target: 2 }
    ];

    // Pick 3 random goals
    const shuffled = allGoals.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map(g => ({ ...g, current: 0, completed: false }));
  };

  const getTimerDuration = () => {
    switch (timerLevel) {
      case "beginner": return 10;
      case "advanced": return 7;
      case "elite": return 5;
    }
  };

  const trackWeakPattern = (type: "grammar" | "vocabulary" | "confidence" | "speed") => {
    const current = weakPatterns.get(type) || { type, count: 0, lastDetected: 0 };
    const updated = {
      ...current,
      count: current.count + 1,
      lastDetected: Date.now()
    };

    const newPatterns = new Map(weakPatterns);
    newPatterns.set(type, updated);
    setWeakPatterns(newPatterns);
    localStorage.setItem("weakPatterns", JSON.stringify(Object.fromEntries(newPatterns)));
  };

  const triggerInterruption = () => {
    const interruptions = [
      "Yeah yeah I get you, but what I'm saying is...",
      "Hold on, let me jump in here real quick...",
      "Sorry to interrupt, but that reminds me...",
      "Wait wait, before you continue...",
      "Quick thing - what do you think about..."
    ];

    const interruption = interruptions[Math.floor(Math.random() * interruptions.length)];
    
    const aiMessage: Message = {
      role: "ai",
      content: interruption,
      timestamp: Date.now(),
      interrupted: true
    };

    setMessages(prev => [...prev, aiMessage]);
    setTimerActive(false);

    // Auto-speak interruption
    speakText(interruption);
    
    setTimeout(() => {
      setTimeLeft(getTimerDuration());
      setTimerActive(true);
    }, 1500);
  };

  const generateMicroChallenge = () => {
    if (enableMicroChallenges && Math.random() < 0.3) {
      const challenge = microChallenges[Math.floor(Math.random() * microChallenges.length)];
      setCurrentMicroChallenge(challenge);
      
      setTimeout(() => {
        setCurrentMicroChallenge(null);
      }, 8000);
    }
  };

  const quickStartSprint = () => {
    setSessionDuration("sprint");
    // Auto-select random scenario
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setSelectedScenario(randomScenario.id);
    setTimerLevel("advanced");
    
    // Auto-start after selecting scenario
    setTimeout(() => {
      const scenario = randomScenario;
      const starterMessage = scenario.starterPrompts[Math.floor(Math.random() * scenario.starterPrompts.length)];

      setMessages([
        {
          role: "ai",
          content: starterMessage,
          timestamp: Date.now()
        }
      ]);
      setConversationStarted(true);
      setSessionStartTime(Date.now());
      setSessionTimeElapsed(0);
      setResponseStartTime(Date.now());
      setTimeLeft(7); // Advanced mode = 7 seconds
      setTimerActive(true);
      
      // Generate goals
      setConversationGoals(generateConversationGoals());
      setEnableMicroChallenges(true);

      // Auto-speak the starter message
      setTimeout(() => speakText(starterMessage), 500);
    }, 500);
  };

  const quickStartWorkout = () => {
    setSessionDuration("workout");
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setSelectedScenario(randomScenario.id);
    setTimerLevel("elite");
    
    // Auto-start after selecting scenario
    setTimeout(() => {
      const scenario = randomScenario;
      const starterMessage = scenario.starterPrompts[Math.floor(Math.random() * scenario.starterPrompts.length)];

      setMessages([
        {
          role: "ai",
          content: starterMessage,
          timestamp: Date.now()
        }
      ]);
      setConversationStarted(true);
      setSessionStartTime(Date.now());
      setSessionTimeElapsed(0);
      setResponseStartTime(Date.now());
      setTimeLeft(5); // Elite mode = 5 seconds
      setTimerActive(true);
      
      // Generate goals
      setConversationGoals(generateConversationGoals());
      setEnableInterruptions(true);
      setEnableMicroChallenges(true);

      // Auto-speak the starter message
      setTimeout(() => speakText(starterMessage), 500);
    }, 500);
  };

  const startConversation = () => {
    if (!selectedScenario) return;

    const scenario = scenarios.find(s => s.id === selectedScenario)!;
    const starterMessage = scenario.starterPrompts[Math.floor(Math.random() * scenario.starterPrompts.length)];

    setMessages([
      {
        role: "ai",
        content: starterMessage,
        timestamp: Date.now()
      }
    ]);
    setConversationStarted(true);
    setSessionStartTime(Date.now());
    setSessionTimeElapsed(0);
    setResponseStartTime(Date.now());
    setTimeLeft(getTimerDuration());
    setTimerActive(true);

    // Auto-speak the starter message
    setTimeout(() => speakText(starterMessage), 500);
    
    // Generate goals
    setConversationGoals(generateConversationGoals());
    
    if (timerLevel === "elite") {
      setEnableInterruptions(true);
      setEnableMicroChallenges(true);
    } else if (timerLevel === "advanced") {
      setEnableMicroChallenges(true);
    }
  };

  const detectHesitation = (text: string): { count: number; rate: "normal" | "needs-improvement" | "weak" } => {
    const blockingHesitations = ["um", "uh", "er", "ah", "hmm"];
    const longPauses = (text.match(/\.\.\./g) || []).length;
    
    let blockingCount = 0;
    blockingHesitations.forEach(word => {
      const matches = text.match(new RegExp(`\\b${word}\\b`, 'gi'));
      if (matches) blockingCount += matches.length;
    });

    const totalHesitations = blockingCount + longPauses;
    const wordCount = text.split(' ').length;
    const hesitationsPerMinute = wordCount > 0 ? (totalHesitations / wordCount) * 150 : 0; // Assuming ~150 wpm

    let rate: "normal" | "needs-improvement" | "weak";
    if (hesitationsPerMinute <= 2) rate = "normal";
    else if (hesitationsPerMinute <= 5) rate = "needs-improvement";
    else rate = "weak";

    return { count: totalHesitations, rate };
  };

  const detectEmotionalTone = (text: string): EmotionalTone => {
    const hasExclamation = /!/.test(text);
    const hasMultipleExclamations = (text.match(/!/g) || []).length > 1;
    const hasQuestion = /\?/.test(text);
    const length = text.split(' ').length;
    const hasPositiveWords = /(awesome|great|love|amazing|cool|excited|fantastic)/i.test(text);
    
    if (hasMultipleExclamations || hasPositiveWords) return "enthusiastic";
    if (hasExclamation && length > 8) return "confident";
    if (length < 3 || !hasQuestion && !hasExclamation) return "flat";
    return "awkward";
  };

  const calculateConversationDepth = (text: string): ConversationDepth => {
    const words = text.split(' ').length;
    const hasExample = /(like|for example|such as|for instance)/i.test(text);
    const hasDetail = words > 15;
    const hasQuestion = /\?/.test(text);
    const hasPersonalShare = /(I|my|me)/i.test(text);

    if (words < 5) return "surface";
    if (words >= 5 && words < 12) return "developing";
    if ((words >= 12 || hasExample || hasQuestion) && hasPersonalShare) return "engaging";
    if (hasDetail && hasExample && hasPersonalShare) return "compelling";
    return "developing";
  };

  const updateGoalProgress = (userMessage: string) => {
    const updated = conversationGoals.map(goal => {
      const newGoal = { ...goal };

      if (goal.type === "contraction" && !goal.completed) {
        const contractions = (userMessage.match(/('ll|'re|'ve|'m|n't|'s)/g) || []).length;
        newGoal.current = Math.min(goal.target, goal.current + contractions);
      } else if (goal.type === "question" && !goal.completed) {
        const questions = (userMessage.match(/\?/g) || []).length;
        newGoal.current = Math.min(goal.target, goal.current + questions);
      } else if (goal.type === "phrasal-verb" && !goal.completed) {
        const phrasalVerbs = /(pick up|figure out|get over|look into|come across|turn down|give up|carry on|put off|take off)/i;
        if (phrasalVerbs.test(userMessage)) {
          newGoal.current = Math.min(goal.target, goal.current + 1);
        }
      } else if (goal.type === "detail" && !goal.completed) {
        if (userMessage.split(' ').length > 15) {
          newGoal.current = Math.min(goal.target, goal.current + 1);
        }
      } else if (goal.type === "filler" && !goal.completed) {
        const naturalFillers = /(like|you know|i mean|you see|kind of|sort of)/gi;
        const matches = (userMessage.match(naturalFillers) || []).length;
        if (matches > 0 && matches <= 2) { // Natural amount
          newGoal.current = Math.min(goal.target, goal.current + 1);
        }
      }

      newGoal.completed = newGoal.current >= newGoal.target;
      return newGoal;
    });

    setConversationGoals(updated);
  };

  const analyzeResponse = (userMessage: string): Feedback => {
    const hasContraction = /('ll|'re|'ve|'m|n't|'s)/i.test(userMessage);
    const hasFiller = /(like|you know|i mean|you see|kind of|sort of)/i.test(userMessage.toLowerCase());
    const isShort = userMessage.split(' ').length < 3;
    const isTooFormal = /I am|I would|I will|shall|whom/i.test(userMessage);
    const hasQuestion = /\?/.test(userMessage);
    const hesitationData = detectHesitation(userMessage);
    const emotionalTone = detectEmotionalTone(userMessage);
    const conversationDepth = calculateConversationDepth(userMessage);
    
    // Calculate actual response time
    const actualResponseTime = responseStartTime ? (Date.now() - responseStartTime) / 1000 : getTimerDuration();
    
    let naturalness = 5;
    let grammar = 7;
    // Speed based on actual response time
    let speed = 10;
    if (actualResponseTime <= 3) speed = 10;
    else if (actualResponseTime <= 5) speed = 8;
    else if (actualResponseTime <= 7) speed = 6;
    else if (actualResponseTime <= 10) speed = 4;
    else speed = 2;
    
    let confidence = 5;
    let suggestion = "";
    let upgradedVersion: string[] = [];

    // Naturalness analysis
    if (hasContraction) naturalness += 2;
    if (hasFiller && hesitationData.count <= 2) naturalness += 1; // Natural fillers are good
    if (isTooFormal) naturalness -= 2;
    if (isShort && !hasQuestion) naturalness -= 1;
    if (hesitationData.rate === "weak") naturalness -= 2;
    else if (hesitationData.rate === "needs-improvement") naturalness -= 1;

    // Grammar analysis
    if (userMessage.charAt(0) === userMessage.charAt(0).toUpperCase()) grammar += 1;
    if (!isShort) grammar += 1;

    // Confidence analysis
    if (hasQuestion) confidence += 2;
    if (userMessage.length > 20) confidence += 2;
    if (emotionalTone === "enthusiastic") confidence += 2;
    if (emotionalTone === "flat") confidence -= 2;
    if (hesitationData.rate === "weak") confidence -= 2;
    else if (hesitationData.rate === "needs-improvement") confidence -= 1;

    // Track weak patterns
    if (naturalness < 5) trackWeakPattern("vocabulary");
    if (grammar < 6) trackWeakPattern("grammar");
    if (confidence < 5) trackWeakPattern("confidence");
    if (speed < 4) trackWeakPattern("speed");

    // Depth-based suggestions
    if (conversationDepth === "surface") {
      suggestion = "🔥 Too short! Americans love details. Expand with an example or more context.";
      upgradedVersion.push(`${userMessage} For example, I really enjoy...`);
    } else if (isTooFormal) {
      suggestion = "Too formal! Americans speak casually. Use contractions: I'm, you're, it's.";
      if (userMessage.includes("I am")) {
        upgradedVersion.push(userMessage.replace(/I am/g, "I'm"));
      }
    } else if (hesitationData.rate === "weak") {
      suggestion = "⚠️ Too many hesitations! Practice speaking smoothly without 'um' or 'uh'.";
    } else if (hesitationData.rate === "needs-improvement") {
      suggestion = "💡 Reduce hesitations. Natives use 'um/uh' occasionally, but smooth flow is key.";
    } else if (!hasContraction && userMessage.length > 10) {
      suggestion = "Good! Try more contractions to sound natural: I'm, you're, can't, won't.";
    } else if (emotionalTone === "flat") {
      suggestion = "💡 Add energy! Americans appreciate enthusiasm. Use exclamations or positive words.";
    } else {
      suggestion = "✅ Natural and engaging! Keep this energy!";
    }

    // Common phrase suggestions
    if (selectedScenario === "small-talk" && userMessage.toLowerCase().includes("fine")) {
      upgradedVersion = ["I'm good!", "Pretty good, you?", "Can't complain!", "Doing well, thanks!"];
      suggestion = "Instead of 'fine', Americans usually say:";
    }

    // Micro-challenge completion check
    let microChallenge: string | undefined;
    if (currentMicroChallenge) {
      if (currentMicroChallenge.includes("contraction") && hasContraction) {
        microChallenge = "✅ Challenge completed: Used contraction!";
      } else if (currentMicroChallenge.includes("question") && hasQuestion) {
        microChallenge = "✅ Challenge completed: Asked follow-up!";
      } else if (currentMicroChallenge.includes("filler") && hasFiller) {
        microChallenge = "✅ Challenge completed: Natural filler!";
      }
    }

    return {
      naturalness: Math.min(10, Math.max(1, naturalness)),
      grammar: Math.min(10, Math.max(1, grammar)),
      speed,
      confidence: Math.min(10, Math.max(1, confidence)),
      emotionalTone,
      conversationDepth,
      hesitationCount: hesitationData.count,
      hesitationRate: hesitationData.rate,
      suggestion,
      upgradedVersion: upgradedVersion.length > 0 ? upgradedVersion : undefined,
      microChallenge
    };
  };

  const generateAIResponse = (userMessage: string, feedback: Feedback): string => {
    // Follow-up pressure for short responses
    if (feedback.conversationDepth === "surface") {
      const pressureResponses = [
        "Just that? Come on, give me more!",
        "Okay... but tell me more about it!",
        "Interesting! Can you elaborate?",
        "Yeah? What else?",
        "That's cool, but I want details!"
      ];
      return pressureResponses[Math.floor(Math.random() * pressureResponses.length)];
    }

    // Enthusiastic responses for engaging answers
    if (feedback.conversationDepth === "engaging" || feedback.conversationDepth === "compelling") {
      const enthusiasticResponses = {
        "small-talk": [
          "Oh man, that's awesome! Tell me more!",
          "For real? That's so cool!",
          "I love that! What else?",
          "That's amazing! How'd that happen?"
        ],
        "networking": [
          "That's impressive! We should definitely stay in touch.",
          "Wow, I'd love to learn more about that!",
          "Fascinating! What made you get into that?",
          "That's exactly what I'm interested in!"
        ],
        "casual": [
          "Dude that's sick!",
          "No way! That's hilarious!",
          "Bro, that's so dope!",
          "For real?! That's crazy!"
        ]
      };

      const responses = enthusiasticResponses[selectedScenario!] || enthusiasticResponses["small-talk"];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Standard responses
    const responses = {
      "small-talk": [
        "Yeah, totally! So what do you do for fun?",
        "Oh nice! I feel you on that.",
        "That's cool! You from around here?",
        "For sure! How's your day been?"
      ],
      "networking": [
        "Interesting! We should definitely connect.",
        "That sounds fascinating! I'd love to hear more.",
        "Oh, I know someone in that space!",
        "That's impressive! How long have you been doing that?"
      ],
      "restaurant": [
        "Great choice! Coming right up.",
        "Sure thing! Anything else?",
        "Perfect! I'll put that in.",
        "Absolutely! Would you like anything to drink?"
      ],
      "negotiation": [
        "I appreciate your position. Let me see what I can do.",
        "That's fair. How about we structure it this way...",
        "I hear you. What if we compromise?",
        "Good point. Let me run some numbers."
      ],
      "interview": [
        "Great answer! Can you give me a specific example?",
        "I see. Tell me about a challenge you've faced.",
        "Interesting! How would that apply to this role?",
        "Good! What would you say is your weakness?"
      ],
      "casual": [
        "Haha, dude that's hilarious!",
        "No way! That's crazy!",
        "For real? That's awesome!",
        "Yeah man, I'm totally down!"
      ],
      "dating": [
        "That's really cool! I love that.",
        "Oh wow, I've always wanted to try that!",
        "You seem really interesting!",
        "I totally get that! Same here."
      ],
      "business": [
        "That's a common challenge. Here's what I'd suggest...",
        "I've seen this before. The key is...",
        "Good question. In my experience...",
        "That's the right mindset. Let's think about next steps."
      ]
    };

    const scenarioResponses = responses[selectedScenario!] || responses["small-talk"];
    return scenarioResponses[Math.floor(Math.random() * scenarioResponses.length)];
  };

  const sendMessage = () => {
    if (!userInput.trim() || !conversationStarted) return;

    setTimerActive(false);

    // Analyze response
    const feedback = analyzeResponse(userInput);
    
    // Update goals
    updateGoalProgress(userInput);

    // Add user message with feedback
    const userMessage: Message = {
      role: "user",
      content: userInput,
      timestamp: Date.now(),
      feedback
    };
    setMessages([...messages, userMessage]);

    setCurrentFeedback(feedback);
    setShowFeedback(true);

    // Update performance tracking
    const performanceScore = (feedback.naturalness + feedback.grammar + feedback.speed + feedback.confidence) / 4;
    setAvgPerformanceScore(prev => (prev + performanceScore) / 2);

    // Update depth score
    const depthScores = { surface: 1, developing: 2, engaging: 3, compelling: 4 };
    setConversationDepthScore(prev => prev + depthScores[feedback.conversationDepth]);

    setUserInput("");
    setTotalMessages(totalMessages + 1);

    // Generate micro-challenge for next response
    generateMicroChallenge();

    // Generate AI response after feedback
    setTimeout(() => {
      setShowFeedback(false);
      setIsAiTyping(true);

      setTimeout(() => {
        const aiResponse = generateAIResponse(userInput, feedback);
        const aiMessage: Message = {
          role: "ai",
          content: aiResponse,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsAiTyping(false);

        // Auto-speak AI response
        speakText(aiResponse);

        // Start timer for next response
        setResponseStartTime(Date.now());
        setTimeLeft(getTimerDuration());
        setTimerActive(true);
      }, 1500);
    }, 3000);
  };

  const savePhrase = (original: string, upgraded: string) => {
    const newPhrase: SavedPhrase = {
      original,
      upgraded,
      scenario: selectedScenario || "general",
      savedAt: Date.now()
    };

    const updated = [...savedPhrases, newPhrase];
    setSavedPhrases(updated);
    localStorage.setItem("savedPhrases", JSON.stringify(updated));
  };

  const resetConversation = () => {
    setMessages([]);
    setConversationStarted(false);
    setUserInput("");
    setCurrentFeedback(null);
    setShowFeedback(false);
    setTimerActive(false);
    setTotalMessages(0);
    setCurrentMicroChallenge(null);
    setConversationDepthScore(0);
    setConversationGoals([]);
    setAvgPerformanceScore(5);
    setWorstResponses([]);
    setShowReplayRewrite(false);
    setSessionStartTime(null);
    setSessionTimeElapsed(0);
    setResponseStartTime(null);
  };

  const endConversation = () => {
    if (messages.length > 0 && selectedScenario) {
      const userMessages = messages.filter(m => m.role === "user");
      
      // Calculate averages
      const avgNaturalness = userMessages.reduce((sum, m) => sum + (m.feedback?.naturalness || 0), 0) / userMessages.length;
      const avgSpeed = userMessages.reduce((sum, m) => sum + (m.feedback?.speed || 0), 0) / userMessages.length;
      const avgConfidence = userMessages.reduce((sum, m) => sum + (m.feedback?.confidence || 0), 0) / userMessages.length;
      const avgDepth = userMessages.length > 0 ? conversationDepthScore / userMessages.length : 0;
      
      const progress: ConversationProgress = {
        scenario: selectedScenario,
        messagesCount: userMessages.length,
        avgNaturalness,
        avgSpeed,
        avgConfidence,
        avgDepth,
        completedAt: Date.now(),
        goals: conversationGoals
      };

      const updated = [...conversationHistory, progress];
      setConversationHistory(updated);
      localStorage.setItem("conversationHistory", JSON.stringify(updated));

      // Find 3 worst responses for replay
      const sorted = [...userMessages].sort((a, b) => {
        const scoreA = (a.feedback?.naturalness || 0) + (a.feedback?.confidence || 0);
        const scoreB = (b.feedback?.naturalness || 0) + (b.feedback?.confidence || 0);
        return scoreA - scoreB;
      });
      setWorstResponses(sorted.slice(0, 3));
      setShowReplayRewrite(true);
    }
  };

  const closeReplayAndReset = () => {
    setSelectedScenario(null);
    resetConversation();
  };

  const speakText = (text: string, force: boolean = false) => {
    if (!autoSpeakEnabled && !force) return;
    
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Try to use a native US English voice
      const voices = speechSynthesis.getVoices();
      const usVoice = voices.find(voice => 
        voice.lang === 'en-US' && voice.name.includes('Google US English')
      ) || voices.find(voice => voice.lang === 'en-US') || voices[0];
      
      if (usVoice) {
        utterance.voice = usVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("❌ Voice input not supported!\n\n✅ Please use:\n• Chrome (recommended)\n• Edge\n• Safari");
      return;
    }



    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        alert("🎤 No speech detected!\n\n✅ Try:\n• Speak louder\n• Move closer to mic\n• Check mic is working");
      } else if (event.error === 'not-allowed') {
        setShowMicHelp(true);
        alert("🎤 MICROPHONE PERMISSION DENIED!\n\n" +
              "A popup appeared asking for microphone access.\n" +
              "You need to click ALLOW (not Block)!\n\n" +
              "How to fix:\n\n" +
              "Chrome/Edge:\n" +
              "1️⃣ Look at the address bar (top)\n" +
              "2️⃣ Click the 🔒 icon (left of URL)\n" +
              "3️⃣ Find 'Microphone'\n" +
              "4️⃣ Change to 'Allow'\n" +
              "5️⃣ Reload page (F5)\n" +
              "6️⃣ Try again!\n\n" +
              "Safari:\n" +
              "1️⃣ Safari menu → Preferences\n" +
              "2️⃣ Websites tab\n" +
              "3️⃣ Microphone → Allow\n" +
              "4️⃣ Reload and try again!\n\n" +
              "💡 See the blue help banner below for more details.");
      } else if (event.error === 'audio-capture') {
        alert("🎤 Microphone not found!\n\n✅ Check:\n• Microphone is connected\n• Not used by another app\n• Works in other apps");
      } else if (event.error === 'network') {
        alert("🌐 Network error!\n\n✅ Check your internet connection");
      } else {
        alert("❌ Voice recognition error: " + event.error + "\n\nPlease try again or use text input.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error: any) {
      console.error('Failed to start recognition:', error);
      setIsListening(false);
      alert("❌ Failed to start voice input!\n\n" + 
            "Error: " + error.message + "\n\n" +
            "Please reload the page and try again.");
    }
  };

  const toggleVoiceMode = () => {
    setVoiceInputEnabled(!voiceInputEnabled);
  };

  const totalConversations = conversationHistory.length;
  const avgNaturalness = conversationHistory.length > 0 
    ? conversationHistory.reduce((sum, c) => sum + c.avgNaturalness, 0) / conversationHistory.length
    : 0;
  const avgSpeed = conversationHistory.length > 0
    ? conversationHistory.reduce((sum, c) => sum + c.avgSpeed, 0) / conversationHistory.length
    : 0;
  const avgConfidence = conversationHistory.length > 0
    ? conversationHistory.reduce((sum, c) => sum + c.avgConfidence, 0) / conversationHistory.length
    : 0;

  // Get weakest area
  const weakestArea = Array.from(weakPatterns.entries())
    .sort((a, b) => b[1].count - a[1].count)[0];

  const getActionPlan = (area: string): string => {
    const plans = {
      speed: "Do 2 speed drills: respond in 3 seconds",
      grammar: "Review grammar patterns & practice",
      vocabulary: "Learn more natural phrases & contractions",
      confidence: "Practice longer responses with details"
    };
    return plans[area as keyof typeof plans] || "Keep practicing!";
  };

  const getDepthColor = (depth: ConversationDepth) => {
    const colors = {
      surface: "text-red-400",
      developing: "text-yellow-400",
      engaging: "text-green-400",
      compelling: "text-purple-400"
    };
    return colors[depth];
  };

  const getToneEmoji = (tone: EmotionalTone) => {
    const emojis = {
      flat: "😐",
      enthusiastic: "🔥",
      confident: "💪",
      awkward: "😅"
    };
    return emojis[tone];
  };

  const getHesitationColor = (rate: "normal" | "needs-improvement" | "weak") => {
    const colors = {
      normal: "text-green-400",
      "needs-improvement": "text-yellow-400",
      weak: "text-red-400"
    };
    return colors[rate];
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <MessageCircle className="w-10 h-10 text-blue-400" />
          Adaptive Conversation Engine
        </h1>
        <p className="text-xl text-gray-300">
          Real conversations. Instant feedback. <span className="text-blue-400 font-bold">Measurable fluency gains.</span>
        </p>
      </div>

      {/* Advanced Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white text-center">
          <MessageCircle className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{totalConversations}</div>
          <div className="text-blue-100 text-sm mt-1">Conversations</div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white text-center">
          <Target className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">
            {totalConversations > 0 ? avgNaturalness.toFixed(1) : "—"}<span className="text-lg">/10</span>
          </div>
          <div className="text-green-100 text-sm mt-1">Avg Naturalness</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center">
          <Zap className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">
            {totalConversations > 0 ? avgSpeed.toFixed(1) : "—"}<span className="text-lg">/10</span>
          </div>
          <div className="text-purple-100 text-sm mt-1">Avg Speed</div>
        </div>
        <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-6 text-white text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <div className="text-xl font-bold capitalize">{weakestArea?.[0] || "None"}</div>
          <div className="text-orange-100 text-xs mt-1">Weakest Area</div>
        </div>
      </div>

      {/* Weak Patterns Alert with Action Plan */}
      {weakestArea && weakestArea[1].count >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-400/50 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-200 mb-1">🎯 Adaptive Focus Activated</h3>
              <p className="text-red-100 text-sm mb-2">
                You're struggling with <strong>{weakestArea[0]}</strong> ({weakestArea[1].count} issues detected). 
              </p>
              <div className="bg-red-500/20 rounded-lg p-3 border border-red-400/30">
                <div className="text-xs font-semibold text-red-200 mb-1">ACTION PLAN:</div>
                <div className="text-sm text-red-100">{getActionPlan(weakestArea[0])}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Replay & Rewrite Modal */}
      <AnimatePresence>
        {showReplayRewrite && worstResponses.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeReplayAndReset}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            >
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <RotateCcw className="w-8 h-8" />
                Replay & Rewrite
              </h2>

              {/* Mission Results */}
              <div className="bg-white/10 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">🎯 Mission Results</h3>
                <div className="space-y-3">
                  {conversationGoals.map((goal, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-white">{goal.description}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{goal.current}/{goal.target}</span>
                        {goal.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Worst Responses */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Your 3 responses that need improvement:</h3>
                {worstResponses.map((msg, idx) => (
                  <div key={idx} className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm text-gray-300">Response #{idx + 1}</div>
                      <div className="text-xs text-gray-400">
                        Score: {((msg.feedback?.naturalness || 0) + (msg.feedback?.confidence || 0)) / 2}/10
                      </div>
                    </div>
                    
                    <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3 mb-3">
                      <div className="text-xs text-red-200 mb-1">Your response:</div>
                      <div className="text-white">{msg.content}</div>
                    </div>

                    {msg.feedback?.upgradedVersion && (
                      <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-3">
                        <div className="text-xs text-green-200 mb-2">Native-level alternatives:</div>
                        {msg.feedback.upgradedVersion.map((upgrade, uIdx) => (
                          <div key={uIdx} className="flex items-center justify-between mb-2 last:mb-0">
                            <div className="text-white flex-1">"{upgrade}"</div>
                            <button
                              onClick={() => savePhrase(msg.content, upgrade)}
                              className="ml-2 p-1 bg-white/20 hover:bg-white/30 rounded transition-all"
                              title="Save phrase"
                            >
                              <BookmarkPlus className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 text-sm text-gray-300">
                      💡 {msg.feedback?.suggestion}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={closeReplayAndReset}
                className="w-full mt-6 px-6 py-4 bg-white text-indigo-600 hover:bg-gray-100 rounded-xl font-bold transition-all"
              >
                Done - Start New Conversation
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedScenario ? (
        <>
          {/* Quick Start Buttons */}
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={quickStartSprint}
              className="bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl p-6 text-white transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Timer className="w-8 h-8" />
                  <div className="text-left">
                    <h3 className="text-2xl font-bold">3-Min Sprint</h3>
                    <p className="text-yellow-100 text-sm">Quick practice session</p>
                  </div>
                </div>
                <Play className="w-10 h-10 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-xs text-yellow-100">Random scenario • Advanced mode • 3-4 exchanges</div>
            </button>

            <button
              onClick={quickStartWorkout}
              className="bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-xl p-6 text-white transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Flame className="w-8 h-8" />
                  <div className="text-left">
                    <h3 className="text-2xl font-bold">10-Min Workout</h3>
                    <p className="text-pink-100 text-sm">Full elite training</p>
                  </div>
                </div>
                <Play className="w-10 h-10 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-xs text-pink-100">Random scenario • Elite mode • Full conversation</div>
            </button>
          </div>

          {/* Scenario Selection */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🎯 Or Choose Your Scenario</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario.id)}
                  className="bg-white/10 hover:bg-white/20 rounded-xl p-6 transition-all text-left group relative"
                >
                  {scenario.baseInterruptionLevel > 20 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      High Pressure
                    </div>
                  )}
                  <div className="text-4xl mb-3">{scenario.icon}</div>
                  <h4 className="text-lg font-bold text-white mb-2">{scenario.title}</h4>
                  <p className="text-sm text-gray-400 mb-3">{scenario.description}</p>
                  <div className="text-xs text-gray-500">📍 {scenario.context}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Saved Phrases */}
          {savedPhrases.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-blue-400" />
                Your Saved Phrases ({savedPhrases.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                {savedPhrases.slice(-6).reverse().map((phrase, idx) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-4">
                    <div className="text-xs text-gray-400 mb-1">Instead of:</div>
                    <div className="text-sm text-red-300 mb-2">"{phrase.original}"</div>
                    <div className="text-xs text-gray-400 mb-1">Say:</div>
                    <div className="text-sm text-green-300">"{phrase.upgraded}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Graph */}
          {conversationHistory.length >= 2 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Your Fluency Progress
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-400 mb-2">Naturalness Trend</div>
                  <div className="flex items-end gap-1 h-24">
                    {conversationHistory.slice(-7).map((conv, idx) => (
                      <div key={idx} className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t" style={{ height: `${(conv.avgNaturalness / 10) * 100}%` }} />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Last {Math.min(7, conversationHistory.length)} conversations</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-2">Speed Trend</div>
                  <div className="flex items-end gap-1 h-24">
                    {conversationHistory.slice(-7).map((conv, idx) => (
                      <div key={idx} className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t" style={{ height: `${(conv.avgSpeed / 10) * 100}%` }} />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Last {Math.min(7, conversationHistory.length)} conversations</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-2">Confidence Trend</div>
                  <div className="flex items-end gap-1 h-24">
                    {conversationHistory.slice(-7).map((conv, idx) => (
                      <div key={idx} className="flex-1 bg-gradient-to-t from-green-500 to-emerald-500 rounded-t" style={{ height: `${(conv.avgConfidence / 10) * 100}%` }} />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Last {Math.min(7, conversationHistory.length)} conversations</div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : !conversationStarted ? (
        <>
          {/* Setup Screen */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {scenarios.find(s => s.id === selectedScenario)?.icon} {scenarios.find(s => s.id === selectedScenario)?.title}
                </h2>
                <p className="text-indigo-100">{scenarios.find(s => s.id === selectedScenario)?.description}</p>
              </div>
              <button
                onClick={() => setSelectedScenario(null)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
              >
                Change
              </button>
            </div>

            {/* Settings */}
            <div className="space-y-6">
              {/* Timer Level */}
              <div>
                <h3 className="text-lg font-semibold mb-3">⚡ Response Timer & Features</h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTimerLevel("beginner")}
                    className={`p-4 rounded-xl transition-all ${
                      timerLevel === "beginner"
                        ? "bg-white text-indigo-600 shadow-lg"
                        : "bg-white/20 hover:bg-white/30"
                    }`}
                  >
                    <div className="font-bold">10 sec</div>
                    <div className="text-xs mt-1 opacity-80">Beginner</div>
                    <div className="text-xs mt-2">Basic feedback</div>
                  </button>
                  <button
                    onClick={() => setTimerLevel("advanced")}
                    className={`p-4 rounded-xl transition-all ${
                      timerLevel === "advanced"
                        ? "bg-white text-indigo-600 shadow-lg"
                        : "bg-white/20 hover:bg-white/30"
                    }`}
                  >
                    <div className="font-bold">7 sec</div>
                    <div className="text-xs mt-1 opacity-80">Advanced</div>
                    <div className="text-xs mt-2">+ Goals & Challenges</div>
                  </button>
                  <button
                    onClick={() => setTimerLevel("elite")}
                    className={`p-4 rounded-xl transition-all ${
                      timerLevel === "elite"
                        ? "bg-white text-indigo-600 shadow-lg"
                        : "bg-white/20 hover:bg-white/30"
                    }`}
                  >
                    <div className="font-bold">5 sec</div>
                    <div className="text-xs mt-1 opacity-80">Elite</div>
                    <div className="text-xs mt-2">+ Interruptions</div>
                  </button>
                </div>
              </div>

              {/* Feature Preview */}
              <div className="bg-white/10 rounded-xl p-4">
                <h3 className="text-sm font-semibold mb-3">🔥 Active Features</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>8-metric instant feedback (naturalness, grammar, speed, confidence, tone, depth, hesitations)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Smart hesitation tracking (differentiates natural fillers vs blocking hesitations)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Follow-up pressure for short responses</span>
                  </div>
                  {timerLevel === "advanced" || timerLevel === "elite" ? (
                    <>
                      <div className="flex items-center gap-2 text-yellow-300">
                        <Target className="w-4 h-4" />
                        <span>Goal-based missions (contractions, questions, phrasal verbs)</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-300">
                        <Zap className="w-4 h-4" />
                        <span>Micro-challenges during conversation</span>
                      </div>
                    </>
                  ) : null}
                  {timerLevel === "elite" ? (
                    <div className="flex items-center gap-2 text-red-300">
                      <Flame className="w-4 h-4" />
                      <span>Adaptive AI interruptions (realistic chaos!)</span>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2 text-green-300">
                    <RotateCcw className="w-4 h-4" />
                    <span>Replay & Rewrite after conversation</span>
                  </div>
                </div>
              </div>

              {/* Common Phrases Preview */}
              <div className="bg-white/10 rounded-xl p-4">
                <h3 className="text-sm font-semibold mb-3">💡 Useful Phrases for This Scenario</h3>
                <div className="flex flex-wrap gap-2">
                  {scenarios.find(s => s.id === selectedScenario)?.commonPhrases.map((phrase, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/20 rounded-full text-xs">
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={startConversation}
              className="w-full mt-6 px-6 py-4 bg-white text-indigo-600 hover:bg-gray-100 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-6 h-6" />
              Start Conversation
            </button>
          </motion.div>
        </>
      ) : (
        <>
          {/* Active Conversation */}
          <div className="space-y-6">
            {/* Header Bar */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{scenarios.find(s => s.id === selectedScenario)?.icon}</div>
                <div>
                  <h3 className="font-bold text-white">{scenarios.find(s => s.id === selectedScenario)?.title}</h3>
                  <p className="text-xs text-gray-400">
                    Messages: {messages.filter(m => m.role === "user").length}
                    {sessionDuration === "sprint" && ` • Sprint: ${Math.floor((180 - sessionTimeElapsed) / 60)}:${String((180 - sessionTimeElapsed) % 60).padStart(2, '0')} left`}
                    {sessionDuration === "workout" && ` • Workout: ${Math.floor((600 - sessionTimeElapsed) / 60)}:${String((600 - sessionTimeElapsed) % 60).padStart(2, '0')} left`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isSpeaking && (
                  <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/50 px-4 py-2 rounded-full">
                    <Volume2 className="w-5 h-5 text-green-400 animate-pulse" />
                    <span className="text-sm font-bold text-green-300">AI Speaking...</span>
                  </div>
                )}

                {timerActive && (
                  <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/50 px-4 py-2 rounded-full">
                    <Clock className="w-5 h-5 text-red-400" />
                    <span className="text-2xl font-bold text-white">{timeLeft}s</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setAutoSpeakEnabled(!autoSpeakEnabled)}
                  className={`p-2 rounded-lg transition-all ${
                    autoSpeakEnabled 
                      ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300' 
                      : 'bg-white/10 hover:bg-white/20 text-gray-300'
                  }`}
                  title={autoSpeakEnabled ? "Auto-speak ON" : "Auto-speak OFF"}
                >
                  <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                </button>
                <button
                  onClick={resetConversation}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                  title="Restart"
                >
                  <RotateCcw className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={endConversation}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all"
                >
                  End
                </button>
              </div>
            </div>

            {/* Mission Goals */}
            {conversationGoals.length > 0 && (
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4">
                <h3 className="text-sm font-bold text-white mb-3">🎯 Mission Goals</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {conversationGoals.map((goal, idx) => (
                    <div key={idx} className={`bg-white/10 rounded-lg p-3 ${goal.completed ? 'border-2 border-green-400' : ''}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white font-semibold">{goal.current}/{goal.target}</span>
                        {goal.completed && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                      </div>
                      <div className="text-xs text-white opacity-90">{goal.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Micro-Challenge Alert */}
            <AnimatePresence>
              {currentMicroChallenge && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-4 flex items-center gap-3"
                >
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <div>
                    <div className="font-bold text-yellow-200">Micro-Challenge</div>
                    <div className="text-white">{currentMicroChallenge}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 min-h-[400px] max-h-[500px] overflow-y-auto space-y-4">
              <AnimatePresence>
                {messages.map((message, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "ai" && (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-md p-4 rounded-xl ${
                        message.role === "ai"
                          ? message.interrupted 
                            ? "bg-orange-500/30 border border-orange-400/50 text-white"
                            : "bg-blue-500/20 border border-blue-400/50 text-white"
                          : "bg-green-500/20 border border-green-400/50 text-white"
                      }`}
                    >
                      {message.interrupted && (
                        <div className="text-xs text-orange-300 mb-1 font-semibold">⚡ INTERRUPTION!</div>
                      )}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p>{message.content}</p>
                        {message.role === "ai" && (
                          <button
                            onClick={() => speakText(message.content, true)}
                            className="p-1 hover:bg-white/20 rounded"
                            title="Speak again"
                          >
                            <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-green-400 animate-pulse' : ''}`} />
                          </button>
                        )}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isAiTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Enhanced Feedback Panel */}
            <AnimatePresence>
              {showFeedback && currentFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white"
                >
                  <h3 className="text-lg font-bold mb-4">📊 Elite Feedback Analysis</h3>
                  
                  {responseStartTime && (
                    <div className="bg-white/10 rounded-lg px-4 py-2 mb-4 text-center">
                      <span className="text-sm opacity-80">Response time: </span>
                      <span className="text-lg font-bold">
                        {((Date.now() - responseStartTime) / 1000).toFixed(1)}s
                      </span>
                      {((Date.now() - responseStartTime) / 1000) <= 3 && <span className="ml-2">⚡ Lightning fast!</span>}
                      {((Date.now() - responseStartTime) / 1000) > 7 && <span className="ml-2">🐌 Too slow</span>}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm opacity-80 mb-1">Naturalness</div>
                      <div className="text-3xl font-bold">{currentFeedback.naturalness}/10</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-80 mb-1">Grammar</div>
                      <div className="text-3xl font-bold">{currentFeedback.grammar}/10</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-80 mb-1">Speed</div>
                      <div className="text-3xl font-bold">{currentFeedback.speed}/10</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-80 mb-1">Confidence</div>
                      <div className="text-3xl font-bold">{currentFeedback.confidence}/10</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <div className="text-xs opacity-80 mb-1">Tone</div>
                      <div className="text-2xl">{getToneEmoji(currentFeedback.emotionalTone)}</div>
                      <div className="text-xs mt-1 capitalize">{currentFeedback.emotionalTone}</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <div className="text-xs opacity-80 mb-1">Depth</div>
                      <div className={`text-2xl font-bold ${getDepthColor(currentFeedback.conversationDepth)}`}>
                        {currentFeedback.conversationDepth === "surface" ? "🔴" :
                         currentFeedback.conversationDepth === "developing" ? "🟡" :
                         currentFeedback.conversationDepth === "engaging" ? "🟢" : "🟣"}
                      </div>
                      <div className="text-xs mt-1 capitalize">{currentFeedback.conversationDepth}</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                      <div className="text-xs opacity-80 mb-1">Hesitations</div>
                      <div className={`text-2xl font-bold ${getHesitationColor(currentFeedback.hesitationRate)}`}>
                        {currentFeedback.hesitationCount}
                      </div>
                      <div className="text-xs mt-1 capitalize">{currentFeedback.hesitationRate.replace('-', ' ')}</div>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold mb-1">Suggestion:</div>
                        <p className="text-sm opacity-90">{currentFeedback.suggestion}</p>
                      </div>
                    </div>
                  </div>

                  {currentFeedback.microChallenge && (
                    <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">{currentFeedback.microChallenge}</span>
                      </div>
                    </div>
                  )}

                  {currentFeedback.upgradedVersion && (
                    <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-semibold mb-2">More natural options:</div>
                          <div className="space-y-1">
                            {currentFeedback.upgradedVersion.map((option, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-white/10 rounded px-3 py-1">
                                <div className="text-sm">"{option}"</div>
                                <button
                                  onClick={() => {
                                    const lastUserMsg = messages.filter(m => m.role === "user").slice(-1)[0];
                                    if (lastUserMsg) {
                                      savePhrase(lastUserMsg.content, option);
                                    }
                                  }}
                                  className="ml-2 p-1 hover:bg-white/20 rounded transition-all"
                                  title="Save phrase"
                                >
                                  <BookmarkPlus className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex gap-3">
                <button
                  onClick={startVoiceInput}
                  disabled={showFeedback || isAiTyping || isListening}
                  className={`p-3 rounded-lg font-bold transition-all flex items-center justify-center ${
                    isListening 
                      ? 'bg-red-600 animate-pulse' 
                      : 'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed'
                  } text-white`}
                  title="Speak your response"
                >
                  <Mic2 className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={isListening ? "🎙️ Listening..." : "Type or speak your response..."}
                  disabled={showFeedback || isAiTyping || isListening}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40 disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!userInput.trim() || showFeedback || isAiTyping}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-400 text-center">
                {isListening ? "🎙️ Listening... Speak now!" : 
                 timerActive ? `⚡ Respond in ${timeLeft} seconds!` : 
                 showFeedback ? "Reading feedback..." : 
                 "Type, speak (🎤), or press Enter"}
              </div>
            </div>

            {/* Microphone Help Banner */}
            {showMicHelp && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-600 border-2 border-blue-400 rounded-xl p-4 relative"
              >
                <button
                  onClick={() => setShowMicHelp(false)}
                  className="absolute top-2 right-2 text-white hover:bg-white/20 rounded p-1 text-xl"
                >
                  ✕
                </button>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">🎤</div>
                    <div className="flex-1 text-white">
                      <h4 className="font-bold text-xl mb-2">🚫 Microphone Permission Denied</h4>
                      <div className="bg-yellow-500 text-yellow-900 rounded-lg px-3 py-2 text-sm font-semibold mb-3">
                        ⚠️ When you clicked 🎤, a popup asked for microphone access. You clicked "Block" or dismissed it.
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4 text-white">
                    <p className="font-bold mb-2">✅ HOW TO FIX (30 seconds):</p>
                    <ol className="list-decimal list-inside space-y-2 ml-2 text-sm">
                      <li className="font-semibold">Look at the <span className="bg-white/20 px-2 py-0.5 rounded">top of your browser</span> (address bar)</li>
                      <li className="font-semibold">Find the <span className="text-2xl">🔒</span> icon (left of the URL)</li>
                      <li className="font-semibold">Click it → You'll see "Microphone"</li>
                      <li className="font-semibold">Change from <span className="bg-red-500 px-2 py-0.5 rounded">"Block"</span> to <span className="bg-green-500 px-2 py-0.5 rounded">"Allow"</span></li>
                      <li className="font-semibold">Press <span className="bg-white/20 px-2 py-0.5 rounded font-mono">F5</span> to reload the page</li>
                      <li className="font-semibold">Click the 🎤 button again</li>
                      <li className="font-semibold">This time click <span className="bg-green-500 px-2 py-0.5 rounded">"ALLOW"</span> when the popup appears! ✅</li>
                    </ol>
                  </div>

                  <div className="flex gap-3 text-sm">
                    <div className="flex-1 bg-purple-700 rounded-lg p-3">
                      <p className="font-bold mb-1">💻 Chrome/Edge</p>
                      <p className="text-xs">🔒 icon → Microphone → Allow → F5</p>
                    </div>
                    <div className="flex-1 bg-purple-700 rounded-lg p-3">
                      <p className="font-bold mb-1">🧭 Safari</p>
                      <p className="text-xs">Safari menu → Preferences → Websites → Microphone → Allow</p>
                    </div>
                  </div>

                  <div className="border-t border-white/30 pt-3 space-y-2 text-sm">
                    <p className="opacity-90">
                      📖 <span className="font-semibold">Still not working?</span> Check <span className="font-mono bg-white/20 px-2 py-0.5 rounded">/MICROPHONE_FIX.md</span> for screenshots and detailed browser-specific instructions.
                    </p>
                    <p className="opacity-90">
                      💡 <span className="font-semibold">Want to skip voice?</span> Just type your responses! The AI will still speak to you. 🔊
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </>
      )}

      {/* Tips */}
      {!conversationStarted && (
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-3">🚀 Elite Training Features</h3>
              <ul className="space-y-2 text-cyan-100 text-sm">
                <li>• <strong>Goal-Based Missions</strong> - Complete specific objectives each conversation</li>
                <li>• <strong>Smart Hesitation Tracking</strong> - Differentiates natural fillers from blocking hesitations</li>
                <li>• <strong>Adaptive Interruptions</strong> - Increases based on your performance (Elite mode)</li>
                <li>• <strong>Replay & Rewrite</strong> - Review your 3 worst responses with native alternatives</li>
                <li>• <strong>Personal Phrase Bank</strong> - Save and review upgraded phrases</li>
                <li>• <strong>Weekly Progress Graphs</strong> - Track naturalness, speed, confidence over time</li>
                <li>• <strong>Measurable Gains</strong> - Speak faster & more naturally in 7 days</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
