// Handles registration and login forms using fetch() and shows beautiful Bootstrap toasts
function showToast(msg, type = 'danger', title = 'Alert') {
  const toastContainer = document.querySelector('.toast-container');
  
  // Map types to Bootstrap color classes and icons
  const typeConfig = {
    danger: { bgClass: 'bg-danger', icon: 'bi-exclamation-circle', textClass: 'text-danger' },
    success: { bgClass: 'bg-success', icon: 'bi-check-circle', textClass: 'text-success' },
    warning: { bgClass: 'bg-warning', icon: 'bi-exclamation-triangle', textClass: 'text-warning' },
    info: { bgClass: 'bg-info', icon: 'bi-info-circle', textClass: 'text-info' }
  };
  
  const config = typeConfig[type] || typeConfig.danger;
  
  // Create toast element
  const toastId = 'toast-' + Date.now();
  const toastHTML = `
    <div id="${toastId}" class="toast custom-toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header custom-toast-header ${config.bgClass}">
        <i class="bi ${config.icon} me-2" style="font-size: 1.1rem;"></i>
        <strong class="me-auto fw-700">${title}</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body custom-toast-body">
        <div class="d-flex align-items-center">
          <span>${msg}</span>
        </div>
      </div>
    </div>
  `;
  
  toastContainer.insertAdjacentHTML('beforeend', toastHTML);
  
  // Show toast
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, { delay: 4500 });
  toast.show();
  
  // Remove toast element from DOM after it's hidden
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

// Register form
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(registerForm);
    const payload = {
      name: fd.get('name').trim(),
      email: fd.get('email').trim(),
      password: fd.get('password'),
      confirmPassword: fd.get('confirmPassword')
    };

    // basic client-side validation
    if (!payload.name || !payload.email || !payload.password || !payload.confirmPassword) {
      return showToast('Please complete all fields.', 'warning', 'Incomplete Form');
    }
    if (payload.password.length < 8) return showToast('Password must be at least 8 characters.', 'warning', 'Password Too Short');
    if (payload.password !== payload.confirmPassword) return showToast('Passwords do not match.', 'danger', 'Password Mismatch');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || 'Registration failed.', 'danger', 'Registration Error');
      
      showToast('Welcome aboard! Logging you in...', 'success', 'Success');
      
      // Auto-login after registration
      setTimeout(async () => {
        try {
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: payload.email, password: payload.password }),
            credentials: 'include'
          });
          const loginData = await loginRes.json();
          if (loginRes.ok) {
            window.location.href = '/dashboard';
          } else {
            showToast('Account created! Please log in.', 'info', 'Account Ready');
            setTimeout(() => window.location.href = '/login.html', 1500);
          }
        } catch (err) {
          showToast('Account created! Please log in.', 'info', 'Account Ready');
          setTimeout(() => window.location.href = '/login.html', 1500);
        }
      }, 500);
    } catch (err) {
      showToast('Network error. Try again later.', 'danger', 'Connection Error');
    }
  });
}

// Login form
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(loginForm);
    const payload = { email: fd.get('email').trim(), password: fd.get('password') };
    if (!payload.email || !payload.password) return showToast('Email and password required.', 'warning', 'Missing Fields');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || 'Invalid email or password', 'danger', 'Login Failed');
      // success
      showToast('Logging you in...', 'success', 'Welcome');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 800);
    } catch (err) {
      showToast('Network error. Try again later.', 'danger', 'Connection Error');
    }
  });
}

// Logout button (if present on page)
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        showToast('You have been logged out.', 'success', 'Logged Out');
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 800);
      } else showToast(data.error || 'Failed to logout', 'danger', 'Logout Error');
    } catch (err) {
      showToast('Network error', 'danger', 'Connection Error');
    }
  });
}
