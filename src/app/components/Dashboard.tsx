import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Brain, BookOpen, Mic, MessageCircle, MessageSquare, PenTool, Flame, Trophy, Target, Zap, TrendingUp, FileCheck, Headphones, Radio, Lightbulb, Book, Globe, Phone, Settings, Sparkles, Clock, CheckCircle, ArrowUp, Youtube, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Dashboard() {
  const [currentDay, setCurrentDay] = useState(1);
  const [showAllModules, setShowAllModules] = useState(false);
  const [stats, setStats] = useState({
    fluencyScore: 12,
    streakDays: 1,
    todayProgress: 0,
    completedToday: 0,
    totalTodayTasks: 3,
    // Mini-dashboard metrics
    speed: 15,
    naturalness: 8,
    confidence: 10,
    // NEW: Weakest area
    weakestArea: "Naturalness",
    // NEW: Streak risk
    streakStatus: "Safe", // or "At Risk"
    hoursLeft: 24,
    // NEW: Momentum
    momentum: "Building", // Low / Building / Strong
    // NEW: Consistency Score
    consistencyScore: 72,
  });

  const [todayTasks, setTodayTasks] = useState([
    { id: 1, title: "Conversation Session", time: "15 min", link: "/real-conversation", completed: false },
    { id: 2, title: "Native Video (AI Selected)", time: "12 min", link: "/youtube", completed: false },
    { id: 3, title: "Accent Drill", time: "10 min", link: "/speaking", completed: false },
  ]);

  useEffect(() => {
    const savedStats = localStorage.getItem("dashboardStats");
    if (savedStats) {
      setStats({ ...stats, ...JSON.parse(savedStats) });
    }

    const savedDay = localStorage.getItem("currentDay");
    if (savedDay) setCurrentDay(parseInt(savedDay));

    const savedTasks = localStorage.getItem("todayTasks");
    if (savedTasks) setTodayTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboardStats", JSON.stringify(stats));
    localStorage.setItem("currentDay", currentDay.toString());
    localStorage.setItem("todayTasks", JSON.stringify(todayTasks));
  }, [stats, currentDay, todayTasks]);

  const toggleTaskComplete = (taskId: number) => {
    const updatedTasks = todayTasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTodayTasks(updatedTasks);
    
    const completed = updatedTasks.filter(t => t.completed).length;
    const progress = Math.round((completed / updatedTasks.length) * 100);
    setStats(prev => ({
      ...prev,
      completedToday: completed,
      todayProgress: progress
    }));
  };

  // Helper: Get fluency level name
  const getFluencyLevel = (score: number) => {
    if (score < 20) return { level: 1, name: "Foundation" };
    if (score < 40) return { level: 2, name: "Developing" };
    if (score < 60) return { level: 3, name: "Natural" };
    if (score < 80) return { level: 4, name: "Confident" };
    return { level: 5, name: "Fluent" };
  };

  // Helper: Get weakest area link
  const getWeakestAreaLink = () => {
    if (stats.weakestArea === "Speed") return "/real-conversation";
    if (stats.weakestArea === "Naturalness") return "/slang";
    if (stats.weakestArea === "Confidence") return "/speaking";
    return "/real-conversation";
  };

  // Helper: Get momentum color
  const getMomentumColor = () => {
    if (stats.momentum === "Low") return "text-yellow-400";
    if (stats.momentum === "Building") return "text-blue-400";
    return "text-green-400";
  };

  // 🔥 4 PILLARS STRUCTURE (SIMPLIFIED NAMES)
  const pillars = [
    {
      id: 1,
      name: "FLUENCY",
      emoji: "🔥",
      tagline: "Speed. Instinct. Confidence.",
      color: "from-orange-500 to-red-600",
      modules: [
        { to: "/real-conversation", icon: Phone, title: "Real Conversation", desc: "Phone mode with AI" },
        { to: "/conversation", icon: MessageCircle, title: "Conversation Simulator", desc: "Real-time practice" },
        { to: "/thinking", icon: Lightbulb, title: "Think-in-English", desc: "Stop translating" },
        { to: "/storytelling", icon: Book, title: "Storytelling", desc: "Narrative fluency" },
      ]
    },
    {
      id: 2,
      name: "INPUT",
      emoji: "🎧",
      tagline: "Train your ear.",
      color: "from-purple-500 to-indigo-600",
      modules: [
        { to: "/youtube", icon: Youtube, title: "Native Exposure", desc: "AI-curated content" },
        { to: "/listening", icon: Headphones, title: "Listening", desc: "Understand natives" },
        { to: "/pronunciation", icon: Mic, title: "Pronunciation Lab", desc: "Shadowing + Accent drills" },
      ]
    },
    {
      id: 3,
      name: "STRUCTURE",
      emoji: "🧩",
      tagline: "Precision without stiffness.",
      color: "from-blue-500 to-cyan-600",
      modules: [
        { to: "/vocabulary", icon: BookOpen, title: "Vocabulary", desc: "Essential words" },
        { to: "/grammar", icon: FileCheck, title: "Grammar", desc: "Speak correctly" },
        { to: "/verbs", icon: Zap, title: "Verbs", desc: "Master verb forms" },
        { to: "/slang", icon: MessageSquare, title: "Slang", desc: "Natural expressions" },
      ]
    },
    {
      id: 4,
      name: "PROFESSIONAL",
      emoji: "💼",
      tagline: "Communicate with authority.",
      color: "from-gray-600 to-gray-800",
      modules: [
        { to: "/writing", icon: PenTool, title: "Writing", desc: "Business & emails" },
        { to: "/cultural", icon: Globe, title: "Cultural Context", desc: "American culture" },
        { to: "/challenge", icon: Trophy, title: "Daily Challenge", desc: "Test your skills" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6 space-y-6">
      {/* HEADER */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="text-6xl mb-2">🇺🇸</div>
          <h1 className="text-5xl font-bold text-white mb-2">USA LEVEL ENGLISH</h1>
          <p className="text-xl text-purple-300 font-semibold">7-Day Fluency Upgrade</p>
        </motion.div>

        <div className="flex items-center justify-center gap-6 text-lg">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2">
            <span className="text-purple-300 font-semibold">Day {currentDay}/7</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2">
            <div className="flex items-center gap-2">
              <span className="text-yellow-300">🔥 Streak: {stats.streakDays} day{stats.streakDays > 1 ? 's' : ''}</span>
              {stats.streakStatus === "Safe" ? (
                <span className="text-green-400 text-sm">• Safe</span>
              ) : (
                <span className="text-red-400 text-sm">• At Risk ({stats.hoursLeft}h left)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CORE STATS */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-lg font-semibold opacity-90">Fluency Level</div>
              <div className="text-sm text-purple-200">Level {getFluencyLevel(stats.fluencyScore).level} — {getFluencyLevel(stats.fluencyScore).name}</div>
            </div>
            <Target className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-6xl font-bold mb-2">{stats.fluencyScore}%</div>
          
          {/* Mini-Dashboard: Speed, Naturalness, Confidence */}
          <div className="space-y-2 mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span className="text-purple-100">Speed</span>
              </div>
              <div className="flex items-center gap-1 font-semibold">
                <span>{stats.speed}%</span>
                <ArrowUp className="w-4 h-4 text-green-300" />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-300" />
                <span className="text-purple-100">Naturalness</span>
              </div>
              <div className="flex items-center gap-1 font-semibold">
                <span>{stats.naturalness}%</span>
                <ArrowUp className="w-4 h-4 text-green-300" />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-300" />
                <span className="text-purple-100">Confidence</span>
              </div>
              <div className="flex items-center gap-1 font-semibold">
                <span>{stats.confidence}%</span>
                <ArrowUp className="w-4 h-4 text-green-300" />
              </div>
            </div>
          </div>
          
          {/* Weakest Area Indicator */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-purple-200">
                🎯 Current Focus: <span className="font-bold text-white">{stats.weakestArea}</span>
              </div>
            </div>
            <Link
              to={getWeakestAreaLink()}
              className="mt-2 w-full bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              ▶ Train This Now
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold opacity-90">Today's Mission Progress</div>
            <Flame className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-6xl font-bold">{stats.todayProgress}%</div>
          <div className="mt-2 text-orange-200 text-sm">{stats.completedToday}/{stats.totalTodayTasks} tasks completed</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold opacity-90">Current Phase</div>
            <Trophy className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-4xl font-bold mb-2">Phase {getFluencyLevel(stats.fluencyScore).level} — {getFluencyLevel(stats.fluencyScore).name}</div>
          <div className="mt-2 text-green-200 text-sm">Consistency builds fluency.</div>
        </motion.div>
      </div>

      {/* TODAY'S FOCUS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-10 h-10 text-yellow-400" />
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white">🎯 TODAY'S FOCUS</h2>
            <p className="text-gray-300">Complete these 3 essential tasks</p>
          </div>
          <div className="text-right space-y-2">
            <div>
              <div className="text-sm text-gray-400">Momentum</div>
              <div className={`text-lg font-bold ${getMomentumColor()}`}>
                {stats.momentum}
              </div>
            </div>
            <div className="pt-2 border-t border-white/20">
              <div className="text-xs text-gray-500">Consistency Score</div>
              <div className="text-md font-bold text-blue-300">
                {stats.consistencyScore}%
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {todayTasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                task.completed 
                  ? "bg-green-600/20 border border-green-600/50" 
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              <button
                onClick={() => toggleTaskComplete(task.id)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  task.completed
                    ? "bg-green-600 border-green-600"
                    : "border-gray-400 hover:border-white"
                }`}
              >
                {task.completed && <CheckCircle className="w-5 h-5 text-white" />}
              </button>

              <div className="flex-1">
                <div className={`text-lg font-semibold ${task.completed ? "text-green-300 line-through" : "text-white"}`}>
                  {idx + 1}. {task.title}
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {task.time}
                </div>
              </div>

              {!task.completed && (
                <Link
                  to={task.link}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg text-white font-semibold transition-all"
                >
                  Start
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        <div className="text-center text-gray-400 text-sm">
          ⏱ Estimated time: <strong className="text-white">30–40 min total</strong>
        </div>
      </motion.div>

      {/* QUICK START BUTTONS - SIMPLIFIED TO 2 */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          to="/real-conversation"
          className="bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl p-6 text-white transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold">Start 10-Min Fluency Sprint</div>
          </div>
          <p className="text-green-100 mb-4">Quick conversation practice session</p>
          <div className="text-sm bg-white/20 rounded-lg px-4 py-2 inline-block">▶ Start Now</div>
        </Link>

        <Link
          to="/youtube"
          className="bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl p-6 text-white transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <div className="text-2xl font-bold">Today's AI Video</div>
          </div>
          <p className="text-purple-100 mb-4">Personalized content based on your level</p>
          <div className="text-sm bg-white/20 rounded-lg px-4 py-2 inline-block">▶ Watch Now</div>
        </Link>
      </div>

      {/* 4 PILLARS */}
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">🚀 Your Learning System</h2>
          <p className="text-xl text-gray-300">4 Pillars of American Fluency</p>
        </div>

        {pillars.map((pillar, idx) => (
          <motion.div
            key={pillar.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${pillar.color} p-6`}>
              <div className="flex items-center gap-4">
                <div className="text-5xl">{pillar.emoji}</div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-white mb-1">
                    PILLAR {pillar.id} — {pillar.name}
                  </h3>
                  <p className="text-white/90 text-lg">{pillar.tagline}</p>
                </div>
              </div>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-4">
              {pillar.modules.map((module) => {
                const Icon = module.icon;
                return (
                  <Link
                    key={module.to}
                    to={module.to}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-xl p-5 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${pillar.color} group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                          {module.title}
                        </div>
                        <div className="text-sm text-gray-400">{module.desc}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* PERFORMANCE SUPPORT - Transversal Systems */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🤖</div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-white mb-1">
                PERFORMANCE SUPPORT
              </h3>
              <p className="text-white/90 text-lg">AI-Powered Performance System</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-4">
          <Link
            to="/coach"
            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-xl p-5 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                  Personal Coach
                </div>
                <div className="text-sm text-gray-400">AI feedback & guidance</div>
              </div>
            </div>
          </Link>

          <Link
            to="/settings"
            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-xl p-5 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                  Settings
                </div>
                <div className="text-sm text-gray-400">Customize your experience</div>
              </div>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* REMOVED: Duplicate motivational footer - message already in Performance Phase card */}
    </div>
  );
}