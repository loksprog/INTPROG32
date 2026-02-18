let currentUser = null;

window.db = {
  accounts: [],
};

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
  if (
    adminRoutes.includes(pageName) &&
    (!currentUser || currentUser.role !== "admin")
  ) {
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

// Authentication System
// Registration
const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // Retrieve Inputs
  const reg_firstName = document.getElementById("reg-firstName").value.trim();
  const reg_lastName = document.getElementById("reg-lastName").value.trim();
  const reg_email = document.getElementById("reg-email").value.trim();
  const reg_password = document.getElementById("reg-password").value.trim();

  // Password validation
  if (reg_password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  // Check if the Email already exists
  const isEmailExists = window.db.accounts.find((account) => {
    return account.email === reg_email;
  });

  if (isEmailExists) {
    alert("Email is already registered.");
    return;
  }

  const newAccount = {
    firstName: reg_firstName,
    lastName: reg_lastName,
    email: reg_email,
    password: reg_password,
    role: "employee",
    verified: false,
  };

  // Store email in `localStorage.unverified_email`
  window.db.accounts.push(newAccount);
  localStorage.setItem("unverified_email", reg_email);

  // Navigate to `#/verify-email`
  window.location.hash = "#/verify";
});
