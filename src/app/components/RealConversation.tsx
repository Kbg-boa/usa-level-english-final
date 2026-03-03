import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX, Clock, MessageCircle, Award, Zap, TrendingUp, User, MapPin, Briefcase, ShoppingBag, Utensils, AlertCircle, CheckCircle, Play, Pause } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type Scenario = "casual" | "business" | "airport" | "shopping" | "restaurant" | "emergency";

interface ConversationScenario {
  id: Scenario;
  name: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  icon: any;
  color: string;
  personName: string;
  personRole: string;
  personImage: string;
  samplePhrases: string[];
}

interface Message {
  id: string;
  speaker: "user" | "ai";
  text: string;
  timestamp: number;
}

interface ConversationHistory {
  scenario: Scenario;
  duration: number;
  messages: number;
  timestamp: number;
}

export default function RealConversation() {
  const [selectedScenario, setSelectedScenario] = useState<ConversationScenario | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isInCall, setIsInCall] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem("conversationHistory");
    if (saved) setConversationHistory(JSON.parse(saved));

    // Initialize speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem("conversationHistory", JSON.stringify(conversationHistory));
  }, [conversationHistory]);

  // Timer
  useEffect(() => {
    if (isInCall && startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isInCall, startTime]);

  const scenarios: ConversationScenario[] = [
    {
      id: "casual",
      name: "Casual Chat",
      description: "Chat about everyday life like with a friend",
      level: "beginner",
      icon: MessageCircle,
      color: "from-blue-500 to-cyan-500",
      personName: "Sarah",
      personRole: "Your American Friend",
      personImage: "https://images.unsplash.com/photo-1656947735737-7cea99a738f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllbmRseSUyMGFtZXJpY2FuJTIwd29tYW4lMjBzbWlsaW5nJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MjQ5NjIzN3ww&ixlib=rb-4.1.0&q=80&w=1080",
      samplePhrases: [
        "Hey! What's up?",
        "How was your weekend?",
        "That's awesome!",
        "I totally get what you mean"
      ]
    },
    {
      id: "business",
      name: "Business Meeting",
      description: "Professional conversation and networking",
      level: "advanced",
      icon: Briefcase,
      color: "from-purple-500 to-indigo-500",
      personName: "Michael",
      personRole: "Business Partner",
      personImage: "https://images.unsplash.com/photo-1592878995758-02b32ddabdd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzc21hbiUyMGFtZXJpY2FuJTIwcHJvZmVzc2lvbmFsJTIwc3VpdHxlbnwxfHx8fDE3NzI0OTYyMzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      samplePhrases: [
        "Let's schedule a meeting",
        "I'll send you the proposal",
        "What's your take on this?",
        "Let me loop you in"
      ]
    },
    {
      id: "airport",
      name: "At the Airport",
      description: "Navigate travel situations confidently",
      level: "intermediate",
      icon: MapPin,
      color: "from-cyan-500 to-blue-500",
      personName: "Jennifer",
      personRole: "Airport Staff",
      personImage: "https://images.unsplash.com/photo-1678819442160-580ec35145e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbGlnaHQlMjBhdHRlbmRhbnQlMjBhbWVyaWNhbiUyMGFpcnBvcnR8ZW58MXx8fHwxNzcyNDk2MjM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      samplePhrases: [
        "May I see your passport?",
        "What's your final destination?",
        "Gate B7, boarding in 20 minutes",
        "Have a pleasant flight!"
      ]
    },
    {
      id: "shopping",
      name: "Shopping & Returns",
      description: "Handle store conversations smoothly",
      level: "beginner",
      icon: ShoppingBag,
      color: "from-pink-500 to-rose-500",
      personName: "Emma",
      personRole: "Store Associate",
      personImage: "https://images.unsplash.com/photo-1594679085391-0ea2baba0145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRhaWwlMjB3b3JrZXIlMjBhbWVyaWNhbiUyMGNhc2hpZXIlMjBzbWlsaW5nfGVufDF8fHx8MTc3MjQ5NjIzOHww&ixlib=rb-4.1.0&q=80&w=1080",
      samplePhrases: [
        "Can I help you find anything?",
        "This is on sale today!",
        "Do you have your receipt?",
        "We have that in blue too"
      ]
    },
    {
      id: "restaurant",
      name: "Restaurant Ordering",
      description: "Order food like a native",
      level: "beginner",
      icon: Utensils,
      color: "from-orange-500 to-red-500",
      personName: "David",
      personRole: "Server",
      personImage: "https://images.unsplash.com/photo-1617336171952-a4163a99d060?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwd2FpdGVyJTIwYW1lcmljYW4lMjBzZXJ2ZXJ8ZW58MXx8fHwxNzcyNDk2MjM5fDA&ixlib=rb-4.1.0&q=80&w=1080",
      samplePhrases: [
        "Are you ready to order?",
        "How would you like that cooked?",
        "Anything to drink?",
        "Enjoy your meal!"
      ]
    },
    {
      id: "emergency",
      name: "Emergency Situations",
      description: "Handle urgent scenarios clearly",
      level: "advanced",
      icon: AlertCircle,
      color: "from-red-500 to-orange-500",
      personName: "Dr. Martinez",
      personRole: "Emergency Responder",
      personImage: "https://images.unsplash.com/photo-1588268393007-068bc70a443d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2N0b3IlMjBwYXJhbWVkaWMlMjBhbWVyaWNhbiUyMGVtZXJnZW5jeXxlbnwxfHx8fDE3NzI0OTYyMzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      samplePhrases: [
        "What's the emergency?",
        "Stay calm, help is on the way",
        "Can you describe what happened?",
        "We're here to help"
      ]
    }
  ];

  const startConversation = (scenario: ConversationScenario) => {
    setSelectedScenario(scenario);
    setIsInCall(true);
    setStartTime(Date.now());
    setElapsedTime(0);
    setMessages([]);

    // AI greeting
    const greeting = getGreeting(scenario);
    const aiMessage: Message = {
      id: Date.now().toString(),
      speaker: "ai",
      text: greeting,
      timestamp: Date.now()
    };
    setMessages([aiMessage]);

    if (soundEnabled) {
      speak(greeting);
    }
  };

  const endConversation = () => {
    if (selectedScenario && startTime) {
      const history: ConversationHistory = {
        scenario: selectedScenario.id,
        duration: elapsedTime,
        messages: messages.length,
        timestamp: Date.now()
      };
      setConversationHistory([history, ...conversationHistory]);

      // Update stats
      const stats = localStorage.getItem("englishStats");
      if (stats) {
        const parsed = JSON.parse(stats);
        parsed.speakingMinutes = (parsed.speakingMinutes || 0) + Math.floor(elapsedTime / 60);
        localStorage.setItem("englishStats", JSON.stringify(parsed));
      }
    }

    setIsInCall(false);
    setIsListening(false);
    setSelectedScenario(null);
    setStartTime(null);
    setElapsedTime(0);
    setMessages([]);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const getGreeting = (scenario: ConversationScenario): string => {
    const greetings: Record<Scenario, string> = {
      casual: "Hey there! How's it going? I'm Sarah, nice to meet you!",
      business: "Good morning! I'm Michael. Thanks for taking the time to meet with me today.",
      airport: "Good afternoon! Welcome to the airport. May I see your boarding pass please?",
      shopping: "Hi! Welcome to our store. Is there anything I can help you find today?",
      restaurant: "Good evening! Welcome to our restaurant. Can I start you off with something to drink?",
      emergency: "911, what's your emergency? This is Dr. Martinez, how can I help you?"
    };
    return greetings[scenario.id];
  };

  const speak = (text: string) => {
    if (!synthRef.current || !soundEnabled) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to use US English voice
    const voices = synthRef.current.getVoices();
    const usVoice = voices.find(v => v.lang === "en-US");
    if (usVoice) utterance.voice = usVoice;

    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (!isListening) {
      startListening();
    } else {
      stopListening();
    }
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser. Please use Chrome.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      
      const userMessage: Message = {
        id: Date.now().toString(),
        speaker: "user",
        text: transcript,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Generate AI response
      setTimeout(() => {
        const aiResponse = generateResponse(transcript, selectedScenario!);
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          speaker: "ai",
          text: aiResponse,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        if (soundEnabled) {
          speak(aiResponse);
        }
      }, 500);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const generateResponse = (userText: string, scenario: ConversationScenario): string => {
    const responses: Record<Scenario, string[]> = {
      casual: [
        "That's so cool! Tell me more about that!",
        "Oh yeah, I totally get what you mean!",
        "No way! That's hilarious!",
        "I love that! We should hang out sometime.",
        "That sounds awesome! I'm jealous!"
      ],
      business: [
        "That's a great point. Let me note that down.",
        "I completely agree with your assessment.",
        "Could you elaborate on that a bit more?",
        "That aligns perfectly with our objectives.",
        "I'll follow up with you on that via email."
      ],
      airport: [
        "Thank you! Your boarding pass looks good.",
        "You'll need to proceed to security checkpoint B.",
        "Your gate is on the right, about 5 minutes walk.",
        "Have your ID ready for the security line.",
        "Boarding will begin in about 30 minutes."
      ],
      shopping: [
        "We actually have that in stock! Let me grab it for you.",
        "That's a great choice! It's very popular.",
        "Would you like to try it on? The fitting rooms are right over there.",
        "We're having a sale on that item today - 20% off!",
        "I can check if we have other sizes in the back."
      ],
      restaurant: [
        "Excellent choice! That's one of our most popular dishes.",
        "How would you like that prepared? Medium rare?",
        "Would you like fries or a salad with that?",
        "Can I get you anything else? Any appetizers?",
        "I'll put that order in for you right away!"
      ],
      emergency: [
        "Okay, I need you to stay calm. What's your exact location?",
        "Help is on the way. Can you describe the situation?",
        "Is anyone injured? Are they conscious?",
        "Stay on the line with me. Don't hang up.",
        "Paramedics will be there in approximately 5 minutes."
      ]
    };

    const scenarioResponses = responses[scenario.id];
    return scenarioResponses[Math.floor(Math.random() * scenarioResponses.length)];
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "text-green-400 bg-green-400/20";
      case "intermediate": return "text-yellow-400 bg-yellow-400/20";
      case "advanced": return "text-red-400 bg-red-400/20";
      default: return "text-gray-400 bg-gray-400/20";
    }
  };

  const totalConversations = conversationHistory.length;
  const totalTime = conversationHistory.reduce((sum, h) => sum + h.duration, 0);
  const avgDuration = totalConversations > 0 ? Math.floor(totalTime / totalConversations) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Phone className="w-10 h-10 text-green-500" />
          Real Conversation Practice
        </h1>
        <p className="text-xl text-gray-300">
          Talk to AI <span className="text-green-500 font-bold">like a real phone call</span>. Build speaking confidence! 🎤
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white text-center">
          <MessageCircle className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{totalConversations}</div>
          <div className="text-blue-100 text-sm mt-1">Conversations</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center">
          <Clock className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{formatTime(totalTime)}</div>
          <div className="text-purple-100 text-sm mt-1">Total Time</div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{formatTime(avgDuration)}</div>
          <div className="text-green-100 text-sm mt-1">Avg Duration</div>
        </div>
      </div>

      {!isInCall ? (
        /* Scenario Selection */
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white text-center">📞 Choose a Conversation Scenario</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer group"
                onClick={() => startConversation(scenario)}
              >
                {/* Person Image */}
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={scenario.personImage}
                    alt={scenario.personName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Person Info Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-12 h-12 bg-gradient-to-br ${scenario.color} rounded-full flex items-center justify-center`}>
                        <scenario.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-lg">{scenario.personName}</div>
                        <div className="text-gray-300 text-sm">{scenario.personRole}</div>
                      </div>
                    </div>
                  </div>

                  {/* Level Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getLevelColor(scenario.level)}`}>
                      {scenario.level}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-white mb-2">{scenario.name}</h4>
                  <p className="text-gray-400 mb-4">{scenario.description}</p>

                  {/* Sample Phrases */}
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-gray-300">Sample phrases:</div>
                    <div className="space-y-1">
                      {scenario.samplePhrases.slice(0, 2).map((phrase, idx) => (
                        <div key={idx} className="text-xs text-gray-400 italic">
                          "{phrase}"
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Call Button */}
                  <button className={`w-full mt-4 py-3 bg-gradient-to-r ${scenario.color} rounded-xl font-bold text-white flex items-center justify-center gap-2 group-hover:shadow-lg transition-all`}>
                    <PhoneCall className="w-5 h-5" />
                    Start Conversation
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Info Section */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Why Speaking Practice = FASTEST Way to Fluency
            </h3>
            <div className="space-y-3 text-green-100">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <strong>The Problem:</strong> You can read and write, but when you need to SPEAK, your brain freezes!
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <strong>The Solution:</strong> Practice real conversations OUT LOUD. Your brain needs to build the neural pathways for spontaneous speech.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <strong>How It Works:</strong> Talk to the AI like a real person. It listens, responds naturally, and you build confidence through repetition.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <strong>💡 Pro Tip:</strong> Don't worry about mistakes! Natives make mistakes too. Focus on communicating your meaning, not perfect grammar!
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Active Conversation */
        <div className="space-y-6">
          {/* Call Header */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-8 text-white">
            <div className="flex items-center justify-between">
              {/* Person Info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ImageWithFallback
                    src={selectedScenario!.personImage}
                    alt={selectedScenario!.personName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
                  />
                  {isSpeaking && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"
                    >
                      <Volume2 className="w-3 h-3 text-white m-auto mt-1" />
                    </motion.div>
                  )}
                </div>
                <div>
                  <div className="text-2xl font-bold">{selectedScenario!.personName}</div>
                  <div className="text-green-100">{selectedScenario!.personRole}</div>
                  <div className="text-sm text-green-200 flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                    On call
                  </div>
                </div>
              </div>

              {/* Timer */}
              <div className="text-center">
                <div className="text-4xl font-bold font-mono">{formatTime(elapsedTime)}</div>
                <div className="text-green-100 text-sm mt-1">Call Duration</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 min-h-[400px] max-h-[500px] overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.speaker === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] ${
                    message.speaker === "user"
                      ? "bg-blue-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
                      : "bg-white/10 text-white rounded-tl-2xl rounded-tr-2xl rounded-br-2xl"
                  } px-5 py-3`}>
                    <div className="text-sm font-semibold mb-1 opacity-70">
                      {message.speaker === "user" ? "You" : selectedScenario!.personName}
                    </div>
                    <div className="text-base">{message.text}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-center gap-6">
              {/* Microphone */}
              <button
                onClick={toggleListening}
                disabled={isSpeaking}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/50 animate-pulse"
                    : isSpeaking
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:scale-110"
                }`}
              >
                {isListening ? (
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                    <Mic className="w-10 h-10 text-white" />
                  </motion.div>
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </button>

              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                {soundEnabled ? (
                  <Volume2 className="w-8 h-8 text-white" />
                ) : (
                  <VolumeX className="w-8 h-8 text-gray-400" />
                )}
              </button>

              {/* End Call */}
              <button
                onClick={endConversation}
                className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-red-600/50"
              >
                <PhoneOff className="w-10 h-10 text-white" />
              </button>
            </div>

            {/* Status */}
            <div className="text-center mt-6">
              {isListening ? (
                <div className="text-green-400 font-semibold flex items-center justify-center gap-2">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                    <Mic className="w-5 h-5" />
                  </motion.div>
                  Listening... Speak now!
                </div>
              ) : isSpeaking ? (
                <div className="text-blue-400 font-semibold flex items-center justify-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  {selectedScenario!.personName} is speaking...
                </div>
              ) : (
                <div className="text-gray-400 flex items-center justify-center gap-2">
                  <Mic className="w-5 h-5" />
                  Click the microphone to speak
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
