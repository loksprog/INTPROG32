let currentUser = null;

window.db = {
  accounts: [],
};

function navigateTo(hash) {
  window.location.hash = hash;
}

// Get started button
document.getElementById("getStartedBtn").addEventListener("click", () => {
  navigateTo("#/login");
});

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
    navigateTo("#/login");
    return;
  }

  // Blocks non-admins
  if (
    adminRoutes.includes(pageName) &&
    (!currentUser || currentUser.role !== "admin")
  ) {
    navigateTo("#/");
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

  // Verify Page
  if (pageName === "verify") {
    const email = localStorage.getItem("unverified_email");

    if (!email) {
      navigateTo("#/");
      return;
    }

    const showMessage = document.getElementById("verify-message");
    showMessage.textContent = "Verification sent to " + email + ".";
  }

  // Login Page
  if (pageName === "login") {
    const justVerified = localStorage.getItem("just_verified");

    if (justVerified === "true") {
      const alertBox = document.getElementById("verified-alert");
      alertBox.classList.remove("d-none");

      localStorage.removeItem("just_verified");
    }
  }
}

// Call handleRouting
window.addEventListener("hashchange", handleRouting);
window.addEventListener("load", () => {
  const authToken = localStorage.getItem("auth_token");

  if (authToken) {
    // Find user with this email
    const user = window.db.accounts.find((acc) => {
      return acc.email === authToken;
    });

    if (user && user.verified) {
      setAuthState(true, user);
    } else {
      localStorage.removeItem("auth_token");
      setAuthState(false);
    }
  } else {
    setAuthState(false);
  }

  handleRouting();
});

// ======================
// Authentication System
// ======================
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

  window.db.accounts.push(newAccount);

  // Store email in `localStorage.unverified_email` (after registration)
  localStorage.setItem("unverified_email", reg_email);

  // Navigate to `#/verify-email`
  navigateTo("#/verify");
});

// Email Verification (Simulated)
const simulateBtn = document.getElementById("simulateBtn");

simulateBtn.addEventListener("click", () => {
  // Get stored Email
  const storedEmail = localStorage.getItem("unverified_email");

  if (!storedEmail) {
    alert("No email to verify!");
  }

  const account = window.db.accounts.find((acc) => {
    return acc.email === storedEmail;
  });

  if (!account) {
    alert("Account not found.");
    return;
  }

  // Mark Email as verified
  account.verified = true;

  // Flag
  localStorage.setItem("just_verified", "true");

  // remove email from LS
  localStorage.removeItem("unverified_email");

  // Redirect to login
  navigateTo("#/login");
});

// Login
const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const loginEmail = document.getElementById("login-email").value.trim();
  const loginPassword = document.getElementById("login-password").value.trim();

  const account = window.db.accounts.find((acc) => {
    return (
      acc.email === loginEmail &&
      acc.password === loginPassword &&
      acc.verified === true
    );
  });

  // Check if account exists
  if (!account) {
    alert("Invalid credentials or account not verified.");
    return;
  }

  // Save auth token to localStorage
  localStorage.setItem("auth_token", loginEmail);

  // Set authentication state
  setAuthState(true, account);

  // Redirect to profile page
  navigateTo("#/profile");
});

// Auth State Management
function setAuthState(isAuth, user) {
  if (isAuth) {
    currentUser = user;

    // Update body classes
    document.body.classList.remove("not-authenticated");
    document.body.classList.add("authenticated");

    // Check if admin
    if (user && user.role === "admin") {
      document.body.classList.add("is-admin");
    } else {
      document.body.classList.remove("is-admin");
    }
  } else {
    // user logged out
    currentUser = null;
    document.body.classList.remove("authenticated", "is-admin");
    document.body.classList.add("not-authenticated");
  }
}

// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("auth_token");
  setAuthState(false);
  navigateTo("#/");
});

// ===================================
// Data Persistence with localStorage
// ===================================

const STORAGE_KEY = "ipt_demo_v1";

function loadFromStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    try {
      window.db = JSON.parse(stored);
    } catch (error) {
      console.error("Corrupt data, seeding defaults");
      seedDefaultData();
    }
  } else {
    seedDefaultData();
  }
}

function seedDefaultData() {
  window.db = {
    accounts: [
      {
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        password: "Password123!",
        role: "admin",
        verified: true,
      },
    ],
    departments: [
      { id: 1, name: "Engineering", description: "Software development" },
      { id: 2, name: "HR", description: "Human Resources" },
    ],
    employees: [],
    requests: [],
  };

  saveToStorage();
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));
}

loadFromStorage();
