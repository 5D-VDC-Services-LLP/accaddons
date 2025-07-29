// // // // src/utils/urlUtils.js
// export function getBackendUrl() {
//   const protocol = import.meta.env.VITE_PROTOCOL || 'http';
//   const domain = import.meta.env.VITE_DOMAIN || '5daddons.com';
//   const port = import.meta.env.VITE_PORT || '8080';
//   const subdomain = window.location.hostname.split('.')[0];
//   let hostname = domain;
//   if (subdomain && subdomain !== '5daddons') {
//     hostname = `${subdomain}.${domain}`;
//   }
//   const omitPort = (protocol === 'https' && port === '443') || (protocol === 'http' && port === '80');
//   return `${protocol}://${hostname}${omitPort ? '' : `:${port}`}`;
// }


// src/utils/urlUtils.js
export function getBackendUrl() {
  // Use the browser's current protocol, which Caddy handles
  const protocol = window.location.protocol.replace(':', ''); // 'http' or 'https'
  
  const domain = import.meta.env.VITE_DOMAIN || '5daddons.com';
  
  // Use VITE_DEV_BACKEND_PORT for development, otherwise assume standard ports for production
  // This environment variable should ONLY be set in your .env.development file
  const devPort = import.meta.env.VITE_PORT; 

  const subdomain = window.location.hostname.split('.')[0];
  let hostname = domain;

  // This check is good for distinguishing between root and subdomain access
  // '5daddons' might be specific to your root domain's first part
  if (subdomain && subdomain !== '5daddons' && !window.location.hostname.includes(domain)) {
      // If the hostname is a subdomain, and it's not just the root domain without a subdomain part
      // AND it's not already the full domain (e.g., if domain is "example.com" and hostname is "sub.example.com")
      hostname = window.location.hostname; // Use the full hostname from the browser
  } else if (subdomain && subdomain !== '5daddons') {
      // Fallback for cases where window.location.hostname doesn't contain the full domain
      hostname = `${subdomain}.${domain}`;
  }


  // Determine if a port should be appended
  let backendPort = '';
  if (devPort) {
      // In development, use the specified dev port
      backendPort = `:${devPort}`;
  } else {
      // In production (or when no devPort), only append port if it's non-standard
      // window.location.port will be empty string for 80/443
      if (window.location.port && (window.location.port !== '80' && window.location.port !== '443')) {
          backendPort = `:${window.location.port}`;
      }
  }

  // Final check: if we're dealing with localhost, ensure the dev port is used
  if (window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.')) {
      if (devPort) {
          return `${protocol}://${window.location.hostname}:${devPort}`;
      }
      // If no devPort and on localhost, assume standard backend port if not 80/443
      // or let it be without port if 80/443 or specific test setup
      return `${protocol}://${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;
  }

  return `${protocol}://${hostname}${backendPort}`;
}