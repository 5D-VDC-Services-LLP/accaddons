import React from 'react';
import mainLogo from '../../assets/companylogos/5dvdc.svg'; // Assuming this is your primary logo

const CompanyLogoDisplay = ({ subdomain, companyLogo }) => {
  return (
    <div className="flex items-center space-x-4">
      {/* Left: Company Logo */}
      {companyLogo && (
        <img
          src={companyLogo}
          alt={`${subdomain} logo`}
          className="h-12 w-auto bg-white rounded p-0.5" // Reduced padding slightly
        />
      )}
      {/* Right: Only show main logo if NOT on 5dvdc subdomain */}
      {subdomain !== '5dvdc' && (
        <img
          src={mainLogo}
          alt="Main Company Logo"
          className="h-12 w-auto bg-white rounded p-0.5" // Reduced padding slightly
        />
      )}
    </div>
  );
};

export default CompanyLogoDisplay;