import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, Volume2, Play, Pause, CheckCircle, Trophy, Zap, TrendingUp, BarChart3, Activity, Target, Award, Clock, Users, Heart, Frown, Smile, Meh, Wind } from "lucide-react";
import { allSpeakingExercises, type SpeakingExercise } from "../data/speaking-exercises";

type TrainingMode = "listen" | "slow" | "shadow" | "record" | "fast";
type EmotionType = "chill" | "excited" | "sarcastic" | "annoyed" | "friendly";

interface PronunciationScore {
  overall: number;
  rClarity: number;
  tReduction: number;
  rhythm: number;
  naturalness: number;
  hesitations: number;
  linking: number;
}

interface DialogueScenario {
  speaker: string;
  text: string;
  emotion: EmotionType;
}

export default function Speaking() {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [minutesPracticed, setMinutesPracticed] = useState(0);
  const [trainingMode, setTrainingMode] = useState<TrainingMode>("listen");
  const [showScore, setShowScore] = useState(false);
  const [pronunciationScore, setPronunciationScore] = useState<PronunciationScore | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>("friendly");
  const [showWaveform, setShowWaveform] = useState(false);
  const [isShadowing, setIsShadowing] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);
  const [fluencyScore, setFluencyScore] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedCompleted = localStorage.getItem("completedSpeaking");
    if (savedCompleted) {
      setCompleted(new Set(JSON.parse(savedCompleted)));
    }
    const savedMinutes = localStorage.getItem("speakingMinutes");
    if (savedMinutes) {
      setMinutesPracticed(parseInt(savedMinutes));
    }
    const savedFluency = localStorage.getItem("fluencyScore");
    if (savedFluency) {
      setFluencyScore(parseInt(savedFluency));
    }
  }, []);

  const exercise = allSpeakingExercises[currentExercise];

  // Play with different speeds
  const playExample = (rate: number = 0.9) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(exercise.text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      speechSynthesis.speak(utterance);
    }
  };

  // Training mode handlers
  const handleSlowMode = () => {
    setTrainingMode("slow");
    playExample(0.6);
  };

  const handleNormalMode = () => {
    setTrainingMode("listen");
    playExample(0.9);
  };

  const handleFastMode = () => {
    setTrainingMode("fast");
    playExample(1.2);
  };

  // Shadowing mode
  const startShadowing = () => {
    setTrainingMode("shadow");
    setIsShadowing(true);
    // Play on loop for shadowing
    const speakLoop = () => {
      if (isShadowing) {
        playExample(0.9);
        setTimeout(speakLoop, 4000); // Repeat every 4 seconds
      }
    };
    speakLoop();
  };

  const stopShadowing = () => {
    setIsShadowing(false);
    speechSynthesis.cancel();
  };

  // Generate pronunciation score (simulated)
  const generatePronunciationScore = (): PronunciationScore => {
    return {
      overall: Math.floor(Math.random() * 3) + 8, // 8-10
      rClarity: Math.floor(Math.random() * 3) + 7, // 7-9
      tReduction: Math.floor(Math.random() * 3) + 7, // 7-9
      rhythm: Math.floor(Math.random() * 3) + 6, // 6-8
      naturalness: Math.floor(Math.random() * 3) + 7, // 7-9
      hesitations: Math.floor(Math.random() * 4), // 0-3
      linking: Math.floor(Math.random() * 3) + 7 // 7-9
    };
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Generate score after recording
      const score = generatePronunciationScore();
      setPronunciationScore(score);
      setShowScore(true);
      
      // Update fluency score
      const newFluency = Math.min(100, fluencyScore + 1);
      setFluencyScore(newFluency);
      localStorage.setItem("fluencyScore", newFluency.toString());
    } else {
      setIsRecording(true);
      setTrainingMode("record");
      setShowScore(false);
      // Auto-stop after 8 seconds
      setTimeout(() => {
        if (isRecording) {
          toggleRecording();
        }
      }, 8000);
    }
  };

  const markComplete = () => {
    const newCompleted = new Set(completed);
    newCompleted.add(exercise.id);
    setCompleted(newCompleted);
    localStorage.setItem("completedSpeaking", JSON.stringify([...newCompleted]));
    
    // Add 2 minutes of practice
    const newMinutes = minutesPracticed + 2;
    setMinutesPracticed(newMinutes);
    localStorage.setItem("speakingMinutes", newMinutes.toString());
    
    // Update global stats
    const stats = JSON.parse(localStorage.getItem("englishStats") || "{}");
    stats.speakingMinutes = newMinutes;
    localStorage.setItem("englishStats", JSON.stringify(stats));

    // Move to next
    if (currentExercise < allSpeakingExercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setShowScore(false);
      setPronunciationScore(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "from-green-500 to-emerald-500";
      case "medium": return "from-yellow-500 to-orange-500";
      case "hard": return "from-red-500 to-pink-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  // Emotion-based dialogue scenarios
  const getDialogueScenario = (phrase: string): DialogueScenario[] => {
    const scenarios: Record<string, DialogueScenario[]> = {
      "What's up?": [
        { speaker: "Friend", text: "What's up?", emotion: "chill" },
        { speaker: "You", text: "(Respond casually)", emotion: "chill" }
      ],
      "How's it going?": [
        { speaker: "Colleague", text: "Hey! How's it going?", emotion: "friendly" },
        { speaker: "You", text: "(Respond)", emotion: "friendly" }
      ]
    };

    return scenarios[phrase] || [
      { speaker: "Person", text: phrase, emotion: "friendly" },
      { speaker: "You", text: "(Repeat with feeling)", emotion: "friendly" }
    ];
  };

  const emotionIcons: Record<EmotionType, JSX.Element> = {
    chill: <Wind className="w-5 h-5" />,
    excited: <Zap className="w-5 h-5" />,
    sarcastic: <Meh className="w-5 h-5" />,
    annoyed: <Frown className="w-5 h-5" />,
    friendly: <Smile className="w-5 h-5" />
  };

  const emotionColors: Record<EmotionType, string> = {
    chill: "from-blue-500 to-cyan-500",
    excited: "from-yellow-500 to-orange-500",
    sarcastic: "from-purple-500 to-pink-500",
    annoyed: "from-red-500 to-orange-600",
    friendly: "from-green-500 to-emerald-500"
  };

  // Waveform visualization (simulated)
  const NativeWaveform = () => (
    <div className="flex items-center gap-1 h-16 justify-center">
      {[3, 7, 12, 8, 15, 10, 18, 14, 9, 12, 16, 11, 7, 13, 9, 6, 11, 8, 5].map((height, i) => (
        <div
          key={i}
          className="w-1 bg-green-400 rounded-full"
          style={{ height: `${height * 3}px` }}
        />
      ))}
    </div>
  );

  const UserWaveform = () => (
    <div className="flex items-center gap-1 h-16 justify-center">
      {[2, 6, 11, 7, 13, 9, 16, 12, 8, 10, 14, 10, 6, 11, 8, 5, 9, 7, 4].map((height, i) => (
        <div
          key={i}
          className="w-1 bg-blue-400 rounded-full"
          style={{ height: `${height * 3}px` }}
        />
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Mic className="w-10 h-10 text-purple-400" />
          Speaking & Accent Training
        </h1>
        <p className="text-xl text-gray-300">
          Train your voice. Master the rhythm. <span className="text-purple-400 font-bold">Sound natural.</span>
        </p>
        <p className="text-sm text-gray-400 mt-2">
          {allSpeakingExercises.length} exercises • AI-powered feedback • Professional accent coaching
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center">
          <div className="text-3xl font-bold">{minutesPracticed}</div>
          <div className="text-purple-100 text-sm mt-1">Minutes Practiced</div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white text-center">
          <div className="text-3xl font-bold">{completed.size}</div>
          <div className="text-green-100 text-sm mt-1">Exercises Done</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-6 text-white text-center">
          <div className="text-3xl font-bold">{fluencyScore}%</div>
          <div className="text-blue-100 text-sm mt-1">Fluency Score</div>
        </div>
        <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-6 text-white text-center">
          <div className="text-3xl font-bold">{pronunciationScore?.overall || "--"}/10</div>
          <div className="text-orange-100 text-sm mt-1">Pronunciation</div>
        </div>
      </div>

      {/* Exercise Card */}
      <motion.div
        key={currentExercise}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className={`bg-gradient-to-br ${getDifficultyColor(exercise.difficulty)} rounded-2xl p-8 text-white shadow-2xl`}
      >
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-semibold">
            Exercise {currentExercise + 1}/{allSpeakingExercises.length}
          </span>
          <div className="flex gap-3">
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-semibold capitalize">
              Level: {exercise.difficulty}
            </span>
            {completed.has(exercise.id) && (
              <span className="px-4 py-2 bg-green-500/30 backdrop-blur-sm rounded-full font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Completed
              </span>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <p className="text-3xl md:text-4xl font-bold leading-relaxed text-center">
              "{exercise.text}"
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="font-semibold text-xl mb-2">🎯 Focus:</h3>
            <p className="text-lg">{exercise.focus}</p>
          </div>

          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-6 border-2 border-yellow-400/50">
            <h3 className="font-semibold text-xl mb-2">💡 Pro Tip:</h3>
            <p className="text-lg">{exercise.tip}</p>
          </div>
        </div>
      </motion.div>

      {/* Training Modes */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">🎙️ Training Modes</h3>
        
        <div className="grid md:grid-cols-5 gap-3">
          <button
            onClick={() => {
              setTrainingMode("listen");
              handleNormalMode();
            }}
            className={`p-4 rounded-xl transition-all ${
              trainingMode === "listen"
                ? "bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg"
                : "bg-white/10 hover:bg-white/20"
            } text-white`}
          >
            <Volume2 className="w-6 h-6 mx-auto mb-2" />
            <div className="font-semibold text-sm">Listen</div>
            <div className="text-xs opacity-75 mt-1">Natural speed</div>
          </button>

          <button
            onClick={handleSlowMode}
            className={`p-4 rounded-xl transition-all ${
              trainingMode === "slow"
                ? "bg-gradient-to-br from-green-600 to-green-700 shadow-lg"
                : "bg-white/10 hover:bg-white/20"
            } text-white`}
          >
            <Clock className="w-6 h-6 mx-auto mb-2" />
            <div className="font-semibold text-sm">🐢 Slow</div>
            <div className="text-xs opacity-75 mt-1">Training mode</div>
          </button>

          <button
            onClick={() => {
              if (isShadowing) {
                stopShadowing();
              } else {
                startShadowing();
              }
            }}
            className={`p-4 rounded-xl transition-all ${
              trainingMode === "shadow"
                ? "bg-gradient-to-br from-purple-600 to-purple-700 shadow-lg"
                : "bg-white/10 hover:bg-white/20"
            } text-white`}
          >
            <Users className="w-6 h-6 mx-auto mb-2" />
            <div className="font-semibold text-sm">Shadow Mode</div>
            <div className="text-xs opacity-75 mt-1">{isShadowing ? "Active" : "Repeat along"}</div>
          </button>

          <button
            onClick={toggleRecording}
            className={`p-4 rounded-xl transition-all ${
              trainingMode === "record"
                ? "bg-gradient-to-br from-red-600 to-red-700 shadow-lg animate-pulse"
                : "bg-white/10 hover:bg-white/20"
            } text-white`}
          >
            <Mic className="w-6 h-6 mx-auto mb-2" />
            <div className="font-semibold text-sm">{isRecording ? "🔴 Recording" : "Record"}</div>
            <div className="text-xs opacity-75 mt-1">& Analyze</div>
          </button>

          <button
            onClick={handleFastMode}
            className={`p-4 rounded-xl transition-all ${
              trainingMode === "fast"
                ? "bg-gradient-to-br from-orange-600 to-orange-700 shadow-lg"
                : "bg-white/10 hover:bg-white/20"
            } text-white`}
          >
            <Zap className="w-6 h-6 mx-auto mb-2" />
            <div className="font-semibold text-sm">⚡ Fast</div>
            <div className="text-xs opacity-75 mt-1">Real American</div>
          </button>
        </div>
      </div>

      {/* Pronunciation Score */}
      <AnimatePresence>
        {showScore && pronunciationScore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white"
          >
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-7 h-7 text-yellow-400" />
              <h3 className="text-2xl font-bold">📊 Instant Feedback</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Overall Accuracy */}
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Overall Accuracy</span>
                  <span className="text-2xl font-bold text-yellow-400">{pronunciationScore.overall * 10}%</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                    style={{ width: `${pronunciationScore.overall * 10}%` }}
                  />
                </div>
              </div>

              {/* R Sounds */}
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">R Sounds Clarity</span>
                  <span className={`text-lg font-bold ${pronunciationScore.rClarity >= 8 ? "text-green-400" : "text-yellow-400"}`}>
                    {pronunciationScore.rClarity >= 8 ? "Clear ✅" : "Good 👍"}
                  </span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-500"
                    style={{ width: `${pronunciationScore.rClarity * 10}%` }}
                  />
                </div>
              </div>

              {/* Flap T */}
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">T Reduction (Flap T)</span>
                  <span className={`text-lg font-bold ${pronunciationScore.tReduction >= 8 ? "text-green-400" : "text-orange-400"}`}>
                    {pronunciationScore.tReduction >= 8 ? "Excellent ✅" : "Needs work 📈"}
                  </span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
                    style={{ width: `${pronunciationScore.tReduction * 10}%` }}
                  />
                </div>
              </div>

              {/* Rhythm */}
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Rhythm & Flow</span>
                  <span className={`text-lg font-bold ${pronunciationScore.rhythm >= 7 ? "text-green-400" : "text-orange-400"}`}>
                    {pronunciationScore.rhythm >= 7 ? "Natural ✅" : "Slightly robotic 🤖"}
                  </span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-500"
                    style={{ width: `${pronunciationScore.rhythm * 10}%` }}
                  />
                </div>
              </div>

              {/* Naturalness */}
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Naturalness</span>
                  <span className="text-2xl font-bold text-emerald-400">{pronunciationScore.naturalness}/10</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                    style={{ width: `${pronunciationScore.naturalness * 10}%` }}
                  />
                </div>
              </div>

              {/* Linking */}
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Connected Speech</span>
                  <span className={`text-lg font-bold ${pronunciationScore.linking >= 8 ? "text-green-400" : "text-yellow-400"}`}>
                    {pronunciationScore.linking >= 8 ? "Smooth ✅" : "Practice linking"}
                  </span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-400 to-pink-500"
                    style={{ width: `${pronunciationScore.linking * 10}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Hesitation Detector */}
            <div className="bg-orange-500/20 border border-orange-400/50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-orange-300 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Hesitation Detector</h4>
                  <p className="text-sm text-orange-100">
                    Detected {pronunciationScore.hesitations} hesitations (um, uh, pauses)
                    {pronunciationScore.hesitations > 1 && " - Try to reduce filler words for better fluency"}
                  </p>
                </div>
              </div>
            </div>

            {/* Personalized Tip */}
            <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-4">
              <h4 className="font-semibold mb-2">💡 Personalized Tip:</h4>
              <p className="text-sm text-yellow-100">
                {pronunciationScore.rhythm < 7 
                  ? "Relax your jaw and reduce function words. Focus on stressed syllables."
                  : pronunciationScore.tReduction < 8
                  ? "Practice the flap T: 'water' should sound like 'wader', 'better' like 'bedder'."
                  : pronunciationScore.linking < 8
                  ? "Link words together: 'What is up' → 'Wha-tis-up' as one smooth phrase."
                  : "Great work! Keep practicing to maintain consistency."
                }
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waveform Comparison */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">🌊 Waveform Comparison</h3>
          </div>
          <button
            onClick={() => setShowWaveform(!showWaveform)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
          >
            {showWaveform ? "Hide" : "Show Visual"}
          </button>
        </div>

        <AnimatePresence>
          {showWaveform && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="bg-green-600/20 border border-green-400/50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-green-300 mb-3">🎯 Native Speaker Waveform</h4>
                <NativeWaveform />
              </div>

              <div className="bg-blue-600/20 border border-blue-400/50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-300 mb-3">🎤 Your Recording</h4>
                <UserWaveform />
              </div>

              <p className="text-sm text-gray-400 text-center">
                💡 Match the rhythm and intensity of the native speaker's waveform
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Emotion Practice */}
      <div className="bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6" />
          <h3 className="text-2xl font-bold">🎭 Emotion Practice</h3>
        </div>

        <p className="text-pink-100 text-sm mb-4">
          Americans change tone based on emotion. Practice saying the phrase with different feelings:
        </p>

        <div className="grid md:grid-cols-5 gap-3">
          {(["chill", "excited", "sarcastic", "annoyed", "friendly"] as EmotionType[]).map((emotion) => (
            <button
              key={emotion}
              onClick={() => setCurrentEmotion(emotion)}
              className={`p-4 rounded-xl transition-all ${
                currentEmotion === emotion
                  ? `bg-gradient-to-br ${emotionColors[emotion]} shadow-lg`
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                {emotionIcons[emotion]}
              </div>
              <div className="text-sm font-semibold capitalize">{emotion}</div>
            </button>
          ))}
        </div>

        <div className="mt-4 bg-white/10 rounded-xl p-4">
          <p className="text-sm text-center">
            <strong>"{exercise.text}"</strong> with <span className="text-yellow-400 capitalize">{currentEmotion}</span> energy
          </p>
        </div>
      </div>

      {/* Real-World Dialogue Mode */}
      <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <h3 className="text-2xl font-bold">💬 Real-World Dialogue</h3>
          </div>
          <button
            onClick={() => setShowDialogue(!showDialogue)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
          >
            {showDialogue ? "Hide" : "Practice"}
          </button>
        </div>

        <AnimatePresence>
          {showDialogue && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <p className="text-teal-100 text-sm mb-4">
                Practice in a realistic conversation context:
              </p>

              <div className="space-y-3">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold flex-shrink-0">
                      A
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-teal-200 mb-1">American Speaker</div>
                      <div className="text-lg">"{exercise.text}"</div>
                      <button
                        onClick={() => playExample(0.9)}
                        className="mt-2 px-3 py-1 bg-blue-500/30 hover:bg-blue-500/50 rounded-lg text-xs transition-all"
                      >
                        <Volume2 className="w-3 h-3 inline mr-1" />
                        Hear it
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold flex-shrink-0">
                      You
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-teal-200 mb-1">Your Response</div>
                      <div className="text-lg italic">(Record your natural response)</div>
                      <button
                        onClick={toggleRecording}
                        className={`mt-2 px-3 py-1 rounded-lg text-xs transition-all ${
                          isRecording 
                            ? "bg-red-500/50 animate-pulse" 
                            : "bg-purple-500/30 hover:bg-purple-500/50"
                        }`}
                      >
                        <Mic className="w-3 h-3 inline mr-1" />
                        {isRecording ? "Recording..." : "Record"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-teal-200 text-center mt-4">
                💡 Focus on natural rhythm and appropriate emotion for the context
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Complete Button */}
      <div className="flex items-center justify-center">
        <button
          onClick={markComplete}
          disabled={completed.has(exercise.id)}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-3 ${
            completed.has(exercise.id)
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
          }`}
        >
          <CheckCircle className="w-6 h-6" />
          {completed.has(exercise.id) ? "Completed ✅" : "Mark Complete & Continue"}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => {
            setCurrentExercise(Math.max(0, currentExercise - 1));
            setShowScore(false);
            setPronunciationScore(null);
          }}
          disabled={currentExercise === 0}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <span className="text-gray-400 font-semibold">
          {currentExercise + 1} of {allSpeakingExercises.length}
        </span>
        <button
          onClick={() => {
            setCurrentExercise(Math.min(allSpeakingExercises.length - 1, currentExercise + 1));
            setShowScore(false);
            setPronunciationScore(null);
          }}
          disabled={currentExercise === allSpeakingExercises.length - 1}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>

      {/* Accent Tips */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-start gap-3">
          <Zap className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg mb-3">🎙️ American Accent Master Tips:</h3>
            <ul className="space-y-2 text-indigo-100">
              <li>• <strong>R sounds:</strong> Americans pronounce all R's clearly (car, park, hard) - never silent</li>
              <li>• <strong>Flap T:</strong> T between vowels sounds like D ("water" → "wader", "better" → "bedder")</li>
              <li>• <strong>Reductions:</strong> "going to" → "gonna", "want to" → "wanna", "got to" → "gotta"</li>
              <li>• <strong>Rhythm:</strong> Stress content words (nouns, verbs), reduce function words (the, a, to)</li>
              <li>• <strong>Linking:</strong> Connect words smoothly - "What is up" becomes "Wha-tis-up" as one phrase</li>
              <li>• <strong>Intonation:</strong> Rise for yes/no questions, fall for statements and Wh- questions</li>
              <li>• <strong>Emotion:</strong> American English is expressive - vary your tone based on context</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
