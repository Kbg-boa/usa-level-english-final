import { Link } from "react-router";
import { Phone, MessageCircle, Lightbulb, Book } from "lucide-react";
import { motion } from "motion/react";

export default function FluencyHub() {
  const modules = [
    { to: "/real-conversation", icon: Phone, title: "Real Conversation", desc: "Phone mode with AI", color: "from-orange-500 to-red-600" },
    { to: "/conversation", icon: MessageCircle, title: "Conversation Simulator", desc: "Real-time practice", color: "from-orange-500 to-red-600" },
    { to: "/thinking", icon: Lightbulb, title: "Think-in-English", desc: "Stop translating", color: "from-orange-500 to-red-600" },
    { to: "/storytelling", icon: Book, title: "Storytelling", desc: "Narrative fluency", color: "from-orange-500 to-red-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">🔥</div>
          <h1 className="text-5xl font-bold text-white mb-4">FLUENCY</h1>
          <p className="text-2xl text-orange-300">Speed. Instinct. Confidence.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((module, idx) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.to}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link
                  to={module.to}
                  className="block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50 rounded-2xl p-8 transition-all group"
                >
                  <div className="flex items-start gap-6">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${module.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">
                        {module.title}
                      </h2>
                      <p className="text-gray-400 text-lg">{module.desc}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
