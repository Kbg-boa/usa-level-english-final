import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, BellOff, Clock, Flame, Trophy, TrendingUp, Zap, MessageCircle, Mic, BookOpen, Target, Award, Calendar, BarChart3, Activity, Brain, AlertTriangle, CheckCircle, Star, Crown, Sparkles, Timer } from "lucide-react";

type NotificationType = "speed" | "conversation" | "accent" | "streak" | "milestone" | "emergency" | "weekly" | "identity" | "lossAversion";
type NotificationTime = "morning" | "afternoon" | "evening" | "smart";

interface NotificationSettings {
  enabled: boolean;
  morningTime: string;
  afternoonTime: string;
  eveningTime: string;
  smartTiming: boolean;
  silentMode: boolean;
  types: {
    speed: boolean;
    conversation: boolean;
    accent: boolean;
    streak: boolean;
    milestone: boolean;
    emergency: boolean;
    weekly: boolean;
    identity: boolean;
    lossAversion: boolean;
  };
  soundEnabled: boolean;
}

interface NotificationHistory {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  clicked: boolean;
}

interface StreakData {
  current: number;
  longest: number;
  lastActivity: number;
  multiplier: number;
  weeklyConsistency: number;
}

export default function NotificationsSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    morningTime: "09:00",
    afternoonTime: "14:00",
    eveningTime: "19:00",
    smartTiming: true,
    silentMode: false,
    types: {
      speed: true,
      conversation: true,
      accent: true,
      streak: true,
      milestone: true,
      emergency: true,
      weekly: true,
      identity: true,
      lossAversion: true,
    },
    soundEnabled: true,
  });

  const [permissionState, setPermissionState] = useState<"default" | "granted" | "denied">("default");
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({
    current: 1,
    longest: 1,
    lastActivity: Date.now(),
    multiplier: 1,
    weeklyConsistency: 0,
  });
  const [totalNotificationsSent, setTotalNotificationsSent] = useState(0);
  const [fluencyGrowth, setFluencyGrowth] = useState(0);

  // Load data
  useEffect(() => {
    const savedSettings = localStorage.getItem("notificationSettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Ensure types object exists with all required properties
      setSettings({
        ...settings,
        ...parsed,
        types: {
          speed: parsed.types?.speed ?? true,
          conversation: parsed.types?.conversation ?? true,
          accent: parsed.types?.accent ?? true,
          streak: parsed.types?.streak ?? true,
          milestone: parsed.types?.milestone ?? true,
          emergency: parsed.types?.emergency ?? true,
          weekly: parsed.types?.weekly ?? true,
          identity: parsed.types?.identity ?? true,
          lossAversion: parsed.types?.lossAversion ?? true,
        }
      });
    }

    const savedHistory = localStorage.getItem("notificationHistory");
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedStreak = localStorage.getItem("streakData");
    if (savedStreak) setStreakData(JSON.parse(savedStreak));

    const stats = localStorage.getItem("englishStats");
    if (stats) {
      const parsed = JSON.parse(stats);
      setStreakData(prev => ({
        ...prev,
        current: parsed.streakDays || 1,
        longest: Math.max(prev.longest, parsed.streakDays || 1),
      }));
    }

    // Check notification permission
    if ("Notification" in window) {
      setPermissionState(Notification.permission);
    }

    setTotalNotificationsSent(history.length);
    
    // Calculate fluency growth (simulate based on activity)
    const growth = Math.min(95, (history.length * 2) + (streakData.current * 5));
    setFluencyGrowth(growth);
  }, []);

  // Save settings
  useEffect(() => {
    localStorage.setItem("notificationSettings", JSON.stringify(settings));
  }, [settings]);

  // Save streak data
  useEffect(() => {
    localStorage.setItem("streakData", JSON.stringify(streakData));
    
    // Update stats
    const stats = localStorage.getItem("englishStats");
    if (stats) {
      const parsed = JSON.parse(stats);
      parsed.streakDays = streakData.current;
      localStorage.setItem("englishStats", JSON.stringify(parsed));
    }
  }, [streakData]);

  // Calculate streak multiplier
  useEffect(() => {
    let multiplier = 1;
    if (streakData.current >= 14) multiplier = 2;
    else if (streakData.current >= 7) multiplier = 1.5;
    else if (streakData.current >= 3) multiplier = 1.2;
    
    setStreakData(prev => ({ ...prev, multiplier }));
  }, [streakData.current]);

  // Smart notification system
  useEffect(() => {
    if (!settings.enabled) return;

    const checkSmartNotifications = () => {
      const now = new Date();
      const hour = now.getHours();
      const currentTime = `${hour.toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // Check if it's time for scheduled notification
      const scheduledTimes = [
        settings.morningTime,
        settings.afternoonTime,
        settings.eveningTime,
      ];

      if (scheduledTimes.includes(currentTime)) {
        sendSmartNotification();
      }

      // Emergency mode check (2 days inactive)
      const daysSinceActivity = Math.floor((Date.now() - streakData.lastActivity) / (1000 * 60 * 60 * 24));
      if (daysSinceActivity >= 2 && settings.types.emergency) {
        sendEmergencyNotification();
      }

      // Weekly report (Sunday 10am)
      if (now.getDay() === 0 && hour === 10 && settings.types.weekly) {
        sendWeeklyReport();
      }
    };

    const interval = setInterval(checkSmartNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [settings, streakData]);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser doesn't support notifications");
      return;
    }

    const permission = await Notification.requestPermission();
    setPermissionState(permission);

    if (permission === "granted") {
      setSettings({ ...settings, enabled: true });
      sendWelcomeNotification();
    }
  };

  const sendWelcomeNotification = () => {
    const notification = new Notification("🎉 Notifications Enabled!", {
      body: "You're all set! We'll help you stay consistent with smart reminders.",
      icon: "/icon.png",
    });

    addToHistory({
      type: "milestone",
      title: "Welcome!",
      message: "Notifications enabled successfully",
      clicked: false,
    });
  };

  const sendSmartNotification = () => {
    if (permissionState !== "granted") return;

    // Determine which type based on user's weak areas
    const types: NotificationType[] = [];
    if (settings.types.speed) types.push("speed");
    if (settings.types.conversation) types.push("conversation");
    if (settings.types.accent) types.push("accent");
    if (settings.types.streak && streakData.current > 0) types.push("streak");

    const randomType = types[Math.floor(Math.random() * types.length)];
    const notificationContent = getNotificationContent(randomType);

    const notification = new Notification(notificationContent.title, {
      body: notificationContent.message,
      icon: "/icon.png",
      badge: "/badge.png",
    });

    addToHistory({
      type: randomType,
      title: notificationContent.title,
      message: notificationContent.message,
      clicked: false,
    });
  };

  const sendEmergencyNotification = () => {
    if (permissionState !== "granted") return;

    const notification = new Notification("⚠️ You're Slipping!", {
      body: "2 days without practice. Quick 3-minute comeback session?",
      icon: "/icon.png",
    });

    addToHistory({
      type: "emergency",
      title: "⚠️ You're Slipping!",
      message: "2 days without practice",
      clicked: false,
    });
  };

  const sendWeeklyReport = () => {
    if (permissionState !== "granted") return;

    const notification = new Notification("📊 Weekly Fluency Report Ready!", {
      body: `Streak: ${streakData.current} days | Growth: +${fluencyGrowth}%`,
      icon: "/icon.png",
    });

    addToHistory({
      type: "weekly",
      title: "📊 Weekly Report",
      message: `Growth: +${fluencyGrowth}%`,
      clicked: false,
    });
  };

  const getNotificationContent = (type: NotificationType): { title: string; message: string } => {
    const contents: Record<NotificationType, { title: string; message: string }[]> = {
      speed: [
        { title: "⚡ Speed Drill Time!", message: "5-minute speed drill? Let's keep your reflexes sharp." },
        { title: "⚡ Quick Practice!", message: "Fast response training - 3 minutes is all you need." },
        { title: "⚡ Speed Check!", message: "How fast can you respond today? Let's find out!" },
      ],
      conversation: [
        { title: "💬 Small Talk Practice!", message: "Haven't practiced conversation today. 3 minutes?" },
        { title: "💬 Chat Session!", message: "Time to practice real conversations. Ready?" },
        { title: "💬 Speaking Time!", message: "Let's build your conversation confidence!" },
      ],
      accent: [
        { title: "🎙 Accent Training!", message: "Let's smooth that American R today." },
        { title: "🎙 Pronunciation Check!", message: "Practice your American accent - 5 minutes." },
        { title: "🎙 Sound Like a Native!", message: "Quick accent drill to sound more American." },
      ],
      streak: [
        { title: `🔥 Protect Your ${streakData.current}-Day Streak!`, message: "Don't lose it now. 2 minutes is enough." },
        { title: "🔥 Streak Alert!", message: `Keep your ${streakData.current}-day streak alive! Quick session?` },
        { title: "🔥 Stay Consistent!", message: "Your streak is counting on you. Let's do this!" },
      ],
      milestone: [
        { title: "🎉 Milestone Unlocked!", message: "You're making amazing progress!" },
        { title: "🏆 Achievement!", message: "Another milestone reached. Keep going!" },
        { title: "✨ Level Up!", message: "Your fluency is improving fast!" },
      ],
      emergency: [
        { title: "⚠️ Comeback Time!", message: "Quick 3-minute session to get back on track." },
        { title: "⚠️ Don't Give Up!", message: "Every expert was once a beginner. Let's go!" },
      ],
      weekly: [
        { title: "📊 Weekly Report!", message: "Check your progress this week." },
        { title: "📈 Stats Ready!", message: "See how much you've improved!" },
      ],
      identity: [
        { title: "🌟 Identity Boost!", message: "Remind yourself of your progress and goals." },
        { title: "💪 Keep Going!", message: "Stay focused on your journey to fluency." },
      ],
      lossAversion: [
        { title: "🚨 Loss Aversion Alert!", message: "Don't lose the progress you've made." },
        { title: "🔥 Stay Motivated!", message: "Keep pushing forward to avoid setbacks." },
      ],
    };

    const options = contents[type];
    return options[Math.floor(Math.random() * options.length)];
  };

  const addToHistory = (notification: Omit<NotificationHistory, "id" | "timestamp">) => {
    const newNotification: NotificationHistory = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setHistory(prev => [newNotification, ...prev.slice(0, 19)]);
    setTotalNotificationsSent(prev => prev + 1);
  };

  const sendTestNotification = () => {
    if (permissionState !== "granted") {
      alert("Please enable notifications first!");
      return;
    }

    const notification = new Notification("🧪 Test Notification", {
      body: "Great! Notifications are working perfectly!",
      icon: "/icon.png",
    });

    addToHistory({
      type: "milestone",
      title: "🧪 Test Notification",
      message: "Notifications are working!",
      clicked: false,
    });
  };

  const getTypeIcon = (type: NotificationType) => {
    const icons: Record<NotificationType, any> = {
      speed: Zap,
      conversation: MessageCircle,
      accent: Mic,
      streak: Flame,
      milestone: Trophy,
      emergency: AlertTriangle,
      weekly: BarChart3,
      identity: Star,
      lossAversion: AlertTriangle,
    };
    return icons[type];
  };

  const getTypeColor = (type: NotificationType) => {
    const colors: Record<NotificationType, string> = {
      speed: "text-yellow-400 bg-yellow-400/20",
      conversation: "text-blue-400 bg-blue-400/20",
      accent: "text-purple-400 bg-purple-400/20",
      streak: "text-orange-400 bg-orange-400/20",
      milestone: "text-green-400 bg-green-400/20",
      emergency: "text-red-400 bg-red-400/20",
      weekly: "text-cyan-400 bg-cyan-400/20",
      identity: "text-pink-400 bg-pink-400/20",
      lossAversion: "text-red-400 bg-red-400/20",
    };
    return colors[type];
  };

  const getStreakReward = () => {
    if (streakData.current >= 14) return "🔥🔥🔥 FIRE MASTER!";
    if (streakData.current >= 7) return "🔥🔥 ON FIRE!";
    if (streakData.current >= 3) return "🔥 HEATING UP!";
    return "💪 GETTING STARTED!";
  };

  const stats = localStorage.getItem("englishStats");
  const wordsLearned = stats ? JSON.parse(stats).wordsLearned || 0 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Bell className="w-10 h-10 text-blue-400" />
          Psychology Engine
        </h1>
        <p className="text-xl text-gray-300">
          Stay consistent with <span className="text-blue-400 font-bold">smart reminders</span> and motivation! 🔥
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-6 text-white text-center relative overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-2 right-2"
          >
            <Flame className="w-6 h-6 text-yellow-300" />
          </motion.div>
          <div className="mb-2 text-sm text-orange-100">Current Streak</div>
          <div className="text-5xl font-bold mb-1">{streakData.current}</div>
          <div className="text-orange-100 text-sm">days</div>
          <div className="mt-2 text-xs bg-white/20 px-2 py-1 rounded">
            x{streakData.multiplier} Multiplier
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-6 text-white text-center">
          <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-200" />
          <div className="text-sm text-yellow-100 mb-1">Longest Streak</div>
          <div className="text-4xl font-bold">{streakData.longest}</div>
          <div className="text-yellow-100 text-sm mt-1">days</div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white text-center">
          <Bell className="w-8 h-8 mx-auto mb-2" />
          <div className="text-sm text-blue-100 mb-1">Notifications Sent</div>
          <div className="text-4xl font-bold">{totalNotificationsSent}</div>
          <div className="text-blue-100 text-sm mt-1">total</div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2" />
          <div className="text-sm text-green-100 mb-1">Fluency Growth</div>
          <div className="text-4xl font-bold">+{fluencyGrowth}%</div>
          <div className="text-green-100 text-sm mt-1">this week</div>
        </div>
      </div>

      {/* Streak Status */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold mb-2">{getStreakReward()}</div>
            <div className="text-orange-100">
              {streakData.current < 3 ? "Keep going! 3 days = x1.2 multiplier" :
               streakData.current < 7 ? "Amazing! 7 days = x1.5 multiplier" :
               streakData.current < 14 ? "Incredible! 14 days = x2.0 multiplier" :
               "YOU'RE A LEGEND! Maximum multiplier unlocked! 🚀"}
            </div>
          </div>
          <div className="text-6xl">
            {streakData.current >= 14 ? "👑" :
             streakData.current >= 7 ? "🔥" :
             streakData.current >= 3 ? "⚡" : "💪"}
          </div>
        </div>
      </div>

      {/* Notification Permission */}
      {permissionState !== "granted" && (
        <div className="bg-red-600/20 border-2 border-red-600 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <BellOff className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">
                {permissionState === "denied" ? "Notifications Blocked" : "Enable Notifications"}
              </h3>
              {permissionState === "denied" ? (
                <div className="text-red-100 space-y-2">
                  <p>You've blocked notifications for this site. To enable them:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Click the lock icon 🔒 in your browser's address bar</li>
                    <li>Find "Notifications" and select "Allow"</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-red-100">
                    Get smart reminders to stay consistent with your learning! 
                    Our psychology engine knows the best time to motivate you.
                  </p>
                  <button
                    onClick={requestPermission}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white transition-all flex items-center gap-2"
                  >
                    <Bell className="w-5 h-5" />
                    Enable Smart Notifications
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Smart Reminder Types */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          Smart Reminder Types
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              type: "speed" as NotificationType,
              icon: Zap,
              title: "⚡ Speed Reminders",
              desc: "Keep your response reflexes sharp with quick drills",
              example: "5-minute speed drill? Let's go!",
            },
            {
              type: "conversation" as NotificationType,
              icon: MessageCircle,
              title: "💬 Conversation Reminders",
              desc: "Practice small talk and real conversations",
              example: "Haven't practiced small talk today. 3 minutes?",
            },
            {
              type: "accent" as NotificationType,
              icon: Mic,
              title: "🎙 Accent Reminders",
              desc: "Smooth your American pronunciation",
              example: "Let's smooth that American R today.",
            },
            {
              type: "streak" as NotificationType,
              icon: Flame,
              title: "🔥 Streak Protection",
              desc: "Don't lose your momentum",
              example: "Don't lose your 3-day streak. 2 minutes is enough.",
            },
            {
              type: "milestone" as NotificationType,
              icon: Trophy,
              title: "🏆 Milestone Alerts",
              desc: "Celebrate your achievements and boost dopamine",
              example: "You hit 100 words! Keep crushing it!",
            },
            {
              type: "emergency" as NotificationType,
              icon: AlertTriangle,
              title: "⚠️ Emergency Mode",
              desc: "Get back on track after 2+ days inactive",
              example: "You're slipping. 3-minute comeback session?",
            },
            {
              type: "weekly" as NotificationType,
              icon: BarChart3,
              title: "📊 Weekly Reports",
              desc: "Track your progress with detailed stats",
              example: "Weekly Report: Speed ↑15%, Naturalness ↑10%",
            },
            {
              type: "identity" as NotificationType,
              icon: Star,
              title: "🌟 Identity Boost",
              desc: "Remind yourself of your progress and goals",
              example: "Remind yourself of your journey to fluency.",
            },
            {
              type: "lossAversion" as NotificationType,
              icon: AlertTriangle,
              title: "🚨 Loss Aversion Alert",
              desc: "Don't lose the progress you've made",
              example: "Stay motivated to avoid setbacks.",
            },
          ].map((item) => (
            <div
              key={item.type}
              className={`p-4 rounded-xl border-2 transition-all ${
                settings.types[item.type]
                  ? "border-blue-600 bg-blue-600/20"
                  : "border-white/10 bg-white/5 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <item.icon className="w-6 h-6 text-white" />
                  <div>
                    <div className="font-bold text-white">{item.title}</div>
                    <div className="text-sm text-gray-400">{item.desc}</div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      types: { ...settings.types, [item.type]: !settings.types[item.type] },
                    })
                  }
                  className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                    settings.types[item.type]
                      ? "bg-blue-600 text-white"
                      : "bg-gray-600 text-white"
                  }`}
                >
                  {settings.types[item.type] ? "ON" : "OFF"}
                </button>
              </div>
              <div className="text-xs text-gray-400 italic bg-white/5 p-2 rounded">
                Example: "{item.example}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Timing */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-green-400" />
          Smart Timing
        </h3>

        <div className="space-y-4">
          {/* Smart Timing Toggle */}
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-purple-400" />
              <div>
                <div className="font-semibold text-white">AI-Powered Timing</div>
                <div className="text-sm text-gray-400">Let AI detect your peak performance times</div>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, smartTiming: !settings.smartTiming })}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                settings.smartTiming ? "bg-purple-600 text-white" : "bg-gray-600 text-white"
              }`}
            >
              {settings.smartTiming ? "ON" : "OFF"}
            </button>
          </div>

          {/* Manual Times */}
          {!settings.smartTiming && (
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">☀️ Morning</label>
                <input
                  type="time"
                  value={settings.morningTime}
                  onChange={(e) => setSettings({ ...settings, morningTime: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">🌆 Afternoon</label>
                <input
                  type="time"
                  value={settings.afternoonTime}
                  onChange={(e) => setSettings({ ...settings, afternoonTime: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">🌙 Evening</label>
                <input
                  type="time"
                  value={settings.eveningTime}
                  onChange={(e) => setSettings({ ...settings, eveningTime: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test Notification */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">🧪 Test Your Notifications</h3>
            <p className="text-gray-400 text-sm">Make sure everything is working correctly</p>
          </div>
          <button
            onClick={sendTestNotification}
            disabled={permissionState !== "granted"}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              permissionState === "granted"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            Send Test
          </button>
        </div>
      </div>

      {/* Psychology Info */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6" />
          💡 Why This Psychology Engine Works
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-purple-100">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-1" />
            <div>
              <strong>Consistency beats intensity:</strong> Daily reminders keep you on track even on busy days. 
              2 minutes daily beats 2 hours once a week.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-1" />
            <div>
              <strong>Streaks create habits:</strong> Your brain loves maintaining streaks - we use this to your advantage! 
              The multiplier system makes it addictive.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-1" />
            <div>
              <strong>Celebrating wins:</strong> Milestone alerts boost dopamine and keep you motivated. 
              Small victories = big momentum.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-1" />
            <div>
              <strong>Accountability:</strong> Notifications act like a personal coach checking in on you. 
              You're never alone in this journey!
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-1" />
            <div>
              <strong>Adaptive learning:</strong> We focus on YOUR weak areas, not generic reminders. 
              The AI learns what works for you.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-1" />
            <div>
              <strong>No spam:</strong> Maximum 1 notification per day (2 if streak at risk). 
              We respect your time and attention.
            </div>
          </div>
        </div>
      </div>

      {/* Notification History */}
      {history.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">📜 Recent Notifications</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.slice(0, 10).map((notif) => {
              const Icon = getTypeIcon(notif.type);
              return (
                <div
                  key={notif.id}
                  className="bg-white/5 rounded-lg p-4 flex items-start gap-3 hover:bg-white/10 transition-all"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(notif.type)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{notif.title}</div>
                    <div className="text-sm text-gray-400">{notif.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(notif.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}