
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
    const baseDomain = window.location.hostname
      .replace(/^([^.]+\.)?/, ''); // removes any existing subdomain
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    // For localhost, you may need to use a hosts file or a dev proxy for subdomains
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