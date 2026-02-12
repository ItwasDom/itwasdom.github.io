// Auth-aware navbar control shared across pages.
(function () {
  if (!window.firebase || !firebase.auth) return;

  // Keep in sync with admin page gates.
  const ADMIN_UID = window.__ADMIN_UID || 'RVAvU26oGeYsaJYk0X1OF9h6apb2';

  const authNavBtn = document.getElementById('authNavBtn');
  if (!authNavBtn) return;

  const dropdown = document.getElementById('authDropdown');
  const dashboardBtn = document.getElementById('authDashboardBtn') || document.getElementById('authDashboardLink');
  const logoutBtn = document.getElementById('authLogoutBtn');

  const auth = firebase.auth();

  function syncAdminDropdownLink(user) {
    if (!dropdown) return;

    const isAdmin = !!user && user.uid === ADMIN_UID;
    const existing = document.getElementById('authAdminDashboardLink');

    if (!isAdmin) {
      if (existing) existing.remove();
      return;
    }

    const adminLink = existing || document.createElement('a');
    adminLink.id = 'authAdminDashboardLink';
    adminLink.href = '/admin/dashboard.html';
    adminLink.textContent = 'Admin Dashboard';
    adminLink.onclick = (e) => {
      e.preventDefault();
      window.location.href = '/admin/dashboard.html';
    };

    if (!existing) {
      dropdown.insertBefore(adminLink, dropdown.firstChild);
    }
  }

  function setSignedOut() {
    authNavBtn.textContent = 'Login / Sign Up';
    authNavBtn.href = '/user/login.html';
    authNavBtn.removeAttribute('data-auth-ready');
    if (dropdown) dropdown.classList.remove('show');

    const adminLink = document.getElementById('authAdminDashboardLink');
    if (adminLink) adminLink.remove();
  }

  function setSignedIn(user) {
    authNavBtn.textContent = user.displayName || 'My Profile';
    authNavBtn.href = '#';
    authNavBtn.setAttribute('data-auth-ready', 'true');

    syncAdminDropdownLink(user);

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
