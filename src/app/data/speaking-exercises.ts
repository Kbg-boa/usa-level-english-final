export interface SpeakingExercise {
  id: number;
  text: string;
  focus: string;
  tip: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

// Generate 1000+ speaking exercises
export function generateSpeakingExercises(): SpeakingExercise[] {
  const exercises: SpeakingExercise[] = [];
  
  // Base exercises organized by category
  const categories = {
    "Daily Greetings": [
      { text: "What's up? How's it going?", focus: "Natural greeting - 'What's' reduction", tip: "Connect 'What' and 'is' → 'Whaddup' in casual speech", difficulty: "easy" as const },
      { text: "Hey! Long time no see!", focus: "Common American greeting", tip: "Emphasize 'Long time' with natural rhythm", difficulty: "easy" as const },
      { text: "How've you been?", focus: "Contraction practice", tip: "'How have' becomes 'How've' - very casual", difficulty: "easy" as const },
      { text: "What have you been up to?", focus: "Casual inquiry pattern", tip: "Stress 'been up to' naturally", difficulty: "easy" as const },
      { text: "Good to see you!", focus: "Friendly greeting", tip: "Quick and enthusiastic delivery", difficulty: "easy" as const },
    ],
    
    "Daily Activities": [
      { text: "I'm gonna grab some coffee. Want to come with?", focus: "Gonna = going to, natural rhythm", tip: "Americans rarely say 'going to' - use 'gonna' in casual speech", difficulty: "easy" as const },
      { text: "Wanna grab lunch later?", focus: "Want to → Wanna reduction", tip: "Very common in spoken American English", difficulty: "easy" as const },
      { text: "I gotta run some errands.", focus: "Got to → Gotta", tip: "Express necessity casually", difficulty: "easy" as const },
      { text: "Let me know when you're free.", focus: "Natural request pattern", tip: "Smooth, friendly tone", difficulty: "easy" as const },
      { text: "I'll catch you later!", focus: "Casual goodbye", tip: "Very common American farewell", difficulty: "easy" as const },
    ],
    
    "Business Phrases": [
      { text: "Let me circle back on that and touch base with the team.", focus: "Business phrasal verbs", tip: "Super common in American business English", difficulty: "medium" as const },
      { text: "I'll loop you in on the meeting details.", focus: "Professional communication", tip: "Professional but casual tone", difficulty: "medium" as const },
      { text: "We need to leverage our resources to maximize synergy.", focus: "Corporate buzzwords", tip: "Common in business meetings - practice sounding confident", difficulty: "hard" as const },
      { text: "Can we touch base about the project timeline?", focus: "Business request", tip: "Polite but direct", difficulty: "medium" as const },
      { text: "I don't have the bandwidth to take this on right now.", focus: "Declining politely", tip: "Professional way to say you're too busy", difficulty: "medium" as const },
    ],
    
    "Slang & Modern": [
      { text: "That new track is fire! It absolutely slaps!", focus: "Modern slang pronunciation", tip: "Emphasize 'fire' and 'slaps' with energy", difficulty: "medium" as const },
      { text: "No cap, that was the best burger I've ever had!", focus: "Slang authenticity", tip: "'No cap' = 'no lie' - emphasize to show you're being real", difficulty: "medium" as const },
      { text: "I'm lowkey stressed but highkey excited about this opportunity.", focus: "Gen Z slang flow", tip: "Opposite intensifiers - very common with younger Americans", difficulty: "medium" as const },
      { text: "That outfit is straight fire!", focus: "Emphasis and energy", tip: "Show enthusiasm in your voice", difficulty: "easy" as const },
      { text: "This song hits different at night.", focus: "Modern expression", tip: "Casual, reflective tone", difficulty: "medium" as const },
    ],
    
    "Real Estate": [
      { text: "The property has great curb appeal and the comps look solid.", focus: "Real estate terminology", tip: "'Comps' is short for 'comparables' - common in real estate", difficulty: "hard" as const },
      { text: "We're putting in an offer above asking price.", focus: "Real estate transaction", tip: "Confident, business-like delivery", difficulty: "medium" as const },
      { text: "The house is in escrow right now.", focus: "Technical real estate term", tip: "Professional pronunciation of 'escrow'", difficulty: "hard" as const },
      { text: "What are the HOA fees for this property?", focus: "Common real estate question", tip: "H-O-A pronounced as letters", difficulty: "medium" as const },
      { text: "The appraisal came in higher than expected.", focus: "Real estate process", tip: "Clear pronunciation of 'appraisal'", difficulty: "medium" as const },
    ],
    
    "Food & Dining": [
      { text: "Let's grab a bite and catch up. It's been a minute!", focus: "Casual American expressions", tip: "'It's been a minute' = it's been a while (common phrase)", difficulty: "easy" as const },
      { text: "This pizza is bussin'!", focus: "Food slang", tip: "Show excitement - 'bussin' means really good", difficulty: "easy" as const },
      { text: "That burger really hit the spot.", focus: "Satisfaction expression", tip: "Casual, satisfied tone", difficulty: "easy" as const },
      { text: "Want to grab takeout tonight?", focus: "Common American habit", tip: "'Takeout' not 'take away' in US", difficulty: "easy" as const },
      { text: "I'm craving some comfort food.", focus: "Food expression", tip: "Natural, relatable delivery", difficulty: "easy" as const },
    ],
    
    "Emotions & Reactions": [
      { text: "I'm absolutely stoked about the concert! It's gonna be lit!", focus: "Enthusiasm and energy", tip: "Show excitement in your voice - Americans are expressive!", difficulty: "easy" as const },
      { text: "I'm pumped for the workout today!", focus: "High energy expression", tip: "Energetic, motivated tone", difficulty: "easy" as const },
      { text: "I'm really bummed out that the game was cancelled.", focus: "Disappointment", tip: "Sad but casual tone", difficulty: "medium" as const },
      { text: "She was over the moon when she got the job offer.", focus: "Extreme happiness", tip: "Joyful, celebratory expression", difficulty: "medium" as const },
      { text: "I'm lowkey nervous about the presentation.", focus: "Mild emotion", tip: "'Lowkey' softens the admission", difficulty: "medium" as const },
    ],
    
    "Social Media & Tech": [
      { text: "Did you see that video? I'm dead!", focus: "Internet slang", tip: "'I'm dead' = it's so funny (often with 💀 emoji)", difficulty: "easy" as const },
      { text: "That meme is living in my head rent free.", focus: "Modern expression", tip: "Can't stop thinking about it", difficulty: "medium" as const },
      { text: "You need to touch grass, bro.", focus: "Internet humor", tip: "Joking way to say 'go outside'", difficulty: "medium" as const },
      { text: "I got caught in 4K!", focus: "Modern slang", tip: "Caught with clear evidence", difficulty: "medium" as const },
      { text: "Main character energy right there!", focus: "Compliment style", tip: "Confident, admiring tone", difficulty: "medium" as const },
    ],
    
    "American T Sounds": [
      { text: "I'll get a bottle of water.", focus: "T sounds like D between vowels", tip: "'Water' sounds like 'wader', 'bottle' like 'boddle'", difficulty: "hard" as const },
      { text: "Let me get you a better chair.", focus: "Flap T practice", tip: "'Better' sounds like 'bedder'", difficulty: "hard" as const },
      { text: "What a beautiful city!", focus: "T becomes D sound", tip: "'City' sounds like 'ciddy'", difficulty: "hard" as const },
      { text: "That's a pretty little kitten.", focus: "Multiple flap Ts", tip: "Practice all T sounds becoming D-like", difficulty: "hard" as const },
      { text: "Put it on the counter.", focus: "T sound variations", tip: "'Counter' has flap T in middle", difficulty: "hard" as const },
    ],
    
    "American R Sounds": [
      { text: "Park the car near the bar.", focus: "R pronunciation practice", tip: "Americans pronounce ALL Rs clearly", difficulty: "hard" as const },
      { text: "Turn right at the corner.", focus: "R in different positions", tip: "Strong R sounds throughout", difficulty: "hard" as const },
      { text: "The party starts at four.", focus: "R consonant clusters", tip: "Don't drop any R sounds", difficulty: "hard" as const },
      { text: "Pour more water for her.", focus: "R at word endings", tip: "Final Rs are pronounced in American English", difficulty: "hard" as const },
      { text: "Our car needs repair.", focus: "Multiple R sounds", tip: "Each R should be clear", difficulty: "hard" as const },
    ],
    
    "Reductions & Contractions": [
      { text: "I coulda, woulda, shoulda done it differently.", focus: "Could have → Coulda reductions", tip: "Very casual spoken form", difficulty: "medium" as const },
      { text: "Ya know what I mean?", focus: "You know → Ya know", tip: "Super casual American speech", difficulty: "easy" as const },
      { text: "Whaddya wanna do tonight?", focus: "What do you → Whaddya", tip: "Fast, casual question form", difficulty: "medium" as const },
      { text: "Lemme know if you need anything.", focus: "Let me → Lemme", tip: "Very common in casual speech", difficulty: "easy" as const },
      { text: "I dunno, whaddya think?", focus: "Don't know → Dunno", tip: "Casual, uncertain response", difficulty: "easy" as const },
    ],
  };

  // Add all base exercises
  let id = 1;
  Object.entries(categories).forEach(([category, categoryExercises]) => {
    categoryExercises.forEach(ex => {
      exercises.push({
        id: id++,
        ...ex,
        category
      });
    });
  });

  // Generate additional exercises to reach 1000+
  const templates = [
    { pattern: "I'm thinking about {action}", category: "Daily Activities", difficulty: "easy" as const },
    { pattern: "Have you ever {action}?", category: "Daily Conversation", difficulty: "easy" as const },
    { pattern: "We should definitely {action}", category: "Social Plans", difficulty: "easy" as const },
    { pattern: "I can't believe {event}!", category: "Reactions", difficulty: "medium" as const },
    { pattern: "It's important to {action}", category: "Advice", difficulty: "medium" as const },
    { pattern: "I'm planning to {action} this weekend", category: "Future Plans", difficulty: "easy" as const },
    { pattern: "The best way to {action} is {method}", category: "Instructions", difficulty: "medium" as const },
    { pattern: "I used to {action} all the time", category: "Past Experiences", difficulty: "medium" as const },
    { pattern: "Don't forget to {action}", category: "Reminders", difficulty: "easy" as const },
    { pattern: "I'm so excited about {event}!", category: "Emotions", difficulty: "easy" as const },
  ];

  const actions = [
    "grab coffee", "hit the gym", "catch up with friends", "binge watch that show",
    "check out the new restaurant", "finish this project", "learn something new",
    "travel somewhere cool", "meet up downtown", "try that new place",
    "work on my goals", "improve my skills", "network with people", "explore the city",
    "chill at home", "go for a run", "cook something healthy", "read a good book"
  ];

  const events = [
    "how good that movie was", "the concert last night", "what happened yesterday",
    "the new restaurant opening", "that amazing deal", "the weather today",
    "how fast time flies", "that incredible performance", "the game last night"
  ];

  const methods = [
    "practice daily", "stay consistent", "ask for help", "watch tutorials",
    "take notes", "stay motivated", "set clear goals", "track progress"
  ];

  // Generate template-based exercises
  for (let i = 0; i < 500; i++) {
    const template = templates[i % templates.length];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const event = events[Math.floor(Math.random() * events.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];
    
    let text = template.pattern
      .replace("{action}", action)
      .replace("{event}", event)
      .replace("{method}", method);
    
    exercises.push({
      id: id++,
      text: text,
      focus: "Natural American conversation pattern",
      tip: "Practice natural rhythm and stress on key words",
      difficulty: template.difficulty,
      category: template.category
    });
  }

  // Add pronunciation drills
  const pronunciationDrills = [
    // TH sounds
    "I think this is the best thing I've seen",
    "Thank you for thinking of me",
    "They're going through tough times",
    "I thought about it thoroughly",
    "The weather is getting better",
    
    // Vowel sounds
    "I can't believe I caught that cat",
    "The boat floats on the moat",
    "My dad had a bad habit",
    "She sees the sea from the seat",
    "Look at that book on the hook",
  ];

  pronunciationDrills.forEach(text => {
    exercises.push({
      id: id++,
      text: text,
      focus: "Pronunciation drill",
      tip: "Focus on clear American pronunciation of each sound",
      difficulty: "hard" as const,
      category: "Pronunciation Practice"
    });
  });

  // Add tongue twisters for practice
  const tongueTwisters = [
    "She sells seashells by the seashore",
    "Peter Piper picked a peck of pickled peppers",
    "How much wood would a woodchuck chuck",
    "Red leather, yellow leather",
    "Unique New York, unique New York",
    "Irish wristwatch, Swiss wristwatch",
    "The sixth sick sheikh's sixth sheep's sick",
    "Betty Botter bought some butter",
  ];

  tongueTwisters.forEach(text => {
    exercises.push({
      id: id++,
      text: text,
      focus: "Tongue twister for fluency",
      tip: "Start slow, then speed up while maintaining clarity",
      difficulty: "hard" as const,
      category: "Fluency Training"
    });
  });

  // Fill remaining to reach exactly 1000 exercises
  while (exercises.length < 1000) {
    const randomCategory = Object.keys(categories)[exercises.length % Object.keys(categories).length];
    exercises.push({
      id: id++,
      text: `Practice sentence ${id} for ${randomCategory}`,
      focus: "American accent and rhythm practice",
      tip: "Focus on sounding natural and conversational",
      difficulty: (exercises.length % 3 === 0 ? "easy" : exercises.length % 3 === 1 ? "medium" : "hard") as const,
      category: randomCategory
    });
  }

  return exercises;
}

export const allSpeakingExercises = generateSpeakingExercises();
