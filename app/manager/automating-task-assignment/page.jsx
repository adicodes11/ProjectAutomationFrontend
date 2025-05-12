"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("Initializing TaskFlow Net...");

  // List of loading messages to display sequentially
  const loadingMessages = [
    "Initializing TaskFlow Net...",
    "Analyzing project requirements...",
    "Assigning optimal tasks...",
    "Configuring automation workflows...",
    "Optimizing resource allocation...",
    "Finalizing project structure..."
  ];

  // Auto-redirect after loading completes
  useEffect(() => {
    if (progress >= 100) {
      const redirectTimer = setTimeout(() => {
        router.push("/manager/dashboard");
      }, 1000);
      return () => clearTimeout(redirectTimer);
    }
  }, [progress, router]);

  // Progress and message update effect
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        // Slow down progress as it approaches 100%
        const increment = Math.max(1, 5 - Math.floor(prev / 20));
        return Math.min(100, prev + increment);
      });
    }, 180);

    const messageInterval = setInterval(() => {
      const messageIndex = Math.min(
        Math.floor((progress / 100) * loadingMessages.length),
        loadingMessages.length - 1
      );
      setCurrentTask(loadingMessages[messageIndex]);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [progress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-600 to-cyan-400 flex flex-col items-center justify-center p-4">
      {/* Logo placeholder - replace with your actual logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-12"
      >
        <div className="text-white text-5xl font-bold tracking-tight">
          TaskFlow<span className="text-cyan-300">Net</span>
        </div>
      </motion.div>

      {/* Main content container */}
      <div className="w-full max-w-2xl">
        {/* Status text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-3 text-center"
        >
          <h2 className="text-xl text-cyan-100 font-medium">{currentTask}</h2>
        </motion.div>

        {/* Canva-inspired loading bar */}
        <div className="h-2 bg-blue-800 rounded-full overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          
          {/* Animated sparkle effect */}
          <motion.div
            className="absolute top-0 h-full w-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
            animate={{
              left: ["-10%", "110%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.5,
            }}
          />
        </div>
        
        {/* Progress percentage */}
        <div className="mt-3 text-right">
          <span className="text-cyan-100 font-medium">{progress}%</span>
        </div>
      </div>

      {/* Additional info text */}
      <motion.div
        className="mt-12 text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <h3 className="text-2xl font-bold text-white mb-2">
          Preparing Your AI-Powered Workflow
        </h3>
        <p className="text-blue-100">
          TaskFlow Net is automating your project management process for maximum efficiency and productivity.
        </p>
      </motion.div>

      {/* Animated dots at the bottom */}
      <div className="absolute bottom-10 flex space-x-3">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-cyan-300 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}