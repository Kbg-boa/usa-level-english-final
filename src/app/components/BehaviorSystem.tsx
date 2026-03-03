import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Zap, Trophy, Star, TrendingUp, Lock, Unlock, Gift, Shield, Target, Award, Sparkles, Heart, Crown, Flame, Timer, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";

interface UnlockedFeature {
  id: string;
  name: string;
  description: string;
  unlockedAt: number;
  streakRequired: number;
}

interface ComebackBonus {
  active: boolean;
  bonusMultiplier: number;
  expiresAt: number;
}

interface IdentityStats {
  sentencesSpoken: number;
  hesitationReduction: number;
  responseSpeedImprovement: number;
  weekStartDate: number;
}

export default function BehaviorSystem() {
  const [streakData, setStreakData] = useState({
    current: 1,
    longest: 1,
    multiplier: 1,
  });
  const [unlockedFeatures, setUnlockedFeatures] = useState<UnlockedFeature[]>([]);
  const [comebackBonus, setComebackBonus] = useState<ComebackBonus>({
    active: false,
    bonusMultiplier: 0,
    expiresAt: 0,
  });
  const [identityStats, setIdentityStats] = useState<IdentityStats>({
    sentencesSpoken: 243,
    hesitationReduction: 18,
    responseSpeedImprovement: 1.4,
    weekStartDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
  });
  const [silentMode, setSilentMode] = useState(false);
  const [lossAversionTimer, setLossAversionTimer] = useState<number | null>(null);

  const features = [
    {
      id: "slang-pack",
      name: "🔥 Advanced Slang Pack",
      description: "Unlock 500+ Gen-Z and native slang expressions",
      streakRequired: 3,
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: "advanced-scenario",
      name: "💼 Advanced Business Scenarios",
      description: "Professional negotiations, presentations, and meetings",
      streakRequired: 7,
      icon: Trophy,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "chaos-mode",
      name: "🎯 Chaos Mode",
      description: "Random accents, interruptions, and real-world distractions",
      streakRequired: 14,
      icon: Target,
      color: "from-red-500 to-orange-500",
    },
    {
      id: "native-review",
      name: "👑 Native Speaker Review",
      description: "Get your recordings reviewed by real Americans",
      streakRequired: 21,
      icon: Crown,
      color: "from-blue-500 to-cyan-500",
    },
  ];

  // Load data
  useEffect(() => {
    const stats = localStorage.getItem("englishStats");
    if (stats) {
      const parsed = JSON.parse(stats);
      setStreakData({
        current: parsed.streakDays || 1,
        longest: Math.max(streakData.longest, parsed.streakDays || 1),
        multiplier: getMultiplier(parsed.streakDays || 1),
      });
    }

    const unlocked = localStorage.getItem("unlockedFeatures");
    if (unlocked) setUnlockedFeatures(JSON.parse(unlocked));

    const bonus = localStorage.getItem("comebackBonus");
    if (bonus) setComebackBonus(JSON.parse(bonus));

    const identity = localStorage.getItem("identityStats");
    if (identity) setIdentityStats(JSON.parse(identity));

    const silent = localStorage.getItem("silentMode");
    if (silent) setSilentMode(JSON.parse(silent));
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem("unlockedFeatures", JSON.stringify(unlockedFeatures));
  }, [unlockedFeatures]);

  useEffect(() => {
    localStorage.setItem("comebackBonus", JSON.stringify(comebackBonus));
  }, [comebackBonus]);

  useEffect(() => {
    localStorage.setItem("identityStats", JSON.stringify(identityStats));
  }, [identityStats]);

  useEffect(() => {
    localStorage.setItem("silentMode", JSON.stringify(silentMode));
  }, [silentMode]);

  // Auto-unlock features based on streak
  useEffect(() => {
    features.forEach((feature) => {
      if (streakData.current >= feature.streakRequired) {
        const alreadyUnlocked = unlockedFeatures.some(f => f.id === feature.id);
        if (!alreadyUnlocked) {
          const newFeature: UnlockedFeature = {
            id: feature.id,
            name: feature.name,
            description: feature.description,
            unlockedAt: Date.now(),
            streakRequired: feature.streakRequired,
          };
          setUnlockedFeatures(prev => [...prev, newFeature]);
        }
      }
    });
  }, [streakData.current]);

  // Comeback bonus logic
  useEffect(() => {
    const lastActivity = localStorage.getItem("lastActivity");
    if (lastActivity) {
      const daysSince = Math.floor((Date.now() - parseInt(lastActivity)) / (1000 * 60 * 60 * 24));
      if (daysSince >= 1 && daysSince <= 3 && !comebackBonus.active) {
        // Offer comeback bonus
        setComebackBonus({
          active: true,
          bonusMultiplier: 0.2,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        });
      }
    }
  }, []);

  // Loss aversion timer
  useEffect(() => {
    if (streakData.current > 0) {
      const lastActivity = localStorage.getItem("lastActivity");
      if (lastActivity) {
        const hoursSince = Math.floor((Date.now() - parseInt(lastActivity)) / (1000 * 60 * 60));
        const hoursUntilLoss = 24 - hoursSince;
        if (hoursUntilLoss > 0 && hoursUntilLoss <= 6) {
          setLossAversionTimer(hoursUntilLoss);
        }
      }
    }
  }, [streakData.current]);

  const getMultiplier = (streak: number): number => {
    if (streak >= 14) return 2.0;
    if (streak >= 7) return 1.5;
    if (streak >= 3) return 1.2;
    return 1.0;
  };

  const isFeatureUnlocked = (featureId: string): boolean => {
    return unlockedFeatures.some(f => f.id === featureId);
  };

  const getFeatureProgress = (streakRequired: number): number => {
    return Math.min(100, (streakData.current / streakRequired) * 100);
  };

  const identityMessages = [
    "You're building American-level reflexes.",
    "You're becoming someone who speaks fast and naturally.",
    "You're transforming into a fluent English speaker.",
    "You're developing native-like pronunciation habits.",
    "You're evolving into someone who thinks in English.",
  ];

  const getRandomIdentityMessage = () => {
    return identityMessages[Math.floor(Math.random() * identityMessages.length)];
  };

  const weeklyIdentityReport = {
    sentencesSpoken: identityStats.sentencesSpoken,
    hesitationReduction: identityStats.hesitationReduction,
    responseSpeed: identityStats.responseSpeedImprovement,
    daysActive: Math.floor((Date.now() - identityStats.weekStartDate) / (1000 * 60 * 60 * 24)),
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Brain className="w-10 h-10 text-purple-400" />
          Behavior System
        </h1>
        <p className="text-xl text-gray-300">
          Advanced <span className="text-purple-400 font-bold">psychology & motivation</span> system 🧠
        </p>
      </div>

      {/* Identity Reinforcement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-xl p-8 text-white relative overflow-hidden"
      >
        <motion.div
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-purple-600/50 via-pink-600/50 to-purple-600/50"
          style={{ backgroundSize: "200% 200%" }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-8 h-8 text-yellow-300" />
            <h2 className="text-2xl font-bold">🌟 Identity Reinforcement</h2>
          </div>
          <div className="text-3xl font-bold mb-2">{getRandomIdentityMessage()}</div>
          <div className="text-purple-100 text-lg">
            You're not just learning English — you're becoming a fluent, confident speaker.
          </div>
        </div>
      </motion.div>

      {/* Loss Aversion Warning */}
      <AnimatePresence>
        {lossAversionTimer !== null && lossAversionTimer <= 6 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <AlertTriangle className="w-10 h-10 text-yellow-300" />
                </motion.div>
                <div>
                  <div className="text-2xl font-bold mb-1">
                    🚨 You'll lose your x{streakData.multiplier} multiplier in {lossAversionTimer} hours!
                  </div>
                  <div className="text-red-100">
                    Don't let {streakData.current} days of progress go to waste. Quick 2-minute session?
                  </div>
                </div>
              </div>
              <div className="text-6xl">⏰</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comeback Bonus */}
      <AnimatePresence>
        {comebackBonus.active && Date.now() < comebackBonus.expiresAt && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center gap-4">
              <Gift className="w-10 h-10 text-yellow-300" />
              <div className="flex-1">
                <div className="text-2xl font-bold mb-1">
                  ⚡ Comeback Bonus Available!
                </div>
                <div className="text-green-100">
                  Complete today's practice and earn <strong>+{comebackBonus.bonusMultiplier} multiplier bonus</strong>!
                  Reduces the pain of breaking your streak. 💪
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-200">Expires in</div>
                <div className="text-2xl font-bold">
                  {Math.floor((comebackBonus.expiresAt - Date.now()) / (1000 * 60 * 60))}h
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Milestone Unlocks */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Unlock className="w-6 h-6 text-yellow-400" />
          Streak Milestone Unlocks
        </h3>
        <p className="text-gray-400 mb-6">
          Your streak isn't just decorative — it unlocks powerful features! 🔓
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const unlocked = isFeatureUnlocked(feature.id);
            const progress = getFeatureProgress(feature.streakRequired);
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative rounded-xl overflow-hidden ${
                  unlocked
                    ? `bg-gradient-to-br ${feature.color} p-[2px]`
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <div className="bg-gray-900 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-lg">{feature.name}</div>
                        <div className="text-sm text-gray-400">{feature.description}</div>
                      </div>
                    </div>
                    {unlocked ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <Lock className="w-6 h-6 text-gray-500" />
                    )}
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {feature.streakRequired} day streak required
                      </span>
                      <span className={unlocked ? "text-green-400 font-bold" : "text-gray-400"}>
                        {streakData.current}/{feature.streakRequired} days
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${feature.color}`}
                      />
                    </div>
                  </div>

                  {unlocked && (
                    <div className="mt-4 bg-green-600/20 border border-green-600 rounded-lg p-3">
                      <div className="text-green-400 text-sm font-bold">
                        ✅ UNLOCKED! This feature is now available in your modules.
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Silent Progress Mode */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-400" />
              🧘 Silent Progress Mode
            </h3>
            <p className="text-gray-400">
              No streak pressure, no emergency notifications — just calm daily reminders.
              Perfect if you hate the pressure! 💆
            </p>
          </div>
          <button
            onClick={() => setSilentMode(!silentMode)}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              silentMode
                ? "bg-blue-600 text-white"
                : "bg-gray-600 text-white hover:bg-gray-700"
            }`}
          >
            {silentMode ? "ON" : "OFF"}
          </button>
        </div>

        {silentMode && (
          <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4 mt-4">
            <div className="text-blue-100 text-sm space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Streak multiplier still active</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>No loss aversion warnings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>No emergency mode triggers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Calm, supportive reminders only</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Identity Report */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          📊 Weekly Identity Report
        </h3>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-5xl font-bold mb-2">{weeklyIdentityReport.sentencesSpoken}</div>
            <div className="text-indigo-200">sentences spoken this week</div>
            <div className="mt-3 text-sm text-indigo-100">
              You're building fluency through volume! 💬
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-5xl font-bold mb-2">{weeklyIdentityReport.hesitationReduction}%</div>
            <div className="text-indigo-200">hesitation reduced</div>
            <div className="mt-3 text-sm text-indigo-100">
              You're becoming more confident! 🚀
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-5xl font-bold mb-2">{weeklyIdentityReport.responseSpeed}s</div>
            <div className="text-indigo-200">faster responses</div>
            <div className="mt-3 text-sm text-indigo-100">
              Your brain is getting faster! ⚡
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-6">
          <div className="text-lg font-bold mb-3">🎯 Your Transformation This Week:</div>
          <div className="space-y-2 text-indigo-100">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                You spoke <strong>{weeklyIdentityReport.sentencesSpoken} sentences</strong> — that's more than most people speak in their native language during practice!
              </div>
            </div>
            <div className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                Your hesitation dropped by <strong>{weeklyIdentityReport.hesitationReduction}%</strong> — you're thinking in English, not translating!
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                You're responding <strong>{weeklyIdentityReport.responseSpeed} seconds faster</strong> — native-level reflex is building!
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="text-2xl font-bold mb-2">
            You're not just learning. You're transforming. 🌟
          </div>
          <div className="text-indigo-200">
            Keep going — fluency is just consistency multiplied by time.
          </div>
        </div>
      </div>

      {/* Dopamine Prediction */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Heart className="w-6 h-6" />
          💡 Dopamine Prediction
        </h3>
        <div className="space-y-3">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="font-bold mb-1">Based on yesterday's progress:</div>
            <div className="text-pink-100">
              Your naturalness improved by <strong>3%</strong>. Want to push it further today?
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="font-bold mb-1">Personalized insight:</div>
            <div className="text-pink-100">
              You practice best around <strong>7-9 PM</strong>. That's when your accuracy is highest! 🎯
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="font-bold mb-1">Achievement unlocked:</div>
            <div className="text-pink-100">
              You're in the <strong>top 5%</strong> of consistent learners. Your dedication shows! 👑
            </div>
          </div>
        </div>
      </div>

      {/* Tone Variation Info */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">🎭 Adaptive Tone System</h3>
        <p className="text-gray-400 mb-4">
          We alternate between 3 motivation styles to prevent burnout and keep you engaged:
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-xl p-4 text-white">
            <div className="text-2xl mb-2">🔥</div>
            <div className="font-bold mb-1">High Energy</div>
            <div className="text-sm text-orange-100">
              "LET'S GOOO! Crush this session! 💪"
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-4 text-white">
            <div className="text-2xl mb-2">🧠</div>
            <div className="font-bold mb-1">Focused</div>
            <div className="text-sm text-blue-100">
              "Time to sharpen your skills. Let's focus. 🎯"
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4 text-white">
            <div className="text-2xl mb-2">💪</div>
            <div className="font-bold mb-1">Calm Discipline</div>
            <div className="text-sm text-purple-100">
              "Steady progress. One step at a time. 🌱"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}