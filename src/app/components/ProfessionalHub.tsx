import { Link } from "react-router";
import { PenTool, Globe, Trophy } from "lucide-react";
import { motion } from "motion/react";

export default function ProfessionalHub() {
  const modules = [
    { to: "/writing", icon: PenTool, title: "Writing", desc: "Business & emails", color: "from-gray-600 to-gray-800" },
    { to: "/cultural", icon: Globe, title: "Cultural Context", desc: "American culture", color: "from-gray-600 to-gray-800" },
    { to: "/challenge", icon: Trophy, title: "Daily Challenge", desc: "Test your skills", color: "from-gray-600 to-gray-800" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">💼</div>
          <h1 className="text-5xl font-bold text-white mb-4">PROFESSIONAL</h1>
          <p className="text-2xl text-gray-300">Communicate with authority.</p>
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
                  className="block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gray-500/50 rounded-2xl p-8 transition-all group"
                >
                  <div className="flex items-start gap-6">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${module.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-gray-300 transition-colors">
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