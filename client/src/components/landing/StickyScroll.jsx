//src/components/landing/StickyScroll.jsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, motion, AnimatePresence } from "framer-motion";

export const StickyScroll = ({ content, contentClassName }) => {
  const [activeCard, setActiveCard] = useState(0);
  const containerRef = useRef(null); // This Ref is for the entire scrollable area
  const sectionRefs = useRef([]);

  // Initialize section refs
  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, content.length);
  }, [content.length]);

  // Track scroll progress for the entire container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"] // Tracks scroll from start of container to end of container
  });

  const [isContentVisible, setIsContentVisible] = useState(false);

  // Update active card based on scroll progress
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const totalSections = content.length;
    const sectionSize = 1 / totalSections;

    // Determine if we are within the scrollable content range
    // If latest is 0, we are at the very start (before the first section fully active)
    // If latest is 1, we are at the very end (after the last section fully active)
    setIsContentVisible(latest > 0 && latest < 1);

    // Calculate which section we're in
    let newActiveCard = 0;
    if (totalSections > 0) { // Avoid division by zero if content is empty
        newActiveCard = Math.min(
            Math.floor(latest * totalSections),
            totalSections - 1
        );
    }

    setActiveCard(newActiveCard);
  });

  // Define linear gradients for background changes
  const linearGradients = [
    "linear-gradient(to bottom right, rgb(6 182 212), rgb(16 185 129))", // Cyan to Green
    "linear-gradient(to bottom right, rgb(236 72 153), rgb(99 102 241))", // Pink to Indigo
    "linear-gradient(to bottom right, rgb(249 115 22), rgb(234 179 8))", // Orange to Yellow
    "linear-gradient(to bottom right, rgb(168 85 247), rgb(236 72 153))", // Purple to Pink
  ];

  const [backgroundGradient, setBackgroundGradient] = useState(linearGradients[0]);

  useEffect(() => {
    setBackgroundGradient(linearGradients[activeCard % linearGradients.length]);
  }, [activeCard]);

  return (
    <div ref={containerRef} className="relative">
      {/* Fixed Left Column - Card Container */}
      {/* Conditionally render or animate visibility of the fixed container itself */}
      <motion.div
        className="fixed left-0 top-0 w-[62.5%] h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isContentVisible ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div
          style={{ background: backgroundGradient }}
          className={`h-72 w-full max-w-lg mx-8 rounded-xl bg-white overflow-hidden shadow-2xl ${
            contentClassName || ""
          }`}
        >
          {/* Conditionally render only the active card with AnimatePresence for exit animations */}
          <AnimatePresence mode="wait">
            {content[activeCard] && (
              <motion.div
                key={content[activeCard].title + activeCard} // Key is important for re-mounting and animations
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }} // Ensures the old card fades out
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {content[activeCard].content}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Right Column - Scrollable Content */}
      <div className="ml-[62.5%] w-[37.5%]">
        {content.map((item, index) => (
          <div
            key={item.title + index}
            ref={el => sectionRefs.current[index] = el}
            // Each section should ensure it takes up the viewport height to trigger scroll events effectively
            className="h-screen flex items-center justify-start px-8"
          >
            <div className="max-w-md py-20">
              <motion.h2
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-4xl font-bold text-black mb-6"
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="text-lg text-gray-700 leading-relaxed"
              >
                {item.description}
              </motion.p>
              {/* Debug info */}
              <div className="mt-4 text-sm text-gray-500">
                Section {index + 1} {activeCard === index ? '(ACTIVE)' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};