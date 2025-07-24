import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// Load test data (e.g., project IDs, dynamic subdomains if your backend needs them)
// For local testing, you might define these directly or use environment variables.
const projectData = new SharedArray('ACC Project Data', function () {
  // Replace with actual project IDs from your ACC Sandbox
  return JSON.parse(open('./projects.json')).projects;
});

// Environment variables (set when running k6)
// k6 run --env CLIENT_ID=YOUR_CLIENT_ID --env CLIENT_SECRET=YOUR_CLIENT_SECRET --env BACKEND_URL=http://localhost:8080 server/load-tests/acc-api-test.js
// Note: BACKEND_URL should point to your local Node.js server.
const CLIENT_ID = __ENV.CLIENT_ID;
const CLIENT_SECRET = __ENV.CLIENT_SECRET;
const BACKEND_URL = 'http://5dvdc.localhost:8080';

console.log(`Client ID: ${CLIENT_ID}`);
console.log(`Client Secret: ${CLIENT_SECRET}`);
console.log(`Backend URL: ${BACKEND_URL}`);

// This function runs once before all VUs start.
// It's used to set up global data, like fetching an OAuth token.
export function setup() {
  console.log('Fetching ACC OAuth Token...');
  const authRes = http.post('https://developer.api.autodesk.com/authentication/v2/authorize',
    {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      scope: 'data:read account:read' // Adjust scopes as needed
    },
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  check(authRes, {
    'ACC Auth successful': (r) => r.status === 200,
  });

  if (authRes.status !== 200) {
    console.error(`Failed to get ACC token: ${authRes.status} - ${authRes.body}`);
    throw new Error('Failed to acquire ACC access token');
  }

  const token = JSON.parse(authRes.body).access_token;
  console.log('ACC OAuth Token acquired.');
  return { accToken: token }; // Return the token to be used in default function
}

// This is the main script executed by each virtual user.
export default function (data) {
  const accToken = data.accToken; // ACC token from setup()
  const currentProject = projectData[__VU % projectData.length]; // Cycle through projects

  // Headers for your backend API calls.
  // Your backend might have its own authentication, or rely on the ACC token.
  // For this example, we're assuming your backend might need the ACC token
  // to forward it or for its own validation. Adjust as per your backend's auth.
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accToken}` // Pass ACC token to your backend if it needs it
  };

  let res;

  // --- Simulate User Journey: Fetch Issues ---
  console.log(`VU ${__VU}: Fetching issues for project ${currentProject.id}`);
  res = http.get(`${BACKEND_URL}/api/acc/projects/${currentProject.id}/issues`, { headers });
  check(res, {
    'Get Issues API status is 200': (r) => r.status === 200,
    'Get Issues response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  // Example of handling 429 rate limits from your backend (which might be due to ACC)
  if (res.status === 429) {
    console.warn(`VU ${__VU}: Received 429 for issues API. Retrying after ${res.headers['Retry-After']} seconds.`);
    sleep(parseInt(res.headers['Retry-After'] || '10')); // Sleep for Retry-After seconds
    return; // Stop this iteration for this VU and let it try again in the next iteration
  }

  // --- Simulate User Journey: Create a Form (if applicable) ---
  // You might want to create a form if your application allows.
  // Ensure you have valid data for the form.
  // For simplicity, let's assume we're just reading for now.
  // If creating, ensure unique data or cleanup strategy.
  // res = http.post(`${BACKEND_URL}/api/acc/projects/${currentProject.id}/forms`, JSON.stringify({
  //   // ... form data ...
  // }), { headers });
  // check(res, {
  //   'Create Form API status is 201': (r) => r.status === 201,
  // });

  // --- Simulate User Journey: Fetch Reviews ---
  console.log(`VU ${__VU}: Fetching reviews for project ${currentProject.id}`);
  res = http.get(`${BACKEND_URL}/api/acc/projects/${currentProject.id}/reviews`, { headers });
  check(res, {
    'Get Reviews API status is 200': (r) => r.status === 200,
    'Get Reviews response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  // Realistic user think time
  sleep(Math.random() * 5 + 5); // Sleep between 5 and 10 seconds
}

// Global options for the test run
export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp-up to 50 users in 1 minute
    { duration: '3m', target: 100 }, // Stay at 100 users for 3 minutes (Normal load)
    { duration: '1m', target: 200 }, // Spike to 200 users in 1 minute
    { duration: '1m', target: 100 }, // Ramp down to 100 users
    { duration: '1m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% of requests must complete within 3 seconds
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
  },
  ext: {
    // You can configure cloud execution here if needed, but for local, it's not.
    // loadimpact: {
    //   projectID: 123456,
    //   name: 'ACC API Load Test',
    // },
  },
};