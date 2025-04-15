// script.js
document.addEventListener("DOMContentLoaded", function () {
  // Update dashboard path check
  if (window.location.pathname === "/dashboard.html") {
    checkAuthAndLoadDashboard();
  }

  // Handle login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }

  // Handle register form
  const registerForm = document.querySelector('form[action="/auth/register"]');
  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(registerForm);
      const userData = Object.fromEntries(formData);
      
      // Client-side validation before sending to server
      const validationError = validateRegistrationData(userData);
      if (validationError) {
        showError(validationError);
        return;
      }

      try {
        const response = await fetch("/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
          credentials: "include",
        });

        if (response.ok) {
          window.location.href = "/dashboard.html";
        } else {
          const data = await response.json();
          
          // Enhanced error handling for various response formats
          if (data.error && Array.isArray(data.error)) {
            // Handle array of errors
            showError(data.error[0]);
          } else if (data.details && data.details.field) {
            // Handle field-specific error
            showError(`${data.details.field}: ${data.message}`);
          } else {
            // Handle general error message
            showError(data.message || "Registration failed.");
          }
        }
      } catch (error) {
        console.error("Registration error:", error);
        showError("Registration failed. Please try again.");
      }
    });
  }

  // Function to validate registration data client-side
  function validateRegistrationData(userData) {
    // Check for missing required fields
    if (!userData.email || !userData.password || !userData.username || !userData.fullName) {
      return "All fields are required";
    }
    
    // Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(userData.email)) {
      return "Please enter a valid email address";
    }
    
    // Username format validation
    if (/^\d/.test(userData.username)) {
      return "Username cannot start with a number";
    }
    
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(userData.username)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    
    if (userData.username.length < 3 || userData.username.length > 20) {
      return "Username must be between 3 and 20 characters";
    }
    
    // Password complexity validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/;
    if (!passwordRegex.test(userData.password)) {
      return "Password must contain at least one lowercase letter, one uppercase letter, one number, one special character, and be 8-50 characters long";
    }
    
    // Full name validation
    if (userData.fullName.length < 2 || userData.fullName.length > 100) {
      return "Full name must be between 2 and 100 characters";
    }
    
    return null; // No validation errors
  }

  // Handle GitHub OAuth redirect
  if (window.location.pathname === "/auth/github/callback") {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      window.location.href = "/dashboard.html";
    }
  }

  async function checkAuthAndLoadDashboard() {
    try {
      const response = await fetch("/users/profile", {
        credentials: "include",
      });

      if (!response.ok) {
        window.location.href = "/login.html";
        return;
      }

      const data = await response.json();
      if (data.data) {
        const userNameElement = document.getElementById("userName");
        if (userNameElement) {
          userNameElement.textContent =
            data.data.fullName || data.data.username;
        }
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      window.location.href = "/login.html";
    }
  }

  function showError(message) {
    const errorElement = document.querySelector(".error-message");
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        window.location.href = "/dashboard.html";
      } else {
        const data = await response.json();
        showError(data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      showError("An error occurred. Please try again.");
    }
  }
});
