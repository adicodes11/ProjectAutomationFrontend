"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Workflow, Users, Clock, BarChart, CheckCircle, Settings, Zap } from "lucide-react";

const HomePage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "Automated Task Allocation",
      description: "Assign tasks intelligently based on team expertise and workload.",
      icon: <Users className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Real-time Progress Tracking",
      description: "Monitor every phase of your project with live updates and insights.",
      icon: <Clock className="w-6 h-6 text-green-600" />
    },
    {
      title: "AI-Driven Insights",
      description: "Leverage AI to optimize workflow, reduce bottlenecks, and improve efficiency.",
      icon: <BarChart className="w-6 h-6 text-purple-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <div className="relative pt-20 pb-32 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-block"
            >
              <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                AI-Powered Project Management
              </span>
            </motion.div>

            <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Optimize Your Workflow with
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
                TaskFlowNet AI
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              Automate task allocation, streamline project tracking, and get AI-powered insights to boost productivity.
            </p>

            {/* Feature Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl border border-gray-300 mb-16 p-6"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    {features[activeFeature].icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{features[activeFeature].title}</h3>
                    <p className="text-gray-600">{features[activeFeature].description}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white shadow-xl p-6 rounded-xl border border-gray-300"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4 shadow-md">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-16"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg"
              >
                Get Started for Free
              </motion.button>
              <p className="mt-4 text-sm text-gray-600">No credit card required</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;