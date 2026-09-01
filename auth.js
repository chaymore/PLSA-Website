// auth.js
// Include this on EVERY page (with type="module") so the nav updates everywhere.
// <script type="module" src="/auth.js"></script>  (adjust the path per page, e.g. ../auth.js)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();
// Optional: restrict sign-in to BYU accounts only
// provider.setCustomParameters({ hd: "byu.edu" });

// ---- Public actions, callable from your nav buttons ----

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Create a users/{uid} doc on first sign-in if it doesn't exist yet.
  // New sign-ups default to "pending" — an officer promotes them to
  // "member" or "officer" manually in the Firestore console.
  const userRef = doc(db, "users", user.uid);
  const existing = await getDoc(userRef);
  if (!existing.exists()) {
    await setDoc(userRef, {
      name: user.displayName,
      email: user.email,
      role: "pending",
      createdAt: serverTimestamp()
    });
  }
}

export async function logout() {
  await signOut(auth);
}

// ---- Fetch the signed-in user's role from Firestore ----

async function getRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().role : "guest";
}

// ---- Wire up the nav on every page load ----

function setVisible(el, visible) {
  if (el) el.style.display = visible ? "" : "none";
}

onAuthStateChanged(auth, async (user) => {
  const joinLink = document.querySelector(".join-link");
  const loginLink = document.querySelector(".login-link");
  const nameLink = document.getElementById("account-name");
  const logoutLink = document.getElementById("logout-link");
  const memberEls = document.querySelectorAll("[data-visible-to='member']");
  const officerEls = document.querySelectorAll("[data-visible-to='officer']");

  if (!user) {
    setVisible(joinLink, true);
    setVisible(loginLink, true);
    setVisible(nameLink, false);
    setVisible(logoutLink, false);
    memberEls.forEach((el) => setVisible(el, false));
    officerEls.forEach((el) => setVisible(el, false));
    return;
  }

  const role = await getRole(user.uid);
  const isMember = role === "member" || role === "officer";
  const isOfficer = role === "officer";

  setVisible(joinLink, false);
  setVisible(loginLink, false);
  if (nameLink) {
    nameLink.textContent = user.displayName?.split(" ")[0] || "Account";
    setVisible(nameLink, true);
  }
  setVisible(logoutLink, true);
  memberEls.forEach((el) => setVisible(el, isMember));
  officerEls.forEach((el) => setVisible(el, isOfficer));
});

// Expose to inline onclick handlers if you're not using modules everywhere
window.plsaLogin = loginWithGoogle;
window.plsaLogout = logout;