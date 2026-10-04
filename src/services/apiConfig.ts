/**
 * Smart URL resolver for Backend API and WebSocket endpoints.
 * Automatically uses the fast local server on port 8080 when running in local development,
 * and seamlessly routes to the production backend (Render) when deployed online (e.g. Vercel).
 */

export const isLocalEnvironment = (): boolean => {
  if (typeof window === 'undefined') return true;
  const h = window.location.hostname;
  return (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h.startsWith('192.168.') ||
    h.startsWith('10.') ||
    h.endsWith('.local')
  );
};

export const getBackendUrl = (): string => {
  if (isLocalEnvironment()) {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `http://${host}:8080`;
  }
  return import.meta.env.VITE_BACKEND_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:8080` : 'http://localhost:8080');
};

export const getWsUrl = (): string => {
  if (isLocalEnvironment()) {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `ws://${host}:8080`;
  }
  return import.meta.env.VITE_WS_URL || (typeof window !== 'undefined' ? `ws://${window.location.hostname}:8080` : 'ws://localhost:8080');
};
