// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0ThQgyDD3WVrhwl5zJCzJkn29tGHfHNY",
  authDomain: "blog-app-4f89c.firebaseapp.com",
  projectId: "blog-app-4f89c",
  storageBucket: "blog-app-4f89c.appspot.com",
  messagingSenderId: "87598508032",
  appId: "1:87598508032:web:b863b9ecb928c16f3c90e5",
  measurementId: "G-FSPVZK7N91"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);