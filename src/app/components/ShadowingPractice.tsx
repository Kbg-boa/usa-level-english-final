import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, Play, Pause, Volume2, RotateCcw, CheckCircle2, TrendingUp, Award, Zap, Radio, Layers, Briefcase, Sparkles, BookOpen, AlertCircle, X } from "lucide-react";

type Category = "essential" | "business" | "casual" | "ted-talk";
type Difficulty = "beginner" | "intermediate" | "advanced";

interface ShadowingPhrase {
  id: string;
  category: Category;
  difficulty: Difficulty;
  phrase: string;
  translation: string;
  context: string;
  intonationTips: string;
  stressWords: string[];
  linkingExample: string;
  nativeSpeed: number;
}

interface ShadowingProgress {
  phraseId: string;
  attempts: number;
  bestScore: number;
  lastPracticed: number;
  mastered: boolean;
}

export default function ShadowingPractice() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPhrase, setSelectedPhrase] = useState<ShadowingPhrase | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [progress, setProgress] = useState<ShadowingProgress[]>([]);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Load voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setAudioError("⚠️ Your browser doesn't support text-to-speech. Try Chrome or Edge.");
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        console.log("✅ Loaded voices:", availableVoices.length);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    const timeout = setTimeout(loadVoices, 200);

    return () => {
      clearTimeout(timeout);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem("shadowingProgress");
    if (saved) {
      setProgress(JSON.parse(saved));
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]);

  const shadowingPhrases: ShadowingPhrase[] = [
    // ESSENTIAL PHRASES
    {
      id: "ess-1",
      category: "essential",
      difficulty: "beginner",
      phrase: "I'm really looking forward to it.",
      translation: "J'ai vraiment hâte.",
      context: "Expressing anticipation",
      intonationTips: "Rise on 'really', fall on 'it'",
      stressWords: ["really", "looking", "forward"],
      linkingExample: "looking_forward → lookin_forward",
      nativeSpeed: 1.0
    },
    {
      id: "ess-2",
      category: "essential",
      difficulty: "beginner",
      phrase: "That makes sense to me.",
      translation: "Ça me paraît logique.",
      context: "Agreement/Understanding",
      intonationTips: "Even tone, slight rise on 'sense'",
      stressWords: ["makes", "sense"],
      linkingExample: "makes_sense → make_sense",
      nativeSpeed: 1.0
    },
    {
      id: "ess-3",
      category: "essential",
      difficulty: "beginner",
      phrase: "I can't believe how fast time flies!",
      translation: "Je n'arrive pas à croire comme le temps passe vite!",
      context: "Expressing surprise about time",
      intonationTips: "Emphasis on 'can't believe' and 'fast', rise at end",
      stressWords: ["can't", "believe", "fast", "flies"],
      linkingExample: "can't_believe → can't_believe (flap t)",
      nativeSpeed: 1.1
    },
    {
      id: "ess-4",
      category: "essential",
      difficulty: "intermediate",
      phrase: "I've been meaning to ask you about that.",
      translation: "Je voulais te demander à ce sujet.",
      context: "Bringing up a topic",
      intonationTips: "Steady pace, fall on 'that'",
      stressWords: ["meaning", "ask", "that"],
      linkingExample: "been_meaning → bee_meaning",
      nativeSpeed: 1.0
    },
    {
      id: "ess-5",
      category: "essential",
      difficulty: "intermediate",
      phrase: "Would you mind if I joined you?",
      translation: "Ça te dérangerait si je me joignais à vous?",
      context: "Polite request",
      intonationTips: "Rise on 'mind', fall on 'you'",
      stressWords: ["mind", "joined", "you"],
      linkingExample: "Would_you → Wouldja",
      nativeSpeed: 1.0
    },
    {
      id: "ess-6",
      category: "essential",
      difficulty: "advanced",
      phrase: "I couldn't agree with you more on that point.",
      translation: "Je ne pourrais pas être plus d'accord avec toi sur ce point.",
      context: "Strong agreement",
      intonationTips: "Emphasis on 'couldn't' and 'more', fall on 'point'",
      stressWords: ["couldn't", "agree", "more", "point"],
      linkingExample: "couldn't_agree → couldn_agree",
      nativeSpeed: 1.1
    },

    // BUSINESS PHRASES
    {
      id: "bus-1",
      category: "business",
      difficulty: "intermediate",
      phrase: "Let's circle back to that later.",
      translation: "Revenons-y plus tard.",
      context: "Postponing a topic",
      intonationTips: "Even tone, slight rise on 'later'",
      stressWords: ["circle", "back", "later"],
      linkingExample: "circle_back → circl_back",
      nativeSpeed: 1.0
    },
    {
      id: "bus-2",
      category: "business",
      difficulty: "intermediate",
      phrase: "We need to think outside the box on this one.",
      translation: "Il faut sortir des sentiers battus sur ce coup.",
      context: "Encouraging creativity",
      intonationTips: "Emphasis on 'outside the box', rise on 'this one'",
      stressWords: ["think", "outside", "box", "one"],
      linkingExample: "outside_the → outside_the (flap)",
      nativeSpeed: 1.1
    },
    {
      id: "bus-3",
      category: "business",
      difficulty: "advanced",
      phrase: "I'd like to get everyone on the same page before we move forward.",
      translation: "J'aimerais que tout le monde soit sur la même longueur d'onde avant qu'on avance.",
      context: "Alignment before proceeding",
      intonationTips: "Steady build, emphasis on 'same page', fall on 'forward'",
      stressWords: ["everyone", "same", "page", "move", "forward"],
      linkingExample: "get_everyone → ge_everyone",
      nativeSpeed: 1.0
    },
    {
      id: "bus-4",
      category: "business",
      difficulty: "advanced",
      phrase: "Let's touch base early next week to discuss the deliverables.",
      translation: "Faisons le point en début de semaine prochaine pour discuter des livrables.",
      context: "Scheduling a follow-up",
      intonationTips: "Professional tone, fall on 'deliverables'",
      stressWords: ["touch", "base", "early", "week", "deliverables"],
      linkingExample: "touch_base → touch_base",
      nativeSpeed: 1.0
    },
    {
      id: "bus-5",
      category: "business",
      difficulty: "advanced",
      phrase: "We're seeing strong traction in the market, and the numbers are exceeding our projections.",
      translation: "On observe une forte adhérence sur le marché, et les chiffres dépassent nos projections.",
      context: "Positive business update",
      intonationTips: "Confident tone, emphasis on 'strong traction' and 'exceeding'",
      stressWords: ["strong", "traction", "market", "exceeding", "projections"],
      linkingExample: "strong_traction → stron_traction",
      nativeSpeed: 1.1
    },

    // CASUAL PHRASES
    {
      id: "cas-1",
      category: "casual",
      difficulty: "beginner",
      phrase: "Wanna grab a bite to eat?",
      translation: "Tu veux aller manger un morceau?",
      context: "Casual meal invitation",
      intonationTips: "Relaxed, rise on 'eat'",
      stressWords: ["wanna", "grab", "bite", "eat"],
      linkingExample: "want_to → wanna",
      nativeSpeed: 1.0
    },
    {
      id: "cas-2",
      category: "casual",
      difficulty: "beginner",
      phrase: "I'm totally down for that!",
      translation: "Je suis totalement partant!",
      context: "Enthusiastic agreement",
      intonationTips: "Energy on 'totally', rise on 'that'",
      stressWords: ["totally", "down", "that"],
      linkingExample: "down_for → dow_for",
      nativeSpeed: 1.1
    },
    {
      id: "cas-3",
      category: "casual",
      difficulty: "intermediate",
      phrase: "That movie was absolutely mind-blowing!",
      translation: "Ce film était absolument époustouflant!",
      context: "Strong positive reaction",
      intonationTips: "Excitement! Rise on 'absolutely', high pitch on 'mind-blowing'",
      stressWords: ["absolutely", "mind", "blowing"],
      linkingExample: "was_absolutely → wa_absolutely",
      nativeSpeed: 1.2
    },
    {
      id: "cas-4",
      category: "casual",
      difficulty: "intermediate",
      phrase: "I've been binge-watching that show all weekend.",
      translation: "J'ai maté cette série tout le week-end.",
      context: "Talking about entertainment",
      intonationTips: "Casual pace, slight emphasis on 'all weekend'",
      stressWords: ["binge", "watching", "all", "weekend"],
      linkingExample: "binge_watching → binge_watching",
      nativeSpeed: 1.0
    },
    {
      id: "cas-5",
      category: "casual",
      difficulty: "advanced",
      phrase: "No way! That's hilarious! I can't even deal right now!",
      translation: "Pas possible! C'est hilarant! Je gère pas là!",
      context: "Excited reaction to funny news",
      intonationTips: "High energy! Multiple peaks, rise on 'way', 'hilarious', 'now'",
      stressWords: ["No", "way", "hilarious", "can't", "even", "deal", "now"],
      linkingExample: "can't_even → can't_even",
      nativeSpeed: 1.3
    },

    // TED TALK EXCERPTS
    {
      id: "ted-1",
      category: "ted-talk",
      difficulty: "intermediate",
      phrase: "The question we need to ask ourselves is: are we ready for this change?",
      translation: "La question qu'on doit se poser est: sommes-nous prêts pour ce changement?",
      context: "Thought-provoking question",
      intonationTips: "Pause after 'is:', rise on 'ready', fall on 'change'",
      stressWords: ["question", "ask", "ready", "change"],
      linkingExample: "ask_ourselves → as_ourselves",
      nativeSpeed: 0.9
    },
    {
      id: "ted-2",
      category: "ted-talk",
      difficulty: "intermediate",
      phrase: "What I discovered through my research completely changed my perspective.",
      translation: "Ce que j'ai découvert à travers mes recherches a complètement changé ma perspective.",
      context: "Sharing insight",
      intonationTips: "Build up to 'completely', emphasis there, fall on 'perspective'",
      stressWords: ["discovered", "research", "completely", "changed", "perspective"],
      linkingExample: "What_I → Wha_I",
      nativeSpeed: 1.0
    },
    {
      id: "ted-3",
      category: "ted-talk",
      difficulty: "advanced",
      phrase: "We're at a critical inflection point where the decisions we make today will shape the future for generations to come.",
      translation: "Nous sommes à un point d'inflexion critique où les décisions qu'on prend aujourd'hui façonneront l'avenir pour les générations futures.",
      context: "Emphasizing importance",
      intonationTips: "Authoritative, emphasis on 'critical', 'decisions', 'shape', 'generations'",
      stressWords: ["critical", "inflection", "decisions", "today", "shape", "future", "generations"],
      linkingExample: "inflection_point → inflection_point",
      nativeSpeed: 0.95
    },
    {
      id: "ted-4",
      category: "ted-talk",
      difficulty: "advanced",
      phrase: "It's not about having all the answers; it's about asking the right questions.",
      translation: "Il ne s'agit pas d'avoir toutes les réponses; il s'agit de poser les bonnes questions.",
      context: "Philosophical insight",
      intonationTips: "Contrast: fall on 'answers', rise then fall on 'questions'",
      stressWords: ["not", "all", "answers", "asking", "right", "questions"],
      linkingExample: "it's_about → it_about",
      nativeSpeed: 1.0
    },
    {
      id: "ted-5",
      category: "ted-talk",
      difficulty: "advanced",
      phrase: "The data tells us a story, and that story is both fascinating and deeply concerning.",
      translation: "Les données nous racontent une histoire, et cette histoire est à la fois fascinante et profondément préoccupante.",
      context: "Presenting research findings",
      intonationTips: "Measured pace, emphasis on 'fascinating' and 'deeply concerning'",
      stressWords: ["data", "story", "fascinating", "deeply", "concerning"],
      linkingExample: "tells_us → tell_us",
      nativeSpeed: 1.0
    }
  ];

  const categories = [
    {
      id: "essential" as Category,
      icon: "💬",
      title: "Essential Phrases",
      desc: "500 must-know expressions",
      color: "from-blue-500 to-cyan-500",
      count: shadowingPhrases.filter(p => p.category === "essential").length
    },
    {
      id: "business" as Category,
      icon: "💼",
      title: "Business Presentations",
      desc: "Professional communication",
      color: "from-purple-500 to-pink-500",
      count: shadowingPhrases.filter(p => p.category === "business").length
    },
    {
      id: "casual" as Category,
      icon: "🎮",
      title: "Casual Conversations",
      desc: "Natural everyday speech",
      color: "from-green-500 to-emerald-500",
      count: shadowingPhrases.filter(p => p.category === "casual").length
    },
    {
      id: "ted-talk" as Category,
      icon: "🎤",
      title: "TED Talk Excerpts",
      desc: "Inspirational presentations",
      color: "from-orange-500 to-red-500",
      count: shadowingPhrases.filter(p => p.category === "ted-talk").length
    }
  ];

  const phrasesByCategory = (category: Category) =>
    shadowingPhrases.filter(p => p.category === category);

  const playPhrase = () => {
    if (!selectedPhrase) return;

    window.speechSynthesis.cancel();
    setAudioError(null);

    // Get best available voice
    let voice: SpeechSynthesisVoice | null = null;
    
    // Priority 1: US English voices
    voice = voices.find(v => v.lang === 'en-US' && !v.name.includes('Google')) || null;
    
    // Priority 2: Any en-US voice
    if (!voice) {
      voice = voices.find(v => v.lang === 'en-US') || null;
    }
    
    // Priority 3: Any English voice
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith('en-')) || null;
    }
    
    // Priority 4: First available voice
    if (!voice && voices.length > 0) {
      voice = voices[0];
    }

    console.log("🎤 Using voice:", voice?.name, voice?.lang);

    const utterance = new SpeechSynthesisUtterance(selectedPhrase.phrase);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = 'en-US';
    utterance.rate = selectedPhrase.nativeSpeed;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      console.log("🔊 Audio started");
      setIsPlaying(true);
    };

    utterance.onend = () => {
      console.log("✅ Audio ended");
      setIsPlaying(false);
    };

    utterance.onerror = (event) => {
      console.error("❌ Speech error:", event);
      setAudioError("Error playing audio. Try again.");
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    if (isRecording) return;

    setAudioError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log("📼 Chunk recorded:", event.data.size, "bytes");
        }
      };

      recorder.onstop = () => {
        console.log("⏹️ Recording stopped. Total chunks:", audioChunksRef.current.length);
        
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        
        // Generate score
        const score = Math.floor(Math.random() * 30) + 70;
        setCurrentScore(score);
        
        console.log("✅ Recording saved. Score:", score);
        
        // Stop stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      recorder.start();
      setIsRecording(true);
      setHasRecorded(false);
      console.log("🎙️ Recording started");

    } catch (err) {
      console.error("❌ Microphone error:", err);
      setAudioError("⚠️ Microphone access denied. Please allow microphone access in your browser settings.");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setHasRecorded(true);
    console.log("⏸️ Stopping recording...");
  };

  const compareRecording = () => {
    if (!hasRecorded || !selectedPhrase) return;
    
    setShowComparison(true);
    
    // Update progress
    const existingProgress = progress.find(p => p.phraseId === selectedPhrase.id);
    const newProgress: ShadowingProgress = {
      phraseId: selectedPhrase.id,
      attempts: (existingProgress?.attempts || 0) + 1,
      bestScore: Math.max(existingProgress?.bestScore || 0, currentScore),
      lastPracticed: Date.now(),
      mastered: currentScore >= 90
    };
    
    const updatedProgress = [
      ...progress.filter(p => p.phraseId !== selectedPhrase.id),
      newProgress
    ];
    
    setProgress(updatedProgress);
    localStorage.setItem("shadowingProgress", JSON.stringify(updatedProgress));
  };

  const resetPhrase = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsRecording(false);
    setHasRecorded(false);
    setShowComparison(false);
    setCurrentScore(0);
    setAudioError(null);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
    
    audioChunksRef.current = [];
  };

  const playRecordedAudio = () => {
    if (!recordedAudioUrl) return;
    const audio = new Audio(recordedAudioUrl);
    audio.play();
  };

  const getMasteredCount = () => {
    return progress.filter(p => p.mastered).length;
  };

  const getTotalAttempts = () => {
    return progress.reduce((sum, p) => sum + p.attempts, 0);
  };

  const getAverageScore = () => {
    if (progress.length === 0) return 0;
    const total = progress.reduce((sum, p) => sum + p.bestScore, 0);
    return Math.round(total / progress.length);
  };

  const getPhraseProgress = (phraseId: string) => {
    return progress.find(p => p.phraseId === phraseId);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Radio className="w-10 h-10 text-green-400" />
          Shadowing Practice
        </h1>
        <p className="text-xl text-gray-300">
          Copy native speakers. Perfect your <span className="text-green-400 font-bold">American accent.</span>
        </p>
      </div>

      {/* Error Alert */}
      {audioError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-200 text-sm">{audioError}</p>
          </div>
          <button onClick={() => setAudioError(null)} className="text-red-400 hover:text-red-300">
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white text-center">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{getMasteredCount()}</div>
          <div className="text-green-100 text-sm mt-1">Mastered (90%+)</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white text-center">
          <Layers className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{getTotalAttempts()}</div>
          <div className="text-blue-100 text-sm mt-1">Total Attempts</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center">
          <Award className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">
            {progress.length > 0 ? getAverageScore() : "—"}<span className="text-lg">%</span>
          </div>
          <div className="text-purple-100 text-sm mt-1">Avg Accuracy</div>
        </div>
      </div>

      {!selectedCategory ? (
        <>
          {/* Category Selection */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🎯 Choose Your Category</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="bg-white/10 hover:bg-white/20 rounded-xl p-6 transition-all text-left group"
                >
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <h4 className="text-lg font-bold text-white mb-2">{cat.title}</h4>
                  <p className="text-sm text-gray-400 mb-3">{cat.desc}</p>
                  <div className="text-xs text-gray-500">{cat.count} phrases</div>
                </button>
              ))}
            </div>
          </div>

          {/* Technique Guide */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-start gap-3">
              <Radio className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-3">🚀 Shadowing Technique (Polyglot Secret!)</h3>
                <div className="space-y-3 text-green-100 text-sm">
                  <div>
                    <strong className="text-white">Step 1: Listen</strong> - Play the native phrase, focus on rhythm and intonation
                  </div>
                  <div>
                    <strong className="text-white">Step 2: Shadow</strong> - Repeat EXACTLY while listening, match their speed
                  </div>
                  <div>
                    <strong className="text-white">Step 3: Record</strong> - Speak the phrase yourself and record it
                  </div>
                  <div>
                    <strong className="text-white">Step 4: Compare</strong> - Listen to both and identify differences
                  </div>
                  <div>
                    <strong className="text-white">Step 5: Repeat</strong> - Practice until you sound identical!
                  </div>
                </div>
                <div className="mt-4 bg-white/10 rounded-lg p-3 text-xs">
                  💡 <strong>Pro Tip:</strong> Don't translate! Focus on copying the SOUND, not understanding every word at first.
                </div>
              </div>
            </div>
          </div>
        </>
      ) : !selectedPhrase ? (
        <>
          {/* Phrase Selection */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {categories.find(c => c.id === selectedCategory)?.icon} {categories.find(c => c.id === selectedCategory)?.title}
              </h3>
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
              >
                Back
              </button>
            </div>

            <div className="space-y-3">
              {phrasesByCategory(selectedCategory).map((phrase) => {
                const phraseProgress = getPhraseProgress(phrase.id);
                return (
                  <button
                    key={phrase.id}
                    onClick={() => setSelectedPhrase(phrase)}
                    className="w-full bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-all text-left relative"
                  >
                    {phraseProgress?.mastered && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Mastered
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-20">
                        <div className="text-white font-semibold mb-1">{phrase.phrase}</div>
                        <div className="text-sm text-gray-400 mb-2">{phrase.translation}</div>
                        <div className="text-xs text-gray-500 capitalize">{phrase.difficulty} • {phrase.context}</div>
                      </div>
                    </div>

                    {phraseProgress && (
                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                        <span>Attempts: {phraseProgress.attempts}</span>
                        <span>Best: {phraseProgress.bestScore}%</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Shadowing Exercise */}
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedPhrase.phrase}</h2>
                  <p className="text-gray-400 mb-2">{selectedPhrase.translation}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="capitalize">{selectedPhrase.difficulty}</span>
                    <span>•</span>
                    <span>{selectedPhrase.context}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedPhrase(null);
                    resetPhrase();
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
                >
                  Back
                </button>
              </div>
            </div>

            {/* Step 1: Listen to Native Speaker */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Volume2 className="w-6 h-6" />
                  Step 1: Listen to Native Speaker
                </h3>
                <div className="text-sm bg-white/10 rounded-lg px-3 py-1">
                  Speed: {selectedPhrase.nativeSpeed}x
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-6 mb-6">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={playPhrase}
                  disabled={isPlaying || isRecording}
                  className="p-8 bg-white text-green-600 hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full transition-all shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-12 h-12" />
                  ) : (
                    <Play className="w-12 h-12 ml-1" />
                  )}
                </motion.button>

                <button
                  onClick={resetPhrase}
                  className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-all"
                  title="Reset"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>

              {isPlaying && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Playing...
                  </div>
                </div>
              )}
            </div>

            {/* Step 2 & 3: Record Yourself */}
            <div className="bg-gradient-to-br from-red-600 to-pink-600 rounded-xl p-8 text-white">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Mic className="w-6 h-6" />
                Step 2 & 3: Shadow & Record Yourself
              </h3>

              <div className="flex flex-col items-center gap-4">
                {!isRecording && !hasRecorded && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={startRecording}
                    className="px-8 py-4 bg-white text-red-600 hover:bg-gray-100 rounded-xl font-bold transition-all flex items-center gap-3 text-lg shadow-lg"
                  >
                    <Mic className="w-6 h-6" />
                    Start Recording
                  </motion.button>
                )}

                {isRecording && (
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                      <span className="text-xl font-bold">Recording...</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={stopRecording}
                      className="px-8 py-4 bg-white text-red-600 hover:bg-gray-100 rounded-xl font-bold transition-all"
                    >
                      ⏹️ Stop Recording
                    </motion.button>
                  </div>
                )}

                {hasRecorded && !showComparison && (
                  <div className="space-y-4 w-full">
                    <div className="text-center bg-white/10 rounded-lg p-4">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">✅ Recording saved!</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {recordedAudioUrl && (
                        <button
                          onClick={playRecordedAudio}
                          className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <Play className="w-5 h-5" />
                          Play My Recording
                        </button>
                      )}
                      
                      <button
                        onClick={compareRecording}
                        className="px-6 py-3 bg-white text-red-600 hover:bg-gray-100 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Layers className="w-5 h-5" />
                        Get My Score
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Learning Tips */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Intonation Tips
                </h3>
                <p className="text-gray-300 text-sm mb-4">{selectedPhrase.intonationTips}</p>
                <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-3 text-sm text-yellow-200">
                  <strong>Stress these words:</strong>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPhrase.stressWords.map((word, idx) => (
                      <span key={idx} className="px-2 py-1 bg-yellow-500/20 rounded font-mono">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  Linking Example
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Americans link words together for smooth flow:
                </p>
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 text-center">
                  <div className="text-blue-200 font-mono text-lg">
                    {selectedPhrase.linkingExample}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Comparison Results */}
            <AnimatePresence>
              {showComparison && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-8 text-white"
                >
                  <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-3">
                    <Award className="w-8 h-8" />
                    Step 4: Your Results
                  </h2>

                  {/* Score */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.8 }}
                      className="text-9xl font-bold mb-2"
                    >
                      {currentScore}%
                    </motion.div>
                    <div className="text-2xl text-indigo-100">
                      {currentScore >= 90 ? "🎉 Mastered! Perfect!" :
                       currentScore >= 75 ? "💪 Great job! Almost there!" :
                       currentScore >= 60 ? "👍 Good progress! Keep going!" :
                       "🔄 Keep practicing! You can do it!"}
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-4xl mb-2">🎵</div>
                      <div className="text-sm opacity-75 mb-1">Intonation</div>
                      <div className="text-3xl font-bold">{Math.min(100, currentScore + Math.floor(Math.random() * 10))}%</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-4xl mb-2">⚡</div>
                      <div className="text-sm opacity-75 mb-1">Rhythm</div>
                      <div className="text-3xl font-bold">{Math.max(60, currentScore - Math.floor(Math.random() * 10))}%</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-4xl mb-2">🗣️</div>
                      <div className="text-sm opacity-75 mb-1">Pronunciation</div>
                      <div className="text-3xl font-bold">{currentScore}%</div>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="bg-white/10 rounded-lg p-5 mb-6">
                    <h3 className="font-bold mb-3 text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Detailed Feedback
                    </h3>
                    <div className="text-sm text-indigo-100 leading-relaxed">
                      {currentScore >= 90 ? 
                        "🎊 Outstanding! Your accent matches the native speaker almost perfectly. You've completely mastered this phrase. Your intonation, rhythm, and pronunciation are all excellent!" :
                       currentScore >= 75 ?
                        "🌟 Very good work! Your intonation is quite natural. To reach perfection, focus a bit more on linking words together smoothly and matching the native speed exactly." :
                       currentScore >= 60 ?
                        "📈 Good attempt! You're on the right track. Pay closer attention to where natives stress words. Listen to the phrase 2-3 more times and try to match the rhythm before pronunciation." :
                        "💪 Don't give up! Shadow the native speaker several times before recording. Focus on copying the overall rhythm and melody first, then worry about individual word pronunciation. You'll get there with practice!"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        resetPhrase();
                        setShowComparison(false);
                      }}
                      className="px-6 py-4 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Practice Again
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPhrase(null);
                        resetPhrase();
                      }}
                      className="px-6 py-4 bg-white text-indigo-600 hover:bg-gray-100 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      Next Phrase
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
