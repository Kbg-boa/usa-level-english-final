import { useState } from "react";
import { motion } from "motion/react";
import { Radio, Mic, Volume2, Play, Pause, RotateCcw, Award, CheckCircle } from "lucide-react";

export default function PronunciationLab() {
  const [activeTab, setActiveTab] = useState<"shadowing" | "accent">("shadowing");
  const [isPlaying, setIsPlaying] = useState(false);
  const [shadowingScore, setShadowingScore] = useState(0);

  const shadowingSentences = [
    { id: 1, text: "I'm gonna grab a coffee real quick", level: "Beginner", completed: false },
    { id: 2, text: "What's up? How's it going?", level: "Beginner", completed: false },
    { id: 3, text: "I'll catch you later, gotta run", level: "Intermediate", completed: false },
    { id: 4, text: "That sounds like a great idea, I'm totally down", level: "Intermediate", completed: false },
    { id: 5, text: "I've been swamped with work lately, no time for anything", level: "Advanced", completed: false },
  ];

  const accentDrills = [
    { id: 1, sound: "TH Sound", words: ["think", "thought", "through", "theater"], difficulty: "Common" },
    { id: 2, sound: "R Sound", words: ["right", "really", "round", "rhythm"], difficulty: "Common" },
    { id: 3, sound: "Schwa /ə/", words: ["about", "banana", "problem", "support"], difficulty: "Advanced" },
    { id: 4, sound: "T-Flapping", words: ["water", "better", "letter", "matter"], difficulty: "Advanced" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">🎙</div>
          <h1 className="text-5xl font-bold text-white mb-3">Pronunciation Lab</h1>
          <p className="text-2xl text-purple-300">Sound like a native. Perfect your accent.</p>
        </motion.div>

        {/* TAB SWITCHER */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("shadowing")}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
              activeTab === "shadowing"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/50"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <Radio className="w-6 h-6" />
              <span>Shadowing</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("accent")}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
              activeTab === "accent"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/50"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <Mic className="w-6 h-6" />
              <span>Accent Drills</span>
            </div>
          </button>
        </div>

        {/* SHADOWING SECTION */}
        {activeTab === "shadowing" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                <Radio className="w-8 h-8 text-purple-400" />
                Shadowing Practice
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Listen to native speakers and repeat immediately. Focus on rhythm, intonation, and natural flow.
              </p>

              <div className="space-y-4">
                {shadowingSentences.map((sentence, idx) => (
                  <motion.div
                    key={sentence.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold text-white">{sentence.text}</span>
                          {sentence.completed && <CheckCircle className="w-6 h-6 text-green-400" />}
                        </div>
                        <div className="text-sm text-purple-300 font-semibold">
                          Level: {sentence.level}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full transition-all">
                        <Volume2 className="w-5 h-5 text-white" />
                      </button>
                      <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg text-white font-semibold transition-all flex items-center gap-2">
                        <Mic className="w-5 h-5" />
                        Record Your Version
                      </button>
                      <button className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
                        <RotateCcw className="w-5 h-5 text-gray-300" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* SCORE CARD */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-4">
                <Award className="w-12 h-12" />
                <div>
                  <div className="text-lg opacity-90">Shadowing Accuracy</div>
                  <div className="text-4xl font-bold">{shadowingScore}%</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ACCENT DRILLS SECTION */}
        {activeTab === "accent" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                <Mic className="w-8 h-8 text-indigo-400" />
                American Accent Drills
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Master the specific sounds that make American English sound natural. Practice pronunciation patterns.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {accentDrills.map((drill, idx) => (
                  <motion.div
                    key={drill.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-6 hover:border-indigo-400/50 transition-all group"
                  >
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-white mb-2">{drill.sound}</h3>
                      <div className="text-sm text-purple-300 font-semibold">
                        Difficulty: {drill.difficulty}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {drill.words.map((word, wordIdx) => (
                        <div
                          key={wordIdx}
                          className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                        >
                          <button className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full transition-all">
                            <Play className="w-4 h-4 text-white" />
                          </button>
                          <span className="text-lg text-white font-medium">{word}</span>
                        </div>
                      ))}
                    </div>

                    <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2">
                      <Mic className="w-5 h-5" />
                      Practice This Sound
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* INFO BOX */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-blue-300 mb-2">💡 Pro Tip</h3>
          <p className="text-gray-300">
            The key to sounding natural is <strong className="text-white">rhythm and intonation</strong>, not just 
            individual sounds. Listen for the music of the language, not just the words.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
