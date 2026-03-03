import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Zap, Timer, CheckCircle2, TrendingUp, Award, Eye, MessageCircle, Lightbulb, Sparkles, Play, Pause, RotateCcw } from "lucide-react";

type ExerciseType = "visual" | "stream" | "narration" | "reaction" | "decision";
type Difficulty = "beginner" | "intermediate" | "advanced";

interface ThinkingExercise {
  id: string;
  type: ExerciseType;
  difficulty: Difficulty;
  prompt: string;
  imagePrompt?: string;
  tips: string[];
  vocabularyHelp: string[];
  timeLimit: number; // seconds
  examples: string[];
}

interface ThinkingProgress {
  exerciseId: string;
  completed: boolean;
  duration: number;
  wordsUsed: number;
  completedAt: number;
}

export default function ThinkInEnglish() {
  const [selectedType, setSelectedType] = useState<ExerciseType | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ThinkingExercise | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  const [showTips, setShowTips] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [progress, setProgress] = useState<ThinkingProgress[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem("thinkInEnglishProgress");
    if (saved) {
      setProgress(JSON.parse(saved));
    }
  }, []);

  // Timer
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          if (selectedExercise && prev >= selectedExercise.timeLimit) {
            setIsActive(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, selectedExercise]);

  // Auto-focus textarea when exercise starts
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isActive]);

  const exercises: ThinkingExercise[] = [
    // VISUAL DESCRIPTION
    {
      id: "vis-1",
      type: "visual",
      difficulty: "beginner",
      prompt: "Look around your room right now. Describe what you see in English.",
      imagePrompt: "Your current environment",
      tips: [
        "Start with 'I can see...' or 'There is/are...'",
        "Use simple adjectives: big, small, blue, wooden",
        "Don't translate - think of the English word directly",
        "If you don't know a word, describe it: 'the thing I sit on' = chair"
      ],
      vocabularyHelp: ["furniture", "wall", "window", "desk", "lamp", "ceiling", "floor", "door"],
      timeLimit: 60,
      examples: [
        "I can see a wooden desk in front of me with a laptop on it.",
        "There's a blue lamp on my left side, next to some books.",
        "The walls are white and there's a large window behind me."
      ]
    },
    {
      id: "vis-2",
      type: "visual",
      difficulty: "intermediate",
      prompt: "Imagine your perfect vacation spot. Describe it in vivid detail.",
      imagePrompt: "Dream vacation destination",
      tips: [
        "Use sensory details: what you see, hear, smell, feel",
        "Practice present continuous: 'I'm walking on the beach...'",
        "Use vivid adjectives: crystal-clear, breathtaking, serene",
        "Think in English - don't plan in French first!"
      ],
      vocabularyHelp: ["beach", "mountains", "sunset", "waves", "peaceful", "stunning", "relaxing", "paradise"],
      timeLimit: 90,
      examples: [
        "I'm standing on a pristine beach with crystal-clear turquoise water stretching to the horizon.",
        "Palm trees are swaying gently in the warm breeze, and I can hear the rhythmic sound of waves.",
        "The sand is soft and white beneath my feet, and the sunset is painting the sky in shades of orange and pink."
      ]
    },
    {
      id: "vis-3",
      type: "visual",
      difficulty: "advanced",
      prompt: "Describe a complex scene: a busy coffee shop during rush hour.",
      imagePrompt: "Bustling coffee shop",
      tips: [
        "Describe multiple things happening simultaneously",
        "Use present continuous for ongoing actions",
        "Add emotional observations: 'They seem stressed/relaxed'",
        "Layer your description: sights, sounds, atmosphere"
      ],
      vocabularyHelp: ["bustling", "barista", "customers", "chatting", "ordering", "brewing", "atmosphere", "crowded"],
      timeLimit: 120,
      examples: [
        "The coffee shop is absolutely packed. There's a long line of customers waiting to order, and I can hear the constant hissing of the espresso machine.",
        "Two baristas are working frantically behind the counter, calling out names and preparing drinks simultaneously.",
        "In the corner, a group of students is studying, laptops open, completely focused despite the noise around them."
      ]
    },

    // STREAM OF CONSCIOUSNESS
    {
      id: "stream-1",
      type: "stream",
      difficulty: "beginner",
      prompt: "What are you thinking about right now? Just let your thoughts flow in English for 60 seconds.",
      tips: [
        "Don't censor yourself - write whatever comes to mind",
        "Use simple sentences: 'I'm thinking about...', 'I wonder...'",
        "It's OK to be random - that's the point!",
        "Keep typing/thinking - don't stop to correct yourself"
      ],
      vocabularyHelp: ["I'm thinking", "I wonder", "maybe", "I should", "I need to", "I feel", "right now"],
      timeLimit: 60,
      examples: [
        "I'm thinking about what I'll eat for lunch. Maybe pasta? I wonder if there's any in the kitchen. I should probably check. Right now I'm feeling a bit hungry but also excited to finish this exercise.",
        "My mind is jumping between tasks. I need to call my friend later. Oh, and that meeting tomorrow - I should prepare for it. The weather looks nice outside..."
      ]
    },
    {
      id: "stream-2",
      type: "stream",
      difficulty: "intermediate",
      prompt: "Narrate your morning routine as if you're living it right now.",
      tips: [
        "Use present simple for habits: 'I wake up, I brush my teeth'",
        "Add details: times, feelings, thoughts",
        "Think chronologically but add your inner thoughts",
        "Make it personal and specific to YOU"
      ],
      vocabularyHelp: ["wake up", "alarm", "shower", "breakfast", "get dressed", "coffee", "routine", "usually"],
      timeLimit: 90,
      examples: [
        "My alarm goes off at 7 AM, but honestly, I usually hit snooze at least twice. When I finally drag myself out of bed, the first thing I do is check my phone - I know I shouldn't, but I always do.",
        "Then I head to the bathroom, brush my teeth while looking at myself in the mirror thinking 'I need more sleep.' After a quick shower, I feel more awake and ready to face the day."
      ]
    },
    {
      id: "stream-3",
      type: "stream",
      difficulty: "advanced",
      prompt: "Reflect on your biggest challenge this week and how you're handling it.",
      tips: [
        "Use past tense for what happened, present for current feelings",
        "Express emotions: frustrated, overwhelmed, determined",
        "Show your thought process: 'On one hand... on the other hand...'",
        "Be authentic - real thoughts in real English"
      ],
      vocabularyHelp: ["challenging", "struggling with", "dealing with", "on the other hand", "I realized", "honestly"],
      timeLimit: 120,
      examples: [
        "This week has been really challenging because of this project at work. I've been struggling with the deadline, and honestly, I'm feeling a bit overwhelmed. On one hand, I know I can do it, but on the other hand, the pressure is intense.",
        "What I realized though is that breaking it into smaller tasks helps. Instead of thinking about the whole thing, I'm focusing on one piece at a time. It's still hard, but I'm making progress."
      ]
    },

    // NARRATION
    {
      id: "narr-1",
      type: "narration",
      difficulty: "beginner",
      prompt: "Narrate what you did yesterday from wake-up to bedtime.",
      tips: [
        "Use past simple: 'I woke up, I ate breakfast, I went to...'",
        "Use time markers: 'First, then, after that, later, finally'",
        "Keep it simple but complete",
        "Think in chronological order"
      ],
      vocabularyHelp: ["woke up", "had breakfast", "went to", "came back", "in the evening", "before bed"],
      timeLimit: 90,
      examples: [
        "Yesterday I woke up around 8 AM. First, I had coffee and checked my emails. Then I worked from home until noon. After lunch, I went for a walk to clear my head.",
        "In the evening, I cooked dinner and watched a movie. Before bed, I read for about 30 minutes. It was a pretty normal day overall."
      ]
    },
    {
      id: "narr-2",
      type: "narration",
      difficulty: "intermediate",
      prompt: "Tell the story of a memorable moment from your childhood.",
      tips: [
        "Set the scene: 'I was about 10 years old when...'",
        "Use past continuous for background: 'The sun was shining...'",
        "Add emotional details: how you felt",
        "Build to the key moment"
      ],
      vocabularyHelp: ["I remember", "back then", "used to", "suddenly", "I felt", "it was", "looking back"],
      timeLimit: 120,
      examples: [
        "I remember when I was about 8 years old, my family went to the beach for vacation. I had never seen the ocean before, and I was both excited and nervous.",
        "The moment I saw those huge waves, I was terrified but fascinated. My dad held my hand and we walked into the water together. Looking back, it was one of the best days of my childhood."
      ]
    },
    {
      id: "narr-3",
      type: "narration",
      difficulty: "advanced",
      prompt: "Narrate a turning point in your life - a decision that changed everything.",
      tips: [
        "Use a mix of tenses: past for events, present perfect for impact",
        "Reflect on before vs after: 'Before this, I was... Now I am...'",
        "Show cause and effect",
        "Get deep - this is advanced thinking in English"
      ],
      vocabularyHelp: ["turning point", "I decided to", "it changed", "since then", "looking back", "I realized"],
      timeLimit: 150,
      examples: [
        "The biggest turning point in my life was when I decided to change careers three years ago. Before that, I was working in finance, but I felt unfulfilled and stuck in a routine.",
        "One day, I just realized I couldn't keep doing this for another 30 years. So I took the leap, enrolled in a coding bootcamp, and completely pivoted. It was terrifying, but since then, my life has been so much more fulfilling. Looking back, it was the best decision I ever made."
      ]
    },

    // QUICK REACTIONS
    {
      id: "react-1",
      type: "reaction",
      difficulty: "beginner",
      prompt: "React to this: You just won $10,000! What's going through your mind?",
      tips: [
        "Express immediate emotion: 'Oh my God!', 'I can't believe it!'",
        "Use present continuous: 'I'm thinking...', 'I'm feeling...'",
        "Let yourself be excited - emotion helps you think in English!",
        "Plan out loud: 'First I'd... then I'd...'"
      ],
      vocabularyHelp: ["I can't believe", "amazing", "first thing", "I'd probably", "definitely", "excited"],
      timeLimit: 60,
      examples: [
        "Oh my God! I can't believe this! I'm literally shaking right now! The first thing I'd do is pay off my student loans - that's been weighing on me for years.",
        "Then I'd probably treat my family to something nice, maybe a vacation. And definitely save some for emergencies. This is absolutely incredible!"
      ]
    },
    {
      id: "react-2",
      type: "reaction",
      difficulty: "intermediate",
      prompt: "You just got offered your dream job, but you'd have to move to another country. React!",
      tips: [
        "Show conflicting emotions: 'On one hand... but on the other hand...'",
        "Think through pros and cons out loud",
        "Use conditionals: 'If I take it... If I don't...'",
        "Be real about your hesitations"
      ],
      vocabularyHelp: ["dream job", "opportunity", "on the other hand", "pros and cons", "worth it", "risk"],
      timeLimit: 90,
      examples: [
        "Wow, this is huge! On one hand, it's literally my dream job - everything I've been working towards. But on the other hand, moving to another country is a massive change.",
        "I'd have to leave my friends, my family, everything familiar. The pros are obvious - career growth, new experiences, adventure. The cons are... scary. But honestly, opportunities like this don't come twice. I think I'd regret not taking the risk."
      ]
    },

    // DECISION MAKING
    {
      id: "dec-1",
      type: "decision",
      difficulty: "intermediate",
      prompt: "You have one free hour today. Think through what you'd do with it and why.",
      tips: [
        "Weigh different options: 'I could... or I could...'",
        "Give reasons: 'because', 'since', 'that way'",
        "Make a decision and justify it",
        "Think like you're talking to yourself"
      ],
      vocabularyHelp: ["I could", "or maybe", "that way", "because", "probably better to", "I think I'll"],
      timeLimit: 75,
      examples: [
        "Let's see... I could go for a run because I've been sitting all day. Or maybe I could call my friend - we haven't talked in a while. Actually, reading that book I started would be nice too.",
        "Hmm, I think I'll go for the run. That way I get exercise AND fresh air, and I'll feel energized after. The other stuff can wait until evening."
      ]
    },
    {
      id: "dec-2",
      type: "decision",
      difficulty: "advanced",
      prompt: "Think through a difficult decision you're currently facing. Reason it out in English.",
      tips: [
        "Present the dilemma clearly",
        "Explore each option thoroughly",
        "Consider long-term vs short-term impacts",
        "Arrive at a conclusion (or acknowledge the difficulty)"
      ],
      vocabularyHelp: ["dilemma", "weighing options", "in the long run", "short-term", "trade-off", "I'm leaning towards"],
      timeLimit: 150,
      examples: [
        "So I'm facing this dilemma about whether to stay at my current job or take a new offer. The current job is stable, I know the people, and it's comfortable. But there's no real growth opportunity left.",
        "The new offer has higher pay and more responsibility, but it's also more pressure and uncertainty. In the long run, I think the new job would be better for my career. Short-term, it's riskier. I'm leaning towards taking it because staying comfortable feels like giving up on my potential."
      ]
    }
  ];

  const exerciseTypes = [
    {
      id: "visual" as ExerciseType,
      icon: "👁️",
      title: "Visual Description",
      desc: "Describe what you see in English",
      color: "from-blue-500 to-cyan-500",
      count: exercises.filter(e => e.type === "visual").length
    },
    {
      id: "stream" as ExerciseType,
      icon: "💭",
      title: "Stream of Consciousness",
      desc: "Let your thoughts flow freely",
      color: "from-purple-500 to-pink-500",
      count: exercises.filter(e => e.type === "stream").length
    },
    {
      id: "narration" as ExerciseType,
      icon: "📖",
      title: "Narration",
      desc: "Tell stories from your life",
      color: "from-green-500 to-emerald-500",
      count: exercises.filter(e => e.type === "narration").length
    },
    {
      id: "reaction" as ExerciseType,
      icon: "⚡",
      title: "Quick Reactions",
      desc: "Respond to scenarios instantly",
      color: "from-orange-500 to-red-500",
      count: exercises.filter(e => e.type === "reaction").length
    },
    {
      id: "decision" as ExerciseType,
      icon: "🤔",
      title: "Decision Making",
      desc: "Think through choices out loud",
      color: "from-yellow-500 to-amber-500",
      count: exercises.filter(e => e.type === "decision").length
    }
  ];

  const exercisesByType = (type: ExerciseType) =>
    exercises.filter(e => e.type === type);

  const startExercise = () => {
    setIsActive(true);
    setTimeElapsed(0);
    setUserResponse("");
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const completeExercise = () => {
    if (!selectedExercise) return;

    setIsActive(false);
    setHasCompleted(true);

    const wordCount = userResponse.trim().split(/\s+/).filter(w => w.length > 0).length;

    const newProgress: ThinkingProgress = {
      exerciseId: selectedExercise.id,
      completed: true,
      duration: timeElapsed,
      wordsUsed: wordCount,
      completedAt: Date.now()
    };

    const updatedProgress = [...progress.filter(p => p.exerciseId !== selectedExercise.id), newProgress];
    setProgress(updatedProgress);
    localStorage.setItem("thinkInEnglishProgress", JSON.stringify(updatedProgress));
  };

  const resetExercise = () => {
    setSelectedExercise(null);
    setSelectedType(null);
    setIsActive(false);
    setTimeElapsed(0);
    setUserResponse("");
    setShowTips(false);
    setShowExamples(false);
    setHasCompleted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCompletedCount = () => progress.filter(p => p.completed).length;
  const getTotalWords = () => progress.reduce((sum, p) => sum + p.wordsUsed, 0);
  const getAverageDuration = () => {
    if (progress.length === 0) return 0;
    return Math.round(progress.reduce((sum, p) => sum + p.duration, 0) / progress.length);
  };

  const wordCount = userResponse.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Brain className="w-10 h-10 text-purple-400" />
          Think-in-English Training
        </h1>
        <p className="text-xl text-gray-300">
          Stop translating. Start <span className="text-purple-400 font-bold">thinking directly in English.</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{getCompletedCount()}</div>
          <div className="text-purple-100 text-sm mt-1">Exercises Done</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white text-center">
          <MessageCircle className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{getTotalWords()}</div>
          <div className="text-blue-100 text-sm mt-1">Words Thought</div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white text-center">
          <Timer className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{formatTime(getAverageDuration())}</div>
          <div className="text-green-100 text-sm mt-1">Avg Duration</div>
        </div>
      </div>

      {!selectedType ? (
        <>
          {/* Exercise Type Selection */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🎯 Choose Exercise Type</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exerciseTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className="bg-white/10 hover:bg-white/20 rounded-xl p-6 transition-all text-left group"
                >
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <h4 className="text-lg font-bold text-white mb-2">{type.title}</h4>
                  <p className="text-sm text-gray-400 mb-3">{type.desc}</p>
                  <div className="text-xs text-gray-500">{type.count} exercises</div>
                </button>
              ))}
            </div>
          </div>

          {/* Why This Works */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
            <div className="flex items-start gap-3">
              <Brain className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-3">🧠 Why "Think-in-English" is THE Secret to Fluency</h3>
                <div className="space-y-2 text-purple-100 text-sm">
                  <div>
                    <strong className="text-white">The Problem:</strong> When you translate (French → English), you're SLOW and unnatural. Natives don't translate - they think directly in English.
                  </div>
                  <div>
                    <strong className="text-white">The Solution:</strong> Train your brain to bypass French completely. Think, describe, and react in English automatically.
                  </div>
                  <div>
                    <strong className="text-white">How It Works:</strong> These exercises force your brain into "English mode" where you can't rely on translation. At first it's hard - that's your brain rewiring itself!
                  </div>
                  <div className="mt-3 bg-white/10 rounded-lg p-3">
                    💡 <strong>Pro Tip:</strong> Do these exercises OUT LOUD or by typing. Silent thinking doesn't work - you need to produce language to build the neural pathways!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : !selectedExercise ? (
        <>
          {/* Exercise Selection */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {exerciseTypes.find(t => t.id === selectedType)?.icon} {exerciseTypes.find(t => t.id === selectedType)?.title}
              </h3>
              <button
                onClick={() => setSelectedType(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
              >
                Back
              </button>
            </div>

            <div className="space-y-3">
              {exercisesByType(selectedType).map((exercise) => {
                const exerciseProgress = progress.find(p => p.exerciseId === exercise.id);
                return (
                  <button
                    key={exercise.id}
                    onClick={() => setSelectedExercise(exercise)}
                    className="w-full bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-all text-left relative"
                  >
                    {exerciseProgress && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Done
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-20">
                        <div className="text-white font-semibold mb-1">{exercise.prompt}</div>
                        <div className="text-xs text-gray-500 capitalize mt-2">
                          {exercise.difficulty} • {exercise.timeLimit}s time limit
                        </div>
                      </div>
                    </div>

                    {exerciseProgress && (
                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                        <span>{exerciseProgress.wordsUsed} words</span>
                        <span>•</span>
                        <span>{formatTime(exerciseProgress.duration)}</span>
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
          {/* Exercise Screen */}
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{exerciseTypes.find(t => t.id === selectedExercise.type)?.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{exerciseTypes.find(t => t.id === selectedExercise.type)?.title}</h2>
                      <p className="text-sm text-gray-400 capitalize">{selectedExercise.difficulty} • {selectedExercise.timeLimit}s</p>
                    </div>
                  </div>
                  <p className="text-xl text-gray-300">{selectedExercise.prompt}</p>
                </div>
                <button
                  onClick={resetExercise}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
                >
                  Exit
                </button>
              </div>
            </div>

            {/* Timer & Controls */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div className="text-center flex-1">
                  <div className="text-sm opacity-75 mb-1">Time</div>
                  <div className="text-5xl font-bold">
                    {formatTime(timeElapsed)}
                  </div>
                  <div className="text-sm opacity-75 mt-1">
                    / {formatTime(selectedExercise.timeLimit)}
                  </div>
                </div>

                {timeElapsed < selectedExercise.timeLimit && (
                  <div className="text-center flex-1">
                    <div className="text-sm opacity-75 mb-1">Words</div>
                    <div className="text-5xl font-bold">{wordCount}</div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-white h-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (timeElapsed / selectedExercise.timeLimit) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-4">
                {!isActive && timeElapsed === 0 && (
                  <button
                    onClick={startExercise}
                    className="px-8 py-4 bg-white text-purple-600 hover:bg-gray-100 rounded-xl font-bold transition-all flex items-center gap-2"
                  >
                    <Play className="w-6 h-6" />
                    Start Thinking!
                  </button>
                )}

                {isActive && (
                  <button
                    onClick={pauseExercise}
                    className="px-8 py-4 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all flex items-center gap-2"
                  >
                    <Pause className="w-6 h-6" />
                    Pause
                  </button>
                )}

                {!isActive && timeElapsed > 0 && timeElapsed < selectedExercise.timeLimit && (
                  <button
                    onClick={() => setIsActive(true)}
                    className="px-8 py-4 bg-white text-purple-600 hover:bg-gray-100 rounded-xl font-bold transition-all flex items-center gap-2"
                  >
                    <Play className="w-6 h-6" />
                    Resume
                  </button>
                )}

                {timeElapsed > 0 && (
                  <button
                    onClick={() => {
                      setIsActive(false);
                      setTimeElapsed(0);
                      setUserResponse("");
                    }}
                    className="px-6 py-4 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all"
                    title="Reset"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Time's Up Message */}
              {!isActive && timeElapsed >= selectedExercise.timeLimit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-4 bg-yellow-500/20 border border-yellow-500 rounded-lg p-3"
                >
                  <p className="text-yellow-200 font-bold">⏰ Time's up! Click "Complete Exercise" below to finish.</p>
                </motion.div>
              )}
            </div>

            {/* Response Area */}
            {(isActive || timeElapsed > 0) && !hasCompleted && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Your Thoughts (Type or Speak Out Loud)
                </h3>
                <textarea
                  ref={textareaRef}
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Start thinking in English... Don't translate, just let it flow! 💭"
                  className="w-full h-64 bg-white/10 border border-white/20 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-400">
                    {wordCount} words • Keep going!
                  </div>
                  {userResponse.trim().length > 0 && (
                    <button
                      onClick={completeExercise}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-white transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Complete Exercise
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Help Sections */}
            {!hasCompleted && (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Tips */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <button
                    onClick={() => setShowTips(!showTips)}
                    className="w-full flex items-center justify-between text-white font-semibold mb-4"
                  >
                    <span className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      Tips to Help You
                    </span>
                    <span>{showTips ? "▼" : "▶"}</span>
                  </button>
                  <AnimatePresence>
                    {showTips && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 text-sm text-gray-300"
                      >
                        {selectedExercise.tips.map((tip, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-yellow-400 flex-shrink-0">•</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Vocabulary Help */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    Helpful Vocabulary
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.vocabularyHelp.map((word, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-500/20 border border-blue-400/50 rounded-full text-blue-200 text-sm"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Examples (Collapsible) */}
            {!hasCompleted && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <button
                  onClick={() => setShowExamples(!showExamples)}
                  className="w-full flex items-center justify-between text-white font-semibold mb-4"
                >
                  <span className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-green-400" />
                    Example Responses (Use Only If Stuck!)
                  </span>
                  <span>{showExamples ? "▼" : "▶"}</span>
                </button>
                <AnimatePresence>
                  {showExamples && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      {selectedExercise.examples.map((example, idx) => (
                        <div
                          key={idx}
                          className="bg-white/5 rounded-lg p-3 text-sm text-gray-300 italic border-l-4 border-green-500"
                        >
                          {example}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Completion Screen */}
            {hasCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-8 text-white"
              >
                <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-10 h-10" />
                  Exercise Complete! 🎉
                </h2>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">⏱️</div>
                    <div className="text-sm opacity-75 mb-1">Time Spent</div>
                    <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">💬</div>
                    <div className="text-sm opacity-75 mb-1">Words Thought</div>
                    <div className="text-2xl font-bold">{wordCount}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-sm opacity-75 mb-1">Speed</div>
                    <div className="text-2xl font-bold">{timeElapsed > 0 ? Math.round(wordCount / (timeElapsed / 60)) : 0} wpm</div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-2">Your Response:</h3>
                  <div className="text-sm text-green-100 max-h-64 overflow-y-auto whitespace-pre-wrap">
                    {userResponse}
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-2">💡 What Just Happened in Your Brain</h3>
                  <p className="text-sm text-green-100">
                    You just forced your brain to operate in English-only mode! This is exactly how you build fluency. 
                    The more you do this, the more natural English thinking becomes. Keep it up! 🔥
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={resetExercise}
                    className="px-6 py-3 bg-white text-green-600 hover:bg-gray-100 rounded-xl font-bold transition-all"
                  >
                    Choose New Exercise
                  </button>
                  <button
                    onClick={() => {
                      setHasCompleted(false);
                      setTimeElapsed(0);
                      setUserResponse("");
                      setIsActive(false);
                    }}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  );
}