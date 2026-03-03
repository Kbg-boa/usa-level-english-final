import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Headphones, Play, Pause, RotateCcw, Volume2, CheckCircle2, XCircle, Gauge, TrendingUp, Award, Filter, Clock, Zap, BookOpen, MessageCircle, AlertCircle } from "lucide-react";

type ContentType = "podcast" | "conversation" | "accent" | "slang" | "movie";
type Accent = "neutral" | "new-york" | "texas" | "california" | "boston";
type Speed = 0.75 | 1.0 | 1.25 | 1.5;
type Difficulty = "beginner" | "intermediate" | "advanced" | "native";

interface ListeningContent {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  accent: Accent;
  difficulty: Difficulty;
  duration: number; // seconds
  transcript: string;
  audioSimulation: string; // Simulated audio text
  questions: Question[];
  vocabulary: string[];
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ListeningProgress {
  contentId: string;
  completed: boolean;
  score: number;
  speed: Speed;
  completedAt: number;
}

export default function ListeningComprehension() {
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [selectedContent, setSelectedContent] = useState<ListeningContent | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<Speed>(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, number>>(new Map());
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState<ListeningProgress[]>([]);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [audioSupported, setAudioSupported] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check audio support and load voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setAudioSupported(false);
      setAudioError("Your browser doesn't support text-to-speech. Please use Chrome, Edge, or Safari.");
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        setVoicesLoaded(true);
        console.log('Voices loaded:', availableVoices.length, 'voices available');
      }
    };

    // Try loading immediately
    loadVoices();

    // Also listen for voiceschanged event (needed for some browsers)
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Fallback: try loading after a delay
    const timeout = setTimeout(loadVoices, 100);

    return () => {
      clearTimeout(timeout);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem("listeningProgress");
    if (saved) {
      setProgress(JSON.parse(saved));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Playback timer
  useEffect(() => {
    if (isPlaying && selectedContent) {
      progressIntervalRef.current = setInterval(() => {
        setPlaybackProgress(prev => {
          const newProgress = prev + (currentSpeed / 10);
          const duration = selectedContent.duration;
          
          if (newProgress >= 100) {
            setIsPlaying(false);
            return 100;
          }
          
          return newProgress;
        });
      }, 100);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, currentSpeed, selectedContent]);

  const listeningContents: ListeningContent[] = [
    // PODCASTS
    {
      id: "podcast-1",
      type: "podcast",
      title: "Joe Rogan Style: Tech & Innovation",
      description: "Casual deep-dive conversation about AI and future tech",
      accent: "neutral",
      difficulty: "intermediate",
      duration: 180,
      transcript: `Host: "Dude, AI is absolutely insane right now. Like, have you seen what ChatGPT can do? It's crazy!"\n\nGuest: "Oh man, totally! I mean, the thing is, we're at this inflection point where AI is gonna change literally everything. Like, you know, people don't realize how fast this is moving."\n\nHost: "For real! So what do you think about the whole job automation thing? Should people be worried?"\n\nGuest: "Well, here's the thing... I think people should be aware, but not scared. You know what I mean? Like, yeah, some jobs will change, but new opportunities are gonna pop up. That's always been the case with technology."\n\nHost: "That's a great point. I never thought about it that way..."`,
      audioSimulation: "Natural podcast-style conversation with casual American accent, relaxed pace, frequent use of 'like', 'you know', 'dude'",
      questions: [
        {
          id: "q1",
          question: "What is the main topic of the conversation?",
          options: ["Sports", "AI and technology", "Politics", "Movies"],
          correctAnswer: 1,
          explanation: "They're discussing AI, ChatGPT, and job automation - clearly about technology."
        },
        {
          id: "q2",
          question: "How does the guest feel about job automation?",
          options: ["Very worried", "Completely against it", "Aware but optimistic", "Doesn't care"],
          correctAnswer: 2,
          explanation: "The guest says 'people should be aware, but not scared' and mentions new opportunities."
        },
        {
          id: "q3",
          question: "Which filler words are used frequently?",
          options: ["Actually, basically", "Like, you know", "Um, uh", "Well, so"],
          correctAnswer: 1,
          explanation: "The conversation uses 'like' and 'you know' multiple times - typical casual American speech."
        }
      ],
      vocabulary: ["inflection point", "automation", "pop up", "the thing is", "for real"]
    },
    {
      id: "podcast-2",
      type: "podcast",
      title: "Business Podcast: Startup Success",
      description: "Professional discussion about building a tech startup",
      accent: "neutral",
      difficulty: "advanced",
      duration: 240,
      transcript: `Interviewer: "So walk me through how you scaled from zero to a million users in just 18 months."\n\nFounder: "Yeah, so the key was really understanding our core metrics from day one. We were laser-focused on retention, not just acquisition. A lot of startups make that mistake."\n\nInterviewer: "That's interesting. Can you elaborate on that?"\n\nFounder: "Sure. So basically, we built a really tight feedback loop with our early users. We'd ship features, measure impact, and iterate quickly. Like, we were deploying updates daily at some points."\n\nInterviewer: "What was your biggest challenge during that growth phase?"\n\nFounder: "Honestly? Hiring. Scaling a team is way harder than scaling technology. You need people who can operate in chaos but still execute at a high level."`,
      audioSimulation: "Professional podcast tone, clear articulation, business terminology, moderate pace",
      questions: [
        {
          id: "q1",
          question: "What did the founder focus on instead of just user acquisition?",
          options: ["Marketing", "Retention", "Fundraising", "Competition"],
          correctAnswer: 1,
          explanation: "The founder explicitly states they were 'laser-focused on retention, not just acquisition.'"
        },
        {
          id: "q2",
          question: "What was the founder's biggest challenge?",
          options: ["Technology", "Funding", "Hiring", "Marketing"],
          correctAnswer: 2,
          explanation: "The founder says 'Honestly? Hiring. Scaling a team is way harder than scaling technology.'"
        },
        {
          id: "q3",
          question: "How often were they deploying updates at peak?",
          options: ["Weekly", "Daily", "Monthly", "Hourly"],
          correctAnswer: 1,
          explanation: "The founder mentions 'we were deploying updates daily at some points.'"
        }
      ],
      vocabulary: ["scaled", "laser-focused", "retention", "acquisition", "iterate", "deploy", "execute"]
    },

    // CONVERSATIONS
    {
      id: "convo-1",
      type: "conversation",
      title: "Fast-Paced Friend Chat",
      description: "Two friends catching up quickly",
      accent: "neutral",
      difficulty: "intermediate",
      duration: 90,
      transcript: `Mike: "Yo! How've you been? Haven't seen you in forever!"\n\nSarah: "I know, right?! I've been crazy busy with work. How about you?"\n\nMike: "Same! Actually, I just started a new job last month. It's been pretty intense, but I'm loving it."\n\nSarah: "Oh nice! What are you doing now?"\n\nMike: "I'm in product management at a tech startup. Basically running the roadmap for our mobile app."\n\nSarah: "That's awesome! We should grab coffee soon and you can tell me all about it."\n\nMike: "For sure! How's next week looking for you?"\n\nSarah: "Tuesday afternoon works for me!"\n\nMike: "Perfect! I'll text you the details."`,
      audioSimulation: "Natural fast-paced conversation between friends, overlapping speech, casual tone",
      questions: [
        {
          id: "q1",
          question: "When did Mike start his new job?",
          options: ["Last week", "Last month", "Last year", "Yesterday"],
          correctAnswer: 1,
          explanation: "Mike says 'I just started a new job last month.'"
        },
        {
          id: "q2",
          question: "What does Mike do in his new role?",
          options: ["Software engineer", "Product manager", "Sales", "Marketing"],
          correctAnswer: 1,
          explanation: "Mike says he's in 'product management' and runs the roadmap."
        },
        {
          id: "q3",
          question: "When are they planning to meet?",
          options: ["Monday", "Tuesday afternoon", "Wednesday", "Friday"],
          correctAnswer: 1,
          explanation: "Sarah says 'Tuesday afternoon works for me!'"
        }
      ],
      vocabulary: ["catch up", "crazy busy", "intense", "grab coffee", "roadmap"]
    },

    // ACCENTS
    {
      id: "accent-ny",
      type: "accent",
      title: "New York Accent: Coffee Shop",
      description: "Typical New York conversation ordering coffee",
      accent: "new-york",
      difficulty: "intermediate",
      duration: 60,
      transcript: `Customer: "Yeah, lemme get a cawfee, regular, and a bagel with cream cheese."\n\nBarista: "You want that toasted?"\n\nCustomer: "Yeah, toast it. And make the cawfee light and sweet."\n\nBarista: "Alright, that'll be seven bucks."\n\nCustomer: "Here ya go. Keep the change."\n\nBarista: "Thanks! It'll be ready in a minute."`,
      audioSimulation: "Strong New York accent, fast pace, 'cawfee' pronunciation, dropped R sounds",
      questions: [
        {
          id: "q1",
          question: "How does the customer pronounce 'coffee'?",
          options: ["Coffee", "Cawfee", "Koffee", "Cahfee"],
          correctAnswer: 1,
          explanation: "Classic New York accent pronounces it as 'cawfee'"
        },
        {
          id: "q2",
          question: "What does the customer order with the bagel?",
          options: ["Butter", "Cream cheese", "Jam", "Nothing"],
          correctAnswer: 1,
          explanation: "Customer orders 'a bagel with cream cheese'"
        },
        {
          id: "q3",
          question: "How much does it cost?",
          options: ["$5", "$7", "$10", "$3"],
          correctAnswer: 1,
          explanation: "Barista says 'that'll be seven bucks'"
        }
      ],
      vocabulary: ["lemme get", "regular", "light and sweet", "toast it", "bucks"]
    },
    {
      id: "accent-texas",
      type: "accent",
      title: "Texas Accent: Gas Station",
      description: "Southern hospitality and Texas drawl",
      accent: "texas",
      difficulty: "intermediate",
      duration: 75,
      transcript: `Attendant: "Howdy! What can I do for ya today?"\n\nCustomer: "Hey there! I need to fill 'er up, and I'll take a sweet tea too."\n\nAttendant: "You got it! Y'all passin' through or you from around here?"\n\nCustomer: "Just passin' through, headed down to Austin."\n\nAttendant: "Oh nice! Y'all have a safe trip now, ya hear?"\n\nCustomer: "Will do! Thanks a bunch!"`,
      audioSimulation: "Texas drawl, elongated vowels, y'all usage, friendly Southern tone",
      questions: [
        {
          id: "q1",
          question: "What greeting does the attendant use?",
          options: ["Hello", "Hey", "Howdy", "Hi"],
          correctAnswer: 2,
          explanation: "'Howdy' is the classic Texas/Southern greeting"
        },
        {
          id: "q2",
          question: "What does the customer order to drink?",
          options: ["Coffee", "Soda", "Sweet tea", "Water"],
          correctAnswer: 2,
          explanation: "Customer says 'I'll take a sweet tea' - classic Southern drink"
        },
        {
          id: "q3",
          question: "Which word is used for 'you all'?",
          options: ["You guys", "Y'all", "Yous", "Everyone"],
          correctAnswer: 1,
          explanation: "'Y'all' is the Texas/Southern way to say 'you all'"
        }
      ],
      vocabulary: ["howdy", "fill 'er up", "y'all", "passin' through", "ya hear", "thanks a bunch"]
    },

    // SLANG
    {
      id: "slang-1",
      type: "slang",
      title: "Modern American Slang",
      description: "Teenagers and young adults using current slang",
      accent: "neutral",
      difficulty: "advanced",
      duration: 120,
      transcript: `Jake: "Yo, that party last night was lit!"\n\nEmma: "Facts! The vibes were immaculate. And the food? Chef's kiss!"\n\nJake: "For real though! And did you see Marcus? Dude was wildin' on the dance floor."\n\nEmma: "Haha yeah! He was going crazy! But honestly, it was a vibe. No cap."\n\nJake: "Bet. We should hit up another spot this weekend."\n\nEmma: "I'm down! Just text me the deets when you know."\n\nJake: "Say less!"`,
      audioSimulation: "Young American slang, energetic tone, modern expressions, Gen Z/Millennial vocabulary",
      questions: [
        {
          id: "q1",
          question: "What does 'lit' mean in this context?",
          options: ["Well-lit", "Amazing/exciting", "On fire", "Boring"],
          correctAnswer: 1,
          explanation: "'Lit' is slang for amazing, exciting, or really fun"
        },
        {
          id: "q2",
          question: "What does 'no cap' mean?",
          options: ["No hat", "No lying/for real", "Don't cover", "No limit"],
          correctAnswer: 1,
          explanation: "'No cap' means 'no lie' or 'for real' - it's emphasizing truth"
        },
        {
          id: "q3",
          question: "What does 'say less' mean?",
          options: ["Be quiet", "I understand/I'm in", "Talk more", "Maybe"],
          correctAnswer: 1,
          explanation: "'Say less' means 'I understand, you don't need to explain more, I'm in!'"
        }
      ],
      vocabulary: ["lit", "facts", "vibes", "immaculate", "chef's kiss", "wildin'", "no cap", "bet", "deets", "say less"]
    },

    // MOVIE CLIPS
    {
      id: "movie-1",
      type: "movie",
      title: "Office Scene: Heated Negotiation",
      description: "Dramatic business negotiation scene",
      accent: "neutral",
      difficulty: "advanced",
      duration: 150,
      transcript: `Boss: "Look, I'm gonna level with you. The board is not happy with these numbers."\n\nManager: "I understand that, but given the market conditions—"\n\nBoss: "I don't want excuses. I want results. You told me Q3 would be different."\n\nManager: "And it will be! We've got three major deals closing this month. I just need a little more time."\n\nBoss: "Time is exactly what we don't have. Corporate is breathing down my neck. Either you turn this around, or I'm gonna have to make some tough decisions."\n\nManager: "Give me two weeks. Two weeks and I'll show you exactly what this team can do."\n\nBoss: "Two weeks. That's all you get. Don't make me regret this."`,
      audioSimulation: "Intense dramatic tone, professional vocabulary, confrontational but controlled",
      questions: [
        {
          id: "q1",
          question: "What is the boss unhappy about?",
          options: ["The office", "The numbers/results", "The team", "The schedule"],
          correctAnswer: 1,
          explanation: "Boss says 'The board is not happy with these numbers'"
        },
        {
          id: "q2",
          question: "How much time does the manager ask for?",
          options: ["One week", "Two weeks", "One month", "Three weeks"],
          correctAnswer: 1,
          explanation: "Manager says 'Give me two weeks'"
        },
        {
          id: "q3",
          question: "What does 'breathing down my neck' mean?",
          options: ["Physically close", "Putting pressure on", "Helping", "Ignoring"],
          correctAnswer: 1,
          explanation: "'Breathing down my neck' means putting pressure on someone, constantly monitoring/demanding"
        }
      ],
      vocabulary: ["level with you", "board", "market conditions", "closing deals", "breathing down my neck", "turn this around"]
    }
  ];

  const contentsByType = (type: ContentType) => 
    listeningContents.filter(c => c.type === type);

  // Get American English voice
  const getAmericanVoice = () => {
    if (voices.length === 0) return null;
    
    // Priority order: Google US English > Microsoft Zira > any en-US voice
    const americanVoice = 
      voices.find(v => v.name.includes('Google US English')) ||
      voices.find(v => v.name.includes('Microsoft Zira')) ||
      voices.find(v => v.name.includes('Samantha')) || // macOS
      voices.find(v => v.name.includes('David')) || // macOS
      voices.find(v => v.lang === 'en-US') ||
      voices.find(v => v.lang.startsWith('en'));
    
    return americanVoice || voices[0];
  };

  // Play audio using Speech Synthesis
  const playAudio = () => {
    if (!selectedContent || !audioSupported) {
      console.error('Cannot play audio: content or support missing');
      return;
    }

    try {
      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();
      
      // Wait a bit for cancel to complete
      setTimeout(() => {
        const text = selectedContent.transcript.replace(/\\n/g, '. ');
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Get voice
        const voice = getAmericanVoice();
        if (voice) {
          utterance.voice = voice;
          console.log('Using voice:', voice.name, voice.lang);
        } else {
          console.warn('No specific voice found, using default');
        }
        
        // Set utterance properties
        utterance.lang = 'en-US';
        utterance.rate = currentSpeed;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Event handlers
        utterance.onstart = () => {
          console.log('Speech started');
          setIsPlaying(true);
          setPlaybackProgress(0);
          setAudioError(null);
        };

        utterance.onend = () => {
          console.log('Speech ended');
          setIsPlaying(false);
          setPlaybackProgress(100);
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsPlaying(false);
          
          // Provide user-friendly error messages
          if (event.error === 'canceled') {
            // This is normal, user stopped it
            setAudioError(null);
          } else if (event.error === 'not-allowed') {
            setAudioError('Audio blocked. Please check your browser permissions.');
          } else if (event.error === 'network') {
            setAudioError('Network error. Please check your connection.');
          } else {
            setAudioError(`Audio error: ${event.error}. Try refreshing the page.`);
          }
        };

        utterance.onpause = () => {
          console.log('Speech paused');
        };

        utterance.onresume = () => {
          console.log('Speech resumed');
        };

        // Save utterance and speak
        setCurrentUtterance(utterance);
        window.speechSynthesis.speak(utterance);
        console.log('Speech queued');
      }, 100);
      
    } catch (error) {
      console.error('Error creating speech:', error);
      setIsPlaying(false);
      setAudioError('Failed to create audio. Please try again.');
    }
  };

  // Stop audio
  const stopAudio = () => {
    try {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setAudioError(null);
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  // Update speech rate when speed changes
  useEffect(() => {
    if (isPlaying && currentUtterance) {
      // Restart with new speed
      stopAudio();
      playAudio();
    }
  }, [currentSpeed]);

  // Toggle play/pause
  const togglePlay = () => {
    if (!selectedContent) return;
    
    if (isPlaying) {
      // Pause
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (playbackProgress >= 100 || playbackProgress === 0) {
        // Start from beginning
        playAudio();
      } else {
        // Resume
        window.speechSynthesis.resume();
        setIsPlaying(true);
      }
    }
  };

  const resetPlayback = () => {
    stopAudio();
    setPlaybackProgress(0);
  };

  const selectAnswer = (questionId: string, answerIndex: number) => {
    const newAnswers = new Map(selectedAnswers);
    newAnswers.set(questionId, answerIndex);
    setSelectedAnswers(newAnswers);
  };

  const submitQuiz = () => {
    if (!selectedContent) return;

    const correctCount = selectedContent.questions.reduce((count, question) => {
      const userAnswer = selectedAnswers.get(question.id);
      return userAnswer === question.correctAnswer ? count + 1 : count;
    }, 0);

    const score = Math.round((correctCount / selectedContent.questions.length) * 100);

    const newProgress: ListeningProgress = {
      contentId: selectedContent.id,
      completed: true,
      score,
      speed: currentSpeed,
      completedAt: Date.now()
    };

    const updatedProgress = [...progress.filter(p => p.contentId !== selectedContent.id), newProgress];
    setProgress(updatedProgress);
    localStorage.setItem("listeningProgress", JSON.stringify(updatedProgress));

    setShowResults(true);
  };

  const resetContent = () => {
    setSelectedContent(null);
    setSelectedType(null);
    setCurrentSpeed(1.0);
    setIsPlaying(false);
    setShowTranscript(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Map());
    setShowResults(false);
    setPlaybackProgress(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCompletedCount = () => {
    return progress.filter(p => p.completed).length;
  };

  const getAverageScore = () => {
    if (progress.length === 0) return 0;
    const total = progress.reduce((sum, p) => sum + p.score, 0);
    return Math.round(total / progress.length);
  };

  const contentTypes = [
    { type: "podcast" as ContentType, icon: "🎙️", title: "Podcasts", desc: "American-style casual & business podcasts", count: contentsByType("podcast").length },
    { type: "conversation" as ContentType, icon: "💬", title: "Conversations", desc: "Real-life fast-paced dialogues", count: contentsByType("conversation").length },
    { type: "accent" as ContentType, icon: "🗣️", title: "Accents", desc: "NY, Texas, California variations", count: contentsByType("accent").length },
    { type: "slang" as ContentType, icon: "🔥", title: "Slang", desc: "Modern American slang in context", count: contentsByType("slang").length },
    { type: "movie" as ContentType, icon: "🎬", title: "Movie Clips", desc: "Dramatic scenes & dialogues", count: contentsByType("movie").length }
  ];

  const speedOptions: Speed[] = [0.75, 1.0, 1.25, 1.5];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Headphones className="w-10 h-10 text-purple-400" />
          Listening Comprehension
        </h1>
        <p className="text-xl text-gray-300">
          Master American English listening. <span className="text-purple-400 font-bold">Understand natives at full speed.</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{getCompletedCount()}</div>
          <div className="text-purple-100 text-sm mt-1">Completed</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white text-center">
          <Award className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">
            {progress.length > 0 ? getAverageScore() : "—"}<span className="text-lg">%</span>
          </div>
          <div className="text-blue-100 text-sm mt-1">Avg Score</div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{listeningContents.length}</div>
          <div className="text-green-100 text-sm mt-1">Total Content</div>
        </div>
      </div>

      {!selectedType ? (
        <>
          {/* Content Type Selection */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🎧 Choose Content Type</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentTypes.map((ct) => (
                <button
                  key={ct.type}
                  onClick={() => setSelectedType(ct.type)}
                  className="bg-white/10 hover:bg-white/20 rounded-xl p-6 transition-all text-left group"
                >
                  <div className="text-4xl mb-3">{ct.icon}</div>
                  <h4 className="text-lg font-bold text-white mb-2">{ct.title}</h4>
                  <p className="text-sm text-gray-400 mb-3">{ct.desc}</p>
                  <div className="text-xs text-gray-500">{ct.count} exercises</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
            <div className="flex items-start gap-3">
              <Headphones className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-3">🚀 How to Practice Effectively</h3>
                <ul className="space-y-2 text-purple-100 text-sm">
                  <li>• <strong>Listen without transcript first</strong> - Test real comprehension</li>
                  <li>• <strong>Start at 0.75x speed</strong> - Build up to 1.5x native pace</li>
                  <li>• <strong>Focus on context clues</strong> - You don't need every word</li>
                  <li>• <strong>Repeat difficult sections</strong> - Train your ear</li>
                  <li>• <strong>Learn the slang & fillers</strong> - That's how Americans really talk</li>
                  <li>• <strong>Practice daily 15 minutes</strong> - Consistency beats long sessions</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : !selectedContent ? (
        <>
          {/* Content Selection */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {contentTypes.find(ct => ct.type === selectedType)?.icon} {contentTypes.find(ct => ct.type === selectedType)?.title}
              </h3>
              <button
                onClick={() => setSelectedType(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
              >
                Back
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {contentsByType(selectedType).map((content) => {
                const contentProgress = progress.find(p => p.contentId === content.id);
                return (
                  <button
                    key={content.id}
                    onClick={() => setSelectedContent(content)}
                    className="bg-white/10 hover:bg-white/20 rounded-xl p-6 transition-all text-left relative"
                  >
                    {contentProgress && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {contentProgress.score}%
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white mb-2">{content.title}</h4>
                        <p className="text-sm text-gray-400 mb-3">{content.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(content.duration)}
                      </span>
                      <span className="capitalize">{content.accent}</span>
                      <span className="px-2 py-0.5 bg-white/10 rounded-full capitalize">{content.difficulty}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : !showResults ? (
        <>
          {/* Listening Exercise */}
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedContent.title}</h2>
                  <p className="text-gray-400">{selectedContent.description}</p>
                </div>
                <button
                  onClick={resetContent}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
                >
                  Exit
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="capitalize">{selectedContent.accent} accent</span>
                <span>•</span>
                <span className="capitalize">{selectedContent.difficulty}</span>
                <span>•</span>
                <span>{selectedContent.questions.length} questions</span>
              </div>
            </div>

            {/* Audio Player */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-8 text-white">
              {/* Audio Info Banner */}
              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3 mb-3">
                  <Volume2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">🎧 Audio will read this dialogue:</p>
                    <p className="text-purple-100 text-xs mb-2">
                      Click <strong>Play</strong> to hear it with an American voice. 
                      Adjust speed to practice listening at different paces!
                    </p>
                  </div>
                </div>
                {/* Transcript Preview */}
                <div className="bg-white/10 rounded p-3 text-xs text-purple-50 leading-relaxed max-h-32 overflow-y-auto">
                  {selectedContent.transcript.split('\n').slice(0, 6).join('\n')}
                  {selectedContent.transcript.split('\n').length > 6 && '\n...'}
                </div>
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="mt-2 text-xs text-purple-200 hover:text-white underline flex items-center gap-1"
                >
                  <BookOpen className="w-3 h-3" />
                  {showTranscript ? 'Hide' : 'Show'} full transcript
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={resetPlayback}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all"
                  title="Restart"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
                <button
                  onClick={togglePlay}
                  className="p-6 bg-white text-purple-600 hover:bg-gray-100 rounded-full transition-all shadow-lg"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10" />}
                </button>
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className={`p-3 rounded-full transition-all ${
                    showTranscript ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'
                  }`}
                  title="Toggle Transcript"
                >
                  <BookOpen className="w-6 h-6" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-white h-full transition-all duration-100"
                    style={{ width: `${playbackProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm mt-2 text-purple-100">
                  <span>{formatTime(selectedContent.duration * (playbackProgress / 100))}</span>
                  <span>{formatTime(selectedContent.duration)}</span>
                </div>
              </div>

              {/* Speed Controls */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <Gauge className="w-5 h-5" />
                <span className="text-sm">Speed:</span>
                <div className="flex gap-2">
                  {speedOptions.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setCurrentSpeed(speed)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        currentSpeed === speed
                          ? "bg-white text-purple-600 font-bold"
                          : "bg-white/20 hover:bg-white/30"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Simulation Display */}
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <Volume2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm opacity-75">{selectedContent.audioSimulation}</p>
              </div>
            </div>

            {/* Transcript */}
            <AnimatePresence>
              {showTranscript && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Transcript
                  </h3>
                  <div className="bg-white/5 rounded-lg p-4 text-gray-300 whitespace-pre-line text-sm leading-relaxed">
                    {selectedContent.transcript}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vocabulary */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📚 Key Vocabulary & Phrases</h3>
              <div className="flex flex-wrap gap-2">
                {selectedContent.vocabulary.map((word, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-500/20 border border-purple-400/50 rounded-full text-purple-200 text-sm">
                    {word}
                  </span>
                ))}
              </div>
            </div>

            {/* Questions */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">📝 Comprehension Questions</h3>
              
              <div className="space-y-8">
                {selectedContent.questions.map((question, qIdx) => (
                  <div key={question.id} className="space-y-4">
                    <h4 className="text-white font-semibold">
                      {qIdx + 1}. {question.question}
                    </h4>
                    
                    <div className="grid md:grid-cols-2 gap-3">
                      {question.options.map((option, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => selectAnswer(question.id, oIdx)}
                          className={`p-4 rounded-lg text-left transition-all ${
                            selectedAnswers.get(question.id) === oIdx
                              ? "bg-purple-600 border border-purple-400 text-white"
                              : "bg-white/10 hover:bg-white/20 border border-white/10 text-gray-300"
                          }`}
                        >
                          <span className="font-semibold mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={submitQuiz}
                disabled={selectedAnswers.size < selectedContent.questions.length}
                className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-6 h-6" />
                Submit Answers ({selectedAnswers.size}/{selectedContent.questions.length})
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Results */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white"
          >
            <h2 className="text-3xl font-bold mb-6 text-center">📊 Results</h2>

            {/* Score */}
            <div className="text-center mb-8">
              <div className="text-7xl font-bold mb-2">
                {Math.round((Array.from(selectedAnswers.entries()).filter(([qId, answer]) => {
                  const question = selectedContent?.questions.find(q => q.id === qId);
                  return question?.correctAnswer === answer;
                }).length / (selectedContent?.questions.length || 1)) * 100)}%
              </div>
              <div className="text-xl text-indigo-100">
                {Array.from(selectedAnswers.entries()).filter(([qId, answer]) => {
                  const question = selectedContent?.questions.find(q => q.id === qId);
                  return question?.correctAnswer === answer;
                }).length} / {selectedContent?.questions.length} correct
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4 mb-8">
              {selectedContent?.questions.map((question, idx) => {
                const userAnswer = selectedAnswers.get(question.id);
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <div key={question.id} className={`bg-white/10 rounded-xl p-4 border-2 ${isCorrect ? 'border-green-400' : 'border-red-400'}`}>
                    <div className="flex items-start gap-3 mb-3">
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">{idx + 1}. {question.question}</h4>
                        <div className="text-sm space-y-1">
                          <div>Your answer: <span className={isCorrect ? 'text-green-300' : 'text-red-300'}>{question.options[userAnswer!]}</span></div>
                          {!isCorrect && (
                            <div>Correct answer: <span className="text-green-300">{question.options[question.correctAnswer]}</span></div>
                          )}
                        </div>
                        <div className="mt-2 text-sm bg-white/10 rounded p-2 text-indigo-100">
                          💡 {question.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={resetContent}
                className="px-6 py-3 bg-white text-indigo-600 hover:bg-gray-100 rounded-xl font-bold transition-all"
              >
                Choose New Content
              </button>
              <button
                onClick={() => {
                  setShowResults(false);
                  setSelectedAnswers(new Map());
                  setPlaybackProgress(0);
                }}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}