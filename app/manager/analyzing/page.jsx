"use client";

import { motion } from "framer-motion";

export default function AnalyzingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex flex-col items-center justify-center">
      {/* Animated Spinner */}
      <motion.div
        className="w-32 h-32 border-8 border-t-transparent border-white rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      ></motion.div>

      {/* Title */}
      <motion.h2
        className="mt-8 text-4xl text-white font-extrabold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Analyzing your project...
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        className="mt-4 text-xl text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        Please wait while we generate insights.
      </motion.p>
    </div>
  );
}
