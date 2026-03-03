import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Youtube, BookmarkPlus, CheckCircle, Star, TrendingUp, Mic, Coffee, Briefcase, Gamepad2, Music, Plane, Heart, Code, Book, MessageCircle, ChevronRight, Volume2, Subtitles, Gauge, Award, Target, Flame } from "lucide-react";

type VideoCategory = "vlogs" | "news" | "podcasts" | "food" | "business" | "gaming" | "music" | "travel" | "lifestyle" | "tech";
type SubtitleMode = "en" | "fr" | "off";
type PlaybackSpeed = 0.75 | 1 | 1.25 | 1.5;

interface YouTubeVideo {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  description: string;
  category: VideoCategory;
  level: "beginner" | "intermediate" | "advanced";
  duration: string;
  thumbnail: string;
  keyPhrases: string[];
  quizQuestions: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  timestamp?: string;
}

interface SavedPhrase {
  id: string;
  phrase: string;
  videoTitle: string;
  savedAt: number;
}

interface WatchedVideo {
  videoId: string;
  watchedAt: number;
  quizScore?: number;
}

export default function YouTubeNative() {
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | "all">("all");
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [subtitleMode, setSubtitleMode] = useState<SubtitleMode>("en");
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [savedPhrases, setSavedPhrases] = useState<SavedPhrase[]>([]);
  const [watchedVideos, setWatchedVideos] = useState<WatchedVideo[]>([]);
  const [showSavedPhrases, setShowSavedPhrases] = useState(false);

  const playerRef = useRef<any>(null);

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("savedPhrases");
    if (saved) setSavedPhrases(JSON.parse(saved));

    const watched = localStorage.getItem("watchedVideos");
    if (watched) setWatchedVideos(JSON.parse(watched));
  }, []);

  // Save phrases
  useEffect(() => {
    localStorage.setItem("savedPhrases", JSON.stringify(savedPhrases));
  }, [savedPhrases]);

  // Save watched videos
  useEffect(() => {
    localStorage.setItem("watchedVideos", JSON.stringify(watchedVideos));
  }, [watchedVideos]);

  const categories = [
    { id: "all" as const, name: "All Videos", icon: Youtube, color: "from-red-500 to-pink-500" },
    { id: "vlogs" as VideoCategory, name: "Daily Vlogs", icon: Mic, color: "from-purple-500 to-pink-500" },
    { id: "news" as VideoCategory, name: "News & Current", icon: TrendingUp, color: "from-blue-500 to-cyan-500" },
    { id: "podcasts" as VideoCategory, name: "Podcasts", icon: MessageCircle, color: "from-green-500 to-teal-500" },
    { id: "food" as VideoCategory, name: "Food & Cooking", icon: Coffee, color: "from-orange-500 to-red-500" },
    { id: "business" as VideoCategory, name: "Business Talk", icon: Briefcase, color: "from-gray-600 to-gray-800" },
    { id: "gaming" as VideoCategory, name: "Gaming", icon: Gamepad2, color: "from-purple-600 to-indigo-600" },
    { id: "music" as VideoCategory, name: "Music & Arts", icon: Music, color: "from-pink-500 to-rose-500" },
    { id: "travel" as VideoCategory, name: "Travel Vlogs", icon: Plane, color: "from-cyan-500 to-blue-500" },
    { id: "lifestyle" as VideoCategory, name: "Lifestyle", icon: Heart, color: "from-rose-500 to-pink-500" },
    { id: "tech" as VideoCategory, name: "Tech Reviews", icon: Code, color: "from-indigo-500 to-purple-500" },
  ];

  const videos: YouTubeVideo[] = [
    // Vlogs
    {
      id: "v1",
      videoId: "jfKfPfyJRdk",
      title: "What I eat in a day in NYC",
      channel: "Casey Neistat",
      description: "Follow a day in New York City - perfect casual American English",
      category: "vlogs",
      level: "beginner",
      duration: "10:23",
      thumbnail: "https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg",
      keyPhrases: [
        "I'm gonna grab...",
        "Let me show you...",
        "This is crazy!",
        "No way!",
        "That's insane",
        "For real though"
      ],
      quizQuestions: [
        {
          id: "q1",
          question: "What does 'I'm gonna' mean?",
          options: ["I want to", "I'm going to", "I need to", "I have to"],
          correctAnswer: 1
        },
        {
          id: "q2",
          question: "When someone says 'No way!', they are expressing...",
          options: ["Confusion", "Surprise/disbelief", "Anger", "Sadness"],
          correctAnswer: 1
        },
        {
          id: "q3",
          question: "'For real though' is used to...",
          options: ["Ask a question", "Emphasize truth/seriousness", "Change topic", "Say goodbye"],
          correctAnswer: 1
        }
      ]
    },
    {
      id: "v2",
      videoId: "U_LlX4t0uzg",
      title: "A Day in My Life - College Vlog",
      channel: "Emma Chamberlain",
      description: "Super casual American teen/young adult speech patterns",
      category: "vlogs",
      level: "beginner",
      duration: "12:45",
      thumbnail: "https://img.youtube.com/vi/U_LlX4t0uzg/maxresdefault.jpg",
      keyPhrases: [
        "Like, honestly...",
        "I don't even know",
        "It's giving...",
        "That's so random",
        "I'm obsessed",
        "Wait, what?"
      ],
      quizQuestions: [
        {
          id: "q1",
          question: "'Like, honestly' is a filler phrase meaning...",
          options: ["Similar to honest", "To be truthful/serious", "I like honesty", "Honestly, I like it"],
          correctAnswer: 1
        },
        {
          id: "q2",
          question: "When someone says 'I'm obsessed', they mean...",
          options: ["They have a problem", "They really love it", "They're confused", "They're angry"],
          correctAnswer: 1
        }
      ]
    },

    // News
    {
      id: "v3",
      videoId: "yuedZ1Y_dU4",
      title: "How English sounds to non-English speakers",
      channel: "Vox",
      description: "Clear, professional American news-style English",
      category: "news",
      level: "intermediate",
      duration: "8:12",
      thumbnail: "https://img.youtube.com/vi/yuedZ1Y_dU4/maxresdefault.jpg",
      keyPhrases: [
        "According to...",
        "Research shows that...",
        "The key takeaway is...",
        "It turns out...",
        "Experts say...",
        "The bottom line is..."
      ],
      quizQuestions: [
        {
          id: "q1",
          question: "'According to' is used to...",
          options: ["Give an opinion", "Quote a source", "Ask a question", "Express doubt"],
          correctAnswer: 1
        },
        {
          id: "q2",
          question: "'The bottom line is' means...",
          options: ["The final line", "The most important point", "The last page", "The end of story"],
          correctAnswer: 1
        }
      ]
    },

    // Food
    {
      id: "v4",
      videoId: "APzMSAFQ0eQ",
      title: "Making Classic American Burgers",
      channel: "Binging with Babish",
      description: "Cooking instructions in natural American English",
      category: "food",
      level: "beginner",
      duration: "9:34",
      thumbnail: "https://img.youtube.com/vi/APzMSAFQ0eQ/maxresdefault.jpg",
      keyPhrases: [
        "You're gonna want to...",
        "Go ahead and...",
        "Let that sit for...",
        "Season it with...",
        "Cook it until...",
        "This is gonna be amazing"
      ],
      quizQuestions: [
        {
          id: "q1",
          question: "'Go ahead and...' means...",
          options: ["Move forward", "Proceed to do something", "Walk ahead", "Go before others"],
          correctAnswer: 1
        },
        {
          id: "q2",
          question: "'Let that sit' in cooking means...",
          options: ["Put it on a chair", "Allow it to rest/wait", "Make it sit down", "Serve it"],
          correctAnswer: 1
        }
      ]
    },

    // Business
    {
      id: "v5",
      videoId: "3BdG-FsNQ3E",
      title: "Steve Jobs introduces iPhone",
      channel: "Apple",
      description: "Professional presentation English - business context",
      category: "business",
      level: "advanced",
      duration: "6:52",
      thumbnail: "https://img.youtube.com/vi/3BdG-FsNQ3E/maxresdefault.jpg",
      keyPhrases: [
        "I'm thrilled to...",
        "This is revolutionary",
        "We've been working on...",
        "The key feature is...",
        "Let me walk you through...",
        "This changes everything"
      ],
      quizQuestions: [
        {
          id: "q1",
          question: "'I'm thrilled to' expresses...",
          options: ["Fear", "Excitement/joy", "Confusion", "Anger"],
          correctAnswer: 1
        },
        {
          id: "q2",
          question: "'Walk you through' means...",
          options: ["Take a walk", "Explain step-by-step", "Go through a door", "Exercise together"],
          correctAnswer: 1
        }
      ]
    },

    // Podcasts
    {
      id: "v6",
      videoId: "GC_mV1IpjWA",
      title: "How to Learn Anything Fast",
      channel: "TEDx Talks",
      description: "Clear, articulate American speaking - educational content",
      category: "podcasts",
      level: "intermediate",
      duration: "11:17",
      thumbnail: "https://img.youtube.com/vi/GC_mV1IpjWA/maxresdefault.jpg",
      keyPhrases: [
        "The thing is...",
        "What I've learned is...",
        "It's all about...",
        "The secret to...",
        "Here's the deal...",
        "At the end of the day..."
      ],
      quizQuestions: [
        {
          id: "q1",
          question: "'The thing is' introduces...",
          options: ["An object", "An explanation/important point", "A question", "A person"],
          correctAnswer: 1
        },
        {
          id: "q2",
          question: "'At the end of the day' means...",
          options: ["In the evening", "Ultimately/finally", "Before sleep", "After work"],
          correctAnswer: 1
        }
      ]
    },

    // Tech
    {
      id: "v7",
      videoId: "9Owutijsa0g",
      title: "iPhone 15 Pro Review",
      channel: "Marques Brownlee",
      description: "Tech review English - clear and enthusiastic",
      category: "tech",
      level: "intermediate",
      duration: "15:42",
      thumbnail: "https://img.youtube.com/vi/9Owutijsa0g/maxresdefault.jpg",
      keyPhrases: [
        "What's up guys...",
        "So basically...",
        "The cool thing about...",
        "I've been testing...",
        "It's pretty solid",
        "That being said..."
      ],
      quizQuestions: [
        {
          id: "q1",
          question: "'What's up guys' is...",
          options: ["A question about height", "A casual greeting", "Looking upward", "A formal hello"],
          correctAnswer: 1
        },
        {
          id: "q2",
          question: "'That being said' is used to...",
          options: ["Repeat something", "Introduce a contrasting point", "Agree strongly", "End conversation"],
          correctAnswer: 1
        }
      ]
    },

    // Gaming
    {
      id: "v8",
      videoId: "3Nfg-WC7YY0",
      title: "Among Us with Friends",
      channel: "Valkyrae",
      description: "Gaming slang and casual American conversation",
      category: "gaming",
      level: "intermediate",
      duration: "18:23",
      thumbnail: "https://img.youtube.com/vi/3Nfg-WC7YY0/maxresdefault.jpg",
      keyPhrases: [
        "No cap",
        "That's sus",
        "I'm dead",
        "For sure",
        "Let's gooo!",
        "Bruh, what?"
      ],
      quizQuestions: [
        {
          id: "q1",
          question: "'No cap' means...",
          options: ["No hat", "No lie/for real", "Not capable", "No captain"],
          correctAnswer: 1
        },
        {
          id: "q2",
          question: "'That's sus' means...",
          options: ["That's suspicious", "That's super", "That's sad", "That's successful"],
          correctAnswer: 0
        }
      ]
    },

    // Travel
    {
      id: "v9",
      videoId: "VN8dGMxWnVE",
      title: "Exploring Tokyo - First Day in Japan",
      channel: "Mark Wiens",
      description: "Travel vlog with food and cultural observations",
      category: "travel",
      level: "beginner",
      duration: "24:15",
      thumbnail: "https://img.youtube.com/vi/VN8dGMxWnVE/maxresdefault.jpg",
      keyPhrases: [
        "Check this out!",
        "Oh my goodness!",
        "This is incredible",
        "I can't believe...",
        "Look at that!",
        "Wow, just wow"
      ],
      quizQuestions: [
        {
          id: "q1",
          question: "'Check this out' means...",
          options: ["Leave this place", "Look at this", "Pay for this", "Test this"],
          correctAnswer: 1
        },
        {
          id: "q2",
          question: "'Oh my goodness' expresses...",
          options: ["Anger", "Surprise/amazement", "Sadness", "Boredom"],
          correctAnswer: 1
        }
      ]
    },

    // Lifestyle
    {
      id: "v10",
      videoId: "qgVg4CDX6z4",
      title: "Morning Routine - Productive Day",
      channel: "Matt D'Avella",
      description: "Lifestyle and productivity content",
      category: "lifestyle",
      level: "beginner",
      duration: "7:45",
      thumbnail: "https://img.youtube.com/vi/qgVg4CDX6z4/maxresdefault.jpg",
      keyPhrases: [
        "First thing in the morning...",
        "I try to...",
        "It really helps me...",
        "The key is...",
        "I've found that...",
        "It makes a huge difference"
      ],
      quizQuestions: [
        {
          id: "q1",
          question: "'First thing in the morning' means...",
          options: ["The first item", "The very beginning of the day", "Before breakfast", "After waking"],
          correctAnswer: 1
        },
        {
          id: "q2",
          question: "'It makes a huge difference' means...",
          options: ["It's very different", "It has big impact", "It's huge", "It's not same"],
          correctAnswer: 1
        }
      ]
    }
  ];

  const filteredVideos = selectedCategory === "all" 
    ? videos 
    : videos.filter(v => v.category === selectedCategory);

  const selectVideo = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setShowQuiz(false);
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setQuizAnswers([]);
  };

  const startQuiz = () => {
    if (!selectedVideo) return;
    setShowQuiz(true);
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setQuizAnswers([]);
  };

  const answerQuestion = (answerIndex: number) => {
    const newAnswers = [...quizAnswers, answerIndex];
    setQuizAnswers(newAnswers);

    if (!selectedVideo) return;

    if (currentQuestionIndex < selectedVideo.quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed
      const correctCount = newAnswers.filter((ans, idx) => 
        ans === selectedVideo.quizQuestions[idx].correctAnswer
      ).length;
      
      const score = Math.round((correctCount / selectedVideo.quizQuestions.length) * 100);
      
      // Save watched video
      const watched: WatchedVideo = {
        videoId: selectedVideo.id,
        watchedAt: Date.now(),
        quizScore: score
      };
      
      const updated = [...watchedVideos.filter(w => w.videoId !== selectedVideo.id), watched];
      setWatchedVideos(updated);
      
      setQuizCompleted(true);
    }
  };

  const savePhrase = (phrase: string) => {
    if (!selectedVideo) return;
    
    const newPhrase: SavedPhrase = {
      id: Date.now().toString(),
      phrase,
      videoTitle: selectedVideo.title,
      savedAt: Date.now()
    };
    
    setSavedPhrases([newPhrase, ...savedPhrases]);
  };

  const isPhraseSaved = (phrase: string) => {
    return savedPhrases.some(p => p.phrase === phrase);
  };

  const removeSavedPhrase = (id: string) => {
    setSavedPhrases(savedPhrases.filter(p => p.id !== id));
  };

  const getVideoWatchStatus = (videoId: string) => {
    return watchedVideos.find(w => w.videoId === videoId);
  };

  const getQuizScore = () => {
    if (!selectedVideo || quizAnswers.length === 0) return 0;
    const correctCount = quizAnswers.filter((ans, idx) => 
      ans === selectedVideo.quizQuestions[idx].correctAnswer
    ).length;
    return Math.round((correctCount / selectedVideo.quizQuestions.length) * 100);
  };

  const getLevelColor = (level: string) => {
    switch(level) {
      case "beginner": return "text-green-400 bg-green-400/20";
      case "intermediate": return "text-yellow-400 bg-yellow-400/20";
      case "advanced": return "text-red-400 bg-red-400/20";
      default: return "text-gray-400 bg-gray-400/20";
    }
  };

  const totalWatched = watchedVideos.length;
  const avgScore = watchedVideos.length > 0
    ? Math.round(watchedVideos.reduce((sum, v) => sum + (v.quizScore || 0), 0) / watchedVideos.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Youtube className="w-10 h-10 text-red-500" />
          YouTube Native Learning
        </h1>
        <p className="text-xl text-gray-300">
          Learn from <span className="text-red-500 font-bold">real Americans</span> on YouTube! 🇺🇸
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-600 to-pink-600 rounded-xl p-6 text-white text-center">
          <Play className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{totalWatched}</div>
          <div className="text-red-100 text-sm mt-1">Videos Watched</div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white text-center">
          <Target className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{avgScore}%</div>
          <div className="text-green-100 text-sm mt-1">Avg Quiz Score</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white text-center">
          <Star className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{savedPhrases.length}</div>
          <div className="text-blue-100 text-sm mt-1">Saved Phrases</div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📂 Choose Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-4 rounded-xl transition-all ${
                selectedCategory === cat.id
                  ? `bg-gradient-to-br ${cat.color} text-white shadow-lg scale-105`
                  : "bg-white/5 hover:bg-white/10 text-gray-300"
              }`}
            >
              <cat.icon className="w-6 h-6 mx-auto mb-2" />
              <div className="text-xs font-semibold">{cat.name}</div>
            </button>
          ))}
        </div>
      </div>

      {!selectedVideo ? (
        /* Video Grid */
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">
              {selectedCategory === "all" ? "All Videos" : categories.find(c => c.id === selectedCategory)?.name} 
              <span className="text-gray-400 ml-2">({filteredVideos.length} videos)</span>
            </h3>
            <button
              onClick={() => setShowSavedPhrases(!showSavedPhrases)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition-all flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Saved Phrases ({savedPhrases.length})
            </button>
          </div>

          {/* Saved Phrases Panel */}
          <AnimatePresence>
            {showSavedPhrases && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6"
              >
                <h4 className="text-lg font-semibold text-white mb-4">⭐ Your Saved Phrases</h4>
                {savedPhrases.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No saved phrases yet. Watch videos and save useful expressions!</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {savedPhrases.map((phrase) => (
                      <div key={phrase.id} className="bg-white/5 rounded-lg p-4 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-white mb-1">{phrase.phrase}</div>
                          <div className="text-sm text-gray-400">From: {phrase.videoTitle}</div>
                        </div>
                        <button
                          onClick={() => removeSavedPhrase(phrase.id)}
                          className="text-red-400 hover:text-red-300 transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => {
              const watchStatus = getVideoWatchStatus(video.id);
              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => selectVideo(video)}
                >
                  {/* Thumbnail */}
                  <div className="relative">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    </div>
                    <div className="absolute top-3 right-3 bg-black/80 px-2 py-1 rounded text-white text-sm">
                      {video.duration}
                    </div>
                    {watchStatus && (
                      <div className="absolute top-3 left-3 bg-green-600 px-2 py-1 rounded text-white text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Watched
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-white text-lg flex-1">{video.title}</h4>
                    </div>
                    <div className="text-sm text-gray-400 mb-3">{video.channel}</div>
                    <p className="text-sm text-gray-300 mb-3">{video.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-3 py-1 rounded-full ${getLevelColor(video.level)}`}>
                        {video.level}
                      </span>
                      {watchStatus && watchStatus.quizScore !== undefined && (
                        <div className="text-sm text-green-400 flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {watchStatus.quizScore}%
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Video Player */
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={() => setSelectedVideo(null)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
          >
            ← Back to Videos
          </button>

          {/* Video Info */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedVideo.title}</h2>
                <div className="flex items-center gap-3 text-gray-400">
                  <span>{selectedVideo.channel}</span>
                  <span>•</span>
                  <span className={`px-3 py-1 rounded-full text-xs ${getLevelColor(selectedVideo.level)}`}>
                    {selectedVideo.level}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-300 mb-4">{selectedVideo.description}</p>

            {/* Video Player */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
              <iframe
                ref={playerRef}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?cc_load_policy=${subtitleMode === 'off' ? 0 : 1}&cc_lang_pref=${subtitleMode === 'fr' ? 'fr' : 'en'}&playbackRate=${playbackSpeed}`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Subtitles className="w-5 h-5 text-gray-400" />
                <select
                  value={subtitleMode}
                  onChange={(e) => setSubtitleMode(e.target.value as SubtitleMode)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="en">English Subtitles</option>
                  <option value="fr">French Subtitles</option>
                  <option value="off">No Subtitles</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-gray-400" />
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value) as PlaybackSpeed)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="0.75">0.75x (Slow)</option>
                  <option value="1">1x (Normal)</option>
                  <option value="1.25">1.25x (Fast)</option>
                  <option value="1.5">1.5x (Faster)</option>
                </select>
              </div>

              <button
                onClick={startQuiz}
                className="ml-auto px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-white transition-all flex items-center gap-2"
              >
                <Award className="w-5 h-5" />
                Take Quiz
              </button>
            </div>
          </div>

          {/* Key Phrases */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              Key Phrases Used in This Video
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {selectedVideo.keyPhrases.map((phrase, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 rounded-lg p-4 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {idx + 1}
                    </div>
                    <span className="text-white font-semibold">"{phrase}"</span>
                  </div>
                  <button
                    onClick={() => savePhrase(phrase)}
                    disabled={isPhraseSaved(phrase)}
                    className={`transition-all ${
                      isPhraseSaved(phrase)
                        ? "text-yellow-400"
                        : "text-gray-400 hover:text-yellow-400"
                    }`}
                  >
                    <Star className={`w-5 h-5 ${isPhraseSaved(phrase) ? "fill-current" : ""}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz Section */}
          <AnimatePresence>
            {showQuiz && !quizCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-8 text-white"
              >
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">Quiz Time! 🧠</h3>
                    <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                      Question {currentQuestionIndex + 1} / {selectedVideo.quizQuestions.length}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-white h-full rounded-full transition-all"
                      style={{ width: `${((currentQuestionIndex + 1) / selectedVideo.quizQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-xl font-semibold mb-4">
                    {selectedVideo.quizQuestions[currentQuestionIndex].question}
                  </h4>
                  <div className="space-y-3">
                    {selectedVideo.quizQuestions[currentQuestionIndex].options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => answerQuestion(idx)}
                        className="w-full text-left p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-all font-semibold"
                      >
                        {String.fromCharCode(65 + idx)}. {option}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {quizCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-8 text-white text-center"
              >
                <Trophy className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-3xl font-bold mb-2">Quiz Completed! 🎉</h3>
                <div className="text-6xl font-bold mb-4">{getQuizScore()}%</div>
                <p className="text-green-100 text-lg mb-6">
                  You got {quizAnswers.filter((ans, idx) => ans === selectedVideo.quizQuestions[idx].correctAnswer).length} out of {selectedVideo.quizQuestions.length} correct!
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all"
                  >
                    Back to Videos
                  </button>
                  <button
                    onClick={startQuiz}
                    className="px-6 py-3 bg-white text-green-600 hover:bg-green-50 rounded-xl font-bold transition-all"
                  >
                    Retake Quiz
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Info */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="font-bold text-lg mb-3">💡 Why Learning from Native Content Works</h3>
        <div className="space-y-2 text-blue-100 text-sm">
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0">•</span>
            <span><strong>Real accents & speed:</strong> Get used to how Americans ACTUALLY speak, not textbook English</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0">•</span>
            <span><strong>Natural expressions:</strong> Learn slang, idioms, and phrases that natives use every day</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0">•</span>
            <span><strong>Context matters:</strong> See how words are used in real situations, not isolated sentences</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0">•</span>
            <span><strong>Cultural insight:</strong> Understand American culture, humor, and communication style</span>
          </div>
        </div>
      </div>
    </div>
  );
}
