// src/components/CompanyLandingPage.jsx
import React, { useState, useEffect } from 'react';
import { useAutodeskAuth } from '../utils/useAutodeskAuth';
import { getBackendUrl } from '../utils/urlUtils';
import DLF_Logo from '../assets/companylogos/dlf.svg'; 
import PS_Logo from '../assets/companylogos/ps.svg';
import logo from '../assets/companylogos/5dvdc.svg'; 

import DLF_bg from '../assets/backgroundImgs/dlf.svg'; 
import PS_bg from '../assets/backgroundImgs/ps.svg'; 
import bg from '../assets/backgroundImgs/5dvdc.svg';

import ADSK_logo from '../assets/ADSK_light.svg'; 
import { BarLoader } from 'react-spinners';

const logoMap = {
  DLF_Logo: DLF_Logo,
  PS_Logo: PS_Logo,
  logo: logo, 
};

const backgroundMap = {
  DLF_bg: DLF_bg,
  PS_bg: PS_bg,
  bg: bg,
};

const backgroundPositionMap = {
  DLF_bg: 'bottom left',
  PS_bg: 'center center',
  bg: '30% center',
  Ambuja_bg: 'top center',
};

const CompanyLandingPage = () => {
  const { authStatus, errorMsg, login, initialProjects, currentSubdomain } = useAutodeskAuth();
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loadingCompanyDetails, setLoadingCompanyDetails] = useState(true);
  const [companyDetailsError, setCompanyDetailsError] = useState('');
  const [loadingWorkflows, setLoadingWorkflows] = useState(false);

  const backendBaseUrl = getBackendUrl();
    
  // Effect to fetch company details based on subdomain
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      setLoadingCompanyDetails(true);
      setCompanyDetailsError('');
      try {
        // Fetch company details from your backend's new /company/details endpoint
        const response = await fetch(`${backendBaseUrl}/api/company/details`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch company details.');
        }
        const data = await response.json();
        setCompanyDetails(data);
      } catch (err) {
        console.error('Error fetching company details:', err);
        setCompanyDetailsError(`Could not load company details: ${err.message}. Check subdomain and backend.`);
      } finally {
        setLoadingCompanyDetails(false);
      }
    };

    if (currentSubdomain) {
      fetchCompanyDetails();
    } else {
      setLoadingCompanyDetails(false);
      setCompanyDetailsError('No subdomain detected. Please access via a tenant subdomain (e.g., dlf.localhost:8080).');
    }
  }, [currentSubdomain, backendBaseUrl]);

  // Effect to handle post-authentication loading and redirection
  useEffect(() => {
    if (authStatus === 'authenticated' && !errorMsg) {
      // Set loadingWorkflows to true to show the loader
      setLoadingWorkflows(true);
      // In a real application, you would now initiate the fetch for user workflows
      // For demonstration, we'll use a setTimeout to simulate an async operation
      const timer = setTimeout(() => {
        // Here you would typically perform your navigation logic
        // For example: navigate('/dashboard');
        console.log("Simulating workflow loading and redirection to dashboard...");
        // After workflows are loaded and navigation happens, you would set loadingWorkflows(false)
        // This is where you'd redirect to the dashboard page
        // For example, if you use react-router-dom:
        // history.push('/dashboard'); 
      }, 2000); // Simulate 2 seconds of loading

      // Cleanup the timer if the component unmounts or authStatus changes
      return () => clearTimeout(timer);
    } else if (authStatus !== 'authenticating' && authStatus !== 'authenticated') {
      // If authStatus changes to something other than authenticating/authenticated,
      // ensure loadingWorkflows is false. This covers errors or logging out.
      setLoadingWorkflows(false);
    }
  }, [authStatus, errorMsg]);
  

  // Render loading state for company details
  if (loadingCompanyDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <BarLoader color="#000000"/>      
      </div>
    );
  }

  // Render error state for company details
  if (companyDetailsError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100">
        <p className="text-lg text-red-700">Error: {companyDetailsError}</p>
      </div>
    );
  }

  // Render if company details are not found (e.g., subdomain exists but no config in DB)
  if (!companyDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Company details not found for this subdomain.</p>
      </div>
    );
  }

  if (loadingWorkflows) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <BarLoader color="#000000"/>
        </div>
      );
   }

  // Destructure details for easier use
  const { name, logo_url, background_img_url, description } = companyDetails;
  const currentBackgroundImg = backgroundMap[background_img_url];
  const currentBackgroundPosition = backgroundPositionMap[background_img_url] || 'center center'; // Default if not found
  // Determine background size dynamically
  let currentBackgroundSize = 'cover'; // Default to 'cover'
  if (background_img_url === 'bg') { // If the 'bg' image is active
    currentBackgroundSize = '180%'; // Set zoom for this specific image
  }

    return (
    <div className="relative min-h-screen bg-white text-white font-inter overflow-hidden">
      {/* You will import Navbar separately here */}
      {/* <Navbar /> */}

      {/* Diagonal Background Image Container */}
      <div
        className="absolute top-0 right-0 w-3/5 h-full bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${currentBackgroundImg})`,
          backgroundPosition: currentBackgroundPosition, // Apply dynamic position
          backgroundSize: currentBackgroundSize, // Apply dynamic size here
          clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)', // This creates the diagonal cut
        }}
      ></div>

      {/* Main Content Area (Left side) */}
      <div className="relative z-10 flex flex-col items-start justify-center min-h-screen w-full md:w-3/5 p-8 md:p-16">
        {/* Top left Logo */}
        <div className="mb-auto"> {/* This pushes content down */}
          {/* <img src={logoMap['logo']} alt="5DVDC Logo" className="h-16 w-auto" /> */}
        </div>

        {/* Centered Content */}
        <div className="flex flex-col items-start w-full max-w-lg mx-auto md:ml-0 md:mr-auto my-auto text-black">
          <img
            src={logoMap[logo_url]}
            alt={`${name} Logo`}
            className="h-16 mb-6" // Adjusted size and spacing
          />
          <p className="text-gray-700 text-xl font-medium mb-16">
            Your project escalation engine is ready.
          </p>
          <h1 className="text-3xl font-semibold text-gray-900 mb-8">
            Login with Autodesk ID
          </h1>

          <button
            className="bg-black hover:bg-gray-800 text-white font-semibold py-4 px-10 rounded-lg shadow-lg transition duration-300 flex items-center justify-center gap-3 text-lg"
            onClick={login}
            disabled={authStatus === 'authenticating'}
          >
            <img src={ADSK_logo} alt="Autodesk" className="h-6" />
            <span>
              {authStatus === 'authenticating' ? 'Authenticating...' : 'Log In'}
            </span>
          </button>

          {/* Authentication Status and Error Messages */}
          {authStatus === 'error' && (
            <div className="mt-4 text-red-600 font-medium">{errorMsg}</div>
          )}
          {authStatus === 'authenticated' && !errorMsg && (
            <div className="mt-4 text-green-600 font-medium">Successfully logged in! Redirecting to workflows page...</div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto w-full text-left text-gray-500 text-sm">
          <p>© 2025 5D VDC Services LLP All rights reserved. Version 1.x.x</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyLandingPage