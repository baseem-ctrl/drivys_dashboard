import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { updateFcm } from 'src/api/notification';
import { showAlert } from './show_alert';

const firebaseConfig = {
  apiKey: 'AIzaSyD5mNFJ9qCIE4k1R4sKcFKySsI0ExhUbiU',
  authDomain: 'drivys.firebaseapp.com',
  projectId: 'drivys',
  storageBucket: 'drivys.firebasestorage.app',
  messagingSenderId: '273250833533',
  appId: '1:273250833533:web:2c1ef5d85811c6b5af4d14',
  measurementId: 'G-0XFDTXR2CR',
};
const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);

export const generateToken = async () => {
  if (typeof window !== 'undefined') {
    // Check if the current environment supports Notifications and user gesture is available
    const canRequestPermission =
      'Notification' in window && 'requestPermission' in window.Notification;

    if (canRequestPermission) {
      try {
        // Request permission for notifications in response to a user gesture
        await window.Notification.requestPermission();
        const permission = window.Notification.permission;
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: import.meta.env.APP_PUSH_NOTIFI_KEY,
          });
          console.log('FcmToken', token);

          // Check if token exists before attempting to update it
          if (token) {
            const res = await updateFcm(token);
          } else {
            console.log('FCM token does not exist.');
          }
        } else {
          console.log('Notification permission not granted.');
          localStorage.setItem('notifications', []);
        }
      } catch (error) {
        // Check if the error is related to token unsubscribe
        if (error.code === 'messaging/token-unsubscribe-failed') {
          console.log('Error unsubscribing from FCM:', error.message);
        } else {
          console.error('Error requesting permission or generating token:', error);
        }
      }
    } else {
      console.log('Notification API not supported or requestPermission method not available.');
    }
  }
};

onMessage(messaging, (payload) => {
  const title = payload?.notification?.title;
  const body = payload?.notification?.body;
  console.log('Message received. ', payload);

  // const { enqueueSnackbar } = useSnackbar();
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
    });
  } else {
    console.warn('Notification permission not granted.');
  }

  let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  notifications.push({ title, body, timestamp: new Date().toISOString() });

  if (notifications.length > 20) {
    notifications = notifications.slice(-20); // Keep the last 20 notifications
  }

  // ✅ Store the updated notifications in localStorage
  localStorage.setItem('notifications', JSON.stringify(notifications));
  // enqueueSnackbar(title, { variant: 'success' });
  showAlert(title, body);
});
