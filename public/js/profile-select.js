/* Profile selection flow (localStorage-backed) */
const STORAGE_KEYS = {
  profiles: 'elderlyProfiles',
  active: 'activeProfileId'
};

function getProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.profiles);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function saveProfiles(profiles) {
  localStorage.setItem(STORAGE_KEYS.profiles, JSON.stringify(profiles));
}

function setActiveProfile(id) {
  localStorage.setItem(STORAGE_KEYS.active, String(id));
}

function buildCard(profile) {
  const card = document.createElement('div');
  card.className = 'profile-card';
  card.innerHTML = `
    <div class="profile-avatar">${profile.name.charAt(0).toUpperCase()}</div>
    <div class="profile-name">${profile.name}</div>
    <div class="profile-meta">${profile.relationship} · ${profile.age}</div>
  `;
  card.addEventListener('click', () => {
    setActiveProfile(profile.id);
    window.location.href = '/dashboard';
  });
  return card;
}

function buildAddCard() {
  const card = document.createElement('div');
  card.className = 'profile-card add-card';
  card.innerHTML = `
    <div class="profile-avatar">+</div>
    <div class="profile-name">Add Profile</div>
    <div class="profile-meta">Create a new elderly profile</div>
  `;
  card.addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('addProfileModal'));
    modal.show();
  });
  return card;
}

function renderProfiles() {
  const grid = document.getElementById('profilesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const profiles = getProfiles();
  profiles.forEach(profile => grid.appendChild(buildCard(profile)));
  grid.appendChild(buildAddCard());
}

function initAuthGuard() {
  fetch('/api/auth/me', { credentials: 'include' })
    .then(res => {
      if (!res.ok) window.location.href = '/login.html';
    })
    .catch(() => window.location.href = '/login.html');
}

function initEvents() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/login.html';
    });
  }

  const saveBtn = document.getElementById('saveProfileBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const name = document.getElementById('profileName').value.trim();
      const age = document.getElementById('profileAge').value.trim();
      const relationship = document.getElementById('profileRelationship').value.trim();
      const notes = document.getElementById('profileNotes').value.trim();
      const errorEl = document.getElementById('profileError');

      if (!name) {
        errorEl.classList.remove('d-none');
        return;
      }
      errorEl.classList.add('d-none');

      const profiles = getProfiles();
      const newProfile = {
        id: Date.now().toString(),
        name,
        age: Number(age || 0),
        relationship,
        notes
      };
      profiles.push(newProfile);
      saveProfiles(profiles);

      document.getElementById('addProfileForm').reset();
      bootstrap.Modal.getInstance(document.getElementById('addProfileModal')).hide();
      renderProfiles();
    });
  }
}

initAuthGuard();
renderProfiles();
initEvents();
