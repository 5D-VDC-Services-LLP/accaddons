
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBackendUrl } from '../utils/urlUtils';
import axios from 'axios';
import CompanyCard from '../components/company/CompanyCard';


import DLF_Logo from '../assets/react.svg';
import PS_Logo from '../assets/companylogos/ps.svg';
import logo from '../assets/companylogos/5dvdc.svg';
import backgroundImage from '../assets/backgroundImage.png';

const logoMap = {
  DLF_Logo: DLF_Logo,
  PS_Logo: PS_Logo,
  logo: logo, // or whatever key your database uses
};

export default function CompanyGrid() {
  const [loadingIndex, setLoadingIndex] = useState(null);

  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get(`${getBackendUrl()}/api/company/data`, {
          withCredentials: true // Include cookies if needed for auth
        });
        setCompanies(res.data.data); // res.data is { status: 'success', data: [...] }
      } catch (err) {
        console.error('Failed to fetch companies:', err);
      }
    };

    fetchCompanies();
  }, []); // empty dependency array → runs only once after first render
  console.log(companies)

  const handleRedirect = (company, index) => {
  setLoadingIndex(index);
  setTimeout(() => {
    // Construct subdomain URL
    const subdomain = company.subdomain; // e.g., 'dlf'
    const baseDomain = import.meta.env.VITE_DOMAIN || '5daddons.com';

    const protocol = window.location.protocol;
     let port = '';
      if (window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.')) {
          // If on localhost/local IP, use the current port from the browser
          // or a specific dev port if your backend is on a different one for frontend access
          if (window.location.port) {
              port = `:${window.location.port}`;
          }
          // Special handling for localhost with explicit subdomain-like behavior
          // e.g., 5dvdc.localhost:3000 -> 5dvdc.localhost:3000
          // If you want to simulate subdomains on localhost, you'd configure your hosts file.
          // In that case, window.location.hostname would already be '5dvdc.localhost'
          // and baseDomain should be 'localhost'.
          if (baseDomain === 'localhost') {
              window.location.href = `${protocol}//${subdomain}.${baseDomain}${port}/`;
              setLoadingIndex(null);
              return;
          }
      } 
      // For production or any other non-localhost scenario, the port should be omitted for standard ports.
      // Caddy handles the internal 8080.
      
      const url = `${protocol}//${subdomain}.${baseDomain}${port}/`;
      
      window.location.href = url;
      setLoadingIndex(null);
    }, 500);
  };

  return (
    
    <div
      className="min-h-screen flex flex-col bg-gray-100 relative"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(204, 204, 204, 1.8))`,
      }}
    >
      <Navbar />
      <main className="flex-grow pt-32 px-6 py-16 max-w-screen-2xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Our Partners
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-12">
          {companies.map((company, index) => (
            <CompanyCard
              key={company.name}
              logo={logoMap[company.logo_url]}
              slug={company.subdomain}
              loading={loadingIndex === index}
              onClick={() => handleRedirect(company, index)}
            />
          ))}
        </div>
        
      </main>
      <Footer />
    </div>
  );
}