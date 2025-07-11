// src/components/WhyAccAddons.jsx

import React from "react";
import FeatureCard from "./FeatureCard";
import { Mail, Brain, Link, Share2 } from "lucide-react"; // Import your icons

const features = [
  {
    icon: <Mail />,
    title: "Smart Notifications",
    description:
      "Instantly alert the right teams when critical issues, RFIs, or forms are at risk.",
    backgroundIcon: <Mail />,
  },
  {
    icon: <Brain />,
    title: "Escalation Matrix",
    description:
      "Define automatic escalation logic based on roles, delays, and issue status.",
    backgroundIcon: <Brain />,
  },
  {
    icon: <Link />,
    title: "ACC-Native Integration",
    description:
      "Built to work inside Autodesk Construction Cloud — no third-party setup required.",
    backgroundIcon: <Link />,
  },
  {
    icon: <Share2 />,
    title: "Multi-Channel Delivery",
    description:
      "Send alerts via WhatsApp, Outlook, or both — depending on user role or urgency.",
    backgroundIcon: <Share2 />,
  },
];

const WhyAccAddons = () => {
  return (
    <section className="bg-gray-50 py-20" id="why-accaddons">
      {/* Main container for the two columns */}
      <div className="max-w-7xl mx-auto px-4 lg:flex lg:items-start lg:gap-16">
        {/* Left Column: Text Content */}
        <div className="lg:w-1/2 lg:pr-8 mb-12 lg:mb-0 text-center lg:text-left">
          {/* Main Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Automate, Escalate, Integrate
          </h2>
          {/* Subtitle */}
          <p className="text-xl text-gray-700 mb-6">
            Elevate your ACC Workflows
          </p>
          {/* Description Paragraph */}
          <p className="text-gray-600 text-lg">
            Tired of manual bottlenecks in Autodesk Construction Cloud? Our app
            is purpose-built to automate your ACC experience, transforming how
            you manage issues and workflows. From intelligent escalation
            matrices that ensure no issue falls through the cracks, to custom
            workflow configurations linking various modules, and even
            multi-action automation within a single module – we empower you to
            achieve unparalleled efficiency.
          </p>
        </div>

        {/* Right Column: Feature Cards Grid */}
        <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>
      </div>

      {/* Optional: Trust line - remains centered below the main content */}
      <p className="text-sm text-gray-500 mt-12 text-center">
        Trusted by forward-thinking construction teams.
      </p>
    </section>
  );
};

export default WhyAccAddons;