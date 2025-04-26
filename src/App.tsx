// i18n
import 'src/locales/i18n';
import { useEffect } from 'react';

// scrollbar
import 'simplebar-react/dist/simplebar.min.css';

// lightbox
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import '/node_modules/new-dirham-symbol/dist/uae-symbol.css';
// map
import 'mapbox-gl/dist/mapbox-gl.css';

// editor
import 'react-quill/dist/quill.snow.css';

// carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// image
import 'react-lazy-load-image-component/src/effects/blur.css';

// ----------------------------------------------------------------------

// routes
import Router from 'src/routes/sections';
// theme
import ThemeProvider from 'src/theme';
// locales
import { LocalizationProvider } from 'src/locales';
// hooks
import { useScrollToTop } from 'src/hooks/use-scroll-to-top';
// components
import ProgressBar from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import SnackbarProvider from 'src/components/snackbar/snackbar-provider';
import { SettingsProvider, SettingsDrawer } from 'src/components/settings';
// sections
import { CheckoutProvider } from 'src/sections/checkout/context';
// auth
import { AuthProvider, AuthConsumer } from 'src/auth/context/jwt';
import firebase from 'firebase/compat/app'; // Import Firebase app
import 'firebase/compat/auth'; // Import Firebase auth
import 'firebase/compat/firestore'; // Import Firebase firestore
import 'firebase/compat/storage';
import { generateToken } from './utils/firebase';
// import { AuthProvider, AuthConsumer } from 'src/auth/context/auth0';
// import { AuthProvider, AuthConsumer } from 'src/auth/context/amplify';
// import { AuthProvider, AuthConsumer } from 'src/auth/context/firebase';

// ----------------------------------------------------------------------

export default function App() {
  const is_user_type_school_admin = localStorage.getItem('user_type') === 'SCHOOL_ADMIN';

  // const charAt = `

  // ░░░||||▒▒  ▒▒▒▒
  // ▒▒ ▒▒▒▒ ▒▒
  // ▓▓  ▓▓  ▓▓
  // ██      ██

  // `;

  // console.info(`%c${charAt}`, 'color: #5BE49B');

  useScrollToTop();
  const auth = localStorage.getItem('token');
  useEffect(() => {
    if (auth) {
      generateToken();
    }
  }, [auth]);
  return (
    <AuthProvider>
      <LocalizationProvider>
        <SettingsProvider
          defaultSettings={{
            themeMode: 'light', // 'light' | 'dark'
            themeDirection: 'ltr', //  'rtl' | 'ltr'
            themeContrast: 'default', // 'default' | 'bold'
            themeLayout: 'vertical', // 'vertical' | 'horizontal' | 'mini'
            themeColorPresets: 'default', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
            themeStretch: false,
          }}
        >
          <ThemeProvider>
            <MotionLazy>
              <SnackbarProvider>
                <CheckoutProvider>
                  {/* <SettingsDrawer /> */}
                  <ProgressBar />
                  <AuthConsumer>
                    <Router is_user_type_school_admin={is_user_type_school_admin} />
                  </AuthConsumer>
                </CheckoutProvider>
              </SnackbarProvider>
            </MotionLazy>
          </ThemeProvider>
        </SettingsProvider>
      </LocalizationProvider>
    </AuthProvider>
  );
}
