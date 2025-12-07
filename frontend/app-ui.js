
(function () {

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const sections = ['home', 'browse', 'login', 'register'];
  const profileBtn = $('#profile-btn');
  const profileDropdown = $('#profile-dropdown');
  const profileAvatar = $('#profile-avatar');
  const dropdownAvatar = $('#dropdown-avatar');
  const dropdownName = $('#dropdown-name');
  const dropdownEmail = $('#dropdown-email');

  function getStoredUser() {
    try {
      return JSON.parse(localStorage.getItem('streamflix_user') || 'null');
    } catch (e) {
      return null;
    }
  }
  function setStoredUser(user) {
    localStorage.setItem('streamflix_user', JSON.stringify(user || null));
  }
  function isLoggedIn() {
    return !!getStoredUser();
  }
  function avatarFor(nameOrEmail) {
    const name = String(nameOrEmail || 'User').trim();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E50914&color=fff&size=64`;
  }

  function showSection(id) {
    sections.forEach(s => {
      const el = document.getElementById(s);
      if (!el) return;
      if (s === id) el.classList.remove('hidden');
      else el.classList.add('hidden');
    });
    const visible = document.getElementById(id);
    if (visible) visible.setAttribute('tabindex', '-1');
    if (visible) visible.focus();
  }

  function navigateTo(target) {
    if (target === 'browse' && !isLoggedIn()) {
      flashMessage('Please create an account or sign in to browse.');
      const prefer = $('#link-login') ? 'login' : 'register';
      showSection(prefer);
      return;
    }
    if (sections.includes(target)) {
      showSection(target);
    }
  }

  function flashMessage(msg, timeout = 2200) {
    let el = document.getElementById('streamflix-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'streamflix-toast';
      el.style.position = 'fixed';
      el.style.right = '16px';
      el.style.top = '78px';
      el.style.zIndex = 2000;
      el.style.background = 'rgba(0,0,0,0.75)';
      el.style.color = 'white';
      el.style.padding = '10px 14px';
      el.style.borderRadius = '8px';
      el.style.fontSize = '14px';
      el.style.boxShadow = '0 8px 26px rgba(0,0,0,0.6)';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(el._t);
    el._t = setTimeout(() => (el.style.opacity = '0'), timeout);
  }

  function refreshProfileUI() {
    const user = getStoredUser();
    if (user) {
      profileAvatar.src = user.avatar || avatarFor(user.name || user.email);
      dropdownAvatar.src = user.avatar || avatarFor(user.name || user.email);
      dropdownName.textContent = user.name || (user.email || 'User');
      dropdownEmail.textContent = user.email || '';
      $('#drop-logout').style.display = '';
      $('#drop-account').style.display = '';
      profileBtn.setAttribute('title', `Signed in as ${dropdownName.textContent}`);
    } else {
      const placeholder = 'https://via.placeholder.com/40/0f1417/ffffff?text=?';
      profileAvatar.src = placeholder;
      dropdownAvatar.src = placeholder;
      dropdownName.textContent = 'Guest';
      dropdownEmail.textContent = 'Not signed in';
      $('#drop-logout').style.display = 'none';
      $('#drop-account').style.display = 'none';
      profileBtn.setAttribute('title', 'Sign in');
    }
  }

  function wireNav() {
    ['link-home', 'link-browse', 'link-login', 'link-register'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', e => {
        e.preventDefault();
        const target = id.replace('link-', '');
        navigateTo(target);
      });
    });

    const ctaBrowse = document.getElementById('cta-browse');
    if (ctaBrowse) {
      ctaBrowse.addEventListener('click', e => {
        e.preventDefault();
        navigateTo('browse');
      });
    }
    const ctaCreate = document.getElementById('cta-create');
    if (ctaCreate) {
      ctaCreate.addEventListener('click', e => {
        e.preventDefault();
        navigateTo('register');
        const lr = document.getElementById('link-register');
        if (lr) lr.click();
      });
    }
  }

  function wireForms() {
    const registerForm = document.getElementById('form-register');
    if (registerForm) {
      registerForm.addEventListener('submit', e => {
        try {
          const fd = new FormData(registerForm);
          const name = fd.get('name') || '';
          const email = fd.get('email') || '';
          const avatar = avatarFor(name || email);
          setStoredUser({ name: name.trim() || '', email: email.trim() || '', avatar });
          refreshProfileUI();
          setTimeout(() => navigateTo('browse'), 120);
        } catch (err) {
        }
      });
    }

    const loginForm = document.getElementById('form-login');
    if (loginForm) {
      loginForm.addEventListener('submit', e => {
        try {
          const fd = new FormData(loginForm);
          const email = fd.get('email') || '';
          const name = (email.split('@')[0] || 'User').replace(/[^\w\s]/g, '');
          const avatar = avatarFor(name || email);
          setStoredUser({ name, email: email.trim() || '', avatar });
          refreshProfileUI();
          setTimeout(() => navigateTo('browse'), 120);
        } catch (err) {}
      });
    }
  }

  function wireProfile() {
    if (!profileBtn) return;
    profileBtn.addEventListener('click', e => {
      const open = !profileDropdown.classList.contains('hidden');
      if (open) {
        profileDropdown.classList.add('hidden');
        profileDropdown.setAttribute('aria-hidden', 'true');
        profileBtn.setAttribute('aria-expanded', 'false');
      } else {
        profileDropdown.classList.remove('hidden');
        profileDropdown.setAttribute('aria-hidden', 'false');
        profileBtn.setAttribute('aria-expanded', 'true');
      }
    });

    document.addEventListener('click', e => {
      if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.add('hidden');
        profileDropdown.setAttribute('aria-hidden', 'true');
        profileBtn.setAttribute('aria-expanded', 'false');
      }
    });

    const logout = $('#drop-logout');
    if (logout) {
      logout.addEventListener('click', e => {
        e.preventDefault();
        setStoredUser(null);
        refreshProfileUI();
        flashMessage('Signed out');
        navigateTo('home');
      });
    }

    const accountBtn = $('#drop-account');
    if (accountBtn) {
      accountBtn.addEventListener('click', e => {
        e.preventDefault();
        navigateTo('login');
      });
    }
  }

  function init() {
    wireNav();
    wireForms();
    wireProfile();
    refreshProfileUI();

    showSection('home');

    const hashTarget = (location.hash || '').replace('#', '');
    if (hashTarget) {
      setTimeout(() => {
        if (hashTarget === 'browse') {
          navigateTo('browse');
        } else if (sections.includes(hashTarget)) {
          showSection(hashTarget);
        }
      }, 80);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();