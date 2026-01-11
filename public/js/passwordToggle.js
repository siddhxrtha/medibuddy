// Simple password show/hide using data-target attribute on toggle icons/buttons
document.addEventListener('click', function (e) {
  const t = e.target.closest('.toggle-password');
  if (!t) return;
  const targetId = t.dataset.target;
  const input = document.getElementById(targetId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    t.classList.remove('bi-eye-slash'); t.classList.add('bi-eye');
  } else {
    input.type = 'password';
    t.classList.remove('bi-eye'); t.classList.add('bi-eye-slash');
  }
});