// Live password strength indicator for register page
(function () {
  const pwd = document.getElementById('reg-password');
  const bar = document.getElementById('password-strength-bar');
  const txt = document.getElementById('password-strength-text');
  const reqs = document.querySelectorAll('#password-requirements li');
  if (!pwd) return;

  function assess(value) {
    const checks = {
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      digit: /[0-9]/.test(value),
      special: /[^A-Za-z0-9]/.test(value)
    };
    let score = 0; for (const k in checks) if (checks[k]) score++;
    return { checks, score };
  }

  pwd.addEventListener('input', () => {
    const v = pwd.value;
    const { checks, score } = assess(v);
    // update requirements
    reqs.forEach(li => {
      const rule = li.dataset.rule;
      if (checks[rule]) li.classList.add('met'); else li.classList.remove('met');
    });
    const pct = Math.round((score / 5) * 100);
    bar.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', pct);
    if (pct < 40) { bar.className = 'progress-bar bg-danger'; txt.textContent = 'Weak'; }
    else if (pct < 80) { bar.className = 'progress-bar bg-warning'; txt.textContent = 'Fair'; }
    else { bar.className = 'progress-bar bg-success'; txt.textContent = 'Strong'; }
  });
})();