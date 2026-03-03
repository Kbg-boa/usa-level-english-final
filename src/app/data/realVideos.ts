// 🔥 REAL YOUTUBE VIDEOS for Native Exposure Lab
// Authentic content from top American creators

export interface SmartPhrase {
  id: string;
  phrase: string;
  timestamp: number;
  category: "high-frequency" | "filler" | "phrasal-verb" | "slang" | "intonation";
  context: string;
  saved: boolean;
  activationContexts?: {
    casual?: string;
    business?: string;
    personal?: string;
  };
}

export interface AccentChallenge {
  sentence: string;
  timestamp: number;
  focusPoints: string[];
}

export interface CulturalInsight {
  creator: string;
  style: string;
  characteristics: string[];
  level: string;
  rhythmType: "relaxed" | "fast" | "monotone" | "energetic";
}

export interface TranscriptLine {
  id: string;
  timestamp: number;
  text: string;
  speaker?: string;
}

export interface ListeningTest {
  startTime: number;
  endTime: number;
  question: string;
  correctAnswer: string;
}

export interface PreVideoMission {
  focus: string[];
  targetCount: number;
  type: "contractions" | "fillers" | "phrasal-verbs" | "intonation" | "slang";
}

export type VideoCategory = "vlogs" | "news" | "podcasts" | "food" | "business" | "tech";

export interface YouTubeVideo {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  description: string;
  category: VideoCategory;
  level: "beginner" | "intermediate" | "advanced";
  duration: string;
  thumbnail: string;
  preVideoMission: PreVideoMission;
  smartPhrases: SmartPhrase[];
  accentChallenges: AccentChallenge[];
  culturalInsight: CulturalInsight;
  transcript: TranscriptLine[];
  quizPrompts: string[];
  listeningTests: ListeningTest[];
}

export const REAL_YOUTUBE_VIDEOS: YouTubeVideo[] = [
  // 1. CASEY NEISTAT - NYC Vlog Energy
  {
    id: "v1",
    videoId: "ag3RnEaB3zM",
    title: "Casey Neistat - NYC Daily Vlog",
    channel: "Casey Neistat",
    description: "Fast-paced NYC energy, authentic storytelling, natural American speech",
    category: "vlogs",
    level: "intermediate",
    duration: "10:23",
    thumbnail: "https://img.youtube.com/vi/ag3RnEaB3zM/maxresdefault.jpg",
    preVideoMission: {
      focus: [
        "Notice fast NYC speaking rhythm and energy",
        "Listen for casual contractions and linking",
        "Catch storytelling phrases and transitions"
      ],
      targetCount: 3,
      type: "contractions"
    },
    smartPhrases: [
      {
        id: "p1",
        phrase: "the thing is",
        timestamp: 45,
        category: "high-frequency",
        context: "Introducing a main point in storytelling",
        saved: false,
        activationContexts: {
          casual: "The thing is, I really love living in New York.",
          business: "The thing is, we need to prioritize user experience.",
          personal: "The thing is, I'm not ready to commit yet."
        }
      },
      {
        id: "p2",
        phrase: "you know what I mean",
        timestamp: 178,
        category: "filler",
        context: "Seeking connection and agreement",
        saved: false,
        activationContexts: {
          casual: "It's just so overwhelming sometimes, you know what I mean?",
          business: "We need faster results, you know what I mean?",
          personal: "I need some space to think, you know what I mean?"
        }
      }
    ],
    accentChallenges: [
      {
        sentence: "So here's what happened today in New York City",
        timestamp: 12,
        focusPoints: ["fast NYC rhythm", "natural intonation", "connected speech"]
      }
    ],
    culturalInsight: {
      creator: "Casey Neistat (NYC Filmmaker)",
      style: "Fast NYC Vlogger",
      characteristics: [
        "Very fast, energetic speaking pace",
        "NYC accent and rhythm",
        "Natural storytelling flow",
        "Casual but articulate"
      ],
      level: "Perfect for: Intermediate+",
      rhythmType: "fast"
    },
    transcript: [
      { id: "t1", timestamp: 0, text: "Good morning! So here's what happened today." },
      { id: "t2", timestamp: 5, text: "I woke up in New York City, and the thing is..." }
    ],
    quizPrompts: [
      "Use 'the thing is' to explain something important",
      "Describe Casey's speaking style and energy level"
    ],
    listeningTests: [
      {
        startTime: 0,
        endTime: 15,
        question: "What is Casey's main topic in this vlog?",
        correctAnswer: "His daily life and experiences in NYC"
      }
    ]
  },

  // 2. EMMA CHAMBERLAIN - Gen-Z Casual
  {
    id: "v2",
    videoId: "Mgfe5tIwOj0",
    title: "Emma Chamberlain - Coffee & Life Updates",
    channel: "Emma Chamberlain",
    description: "Gen-Z casual speech, modern slang, relatable millennial/Gen-Z vibes",
    category: "vlogs",
    level: "advanced",
    duration: "15:42",
    thumbnail: "https://img.youtube.com/vi/Mgfe5tIwOj0/maxresdefault.jpg",
    preVideoMission: {
      focus: [
        "Notice Gen-Z slang and filler words",
        "Listen for valley girl intonation patterns",
        "Catch modern American expressions"
      ],
      targetCount: 3,
      type: "slang"
    },
    smartPhrases: [
      {
        id: "p3",
        phrase: "literally",
        timestamp: 89,
        category: "slang",
        context: "Gen-Z emphasis word (often exaggerated)",
        saved: false,
        activationContexts: {
          casual: "I literally died laughing at that meme.",
          business: "We literally need to ship this feature today.",
          personal: "I'm literally so tired right now."
        }
      },
      {
        id: "p4",
        phrase: "I don't know",
        timestamp: 234,
        category: "filler",
        context: "Casual filler showing uncertainty or relatability",
        saved: false,
        activationContexts: {
          casual: "I don't know, maybe we should just stay home?",
          business: "I don't know, that strategy seems risky.",
          personal: "I don't know how I feel about this yet."
        }
      }
    ],
    accentChallenges: [
      {
        sentence: "Like, literally, I don't even know what to say",
        timestamp: 89,
        focusPoints: ["Gen-Z valley intonation", "filler words", "casual rhythm"]
      }
    ],
    culturalInsight: {
      creator: "Emma Chamberlain (Gen-Z Icon)",
      style: "Gen-Z Casual Vlogger",
      characteristics: [
        "Lots of 'like', 'literally', 'I don't know'",
        "Valley girl intonation",
        "Very relatable, authentic Gen-Z speech",
        "Fast but natural pace"
      ],
      level: "For: Advanced (Gen-Z slang heavy)",
      rhythmType: "energetic"
    },
    transcript: [
      { id: "t1", timestamp: 0, text: "Hi guys! So, like, literally..." },
      { id: "t2", timestamp: 5, text: "I don't even know where to start today." }
    ],
    quizPrompts: [
      "How does Gen-Z use 'literally' differently?",
      "What filler words does Emma use most often?"
    ],
    listeningTests: [
      {
        startTime: 0,
        endTime: 20,
        question: "What is Emma's speaking style?",
        correctAnswer: "Casual, Gen-Z, lots of filler words"
      }
    ]
  },

  // 3. MKBHD - Professional Tech English
  {
    id: "v3",
    videoId: "XV8RDCT2tYI",
    title: "MKBHD - iPhone 15 Pro Max Review",
    channel: "Marques Brownlee",
    description: "Crystal-clear professional tech English, perfect articulation, easy to follow",
    category: "tech",
    level: "beginner",
    duration: "13:28",
    thumbnail: "https://img.youtube.com/vi/XV8RDCT2tYI/maxresdefault.jpg",
    preVideoMission: {
      focus: [
        "Notice clear, professional articulation",
        "Listen for tech vocabulary in context",
        "Catch opinion phrases (I think, In my opinion)"
      ],
      targetCount: 3,
      type: "intonation"
    },
    smartPhrases: [
      {
        id: "p5",
        phrase: "turns out",
        timestamp: 156,
        category: "high-frequency",
        context: "Revealing discovered or surprising information",
        saved: false,
        activationContexts: {
          casual: "Turns out, the restaurant was closed on Mondays.",
          business: "Turns out, our users prefer the old interface.",
          personal: "Turns out, I actually enjoy running in the morning."
        }
      },
      {
        id: "p6",
        phrase: "at the end of the day",
        timestamp: 567,
        category: "high-frequency",
        context: "Ultimately, when everything is considered",
        saved: false,
        activationContexts: {
          casual: "At the end of the day, just do what makes you happy.",
          business: "At the end of the day, revenue is what matters most.",
          personal: "At the end of the day, family comes first."
        }
      }
    ],
    accentChallenges: [
      {
        sentence: "This is probably the best smartphone I've tested this year",
        timestamp: 234,
        focusPoints: ["clear enunciation", "professional pace", "emphatic stress"]
      }
    ],
    culturalInsight: {
      creator: "MKBHD (Marques Brownlee)",
      style: "Professional Tech Reviewer",
      characteristics: [
        "Extremely clear, slow-paced speech",
        "Professional but accessible tone",
        "Minimal slang, perfect for learners",
        "Standard American English"
      ],
      level: "Perfect for: All levels (especially beginners)",
      rhythmType: "monotone"
    },
    transcript: [
      { id: "t1", timestamp: 0, text: "What's up guys, MKBHD here." },
      { id: "t2", timestamp: 3, text: "So I've been testing the new iPhone for the past week." }
    ],
    quizPrompts: [
      "Use 'turns out' to share a discovery",
      "What makes MKBHD's speaking style good for learners?"
    ],
    listeningTests: [
      {
        startTime: 0,
        endTime: 15,
        question: "What product is MKBHD reviewing?",
        correctAnswer: "iPhone 15 Pro Max"
      }
    ]
  },

  // 4. JOE ROGAN - Conversational Podcast
  {
    id: "v4",
    videoId: "gk4tEo4jDuw",
    title: "Joe Rogan Experience - Conversation Clips",
    channel: "PowerfulJRE",
    description: "Natural conversational American English, varied vocabulary, real-world dialogue",
    category: "podcasts",
    level: "advanced",
    duration: "18:35",
    thumbnail: "https://img.youtube.com/vi/gk4tEo4jDuw/maxresdefault.jpg",
    preVideoMission: {
      focus: [
        "Listen for natural conversation flow and interruptions",
        "Notice fillers (you know, like, I mean)",
        "Catch debate and discussion patterns"
      ],
      targetCount: 3,
      type: "slang"
    },
    smartPhrases: [
      {
        id: "p7",
        phrase: "that's wild",
        timestamp: 234,
        category: "slang",
        context: "Expressing amazement or surprise (casual)",
        saved: false,
        activationContexts: {
          casual: "Dude, that's wild! I can't believe that happened.",
          business: "That's wild how much the market shifted overnight.",
          personal: "That's wild that you ran into your ex there."
        }
      },
      {
        id: "p8",
        phrase: "for sure",
        timestamp: 456,
        category: "high-frequency",
        context: "Definitely, absolutely (casual agreement)",
        saved: false,
        activationContexts: {
          casual: "Are you coming tonight? - For sure!",
          business: "Can we meet the deadline? - For sure.",
          personal: "You should try that restaurant. - For sure, I will."
        }
      }
    ],
    accentChallenges: [
      {
        sentence: "That's wild, man. For sure, I totally get what you're saying.",
        timestamp: 234,
        focusPoints: ["conversational rhythm", "casual intonation", "natural linking"]
      }
    ],
    culturalInsight: {
      creator: "Joe Rogan (Podcast Host)",
      style: "Conversational Podcast",
      characteristics: [
        "Very natural, unscripted conversation",
        "Lots of fillers and pauses",
        "Casual American slang",
        "Fast-paced when excited"
      ],
      level: "For: Advanced learners",
      rhythmType: "energetic"
    },
    transcript: [
      { id: "t1", timestamp: 0, text: "So here's the thing, right?" },
      { id: "t2", timestamp: 3, text: "People don't really understand how this works." }
    ],
    quizPrompts: [
      "When do Americans say 'that's wild'?",
      "Use 'for sure' in three different contexts"
    ],
    listeningTests: [
      {
        startTime: 0,
        endTime: 20,
        question: "What is the conversation style?",
        correctAnswer: "Casual, natural, conversational"
      }
    ]
  },

  // 5. HOT ONES - Entertainment Food Show
  {
    id: "v5",
    videoId: "GY0GWjznBFI",
    title: "Hot Ones - Celebrity Interview (Spicy Wings)",
    channel: "First We Feast",
    description: "Entertaining interviews with authentic American reactions and expressions",
    category: "food",
    level: "intermediate",
    duration: "22:14",
    thumbnail: "https://img.youtube.com/vi/GY0GWjznBFI/maxresdefault.jpg",
    preVideoMission: {
      focus: [
        "Notice emotional reactions and exclamations",
        "Listen for food-related vocabulary",
        "Catch spontaneous American expressions"
      ],
      targetCount: 3,
      type: "slang"
    },
    smartPhrases: [
      {
        id: "p9",
        phrase: "oh my god",
        timestamp: 345,
        category: "slang",
        context: "Strong emotional reaction (surprise, shock, pain)",
        saved: false,
        activationContexts: {
          casual: "Oh my god, this pizza is incredible!",
          business: "Oh my god, we just got the biggest contract!",
          personal: "Oh my god, I can't believe you remembered my birthday!"
        }
      },
      {
        id: "p10",
        phrase: "no way",
        timestamp: 567,
        category: "slang",
        context: "Expressing disbelief or surprise",
        saved: false,
        activationContexts: {
          casual: "No way! You got tickets to that show?",
          business: "No way they approved the budget already!",
          personal: "No way you learned guitar in just 3 months!"
        }
      }
    ],
    accentChallenges: [
      {
        sentence: "Oh my god, that is so hot! No way I can handle this.",
        timestamp: 345,
        focusPoints: ["emotional intonation", "natural stress", "American vowels"]
      }
    ],
    culturalInsight: {
      creator: "Sean Evans (Hot Ones Host)",
      style: "Entertainment Interview",
      characteristics: [
        "Natural reactions and emotions",
        "Mix of formal questions and casual reactions",
        "Food vocabulary in context",
        "Genuine American expressions"
      ],
      level: "Great for: Intermediate learners",
      rhythmType: "energetic"
    },
    transcript: [
      { id: "t1", timestamp: 0, text: "Welcome to Hot Ones, the show with hot questions and even hotter wings." },
      { id: "t2", timestamp: 5, text: "Today we have an incredible guest." }
    ],
    quizPrompts: [
      "When do Americans say 'oh my god'?",
      "Use 'no way' to express surprise"
    ],
    listeningTests: [
      {
        startTime: 0,
        endTime: 20,
        question: "What is the show's concept?",
        correctAnswer: "Interview celebrities while eating spicy wings"
      }
    ]
  },

  // 6. GARYVEE - High-Energy Business
  {
    id: "v6",
    videoId: "pT3JYr0kJmw",
    title: "GaryVee - Motivation and Business Advice",
    channel: "GaryVee",
    description: "High-energy motivational business English, fast-paced NYC energy",
    category: "business",
    level: "advanced",
    duration: "9:47",
    thumbnail: "https://img.youtube.com/vi/pT3JYr0kJmw/maxresdefault.jpg",
    preVideoMission: {
      focus: [
        "Notice fast-paced motivational vocabulary",
        "Listen for business slang and directness",
        "Catch emphatic stress and passion"
      ],
      targetCount: 3,
      type: "slang"
    },
    smartPhrases: [
      {
        id: "p11",
        phrase: "look",
        timestamp: 23,
        category: "high-frequency",
        context: "Getting attention before making a strong point",
        saved: false,
        activationContexts: {
          casual: "Look, I don't have time for this drama.",
          business: "Look, we need to make a decision today.",
          personal: "Look, I care about you, but this isn't working."
        }
      },
      {
        id: "p12",
        phrase: "the reality is",
        timestamp: 145,
        category: "high-frequency",
        context: "Introducing the harsh truth or facts",
        saved: false,
        activationContexts: {
          casual: "The reality is, most people don't follow through.",
          business: "The reality is, we're behind our competitors.",
          personal: "The reality is, I need to focus on myself right now."
        }
      }
    ],
    accentChallenges: [
      {
        sentence: "Look, the reality is, you need to execute faster",
        timestamp: 145,
        focusPoints: ["emphatic stress", "fast NYC pace", "direct delivery"]
      }
    ],
    culturalInsight: {
      creator: "Gary Vaynerchuk (Entrepreneur)",
      style: "High-Energy Business Motivator",
      characteristics: [
        "Extremely fast, passionate speech",
        "Direct, no-nonsense NYC style",
        "Business slang and motivational language",
        "Heavy emphasis and emotion"
      ],
      level: "For: Advanced + Business English",
      rhythmType: "fast"
    },
    transcript: [
      { id: "t1", timestamp: 0, text: "Look, here's what I want to tell you..." },
      { id: "t2", timestamp: 4, text: "The reality is, most people aren't willing to work." }
    ],
    quizPrompts: [
      "Use 'look' to introduce a strong point",
      "What makes GaryVee's style unique?"
    ],
    listeningTests: [
      {
        startTime: 0,
        endTime: 15,
        question: "What is GaryVee's speaking style?",
        correctAnswer: "Fast, direct, passionate, motivational"
      }
    ]
  },

  // 7. MRBEAST - High-Energy Entertainment
  {
    id: "v7",
    videoId: "0e3GPea1Tyg",
    title: "MrBeast - $1 vs $500,000 Experiences!",
    channel: "MrBeast",
    description: "Fast-paced entertainment English, exciting reactions, modern youth speech",
    category: "vlogs",
    level: "intermediate",
    duration: "14:27",
    thumbnail: "https://img.youtube.com/vi/0e3GPea1Tyg/maxresdefault.jpg",
    preVideoMission: {
      focus: [
        "Notice high-energy reactions and excitement",
        "Listen for modern youth vocabulary",
        "Catch fast-paced narrative flow"
      ],
      targetCount: 3,
      type: "slang"
    },
    smartPhrases: [
      {
        id: "p13",
        phrase: "let's go",
        timestamp: 123,
        category: "slang",
        context: "Excitement, celebration, motivation (modern youth)",
        saved: false,
        activationContexts: {
          casual: "We got the tickets! Let's go!",
          business: "We closed the deal! Let's go!",
          personal: "I finally finished the project. Let's go!"
        }
      },
      {
        id: "p14",
        phrase: "insane",
        timestamp: 456,
        category: "slang",
        context: "Extremely impressive or crazy (positive or negative)",
        saved: false,
        activationContexts: {
          casual: "That concert was absolutely insane!",
          business: "The growth numbers are insane this quarter.",
          personal: "Your progress is insane, keep it up!"
        }
      }
    ],
    accentChallenges: [
      {
        sentence: "This is absolutely insane! Let's go!",
        timestamp: 456,
        focusPoints: ["enthusiastic delivery", "youth slang", "fast pace"]
      }
    ],
    culturalInsight: {
      creator: "MrBeast (YouTube Phenomenon)",
      style: "High-Energy Entertainment",
      characteristics: [
        "Very fast, exciting narration",
        "Modern youth slang",
        "Lots of reactions and emphasis",
        "Perfect for understanding YouTube culture"
      ],
      level: "For: Intermediate (youth-focused)",
      rhythmType: "fast"
    },
    transcript: [
      { id: "t1", timestamp: 0, text: "Today we're comparing $1 experiences to $500,000 experiences!" },
      { id: "t2", timestamp: 4, text: "This is going to be absolutely insane!" }
    ],
    quizPrompts: [
      "When do young Americans say 'let's go'?",
      "What does 'insane' mean in modern slang?"
    ],
    listeningTests: [
      {
        startTime: 0,
        endTime: 20,
        question: "What is MrBeast's content style?",
        correctAnswer: "High-energy challenges and comparisons"
      }
    ]
  },

  // 8. CNN 10 - Clear Standard News English
  {
    id: "v8",
    videoId: "btViHJHv7E0",
    title: "CNN 10 - Student News Explained",
    channel: "CNN 10",
    description: "Clear standard American English for students, perfect for learning formal speech",
    category: "news",
    level: "beginner",
    duration: "10:00",
    thumbnail: "https://img.youtube.com/vi/btViHJHv7E0/maxresdefault.jpg",
    preVideoMission: {
      focus: [
        "Notice clear, standard pronunciation",
        "Listen for formal news vocabulary",
        "Catch journalistic phrases and structure"
      ],
      targetCount: 3,
      type: "intonation"
    },
    smartPhrases: [
      {
        id: "p15",
        phrase: "according to",
        timestamp: 67,
        category: "high-frequency",
        context: "Citing a source or authority",
        saved: false,
        activationContexts: {
          casual: "According to my friend, that restaurant is great.",
          business: "According to our analytics, users prefer mobile.",
          personal: "According to the weather forecast, it'll rain tomorrow."
        }
      }
    ],
    accentChallenges: [
      {
        sentence: "According to officials, the situation is improving",
        timestamp: 67,
        focusPoints: ["formal pronunciation", "news broadcaster rhythm", "clear articulation"]
      }
    ],
    culturalInsight: {
      creator: "CNN 10 (Carl Azuz)",
      style: "Student News Broadcast",
      characteristics: [
        "Very clear, deliberate speech",
        "Standard American English",
        "Educational and accessible",
        "Perfect for formal English practice"
      ],
      level: "Perfect for: Beginners",
      rhythmType: "monotone"
    },
    transcript: [
      { id: "t1", timestamp: 0, text: "This is CNN 10, bringing you the news in 10 minutes." },
      { id: "t2", timestamp: 4, text: "I'm Carl Azuz, let's start with today's top story." }
    ],
    quizPrompts: [
      "Use 'according to' to cite information",
      "How is news English different from casual English?"
    ],
    listeningTests: [
      {
        startTime: 0,
        endTime: 15,
        question: "What is CNN 10's format?",
        correctAnswer: "10-minute news summary for students"
      }
    ]
  }
];
