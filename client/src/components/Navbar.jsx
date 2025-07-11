// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import logo from '../assets/logo.svg';
import whiteLogo from '../assets/2.svg'; // This logo isn't currently used, but keeping it as it was in original

const Navbar = () => {
  // State declarations
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Effect hooks
  useEffect(() => {
    // Effect for handling scroll behavior
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handler functions
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Main component render
  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-50 py-3' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">

          {/* Left Section: Dropdowns (visible on md screens and up) */}
          <div className="hidden md:flex items-center space-x-8 order-1 flex-1 justify-start">
            <NavDropdown
              title="Features"
              items={[
                { label: "Product 1", href: "/products/1" },
                { label: "Product 2", href: "/products/2" },
                { label: "Product 3", href: "/products/3" }
              ]}
            />
            <NavDropdown
              title="Resources"
              items={[
                { label: "Our Story", href: "/about/story" },
                { label: "Team", href: "/about/team" },
                { label: "Careers", href: "/about/careers" }
              ]}
            />
            <NavDropdown
              title="Pricing"
              items={[
                { label: "Enterprise", href: "/about/story" },
                { label: "Team", href: "/about/team" },
              ]}
            />
          </div>

          {/* Center Section: Logo (order adjusted for mobile/desktop) */}
          <div className="flex-shrink-0 flex items-center order-2 md:order-2 justify-center">
            <a href="/" className="text-primary-900 font-bold text-2xl">
              <img src={logo} alt="Company Logo" className='h-12 w-auto' />
            </a>
          </div>

          {/* Right Section: Buttons (visible on md screens and up) */}
          <div className="hidden md:flex items-center space-x-4 order-3 flex-1 justify-end">
            <a
              href="/login" // Assuming a login route
              className="bg-black text-white px-4 py-2 rounded-full font-semibold hover:bg-black/70 transition-colors ease-in-out duration-300"
            >
              Get Demo
            </a>
            <a
              href="#contact"
              className="px-4 py-2 rounded-full bg-white text-black border border-gray-200 hover:bg-gray-100 font-medium transition-colors ease-in-out duration-300"
            >
              Contact Us
            </a>
          </div>

          {/* Hamburger menu on the right (mobile) */}
          <div className="md:hidden order-3"> {/* Moved to order-3 for mobile to be on right */}
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-gray-900 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu from left (unchanged functionality) */}
      <div className={`md:hidden fixed top-16 left-0 z-40 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'w-1/3 h-[calc(100vh-4rem)] opacity-100' : 'w-0 opacity-0 h-[calc(100vh-4rem)] overflow-hidden'}`}>
        <div
          className="h-full w-full px-4 pt-6 pb-10 space-y-2 bg-white/90 backdrop-blur-md shadow-xl transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(204,204,204,0.95))',
          }}
        >
          <MobileNavItem
            title="Products"
            items={[
              { label: "Product 1", href: "/products/1" },
              { label: "Product 2", href: "/products/2" },
              { label: "Product 3", href: "/products/3" }
            ]}
          />
          <MobileNavItem
            title="About"
            items={[
              { label: "Our Story", href: "/about/story" },
              { label: "Team", href: "/about/team" },
              { label: "Careers", href: "/about/careers" }
            ]}
          />
          <a href="#contact" className="block px-3 py-2 rounded-full text-base font-medium text-gray-600 hover:text-gray-900">
            Contact
          </a>
          <a href="/login" className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-black/70 transition-colors ease-in-out duration-300">
            Get Demo
          </a>
        </div>
      </div>
    </nav>
  );
};

const NavDropdown = ({ title, items }) => {
  // State declarations
  const [isOpen, setIsOpen] = useState(false);

  // Refs declarations
  const dropdownRef = useRef(null);

  // Handler functions
  const handleTitleClick = (e) => {
    setIsOpen(!isOpen);
    e.preventDefault();
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  // Effect hooks
  useEffect(() => {
    // Effect for handling clicks outside the dropdown to close it
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Component render
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleTitleClick}
        className="group inline-flex items-center px-1 pt-1 text-gray-800 font-medium hover:text-gray-900 transition-colors"
      >
        {title}
        <ChevronDown className={`ml-1 h-4 w-4 group-hover:text-gray-900 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <div className={`absolute z-10 -ml-4 mt-2 w-48 rounded-md bg-transparent transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <div className="py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-lg ring-1 ring-black ring-opacity-5"> {/* Added background and shadow to dropdown */}
          {items.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

const MobileNavItem = ({ title, items }) => {
  // State declarations
  const [isOpen, setIsOpen] = useState(false);

  // Handler functions
  const handleTitleClick = (e) => {
    setIsOpen(!isOpen);
    e.preventDefault();
  };

  // Component render
  return (
    <div>
      <button
        onClick={handleTitleClick}
        className="w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-gray-900"
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <div className={`pl-4 transition-all duration-200 ease-in-out ${isOpen ? 'max-h-36 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        {items.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
};

export default Navbar;