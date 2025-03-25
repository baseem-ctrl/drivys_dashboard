// Import Firebase and SweetAlert2
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);

const firebaseConfig = {
  apiKey: 'AIzaSyD5mNFJ9qCIE4k1R4sKcFKySsI0ExhUbiU',
  authDomain: 'drivys.firebaseapp.com',
  projectId: 'drivys',
  storageBucket: 'drivys.firebasestorage.app',
  messagingSenderId: '273250833533',
  appId: '1:273250833533:web:2c1ef5d85811c6b5af4d14',
  measurementId: 'G-0XFDTXR2CR',
};

firebase.initializeApp(firebaseConfig);

// Get Firebase messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});