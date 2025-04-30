import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase 설정 객체
const firebaseConfig = {
  apiKey: "AIzaSyAiKNqH0PSjeyn6NQYilIAxVo5t-obFAqI",
  authDomain: "bitffy.firebaseapp.com",
  projectId: "bitffy",
  storageBucket: "bitffy.firebasestorage.app",
  messagingSenderId: "984712678922",
  appId: "1:984712678922:web:70f73494d385180e8659f3",
  measurementId: "G-LBEKK66Z2F"
};


// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 서비스 가져오기
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app); // ✅ 스토리지 인스턴스

export {
  auth,
  firestore,
  storage, // ✅ 이거도 export 해야지
  GoogleAuthProvider,
  signInWithPopup,
};
