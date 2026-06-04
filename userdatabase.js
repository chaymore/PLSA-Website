// =========================================================================
// 1. FIREBASE IMPORTS (Including Auth)
// =========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// =========================================================================
// 2. FIREBASE CONFIGURATION & INITIALIZATION (Updated with your real keys!)
// =========================================================================
const firebaseConfig = {
    apiKey: "AIzaSyCgnsXOyfslFAbZ9p2HqUvEp9s1TADjzCo", 
    authDomain: "byu-plsa-website---2026.firebaseapp.com",
    projectId: "byu-plsa-website---2026",
    storageBucket: "byu-plsa-website---2026.firebasestorage.app",
    messagingSenderId: "809387002089",
    appId: "1:809387002089:web:671f78242bfb2c61c0c878",
    measurementId: "G-KGBN870EDX"
  };
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app); // Initialize the Auth engine

// =========================================================================
// 3. DATABASE & AUTH FUNCTIONS
// =========================================================================

/**
 * Creates an authentication account AND a matching database profile
 */
export async function registerNewUser(email, password, fullName, userRole) {
  try {
    // 1. Create the user inside Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Auth Account Created! Secret UID:", user.uid);

    // 2. Use that exact unique UID to create their database profile document
    await setDoc(doc(db, "users", user.uid), {
      name: fullName,
      role: userRole,
      email: email,
      createdAt: new Date()
    });

    console.log("Database Profile Saved successfully under UID!");
    return user;
  } catch (error) {
    console.error("Error during registration:", error.message);
    throw error;
  }
}

/**
 * Logs the user in and automatically pulls their profile data from the database
 */
export async function loginUser(email, password) {
  try {
    // 1. Authenticate the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Login successful! User UID:", user.uid);

    // 2. Fetch their matching database profile using their UID
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      console.log("Profile Data Loaded:", userData);
      
      const welcomeBanner = document.getElementById("welcome-banner");
      if (welcomeBanner) {
        welcomeBanner.innerText = `Welcome back, ${userData.name}! (${userData.role})`;
      }
    } else {
      console.log("No database document found for this user UID.");
    }
  } catch (error) {
    console.error("Login error:", error.message);
    alert("Login failed: " + error.message);
  }
}

// =========================================================================
// 4. BUTTON EVENT LISTENERS (Multi-Page Safe)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const createUserBtn = document.getElementById("createUserBtn");
    const loginBtn = document.getElementById("loginBtn");
  
    // --- Handle Registration (create-account.html) ---
    if (createUserBtn) {
      createUserBtn.addEventListener("click", async () => {
        const email = document.getElementById("emailInput").value.trim();
        const password = document.getElementById("passwordInput").value.trim();
        const name = document.getElementById("nameInput").value.trim();
        const role = document.getElementById("roleInput").value.trim();
  
        if (!email || !password || !name || !role) {
          alert("Please fill out all fields.");
          return;
        }
  
        if (password.length < 6) {
          alert("Password must be at least 6 characters long.");
          return;
        }
  
        try {
          await registerNewUser(email, password, name, role);
          alert("Account and Database Profile created successfully!");
          window.location.href = "../index.html";
        } catch (err) {
          alert("Registration failed: " + err.message);
        }
      });
    }
  
    // --- Handle Login (login.html) ---
    if (loginBtn) {
      loginBtn.addEventListener("click", async () => {
        const email = document.getElementById("emailInput").value.trim();
        const password = document.getElementById("passwordInput").value.trim();
  
        if (!email || !password) {
          alert("Please enter both your email and password.");
          return;
        }
  
        console.log("Searching database for user...");
        await loginUser(email, password);
      });
    
    }
  });
