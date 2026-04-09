// Get DOM elements
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

// Panel switching functionality
if (signUpButton) {
    signUpButton.addEventListener('click', () => {
        container.classList.add("right-panel-active");
    });
}

if (signInButton) {
    signInButton.addEventListener('click', () => {
        container.classList.remove("right-panel-active");
    });
}

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeForms();
    setupSocialButtons();
    checkExistingSession();
});

// Initialize form handlers
function initializeForms() {
    const signInForm = document.querySelector('.sign-in-container form');
    const signUpForm = document.querySelector('.sign-up-container form');
    
    // Prevent default link behavior for "Enter Campus" button
    const enterCampusLink = document.querySelector('.sign-in-container button a');
    if (enterCampusLink) {
        enterCampusLink.addEventListener('click', function(e) {
            e.preventDefault();
        });
    }
    
    // Sign In Form Handler
    if (signInForm) {
        signInForm.addEventListener('submit', handleSignIn);
    }
    
    // Sign Up Form Handler
    if (signUpForm) {
        signUpForm.addEventListener('submit', handleSignUp);
    }
}

// Handle Sign In
function handleSignIn(e) {
    e.preventDefault();
    
    const email = this.querySelector('input[type="email"]').value.trim();
    const password = this.querySelector('input[type="password"]').value;
    
    // Clear previous errors
    clearErrorStates(this);
    
    // Validate inputs
    if (!validateSignInInputs(email, password, this)) {
        return;
    }
    
    // Show loading state
    const submitButton = this.querySelector('button');
    const originalText = submitButton.innerHTML;
    setLoadingState(submitButton, 'Signing In...');
    
    // Simulate authentication
    setTimeout(() => {
        authenticateUser(email, password, submitButton, originalText);
    }, 2000);
}

// Handle Sign Up
function handleSignUp(e) {
    e.preventDefault();
    
    const fullName = this.querySelector('input[type="text"]').value.trim();
    const email = this.querySelector('input[type="email"]').value.trim();
    const password = this.querySelector('input[type="password"]').value;
    
    // Clear previous errors
    clearErrorStates(this);
    
    // Validate inputs
    if (!validateSignUpInputs(fullName, email, password, this)) {
        return;
    }
    
    // Check if user already exists
    if (userExists(email)) {
        showFieldError(this.querySelector('input[type="email"]'), 'An account with this email already exists');
        showError('Please use a different email or sign in to your existing account');
        return;
    }
    
    // Show loading state
    const submitButton = this.querySelector('button') || createSubmitButton(this);
    const originalText = submitButton.innerHTML;
    setLoadingState(submitButton, 'Creating Account...');
    
    // Create new user
    setTimeout(() => {
        createNewUser(fullName, email, password, submitButton, originalText);
    }, 2500);
}

// Validation Functions
function validateSignInInputs(email, password, form) {
    let isValid = true;
    
    if (!email) {
        showFieldError(form.querySelector('input[type="email"]'), 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showFieldError(form.querySelector('input[type="email"]'), 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!password) {
        showFieldError(form.querySelector('input[type="password"]'), 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showFieldError(form.querySelector('input[type="password"]'), 'Password must be at least 6 characters long');
        isValid = false;
    }
    
    return isValid;
}

function validateSignUpInputs(fullName, email, password, form) {
    let isValid = true;
    
    if (!fullName) {
        showFieldError(form.querySelector('input[type="text"]'), 'Full name is required');
        isValid = false;
    } else if (fullName.length < 2) {
        showFieldError(form.querySelector('input[type="text"]'), 'Please enter your full name (at least 2 characters)');
        isValid = false;
    }
    
    if (!email) {
        showFieldError(form.querySelector('input[type="email"]'), 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showFieldError(form.querySelector('input[type="email"]'), 'Please enter a valid email address');
        isValid = false;
    } else if (!validateCollegeEmail(email)) {
        showFieldError(form.querySelector('input[type="email"]'), 'Please use your college email address (.edu domain)');
        isValid = false;
    }
    
    if (!password) {
        showFieldError(form.querySelector('input[type="password"]'), 'Password is required');
        isValid = false;
    } else if (password.length < 8) {
        showFieldError(form.querySelector('input[type="password"]'), 'Password must be at least 8 characters long');
        isValid = false;
    } else if (!validatePassword(password)) {
        showFieldError(form.querySelector('input[type="password"]'), 'Password must contain uppercase, lowercase, and number');
        isValid = false;
    }
    
    if (!isValid) {
        showError('Please fix the errors above to continue');
    }
    
    return isValid;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateCollegeEmail(email) {
    const collegePatterns = [
        /\.edu$/i,
        /\.ac\./i,
        /university/i,
        /college/i,
        /student/i,
        /\.edu\./i
    ];
    return collegePatterns.some(pattern => pattern.test(email));
}

function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

// Authentication Functions
function authenticateUser(email, password, submitButton, originalText) {
    const existingUsers = JSON.parse(localStorage.getItem('vibecampus_users') || '[]');
    const user = existingUsers.find(u => u.email === email);
    
    if (!user) {
        showFieldError(document.querySelector('.sign-in-container input[type="email"]'), 'No account found with this email');
        resetButton(submitButton, originalText);
        return;
    }
    
    if (user.password !== hashPassword(password)) {
        showFieldError(document.querySelector('.sign-in-container input[type="password"]'), 'Incorrect password');
        resetButton(submitButton, originalText);
        return;
    }
    
    // Check if profile is completed
    if (!user.profileCompleted) {
        showError('Please complete your profile setup first');
        resetButton(submitButton, originalText);
        // Redirect to profile setup
        setTimeout(() => {
            window.location.href = 'student.html';
        }, 2000);
        return;
    }
    
    // Successful login
    const userData = {
        id: user.id,
        fullName: user.fullName,
        email: email,
        profileCompleted: user.profileCompleted,
        loginTime: new Date().toISOString(),
        isLoggedIn: true
    };
    
    localStorage.setItem('vibecampus_user', JSON.stringify(userData));
    localStorage.setItem('vibecampus_session', 'active');
    
    showSuccess(`Welcome back, ${user.fullName}!`);
    
    setTimeout(() => {
        window.location.href = 'choose.html';
    }, 1500);
}

function createNewUser(fullName, email, password, submitButton, originalText) {
    const newUser = {
        id: generateUserId(),
        fullName: fullName,
        email: email,
        password: hashPassword(password),
        profileCompleted: false,
        createdAt: new Date().toISOString(),
        isVerified: false,
        requiredFields: {
            college: null,
            major: null,
            year: null,
            interests: [],
            learningStyle: null
        }
    };
    
    // Save new user
    const existingUsers = JSON.parse(localStorage.getItem('vibecampus_users') || '[]');
    existingUsers.push(newUser);
    localStorage.setItem('vibecampus_users', JSON.stringify(existingUsers));
    
    // Set session
    const userData = {
        id: newUser.id,
        fullName: fullName,
        email: email,
        profileCompleted: false,
        loginTime: new Date().toISOString(),
        isLoggedIn: true,
        needsProfileSetup: true
    };
    
    localStorage.setItem('vibecampus_user', JSON.stringify(userData));
    localStorage.setItem('vibecampus_session', 'active');
    
    showSuccess('Account created! Please complete your profile to access VibeCampus.');
    
    setTimeout(() => {
        window.location.href = 'student.html';
    }, 2000);
}

// Utility Functions
function userExists(email) {
    const existingUsers = JSON.parse(localStorage.getItem('vibecampus_users') || '[]');
    return existingUsers.find(user => user.email === email);
}

function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

function createSubmitButton(form) {
    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Create Account';
    button.style.cssText = `
        border-radius: 20px;
        border: 1px solid #7c3aed;
        background-color: #7c3aed;
        color: white;
        font-size: 12px;
        font-weight: bold;
        padding: 12px 45px;
        letter-spacing: 1px;
        text-transform: uppercase;
        cursor: pointer;
        margin-top: 15px;
    `;
    form.appendChild(button);
    return button;
}

// UI Helper Functions
function setLoadingState(button, text) {
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    button.disabled = true;
}

function resetButton(button, originalText) {
    button.innerHTML = originalText;
    button.disabled = false;
}

function showFieldError(field, message) {
    // Remove existing error
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error styling
    field.style.borderColor = '#ef4444';
    field.style.backgroundColor = '#fef2f2';
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #ef4444;
        font-size: 11px;
        margin-top: 5px;
        margin-bottom: 10px;
        text-align: left;
        padding-left: 5px;
        animation: fadeIn 0.3s ease-out;
    `;
    
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
    field.focus();
}

function clearErrorStates(form) {
    const errorMessages = form.querySelectorAll('.field-error');
    errorMessages.forEach(error => error.remove());
    
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.style.borderColor = '';
        input.style.backgroundColor = '';
    });
}

// Notification Functions
function showError(message) {
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showInfo(message) {
    showNotification(message, 'info');
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease-out;
        font-family: 'Montserrat', sans-serif;
        ${getNotificationStyles(type)}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-info-circle';
    }
}

function getNotificationStyles(type) {
    switch(type) {
        case 'success': return 'background: #10b981; color: white;';
        case 'error': return 'background: #ef4444; color: white;';
        case 'info': return 'background: #3b82f6; color: white;';
        default: return 'background: #6b7280; color: white;';
    }
}

// Social Media Handlers
function setupSocialButtons() {
    const socialButtons = document.querySelectorAll('.social');
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const platform = this.querySelector('i').classList.contains('fa-google') ? 'Google' : 'LinkedIn';
            
            this.style.opacity = '0.6';
            this.style.pointerEvents = 'none';
            
            setTimeout(() => {
                showInfo(`${platform} login is coming soon! Please use email registration for now.`);
                this.style.opacity = '1';
                this.style.pointerEvents = 'auto';
            }, 1500);
        });
    });
}

// Session Management
function checkExistingSession() {
    const session = localStorage.getItem('vibecampus_session');
    const userData = localStorage.getItem('vibecampus_user');
    
    if (session === 'active' && userData) {
        const user = JSON.parse(userData);
        
        if (user.profileCompleted) {
            showInfo(`Welcome back, ${user.fullName || 'Student'}!`);
            setTimeout(() => {
                window.location.href = 'choose.html';
            }, 2000);
        } else {
            showInfo(`Please complete your profile setup, ${user.fullName || 'Student'}`);
            setTimeout(() => {
                window.location.href = 'student.html';
            }, 2000);
        }
    }
}

// Add required CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
        opacity: 0.7;
        transition: opacity 0.3s ease;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    .form-container form button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .social:hover {
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);