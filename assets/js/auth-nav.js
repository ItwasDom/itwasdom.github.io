// Auth-aware navbar control shared across pages.
(function () {
  if (!window.firebase || !firebase.auth) return;

  const authNavBtn = document.getElementById('authNavBtn');
  if (!authNavBtn) return;

  const dropdown = document.getElementById('authDropdown');
  const dashboardBtn = document.getElementById('authDashboardBtn');
  const logoutBtn = document.getElementById('authLogoutBtn');

  const auth = firebase.auth();

  function setSignedOut() {
    authNavBtn.textContent = 'Login / Sign Up';
    authNavBtn.href = '/user/login.html';
    authNavBtn.removeAttribute('data-auth-ready');
    if (dropdown) dropdown.classList.remove('show');
  }

  function setSignedIn(user) {
    authNavBtn.textContent = user.displayName || 'My Profile';
    authNavBtn.href = '#';
    authNavBtn.setAttribute('data-auth-ready', 'true');

    if (dashboardBtn) {
      dashboardBtn.onclick = (e) => {
        e.preventDefault();
        window.location.href = '/user/dashboard.html';
      };
    }

    if (logoutBtn) {
      logoutBtn.onclick = async (e) => {
        e.preventDefault();
        try {
          await auth.signOut();
          if (dropdown) dropdown.classList.remove('show');
          window.location.href = '/';
        } catch (err) {
          console.error('Logout failed', err);
        }
      };
    }
  }

  function bindDropdownHandlersOnce() {
    if (!dropdown) return;
    if (document.documentElement.getAttribute('data-auth-nav-bound') === 'true') return;
    document.documentElement.setAttribute('data-auth-nav-bound', 'true');

    authNavBtn.addEventListener('click', (e) => {
      if (!auth.currentUser) return;
      e.preventDefault();
      dropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.classList.contains('show')) return;
      if (e.target === authNavBtn) return;
      if (dropdown.contains(e.target)) return;
      dropdown.classList.remove('show');
    });
  }

  bindDropdownHandlersOnce();

  auth.onAuthStateChanged((user) => {
    if (!user) {
      setSignedOut();
      return;
    }

    setSignedIn(user);
  });
})();
