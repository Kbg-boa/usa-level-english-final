import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, CheckCircle2, XCircle, Award, TrendingUp, Lightbulb, MessageCircle, Briefcase, Users, Laugh, Tv, AlertCircle } from "lucide-react";

type Category = "small-talk" | "workplace" | "social-norms" | "humor" | "pop-culture";

interface CulturalLesson {
  id: string;
  category: Category;
  title: string;
  situation: string;
  culturalContext: string;
  frenchPerspective: string;
  americanPerspective: string;
  keyPhrases: string[];
  dos: string[];
  donts: string[];
  realExample: string;
  quiz: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface CulturalProgress {
  lessonId: string;
  completed: boolean;
  quizScore: number;
  completedAt: number;
}

export default function CulturalContext() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<CulturalLesson | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, number>>(new Map());
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState<CulturalProgress[]>([]);

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem("culturalProgress");
    if (saved) {
      setProgress(JSON.parse(saved));
    }
  }, []);

  const culturalLessons: CulturalLesson[] = [
    // SMALL TALK
    {
      id: "small-1",
      category: "small-talk",
      title: "The Art of 'How Are You?'",
      situation: "You meet someone and they ask 'How are you?'",
      culturalContext: "In America, 'How are you?' is NOT a real question about your well-being - it's a greeting! They expect a quick, positive response, not your life story.",
      frenchPerspective: "In France, if someone asks how you are, you might actually tell them. You can say 'Ça va pas trop' or be honest. It's a real question.",
      americanPerspective: "Americans use 'How are you?' as 'Hello'. The expected answer is 'Good! How are you?' - even if you're having a terrible day. It's about being polite and positive, not honest.",
      keyPhrases: [
        "Good, how are you?",
        "Great! And you?",
        "Pretty good, thanks!",
        "Can't complain!",
        "Living the dream! (joking/sarcastic but friendly)"
      ],
      dos: [
        "Always respond positively and briefly",
        "Ask it back to them immediately",
        "Keep moving - don't stop for a real conversation unless they signal interest",
        "Smile while saying it"
      ],
      donts: [
        "DON'T actually tell them how you're doing unless you're close friends",
        "DON'T say 'I'm tired' or 'Not great' to acquaintances",
        "DON'T stop walking expecting a conversation",
        "DON'T be overly honest with strangers"
      ],
      realExample: "Sarah (American): 'Hey! How are you?'\nYou: 'Good! How are you?'\nSarah: 'Great, thanks!' \n[Both keep walking - total interaction: 3 seconds]\n\nThis is NORMAL and polite! It's not rude - it's just American small talk culture.",
      quiz: [
        {
          id: "q1",
          question: "Someone at work you barely know asks 'How are you?' What should you say?",
          options: [
            "Actually, I'm pretty tired today. I didn't sleep well.",
            "Good! How are you?",
            "I'm okay, I guess.",
            "Why do you want to know?"
          ],
          correctAnswer: 1,
          explanation: "'Good! How are you?' is the standard American response. They're greeting you, not asking for details."
        },
        {
          id: "q2",
          question: "If you're genuinely having a bad day, what should you say to an acquaintance?",
          options: [
            "Tell them everything wrong",
            "Still say 'Good! How are you?'",
            "Be honest and say 'Terrible'",
            "Ignore the question"
          ],
          correctAnswer: 1,
          explanation: "Unless they're a close friend, still give the polite positive response. Save real talk for people you're close to."
        }
      ]
    },
    {
      id: "small-2",
      category: "small-talk",
      title: "Weather Talk is NOT Boring",
      situation: "Americans constantly talk about the weather",
      culturalContext: "Weather talk is a safe, friendly conversation starter that Americans use to build rapport. It's not about the weather - it's about connecting.",
      frenchPerspective: "In France, talking about weather might seem superficial or boring. You prefer deeper conversations.",
      americanPerspective: "Weather is a perfect neutral topic that everyone can relate to. It breaks the ice and shows friendliness without being too personal.",
      keyPhrases: [
        "Beautiful day today, isn't it?",
        "Can you believe this weather?",
        "They're calling for rain tomorrow",
        "It's supposed to warm up this weekend",
        "I hope this heat breaks soon"
      ],
      dos: [
        "Use it as an ice breaker with strangers",
        "Respond enthusiastically even if you don't care",
        "Add a personal touch: 'Perfect day for the park!'",
        "Use it in elevators, waiting in line, etc."
      ],
      donts: [
        "DON'T dismiss it as boring or pointless",
        "DON'T give one-word answers",
        "DON'T turn it into a climate change debate (unless you know them well)",
        "DON'T ignore weather comments from strangers"
      ],
      realExample: "Elevator stranger: 'Crazy weather we're having!'\nYou: 'I know, right? I wasn't expecting rain today!'\nStranger: 'Yeah, me neither! Have a good one!'\n\n[You just had a successful American small talk interaction!]",
      quiz: [
        {
          id: "q1",
          question: "Why do Americans talk about weather so much?",
          options: [
            "They're obsessed with weather",
            "It's a safe, friendly conversation starter",
            "They have nothing else to talk about",
            "They're boring"
          ],
          correctAnswer: 1,
          explanation: "Weather is a neutral, relatable topic that helps build rapport without being personal or controversial."
        }
      ]
    },

    // WORKPLACE CULTURE
    {
      id: "work-1",
      category: "workplace",
      title: "American Work Enthusiasm",
      situation: "Americans seem overly enthusiastic at work",
      culturalContext: "In American workplace culture, showing visible enthusiasm and positivity is expected and professional. It's not fake - it's professional courtesy.",
      frenchPerspective: "In France, you can be more reserved and critical. Being 'too enthusiastic' might seem unprofessional or naive.",
      americanPerspective: "Enthusiasm shows you're a team player, engaged, and positive. Even if you're not feeling it, professional demeanor means staying upbeat.",
      keyPhrases: [
        "That's a great idea!",
        "I'm excited to work on this!",
        "Love it! Let's do it!",
        "This is going to be awesome!",
        "Great job on that presentation!"
      ],
      dos: [
        "Show visible excitement about projects",
        "Compliment colleagues' work publicly",
        "Use positive language in emails",
        "Thank people frequently and enthusiastically"
      ],
      donts: [
        "DON'T be overly critical in public",
        "DON'T seem unenthusiastic about new initiatives",
        "DON'T dismiss ideas without offering alternatives",
        "DON'T be the 'negative' person in meetings"
      ],
      realExample: "Boss: 'We're launching a new project next month!'\n\nFrench response: 'Hmm, okay. What about the current projects?'\nAmerican response: 'That's exciting! I'd love to hear more about it!'\n\n[Same meaning, different energy - American style builds better relationships]",
      quiz: [
        {
          id: "q1",
          question: "Your boss presents a new idea you're unsure about. What's the best American response?",
          options: [
            "That might not work because...",
            "That's interesting! I have some questions about implementation.",
            "I don't think that's a good idea.",
            "Okay, if you say so."
          ],
          correctAnswer: 1,
          explanation: "Show interest first, then ask thoughtful questions. Americans value positive framing."
        },
        {
          id: "q2",
          question: "A colleague presents in a meeting. You disagree with their approach. What do you do?",
          options: [
            "Immediately point out the flaws",
            "Say nothing",
            "Say 'Great presentation! I have a different perspective on...'",
            "Roll your eyes"
          ],
          correctAnswer: 2,
          explanation: "Compliment first, then offer alternative perspective. Never criticize publicly without acknowledging positives."
        }
      ]
    },
    {
      id: "work-2",
      category: "workplace",
      title: "Direct vs Indirect Feedback",
      situation: "American managers give feedback differently than French managers",
      culturalContext: "Americans use the 'sandwich method': positive feedback, constructive criticism, positive feedback. They're indirect compared to French directness.",
      frenchPerspective: "In France, direct criticism is normal and expected. 'This is wrong' is professional feedback.",
      americanPerspective: "Americans soften criticism to maintain relationships and morale. 'This is great! One thing we could improve is... But overall, nice work!'",
      keyPhrases: [
        "I really like this, but have you considered...?",
        "This is solid work! One area for improvement might be...",
        "Great effort! Let's refine the approach on...",
        "I appreciate what you did here. Moving forward, let's...",
        "You're on the right track! Here's a thought..."
      ],
      dos: [
        "Start with genuine positives",
        "Frame criticism as suggestions",
        "End on an encouraging note",
        "Focus on the work, not the person"
      ],
      donts: [
        "DON'T be blunt: 'This is bad'",
        "DON'T only give negative feedback",
        "DON'T make it personal",
        "DON'T be overly harsh even if you're right"
      ],
      realExample: "French style: 'This report has several errors. You need to fix it.'\n\nAmerican style: 'Thanks for getting this done! I noticed a couple of small things we should adjust before finalizing. Overall, you're headed in the right direction!'\n\n[Same message, but the American version maintains relationship while correcting.]",
      quiz: [
        {
          id: "q1",
          question: "You need to tell someone their work needs major revisions. How do you phrase it?",
          options: [
            "This needs a lot of work. Start over.",
            "I see what you were going for here! Let's work together to strengthen a few key areas.",
            "This isn't good enough.",
            "Did you even try?"
          ],
          correctAnswer: 1,
          explanation: "Acknowledge effort, offer collaboration, frame as improvement opportunity."
        }
      ]
    },

    // SOCIAL NORMS
    {
      id: "social-1",
      category: "social-norms",
      title: "American Personal Space",
      situation: "Physical distance and personal space boundaries",
      culturalContext: "Americans value personal space more than many cultures. Standing too close can make them uncomfortable.",
      frenchPerspective: "In France, especially in cities, people stand closer. 'La bise' (cheek kissing) is normal greeting.",
      americanPerspective: "Keep arm's length distance. Handshakes are professional. Hugs are for close friends/family. Cheek kissing is rare.",
      keyPhrases: [
        "Nice to meet you! (handshake)",
        "Good to see you! (wave or handshake)",
        "Can I give you a hug? (ask first!)",
        "Sorry, didn't mean to get in your space!"
      ],
      dos: [
        "Maintain arm's length in conversations",
        "Handshake for professional meetings",
        "Ask before hugging unless very close",
        "Respect if someone steps back"
      ],
      donts: [
        "DON'T kiss on cheeks unless specifically from a culture that does",
        "DON'T stand too close in lines or conversations",
        "DON'T touch people you don't know well",
        "DON'T assume physical affection is welcome"
      ],
      realExample: "First meeting:\nFrance: Kiss on both cheeks\nAmerica: Handshake and smile\n\nClose friends:\nFrance: Still kisses\nAmerica: Hug (if you're close), or just wave and smile",
      quiz: [
        {
          id: "q1",
          question: "You're meeting a new colleague for the first time. What's appropriate?",
          options: [
            "Kiss on both cheeks",
            "Handshake and smile",
            "Hug",
            "Bow"
          ],
          correctAnswer: 1,
          explanation: "Handshake is the standard American professional greeting."
        }
      ]
    },
    {
      id: "social-2",
      category: "social-norms",
      title: "Tipping Culture Explained",
      situation: "American tipping is mandatory, not optional",
      culturalContext: "In the US, servers are paid very low base wages ($2-3/hour) and rely on tips for income. 15-20% tip is EXPECTED, not optional.",
      frenchPerspective: "In France, service is included. Tipping is optional and small.",
      americanPerspective: "Not tipping is considered extremely rude and basically stealing from the server. Even bad service gets 10-15%. Good service = 20%+.",
      keyPhrases: [
        "What's customary to tip here?",
        "I'll leave 20%",
        "Keep the change (if appropriate)",
        "The service was great! (when leaving good tip)"
      ],
      dos: [
        "Tip 15-20% at restaurants",
        "Tip bartenders $1-2 per drink",
        "Tip delivery drivers 15-20%",
        "Tip hairstylists, taxi drivers, hotel staff"
      ],
      donts: [
        "DON'T skip tipping thinking it's optional",
        "DON'T tip less than 15% unless service was truly terrible",
        "DON'T forget to tip delivery drivers",
        "DON'T be confused - it's part of the cost"
      ],
      realExample: "Bill: $50\nMinimum tip (15%): $7.50\nStandard tip (20%): $10\n\nServers literally depend on this. Factor it into your budget!",
      quiz: [
        {
          id: "q1",
          question: "Your restaurant bill is $60. What tip should you leave for good service?",
          options: [
            "$3 (5%)",
            "$6 (10%)",
            "$12 (20%)",
            "$0 (service included)"
          ],
          correctAnswer: 2,
          explanation: "20% ($12) is standard for good service in America. It's not optional - it's how servers earn their living."
        }
      ]
    },

    // HUMOR & SARCASM
    {
      id: "humor-1",
      category: "humor",
      title: "American Sarcasm Signals",
      situation: "Understanding when Americans are being sarcastic",
      culturalContext: "Americans use sarcasm frequently but signal it clearly with tone, facial expressions, or context. Missing the signals can lead to confusion.",
      frenchPerspective: "French humor can be more subtle, dry, or intellectual. Sarcasm exists but might be delivered differently.",
      americanPerspective: "American sarcasm is usually obvious with exaggerated tone, eye rolling, or the phrase 'Yeah, right!' They want you to know they're joking.",
      keyPhrases: [
        "Oh yeah, that's exactly what I want to do... (sarcastic)",
        "Sure, why not? (sarcastic if said with eye roll)",
        "That went well... (after disaster)",
        "Living the dream! (usually sarcastic unless genuinely happy)",
        "Just great. (often sarcastic)"
      ],
      dos: [
        "Listen for exaggerated tone",
        "Look for facial expressions (eye roll, smirk)",
        "Consider context - does it make sense?",
        "If unsure, you can ask 'Are you serious?'"
      ],
      donts: [
        "DON'T take everything literally",
        "DON'T miss obvious tone shifts",
        "DON'T be offended if they're clearly joking",
        "DON'T use sarcasm with people who might not get it"
      ],
      realExample: "Literal: 'How was your day?' 'Great!' (actually good)\n\nSarcastic: 'How was your day?' 'Oh, just GREAT.' (eyes roll, had terrible day)\n\nContext + tone = key!",
      quiz: [
        {
          id: "q1",
          question: "Friend spills coffee everywhere and says 'Perfect. Just perfect.' Are they serious?",
          options: [
            "Yes, they're happy",
            "No, they're being sarcastic",
            "They actually think it's perfect",
            "Can't tell"
          ],
          correctAnswer: 1,
          explanation: "Context (spilling coffee) + flat tone = sarcasm. They're frustrated, not happy."
        },
        {
          id: "q2",
          question: "Which phrase is MOST likely sarcastic?",
          options: [
            "I'm so happy to be here!",
            "Yeah, because THAT'S exactly what I needed today...",
            "This is delicious!",
            "Thank you so much!"
          ],
          correctAnswer: 1,
          explanation: "The exaggerated 'THAT'S' and ellipsis signal sarcasm. Context matters, but this structure screams sarcasm."
        }
      ]
    },
    {
      id: "humor-2",
      category: "humor",
      title: "Self-Deprecating Humor",
      situation: "Americans use self-deprecating humor to seem humble and relatable",
      culturalContext: "Making fun of yourself is a social tool to bond with others and seem down-to-earth. It's NOT fishing for compliments.",
      frenchPerspective: "In France, self-deprecation might be seen as lack of confidence. You present your best self.",
      americanPerspective: "Laughing at yourself shows confidence and humility. It makes you likeable and approachable. 'Yeah, I totally bombed that presentation! 😅'",
      keyPhrases: [
        "I'm such a mess!",
        "I have no idea what I'm doing!",
        "That was embarrassing! (laughing at yourself)",
        "I'm the worst at cooking!",
        "Classic me! (after making mistake)"
      ],
      dos: [
        "Laugh at your own mistakes",
        "Don't take yourself too seriously",
        "Use it to connect with others",
        "Join in when others laugh at themselves"
      ],
      donts: [
        "DON'T offer compliments when they self-deprecate (usually not what they want)",
        "DON'T be overly self-critical (there's a balance)",
        "DON'T use it in job interviews (wrong context)",
        "DON'T pile on if someone else self-deprecates"
      ],
      realExample: "American: 'I'm so bad at parallel parking! I probably failed like 5 times!'\n\nDON'T say: 'Oh no, I'm sure you're great!'\n\nDO say: 'Haha, same! It took me forever to learn!'\n\n[Bonding through shared struggles]",
      quiz: [
        {
          id: "q1",
          question: "Someone says 'I'm such a disaster in the kitchen!' What should you say?",
          options: [
            "No you're not! You're great!",
            "Haha, me too! I burned pasta last week.",
            "You should take a cooking class.",
            "That's sad."
          ],
          correctAnswer: 1,
          explanation: "Join in the self-deprecation! Share your own kitchen disasters. It creates connection."
        }
      ]
    },

    // POP CULTURE
    {
      id: "pop-1",
      category: "pop-culture",
      title: "The Office & Friends References",
      situation: "Americans constantly reference popular TV shows",
      culturalContext: "American TV shows like The Office, Friends, Seinfeld, Parks & Rec are cultural touchstones. References are everywhere in conversation.",
      frenchPerspective: "You might not have watched these shows growing up. References go over your head.",
      americanPerspective: "These shows are shared cultural language. Quotes and references are how people connect and make jokes.",
      keyPhrases: [
        "That's what she said! (The Office)",
        "How YOU doin'? (Friends - Joey's catchphrase)",
        "We were on a break! (Friends - Ross)",
        "That's a Festivus for the rest of us! (Seinfeld)",
        "Treat yo self! (Parks & Recreation)"
      ],
      dos: [
        "Watch popular American shows to get references",
        "Ask if you don't understand a reference",
        "Laugh along even if you don't fully get it",
        "Learn common catchphrases"
      ],
      donts: [
        "DON'T pretend to understand if you don't",
        "DON'T judge people for TV references",
        "DON'T feel left out - just ask!",
        "DON'T dismiss American pop culture"
      ],
      realExample: "Coworker: 'That's what she said!'\n\nIf you know: Laugh (it's a The Office reference)\n\nIf you don't: 'I haven't watched The Office - what's that from?'\n\n[They'll be HAPPY to explain and might recommend you watch it!]",
      quiz: [
        {
          id: "q1",
          question: "Someone makes a reference you don't understand. What should you do?",
          options: [
            "Fake laugh and move on",
            "Say 'I don't get it - what's that from?'",
            "Ignore it",
            "Look confused"
          ],
          correctAnswer: 1,
          explanation: "Americans love explaining references! It's a bonding opportunity. Just ask!"
        }
      ]
    },
    {
      id: "pop-2",
      category: "pop-culture",
      title: "Sports Talk Basics",
      situation: "Americans bond over sports - even if you don't care, you should know basics",
      culturalContext: "Sports (especially football, basketball, baseball) are HUGE social topics. Men especially bond over sports. Knowing basics helps you connect.",
      frenchPerspective: "In France, soccer (football) is huge. American football might seem confusing and boring.",
      americanPerspective: "Sports are conversation starters, team pride is identity, and Super Bowl is a national holiday. You don't need to love it, but knowing basics helps socially.",
      keyPhrases: [
        "Did you catch the game last night?",
        "How about those [team name]!",
        "That was a crazy play!",
        "Are you watching the Super Bowl?",
        "I'm not really into sports, but I heard about that!"
      ],
      dos: [
        "Know the major sports: Football (NFL), Basketball (NBA), Baseball (MLB)",
        "Learn your local team names",
        "Watch the Super Bowl at least once (huge social event)",
        "It's OK to say you're not into sports, but be friendly about it"
      ],
      donts: [
        "DON'T dismiss sports as stupid or boring",
        "DON'T call soccer 'football' (in America, football = American football)",
        "DON'T insult someone's favorite team",
        "DON'T be completely clueless about major events (Super Bowl, World Series)"
      ],
      realExample: "Coworker: 'Did you see the game last night?'\n\nIf you didn't: 'No, I missed it! What happened?'\n\nNot: 'I don't watch sports. They're boring.'\n\n[Stay friendly and engaged even if you don't care!]",
      quiz: [
        {
          id: "q1",
          question: "Someone asks if you watched 'the game'. You didn't. What's the best response?",
          options: [
            "Sports are stupid.",
            "No, what happened?",
            "I have better things to do.",
            "Ignore them"
          ],
          correctAnswer: 1,
          explanation: "Show interest even if you didn't watch. It's about connection, not actually caring about sports."
        }
      ]
    }
  ];

  const categories = [
    {
      id: "small-talk" as Category,
      icon: MessageCircle,
      title: "Small Talk",
      desc: "Master American chitchat",
      color: "from-blue-500 to-cyan-500",
      count: culturalLessons.filter(l => l.category === "small-talk").length
    },
    {
      id: "workplace" as Category,
      icon: Briefcase,
      title: "Workplace Culture",
      desc: "Navigate American work norms",
      color: "from-purple-500 to-pink-500",
      count: culturalLessons.filter(l => l.category === "workplace").length
    },
    {
      id: "social-norms" as Category,
      icon: Users,
      title: "Social Norms",
      desc: "Unwritten social rules",
      color: "from-green-500 to-emerald-500",
      count: culturalLessons.filter(l => l.category === "social-norms").length
    },
    {
      id: "humor" as Category,
      icon: Laugh,
      title: "Humor & Sarcasm",
      desc: "Get American jokes",
      color: "from-orange-500 to-red-500",
      count: culturalLessons.filter(l => l.category === "humor").length
    },
    {
      id: "pop-culture" as Category,
      icon: Tv,
      title: "Pop Culture",
      desc: "Understand references",
      color: "from-yellow-500 to-amber-500",
      count: culturalLessons.filter(l => l.category === "pop-culture").length
    }
  ];

  const lessonsByCategory = (category: Category) =>
    culturalLessons.filter(l => l.category === category);

  const selectAnswer = (questionId: string, answerIndex: number) => {
    const newAnswers = new Map(selectedAnswers);
    newAnswers.set(questionId, answerIndex);
    setSelectedAnswers(newAnswers);
  };

  const submitQuiz = () => {
    if (!selectedLesson) return;

    const correctCount = selectedLesson.quiz.reduce((count, question) => {
      const userAnswer = selectedAnswers.get(question.id);
      return userAnswer === question.correctAnswer ? count + 1 : count;
    }, 0);

    const score = Math.round((correctCount / selectedLesson.quiz.length) * 100);

    const newProgress: CulturalProgress = {
      lessonId: selectedLesson.id,
      completed: true,
      quizScore: score,
      completedAt: Date.now()
    };

    const updatedProgress = [...progress.filter(p => p.lessonId !== selectedLesson.id), newProgress];
    setProgress(updatedProgress);
    localStorage.setItem("culturalProgress", JSON.stringify(updatedProgress));

    setShowResults(true);
  };

  const resetLesson = () => {
    setSelectedLesson(null);
    setSelectedCategory(null);
    setCurrentQuizIndex(0);
    setSelectedAnswers(new Map());
    setShowResults(false);
  };

  const getCompletedCount = () => progress.filter(p => p.completed).length;
  const getAverageScore = () => {
    if (progress.length === 0) return 0;
    const total = progress.reduce((sum, p) => sum + p.quizScore, 0);
    return Math.round(total / progress.length);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Globe className="w-10 h-10 text-blue-400" />
          Cultural Context
        </h1>
        <p className="text-xl text-gray-300">
          Understand American culture. <span className="text-blue-400 font-bold">Think like a native.</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white text-center">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{getCompletedCount()}</div>
          <div className="text-blue-100 text-sm mt-1">Lessons Completed</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center">
          <Award className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">
            {progress.length > 0 ? getAverageScore() : "—"}<span className="text-lg">%</span>
          </div>
          <div className="text-purple-100 text-sm mt-1">Quiz Average</div>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2" />
          <div className="text-3xl font-bold">{culturalLessons.length}</div>
          <div className="text-green-100 text-sm mt-1">Total Lessons</div>
        </div>
      </div>

      {!selectedCategory ? (
        <>
          {/* Category Selection */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🇺🇸 Choose Cultural Topic</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="bg-white/10 hover:bg-white/20 rounded-xl p-6 transition-all text-left group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${cat.color} rounded-lg flex items-center justify-center mb-3`}>
                    <cat.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{cat.title}</h4>
                  <p className="text-sm text-gray-400 mb-3">{cat.desc}</p>
                  <div className="text-xs text-gray-500">{cat.count} lessons</div>
                </button>
              ))}
            </div>
          </div>

          {/* Why Cultural Context Matters */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
            <div className="flex items-start gap-3">
              <Globe className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-3">🇺🇸 Why Cultural Context = True Fluency</h3>
                <div className="space-y-2 text-blue-100 text-sm">
                  <div>
                    <strong className="text-white">Language is Culture:</strong> You can know all the words and grammar, but if you don't understand HOW and WHEN to use them in American culture, you'll still feel foreign.
                  </div>
                  <div>
                    <strong className="text-white">Avoid Awkward Moments:</strong> What's polite in France might be rude in America (and vice versa). Understanding these differences prevents social mistakes.
                  </div>
                  <div>
                    <strong className="text-white">Build Real Connections:</strong> When you understand American communication style, humor, and social norms, you can actually connect with people - not just exchange words.
                  </div>
                  <div>
                    <strong className="text-white">Think Like a Native:</strong> True fluency isn't just speaking English - it's understanding the American mindset behind the language.
                  </div>
                  <div className="mt-3 bg-white/10 rounded-lg p-3 text-xs">
                    💡 <strong>Remember:</strong> Different isn't wrong! American culture has its quirks, just like French culture does. Understanding doesn't mean you have to abandon your identity - it means you can navigate both worlds successfully.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : !selectedLesson ? (
        <>
          {/* Lesson Selection */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {categories.find(c => c.id === selectedCategory)?.title}
              </h3>
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
              >
                Back
              </button>
            </div>

            <div className="space-y-3">
              {lessonsByCategory(selectedCategory).map((lesson) => {
                const lessonProgress = progress.find(p => p.lessonId === lesson.id);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className="w-full bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-all text-left relative"
                  >
                    {lessonProgress && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {lessonProgress.quizScore}%
                      </div>
                    )}

                    <h4 className="text-lg font-bold text-white mb-2">{lesson.title}</h4>
                    <p className="text-sm text-gray-400 mb-2">{lesson.situation}</p>
                    <div className="text-xs text-gray-500">{lesson.quiz.length} quiz questions</div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : !showResults ? (
        <>
          {/* Lesson Content */}
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedLesson.title}</h2>
                  <p className="text-lg text-gray-300">{selectedLesson.situation}</p>
                </div>
                <button
                  onClick={resetLesson}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
                >
                  Exit
                </button>
              </div>
            </div>

            {/* Cultural Context */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Cultural Context
              </h3>
              <p className="text-blue-100">{selectedLesson.culturalContext}</p>
            </div>

            {/* Perspectives Comparison */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  🇫🇷 French Perspective
                </h3>
                <p className="text-gray-300 text-sm">{selectedLesson.frenchPerspective}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  🇺🇸 American Perspective
                </h3>
                <p className="text-gray-300 text-sm">{selectedLesson.americanPerspective}</p>
              </div>
            </div>

            {/* Key Phrases */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">💬 Key Phrases to Use</h3>
              <div className="space-y-2">
                {selectedLesson.keyPhrases.map((phrase, idx) => (
                  <div key={idx} className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3 text-blue-200">
                    {phrase}
                  </div>
                ))}
              </div>
            </div>

            {/* Do's and Don'ts */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  DO's
                </h3>
                <div className="space-y-2">
                  {selectedLesson.dos.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-green-400 flex-shrink-0">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  DON'T's
                </h3>
                <div className="space-y-2">
                  {selectedLesson.donts.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-red-400 flex-shrink-0">✗</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Real Example */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Real-Life Example
              </h3>
              <div className="bg-white/10 rounded-lg p-4 text-sm whitespace-pre-line">
                {selectedLesson.realExample}
              </div>
            </div>

            {/* Quiz */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">✅ Test Your Understanding</h3>
              
              <div className="space-y-8">
                {selectedLesson.quiz.map((question, qIdx) => (
                  <div key={question.id} className="space-y-4">
                    <h4 className="text-white font-semibold">
                      {qIdx + 1}. {question.question}
                    </h4>
                    
                    <div className="grid md:grid-cols-2 gap-3">
                      {question.options.map((option, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => selectAnswer(question.id, oIdx)}
                          className={`p-4 rounded-lg text-left transition-all ${
                            selectedAnswers.get(question.id) === oIdx
                              ? "bg-blue-600 border border-blue-400 text-white"
                              : "bg-white/10 hover:bg-white/20 border border-white/10 text-gray-300"
                          }`}
                        >
                          <span className="font-semibold mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={submitQuiz}
                disabled={selectedAnswers.size < selectedLesson.quiz.length}
                className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-6 h-6" />
                Submit Quiz ({selectedAnswers.size}/{selectedLesson.quiz.length})
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Results */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white"
          >
            <h2 className="text-3xl font-bold mb-6 text-center">🎯 Quiz Results</h2>

            {/* Score */}
            <div className="text-center mb-8">
              <div className="text-7xl font-bold mb-2">
                {Math.round((Array.from(selectedAnswers.entries()).filter(([qId, answer]) => {
                  const question = selectedLesson?.quiz.find(q => q.id === qId);
                  return question?.correctAnswer === answer;
                }).length / (selectedLesson?.quiz.length || 1)) * 100)}%
              </div>
              <div className="text-xl text-indigo-100">
                {Array.from(selectedAnswers.entries()).filter(([qId, answer]) => {
                  const question = selectedLesson?.quiz.find(q => q.id === qId);
                  return question?.correctAnswer === answer;
                }).length} / {selectedLesson?.quiz.length} correct
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4 mb-8">
              {selectedLesson?.quiz.map((question, idx) => {
                const userAnswer = selectedAnswers.get(question.id);
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <div key={question.id} className={`bg-white/10 rounded-xl p-4 border-2 ${isCorrect ? 'border-green-400' : 'border-red-400'}`}>
                    <div className="flex items-start gap-3 mb-3">
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">{idx + 1}. {question.question}</h4>
                        <div className="text-sm space-y-1">
                          <div>Your answer: <span className={isCorrect ? 'text-green-300' : 'text-red-300'}>{question.options[userAnswer!]}</span></div>
                          {!isCorrect && (
                            <div>Correct answer: <span className="text-green-300">{question.options[question.correctAnswer]}</span></div>
                          )}
                        </div>
                        <div className="mt-2 text-sm bg-white/10 rounded p-2 text-indigo-100">
                          💡 {question.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={resetLesson}
                className="px-6 py-3 bg-white text-indigo-600 hover:bg-gray-100 rounded-xl font-bold transition-all"
              >
                Choose New Lesson
              </button>
              <button
                onClick={() => {
                  setShowResults(false);
                  setSelectedAnswers(new Map());
                }}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all"
              >
                Review Lesson
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
