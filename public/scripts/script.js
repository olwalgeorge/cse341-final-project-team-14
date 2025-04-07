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
          showError(data.message || "Registration failed.");
        }
      } catch (error) {
        console.error("Registration error:", error);
        showError("Registration failed. Please try again.");
      }
    });
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
