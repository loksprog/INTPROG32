let currentUser = null;

function navigateTo(hash) {
  window.location.hash = hash;
}

function handleRouting() {
  // Reads the current hush
  let hash = window.location.hash;

  // Set hash to "#/" if empty
  if (!hash) {
    hash = "#/";
  }

  // Extract page name
  let pageName = hash.replace("#/", "");

  // Set home as the default page
  if (pageName === "") {
    pageName = "home";
  }

  // Protected routes
  const protectedRoutes = ["profile", "requests"];
  const adminRoutes = ["employees", "department", "accounts"];

  // Redirects unauthenticated users away from protected routes
  if (protectedRoutes.includes(pageName) && !currentUser) {
    window.location.hash = "#/login";
    return;
  }

  // Blocks non-admins
  if (adminRoutes.includes(pageName) && (!currentUser || currentUser.role !== "admin")) {
    window.location.hash = "#/";
    return;
  }

  // Hides all `.page` elements
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  // Shows the matching page
  const activePage = document.getElementById(pageName + "Page");
  if (activePage) {
    activePage.classList.add("active");
  }
}

// Call handleRouting
window.addEventListener("hashchange", handleRouting);
window.addEventListener("load", handleRouting);
