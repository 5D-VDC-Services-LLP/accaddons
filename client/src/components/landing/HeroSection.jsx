import React from 'react';
import SkewedImageGroup from './SkewedImageGroup';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative bg-white mt-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-24 flex flex-col justify-start items-start">
        {/* Top Content: Heading + Buttons */}
        <div className="max-w-2xl z-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Automate Your<br />
            Autodesk Construction Cloud
          </h1>
          <p className="text-gray-600 text-lg mb-8 italic">
            Cut response times. <span className="not-italic font-medium">Escalate issues</span> before they stall your project.
          </p>

          <div className="flex items-start justify-start gap-4">
            <Link to="/company-grid" className="flex items-center">
            <button className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-black/70 transition-colors ease-in-out duration-300">
              Get Started
            </button>
            </Link>
            <button className="text-black font-medium hover:underline py-3 px-1  justify-center items-center">
              See How It Works &gt;
            </button>
          </div>
        </div>

        {/* Bottom Skewed Images - Adjusted margin-top for better spacing */}
        <div className="mt-16 w-full flex justify-center">
          <SkewedImageGroup />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;