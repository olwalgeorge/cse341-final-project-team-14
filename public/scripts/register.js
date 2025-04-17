// register.js - Registration page specific functionality
document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.querySelector('form[action="/auth/register"]');
  
  if (registerForm) {
    // Focus on first input when page loads
    const firstInput = registerForm.querySelector('input');
    if (firstInput) {
      firstInput.focus();
    }
    
    // Password strength indicator
    const passwordInput = document.getElementById("password");
    const strengthIndicator = document.createElement("div");
    strengthIndicator.className = "password-strength";
    
    if (passwordInput) {
      // Insert strength indicator after password input
      passwordInput.parentNode.insertBefore(strengthIndicator, passwordInput.nextSibling);
      
      passwordInput.addEventListener("input", function() {
        updatePasswordStrength(this.value);
      });
    }
    
    function updatePasswordStrength(password) {
      // Simple password strength calculation
      let strength = 0;
      
      // Length check
      if (password.length >= 8) strength += 1;
      if (password.length >= 12) strength += 1;
      
      // Character type checks
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[a-z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;
      
      // Special character count
      const specialChars = password.match(/[^A-Za-z0-9]/g) || [];
      if (specialChars.length > 2) strength += 1;
      
      // Update visual indicator
      let strengthClass = "";
      let strengthText = "";
      
      if (password.length === 0) {
        strengthClass = "";
        strengthText = "";
      } else if (strength < 4) {
        strengthClass = "weak";
        strengthText = "Weak";
      } else if (strength < 6) {
        strengthClass = "medium";
        strengthText = "Medium";
      } else {
        strengthClass = "strong";
        strengthText = "Strong";
      }
      
      strengthIndicator.className = `password-strength ${strengthClass}`;
      strengthIndicator.textContent = strengthText;
    }
    
    // Real-time validation feedback
    const validateInput = function(input, validationFunction) {
      const errorSpan = document.createElement("span");
      errorSpan.className = "field-error";
      input.parentNode.appendChild(errorSpan);
      
      input.addEventListener("blur", function() {
        const error = validationFunction(this.value);
        if (error) {
          errorSpan.textContent = error;
          errorSpan.style.display = "block";
          input.classList.add("invalid");
        } else {
          errorSpan.style.display = "none";
          input.classList.remove("invalid");
        }
      });
      
      // Clear error on focus
      input.addEventListener("focus", function() {
        errorSpan.style.display = "none";
        input.classList.remove("invalid");
      });
    };
    
    // Username validation
    const usernameInput = document.getElementById("username");
    if (usernameInput) {
      validateInput(usernameInput, function(value) {
        if (!value) return "Username is required";
        if (value.length < 3) return "Username must be at least 3 characters";
        if (value.length > 20) return "Username must be less than 20 characters";
        if (/^\d/.test(value)) return "Username cannot start with a number";
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Username can only contain letters, numbers, and underscores";
        return null;
      });
    }
    
    // Email validation
    const emailInput = document.getElementById("email");
    if (emailInput) {
      validateInput(emailInput, function(value) {
        if (!value) return "Email is required";
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(value)) return "Please enter a valid email address";
        return null;
      });
    }
    
    // Password confirmation matching
    const confirmPasswordInput = document.getElementById("confirmPassword");
    if (confirmPasswordInput && passwordInput) {
      validateInput(confirmPasswordInput, function(value) {
        if (!value) return "Please confirm your password";
        if (value !== passwordInput.value) return "Passwords do not match";
        return null;
      });
    }
    
    // Show password toggle
    const showPasswordToggle = document.getElementById("showPassword");
    if (showPasswordToggle && passwordInput) {
      showPasswordToggle.addEventListener("click", function() {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        if (confirmPasswordInput) {
          confirmPasswordInput.setAttribute("type", type);
        }
        showPasswordToggle.textContent = type === "password" ? "Show" : "Hide";
      });
    }
  }
});