/**
 * MAIN ENTRY POINT - APPLICATION BOOTSTRAP
 * 
 * This file is the entry point for the React application.
 * It handles the initial setup and rendering of the root component.
 * 
 * KEY RESPONSIBILITIES:
 * - React application initialization
 * - Root component mounting
 * - Development mode configuration
 * - CSS imports and global styles
 * - Internationalization setup
 * 
 * PRODUCTION CONSIDERATIONS:
 * - StrictMode helps catch potential issues in development
 * - Can be enhanced with error boundaries
 * - Performance monitoring can be added here
 * - Service worker registration for PWA features
 * 
 * SCALABILITY NOTES:
 * - Easy to add global providers (Redux, Context, etc.)
 * - Error tracking services can be initialized here
 * - Analytics and monitoring setup location
 * - Feature flags and configuration loading
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import ErrorBoundary from './components/ui/ErrorBoundary';
import App from './App.tsx';
import './index.css';  // Global styles including Tailwind CSS

// INTERNATIONALIZATION SETUP
// Import i18n configuration to initialize translations
import './i18n';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

/**
 * APPLICATION INITIALIZATION
 * 
 * Creates the React root and renders the main App component.
 * StrictMode helps identify potential problems in development.
 * 
 * The i18n import above ensures that internationalization is set up
 * before the app renders, enabling immediate translation support.
 * 
 * The App component is wrapped with AuthProvider to provide
 * authentication context throughout the application.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);

/**
 * FUTURE ENHANCEMENTS:
 * 
 * 1. Error Boundary Wrapper:
 *    <ErrorBoundary fallback={<ErrorFallback />}>
 *      <App />
 *    </ErrorBoundary>
 * 
 * 2. Global State Provider:
 *    <Provider store={store}>
 *      <App />
 *    </Provider>
 * 
 * 3. Theme Provider:
 *    <ThemeProvider theme={theme}>
 *      <App />
 *    </ThemeProvider>
 * 
 * 4. Performance Monitoring:
 *    import { initializePerformanceMonitoring } from './utils/performance';
 *    initializePerformanceMonitoring();
 * 
 * 5. Service Worker Registration:
 *    if ('serviceWorker' in navigator) {
 *      navigator.serviceWorker.register('/sw.js');
 *    }
 * 
 * 6. Language Detection Enhancement:
 *    import { detectUserLanguage } from './utils/language';
 *    detectUserLanguage();
 */