import * as Sentry from '@sentry/react';
import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
//
import App from './App';
import './index.css';
import { GoogleMapsProvider } from './sections/overview/e-commerce/GoogleMapsProvider';

// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
Sentry.init({
  dsn: 'https://1348ccae390e48bf837387f039b58844@o4507516184821760.ingest.us.sentry.io/4508884439793664',
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [
    'localhost',
    'https://admin.drivys.mvp-apps.ae/',
    'https://drivys.mvp-apps.ae/',
  ],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

root.render(
  <HelmetProvider>
    <BrowserRouter>
      <Suspense>
        <GoogleMapsProvider>
          <App />
        </GoogleMapsProvider>
      </Suspense>
    </BrowserRouter>
  </HelmetProvider>
);
