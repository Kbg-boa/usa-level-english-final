import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Zap, Target, CheckCircle, XCircle, Clock, Star, TrendingUp, Award, Flame, AlertTriangle, Mic, PenTool } from "lucide-react";
import { allQuizQuestions, getQuestionsByDay, getDailyStats } from "../data/quiz-database";

interface PerformanceMetrics {
  accuracy: number;
  speed: number;
  slangUnderstanding: number;
  grammarControl: number;
}

interface Weakness {
  type: string;
  message: string;
  count: number;
}

export default function DailyChallenge() {
  const [currentDay, setCurrentDay] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [dailyProgress, setDailyProgress] = useState<Record<number, number>>({});
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [sessionAnswers, setSessionAnswers] = useState<Array<{ correct: boolean; time: number; category: string }>>([]);
  const [showPerformance, setShowPerformance] = useState(false);
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [eliteMode, setEliteMode] = useState(false);
  const [currentMode, setCurrentMode] = useState<"quiz" | "speaking" | "writing">("quiz");

  const dayQuestions = getQuestionsByDay(currentDay);
  const currentQuestion = dayQuestions[currentQuestionIndex];
  const stats = getDailyStats(currentDay);

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem("dailyProgress");
    if (savedProgress) {
      setDailyProgress(JSON.parse(savedProgress));
    }
    const savedStreak = localStorage.getItem("streak");
    if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }
    const savedXP = localStorage.getItem("userXP");
    if (savedXP) {
      const xpValue = parseInt(savedXP);
      setXp(xpValue);
      setLevel(Math.floor(xpValue / 1000) + 1);
    }
    const savedWeaknesses = localStorage.getItem("weaknesses");
    if (savedWeaknesses) {
      setWeaknesses(JSON.parse(savedWeaknesses));
    }
  }, []);

  // Smart Timer based on difficulty
  const getTimerDuration = (difficulty: string): number => {
    switch (difficulty) {
      case "easy": return 15;
      case "medium": return 10;
      case "hard": return 5;
      default: return 15;
    }
  };

  // Reset timer when question changes
  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(getTimerDuration(currentQuestion.difficulty));
    }
  }, [currentQuestionIndex, currentDay]);

  // Timer
  useEffect(() => {
    if (isTimerActive && timeLeft > 0 && !showExplanation) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showExplanation) {
      handleSubmit();
    }
  }, [timeLeft, isTimerActive, showExplanation]);

  const handleAnswerSelect = (answer: string) => {
    if (!showExplanation) {
      setSelectedAnswer(answer);
      if (!isTimerActive) {
        setIsTimerActive(true);
      }
    }
  };

  const calculateXPGain = (isCorrect: boolean, timeUsed: number, difficulty: string): number => {
    if (!isCorrect) return 10; // Participation XP

    let baseXP = 0;
    switch (difficulty) {
      case "easy": baseXP = 50; break;
      case "medium": baseXP = 100; break;
      case "hard": baseXP = 200; break;
      default: baseXP = 50;
    }

    // Speed bonus
    const maxTime = getTimerDuration(difficulty);
    const speedBonus = Math.floor((timeLeft / maxTime) * 50);
    
    // Streak multiplier
    const streakMultiplier = 1 + (streak * 0.1);

    return Math.floor((baseXP + speedBonus) * streakMultiplier);
  };

  const detectWeaknesses = (newAnswer: { correct: boolean; category: string }) => {
    if (!newAnswer.correct) {
      const existing = weaknesses.find(w => w.type === newAnswer.category);
      if (existing) {
        const updated = weaknesses.map(w => 
          w.type === newAnswer.category 
            ? { ...w, count: w.count + 1 }
            : w
        );
        setWeaknesses(updated);
        localStorage.setItem("weaknesses", JSON.stringify(updated));
      } else {
        const newWeakness: Weakness = {
          type: newAnswer.category,
          message: getWeaknessMessage(newAnswer.category),
          count: 1
        };
        const updated = [...weaknesses, newWeakness];
        setWeaknesses(updated);
        localStorage.setItem("weaknesses", JSON.stringify(updated));
      }
    }
  };

  const getWeaknessMessage = (category: string): string => {
    const messages: Record<string, string> = {
      "Modern Slang": "You struggle with slang nuance",
      "Business English": "Professional vocabulary needs work",
      "Pronunciation": "You hesitate with pronunciation",
      "Grammar": "You confuse grammar rules",
      "Conversation": "Casual conversation needs practice",
      "Writing": "Writing structure needs attention",
    };
    return messages[category] || "Keep practicing this area";
  };

  const handleSubmit = () => {
    if (selectedAnswer || timeLeft === 0) {
      setShowExplanation(true);
      setIsTimerActive(false);
      
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      const timeUsed = getTimerDuration(currentQuestion.difficulty) - timeLeft;
      
      // Track answer
      const answerData = { 
        correct: isCorrect, 
        time: timeUsed, 
        category: currentQuestion.category 
      };
      setSessionAnswers([...sessionAnswers, answerData]);

      // Detect weaknesses
      detectWeaknesses(answerData);
      
      if (isCorrect) {
        setScore(score + 1);
        
        // Update daily progress
        const newProgress = {
          ...dailyProgress,
          [currentDay]: (dailyProgress[currentDay] || 0) + 1
        };
        setDailyProgress(newProgress);
        localStorage.setItem("dailyProgress", JSON.stringify(newProgress));

        // Award XP
        const xpGain = calculateXPGain(isCorrect, timeUsed, currentQuestion.difficulty);
        const newXP = xp + xpGain;
        setXp(newXP);
        setLevel(Math.floor(newXP / 1000) + 1);
        localStorage.setItem("userXP", newXP.toString());
      } else {
        // Small XP for trying
        const newXP = xp + 10;
        setXp(newXP);
        localStorage.setItem("userXP", newXP.toString());
      }
    }
  };

  const calculatePerformance = (): PerformanceMetrics => {
    if (sessionAnswers.length === 0) {
      return { accuracy: 0, speed: 0, slangUnderstanding: 0, grammarControl: 0 };
    }

    const accuracy = (sessionAnswers.filter(a => a.correct).length / sessionAnswers.length) * 100;
    
    const avgTime = sessionAnswers.reduce((sum, a) => sum + a.time, 0) / sessionAnswers.length;
    const speed = Math.max(0, 100 - (avgTime * 10)); // Lower time = higher score
    
    const slangQuestions = sessionAnswers.filter(a => 
      a.category.includes("Slang") || a.category.includes("Informal")
    );
    const slangUnderstanding = slangQuestions.length > 0
      ? (slangQuestions.filter(a => a.correct).length / slangQuestions.length) * 100
      : 100;
    
    const grammarQuestions = sessionAnswers.filter(a => 
      a.category.includes("Grammar") || a.category.includes("Business")
    );
    const grammarControl = grammarQuestions.length > 0
      ? (grammarQuestions.filter(a => a.correct).length / grammarQuestions.length) * 100
      : 100;

    return { accuracy, speed, slangUnderstanding, grammarControl };
  };

  const handleNext = () => {
    if (currentQuestionIndex < dayQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setIsTimerActive(false);
    } else {
      // Show performance breakdown
      setShowPerformance(true);
      
      // Day completed
      const dayScore = Math.round((score / dayQuestions.length) * 100);
      if (dayScore >= 70) {
        setStreak(streak + 1);
        localStorage.setItem("streak", (streak + 1).toString());
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-400";
      case "medium": return "text-yellow-400";
      case "hard": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "multiple-choice": return "📝";
      case "fill-blank": return "✍️";
      case "true-false": return "✓✗";
      case "scenario": return "🎭";
      case "translation": return "🔄";
      case "slang-meaning": return "💬";
      default: return "❓";
    }
  };

  const progressPercentage = ((dailyProgress[currentDay] || 0) / stats.total) * 100;
  const xpToNextLevel = ((level * 1000) - xp) + 1000;
  const xpProgress = ((xp % 1000) / 1000) * 100;

  // Performance Breakdown Screen
  if (showPerformance) {
    const metrics = calculatePerformance();
    
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-block p-4 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-full mb-4">
            <Trophy className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Session Complete! 🎉</h1>
          <p className="text-xl text-gray-300">Here's how you performed</p>
        </motion.div>

        {/* Performance Metrics */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Accuracy Score</h3>
              <span className="text-3xl font-bold text-green-400">{Math.round(metrics.accuracy)}%</span>
            </div>
            <div className="h-3 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${metrics.accuracy}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Speed Score</h3>
              <span className="text-3xl font-bold text-blue-400">{Math.round(metrics.speed)}%</span>
            </div>
            <div className="h-3 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${metrics.speed}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Slang Understanding</h3>
              <span className="text-3xl font-bold text-purple-400">{Math.round(metrics.slangUnderstanding)}%</span>
            </div>
            <div className="h-3 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${metrics.slangUnderstanding}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Grammar Control</h3>
              <span className="text-3xl font-bold text-orange-400">{Math.round(metrics.grammarControl)}%</span>
            </div>
            <div className="h-3 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${metrics.grammarControl}%` }}
                transition={{ duration: 1, delay: 0.4 }}
              />
            </div>
          </motion.div>
        </div>

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-red-600/10 border border-red-600/30 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-bold text-white">Areas to Focus</h3>
            </div>
            <div className="space-y-2">
              {weaknesses.slice(0, 3).map((weakness, idx) => (
                <div key={idx} className="flex items-center justify-between bg-black/20 rounded-lg p-3">
                  <span className="text-red-300">⚠️ {weakness.message}</span>
                  <span className="text-red-400 font-bold">{weakness.count} mistakes</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* XP & Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">Level {level}</h3>
              <p className="text-yellow-200">{xpToNextLevel} XP to next level</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{xp}</div>
              <div className="text-yellow-200">Total XP</div>
            </div>
          </div>
          <div className="h-4 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-white to-yellow-200"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, delay: 0.7 }}
            />
          </div>
        </motion.div>

        <button
          onClick={() => {
            setShowPerformance(false);
            setCurrentQuestionIndex(0);
            setScore(0);
            setSessionAnswers([]);
          }}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg transition-all"
        >
          Continue Training
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Trophy className="w-10 h-10 text-yellow-400" />
          Daily Challenge
        </h1>
        <p className="text-xl text-gray-300">
          Test your skills • <span className="text-yellow-400 font-bold">Elite Mode</span> • Real simulations
        </p>
        <p className="text-sm text-gray-400 mt-2">
          3,500 questions over 7 days • Smart difficulty-based timer
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white text-center">
          <Flame className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{streak}</div>
          <div className="text-purple-200 text-sm mt-1">Day Streak</div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white text-center">
          <Target className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">Day {currentDay}</div>
          <div className="text-blue-200 text-sm mt-1">Current Day</div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white text-center">
          <CheckCircle className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{score}</div>
          <div className="text-green-200 text-sm mt-1">Session Score</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-6 text-white text-center">
          <Award className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">Lv {level}</div>
          <div className="text-yellow-200 text-sm mt-1">{xp} XP</div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-6 text-white text-center">
          <Star className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{stats.total}</div>
          <div className="text-orange-200 text-sm mt-1">Questions</div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">🔥 Training Mode</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => setCurrentMode("quiz")}
            className={`p-4 rounded-xl transition-all ${
              currentMode === "quiz"
                ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            <div className="text-3xl mb-2">📝</div>
            <div className="font-bold">Quiz Mode</div>
            <div className="text-xs mt-1 opacity-80">Multiple choice questions</div>
          </button>

          <button
            onClick={() => setCurrentMode("speaking")}
            className={`p-4 rounded-xl transition-all ${
              currentMode === "speaking"
                ? "bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            <div className="text-3xl mb-2">🎤</div>
            <div className="font-bold">Speaking Mode</div>
            <div className="text-xs mt-1 opacity-80">Real conversation simulation</div>
          </button>

          <button
            onClick={() => setCurrentMode("writing")}
            className={`p-4 rounded-xl transition-all ${
              currentMode === "writing"
                ? "bg-gradient-to-br from-orange-600 to-red-600 text-white shadow-lg"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            <div className="text-3xl mb-2">✍️</div>
            <div className="font-bold">Writing Mode</div>
            <div className="text-xs mt-1 opacity-80">Professional responses</div>
          </button>
        </div>
      </div>

      {/* Day Selector */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Select Day</h3>
        <div className="grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const dayStats = getDailyStats(day);
            const dayProgress = dailyProgress[day] || 0;
            const dayPercentage = (dayProgress / dayStats.total) * 100;
            
            return (
              <button
                key={day}
                onClick={() => {
                  setCurrentDay(day);
                  setCurrentQuestionIndex(0);
                  setSelectedAnswer(null);
                  setShowExplanation(false);
                  setIsTimerActive(false);
                }}
                className={`relative p-4 rounded-xl transition-all ${
                  currentDay === day
                    ? "bg-gradient-to-br from-yellow-600 to-orange-600 text-white shadow-lg scale-105"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                <div className="text-2xl font-bold">D{day}</div>
                <div className="text-xs mt-1">{dayProgress}/{dayStats.total}</div>
                
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-xl overflow-hidden">
                  <div 
                    className="h-full bg-green-400 transition-all"
                    style={{ width: `${dayPercentage}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Theme */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">📚 Day {currentDay} Focus</h3>
        <p className="text-lg text-indigo-100 mb-4">
          {currentDay === 1 && "Daily Conversation & Basic Slang"}
          {currentDay === 2 && "Business & Professional English"}
          {currentDay === 3 && "Slang & Social Media"}
          {currentDay === 4 && "Speaking & Pronunciation"}
          {currentDay === 5 && "Specialized Vocabulary"}
          {currentDay === 6 && "Mixed Review"}
          {currentDay === 7 && "Master Challenge"}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-indigo-200">Total</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-300">{stats.easy}</div>
            <div className="text-indigo-200">Easy (15s)</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-300">{stats.medium}</div>
            <div className="text-indigo-200">Medium (10s)</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-300">{stats.hard}</div>
            <div className="text-indigo-200">Hard (5s)</div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8"
        >
          {/* Question Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getTypeIcon(currentQuestion.type)}</span>
              <div>
                <div className="text-sm text-gray-400">{currentQuestion.category}</div>
                <div className={`text-sm font-semibold ${getDifficultyColor(currentQuestion.difficulty)}`}>
                  {currentQuestion.difficulty.toUpperCase()} • {getTimerDuration(currentQuestion.difficulty)}s
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                {currentQuestionIndex + 1} / {dayQuestions.length}
              </div>
              
              {/* Smart Timer */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${
                timeLeft <= 3 ? "bg-red-600 text-white animate-pulse" : 
                timeLeft <= 5 ? "bg-orange-600/30 text-orange-400" :
                "bg-blue-600/20 text-blue-400"
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono text-xl">{timeLeft}s</span>
              </div>
            </div>
          </div>

          {/* Real World Context */}
          <div className="bg-purple-600/20 border border-purple-600/50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">🎯</span>
              <div>
                <div className="text-sm font-semibold text-purple-300 mb-1">Real-World Context</div>
                <div className="text-sm text-purple-200">{currentQuestion.realWorldContext}</div>
                <div className="text-xs text-purple-300 mt-2">Vibe: {currentQuestion.vibe}</div>
              </div>
            </div>
          </div>

          {/* Question */}
          <h3 className="text-2xl font-bold text-white mb-6">
            {currentQuestion.question}
          </h3>

          {/* Answer Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options?.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correctAnswer;
              const showCorrect = showExplanation && isCorrect;
              const showIncorrect = showExplanation && isSelected && !isCorrect;

              return (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  whileHover={{ scale: showExplanation ? 1 : 1.02 }}
                  whileTap={{ scale: showExplanation ? 1 : 0.98 }}
                  className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                    showCorrect
                      ? "bg-green-600 border-2 border-green-400 text-white"
                      : showIncorrect
                      ? "bg-red-600 border-2 border-red-400 text-white"
                      : isSelected
                      ? "bg-blue-600 border-2 border-blue-400 text-white"
                      : "bg-white/10 border-2 border-white/20 text-gray-300 hover:bg-white/20"
                  }`}
                  disabled={showExplanation}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    showCorrect
                      ? "bg-green-400"
                      : showIncorrect
                      ? "bg-red-400"
                      : isSelected
                      ? "bg-blue-400"
                      : "bg-white/20"
                  }`}>
                    {showCorrect && <CheckCircle className="w-5 h-5 text-white" />}
                    {showIncorrect && <XCircle className="w-5 h-5 text-white" />}
                    {!showExplanation && <span className="font-bold">{String.fromCharCode(65 + index)}</span>}
                  </div>
                  <span className="flex-1 text-lg">{option}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Enhanced Explanation */}
          <AnimatePresence>
            {showExplanation && (() => {
              const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
              const xpGain = calculateXPGain(isCorrect, getTimerDuration(currentQuestion.difficulty) - timeLeft, currentQuestion.difficulty);
              
              return (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className={`rounded-xl p-6 ${
                    isCorrect
                      ? "bg-green-600/20 border border-green-600/50"
                      : "bg-red-600/20 border border-red-600/50"
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <>
                            <CheckCircle className="w-6 h-6 text-green-400" />
                            <span className="font-bold text-lg text-green-300">Correct! 🎉</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-6 h-6 text-red-400" />
                            <span className="font-bold text-lg text-red-300">Not quite!</span>
                          </>
                        )}
                      </div>
                      <div className="text-yellow-400 font-bold">+{xpGain} XP</div>
                    </div>
                    
                    <p className="text-white mb-4">
                      <strong>Explanation:</strong> {currentQuestion.explanation}
                    </p>

                    {!isCorrect && (
                      <p className="text-white/90 mb-4">
                        <strong>Correct answer:</strong> {currentQuestion.correctAnswer}
                      </p>
                    )}

                    {/* Similar Expressions */}
                    {currentQuestion.category.includes("Slang") && (
                      <div className="mt-4 p-4 bg-black/20 rounded-lg">
                        <p className="text-sm font-semibold text-white mb-2">💬 Similar expressions:</p>
                        <div className="space-y-1 text-sm text-gray-300">
                          <div>• "That was insane"</div>
                          <div>• "That was crazy good"</div>
                          <div>• "That was lit"</div>
                          <div>• "That was next level"</div>
                        </div>
                        <p className="text-xs text-yellow-300 mt-3">
                          ⚠️ Usage: Safe with friends. Avoid in formal business settings.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                  >
                    {currentQuestionIndex < dayQuestions.length - 1 ? (
                      <>
                        Next Question
                        <TrendingUp className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        See Performance
                        <Trophy className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {/* Submit Button */}
          {!showExplanation && (
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all"
            >
              Submit Answer
            </button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-semibold">Session Progress</span>
          <span className="text-gray-400">{currentQuestionIndex + 1} / {dayQuestions.length}</span>
        </div>
        <div className="h-3 bg-black/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / dayQuestions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
