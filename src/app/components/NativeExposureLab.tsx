import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Youtube, BookmarkPlus, CheckCircle, Star, TrendingUp, Mic, Coffee, Briefcase, Code, MessageCircle, Volume2, Subtitles, Gauge, Award, Target, Flame, Zap, Brain, Clock, BarChart3, Headphones, Repeat, Sparkles, Trophy, AlertCircle, Globe, ArrowRight, RefreshCw, Phone, Smile, Briefcase as BriefcaseIcon, Hash, Send, Plus, Trash2, Link as LinkIcon, X } from "lucide-react";
import { REAL_YOUTUBE_VIDEOS, type YouTubeVideo, type SmartPhrase, type AccentChallenge, type CulturalInsight, type TranscriptLine, type ListeningTest, type PreVideoMission, type VideoCategory } from "../data/realVideos";

type PlaybackSpeed = 0.75 | 1 | 1.25 | 1.5;

interface ExposureStats {
  minutesListened: number;
  averageSpeed: number;
  comprehensionScore: number;
  shadowingCount: number;
  phrasesLearned: number;
  videosCompleted: number;
  weekStartDate: number;
  speedGoal: number;
  speedProgress: number;
  passiveMinutes: number;
  activeMinutes: number;
  dominantStyle: string;
  speedImprovementPercent: number;
}

export default function NativeExposureLab() {
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | "all">("all");
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [showPreMission, setShowPreMission] = useState(false);
  const [missionAccepted, setMissionAccepted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [hardcoreMode, setHardcoreMode] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [showAccentChallenge, setShowAccentChallenge] = useState(false);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [showOutputChallenge, setShowOutputChallenge] = useState(false);
  const [outputAnswer, setOutputAnswer] = useState("");
  const [selectedPhrases, setSelectedPhrases] = useState<string[]>([]);
  const [showPhraseActivation, setShowPhraseActivation] = useState(false);
  const [activatingPhrase, setActivatingPhrase] = useState<SmartPhrase | null>(null);
  const [phraseContexts, setPhraseContexts] = useState<{casual: string, business: string, personal: string}>({
    casual: "",
    business: "",
    personal: ""
  });
  const [showListeningTest, setShowListeningTest] = useState(false);
  const [listeningAnswer, setListeningAnswer] = useState("");
  const [showAccentRecognition, setShowAccentRecognition] = useState(false);
  const [accentAnswer, setAccentAnswer] = useState<"relaxed" | "fast" | "monotone" | "energetic" | null>(null);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [showBrowseAll, setShowBrowseAll] = useState(false);
  const [exposureStats, setExposureStats] = useState<ExposureStats>({
    minutesListened: 127,
    averageSpeed: 1.15,
    comprehensionScore: 82,
    shadowingCount: 34,
    phrasesLearned: 156,
    videosCompleted: 12,
    weekStartDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
    speedGoal: 1.25,
    speedProgress: 46,
    passiveMinutes: 34,
    activeMinutes: 93,
    dominantStyle: "Fast NYC Energy",
    speedImprovementPercent: 10
  });
  const [dailyRecommendation, setDailyRecommendation] = useState(true);

  const playerRef = useRef<any>(null);

  // Load stats
  useEffect(() => {
    const stats = localStorage.getItem("exposureStats");
    if (stats) setExposureStats(JSON.parse(stats));
  }, []);

  // Save stats
  useEffect(() => {
    localStorage.setItem("exposureStats", JSON.stringify(exposureStats));
  }, [exposureStats]);

  const categories = [
    { id: "all" as const, name: "All", icon: Youtube, color: "from-red-500 to-pink-500" },
    { id: "vlogs" as VideoCategory, name: "Vlogs", icon: Mic, color: "from-purple-500 to-pink-500" },
    { id: "news" as VideoCategory, name: "News", icon: TrendingUp, color: "from-blue-500 to-cyan-500" },
    { id: "podcasts" as VideoCategory, name: "Podcasts", icon: MessageCircle, color: "from-green-500 to-teal-500" },
    { id: "food" as VideoCategory, name: "Food", icon: Coffee, color: "from-orange-500 to-red-500" },
    { id: "business" as VideoCategory, name: "Business", icon: Briefcase, color: "from-gray-600 to-gray-800" },
    { id: "tech" as VideoCategory, name: "Tech", icon: Code, color: "from-indigo-500 to-purple-500" },
  ];

  // 🔥 AI-RECOMMENDED VIDEOS - Import from real data
  const recommendedVideos = REAL_YOUTUBE_VIDEOS;

  const filteredVideos = selectedCategory === "all" 
    ? recommendedVideos 
    : recommendedVideos.filter(v => v.category === selectedCategory);

  // 🤖 AI RECOMMENDATION LOGIC
  const getTodaysRecommendation = (): YouTubeVideo => {
    const { comprehensionScore, averageSpeed } = exposureStats;
    
    if (comprehensionScore < 70 || averageSpeed < 1) {
      return recommendedVideos.find(v => v.level === "beginner") || recommendedVideos[0];
    }
    
    if (averageSpeed < 1.2 && comprehensionScore >= 70) {
      return recommendedVideos.find(v => v.culturalInsight.rhythmType === "fast") || recommendedVideos[0];
    }
    
    if (comprehensionScore >= 80) {
      return recommendedVideos.find(v => v.level === "advanced") || recommendedVideos[1];
    }
    
    return recommendedVideos.find(v => v.level === "intermediate") || recommendedVideos[2];
  };

  const getBonusRecommendation = (): YouTubeVideo => {
    const todaysVideo = getTodaysRecommendation();
    return recommendedVideos.find(v => v.id !== todaysVideo.id && v.category !== todaysVideo.category) || recommendedVideos[3];
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "text-green-400";
      case "intermediate": return "text-yellow-400";
      case "advanced": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "beginner": return "🌱 Beginner";
      case "intermediate": return "🔥 Intermediate";
      case "advanced": return "⚡ Advanced";
      default: return level;
    }
  };

  const handleVideoSelect = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setShowPreMission(true);
    setMissionAccepted(false);
    setShowQuiz(false);
    setQuizAnswers([]);
  };

  const acceptMission = () => {
    setMissionAccepted(true);
    setShowPreMission(false);
  };

  const togglePhraseSave = (phraseId: string) => {
    if (!selectedVideo) return;
    
    const updatedPhrases = selectedVideo.smartPhrases.map(p => 
      p.id === phraseId ? { ...p, saved: !p.saved } : p
    );
    
    setSelectedVideo({ ...selectedVideo, smartPhrases: updatedPhrases });
    setExposureStats(prev => ({
      ...prev,
      phrasesLearned: prev.phrasesLearned + (updatedPhrases.find(p => p.id === phraseId)?.saved ? 1 : -1)
    }));
  };

  const completeVideo = () => {
    setShowOutputChallenge(true);
  };

  const submitOutputChallenge = () => {
    setShowOutputChallenge(false);
    setShowAccentRecognition(true);
  };

  const submitAccentRecognition = () => {
    setShowAccentRecognition(false);
    setShowQuiz(true);
    setExposureStats(prev => ({
      ...prev,
      videosCompleted: prev.videosCompleted + 1,
      activeMinutes: prev.activeMinutes + 12,
      minutesListened: prev.minutesListened + 12
    }));
  };

  const activatePhrase = (phrase: SmartPhrase) => {
    setActivatingPhrase(phrase);
    setShowPhraseActivation(true);
    setPhraseContexts({ casual: "", business: "", personal: "" });
  };

  const submitPhraseActivation = () => {
    setShowPhraseActivation(false);
    setActivatingPhrase(null);
    setExposureStats(prev => ({
      ...prev,
      phrasesLearned: prev.phrasesLearned + 3
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Youtube className="w-12 h-12 text-red-500" />
          <h1 className="text-5xl font-bold text-white">Native Exposure Lab</h1>
        </div>
        <p className="text-gray-300 text-lg">
          🎯 AI-Curated YouTube Content • Real American English • Speed Training
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <div className="text-sm text-gray-400">Total Watched</div>
          </div>
          <div className="text-3xl font-bold text-white">{exposureStats.minutesListened}min</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-5 h-5 text-yellow-400" />
            <div className="text-sm text-gray-400">Avg Speed</div>
          </div>
          <div className="text-3xl font-bold text-white">{exposureStats.averageSpeed}x</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <div className="text-sm text-gray-400">Comprehension</div>
          </div>
          <div className="text-3xl font-bold text-white">{exposureStats.comprehensionScore}%</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-green-400" />
            <div className="text-sm text-gray-400">Phrases Learned</div>
          </div>
          <div className="text-3xl font-bold text-white">{exposureStats.phrasesLearned}</div>
        </div>
      </div>

      {/* Speed Progress */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xl font-bold text-white">Speed Upgrade Progress</div>
            <div className="text-yellow-100 text-sm">Current: {exposureStats.averageSpeed}x → Goal: {exposureStats.speedGoal}x</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{exposureStats.speedProgress}%</div>
            <div className="text-yellow-100 text-sm">progress</div>
          </div>
        </div>
        <div className="bg-white/20 rounded-full h-4 overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${exposureStats.speedProgress || 0}%` }}
            className="bg-white h-full rounded-full"
          />
        </div>
        <div className="mt-3 text-center text-sm text-yellow-100">
          💪 Speed tolerance is a <strong>powerful psychological marker</strong> of fluency growth!
        </div>
      </div>

      {/* Daily Recommendation Limit */}
      {dailyRecommendation && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8" />
              <div>
                <div className="text-xl font-bold">🎯 Recommended for today: 1 video only</div>
                <div className="text-purple-100">Quality over binge. Deep learning beats passive scrolling.</div>
              </div>
            </div>
            <button
              onClick={() => setDailyRecommendation(false)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* TODAY'S AI RECOMMENDATION */}
      {!showBrowseAll ? (
        <>
          <div className="bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600 rounded-xl p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-12 h-12 text-yellow-200" />
              <div>
                <div className="text-3xl font-bold">🎯 Today's AI Recommendation</div>
                <div className="text-yellow-100 text-lg">
                  Based on your stats: <strong>Comprehension {exposureStats.comprehensionScore}%</strong> • <strong>Speed {exposureStats.averageSpeed}x</strong>
                </div>
              </div>
            </div>

            {(() => {
              const todaysVideo = getTodaysRecommendation();
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/10 backdrop-blur-sm border-2 border-yellow-300 rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => handleVideoSelect(todaysVideo)}
                >
                  <div className="relative aspect-video bg-gray-900">
                    <img
                      src={todaysVideo.thumbnail}
                      alt={todaysVideo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.src = `https://img.youtube.com/vi/${todaysVideo.videoId}/hqdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <div className="text-center">
                        <Play className="w-24 h-24 mx-auto text-yellow-300 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all mb-3" />
                        <div className="text-2xl font-bold text-white">START TODAY'S SESSION</div>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                      🎯 AI PICK
                    </div>
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-bold ${getLevelColor(todaysVideo.level)} bg-black/80`}>
                      {getLevelBadge(todaysVideo.level)}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-2xl font-bold text-white mb-2">{todaysVideo.title}</div>
                    <div className="text-lg text-yellow-100 mb-3">{todaysVideo.channel}</div>
                    <div className="text-yellow-200 mb-4">{todaysVideo.description}</div>

                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-xs text-yellow-200 mb-1">🎭 Style:</div>
                        <div className="text-white font-semibold">{todaysVideo.culturalInsight.style}</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-xs text-yellow-200 mb-1">⏱ Duration:</div>
                        <div className="text-white font-semibold">{todaysVideo.duration}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <div className="bg-purple-500/30 text-purple-200 px-3 py-1 rounded-full font-semibold">
                        {todaysVideo.smartPhrases.length} Smart Phrases
                      </div>
                      <div className="bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full font-semibold">
                        {todaysVideo.accentChallenges.length} Challenges
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            <div className="mt-4 text-center text-yellow-100">
              💡 AI selected this video to target your <strong>weakest area</strong>
            </div>
          </div>

          {/* BONUS VIDEO */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-white mb-1">⚡ Optional Bonus Video</h3>
              <p className="text-gray-400">Want more? Here's a complementary pick.</p>
            </div>

            {(() => {
              const bonusVideo = getBonusRecommendation();
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-all cursor-pointer group"
                  onClick={() => handleVideoSelect(bonusVideo)}
                >
                  <div className="md:flex">
                    <div className="relative md:w-1/3 aspect-video md:aspect-auto bg-gray-800">
                      <img
                        src={bonusVideo.thumbnail}
                        alt={bonusVideo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.src = `https://img.youtube.com/vi/${bonusVideo.videoId}/hqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                      </div>
                    </div>

                    <div className="p-4 md:w-2/3">
                      <div className="text-xl font-bold text-white mb-1">{bonusVideo.title}</div>
                      <div className="text-sm text-gray-400 mb-2">{bonusVideo.channel}</div>
                      <div className="text-sm text-gray-300 mb-3 line-clamp-2">{bonusVideo.description}</div>
                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <div className={`px-2 py-1 rounded ${getLevelColor(bonusVideo.level)} bg-black/20`}>
                          {getLevelBadge(bonusVideo.level)}
                        </div>
                        <div className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                          {bonusVideo.smartPhrases.length} phrases
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </div>

          {/* BROWSE ALL BUTTON */}
          <button
            onClick={() => setShowBrowseAll(true)}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-5 text-white font-bold transition-all flex items-center justify-center gap-3"
          >
            <Youtube className="w-6 h-6" />
            <div className="text-left">
              <div className="text-lg">Browse All Videos by Category</div>
              <div className="text-gray-400 text-sm font-normal">Explore {recommendedVideos.length} curated videos</div>
            </div>
            <ArrowRight className="w-6 h-6 ml-auto" />
          </button>
        </>
      ) : (
        <>
          {/* BACK BUTTON */}
          <button
            onClick={() => setShowBrowseAll(false)}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all flex items-center gap-2"
          >
            ← Back to AI Recommendations
          </button>

          {/* Categories */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">📂 Browse by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                const count = cat.id === "all" ? recommendedVideos.length : recommendedVideos.filter(v => v.category === cat.id).length;
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-4 rounded-xl transition-all ${
                      isSelected
                        ? `bg-gradient-to-br ${cat.color} text-white shadow-lg scale-105`
                        : "bg-white/5 hover:bg-white/10 text-gray-400"
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-xs font-semibold">{cat.name}</div>
                    <div className="text-xs opacity-60 mt-1">{count} videos</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-all cursor-pointer group"
                onClick={() => handleVideoSelect(video)}
              >
                <div className="relative aspect-video bg-gray-800">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  </div>
                  <div className="absolute top-3 right-3 bg-black/80 px-2 py-1 rounded text-white text-xs font-semibold">
                    {video.duration}
                  </div>
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold ${getLevelColor(video.level)} bg-black/80`}>
                    {getLevelBadge(video.level)}
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-lg font-bold text-white mb-1 line-clamp-2">{video.title}</div>
                  <div className="text-sm text-gray-400 mb-2">{video.channel}</div>
                  <div className="text-sm text-gray-300 mb-3 line-clamp-2">{video.description}</div>

                  <div className="bg-white/5 rounded-lg p-2 mb-3">
                    <div className="text-xs text-gray-400 mb-1">🎭 Style:</div>
                    <div className="text-sm text-white font-semibold">{video.culturalInsight.style}</div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <div className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                      {video.smartPhrases.length} phrases
                    </div>
                    <div className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                      {video.accentChallenges.length} challenges
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Pre-Mission Modal */}
      <AnimatePresence>
        {showPreMission && selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreMission(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-yellow-500 rounded-2xl p-8 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <Target className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <h2 className="text-3xl font-bold text-white mb-2">
                  🎯 Pre-Video Mission
                </h2>
                <p className="text-gray-300">
                  Don't watch passively. You have a mission!
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-4">
                  <div className="text-yellow-400 font-bold mb-2">Today's Focus:</div>
                  <ul className="space-y-2">
                    {selectedVideo.preVideoMission.focus.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-white">
                        <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-white font-bold mb-2">🎭 Cultural Context:</div>
                  <div className="text-gray-300 mb-2">
                    <strong className="text-white">{selectedVideo.culturalInsight.creator}:</strong>{" "}
                    {selectedVideo.culturalInsight.style}
                  </div>
                  <div className="text-sm text-gray-400">
                    {selectedVideo.culturalInsight.level}
                  </div>
                </div>
              </div>

              <button
                onClick={acceptMission}
                className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-6 h-6" />
                Accept Mission & Start Learning!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Player (simple version for now) */}
      <AnimatePresence>
        {selectedVideo && missionAccepted && !showPreMission && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedVideo.title}</h2>
              <button
                onClick={() => {
                  setSelectedVideo(null);
                  setMissionAccepted(false);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-semibold"
              >
                ← Back
              </button>
            </div>

            <div className="aspect-video bg-black rounded-xl mb-6">
              <iframe
                ref={playerRef}
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                className="w-full h-full rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <button
              onClick={completeVideo}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-6 h-6" />
              Complete Video & Take Tests
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
