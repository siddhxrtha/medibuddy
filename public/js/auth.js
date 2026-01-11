// Handles registration and login forms using fetch() and shows Bootstrap alerts
function showAlert(target, msg, type = 'danger') {
  target.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert">${msg}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
}

// Register form
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertPlaceholder = document.getElementById('alert-placeholder');
    const fd = new FormData(registerForm);
    const payload = {
      name: fd.get('name').trim(),
      email: fd.get('email').trim(),
      password: fd.get('password'),
      confirmPassword: fd.get('confirmPassword')
    };

    // basic client-side validation
    if (!payload.name || !payload.email || !payload.password || !payload.confirmPassword) {
      return showAlert(alertPlaceholder, 'Please complete all fields.');
    }
    if (payload.password.length < 8) return showAlert(alertPlaceholder, 'Password must be at least 8 characters.');
    if (payload.password !== payload.confirmPassword) return showAlert(alertPlaceholder, 'Passwords do not match.');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) return showAlert(alertPlaceholder, data.error || 'Registration failed.');
      showAlert(alertPlaceholder, 'Registered successfully — redirecting to login...', 'success');
      setTimeout(() => window.location.href = '/login.html', 900);
    } catch (err) {
      showAlert(alertPlaceholder, 'Network error. Try again later.');
    }
  });
}

// Login form
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertPlaceholder = document.getElementById('alert-placeholder');
    const fd = new FormData(loginForm);
    const payload = { email: fd.get('email').trim(), password: fd.get('password') };
    if (!payload.email || !payload.password) return showAlert(alertPlaceholder, 'Email and password required.');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) return showAlert(alertPlaceholder, data.error || 'Invalid email or password');
      // success
      window.location.href = '/dashboard';
    } catch (err) {
      showAlert(alertPlaceholder, 'Network error. Try again later.');
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
      if (res.ok) window.location.href = '/login.html';
      else alert(data.error || 'Failed to logout');
    } catch (err) {
      alert('Network error');
    }
  });
}
