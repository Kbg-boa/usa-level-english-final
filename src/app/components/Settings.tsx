import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Settings as SettingsIcon, Bell, Volume2, VolumeX, Moon, Sun, Globe, Zap, Download, Upload, Trash2, Lock, Eye, EyeOff, User, Mail, Calendar, Target, BarChart, Sliders, Palette, Languages, Mic, CheckCircle, AlertCircle, RefreshCw, Save, Brain, Flame, Trophy, Star, TrendingUp, Unlock, Gift, Shield, Heart, Crown, Timer, MessageCircle, Clock } from "lucide-react";
import { Link } from "react-router";

type Theme = "dark" | "light" | "auto";
type Language = "en" | "fr" | "mixed";
type Difficulty = "beginner" | "intermediate" | "advanced" | "native";
type VoiceGender = "male" | "female";
type VoiceAccent = "us" | "uk" | "au";

interface AppSettings {
  // General
  theme: Theme;
  language: Language;
  showTranslations: boolean;
  
  // Audio
  soundEnabled: boolean;
  voiceEnabled: boolean;
  voiceGender: VoiceGender;
  voiceAccent: VoiceAccent;
  voiceSpeed: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  
  // Learning
  difficulty: Difficulty;
  dailyGoal: number;
  autoNextExercise: boolean;
  showHints: boolean;
  errorCorrection: "instant" | "end" | "never";
  
  // Notifications
  notificationsEnabled: boolean;
  streakReminders: boolean;
  milestoneAlerts: boolean;
  
  // Privacy
  analyticsEnabled: boolean;
  shareProgress: boolean;
  
  // Profile
  userName: string;
  email: string;
  startDate: string;
  targetDate: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>({
    // General
    theme: "dark",
    language: "mixed",
    showTranslations: true,
    
    // Audio
    soundEnabled: true,
    voiceEnabled: true,
    voiceGender: "female",
    voiceAccent: "us",
    voiceSpeed: 1.0,
    musicEnabled: false,
    sfxEnabled: true,
    
    // Learning
    difficulty: "intermediate",
    dailyGoal: 1285,
    autoNextExercise: true,
    showHints: true,
    errorCorrection: "instant",
    
    // Notifications
    notificationsEnabled: false,
    streakReminders: true,
    milestoneAlerts: true,
    
    // Privacy
    analyticsEnabled: true,
    shareProgress: false,
    
    // Profile
    userName: "Learner",
    email: "",
    startDate: new Date().toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const [activeTab, setActiveTab] = useState<"general" | "audio" | "learning" | "notifications" | "privacy" | "profile" | "data" | "behavior">("general");
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load settings
  useEffect(() => {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      setSettings({ ...settings, ...JSON.parse(saved) });
    }

    const stats = localStorage.getItem("englishStats");
    if (stats) {
      const parsed = JSON.parse(stats);
      setSettings(prev => ({
        ...prev,
        dailyGoal: parsed.dailyGoal || 1285,
      }));
    }
  }, []);

  // Save settings
  const saveSettings = () => {
    localStorage.setItem("appSettings", JSON.stringify(settings));
    
    // Also update englishStats if dailyGoal changed
    const stats = localStorage.getItem("englishStats");
    if (stats) {
      const parsed = JSON.parse(stats);
      parsed.dailyGoal = settings.dailyGoal;
      localStorage.setItem("englishStats", JSON.stringify(parsed));
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportData = () => {
    const data = {
      settings,
      stats: localStorage.getItem("englishStats"),
      vocabulary: localStorage.getItem("vocabularyProgress"),
      savedPhrases: localStorage.getItem("savedPhrases"),
      watchedVideos: localStorage.getItem("watchedVideos"),
      conversationHistory: localStorage.getItem("conversationHistory"),
      motivationHistory: localStorage.getItem("motivationHistory"),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `english-learning-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          
          if (data.settings) localStorage.setItem("appSettings", JSON.stringify(data.settings));
          if (data.stats) localStorage.setItem("englishStats", data.stats);
          if (data.vocabulary) localStorage.setItem("vocabularyProgress", data.vocabulary);
          if (data.savedPhrases) localStorage.setItem("savedPhrases", data.savedPhrases);
          if (data.watchedVideos) localStorage.setItem("watchedVideos", data.watchedVideos);
          if (data.conversationHistory) localStorage.setItem("conversationHistory", data.conversationHistory);
          if (data.motivationHistory) localStorage.setItem("motivationHistory", data.motivationHistory);
          
          alert("✅ Data imported successfully! Please refresh the page.");
          window.location.reload();
        } catch (error) {
          alert("❌ Error importing data. Please check the file.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const resetProgress = () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }

    localStorage.removeItem("englishStats");
    localStorage.removeItem("vocabularyProgress");
    localStorage.removeItem("savedPhrases");
    localStorage.removeItem("watchedVideos");
    localStorage.removeItem("conversationHistory");
    localStorage.removeItem("motivationHistory");
    
    alert("✅ All progress has been reset!");
    setShowResetConfirm(false);
    window.location.reload();
  };

  const tabs = [
    { id: "general" as const, name: "General", icon: SettingsIcon },
    { id: "audio" as const, name: "Audio & Voice", icon: Volume2 },
    { id: "learning" as const, name: "Learning", icon: Target },
    { id: "notifications" as const, name: "Notifications", icon: Bell },
    { id: "privacy" as const, name: "Privacy", icon: Lock },
    { id: "profile" as const, name: "Profile", icon: User },
    { id: "data" as const, name: "Data", icon: BarChart },
    { id: "behavior" as const, name: "Behavior", icon: Sliders },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <SettingsIcon className="w-10 h-10 text-purple-400" />
          Settings
        </h1>
        <p className="text-xl text-gray-300">
          Customize your <span className="text-purple-400 font-bold">learning experience</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2">
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              <tab.icon className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-semibold">{tab.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* General Tab */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </h3>

            <div className="space-y-4">
              {/* Theme */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "dark" as Theme, label: "Dark", icon: Moon },
                    { value: "light" as Theme, label: "Light", icon: Sun },
                    { value: "auto" as Theme, label: "Auto", icon: Zap },
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => setSettings({ ...settings, theme: theme.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.theme === theme.value
                          ? "border-purple-600 bg-purple-600/20"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <theme.icon className="w-6 h-6 mx-auto mb-2 text-white" />
                      <div className="text-sm font-semibold text-white">{theme.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Interface Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value as Language })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                >
                  <option value="en">🇺🇸 English Only</option>
                  <option value="fr">🇫🇷 Français Only</option>
                  <option value="mixed">🌍 Mixed (70% EN / 30% FR)</option>
                </select>
              </div>

              {/* Show Translations */}
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Languages className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-semibold text-white">Show Translations</div>
                    <div className="text-sm text-gray-400">Display French translations for words</div>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, showTranslations: !settings.showTranslations })}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    settings.showTranslations ? "bg-blue-600 text-white" : "bg-gray-600 text-white"
                  }`}
                >
                  {settings.showTranslations ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Tab */}
      {activeTab === "audio" && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Audio Settings
            </h3>

            <div className="space-y-4">
              {/* Master Sound */}
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <div className="font-semibold text-white">Master Sound</div>
                    <div className="text-sm text-gray-400">Enable/disable all sounds</div>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    settings.soundEnabled ? "bg-green-600 text-white" : "bg-gray-600 text-white"
                  }`}
                >
                  {settings.soundEnabled ? "ON" : "OFF"}
                </button>
              </div>

              {/* Voice Enabled */}
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Mic className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="font-semibold text-white">AI Voice</div>
                    <div className="text-sm text-gray-400">Text-to-speech for AI responses</div>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, voiceEnabled: !settings.voiceEnabled })}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    settings.voiceEnabled ? "bg-purple-600 text-white" : "bg-gray-600 text-white"
                  }`}
                >
                  {settings.voiceEnabled ? "ON" : "OFF"}
                </button>
              </div>

              {/* Voice Gender */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Voice Gender</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "female" as VoiceGender, label: "👩 Female", emoji: "👩" },
                    { value: "male" as VoiceGender, label: "👨 Male", emoji: "👨" },
                  ].map((gender) => (
                    <button
                      key={gender.value}
                      onClick={() => setSettings({ ...settings, voiceGender: gender.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.voiceGender === gender.value
                          ? "border-purple-600 bg-purple-600/20"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="text-2xl mb-1">{gender.emoji}</div>
                      <div className="text-sm font-semibold text-white">{gender.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Accent */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Voice Accent</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "us" as VoiceAccent, label: "🇺🇸 American" },
                    { value: "uk" as VoiceAccent, label: "🇬🇧 British" },
                    { value: "au" as VoiceAccent, label: "🇦🇺 Australian" },
                  ].map((accent) => (
                    <button
                      key={accent.value}
                      onClick={() => setSettings({ ...settings, voiceAccent: accent.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.voiceAccent === accent.value
                          ? "border-purple-600 bg-purple-600/20"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="text-sm font-semibold text-white">{accent.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Speed */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Voice Speed: {settings.voiceSpeed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.voiceSpeed}
                  onChange={(e) => setSettings({ ...settings, voiceSpeed: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0.5x (Slow)</span>
                  <span>1.0x (Normal)</span>
                  <span>2.0x (Fast)</span>
                </div>
              </div>

              {/* Background Music */}
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-semibold text-white">Background Music</div>
                    <div className="text-sm text-gray-400">Relaxing music while learning</div>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, musicEnabled: !settings.musicEnabled })}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    settings.musicEnabled ? "bg-blue-600 text-white" : "bg-gray-600 text-white"
                  }`}
                >
                  {settings.musicEnabled ? "ON" : "OFF"}
                </button>
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="font-semibold text-white">Sound Effects</div>
                    <div className="text-sm text-gray-400">Click sounds, correct/wrong sounds</div>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, sfxEnabled: !settings.sfxEnabled })}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    settings.sfxEnabled ? "bg-yellow-600 text-white" : "bg-gray-600 text-white"
                  }`}
                >
                  {settings.sfxEnabled ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Learning Tab */}
      {activeTab === "learning" && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Learning Preferences
            </h3>

            <div className="space-y-4">
              {/* Difficulty */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Difficulty Level</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: "beginner" as Difficulty, label: "🌱 Beginner", color: "green" },
                    { value: "intermediate" as Difficulty, label: "🔥 Intermediate", color: "yellow" },
                    { value: "advanced" as Difficulty, label: "⚡ Advanced", color: "orange" },
                    { value: "native" as Difficulty, label: "🚀 Native", color: "red" },
                  ].map((diff) => (
                    <button
                      key={diff.value}
                      onClick={() => setSettings({ ...settings, difficulty: diff.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.difficulty === diff.value
                          ? `border-${diff.color}-600 bg-${diff.color}-600/20`
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="text-sm font-semibold text-white">{diff.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Goal */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Daily Word Goal: {settings.dailyGoal} words/day
                </label>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={settings.dailyGoal}
                  onChange={(e) => setSettings({ ...settings, dailyGoal: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>100 (Easy)</span>
                  <span>1285 (Recommended)</span>
                  <span>2000 (Intense)</span>
                </div>
              </div>

              {/* Auto Next */}
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="font-semibold text-white">Auto-Next Exercise</div>
                    <div className="text-sm text-gray-400">Automatically go to next exercise</div>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, autoNextExercise: !settings.autoNextExercise })}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    settings.autoNextExercise ? "bg-green-600 text-white" : "bg-gray-600 text-white"
                  }`}
                >
                  {settings.autoNextExercise ? "ON" : "OFF"}
                </button>
              </div>

              {/* Show Hints */}
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-semibold text-white">Show Hints</div>
                    <div className="text-sm text-gray-400">Display helpful hints during exercises</div>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, showHints: !settings.showHints })}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    settings.showHints ? "bg-blue-600 text-white" : "bg-gray-600 text-white"
                  }`}
                >
                  {settings.showHints ? "ON" : "OFF"}
                </button>
              </div>

              {/* Error Correction */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Error Correction Timing</label>
                <select
                  value={settings.errorCorrection}
                  onChange={(e) => setSettings({ ...settings, errorCorrection: e.target.value as "instant" | "end" | "never" })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                >
                  <option value="instant">⚡ Instant (Show immediately)</option>
                  <option value="end">🎯 End of Exercise (Show at the end)</option>
                  <option value="never">🚫 Never (No corrections)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Settings
            </h3>

            <div className="space-y-4">
              {/* Master Toggle */}
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-semibold text-white">Enable Notifications</div>
                    <div className="text-sm text-gray-400">Receive daily reminders and alerts</div>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    settings.notificationsEnabled ? "bg-blue-600 text-white" : "bg-gray-600 text-white"
                  }`}
                >
                  {settings.notificationsEnabled ? "ON" : "OFF"}
                </button>
              </div>

              {/* Streak Reminders */}
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="font-semibold text-white">Streak Reminders</div>
                    <div className="text-sm text-gray-400">Don't break your daily streak!</div>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, streakReminders: !settings.streakReminders })}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    settings.streakReminders ? "bg-orange-600 text-white" : "bg-gray-600 text-white"
                  }`}
                >
                  {settings.streakReminders ? "ON" : "OFF"}
                </button>
              </div>

              {/* Milestone Alerts */}
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="font-semibold text-white">Milestone Alerts</div>
                    <div className="text-sm text-gray-400">Celebrate your achievements</div>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, milestoneAlerts: !settings.milestoneAlerts })}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    settings.milestoneAlerts ? "bg-green-600 text-white" : "bg-gray-600 text-white"
                  }`}
                >
                  {settings.milestoneAlerts ? "ON" : "OFF"}
                </button>
              </div>

              <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4">
                <div className="flex items-start gap-2 text-blue-100 text-sm">
                  <Bell className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Full notification settings</strong> (schedule, times, etc.) available in the{" "}
                    <Link to="/notifications" className="underline font-bold">
                      Notifications page
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === "privacy" && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Privacy & Data
            </h3>

            <div className="space-y-4">
              {/* Analytics */}
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <BarChart className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="font-semibold text-white">Analytics</div>
                    <div className="text-sm text-gray-400">Help improve the app with usage data</div>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, analyticsEnabled: !settings.analyticsEnabled })}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    settings.analyticsEnabled ? "bg-purple-600 text-white" : "bg-gray-600 text-white"
                  }`}
                >
                  {settings.analyticsEnabled ? "ON" : "OFF"}
                </button>
              </div>

              {/* Share Progress */}
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="font-semibold text-white">Share Progress</div>
                    <div className="text-sm text-gray-400">Allow sharing your achievements publicly</div>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, shareProgress: !settings.shareProgress })}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    settings.shareProgress ? "bg-green-600 text-white" : "bg-gray-600 text-white"
                  }`}
                >
                  {settings.shareProgress ? "ON" : "OFF"}
                </button>
              </div>

              <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-4">
                <div className="flex items-start gap-2 text-yellow-100 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Privacy Note:</strong> All your data is stored locally on your device (localStorage). 
                    We don't collect or send any personal information to external servers.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </h3>

            <div className="space-y-4">
              {/* User Name */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Your Name</label>
                <input
                  type="text"
                  value={settings.userName}
                  onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Email (Optional)</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Start Date</label>
                <input
                  type="date"
                  value={settings.startDate}
                  onChange={(e) => setSettings({ ...settings, startDate: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                />
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Target Completion Date</label>
                <input
                  type="date"
                  value={settings.targetDate}
                  onChange={(e) => setSettings({ ...settings, targetDate: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                />
              </div>

              <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4">
                <div className="flex items-start gap-2 text-blue-100 text-sm">
                  <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    You started on <strong>{new Date(settings.startDate).toLocaleDateString()}</strong> and 
                    plan to complete by <strong>{new Date(settings.targetDate).toLocaleDateString()}</strong>
                    {" "}({Math.ceil((new Date(settings.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Tab */}
      {activeTab === "data" && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Data Management
            </h3>

            <div className="space-y-4">
              {/* Export Data */}
              <button
                onClick={exportData}
                className="w-full p-4 bg-green-600 hover:bg-green-700 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-3"
              >
                <Download className="w-5 h-5" />
                Export All Data (Backup)
              </button>

              {/* Import Data */}
              <button
                onClick={importData}
                className="w-full p-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-3"
              >
                <Upload className="w-5 h-5" />
                Import Data (Restore)
              </button>

              {/* Reset Progress */}
              <button
                onClick={resetProgress}
                className={`w-full p-4 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-3 ${
                  showResetConfirm
                    ? "bg-red-700 hover:bg-red-800 animate-pulse"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                <Trash2 className="w-5 h-5" />
                {showResetConfirm ? "Click Again to Confirm Reset" : "Reset All Progress"}
              </button>

              {showResetConfirm && (
                <div className="bg-red-600/20 border border-red-600 rounded-lg p-4">
                  <div className="flex items-start gap-2 text-red-100 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Warning:</strong> This will permanently delete ALL your progress, vocabulary, stats, 
                      and saved data. This action cannot be undone! Export your data first if you want to keep a backup.
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4">
                <div className="flex items-start gap-2 text-blue-100 text-sm">
                  <BarChart className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Data Info:</strong> Export creates a JSON file with all your progress. 
                    You can import it later to restore everything. Perfect for switching devices or keeping backups!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Behavior Tab */}
      {activeTab === "behavior" && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Advanced Psychology & Behavior System
            </h3>

            <div className="space-y-4">
              {/* Quick Access Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Psychology Engine Card */}
                <Link to="/notifications">
                  <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 hover:scale-105 transition-all cursor-pointer">
                    <Bell className="w-10 h-10 mb-3 text-white" />
                    <div className="text-xl font-bold text-white mb-2">Psychology Engine</div>
                    <div className="text-blue-100 text-sm mb-4">
                      Smart notifications, streak system, dopamine triggers, and adaptive timing
                    </div>
                    <div className="flex items-center gap-2 text-white font-semibold">
                      Open Full Settings
                      <span className="text-lg">→</span>
                    </div>
                  </div>
                </Link>

                {/* Behavior System Card */}
                <Link to="/behavior">
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 hover:scale-105 transition-all cursor-pointer">
                    <Brain className="w-10 h-10 mb-3 text-white" />
                    <div className="text-xl font-bold text-white mb-2">Behavior System</div>
                    <div className="text-purple-100 text-sm mb-4">
                      Identity reinforcement, streak unlocks, comeback bonus, and weekly reports
                    </div>
                    <div className="flex items-center gap-2 text-white font-semibold">
                      Open Full Settings
                      <span className="text-lg">→</span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Features Overview */}
              <div className="bg-white/5 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">🧠 What's Included:</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <Flame className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <strong className="text-white">Streak Multipliers:</strong> x1.2 → x1.5 → x2.0 rewards
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <strong className="text-white">Feature Unlocks:</strong> Unlock new content with streaks
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <strong className="text-white">Smart Reminders:</strong> Speed, conversation, accent alerts
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <strong className="text-white">Identity Messages:</strong> Build American-level reflexes
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Gift className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <strong className="text-white">Comeback Bonus:</strong> +0.2 multiplier after breaks
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <strong className="text-white">Weekly Reports:</strong> Track transformation progress
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <strong className="text-white">Silent Mode:</strong> No pressure, calm reminders only
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Heart className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <strong className="text-white">Dopamine Predictions:</strong> Personalized insights
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-600/20 border border-purple-600 rounded-lg p-4">
                <div className="flex items-start gap-2 text-purple-100 text-sm">
                  <Brain className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Pro Tip:</strong> Use both systems together for maximum retention! 
                    The Psychology Engine handles daily motivation, while the Behavior System tracks long-term transformation.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <button
          onClick={saveSettings}
          disabled={saved}
          className={`w-full p-4 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-3 ${
            saved
              ? "bg-green-600"
              : "bg-purple-600 hover:bg-purple-700 hover:scale-105"
          }`}
        >
          {saved ? (
            <>
              <CheckCircle className="w-6 h-6" />
              Settings Saved!
            </>
          ) : (
            <>
              <Save className="w-6 h-6" />
              Save All Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}