import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User, MessageCircle, Send, Bot, Lightbulb, Zap, BookOpen, Mic, PenTool, Trophy, Target, TrendingUp, Play, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router";

interface Message {
  id: number;
  sender: "user" | "coach";
  text: string;
  timestamp: Date;
}

interface UserStats {
  wordsLearned: number;
  totalWords: number;
  speakingExercises: number;
  totalSpeaking: number;
  slangMastered: number;
  totalSlang: number;
  writingTemplates: number;
  totalWriting: number;
  quizCompleted: number;
  totalQuiz: number;
  currentDay: number;
  streakDays: number;
}

export default function Coach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userStats, setUserStats] = useState<UserStats>({
    wordsLearned: 0,
    totalWords: 9000,
    speakingExercises: 0,
    totalSpeaking: 1000,
    slangMastered: 0,
    totalSlang: 1000,
    writingTemplates: 0,
    totalWriting: 500,
    quizCompleted: 0,
    totalQuiz: 3500,
    currentDay: 1,
    streakDays: 1
  });

  // Load user stats
  useEffect(() => {
    const savedStats = localStorage.getItem("englishStats");
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      setUserStats(prev => ({ ...prev, ...stats }));
    }

    const dailyProgress = localStorage.getItem("dailyProgress");
    if (dailyProgress) {
      const progress = JSON.parse(dailyProgress);
      const totalCompleted = Object.values(progress).reduce((a: any, b: any) => a + b, 0) as number;
      setUserStats(prev => ({ ...prev, quizCompleted: totalCompleted }));
    }

    // Initial greeting
    const welcomeMessage: Message = {
      id: 1,
      sender: "coach",
      text: getSmartGreeting(),
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // Calculate overall fluency score
  const calculateFluency = (): number => {
    const vocabScore = (userStats.wordsLearned / userStats.totalWords) * 25;
    const speakingScore = (userStats.speakingExercises / userStats.totalSpeaking) * 25;
    const slangScore = (userStats.slangMastered / userStats.totalSlang) * 20;
    const writingScore = (userStats.writingTemplates / userStats.totalWriting) * 15;
    const quizScore = (userStats.quizCompleted / userStats.totalQuiz) * 15;
    
    return Math.round(vocabScore + speakingScore + slangScore + writingScore + quizScore);
  };

  // Get next action recommendation
  const getNextAction = () => {
    if (userStats.wordsLearned < 20) {
      return { module: "vocabulary", action: "Learn your first 20 words", icon: BookOpen, link: "/vocabulary" };
    }
    if (userStats.speakingExercises < 5) {
      return { module: "speaking", action: "Practice 5 pronunciation drills", icon: Mic, link: "/speaking" };
    }
    if (userStats.quizCompleted < 10) {
      return { module: "quiz", action: "Take 10 quiz questions", icon: Trophy, link: "/challenge" };
    }
    if (userStats.slangMastered < 10) {
      return { module: "slang", action: "Learn 10 modern expressions", icon: MessageCircle, link: "/slang" };
    }
    if (userStats.writingTemplates < 5) {
      return { module: "writing", action: "Review 5 email templates", icon: PenTool, link: "/writing" };
    }
    
    // Balanced approach
    const weakest = [
      { score: (userStats.wordsLearned / userStats.totalWords), module: "vocabulary", action: "Build vocabulary", icon: BookOpen, link: "/vocabulary" },
      { score: (userStats.speakingExercises / userStats.totalSpeaking), module: "speaking", action: "Practice speaking", icon: Mic, link: "/speaking" },
      { score: (userStats.quizCompleted / userStats.totalQuiz), module: "quiz", action: "Daily challenge", icon: Trophy, link: "/challenge" },
    ].sort((a, b) => a.score - b.score)[0];
    
    return weakest;
  };

  const getSmartGreeting = (): string => {
    const fluency = calculateFluency();
    const nextAction = getNextAction();
    
    let motivation = "";
    if (fluency === 0) {
      motivation = "Let's start your journey to American fluency! 🚀";
    } else if (fluency < 25) {
      motivation = "Great start! You're building momentum. 💪";
    } else if (fluency < 50) {
      motivation = "Solid progress! You're getting there. 🔥";
    } else if (fluency < 75) {
      motivation = "Impressive! You're more than halfway. 🎯";
    } else {
      motivation = "Outstanding! You're almost fluent! 🏆";
    }
    
    return `Hey! 👋 I'm your AI English coach.

${motivation}

🎯 **OVERALL FLUENCY: ${fluency}%**

📊 **Quick Stats:**
• Vocabulary: ${userStats.wordsLearned} words learned
• Speaking: ${userStats.speakingExercises} exercises done
• Quiz: ${userStats.quizCompleted} questions answered
• Streak: ${userStats.streakDays} day${userStats.streakDays > 1 ? 's' : ''} 🔥

💡 **My Recommendation:**
Focus on "${nextAction.action}" to improve faster.

**How I help you:**
✔ Correct your English instantly
✔ Make your sentences sound American
✔ Train your accent (Flap T, R sounds)
✔ Simulate real conversations
✔ Help with professional emails
✔ Teach modern slang with context
✔ Track progress & fix weak areas

What do you want to work on?`;
  };

  const getCoachResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase().trim();
    const fluency = calculateFluency();
    const nextAction = getNextAction();
    
    // Progress check
    if (msg.includes("progress") || msg.includes("stats") || msg.includes("how am i doing")) {
      const vocabPercent = Math.round((userStats.wordsLearned / userStats.totalWords) * 100);
      const speakingPercent = Math.round((userStats.speakingExercises / userStats.totalSpeaking) * 100);
      const quizPercent = Math.round((userStats.quizCompleted / userStats.totalQuiz) * 100);
      
      let weakAreas = [];
      if (vocabPercent < 15) weakAreas.push("📚 Vocabulary needs more attention");
      if (speakingPercent < 15) weakAreas.push("🎤 Speaking practice is low");
      if (quizPercent < 15) weakAreas.push("🎯 Daily challenges waiting");
      
      let strengths = [];
      if (vocabPercent >= 20) strengths.push("📚 Vocabulary is strong!");
      if (speakingPercent >= 20) strengths.push("🎤 Speaking is improving!");
      if (quizPercent >= 20) strengths.push("🎯 Quiz performance is good!");
      
      return `🎯 **YOUR PROGRESS ANALYSIS**

**Overall Fluency: ${fluency}%**
${fluency < 25 ? "🌱 Building foundation" : fluency < 50 ? "📈 Making progress" : fluency < 75 ? "💪 Advanced level" : "🏆 Near mastery"}

**Current Stats:**
• 📚 Vocabulary: ${userStats.wordsLearned}/${userStats.totalWords} (${vocabPercent}%)
• 🎤 Speaking: ${userStats.speakingExercises}/${userStats.totalSpeaking} (${speakingPercent}%)
• 💬 Slang: ${userStats.slangMastered}/${userStats.totalSlang}
• ✍️ Writing: ${userStats.writingTemplates}/${userStats.totalWriting}
• 🎯 Quiz: ${userStats.quizCompleted}/${userStats.totalQuiz} (${quizPercent}%)
• 🔥 Streak: ${userStats.streakDays} day${userStats.streakDays > 1 ? 's' : ''}

${strengths.length > 0 ? `**💪 Your Strengths:**\n${strengths.map(s => `• ${s}`).join('\n')}\n` : ''}
${weakAreas.length > 0 ? `**⚠️ Areas to Focus:**\n${weakAreas.map(w => `• ${w}`).join('\n')}\n` : ''}

**🎯 Smart Recommendation:**
${nextAction.action} - This will boost your fluency fastest.

**📊 Daily Target:**
• 20 vocabulary words (15 min)
• 5 speaking drills (10 min)
• 10 quiz questions (5 min)
**Total: 30 min/day**

Want to start with ${nextAction.module}?`;
    }

    // Vocabulary help
    if (msg.includes("vocabulary") || msg.includes("vocab") || msg.includes("word")) {
      return `📚 **VOCABULARY TRAINING**

**You have:** ${userStats.wordsLearned}/9,000 words

**Strategy for fast learning:**

1️⃣ **Start with high-frequency words**
Focus on Daily Conversation first - you'll use these every day.

2️⃣ **Learn in context**
Don't memorize lists. See how words are used in real sentences.

3️⃣ **Practice with spaced repetition**
Review words after: 1 day, 3 days, 7 days.

**🎯 Today's Goal:**
Learn 20 words (15 minutes)

**Pro tip from a native:**
Americans use only 3,000-5,000 words daily. Master those first, then expand!

**Categories to start:**
• Daily Conversation (most useful)
• Business & Professional (career boost)
• Slang & Informal (sound natural)

Ready to start? Type 'start vocabulary' or go to Vocabulary module!`;
    }

    // Speaking help
    if (msg.includes("speaking") || msg.includes("accent") || msg.includes("pronunciation") || msg.includes("pronounce")) {
      return `🎤 **AMERICAN ACCENT TRAINING**

**You've completed:** ${userStats.speakingExercises}/1,000 exercises

**The 3 Keys to American Accent:**

1️⃣ **Master the Flap T** (CRITICAL!)
When T comes between vowels, it sounds like a soft D:
• "water" → "WAH-der" (not WAH-ter)
• "better" → "BEH-der"
• "city" → "SIH-dee"

Try it: "I got a bottle of water"
American: "I gah-da BOH-dle of WAH-der"

2️⃣ **Pronounce ALL your R's**
Americans are "rhotic" - we say every R:
• "car" → full R sound
• "park" → strong R
• "better" → R at the end

British people drop Rs. Americans don't!

3️⃣ **Use contractions naturally**
Don't say: "I am going to go"
Say: "I'm gonna go"

**🎯 Today's Practice:**
5 speaking drills (10 minutes)

**Real talk:**
Your accent doesn't have to be perfect. Native speakers have accents too! Focus on clarity and confidence.

Ready to practice? Head to Speaking module!`;
    }

    // Slang help
    if (msg.includes("slang") || msg.includes("expression") || msg.includes("informal")) {
      return `💬 **MODERN AMERICAN SLANG**

**You know:** ${userStats.slangMastered}/1,000+ expressions

**🔥 Top 10 You NEED to Know:**

1. **"No cap"** = for real, no lie
   Use: "That's the best pizza, no cap"

2. **"Bet"** = okay, sounds good
   Use: "Wanna grab lunch?" "Bet!"

3. **"Fire"** 🔥 = amazing
   Use: "This song is fire!"

4. **"Lowkey"** = kind of, secretly
   Use: "I'm lowkey tired"

5. **"It slaps"** = really good (music/food)
   Use: "This burger slaps!"

6. **"I'm dead"** 💀 = so funny
   Use: "That meme killed me, I'm dead!"

7. **"Bussin'"** = delicious
   Use: "This food is bussin'!"

8. **"Vibe check"** = how are you feeling?
   Use: "Quick vibe check - you good?"

9. **"Rent free"** = can't stop thinking about
   Use: "That song lives in my head rent free"

10. **"Main character energy"** = confident
    Use: "She walked in with main character energy"

**⚠️ Important:**
Know the CONTEXT! Using slang wrong is worse than not using it at all.

**🎯 Pro Strategy:**
Learn 10 expressions, then USE them in real conversations. That's how they stick.

Want more? Check the Slang module for 1,000+ expressions!`;
    }

    // Writing help
    if (msg.includes("writing") || msg.includes("write") || msg.includes("email") || msg.includes("business") || msg.includes("professional")) {
      return `✍️ **PROFESSIONAL WRITING HELP**

**Templates reviewed:** ${userStats.writingTemplates}/500

**American Business Writing Rules:**

1️⃣ **Be DIRECT**
❌ "I am writing to inform you that..."
✅ "Just wanted to touch base about..."

2️⃣ **Get to the point FAST**
First sentence = why you're writing
Americans are busy. Don't waste time.

3️⃣ **Use active voice**
❌ "The report was completed by me"
✅ "I completed the report"

4️⃣ **Keep it friendly but professional**
Not too stiff, not too casual.

5️⃣ **Always include next steps**
End with: "Let me know your thoughts" or "I'll follow up on Friday"

**🔥 Most Useful Phrases:**

**Opening:**
• "Hope you're doing well!"
• "Thanks for reaching out"
• "Just wanted to touch base"

**During:**
• "I wanted to circle back on..."
• "Could you loop me in on..."
• "I don't have the bandwidth for..."

**Closing:**
• "Let me know your thoughts"
• "Looking forward to hearing from you"
• "Thanks in advance!"

**🎯 Today's Goal:**
Review 5 email templates (10 minutes)

Need a specific template? Go to Writing module - we have 500 templates + 1,500 variations!`;
    }

    // Quiz help
    if (msg.includes("quiz") || msg.includes("challenge") || msg.includes("test") || msg.includes("question")) {
      return `🎯 **DAILY CHALLENGE STRATEGY**

**Completed:** ${userStats.quizCompleted}/3,500 questions

**How to Ace the Quizzes:**

1️⃣ **Read the "Real-World Context" first**
This tells you WHERE you'd use this. Context = understanding.

2️⃣ **Check the "Vibe"**
English isn't just words, it's FEELING. Know the emotional context.

3️⃣ **Use the 30-second timer**
Real conversations are fast. Train under pressure.

4️⃣ **Learn from mistakes**
Every wrong answer teaches you something. Read the explanations!

**📅 7-Day Structure:**

• **Day 1:** Basic slang & conversation
• **Day 2:** Business English
• **Day 3:** Social media & internet slang
• **Day 4:** Pronunciation & accent
• **Day 5:** Specialized vocabulary
• **Day 6:** Mixed review
• **Day 7:** Master challenge

**🎯 Daily Target:**
10-20 questions (5-10 minutes)

**Pro tip:**
Don't binge 500 questions at once. Do 50-100/day for better retention.

Ready to test yourself? Head to Daily Challenge!`;
    }

    // Motivation
    if (msg.includes("motivat") || msg.includes("encourage") || msg.includes("tired") || msg.includes("hard") || msg.includes("difficult") || msg.includes("give up")) {
      return `💪 **YOU'RE DOING BETTER THAN YOU THINK**

**Fluency Score: ${fluency}%**

Look, learning a language is HARD. But you're showing up. That's 80% of success.

**Real Talk:**

🌟 **Native speakers make mistakes too**
I'm American and I still mess up grammar. Nobody's perfect.

🌟 **Confidence > Accuracy**
Would you rather be 100% accurate but afraid to speak? Or 80% accurate but confident? Confidence wins.

🌟 **Progress isn't linear**
Some days you'll feel fluent. Some days you'll struggle. That's normal. Keep going.

🌟 **You're learning FAST**
Traditional methods take years. You're doing 7 days intensive. Cut yourself some slack!

**🔥 Your Wins So Far:**
${userStats.wordsLearned > 0 ? `• Learned ${userStats.wordsLearned} words` : ''}
${userStats.speakingExercises > 0 ? `• Practiced speaking ${userStats.speakingExercises} times` : ''}
${userStats.quizCompleted > 0 ? `• Answered ${userStats.quizCompleted} quiz questions` : ''}
${userStats.streakDays > 1 ? `• ${userStats.streakDays} day streak 🔥` : ''}

**Next Small Win:**
${nextAction.action} (just ${nextAction.module === 'vocabulary' ? '15' : nextAction.module === 'speaking' ? '10' : '5'} minutes)

**Remember:**
Every session makes you better. Even 5 minutes counts.

You got this! 💪 Want to continue with ${nextAction.module}?`;
    }

    // Hello/Hi
    if (msg.includes("hello") || msg.includes("hi ") || msg === "hi" || msg.includes("hey")) {
      return `Hey! 👋 Welcome back!

**Fluency: ${fluency}%** | **Streak: ${userStats.streakDays} 🔥**

${fluency === 0 ? "Ready to start your first session?" : `Nice to see you again! ${fluency < 50 ? "You're making progress!" : "You're doing great!"}`}

**🎯 Smart Recommendation:**
${nextAction.action}

**Quick Actions:**
• Type "progress" - See detailed stats
• Type "help" - See all I can do
• Type a topic (slang, writing, speaking, etc.)

Or just start training! What interests you?`;
    }

    // Help
    if (msg.includes("help") || msg.includes("what can you do")) {
      return `🤖 **I'M YOUR SMART AI COACH**

**What makes me smart:**
✅ I track YOUR specific progress
✅ I recommend what YOU need most
✅ I adjust to YOUR pace
✅ I explain things like a real American

**🎯 I Can Help You:**

📊 **Check Progress**
Type: "progress" or "stats"
→ See fluency score, weak areas, strengths

📚 **Vocabulary Training**
Type: "vocabulary" or "words"
→ Learning strategies, recommendations

🎤 **Speaking & Accent**
Type: "speaking" or "accent"
→ Flap T, R sounds, natural flow

💬 **Modern Slang**
Type: "slang" or "expressions"
→ Real American slang with context

✍️ **Professional Writing**
Type: "writing" or "email"
→ Business communication tips

🎯 **Quiz Strategies**
Type: "quiz" or "challenge"
→ How to ace the daily questions

💪 **Motivation**
Type: "motivation" or "encourage me"
→ Realistic pep talks

**⚡ Quick Commands:**
• "Teach me X" - Learn any topic
• "Help with X" - Get specific help
• "What's next?" - Get recommendation
• "Start training" - Begin today's session

What do you want to work on?`;
    }

    // What's next
    if (msg.includes("what") && (msg.includes("next") || msg.includes("should i"))) {
      return `🎯 **YOUR NEXT MOVE**

Based on your progress (${fluency}% fluency), here's what I recommend:

**🔥 Priority Action:**
${nextAction.action}

**Why this first?**
${nextAction.module === 'vocabulary' ? 'Strong vocabulary = foundation for everything else. Learn words, then use them in speaking and writing.' : 
  nextAction.module === 'speaking' ? 'Speaking practice builds confidence. The more you practice, the more natural it becomes.' :
  nextAction.module === 'quiz' ? 'Quizzes test everything you know. They show you what you need to work on.' :
  'This is your weakest area right now. Improving it will boost your overall fluency.'}

**⏱️ Time needed:** ${nextAction.module === 'vocabulary' ? '15 minutes' : nextAction.module === 'speaking' ? '10 minutes' : '5-10 minutes'}

**After that:**
${userStats.wordsLearned < 50 ? '→ More vocabulary (get to 50 words)' : ''}
${userStats.speakingExercises < 20 ? '→ Speaking practice (improve accent)' : ''}
${userStats.quizCompleted < 50 ? '→ Daily quiz (test yourself)' : ''}

**📊 Balanced Daily Plan:**
• 20 vocabulary words (15 min)
• 5 speaking drills (10 min)
• 10 quiz questions (5 min)
= 30 min total

Ready to start? Type "start ${nextAction.module}" or head to that module!`;
    }

    // Start command
    if (msg.includes("start")) {
      return `🚀 **LET'S GO!**

Choose your focus:

1️⃣ **Vocabulary** - Learn 20 words (15 min)
Type: "vocabulary" then go to Vocabulary module

2️⃣ **Speaking** - Practice accent (10 min)
Type: "speaking" then go to Speaking module

3️⃣ **Quiz** - Test yourself (10 min)
Type: "quiz" then go to Daily Challenge

4️⃣ **Slang** - Modern expressions (5 min)
Type: "slang" then go to Slang module

5️⃣ **Writing** - Email templates (10 min)
Type: "writing" then go to Writing module

**My recommendation:** ${nextAction.action}

What do you want to start with?`;
    }

    // Default - smart recommendation
    return `I'm not sure about that specific question, but I can help!

**Your current fluency: ${fluency}%**

**🎯 Best next step:**
${nextAction.action}

**I can help you with:**
• Vocabulary strategies
• American accent training
• Modern slang & expressions
• Professional writing
• Quiz preparation
• Progress tracking
• Motivation & tips

**Try asking:**
• "Check my progress"
• "Teach me about [topic]"
• "Help with speaking"
• "What should I do next?"
• "Start training"

What would you like to work on?`;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      text: input,
      timestamp: new Date(),
    };
    setMessages([...messages, userMessage]);

    setTimeout(() => {
      const coachMessage: Message = {
        id: messages.length + 2,
        sender: "coach",
        text: getCoachResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, coachMessage]);
    }, 500);

    setInput("");
  };

  const quickPrompts = [
    "Check my progress",
    "What's next?",
    "Teach me modern slang",
    "Help with accent",
    "I need motivation",
    "Writing tips",
  ];

  const fluency = calculateFluency();
  const nextAction = getNextAction();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Bot className="w-10 h-10 text-indigo-400" />
          Your Personal AI Coach
        </h1>
        <p className="text-xl text-gray-300">
          Instant feedback. Real progress. <span className="text-indigo-400 font-bold">American fluency.</span>
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-indigo-200">Status</div>
              <div className="text-xl font-bold">Ready to Help 24/7</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-indigo-200">Current Streak</div>
            <div className="text-3xl font-bold">{userStats.streakDays} 🔥</div>
          </div>
        </div>

        {/* Fluency Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold">Overall Fluency</span>
            <span className="text-2xl font-bold">{fluency}%</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${fluency}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 text-center text-sm">
          <div className="bg-white/10 rounded-lg p-2">
            <div className="font-bold">{userStats.wordsLearned}</div>
            <div className="text-indigo-200 text-xs">Words</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2">
            <div className="font-bold">{userStats.speakingExercises}</div>
            <div className="text-indigo-200 text-xs">Speaking</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2">
            <div className="font-bold">{userStats.slangMastered}</div>
            <div className="text-indigo-200 text-xs">Slang</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2">
            <div className="font-bold">{userStats.writingTemplates}</div>
            <div className="text-indigo-200 text-xs">Writing</div>
          </div>
          <div className="bg-white/10 rounded-lg p-2">
            <div className="font-bold">{userStats.quizCompleted}</div>
            <div className="text-indigo-200 text-xs">Quiz</div>
          </div>
        </div>
      </div>

      {/* Today's Recommendation */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">🎯 Today's Recommendation</h3>
            <p className="text-orange-100 mb-4">{nextAction.action}</p>
            <div className="flex flex-wrap gap-3">
              <Link to={nextAction.link}>
                <button className="px-6 py-3 bg-white text-orange-600 rounded-lg font-bold hover:bg-orange-50 transition-all flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Start Today's Training
                </button>
              </Link>
              <button 
                onClick={() => setInput("What's next?")}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all"
              >
                Get Full Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${
                message.sender === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === "coach"
                  ? "bg-gradient-to-br from-indigo-500 to-purple-500"
                  : "bg-gradient-to-br from-blue-500 to-cyan-500"
              }`}>
                {message.sender === "coach" ? (
                  <Bot className="w-6 h-6 text-white" />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.sender === "coach"
                    ? "bg-white/10 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                <p className="whitespace-pre-line">{message.text}</p>
                <span className="text-xs opacity-60 mt-2 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Prompts */}
        <div className="border-t border-white/10 p-4 bg-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-400">Quick actions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-4 bg-black/20">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <Target className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Smart & Adaptive</h3>
          <p className="text-gray-400 text-sm">
            I analyze YOUR progress and recommend what YOU need to improve faster.
          </p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <Lightbulb className="w-8 h-8 text-yellow-400 mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Realistic & Honest</h3>
          <p className="text-gray-400 text-sm">
            No BS. I give you real advice like an American friend would.
          </p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Action-Oriented</h3>
          <p className="text-gray-400 text-sm">
            Every response includes clear next steps. No overthinking, just action.
          </p>
        </div>
      </div>
    </div>
  );
}
