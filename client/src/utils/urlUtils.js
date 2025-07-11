// // // src/utils/urlUtils.js
export function getBackendUrl() {
  const protocol = import.meta.env.VITE_PROTOCOL || 'http';
  const domain = import.meta.env.VITE_DOMAIN || 'localhost';
  const port = import.meta.env.VITE_PORT || '8080';
  const subdomain = window.location.hostname.split('.')[0];
  let hostname = domain;
  if (subdomain && subdomain !== 'localhost') {
    hostname = `${subdomain}.${domain}`;
  }
  const omitPort = (protocol === 'https' && port === '443') || (protocol === 'http' && port === '80');
  return `${protocol}://${hostname}${omitPort ? '' : `:${port}`}`;
}