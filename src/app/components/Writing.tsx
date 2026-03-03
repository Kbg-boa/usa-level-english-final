import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Copy, CheckCircle, Sparkles, BookOpen, ChevronLeft, ChevronRight, Zap, AlertTriangle, Target, TrendingUp, RefreshCw, Lightbulb, Home, Music, Film, Users, Briefcase, Award, BarChart3, Clock } from "lucide-react";
import { allWritingTemplates, totalVariations } from "../data/writing-templates";

type ToneLevel = "friendly" | "professional" | "executive" | "assertive" | "persuasive";
type ContextType = "general" | "real-estate" | "investor" | "music" | "film" | "internal-team";

interface ClarityScore {
  clarity: number;
  confidence: number;
  professionalTone: number;
  americanNaturalness: number;
  directness: number; // -5 to +5 (negative = too soft, positive = too aggressive)
}

export default function Writing() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [toneLevel, setToneLevel] = useState<ToneLevel>("professional");
  const [contextType, setContextType] = useState<ContextType>("general");
  const [showExecutive, setShowExecutive] = useState(false);
  const [showBoardroom, setShowBoardroom] = useState(false);
  const [showUrgency, setShowUrgency] = useState(false);
  const [userText, setUserText] = useState("");
  const [rewriteMode, setRewriteMode] = useState(false);
  const [rewrittenVersions, setRewrittenVersions] = useState<string[]>([]);
  const [clarityScore, setClarityScore] = useState<ClarityScore | null>(null);
  const [showAutopsy, setShowAutopsy] = useState(false);

  const categories = ["All", ...Array.from(new Set(allWritingTemplates.map(t => t.category)))];

  const filteredTemplates = selectedCategory === "All"
    ? allWritingTemplates
    : allWritingTemplates.filter(t => t.category === selectedCategory);

  const currentTemplate = filteredTemplates[selectedTemplateIndex];

  const copyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-green-400";
      case "intermediate": return "text-yellow-400";
      case "advanced": return "text-red-400";
      case "executive": return "text-purple-400";
      default: return "text-gray-400";
    }
  };

  // Calculate Clarity Score
  const calculateClarityScore = (text: string): ClarityScore => {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordPerSentence = words / sentences;
    
    // Clarity: shorter sentences = higher clarity
    const clarity = Math.max(0, Math.min(10, 10 - (avgWordPerSentence - 10) * 0.5));
    
    // Confidence: strong words vs weak words
    const weakWords = (text.match(/\b(maybe|perhaps|possibly|might|could|would like)\b/gi) || []).length;
    const confidence = Math.max(0, 10 - weakWords * 2);
    
    // Professional tone: formal phrases
    const professionalPhrases = (text.match(/\b(please|thank you|appreciate|regards|best)\b/gi) || []).length;
    const professionalTone = Math.min(10, 5 + professionalPhrases);
    
    // American naturalness: contractions, casual phrases
    const americanPhrases = (text.match(/\b(I'm|you're|we're|don't|can't|won't|let's|FYI|ASAP)\b/gi) || []).length;
    const americanNaturalness = Math.min(10, 5 + americanPhrases * 0.5);
    
    // Directness: -5 (too soft) to +5 (too aggressive)
    const softPhrases = (text.match(/\b(if possible|when you have time|no rush|whenever|maybe)\b/gi) || []).length;
    const aggressivePhrases = (text.match(/\b(immediately|urgent|asap|must|need|require)\b/gi) || []).length;
    const directness = aggressivePhrases - softPhrases;
    
    return {
      clarity: Math.round(clarity * 10) / 10,
      confidence: Math.round(confidence * 10) / 10,
      professionalTone: Math.round(professionalTone * 10) / 10,
      americanNaturalness: Math.round(americanNaturalness * 10) / 10,
      directness: Math.max(-5, Math.min(5, directness))
    };
  };

  // Power Upgrade Functions
  const makeStronger = (text: string): string => {
    return text
      .replace(/I think/gi, "I'm confident that")
      .replace(/maybe/gi, "")
      .replace(/I believe/gi, "I know")
      .replace(/might/gi, "will")
      .replace(/could/gi, "will")
      .replace(/would like to/gi, "want to")
      .replace(/if possible/gi, "")
      .replace(/perhaps/gi, "");
  };

  const makeShorter = (text: string): string => {
    return text
      .replace(/I wanted to reach out to you regarding/gi, "Re:")
      .replace(/I am writing to inform you that/gi, "")
      .replace(/just wanted to let you know/gi, "FYI:")
      .replace(/I would appreciate it if you could/gi, "Please")
      .replace(/at your earliest convenience/gi, "soon");
  };

  const makeExecutive = (text: string): string => {
    return text
      .replace(/Hi |Hey /gi, "")
      .replace(/Hope you're doing well/gi, "")
      .replace(/Just wanted to/gi, "")
      .replace(/I was wondering if/gi, "")
      .split('\n')
      .filter(line => line.trim().length > 0)
      .slice(0, 4)
      .join('\n');
  };

  const makeBoardroom = (text: string): string => {
    return text
      .replace(/I'd value your perspective/gi, "I'd appreciate your strategic input")
      .replace(/thoughts/gi, "strategic perspective")
      .replace(/feedback/gi, "strategic guidance")
      .replace(/opinion/gi, "executive perspective")
      .replace(/help/gi, "strategic support")
      .replace(/meeting/gi, "strategic discussion")
      .replace(/call/gi, "strategic sync");
  };

  const makeUrgent = (text: string): string => {
    const urgentClosing = "\n\nI'd appreciate a response by EOD if possible.\n\nTime-sensitive - thanks for prioritizing this.";
    return text.replace(/Best,|Thanks,|Regards,/gi, urgentClosing + "\n\nBest,");
  };

  const makeAmerican = (text: string): string => {
    return text
      .replace(/whilst/gi, "while")
      .replace(/amongst/gi, "among")
      .replace(/Dear Sir\/Madam/gi, "Hi team")
      .replace(/Yours sincerely/gi, "Best")
      .replace(/I should be grateful/gi, "I'd appreciate")
      .replace(/kindly/gi, "please")
      .replace(/at the earliest/gi, "ASAP");
  };

  // Context-Specific Vocabulary
  const getContextVocabulary = (context: ContextType): string[] => {
    const vocabMap: Record<ContextType, string[]> = {
      "general": ["opportunity", "discussion", "collaboration", "timeline", "next steps"],
      "real-estate": ["asset", "ROI", "acquisition", "portfolio", "capital", "property", "market value", "comps", "escrow", "closing"],
      "investor": ["valuation", "equity", "runway", "leverage", "scalability", "cap table", "burn rate", "traction", "metrics", "returns"],
      "music": ["masters", "publishing", "distribution", "royalties", "split", "advance", "streaming", "sync", "mechanical", "performance"],
      "film": ["production", "post-production", "distribution", "rights", "talent", "budget", "deliverables", "festival", "theatrical", "streaming"],
      "internal-team": ["deliverables", "sprint", "milestone", "bandwidth", "blockers", "sync", "standup", "retrospective", "action items", "updates"]
    };
    return vocabMap[context] || vocabMap.general;
  };

  // Context-Specific Versions with adapted vocabulary
  const getContextVersion = (template: string, context: ContextType): string => {
    const contextTemplates: Record<ContextType, string> = {
      "general": template,
      "real-estate": `Hi [Name],\n\nI'd like to discuss a property asset that aligns with your acquisition criteria.\n\nKey metrics:\n• Location & market position\n• ROI potential: [%]\n• Capital requirements: [Amount]\n• Portfolio fit\n\nAre you available for a strategic sync [day] at [time]?\n\nBest,\n[Your Name]`,
      "investor": `Hi [Name],\n\nI'm reaching out regarding [opportunity/update].\n\nKey metrics:\n• Valuation: [Amount]\n• Runway: [Months]\n• Traction: [Metrics]\n• Scalability potential\n\nI'd value your strategic perspective. Available for a quick sync [day]?\n\nBest,\n[Your Name]`,
      "music": `Hey [Name],\n\nI wanted to connect about [project/deal].\n\nKey points:\n• Masters & publishing rights\n• Distribution strategy\n• Royalty split: [Terms]\n• Timeline for release\n\nCan we hop on a call [day] to discuss?\n\nLet's create something fire 🔥\n\n[Your Name]`,
      "film": `Hi [Name],\n\nI'm developing [project name] and wanted to discuss potential collaboration.\n\nProject overview:\n• Genre & vision\n• Production timeline: [Timeline]\n• Budget range: [Amount]\n• Distribution strategy\n\nWould love to schedule a brief meeting to share the creative vision.\n\nAvailable [day] at [time]?\n\nBest,\n[Your Name]`,
      "internal-team": `Hey team,\n\nQuick update on [project]:\n\n✅ Completed deliverables: [Items]\n🔄 Current sprint focus: [Items]\n⏰ Next milestones: [Items]\n⚠️ Blockers: [If any]\n\nLet me know if you need bandwidth on anything.\n\nThanks,\n[Your Name]`
    };

    return contextTemplates[context] || template;
  };

  // Micro-Upgrade Examples
  const microUpgrades = [
    { 
      original: "I wanted to ask if maybe we could possibly meet sometime this week",
      upgraded: "Could we meet this week?",
      saved: "12 words → 5 words",
      why: "Americans cut unnecessary qualifiers"
    },
    {
      original: "I was wondering if you might have some time to discuss",
      upgraded: "Can we discuss?",
      saved: "10 words → 3 words",
      why: "Direct asks are respected, not rude"
    },
    {
      original: "It would be great if we could potentially collaborate on this",
      upgraded: "Let's collaborate on this",
      saved: "10 words → 4 words",
      why: "Confidence > Hedging"
    },
    {
      original: "I'm not sure if this is the right approach, but maybe",
      upgraded: "I recommend [approach]",
      saved: "Uncertainty → Authority",
      why: "Leadership language"
    }
  ];

  // Rewrite User's Version with Clarity Score
  const rewriteUserText = () => {
    if (!userText.trim()) return;

    const professional = makeAmerican(userText);
    const stronger = makeStronger(userText);
    const executive = makeExecutive(makeStronger(userText));

    const versions = [
      professional,
      stronger,
      executive
    ];

    setRewrittenVersions(versions);
    
    // Calculate clarity score for strongest version
    const score = calculateClarityScore(executive);
    setClarityScore(score);
  };

  // Email Autopsy
  const emailAutopsy = {
    opening: {
      phrase: "Hi [Name],",
      why: "Personal, warm, American standard. Not 'Dear' (too formal) or just name (too abrupt)."
    },
    context: {
      phrase: "I wanted to touch base about [topic]",
      why: "Common American phrase. Shows initiative. 'Touch base' is casual-professional."
    },
    ask: {
      phrase: "Would you be available for a quick call?",
      why: "'Quick' respects their time. Question format is polite but direct."
    },
    flexibility: {
      phrase: "Let me know what works for you",
      why: "Shows flexibility. Puts ball in their court. Builds relationship."
    },
    closing: {
      phrase: "Best, [Name]",
      why: "Professional but friendly. Not 'Sincerely' (too formal) or 'Cheers' (too casual for first contact)."
    }
  };

  // Common Mistakes with nuance
  const commonMistakes = [
    { 
      phrase: "I am writing to inform you that...", 
      issue: "⚠️ Too formal for most American business emails", 
      better: "Just wanted to let you know...",
      context: "Use formal only for legal/official communications"
    },
    { 
      phrase: "At your earliest convenience", 
      issue: "⚠️ Sounds dated and overly formal", 
      better: "When you have a chance",
      context: "Americans prefer natural, conversational tone"
    },
    { 
      phrase: "I want to discuss about the project", 
      issue: "❌ Grammatically incorrect", 
      better: "I want to discuss the project",
      context: "'Discuss' already includes 'about'"
    },
    { 
      phrase: "Please revert back", 
      issue: "❌ Not used in American English", 
      better: "Please get back to me",
      context: "'Revert' means 'return to previous state'"
    },
    { 
      phrase: "I kindly request", 
      issue: "⚠️ Overly formal and stiff", 
      better: "I'd appreciate if you could",
      context: "American business is professional but warm"
    },
    { 
      phrase: "Please do the needful", 
      issue: "❌ Not used in American English", 
      better: "Please help with this",
      context: "British colonial phrase, not American"
    },
    { 
      phrase: "Can we talk about this week?", 
      issue: "⚠️ Ambiguous - talk about the week, or talk during the week?", 
      better: "Can we talk this week?",
      context: "Remove 'about' for clarity"
    },
    { 
      phrase: "As per our discussion", 
      issue: "⚠️ Corporate jargon, sounds stiff", 
      better: "Following up on our chat",
      context: "Americans prefer conversational over corporate"
    }
  ];

  // Why This Works explanations
  const whyItWorks = {
    "Meeting Request": [
      "Direct opening - Gets to the point immediately",
      "Clear ask - No ambiguity about what you want",
      "Flexible scheduling - Shows respect for their time",
      "Professional but friendly - Not stiff or robotic"
    ],
    "Follow-up Email": [
      "References previous conversation - Shows attention",
      "Brief recap - Refreshes their memory",
      "Clear next steps - Makes it easy to respond",
      "Polite persistence - Professional without being pushy"
    ],
    "Cold Outreach": [
      "Personalized opening - Shows you did research",
      "Value proposition upfront - Why should they care?",
      "Brief and scannable - Respects their time",
      "Clear CTA - Makes next step obvious"
    ],
    "default": [
      "Clear structure - Easy to scan",
      "Professional tone - Appropriate for business",
      "Action-oriented - Drives results",
      "American style - Direct and efficient"
    ]
  };

  const currentWhyItWorks = whyItWorks[currentTemplate?.title as keyof typeof whyItWorks] || whyItWorks.default;

  const getDirectnessLabel = (directness: number): string => {
    if (directness < -2) return "Too Soft";
    if (directness < 0) return "Slightly Soft";
    if (directness === 0) return "Balanced";
    if (directness <= 2) return "Slightly Firm";
    return "Too Aggressive";
  };

  const getDirectnessColor = (directness: number): string => {
    if (directness < -2) return "text-blue-400";
    if (directness < 0) return "text-green-400";
    if (directness === 0) return "text-emerald-400";
    if (directness <= 2) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FileText className="w-10 h-10 text-orange-400" />
          Professional Writing
        </h1>
        <p className="text-xl text-gray-300">
          Write with clarity. <span className="text-orange-400 font-bold">Lead with confidence.</span>
        </p>
        <p className="text-sm text-gray-400 mt-2">
          {allWritingTemplates.length} templates • {totalVariations} variations • Apple-level clean
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white text-center">
          <div className="text-3xl font-bold">{allWritingTemplates.length}</div>
          <div className="text-blue-200 text-sm mt-1">Templates</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white text-center">
          <div className="text-3xl font-bold">{totalVariations}</div>
          <div className="text-purple-200 text-sm mt-1">Variations</div>
        </div>
        <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-6 text-white text-center">
          <div className="text-3xl font-bold">{categories.length - 1}</div>
          <div className="text-orange-200 text-sm mt-1">Categories</div>
        </div>
      </div>

      {/* Micro-Upgrade Examples */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6" />
          <h3 className="text-2xl font-bold">⚡ Micro-Upgrade Examples</h3>
        </div>
        <p className="text-emerald-100 text-sm mb-6">How Americans cut unnecessary words</p>
        
        <div className="grid md:grid-cols-2 gap-4">
          {microUpgrades.map((example, idx) => (
            <div key={idx} className="bg-white/10 rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-emerald-200 mb-1">❌ Original ({example.original.split(' ').length} words):</div>
                  <div className="text-sm text-red-200 line-through italic">"{example.original}"</div>
                </div>
                <div>
                  <div className="text-xs text-emerald-200 mb-1">✅ Upgraded ({example.upgraded.split(' ').length} words):</div>
                  <div className="text-base text-white font-semibold">"{example.upgraded}"</div>
                </div>
                <div className="pt-2 border-t border-white/20">
                  <div className="text-xs text-emerald-200">{example.saved}</div>
                  <div className="text-xs text-white/80 mt-1">💡 {example.why}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewrite My Version with Clarity Score */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6" />
            <h3 className="text-2xl font-bold">🔧 Rewrite My Version</h3>
          </div>
          <button
            onClick={() => setRewriteMode(!rewriteMode)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
          >
            {rewriteMode ? "Hide" : "Show"}
          </button>
        </div>

        <AnimatePresence>
          {rewriteMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <p className="text-indigo-200 text-sm">
                Paste your email and get 3 improved versions + clarity score
              </p>
              
              <textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Paste your email here..."
                className="w-full h-32 bg-white/10 border border-white/20 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              />

              <button
                onClick={rewriteUserText}
                disabled={!userText.trim()}
                className="w-full py-3 bg-white text-indigo-600 hover:bg-gray-100 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg font-bold transition-all"
              >
                ✨ Analyze & Rewrite
              </button>

              {clarityScore && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 rounded-xl p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <h4 className="text-lg font-bold">Clarity Score</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Clarity</span>
                        <span className="text-lg font-bold text-yellow-400">{clarityScore.clarity}/10</span>
                      </div>
                      <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                          style={{ width: `${clarityScore.clarity * 10}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Confidence</span>
                        <span className="text-lg font-bold text-blue-400">{clarityScore.confidence}/10</span>
                      </div>
                      <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
                          style={{ width: `${clarityScore.confidence * 10}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Professional Tone</span>
                        <span className="text-lg font-bold text-purple-400">{clarityScore.professionalTone}/10</span>
                      </div>
                      <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-400 to-purple-500"
                          style={{ width: `${clarityScore.professionalTone * 10}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">American Naturalness</span>
                        <span className="text-lg font-bold text-green-400">{clarityScore.americanNaturalness}/10</span>
                      </div>
                      <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-green-500"
                          style={{ width: `${clarityScore.americanNaturalness * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Directness Meter */}
                  <div className="bg-black/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold">Directness Meter</span>
                      <span className={`text-lg font-bold ${getDirectnessColor(clarityScore.directness)}`}>
                        {getDirectnessLabel(clarityScore.directness)}
                      </span>
                    </div>
                    <div className="relative h-3 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded-full">
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-white shadow-lg rounded-full"
                        style={{ left: `${((clarityScore.directness + 5) / 10) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-blue-300">Too Soft</span>
                      <span className="text-green-300">Balanced</span>
                      <span className="text-red-300">Too Aggressive</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {rewrittenVersions.length > 0 && (
                <div className="space-y-4 mt-6">
                  {["📝 Professional Version", "🔥 Stronger Version", "⚡ Executive Version"].map((title, idx) => (
                    <div key={idx} className="bg-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-white">{title}</span>
                        <button
                          onClick={() => copyToClipboard(rewrittenVersions[idx])}
                          className="p-1 hover:bg-white/10 rounded transition-all"
                        >
                          {copiedText === rewrittenVersions[idx] ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-200 whitespace-pre-wrap">
                        {rewrittenVersions[idx]}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Context Selector */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-2">🌍 Industry Context</h3>
        <p className="text-sm text-gray-400 mb-4">
          Vocabulary auto-adapts: {getContextVocabulary(contextType).slice(0, 5).join(", ")}...
        </p>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { type: "general" as ContextType, icon: Briefcase, label: "General" },
            { type: "real-estate" as ContextType, icon: Home, label: "Real Estate" },
            { type: "investor" as ContextType, icon: TrendingUp, label: "Investor" },
            { type: "music" as ContextType, icon: Music, label: "Music" },
            { type: "film" as ContextType, icon: Film, label: "Film" },
            { type: "internal-team" as ContextType, icon: Users, label: "Team" }
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setContextType(type)}
              className={`p-3 rounded-xl transition-all ${
                contextType === type
                  ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              <Icon className="w-6 h-6 mx-auto mb-1" />
              <div className="text-xs">{label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              setSelectedTemplateIndex(0);
              setSelectedVariation(0);
            }}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedCategory === category
                ? "bg-orange-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {category}
            {category !== "All" && (
              <span className="ml-2 text-xs opacity-75">
                ({allWritingTemplates.filter(t => t.category === category).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Template Navigation */}
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <button
          onClick={() => {
            setSelectedTemplateIndex(Math.max(0, selectedTemplateIndex - 1));
            setSelectedVariation(0);
          }}
          disabled={selectedTemplateIndex === 0}
          className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="text-center flex-1">
          <h3 className="text-xl font-bold text-white">{currentTemplate.title}</h3>
          <p className="text-sm text-gray-400 mt-1">
            Template {selectedTemplateIndex + 1} of {filteredTemplates.length} • 
            <span className={`ml-2 ${getDifficultyColor(currentTemplate.difficulty)}`}>
              {currentTemplate.difficulty}
            </span>
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedTemplateIndex(Math.min(filteredTemplates.length - 1, selectedTemplateIndex + 1));
            setSelectedVariation(0);
          }}
          disabled={selectedTemplateIndex === filteredTemplates.length - 1}
          className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Situation Card */}
          <motion.div
            key={`situation-${currentTemplate.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5" />
              <h4 className="font-bold text-lg">Situation</h4>
            </div>
            <p className="text-blue-100">{currentTemplate.situation}</p>
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm text-blue-200">
                <strong>When to use:</strong> {currentTemplate.whenToUse}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm text-blue-200">
                <strong>Tone:</strong> {currentTemplate.tone}
              </p>
            </div>
          </motion.div>

          {/* Why This Works */}
          <div className="bg-green-600/20 border border-green-600/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-green-400" />
              <h4 className="font-bold text-lg text-white">🧠 Why This Works</h4>
            </div>
            <ul className="space-y-2">
              {currentWhyItWorks.map((reason, idx) => (
                <li key={idx} className="text-sm text-green-200 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-400" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Email Autopsy */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h4 className="font-bold text-lg text-white">Email Autopsy</h4>
              </div>
              <button
                onClick={() => setShowAutopsy(!showAutopsy)}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                {showAutopsy ? "Hide" : "Show"}
              </button>
            </div>

            <AnimatePresence>
              {showAutopsy && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  {Object.entries(emailAutopsy).map(([key, value]) => (
                    <div key={key} className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-purple-400 font-semibold mb-1 capitalize">{key}</div>
                      <div className="text-sm text-white mb-1">"{value.phrase}"</div>
                      <div className="text-xs text-gray-400">{value.why}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Key Phrases */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h4 className="font-bold text-lg text-white">Key Phrases</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentTemplate.keyPhrases.map((phrase, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-yellow-600/20 border border-yellow-600/50 rounded-full text-yellow-300 text-sm"
                >
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Context-Specific Template */}
          {contextType !== "general" && (
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg">
                  {contextType === "real-estate" && "🏠 Real Estate Version"}
                  {contextType === "investor" && "📈 Investor Version"}
                  {contextType === "music" && "🎵 Music Industry"}
                  {contextType === "film" && "🎬 Film Industry"}
                  {contextType === "internal-team" && "👥 Internal Team"}
                </h4>
                <button
                  onClick={() => copyToClipboard(getContextVersion(currentTemplate.template, contextType))}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-gray-200 whitespace-pre-wrap max-h-80 overflow-y-auto">
                {getContextVersion(currentTemplate.template, contextType)}
              </div>
            </div>
          )}

          {/* Main Template */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg text-white">Main Template</h4>
              <button
                onClick={() => copyToClipboard(currentTemplate.template)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all text-white"
              >
                {copiedText === currentTemplate.template ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {currentTemplate.template}
            </div>
          </div>

          {/* Power Upgrade Buttons */}
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5" />
              <h4 className="font-bold text-lg">⚡ Power Upgrades</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => copyToClipboard(makeStronger(currentTemplate.template))}
                className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-sm font-semibold"
              >
                💪 Stronger
              </button>
              <button
                onClick={() => copyToClipboard(makeShorter(currentTemplate.template))}
                className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-sm font-semibold"
              >
                ⚡ Shorter
              </button>
              <button
                onClick={() => setShowExecutive(!showExecutive)}
                className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-sm font-semibold"
              >
                🎯 Executive
              </button>
              <button
                onClick={() => setShowBoardroom(!showBoardroom)}
                className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-sm font-semibold"
              >
                👔 Boardroom
              </button>
              <button
                onClick={() => setShowUrgency(!showUrgency)}
                className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-sm font-semibold"
              >
                <Clock className="w-4 h-4 inline mr-1" />
                Urgent
              </button>
              <button
                onClick={() => copyToClipboard(makeAmerican(currentTemplate.template))}
                className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-sm font-semibold"
              >
                🇺🇸 American
              </button>
            </div>
          </div>

          {/* Executive Version */}
          <AnimatePresence>
            {showExecutive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg">🎯 Executive Version</h4>
                  <button onClick={() => copyToClipboard(makeExecutive(makeStronger(currentTemplate.template)))} className="p-2 hover:bg-white/10 rounded-lg">
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-purple-200 text-xs mb-3">Concise. Confident. Leadership-level.</p>
                <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-gray-200 whitespace-pre-wrap">
                  {makeExecutive(makeStronger(currentTemplate.template))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Boardroom Version */}
          <AnimatePresence>
            {showBoardroom && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-6 text-white border-2 border-yellow-500/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg">👔 Boardroom Version</h4>
                  <button onClick={() => copyToClipboard(makeBoardroom(makeExecutive(makeStronger(currentTemplate.template))))} className="p-2 hover:bg-white/10 rounded-lg">
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-slate-300 text-xs mb-3">Strategic language. C-suite level. Maximum authority.</p>
                <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-gray-200 whitespace-pre-wrap">
                  {makeBoardroom(makeExecutive(makeStronger(currentTemplate.template)))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Urgency Version */}
          <AnimatePresence>
            {showUrgency && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-br from-red-600 to-orange-600 rounded-xl p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Urgency Version
                  </h4>
                  <button onClick={() => copyToClipboard(makeUrgent(currentTemplate.template))} className="p-2 hover:bg-white/10 rounded-lg">
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-orange-200 text-xs mb-3">Time-sensitive. For deals & negotiations.</p>
                <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-gray-200 whitespace-pre-wrap">
                  {makeUrgent(currentTemplate.template)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Variations */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h4 className="font-bold text-lg text-white mb-4">
              Variations ({currentTemplate.variations.length})
            </h4>
            
            <div className="flex gap-2 mb-4 flex-wrap">
              {currentTemplate.variations.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedVariation(index)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedVariation === index
                      ? "bg-orange-600 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  V{index + 1}
                </button>
              ))}
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Variation {selectedVariation + 1}</span>
                <button
                  onClick={() => copyToClipboard(currentTemplate.variations[selectedVariation])}
                  className="p-1 hover:bg-white/10 rounded transition-all text-white"
                >
                  {copiedText === currentTemplate.variations[selectedVariation] ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="font-mono text-sm text-gray-300 whitespace-pre-wrap max-h-80 overflow-y-auto">
                {currentTemplate.variations[selectedVariation]}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Common Mistakes Section - Nuanced */}
      <div className="bg-red-600/10 border border-red-600/30 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <h3 className="text-xl font-bold text-white">Common Mistakes & Nuances</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {commonMistakes.map((mistake, idx) => (
            <div key={idx} className="bg-black/20 rounded-lg p-4">
              <div className="space-y-2">
                <div className="text-red-300 text-sm">
                  <span className="font-semibold">{mistake.issue.includes('❌') ? '❌' : '⚠️'}</span> "{mistake.phrase}"
                </div>
                <div className="text-xs text-red-200 italic">
                  {mistake.issue}
                </div>
                <div className="text-green-300 text-sm">
                  <span className="font-semibold">✅ Better:</span> "{mistake.better}"
                </div>
                <div className="text-gray-400 text-xs pt-2 border-t border-white/10">
                  💡 {mistake.context}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Writing Tips */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <h3 className="font-bold text-xl mb-4">💼 American Business Writing Essentials</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-3">✅ Do's</h4>
            <ul className="space-y-2 text-sm text-green-100">
              <li>• Be clear and concise</li>
              <li>• Use active voice</li>
              <li>• Get to the point quickly</li>
              <li>• Use professional contractions</li>
              <li>• Include clear action items</li>
            </ul>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-3">❌ Don'ts</h4>
            <ul className="space-y-2 text-sm text-green-100">
              <li>• Avoid overly formal language</li>
              <li>• Don't be too wordy</li>
              <li>• Skip unnecessary apologies</li>
              <li>• Avoid passive voice</li>
              <li>• Don't bury the lead</li>
            </ul>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-3">🎯 Pro Tips</h4>
            <ul className="space-y-2 text-sm text-green-100">
              <li>• Front-load key information</li>
              <li>• Use bullet points</li>
              <li>• Keep paragraphs short</li>
              <li>• Proofread before sending</li>
              <li>• Match recipient's tone</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
