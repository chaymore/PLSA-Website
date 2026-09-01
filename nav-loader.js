// nav-loader.js
// Add ONE line to every page instead of copy-pasting the nav:
//   <div id="nav-placeholder"></div>
//   <script type="module" src="/nav-loader.js"></script>
//
// This fetches /navigation.html, drops it in, marks the current page's
// nav link as active, and only THEN loads auth.js — so auth.js always
// finds the nav elements it needs to toggle.
//
// NOTE: fetch() to a local file needs an actual server (Live Server,
// `python3 -m http.server`, your real host, etc.) — it will not work
// if you just double-click index.html and open it as a file:// URL.

async function loadNav() {
    const placeholder = document.getElementById("nav-placeholder");
    if (!placeholder) return;
  
    const response = await fetch("/navigation.html");
    const html = await response.text();
    placeholder.outerHTML = html;
  
    const currentPath = window.location.pathname;
    document.querySelectorAll(".nav-links a[href]").forEach((link) => {
      if (link.getAttribute("href") === currentPath) {
        link.setAttribute("aria-current", "page");
      }
    });
  }
  
  await loadNav();
  await import("/auth.js");