// client/src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/companylogos/5dvdc.svg'; // Adjust path as needed
import FooterSmall from '../components/FooterSmall';

const NotFound = () => {
  return (

    <div className="relative flex flex-col min-h-screen bg-white text-gray-800 overflow-hidden">
      <div className="absolute top-4 left-1/2 z-20"> {/* Higher z-index to ensure it's on top */}
        <Link to="/">
          <img src={logo} alt="Company Logo" className="h-12 w-auto" /> {/* Adjust size as needed */}
        </Link>
      </div>

      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
        <h1 className="text-[15rem] sm:text-[20rem] md:text-[25rem] lg:text-[30rem] font-extrabold text-gray-200 opacity-60 leading-none">
          404
        </h1>
       </div>
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow">
        <div className="text-center max-w-lg mx-auto p-8 rounded-lg">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-3">
            Page Not Found
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-6">
             Oops! The page you're looking for doesn't exist or has been moved.
           </p>
           <Link
             to="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 transition-colors duration-300"
           >
             Go to Home Page
           </Link>
         </div>
       </div>
        <FooterSmall />
    </div>
    
   );
 };

export default NotFound;