// navAuth: updates navbar actions based on session state
(async function () {
  async function getMe() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user || null;
    } catch (e) { return null; }
  }

  const area = document.getElementById('nav-user-area');
  if (!area) return;

  const user = await getMe();
  if (!user) return; // leave login/register as-is

  // replace with dashboard link + logout + display name
  area.innerHTML = `
    <div class="me-3 text-muted d-none d-lg-block">${user.name}</div>
    <a class="btn btn-outline-secondary me-2" href="/dashboard">Dashboard</a>
    <button id="nav-logout" class="btn btn-danger">Logout</button>
  `;

  document.getElementById('nav-logout').addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/login.html';
  });

  // highlight current page link (works cross-pages and with hash anchors on index)
  const current = window.location.pathname + window.location.hash;
  document.querySelectorAll('.navbar .nav-link').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    // If exact match or hash matches section on index
    if (href === window.location.pathname || href === window.location.pathname + window.location.hash) a.classList.add('active');
    if (href === window.location.hash || (href.startsWith(window.location.pathname) && href.includes(window.location.hash.split('#')[1] || '')) ) a.classList.add('active');
    // fallback: if on index and link has same hash as location.hash
    if (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html')) {
      if (href === window.location.hash) a.classList.add('active');
    }
  });

})();