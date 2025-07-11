// src/components/FeatureCard.jsx

import React, { useState } from "react"; // Import useState

const FeatureCard = ({ icon, title, description, backgroundIcon }) => {
  const idSuffix = React.useId();
  const gradientId = `gradient-${idSuffix}`;
  const maskId = `mask-${idSuffix}`;

  // State to track hover status
  const [isHovered, setIsHovered] = useState(false);

  // Define stop opacity values based on hover state
  const stopOpacityStart = isHovered ? "0.3" : "0.05"; // More opaque on hover
  const stopOpacityEnd = isHovered ? "0.8" : "0.3"; // Much more opaque on hover

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:bg-black hover:text-white shadow-sm hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)} // Set hovered to true
      onMouseLeave={() => setIsHovered(false)} // Set hovered to false
    >
      {/* Foreground Content */}
      <div className="p-6 relative z-10">
        <div className="text-accent mb-4 group-hover:text-white transition-colors duration-300">
          {icon}
        </div>

        <h3 className="text-lg font-semibold mb-2 transition-colors duration-300">
          {title}
        </h3>

        <p className="text-sm text-gray-600 group-hover:text-gray-300 transition-colors duration-300">
          {description}
        </p>
      </div>

      {/* Subtle Background Icon with Gradient Opacity */}
      <div className="absolute top-[-110px] right-[-120px] z-0">
        <svg
          className="scale-[0.3] transition-colors duration-200"
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
              {/* Opacity now depends on isHovered state */}
              <stop offset="0%" stopColor="white" stopOpacity={stopOpacityStart} />
              <stop offset="100%" stopColor="white" stopOpacity={stopOpacityEnd} />
            </linearGradient>

            <mask id={maskId}>
              <rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
            </mask>
          </defs>

          {backgroundIcon && React.cloneElement(backgroundIcon, {
            mask: `url(#${maskId})`,
            color: 'gray',
            className: 'group-hover:text-white transition-colors duration-200 transition-colors transition-all ease-in-out',
          })}
        </svg>
      </div>

      {/* Hover Arrow */}
      <div className="absolute bottom-4 right-4 text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 z-10">
        →
      </div>
    </div>
  );
};

export default FeatureCard;