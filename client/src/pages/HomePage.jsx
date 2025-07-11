import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/backgroundImage.png';
import WhyAccAddons from "../components/WhyAccAddons";
import HeroSection from '../components/landing/HeroSection.jsx';

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Navbar component */}
      <Navbar />
      <HeroSection />
      <WhyAccAddons />
    </div>
  );
};

export default HomePage;