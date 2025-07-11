// src/components/CompanyLandingPage.jsx
import React, { useState, useEffect } from 'react';
import { useAutodeskAuth } from '../utils/useAutodeskAuth';
import { getBackendUrl } from '../utils/urlUtils';
import DLF_Logo from '../assets/companylogos/dlf.svg'; // Example logo, replace with your actual logo
import PS_Logo from '../assets/companylogos/ps.svg'; // Example logo, replace with your actual logo
import logo from '../assets/companylogos/5dvdc.svg'; // Example logo, replace with

// Placeholder for Autodesk logo (you can replace this with your actual SVG)
import ADSK_logo from '../assets/ADSK_light.svg'; // Make sure this path is correct

const logoMap = {
  DLF_Logo: DLF_Logo,
  PS_Logo: PS_Logo,
  logo: logo, // or whatever key your database uses
};

const CompanyLandingPage = () => {
  const { authStatus, errorMsg, login, initialProjects, currentSubdomain } = useAutodeskAuth();
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loadingCompanyDetails, setLoadingCompanyDetails] = useState(true);
  const [companyDetailsError, setCompanyDetailsError] = useState('');

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
  

  // Render loading state for company details
  if (loadingCompanyDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Loading company details...</p>
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

  // Destructure details for easier use
  const { name, logo_url, background_img_url, description } = companyDetails;
  console.log(logo_url)

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4 font-inter bg-cover bg-center"
      style={{ backgroundImage: `url(${background_img_url})` }}
    >
      <div className="bg-white/75 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.3)] rounded-xl p-6 md:pt-7 md:p-10 w-full max-w-4xl border border-white/20 transition duration-700 ease-in-out">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <img src={logoMap[logo_url]} alt={`${name} Logo`} className="h-12" />
        </div>
        {/* Main Content */}
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {name} Notification Center
          </h1>
          <p className="text-gray-600 text-lg mb-10 leading-relaxed">
            {description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
          </p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg shadow-md transition duration-300 flex items-center justify-center gap-3 text-lg mx-auto"
            onClick={login}
            disabled={authStatus === 'authenticating'}
          >
            <span>
              {authStatus === 'authenticating' ? 'Authenticating...' : 'Login with Autodesk'}
            </span>
            <img src={ADSK_logo} alt="Autodesk" className="h-6" />
          </button>

          {/* Authentication Status and Error Messages */}
          {authStatus === 'error' && (
            <div className="mt-4 text-red-600 font-medium">{errorMsg}</div>
          )}
          {authStatus === 'authenticated' && !errorMsg && (
            <div className="mt-4 text-green-600 font-medium">Successfully logged in! Redirecting to workflows page...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyLandingPage;