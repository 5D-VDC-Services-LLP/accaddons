import React, { useState } from 'react'; // No need for useRef, useEffect anymore for height
import { Plus, X } from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';

const faqData = [
  {
    question: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex",
    answer: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos."
  },
  {
    question: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex",
    answer: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas."
  },
  {
    question: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex",
    answer: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor."
  },
  {
    question: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex",
    answer: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere."
  }
];

const FAQ = () => {
  const [openItems, setOpenItems] = useState({
    0: true, // First item is open by default
    1: false,
    2: false,
    3: false
  });

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <section>
      <div className="max-w-4xl mx-auto mb-6 mt-6 sm:mt-12 lg:mb-20 xl:mb-24 2xl:mb-32 3xl:mb-40">
        <div className="rounded-lg">
          {/* Header */}
          <div className="text-center py-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800">FAQs</h1>
          </div>

          {/* FAQ Items */}
          <div className="divide-y space-y-4 p-2 divide-gray-200">
            {faqData.map((item, index) => (
              <div key={index}>
                {/* Question Row */}
                <div
                  className="flex items-center justify-between p-4 py-4 cursor-pointer"
                  onClick={() => toggleItem(index)}
                >
                  <h3 className="text-base font-medium text-gray-800 pr-4">
                    {item.question}
                  </h3>
                  <motion.button
                    className="text-gray-600 hover:text-gray-900"
                    animate={{ rotate: openItems[index] ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {openItems[index] ? <X size={20} /> : <Plus size={20} />}
                  </motion.button>
                </div>

                {/* Animated Answer */}
                <AnimatePresence initial={false}>
                  {openItems[index] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }} // Animate to "auto"
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      className="px-4 pb-4 overflow-hidden" // Keep overflow hidden here
                      // Optionally, add layout="position" if you want the parent to animate smoothly too
                      // For a simple accordion, this often isn't needed or can be problematic.
                    >
                      <p className="text-sm text-gray-600">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;