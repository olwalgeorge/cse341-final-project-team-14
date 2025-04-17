// script.js - Enhanced Authentication Module
document.addEventListener("DOMContentLoaded", function () {
  // Auth module for centralized authentication functions
  const Auth = {
    // Store auth token in localStorage
    setToken: (token) => {
      localStorage.setItem('authToken', token);
    },
    
    // Get stored auth token
    getToken: () => {
      return localStorage.getItem('authToken');
    },
    
    // Remove auth token
    clearToken: () => {
      localStorage.removeItem('authToken');
    },
    
    // Check if user has a valid token
    isLoggedIn: () => {
      return !!Auth.getToken();
    },
    
    // Helper to create auth headers
    getAuthHeaders: () => {
      const token = Auth.getToken();
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    },
    
    // Get current user's profile
    fetchUserProfile: async () => {
      try {
        // Always include credentials to send cookies, regardless of token
        const headers = {
          ...Auth.getAuthHeaders(),
          'Content-Type': 'application/json'
        };
        
        const response = await fetch("/users/profile", {
          headers,
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        return data.data || null;
      } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
    },
    
    // Login handler with retry capability
    login: async (email, password, onSuccess, onError) => {
      UI.showLoading('loginBtn');
      
      try {
        const response = await fetch("/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Store token if provided
          if (data.data && data.data.token) {
            Auth.setToken(data.data.token);
          }
          
          // Fire success callback
          if (onSuccess) {
            onSuccess(data);
          } else {
            // Default success behavior
            window.location.href = "/dashboard.html";
          }
        } else {
          // Handle various error response formats
          const errorMsg = data.message || data.error || "Login failed";
          if (onError) {
            onError(errorMsg);
          } else {
            UI.showError(errorMsg);
          }
        }
      } catch (error) {
        console.error("Login error:", error);
        if (onError) {
          onError("Network error. Please check your connection and try again.");
        } else {
          UI.showError("Network error. Please check your connection and try again.");
        }
      } finally {
        UI.hideLoading('loginBtn');
      }
    },
    
    // Register handler
    register: async (userData, onSuccess, onError) => {
      UI.showLoading('registerBtn');
      
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
          const data = await response.json();
          
          // Store token if provided
          if (data.data && data.data.token) {
            Auth.setToken(data.data.token);
          }
          
          // Fire success callback
          if (onSuccess) {
            onSuccess(data);
          } else {
            // Default success behavior
            window.location.href = "/dashboard.html";
          }
        } else {
          const data = await response.json();
          // Handle various error response formats
          let errorMsg = "Registration failed.";
          
          if (data.error && Array.isArray(data.error)) {
            errorMsg = data.error[0];
          } else if (data.details && data.details.field) {
            errorMsg = `${data.details.field}: ${data.message}`;
          } else if (data.message) {
            errorMsg = data.message;
          }
          
          if (onError) {
            onError(errorMsg);
          } else {
            UI.showError(errorMsg);
          }
        }
      } catch (error) {
        console.error("Registration error:", error);
        if (onError) {
          onError("Network error. Please check your connection and try again.");
        } else {
          UI.showError("Network error. Please check your connection and try again.");
        }
      } finally {
        UI.hideLoading('registerBtn');
      }
    },
    
    // Logout handler
    logout: async () => {
      try {
        await fetch("/auth/logout", {
          method: "POST",
          headers: Auth.getAuthHeaders(),
          credentials: "include"
        });
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        // Always clear local auth data, even if server request fails
        Auth.clearToken();
        window.location.href = "/login.html";
      }
    },
    
    // Validate current auth and redirect if needed
    validateAuth: async (protectedPath = true) => {
      try {
        // Always check with the server first using session cookies
        const profile = await Auth.fetchUserProfile();
        
        // If authenticated by session or profile exists
        if (profile) {
          // We're authenticated by session cookies
          if (protectedPath) {
            // On protected page, we're good to stay
            return true;
          } else {
            // On login/register page but already authenticated, redirect to dashboard
            window.location.href = "/dashboard.html";
            return true;
          }
        } else {
          // Not authenticated by session, try token
          if (protectedPath && Auth.getToken()) {
            // We have a token, try to validate it
            const isValid = await Auth.validateToken();
            if (isValid) {
              return true;
            } else {
              // Invalid token, clear it
              Auth.clearToken();
              window.location.href = "/login.html";
              return false;
            }
          } else if (protectedPath) {
            // No authentication at all on protected page
            window.location.href = "/login.html";
            return false;
          }
        }
        
        // Default case for login/register pages
        return false;
      } catch (error) {
        console.error("Auth validation error:", error);
        if (protectedPath) {
          window.location.href = "/login.html";
        }
        return false;
      }
    },
    
    // Validate if stored token is still valid
    validateToken: async () => {
      try {
        const token = Auth.getToken();
        if (!token) return false;
        
        const response = await fetch("/auth/verify", {
          headers: Auth.getAuthHeaders(),
          credentials: "include"
        });
        
        return response.ok;
      } catch (error) {
        console.error("Token validation error:", error);
        return false;
      }
    }
  };
  
  // UI helper functions
  const UI = {
    showError: (message) => {
      const errorElement = document.querySelector(".error-message");
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = "block";
      }
    },
    
    hideError: () => {
      const errorElement = document.querySelector(".error-message");
      if (errorElement) {
        errorElement.style.display = "none";
      }
    },
    
    showLoading: (buttonId) => {
      const button = document.getElementById(buttonId);
      if (button) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = "Processing...";
      }
    },
    
    hideLoading: (buttonId) => {
      const button = document.getElementById(buttonId);
      if (button) {
        button.disabled = false;
        if (button.dataset.originalText) {
          button.textContent = button.dataset.originalText;
        }
      }
    }
  };
  
  // Validation helper
  const Validator = {
    validateRegistrationData: (userData) => {
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
  };
  
  // Page-specific logic
  const initPageHandlers = () => {
    const path = window.location.pathname;
    
    // Dashboard initialization
    if (path === "/dashboard.html") {
      initDashboard();
    }
    
    // Login page initialization
    if (path === "/login.html") {
      initLoginPage();
    }
    
    // Registration page initialization
    if (path === "/register.html") {
      initRegisterPage();
    }
    
    // Logout page handling
    if (path === "/logout.html") {
      Auth.logout();
    }
    
    // Handle GitHub OAuth redirect
    if (path === "/auth/github/callback") {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      
      if (code) {
        window.location.href = "/dashboard.html";
      }
    }
    
    // Initialize logout button listeners on all pages
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        Auth.logout();
      });
    }
  };
  
  // Dashboard initialization
  async function initDashboard() {
    try {
      // Show loading state
      document.body.classList.add('loading');
      
      // Check authentication status with the server
      const profile = await Auth.fetchUserProfile();
      
      if (profile) {
        // User is authenticated, update the UI
        const userNameElement = document.getElementById("userName");
        if (userNameElement) {
          userNameElement.textContent = profile.fullName || profile.username;
        }
        
        // Additional dashboard initialization can go here
        console.log("Dashboard initialized for user:", profile.username);
        document.body.classList.remove('loading');
      } else {
        // Not authenticated via session, check token
        const isAuthenticated = await Auth.validateAuth(true);
        if (!isAuthenticated) {
          // validateAuth will handle redirection
          return;
        }
      }
    } catch (error) {
      console.error("Dashboard initialization error:", error);
      // If there's an error, still remove loading state
      document.body.classList.remove('loading');
    }
  }
  
  // Login page initialization
  async function initLoginPage() {
    // Check if already authenticated
    await Auth.validateAuth(false);
    
    // Set up login form handler
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        UI.hideError();
        
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        
        Auth.login(email, password);
      });
    }
  }
  
  // Registration page initialization
  async function initRegisterPage() {
    // Check if already authenticated
    await Auth.validateAuth(false);
    
    // Set up registration form handler
    const registerForm = document.querySelector('form[action="/auth/register"]');
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        UI.hideError();
        
        const formData = new FormData(registerForm);
        const userData = Object.fromEntries(formData);
        
        // Client-side validation
        const validationError = Validator.validateRegistrationData(userData);
        if (validationError) {
          UI.showError(validationError);
          return;
        }
        
        Auth.register(userData);
      });
    }
  }
  
  // Initialize all page handlers
  initPageHandlers();
});
