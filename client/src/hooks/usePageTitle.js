// src/hooks/usePageTitle.js
import { useEffect, useState } from 'react';
import { getSubdomain, fetchTenantDetails } from '../services/tenantService';

const usePageTitle = (pageSpecificTitle) => {
  const [fullTitle, setFullTitle] = useState('Loading...'); // Initial placeholder title

  useEffect(() => {
    let active = true; // Flag to prevent state updates on unmounted components

    const updateTitle = async () => {
      const subdomain = getSubdomain();
      let tenantBrandName = '';
      const defaultAppName = 'Your Main Application'; // Default name for the main domain

      if (subdomain) {
        // Attempt to fetch tenant-specific details from your backend
        const tenantConfig = await fetchTenantDetails();
        if (active && tenantConfig && tenantConfig.brandName) {
          tenantBrandName = tenantConfig.brandName;
        } else if (active) {
          // Fallback if tenant config not found but subdomain exists
          // Capitalize the subdomain for a cleaner look if no brand name is found
          tenantBrandName = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);
        }
      } else {
        // No subdomain (e.g., on the main domain like yourdomain.com)
        tenantBrandName = defaultAppName;
      }

      let newTitle = pageSpecificTitle;
      if (tenantBrandName) {
        newTitle = `${pageSpecificTitle} | ${tenantBrandName}`;
      } else {
        // Fallback for cases where no tenant name or default app name is available
        newTitle = `${pageSpecificTitle} | Default App`;
      }

      if (active) {
        document.title = newTitle; // Directly update the browser tab title
        setFullTitle(newTitle);    // Update state if you need to display the title within your component
      }
    };

    updateTitle();

    // Cleanup function: important for preventing memory leaks and race conditions
    return () => {
      active = false;
    };
  }, [pageSpecificTitle]); // Dependency array: re-run effect if pageSpecificTitle changes

  return fullTitle; // Return the constructed title, useful if you want to display it
};

export default usePageTitle;