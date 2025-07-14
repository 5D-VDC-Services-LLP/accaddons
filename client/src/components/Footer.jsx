import React from 'react';
import FooterLogo from '../assets/2.svg'; // Ensure this path is correct

const Footer = () => {
  return (
    <footer className="bg-black text-white font-lato py-12 px-6 sm:px-12 lg:px-24 xl:px-32 2xl:px-48 3xl:px-64">
      <div className="max-w-7xl mx-auto flex justify-between items-start">
        {/* Left side - Logo container */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-transparent">
            {/* Logo image will be placed here */}
            <img 
              src={FooterLogo} 
              alt="5DVDC Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Right side - Contact information */}
        <div className="text-right">
          <h3 className="text-2xl font-semibold mb-4">Connect with us</h3>
          <div className="space-y-2 text-sm">
            <div>
              <a 
                href="https://5dvdc.com" 
                className="hover:text-gray-300 transition-colors"
                target="_blank" // Open in new tab
                rel="noopener noreferrer" // Security best practice for target="_blank"
              >
                5dvdc.com
              </a>
            </div>
            <div>
              <a 
                href="https://www.linkedin.com/company/5d-vdc-services" // Assuming a LinkedIn page for a more relevant link
                className="hover:text-gray-300 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                5D VDC Services (LinkedIn)
              </a>
            </div>
            <div>
              <a 
                href="mailto:contact@5dvdc.com" 
                className="hover:text-gray-300 transition-colors"
              >
                contact@5dvdc.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-800 flex justify-between items-center text-sm">
        <div>
          © {new Date().getFullYear()} 5DVDC. All rights reserved
        </div>
        <div className="flex space-x-6">
          <a 
            href="/terms" 
            className="hover:text-gray-300 transition-colors"
          >
            Terms of Service
          </a>
          <a 
            href="/privacy" 
            className="hover:text-gray-300 transition-colors"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;