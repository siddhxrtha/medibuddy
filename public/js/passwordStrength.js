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
    let score = 0; 
    for (const k in checks) if (checks[k]) score++;
    return { checks, score };
  }

  pwd.addEventListener('input', () => {
    const v = pwd.value;
    const { checks, score } = assess(v);
    
    // update requirements list with icons
    reqs.forEach(li => {
      const rule = li.dataset.rule;
      const icon = li.querySelector('i');
      if (checks[rule]) {
        li.classList.add('met');
        if (icon) icon.className = 'bi bi-check-circle-fill me-1';
      } else {
        li.classList.remove('met');
        if (icon) icon.className = 'bi bi-x-circle me-1';
      }
    });
    
    // update strength bar
    const pct = Math.round((score / 5) * 100);
    bar.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', pct);
    
    // remove all color classes first
    bar.className = 'progress-bar';
    
    // add appropriate color class based on strength
    if (pct === 0) {
      bar.className = 'progress-bar';
      txt.textContent = '';
      txt.style.color = 'var(--gray-500)';
    } else if (pct < 40) {
      bar.classList.add('bg-danger');
      txt.textContent = '🔴 Weak';
      txt.style.color = '#dc2626';
    } else if (pct < 80) {
      bar.classList.add('bg-warning');
      txt.textContent = '🟡 Fair';
      txt.style.color = '#f59e0b';
    } else {
      bar.classList.add('bg-success');
      txt.textContent = '🟢 Strong';
      txt.style.color = '#10b981';
    }
  });
})();