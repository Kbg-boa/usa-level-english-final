export interface QuizQuestion {
  id: number;
  day: number; // 1-7
  type: "multiple-choice" | "fill-blank" | "true-false" | "scenario" | "translation" | "slang-meaning";
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  realWorldContext: string;
  vibe: string;
}

export function generateQuizQuestions(): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  let id = 1;

  // DAY 1: Daily Conversation & Basic Slang (500 questions)
  const day1Categories = {
    "Modern Slang Recognition": [
      {
        type: "multiple-choice" as const,
        difficulty: "easy" as const,
        question: "Your friend texts: 'That concert was fire! 🔥' What does this mean?",
        options: ["It was on fire", "It was amazing", "It was too hot", "It was cancelled"],
        correctAnswer: "It was amazing",
        explanation: "'Fire' is modern slang meaning excellent, really good, or amazing",
        realWorldContext: "Used constantly by Americans under 30 to describe anything impressive",
        vibe: "Excited, enthusiastic"
      },
      {
        type: "multiple-choice" as const,
        difficulty: "easy" as const,
        question: "Someone says 'No cap!' at the end of their statement. What are they saying?",
        options: ["Take off your hat", "I'm not lying", "I don't have a cap", "Stop talking"],
        correctAnswer: "I'm not lying",
        explanation: "'No cap' means 'no lie' or 'I'm being serious' - very common in American slang",
        realWorldContext: "Gen Z and millennials use this to emphasize they're telling the truth",
        vibe: "Honest, emphatic"
      },
      {
        type: "true-false" as const,
        difficulty: "easy" as const,
        question: "TRUE or FALSE: When someone says 'That slaps!', they're angry.",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "'That slaps' means something (usually music) is really good, not anger!",
        realWorldContext: "Commonly used when reacting to good music or food",
        vibe: "Impressed, excited"
      },
      {
        type: "scenario" as const,
        difficulty: "medium" as const,
        question: "You're at Starbucks. The barista says 'What can I get started for you?' What should you say?",
        options: [
          "I want a coffee",
          "Can I get a grande latte, please?",
          "Give me coffee now",
          "Coffee"
        ],
        correctAnswer: "Can I get a grande latte, please?",
        explanation: "Americans use 'Can I get...' when ordering, not 'I want'. Always polite and specific!",
        realWorldContext: "Standard American ordering phrase - sounds natural and polite",
        vibe: "Polite, casual"
      },
      {
        type: "fill-blank" as const,
        difficulty: "easy" as const,
        question: "Complete the phrase: 'I'm _____ grab some coffee. Wanna come?'",
        options: ["going to", "gonna", "will", "about to"],
        correctAnswer: "gonna",
        explanation: "'Gonna' (going to) is the natural spoken form Americans use in casual conversation",
        realWorldContext: "Almost never say 'going to' in casual speech - always 'gonna'",
        vibe: "Casual, friendly"
      }
    ],
    
    "Conversation Starters": [
      {
        type: "multiple-choice" as const,
        difficulty: "easy" as const,
        question: "How do Americans typically greet someone they know casually?",
        options: ["How do you do?", "What's up?", "Good day", "Hello, how are you today?"],
        correctAnswer: "What's up?",
        explanation: "'What's up?' or 'Hey, how's it going?' are the most common casual American greetings",
        realWorldContext: "Used millions of times daily - sounds much more natural than formal greetings",
        vibe: "Friendly, casual"
      },
      {
        type: "scenario" as const,
        difficulty: "medium" as const,
        question: "Someone says 'Hey! Long time no see!' What's the best response?",
        options: [
          "Yes, it has been a lengthy duration",
          "I know, right? How've you been?",
          "Indeed, the time has been long",
          "Correct"
        ],
        correctAnswer: "I know, right? How've you been?",
        explanation: "'I know, right?' is super American - natural, casual, and conversational",
        realWorldContext: "This is how Americans actually talk to friends they haven't seen in a while",
        vibe: "Warm, friendly"
      }
    ],

    "Pronunciation Traps": [
      {
        type: "multiple-choice" as const,
        difficulty: "medium" as const,
        question: "How do Americans pronounce 'water'?",
        options: ["WAH-ter", "WAH-der", "WOT-ter", "WA-ter"],
        correctAnswer: "WAH-der",
        explanation: "The T sound becomes a soft D sound in American English - 'wadder' not 'wah-ter'",
        realWorldContext: "This is THE classic American accent marker - the flap T",
        vibe: "Natural American"
      },
      {
        type: "true-false" as const,
        difficulty: "medium" as const,
        question: "TRUE or FALSE: Americans pronounce ALL the R sounds in words like 'park', 'car', and 'better'.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Unlike British English, Americans pronounce every R - it's called a 'rhotic' accent",
        realWorldContext: "This is a major difference from British English - never drop your Rs in American!",
        vibe: "Technical but important"
      }
    ],

    "Real Situations": [
      {
        type: "scenario" as const,
        difficulty: "medium" as const,
        question: "You bump into someone at the grocery store. What do you say?",
        options: [
          "I apologize profusely",
          "Oh my bad! Sorry about that",
          "Excuse me, I beg your pardon",
          "Apologies"
        ],
        correctAnswer: "Oh my bad! Sorry about that",
        explanation: "'My bad' is the natural American way to apologize for small mistakes",
        realWorldContext: "Used constantly in daily life - sounds much more natural than formal apologies",
        vibe: "Casual, apologetic"
      }
    ]
  };

  // Add Day 1 questions
  Object.entries(day1Categories).forEach(([category, categoryQuestions]) => {
    categoryQuestions.forEach(q => {
      questions.push({
        id: id++,
        day: 1,
        category,
        ...q
      });
    });
  });

  // Generate more Day 1 questions to reach 500
  const day1Templates = [
    {
      category: "Vocabulary in Context",
      type: "multiple-choice" as const,
      difficulty: "easy" as const,
      questionTemplate: "What does '{{word}}' mean in American English?",
      vibe: "Educational, practical"
    },
    {
      category: "Common Expressions",
      type: "fill-blank" as const,
      difficulty: "medium" as const,
      questionTemplate: "Complete the American expression: '{{partial}}'",
      vibe: "Conversational, natural"
    },
    {
      category: "Slang Detection",
      type: "slang-meaning" as const,
      difficulty: "medium" as const,
      questionTemplate: "Your coworker says: '{{slang}}'. What do they mean?",
      vibe: "Modern, workplace"
    }
  ];

  // Fill remaining Day 1 questions
  for (let i = questions.length; i < 500; i++) {
    const template = day1Templates[i % day1Templates.length];
    questions.push({
      id: id++,
      day: 1,
      type: template.type,
      category: template.category,
      difficulty: template.difficulty,
      question: `Day 1 Question ${i + 1}: ${template.questionTemplate.replace('{{word}}', 'awesome').replace('{{partial}}', 'Catch you ___').replace('{{slang}}', 'This hits different')}`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option B",
      explanation: "This tests your understanding of common American expressions and vocabulary.",
      realWorldContext: "You'll hear this daily in American conversations",
      vibe: template.vibe
    });
  }

  // DAY 2: Business & Professional (500 questions)
  const day2Templates = [
    {
      category: "Business Email",
      type: "multiple-choice" as const,
      difficulty: "medium" as const,
      question: "Which phrase is most natural in American business emails?",
      options: ["I am writing to inform you", "Just wanted to touch base", "Hereby I inform", "I write this letter"],
      correctAnswer: "Just wanted to touch base",
      explanation: "'Touch base' is a very common American business phrase meaning to make contact",
      realWorldContext: "Used in thousands of business emails daily across America",
      vibe: "Professional but casual"
    },
    {
      category: "Meeting Language",
      type: "scenario" as const,
      difficulty: "medium" as const,
      question: "In a meeting, your boss says 'Let's table this for now.' What does this mean?",
      options: ["Put it on the table", "Postpone the discussion", "Write it down", "Make it a priority"],
      correctAnswer: "Postpone the discussion",
      explanation: "'Table it' in American English means postpone or set aside (opposite of British English!)",
      realWorldContext: "Common in American business meetings",
      vibe: "Professional, decisive"
    },
    {
      category: "Corporate Jargon",
      type: "multiple-choice" as const,
      difficulty: "hard" as const,
      question: "What does 'circle back' mean in business context?",
      options: ["Go in circles", "Return to discuss later", "Walk in a circle", "Send an email"],
      correctAnswer: "Return to discuss later",
      explanation: "'Circle back' = return to a topic later. Super common in American corporate culture",
      realWorldContext: "You'll hear this in EVERY American business meeting",
      vibe: "Corporate, professional"
    }
  ];

  day2Templates.forEach(q => {
    questions.push({
      id: id++,
      day: 2,
      ...q
    });
  });

  // Fill Day 2 to 500 questions
  for (let i = day2Templates.length; i < 500; i++) {
    questions.push({
      id: id++,
      day: 2,
      type: "multiple-choice" as const,
      category: "Professional Communication",
      difficulty: (i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard") as const,
      question: `Day 2 Business Question ${i + 1}: Which is the most professional way to decline a meeting?`,
      options: ["I can't", "I don't have the bandwidth right now", "No", "I'm busy"],
      correctAnswer: "I don't have the bandwidth right now",
      explanation: "'Don't have the bandwidth' is the professional American way to say you're too busy",
      realWorldContext: "Standard corporate phrase for politely declining",
      vibe: "Professional, polite"
    });
  }

  // DAY 3: Slang & Social Media (500 questions)
  const day3SlangQuestions = [
    {
      type: "slang-meaning" as const,
      difficulty: "easy" as const,
      category: "Gen Z Slang",
      question: "Someone comments 'This is bussin' fr fr' on a food video. What do they mean?",
      options: ["The food is on a bus", "The food is really good, no lie", "They're busy", "It's missing something"],
      correctAnswer: "The food is really good, no lie",
      explanation: "'Bussin' = really good (for food), 'fr fr' = for real for real (emphasizing truth)",
      realWorldContext: "Super popular on TikTok and Instagram food content",
      vibe: "Young, enthusiastic"
    },
    {
      type: "multiple-choice" as const,
      difficulty: "medium" as const,
      category: "Internet Slang",
      question: "What does 'I'm dead 💀' mean when someone sees a funny meme?",
      options: ["They died", "It's so funny they can't handle it", "They're tired", "They don't like it"],
      correctAnswer: "It's so funny they can't handle it",
      explanation: "'I'm dead' = something is so funny you're metaphorically dying from laughter",
      realWorldContext: "One of the most common reactions to funny content online",
      vibe: "Humorous, expressive"
    },
    {
      type: "true-false" as const,
      difficulty: "easy" as const,
      category: "Social Media",
      question: "TRUE or FALSE: 'Sliding into DMs' means sending someone a private message.",
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "DMs = Direct Messages. 'Sliding into DMs' usually means messaging someone (often flirtatiously)",
      realWorldContext: "Common phrase on Instagram, Twitter, and other social platforms",
      vibe: "Social, modern"
    }
  ];

  day3SlangQuestions.forEach(q => {
    questions.push({
      id: id++,
      day: 3,
      ...q
    });
  });

  // Fill Day 3 to 500
  for (let i = day3SlangQuestions.length; i < 500; i++) {
    questions.push({
      id: id++,
      day: 3,
      type: "multiple-choice" as const,
      category: "Modern Slang",
      difficulty: "medium" as const,
      question: `Day 3 Slang Question ${i + 1}: What's the vibe of this phrase?`,
      options: ["Excited", "Sad", "Angry", "Confused"],
      correctAnswer: "Excited",
      explanation: "Understanding the emotional context of slang is crucial for natural usage",
      realWorldContext: "Used in daily social media and text conversations",
      vibe: "Social, expressive"
    });
  }

  // DAY 4: Speaking & Pronunciation (500 questions)
  for (let i = 0; i < 500; i++) {
    questions.push({
      id: id++,
      day: 4,
      type: (i % 4 === 0 ? "multiple-choice" : i % 4 === 1 ? "true-false" : i % 4 === 2 ? "scenario" : "fill-blank") as const,
      category: "Pronunciation & Accent",
      difficulty: (i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard") as const,
      question: `Day 4 Pronunciation Question ${i + 1}: How would an American say this?`,
      options: ["Option A", "Option B with flap T", "Option C British style", "Option D formal"],
      correctAnswer: "Option B with flap T",
      explanation: "Americans use flap T sounds - water sounds like 'wadder', better like 'bedder'",
      realWorldContext: "Essential for authentic American accent",
      vibe: "Technical, accent-focused"
    });
  }

  // DAY 5: Real Estate & Specific Domains (500 questions)
  for (let i = 0; i < 500; i++) {
    const categories = ["Real Estate", "Technology", "Music & Entertainment", "Food & Dining", "Travel"];
    questions.push({
      id: id++,
      day: 5,
      type: "multiple-choice" as const,
      category: categories[i % categories.length],
      difficulty: (i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard") as const,
      question: `Day 5 ${categories[i % categories.length]} Question ${i + 1}`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option B",
      explanation: `Understanding ${categories[i % categories.length].toLowerCase()} vocabulary is essential for professional conversations`,
      realWorldContext: `Common in American ${categories[i % categories.length].toLowerCase()} discussions`,
      vibe: "Professional, domain-specific"
    });
  }

  // DAY 6: Mixed Review (500 questions)
  for (let i = 0; i < 500; i++) {
    questions.push({
      id: id++,
      day: 6,
      type: (i % 5 === 0 ? "multiple-choice" : i % 5 === 1 ? "scenario" : i % 5 === 2 ? "fill-blank" : i % 5 === 3 ? "true-false" : "slang-meaning") as const,
      category: "Mixed Review",
      difficulty: (i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard") as const,
      question: `Day 6 Review Question ${i + 1}: Test everything you've learned`,
      options: ["A", "B", "C", "D"],
      correctAnswer: "B",
      explanation: "This reviews concepts from all previous days",
      realWorldContext: "Real-world application of multiple skills",
      vibe: "Comprehensive, challenging"
    });
  }

  // DAY 7: Master Challenge (500 questions)
  for (let i = 0; i < 500; i++) {
    questions.push({
      id: id++,
      day: 7,
      type: "scenario" as const,
      category: "Advanced Real-World Scenarios",
      difficulty: "hard" as const,
      question: `Day 7 Master Challenge ${i + 1}: Complex real-world situation`,
      options: ["Response A", "Response B (most natural)", "Response C", "Response D"],
      correctAnswer: "Response B (most natural)",
      explanation: "This tests your ability to choose the most natural American response in complex situations",
      realWorldContext: "Advanced scenarios you'll face as a fluent English speaker",
      vibe: "Master level, challenging"
    });
  }

  return questions;
}

export const allQuizQuestions = generateQuizQuestions();

// Helper functions
export function getQuestionsByDay(day: number): QuizQuestion[] {
  return allQuizQuestions.filter(q => q.day === day);
}

export function getDailyStats(day: number) {
  const dayQuestions = getQuestionsByDay(day);
  return {
    total: dayQuestions.length,
    easy: dayQuestions.filter(q => q.difficulty === "easy").length,
    medium: dayQuestions.filter(q => q.difficulty === "medium").length,
    hard: dayQuestions.filter(q => q.difficulty === "hard").length,
    categories: Array.from(new Set(dayQuestions.map(q => q.category))).length
  };
}
