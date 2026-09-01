// protect-page.js
// Add to any page that should only be reachable when signed in with the
// right role, e.g. Members/portal.html. This is a UX convenience — it
// redirects people away — not real security. The actual protection is
// that any sensitive content lives in Firestore and is only fetched
// after this check passes (see Firestore Rules).
//
// <script type="module" src="../protect-page.js" data-min-role="member"></script>

import { auth, db } from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// document.currentScript is unreliable inside type="module" scripts,
// so find the tag by matching its src instead.
const thisScript = document.querySelector('script[src$="protect-page.js"]');
const minRole = thisScript?.dataset.minRole || "member"; // "member" or "officer"
const REDIRECT_TO = "/Restricted/restricted.html";

const rank = { guest: 0, pending: 0, member: 1, officer: 2 };

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = REDIRECT_TO;
    return;
  }
  const snap = await getDoc(doc(db, "users", user.uid));
  const role = snap.exists() ? snap.data().role : "guest";

  if (rank[role] < rank[minRole]) {
    window.location.href = REDIRECT_TO;
    return;
  }

  // Passed the check — reveal the page (see matching CSS: body starts hidden)
  document.body.classList.add("auth-ready");
});