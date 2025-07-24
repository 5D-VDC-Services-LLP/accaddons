// client/src/mocks/handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('http://localhost:8080/api/auth/check', () => {
    return HttpResponse.json({ authenticated: true, user: { first_name: 'Test', last_name: 'User', email: 'test@example.com' } });
  }),
  http.get('http://localhost:3001/api/auth/initial-projects', () => {
    return HttpResponse.json([
      { id: 'mock-proj-1', name: 'Mock Project Alpha' },
      { id: 'mock-proj-2', name: 'Mock Project Beta' },
    ]);
  }),
  http.get('http://localhost:8080/api/acc/projects/:projectId/workflows', ({ params }) => {
    const { projectId } = params;
    if (projectId === 'mock-proj-1') {
      return HttpResponse.json([
        { workflow_id: 'wf1', display_id: 1, workflow_name: 'Workflow A', status: 'active' },
        { workflow_id: 'wf2', display_id: 2, workflow_name: 'Workflow B', status: 'inactive' },
      ]);
    }
    return HttpResponse.json([]);
  }),
];