// login.js - Login page specific functionality
document.addEventListener("DOMContentLoaded", function () {
  // Add login page animations and interactions here
  const loginForm = document.getElementById("loginForm");
  
  if (loginForm) {
    // Focus on email input when page loads
    const emailInput = document.getElementById("email");
    if (emailInput) {
      emailInput.focus();
    }
    
    // Show/hide password functionality
    const passwordInput = document.getElementById("password");
    const showPasswordToggle = document.getElementById("showPassword");
    
    if (passwordInput && showPasswordToggle) {
      showPasswordToggle.addEventListener("click", function() {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        showPasswordToggle.textContent = type === "password" ? "Show" : "Hide";
      });
    }
    
    // Check if there's a return URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get("returnUrl");
    
    // If there's a successful login via script.js, this will be called
    window.onLoginSuccess = function(data) {
      if (returnUrl) {
        window.location.href = returnUrl;
      } else {
        window.location.href = "/dashboard.html";
      }
    };

    // Smooth transitions on form actions
    loginForm.querySelectorAll("input").forEach(input => {
      // Add focus/blur animations
      input.addEventListener("focus", function() {
        this.closest(".form-group").classList.add("focused");
      });
      
      input.addEventListener("blur", function() {
        if (this.value === "") {
          this.closest(".form-group").classList.remove("focused");
        }
      });
    });
  }
});