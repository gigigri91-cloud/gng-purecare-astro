function initHeader() {
  const header = document.getElementById('main-header');
  if (!header || header.dataset.init === 'true') return;
  header.dataset.init = 'true';

  const SCROLL_THRESHOLD = 80;
  const MAGNET_RADIUS = 80;

  const updateScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
  };

  updateScroll();
  window.addEventListener('scroll', updateScroll, { passive: true });

  const navList = header.querySelector('.nav-list');
  const indicator = header.querySelector('.nav-indicator');
  const links = header.querySelectorAll('.nav-link');

  const placeIndicator = (link) => {
    if (!navList || !indicator) return;
    const listRect = navList.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const centerX = linkRect.left + linkRect.width / 2 - listRect.left;
    indicator.style.left = centerX + 'px';
    indicator.style.opacity = '1';
  };

  const resetIndicator = () => {
    if (!indicator) return;
    const active = header.querySelector('.nav-link.is-active');
    if (active) {
      placeIndicator(active);
    } else {
      indicator.style.opacity = '0';
    }
  };

  if (navList && indicator && links.length) {
    const active = header.querySelector('.nav-link.is-active');
    if (active) placeIndicator(active);

    links.forEach((link) => {
      link.addEventListener('mouseenter', () => placeIndicator(link));

      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        link.addEventListener('mousemove', (e) => {
          const rect = link.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.hypot(dx, dy);
          if (dist < MAGNET_RADIUS) {
            link.style.transform = 'translate(' + (dx * 0.3) + 'px, ' + (dy * 0.3) + 'px)';
            link.style.transition = 'transform 0.1s ease';
          }
        });

        link.addEventListener('mouseleave', () => {
          link.style.transform = 'translate(0, 0)';
          link.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
      }
    });

    navList.addEventListener('mouseleave', resetIndicator);
  }

  const mobileMenu = header.querySelector('.mobile-menu');

  if (mobileMenu) {
    mobileMenu.addEventListener('toggle', () => {
      document.body.style.overflow = mobileMenu.open ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll(
      '.mobile-nav-link, .mobile-nav-phone, .btn-cta--mobile'
    ).forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.open = false;
        document.body.style.overflow = '';
      });
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeader);
} else {
  initHeader();
}
document.addEventListener('astro:page-load', initHeader);
