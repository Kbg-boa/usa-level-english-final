import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Play, Pause, CheckCircle2, TrendingUp, Award, Sparkles, Lightbulb, Timer, MessageCircle, Zap, RotateCcw } from "lucide-react";

type StoryType = "personal" | "fictional" | "hypothetical" | "past-event" | "future-vision";
type Difficulty = "beginner" | "intermediate" | "advanced";

interface StoryPrompt {
  id: string;
  type: StoryType;
  difficulty: Difficulty;
  title: string;
  prompt: string;
  structureGuide: string[];
  vocabularyBoost: string[];
  timeLimit: number;
  exampleOpening: string;
  exampleMiddle: string;
  exampleEnding: string;
}

interface StorytellingProgress {
  promptId: string;
  completed: boolean;
  wordCount: number;
  duration: number;
  storyText: string;
  completedAt: number;
}

export default function StorytellingPractice() {
  const [selectedType, setSelectedType] = useState<StoryType | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<StoryPrompt | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [storyText, setStoryText] = useState("");
  const [showStructure, setShowStructure] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [progress, setProgress] = useState<StorytellingProgress[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem("storytellingProgress");
    if (saved) {
      setProgress(JSON.parse(saved));
    }
  }, []);

  // Timer
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
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
  }, [isActive]);

  const storyPrompts: StoryPrompt[] = [
    // PERSONAL STORIES
    {
      id: "pers-1",
      type: "personal",
      difficulty: "beginner",
      title: "My Best Day Ever",
      prompt: "Tell the story of the best day you've ever had. What made it so special?",
      structureGuide: [
        "Opening: Set the scene (when, where, who)",
        "Build-up: What was happening before the great moment?",
        "Climax: The best part - describe it in detail!",
        "Reflection: Why was it the best day? How did you feel?",
        "Ending: What do you remember most?"
      ],
      vocabularyBoost: ["unforgettable", "amazing", "I'll never forget", "the moment when", "looking back", "I felt so"],
      timeLimit: 300,
      exampleOpening: "It was a sunny Saturday in July, about five years ago. I woke up that morning with no idea that it would become the best day of my life.",
      exampleMiddle: "We drove to the beach, and the moment I saw the ocean, I felt this incredible sense of freedom. My friends were already there, setting up a volleyball net.",
      exampleEnding: "Looking back, what made it the best day wasn't just the beach or the fun - it was being surrounded by people I love, completely present in the moment. I'll never forget that feeling."
    },
    {
      id: "pers-2",
      type: "personal",
      difficulty: "intermediate",
      title: "A Time I Overcame Fear",
      prompt: "Tell about a moment when you faced a fear and pushed through it.",
      structureGuide: [
        "Opening: Introduce the fear you had",
        "Situation: What forced you to face it?",
        "Internal struggle: Describe your doubts and worries",
        "The moment: When you decided to do it anyway",
        "Outcome: What happened? How did you feel after?",
        "Growth: What did you learn?"
      ],
      vocabularyBoost: ["terrified", "anxious", "my heart was pounding", "I decided to", "despite my fear", "it turned out", "I realized"],
      timeLimit: 360,
      exampleOpening: "I've always been terrified of public speaking. My hands would shake, my voice would crack - the whole deal. But when I got promoted to team lead, I knew I couldn't avoid it anymore.",
      exampleMiddle: "Standing in front of 50 people at that first meeting, I could feel my heart pounding. My prepared notes seemed to blur. But then I remembered - everyone in this room wants me to succeed.",
      exampleEnding: "It wasn't perfect, but I got through it. And you know what? The second presentation was easier. The third one, I actually enjoyed. Facing that fear changed how I see myself."
    },
    {
      id: "pers-3",
      type: "personal",
      difficulty: "advanced",
      title: "The Moment Everything Changed",
      prompt: "Tell the story of a pivotal moment that redirected your life's path.",
      structureGuide: [
        "Opening: Life before the moment",
        "The ordinary day: It started like any other...",
        "The turning point: What happened that changed everything",
        "Immediate reaction: Your initial thoughts/feelings",
        "Ripple effects: How it impacted other areas of life",
        "Present reflection: How that moment shaped who you are today"
      ],
      vocabularyBoost: ["little did I know", "at that moment", "everything shifted", "in retrospect", "that decision led to", "if I hadn't"],
      timeLimit: 420,
      exampleOpening: "Before that conversation, I was on autopilot - comfortable job, predictable routine, no complaints. I thought I had it all figured out.",
      exampleMiddle: "But when my old college professor asked me, 'Are you really happy, or just comfortable?' something cracked open inside me. I didn't have an answer.",
      exampleEnding: "That question haunted me for weeks. Eventually, I quit my job, went back to school, and completely reinvented myself. Five years later, I'm doing work I love. That one conversation changed the entire trajectory of my life."
    },

    // FICTIONAL STORIES
    {
      id: "fic-1",
      type: "fictional",
      difficulty: "beginner",
      title: "The Mysterious Package",
      prompt: "You receive a package at your door with no return address. What's inside? Create a story.",
      structureGuide: [
        "Opening: Discover the package",
        "Curiosity: Describe it, build suspense",
        "The reveal: What's inside?",
        "Complication: There's a problem or mystery",
        "Resolution: How does it end?"
      ],
      vocabularyBoost: ["to my surprise", "I carefully opened", "inside was", "suddenly", "I realized that", "it turned out"],
      timeLimit: 300,
      exampleOpening: "The package was sitting on my doorstep when I got home from work. Brown paper, no label, just my address written in elegant handwriting I didn't recognize.",
      exampleMiddle: "I carefully tore open the wrapping. Inside was an old key - brass, ornate, clearly antique. And a note: 'You'll know where this belongs.'",
      exampleEnding: "Three days later, I was walking past an abandoned building I'd passed a thousand times. Something made me stop. The lock on the front door was the exact match for the key."
    },
    {
      id: "fic-2",
      type: "fictional",
      difficulty: "intermediate",
      title: "Time Traveler's Dilemma",
      prompt: "You wake up 100 years in the past. You can only stay for 24 hours. What do you do?",
      structureGuide: [
        "Opening: The moment you realize where/when you are",
        "Initial shock: Processing the situation",
        "Decision: What's most important to do?",
        "Action: Tell the story of your 24 hours",
        "Conflict: Something goes wrong or is difficult",
        "Ending: You return to present - what changed?"
      ],
      vocabularyBoost: ["I found myself", "at first I couldn't believe", "I had to make a choice", "with limited time", "I encountered", "before I knew it"],
      timeLimit: 360,
      exampleOpening: "I woke up in a bed that wasn't mine, in a room lit by gas lamps. Through the window, horse-drawn carriages moved down cobblestone streets. It was 1924.",
      exampleMiddle: "With only 24 hours, I knew I had to be strategic. I wandered the streets, overwhelmed by how different yet familiar everything felt. Then I saw her - my great-grandmother, as a young woman.",
      exampleEnding: "I couldn't reveal who I was, but I spent the afternoon talking with her at a café. She told me about her dreams, her fears. Twenty-four hours later, I was back. But I'll never forget her face."
    },
    {
      id: "fic-3",
      type: "fictional",
      difficulty: "advanced",
      title: "The Last Human",
      prompt: "Create a story where you're the last person on Earth. What happened? What do you do?",
      structureGuide: [
        "Opening: The realization that everyone is gone",
        "Flashback: Brief explanation of what happened",
        "Emotional journey: Loneliness, fear, adaptation",
        "Daily survival: What your life looks like now",
        "Discovery: You find something/someone unexpected",
        "Resolution: Hope or despair? Your choice."
      ],
      vocabularyBoost: ["the silence was deafening", "I was utterly alone", "I had no choice but to", "days turned into weeks", "and then one day", "against all odds"],
      timeLimit: 480,
      exampleOpening: "The city is silent. No cars, no voices, no life. I've been walking for three days and haven't seen a single person. I think I'm the last one left.",
      exampleMiddle: "The virus spread so fast - three weeks from outbreak to extinction. I was immune, they said. Lucky me. Now I spend my days searching for food, talking to myself to remember what my voice sounds like.",
      exampleEnding: "And then, on day 147, I heard it. A radio transmission. A voice. 'Is anyone out there?' I wasn't alone after all."
    },

    // HYPOTHETICAL SCENARIOS
    {
      id: "hypo-1",
      type: "hypothetical",
      difficulty: "beginner",
      title: "Winning the Lottery",
      prompt: "You just won 10 million dollars. Tell the story of your first week as a millionaire.",
      structureGuide: [
        "Opening: The moment you find out",
        "Initial reaction: Shock, joy, disbelief",
        "First decisions: What do you do first?",
        "Day by day: Tell the story of that week",
        "Challenges: Is it all perfect?",
        "Ending: How has your life changed?"
      ],
      vocabularyBoost: ["I couldn't believe it", "the first thing I did", "I decided to", "within a week", "surprisingly", "it wasn't all"],
      timeLimit: 300,
      exampleOpening: "I checked the lottery numbers three times before I let myself believe it. 10 million dollars. My hands were shaking so badly I could barely hold the ticket.",
      exampleMiddle: "The first day, I didn't tell anyone. I just sat in my apartment, staring at the ticket, wondering if it was real. Day two, I told my family. Day three, everything changed.",
      exampleEnding: "By the end of the week, I'd quit my job, hired a financial advisor, and started planning the rest of my life. But honestly? I also felt overwhelmed and a little scared of all the changes ahead."
    },
    {
      id: "hypo-2",
      type: "hypothetical",
      difficulty: "intermediate",
      title: "Superpower for a Day",
      prompt: "You wake up with a superpower, but it only lasts 24 hours. What is it and what do you do?",
      structureGuide: [
        "Opening: Discovery of the power",
        "Testing: Figure out what you can do",
        "Temptation: What selfish thing do you consider?",
        "Choice: What you actually decide to do",
        "Impact: How you use it to help",
        "Ending: Power fades - any regrets?"
      ],
      vocabularyBoost: ["to my amazement", "I discovered I could", "I was tempted to", "instead I chose", "I managed to", "as the power faded"],
      timeLimit: 360,
      exampleOpening: "I woke up floating three feet above my bed. Flight. I could actually fly. And according to the mysterious note on my pillow, I had exactly 24 hours.",
      exampleMiddle: "At first, I just wanted to enjoy it - soaring over the city, feeling the wind. But then I saw a car accident on the highway below. Someone was trapped.",
      exampleEnding: "I spent those 24 hours being a real-life superhero. I saved twelve people. As midnight approached and I felt the power fading, I had one thought: I wish I'd had more time."
    },

    // PAST EVENTS
    {
      id: "past-1",
      type: "past-event",
      difficulty: "beginner",
      title: "My First Day at School/Work",
      prompt: "Tell the story of your first day at a new school or new job.",
      structureGuide: [
        "Opening: The night before - nerves and preparation",
        "Arrival: Walking in for the first time",
        "First impressions: People, place, atmosphere",
        "Challenges: Something difficult or awkward",
        "Turning point: When it got better",
        "Ending: End of the day reflection"
      ],
      vocabularyBoost: ["I was so nervous", "walking in", "everyone seemed", "I didn't know anyone", "and then", "by the end of the day"],
      timeLimit: 300,
      exampleOpening: "The night before my first day, I barely slept. I'd picked out my outfit three times, checked the route twice. I wanted everything to be perfect.",
      exampleMiddle: "Walking into that office, I felt completely out of place. Everyone seemed to know each other, had inside jokes. I ate lunch alone at my desk.",
      exampleEnding: "But then someone invited me to the afternoon coffee run. Just that small gesture made everything better. By 5 PM, I was actually excited to come back tomorrow."
    },
    {
      id: "past-2",
      type: "past-event",
      difficulty: "intermediate",
      title: "A Journey That Changed Me",
      prompt: "Tell about a trip or journey (physical or metaphorical) that changed your perspective.",
      structureGuide: [
        "Opening: Why you decided to go",
        "Expectations: What you thought it would be like",
        "Reality: How it was different",
        "Key moment: The experience that shifted something",
        "Return: Coming home with new eyes",
        "Lasting impact: How you're different now"
      ],
      vocabularyBoost: ["I had always wanted to", "I expected", "what I found instead", "that experience taught me", "I came back", "I'll never see"],
      timeLimit: 360,
      exampleOpening: "I booked the solo trip to Japan on impulse. Everyone thought I was crazy - traveling alone to a country where I didn't speak the language. But I needed to prove something to myself.",
      exampleMiddle: "The first few days were terrifying. I got lost constantly, couldn't read signs, felt completely alone. But then I stopped trying to control everything and just... let go.",
      exampleEnding: "I came back a different person. More confident, more open, less afraid of the unknown. That trip taught me that growth happens when you step outside your comfort zone."
    },

    // FUTURE VISION
    {
      id: "fut-1",
      type: "future-vision",
      difficulty: "intermediate",
      title: "10 Years From Now",
      prompt: "Tell the story of a typical day in your life 10 years from now. Make it as detailed as possible.",
      structureGuide: [
        "Opening: Wake up - where are you? With whom?",
        "Morning routine: What's your life like?",
        "Work/passion: What do you do? Why?",
        "Relationships: Who's important in your life?",
        "Evening: How do you spend your time?",
        "Reflection: How did you get here from now?"
      ],
      vocabularyBoost: ["I wake up in", "by this point", "I've built", "my typical day includes", "I've learned that", "looking back"],
      timeLimit: 360,
      exampleOpening: "I wake up at 6 AM in my house by the coast. The sound of waves is my alarm clock now. My partner is already up, making coffee in the kitchen.",
      exampleMiddle: "My company is fully remote now - I built it from scratch over the past decade. I work from home, focusing on projects that actually matter to me. No more corporate meetings about meetings.",
      exampleEnding: "Evening, I'm teaching a free coding class for kids in my community. This life - balanced, purposeful, free - it took years of hard choices to build. But every decision was worth it."
    },
    {
      id: "fut-2",
      type: "future-vision",
      difficulty: "advanced",
      title: "The World in 2050",
      prompt: "Create a story set in 2050. What has changed? What has stayed the same? Follow a character through one day.",
      structureGuide: [
        "Opening: Establish the future world",
        "Technology: What's different?",
        "Society: How do people live?",
        "Character focus: Follow someone's day",
        "Conflict: What problems still exist?",
        "Resolution: Hope or warning?"
      ],
      vocabularyBoost: ["by 2050", "technology has", "people no longer", "AI has become", "despite advances", "the question remains"],
      timeLimit: 480,
      exampleOpening: "In 2050, cities float above the flooded coastlines. Maya takes the air-tram to work, passing through clouds that used to be impossible to reach.",
      exampleMiddle: "At her job in climate restoration, she programs massive drones to plant forests. AI handles most tasks now, but humans still make the important decisions. We learned that lesson the hard way.",
      exampleEnding: "The world is different - some things better, some worse. We saved the climate but lost some privacy. We cured diseases but created new anxieties. Progress is always a trade-off."
    }
  ];

  const storyTypes = [
    {
      id: "personal" as StoryType,
      icon: "💭",
      title: "Personal Stories",
      desc: "Real experiences from your life",
      color: "from-blue-500 to-cyan-500",
      count: storyPrompts.filter(p => p.type === "personal").length
    },
    {
      id: "fictional" as StoryType,
      icon: "✨",
      title: "Fictional Tales",
      desc: "Creative imagination stories",
      color: "from-purple-500 to-pink-500",
      count: storyPrompts.filter(p => p.type === "fictional").length
    },
    {
      id: "hypothetical" as StoryType,
      icon: "🤔",
      title: "Hypothetical Scenarios",
      desc: "What if... situations",
      color: "from-green-500 to-emerald-500",
      count: storyPrompts.filter(p => p.type === "hypothetical").length
    },
    {
      id: "past-event" as StoryType,
      icon: "📅",
      title: "Past Events",
      desc: "Significant moments you lived",
      color: "from-orange-500 to-red-500",
      count: storyPrompts.filter(p => p.type === "past-event").length
    },
    {
      id: "future-vision" as StoryType,
      icon: "🚀",
      title: "Future Vision",
      desc: "Imagining what's to come",
      color: "from-yellow-500 to-amber-500",
      count: storyPrompts.filter(p => p.type === "future-vision").length
    }
  ];

  const promptsByType = (type: StoryType) =>
    storyPrompts.filter(p => p.type === type);

  const startStory = () => {
    setIsActive(true);
    setTimeElapsed(0);
    setStoryText("");
  };

  const completeStory = () => {
    if (!selectedPrompt) return;

    setIsActive(false);
    setHasCompleted(true);

    const wordCount = storyText.trim().split(/\s+/).filter(w => w.length > 0).length;

    const newProgress: StorytellingProgress = {
      promptId: selectedPrompt.id,
      completed: true,
      wordCount,
      duration: timeElapsed,
      storyText,
      completedAt: Date.now()
    };

    const updatedProgress = [...progress.filter(p => p.promptId !== selectedPrompt.id), newProgress];
    setProgress(updatedProgress);
    localStorage.setItem("storytellingProgress", JSON.stringify(updatedProgress));
  };

  const resetStory = () => {
    setSelectedPrompt(null);
    setSelectedType(null);
    setIsActive(false);
    setTimeElapsed(0);
    setStoryText("");
    setShowStructure(false);
    setShowExamples(false);
    setHasCompleted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCompletedCount = () => progress.filter(p => p.completed).length;
  const getTotalWords = () => progress.reduce((sum, p) => sum + p.wordCount, 0);
  const getAverageDuration = () => {
    if (progress.length === 0) return 0;
    return Math.round(progress.reduce((sum, p) => sum + p.duration, 0) / progress.length);
  };

  const wordCount = storyText.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <BookOpen className="w-10 h-10 text-pink-400" />
          Storytelling Practice
        </h1>
        <p className="text-xl text-gray-300">
          Master narrative fluency. Tell <span className="text-pink-400 font-bold">compelling stories in English.</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl p-6 text-white text-center">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{getCompletedCount()}</div>
          <div className="text-pink-100 text-sm mt-1">Stories Told</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center">
          <MessageCircle className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{getTotalWords()}</div>
          <div className="text-purple-100 text-sm mt-1">Total Words</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white text-center">
          <Timer className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{formatTime(getAverageDuration())}</div>
          <div className="text-blue-100 text-sm mt-1">Avg Time</div>
        </div>
      </div>

      {!selectedType ? (
        <>
          {/* Story Type Selection */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📖 Choose Story Type</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {storyTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className="bg-white/10 hover:bg-white/20 rounded-xl p-6 transition-all text-left group"
                >
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <h4 className="text-lg font-bold text-white mb-2">{type.title}</h4>
                  <p className="text-sm text-gray-400 mb-3">{type.desc}</p>
                  <div className="text-xs text-gray-500">{type.count} prompts</div>
                </button>
              ))}
            </div>
          </div>

          {/* Why Storytelling Works */}
          <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl p-6 text-white">
            <div className="flex items-start gap-3">
              <BookOpen className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-3">📚 Why Storytelling = Fluency Mastery</h3>
                <div className="space-y-2 text-pink-100 text-sm">
                  <div>
                    <strong className="text-white">Natives Tell Stories:</strong> Americans communicate through narratives. From casual "So this crazy thing happened..." to business presentations - it's all storytelling.
                  </div>
                  <div>
                    <strong className="text-white">Complex Language Skills:</strong> Stories require past/present/future tenses, emotions, descriptions, dialogue - ALL fluency skills combined!
                  </div>
                  <div>
                    <strong className="text-white">Natural Flow:</strong> When you tell a story, you stop overthinking grammar. You focus on communicating meaning - just like natives do.
                  </div>
                  <div>
                    <strong className="text-white">Emotional Connection:</strong> Stories with emotion are memorable. You'll remember the language you used because it was connected to feeling.
                  </div>
                  <div className="mt-3 bg-white/10 rounded-lg p-3 text-xs">
                    💡 <strong>Pro Tip:</strong> Don't write perfect prose! Write like you're telling a friend. Use "and then...", "so...", "but here's the thing..." - casual connectors natives actually use!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : !selectedPrompt ? (
        <>
          {/* Prompt Selection */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {storyTypes.find(t => t.id === selectedType)?.icon} {storyTypes.find(t => t.id === selectedType)?.title}
              </h3>
              <button
                onClick={() => setSelectedType(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
              >
                Back
              </button>
            </div>

            <div className="space-y-3">
              {promptsByType(selectedType).map((prompt) => {
                const promptProgress = progress.find(p => p.promptId === prompt.id);
                return (
                  <button
                    key={prompt.id}
                    onClick={() => setSelectedPrompt(prompt)}
                    className="w-full bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-all text-left relative"
                  >
                    {promptProgress && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Done
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-20">
                        <div className="text-white font-semibold mb-1">{prompt.title}</div>
                        <div className="text-sm text-gray-400 mb-2">{prompt.prompt}</div>
                        <div className="text-xs text-gray-500 capitalize">
                          {prompt.difficulty} • {Math.floor(prompt.timeLimit / 60)} min suggested
                        </div>
                      </div>
                    </div>

                    {promptProgress && (
                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                        <span>{promptProgress.wordCount} words</span>
                        <span>•</span>
                        <span>{formatTime(promptProgress.duration)}</span>
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
          {/* Story Writing Screen */}
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedPrompt.title}</h2>
                  <p className="text-lg text-gray-300 mb-2">{selectedPrompt.prompt}</p>
                  <div className="text-sm text-gray-400 capitalize">
                    {selectedPrompt.difficulty} • {Math.floor(selectedPrompt.timeLimit / 60)} minutes suggested
                  </div>
                </div>
                <button
                  onClick={resetStory}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
                >
                  Exit
                </button>
              </div>
            </div>

            {/* Timer & Stats */}
            <div className="bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl p-6 text-white">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-sm opacity-75 mb-1">Time</div>
                  <div className="text-4xl font-bold">{formatTime(timeElapsed)}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-75 mb-1">Words</div>
                  <div className="text-4xl font-bold">{wordCount}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-75 mb-1">Speed</div>
                  <div className="text-4xl font-bold">
                    {timeElapsed > 0 ? Math.round(wordCount / (timeElapsed / 60)) : 0}
                  </div>
                  <div className="text-xs opacity-75">words/min</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mt-6">
                {!isActive && timeElapsed === 0 && (
                  <button
                    onClick={startStory}
                    className="px-8 py-4 bg-white text-pink-600 hover:bg-gray-100 rounded-xl font-bold transition-all flex items-center gap-2"
                  >
                    <Play className="w-6 h-6" />
                    Start Writing!
                  </button>
                )}

                {isActive && (
                  <button
                    onClick={() => setIsActive(false)}
                    className="px-8 py-4 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all flex items-center gap-2"
                  >
                    <Pause className="w-6 h-6" />
                    Pause
                  </button>
                )}

                {!isActive && timeElapsed > 0 && !hasCompleted && (
                  <button
                    onClick={() => setIsActive(true)}
                    className="px-8 py-4 bg-white text-pink-600 hover:bg-gray-100 rounded-xl font-bold transition-all flex items-center gap-2"
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
                      setStoryText("");
                    }}
                    className="px-6 py-4 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Writing Area */}
            {(isActive || timeElapsed > 0) && !hasCompleted && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Your Story
                </h3>
                <textarea
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  placeholder="Start writing your story... Remember: write like you're talking to a friend. Don't overthink it! 📖"
                  className="w-full h-96 bg-white/10 border border-white/20 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none text-lg leading-relaxed"
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-400">
                    {wordCount} words • Keep the story flowing!
                  </div>
                  {storyText.trim().length > 50 && (
                    <button
                      onClick={completeStory}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-white transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Complete Story
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Help Sections */}
            {!hasCompleted && (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Story Structure */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <button
                    onClick={() => setShowStructure(!showStructure)}
                    className="w-full flex items-center justify-between text-white font-semibold mb-4"
                  >
                    <span className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      Story Structure Guide
                    </span>
                    <span>{showStructure ? "▼" : "▶"}</span>
                  </button>
                  <AnimatePresence>
                    {showStructure && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        {selectedPrompt.structureGuide.map((step, idx) => (
                          <div key={idx} className="bg-white/5 rounded-lg p-3 text-sm text-gray-300 border-l-4 border-yellow-500">
                            <strong className="text-yellow-300">Step {idx + 1}:</strong> {step}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Vocabulary Boost */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-400" />
                    Vocabulary Boost
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.vocabularyBoost.map((phrase, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-500/20 border border-blue-400/50 rounded-full text-blue-200 text-sm"
                      >
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Example Snippets */}
            {!hasCompleted && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <button
                  onClick={() => setShowExamples(!showExamples)}
                  className="w-full flex items-center justify-between text-white font-semibold mb-4"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-400" />
                    Example Story Snippets (Use for Inspiration Only!)
                  </span>
                  <span>{showExamples ? "▼" : "▶"}</span>
                </button>
                <AnimatePresence>
                  {showExamples && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div className="bg-green-500/10 rounded-lg p-4 border-l-4 border-green-500">
                        <div className="text-xs text-green-400 font-semibold mb-2">OPENING EXAMPLE:</div>
                        <div className="text-sm text-gray-300 italic">{selectedPrompt.exampleOpening}</div>
                      </div>
                      <div className="bg-blue-500/10 rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="text-xs text-blue-400 font-semibold mb-2">MIDDLE EXAMPLE:</div>
                        <div className="text-sm text-gray-300 italic">{selectedPrompt.exampleMiddle}</div>
                      </div>
                      <div className="bg-purple-500/10 rounded-lg p-4 border-l-4 border-purple-500">
                        <div className="text-xs text-purple-400 font-semibold mb-2">ENDING EXAMPLE:</div>
                        <div className="text-sm text-gray-300 italic">{selectedPrompt.exampleEnding}</div>
                      </div>
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
                className="bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl p-8 text-white"
              >
                <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3">
                  <Award className="w-10 h-10" />
                  Story Complete! 🎉
                </h2>

                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">⏱️</div>
                    <div className="text-sm opacity-75 mb-1">Time</div>
                    <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">📝</div>
                    <div className="text-sm opacity-75 mb-1">Words</div>
                    <div className="text-2xl font-bold">{wordCount}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-sm opacity-75 mb-1">Speed</div>
                    <div className="text-2xl font-bold">{timeElapsed > 0 ? Math.round(wordCount / (timeElapsed / 60)) : 0}</div>
                    <div className="text-xs opacity-75">wpm</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-sm opacity-75 mb-1">Quality</div>
                    <div className="text-2xl font-bold">
                      {wordCount >= 300 ? "Great!" : wordCount >= 150 ? "Good!" : "Keep going!"}
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-4 mb-6 max-h-96 overflow-y-auto">
                  <h3 className="font-semibold mb-3">Your Story:</h3>
                  <div className="text-sm text-pink-100 whitespace-pre-wrap leading-relaxed">
                    {storyText}
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-2">💡 What You Just Did</h3>
                  <p className="text-sm text-pink-100">
                    You just practiced advanced fluency! Storytelling combines grammar, vocabulary, emotional expression, and natural flow. 
                    This is exactly how natives communicate. Every story you tell makes English more natural in your brain. 🔥
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={resetStory}
                    className="px-6 py-3 bg-white text-pink-600 hover:bg-gray-100 rounded-xl font-bold transition-all"
                  >
                    Tell Another Story
                  </button>
                  <button
                    onClick={() => {
                      setHasCompleted(false);
                      setTimeElapsed(0);
                      setStoryText("");
                      setIsActive(false);
                    }}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all"
                  >
                    Rewrite This Story
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
