(() => {
  'use strict';

  const initialize = () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navigation = document.getElementById('primary-navigation');

    if (menuToggle && navigation) {
      const setMenuOpen = (open, restoreFocus = false) => {
        navigation.classList.toggle('is-open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        if (restoreFocus) menuToggle.focus();
      };

      menuToggle.addEventListener('click', () => {
        setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
      });

      navigation.addEventListener('click', (event) => {
        if (event.target.closest('a')) setMenuOpen(false);
      });

      document.addEventListener('click', (event) => {
        if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) {
          setMenuOpen(false);
        }
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
          setMenuOpen(false, true);
        }
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > 760) setMenuOpen(false);
      });

      setMenuOpen(false);
      document.documentElement.classList.add('js');

      const sectionLinks = new Map();
      navigation.querySelectorAll('a[href^="#"]').forEach((link) => {
        const target = document.getElementById(link.getAttribute('href').slice(1));
        if (!target || !target.matches('main section[id]')) return;
        if (!sectionLinks.has(target)) sectionLinks.set(target, []);
        sectionLinks.get(target).push(link);
      });

      if ('IntersectionObserver' in window && sectionLinks.size) {
        const visibleSections = new Set();
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) visibleSections.add(entry.target);
            else visibleSections.delete(entry.target);
          });

          const activeSection = [...visibleSections].sort((first, second) => (
            Math.abs(first.getBoundingClientRect().top) - Math.abs(second.getBoundingClientRect().top)
          ))[0];

          sectionLinks.forEach((links, section) => {
            links.forEach((link) => {
              const active = section === activeSection;
              link.classList.toggle('is-active', active);
              if (active) link.setAttribute('aria-current', 'location');
              else link.removeAttribute('aria-current');
            });
          });
        }, { rootMargin: '-10% 0px -55% 0px', threshold: 0 });

        sectionLinks.forEach((links, section) => observer.observe(section));
      }
    }

    const preview = document.getElementById('image-preview');
    const previewImage = document.getElementById('preview-image');
    const previewTitle = document.getElementById('preview-title');

    if (preview && previewImage && previewTitle) {
      let previewTrigger = null;

      document.querySelectorAll('[data-preview]').forEach((button) => {
        button.addEventListener('click', () => {
          const source = button.dataset.preview;
          if (!source) return;
          if (typeof preview.showModal !== 'function') {
            window.location.assign(source);
            return;
          }

          previewTrigger = button;
          previewImage.src = source;
          previewImage.alt = button.dataset.alt || button.dataset.title || 'Project screenshot';
          previewTitle.textContent = button.dataset.title || 'Project preview';
          if (!preview.open) preview.showModal();
        });
      });

      preview.querySelector('.preview-close')?.addEventListener('click', () => preview.close());

      preview.addEventListener('click', (event) => {
        if (event.target !== preview) return;
        const bounds = preview.getBoundingClientRect();
        const outside = event.clientX < bounds.left || event.clientX > bounds.right
          || event.clientY < bounds.top || event.clientY > bounds.bottom;
        if (outside) preview.close();
      });

      preview.addEventListener('close', () => {
        previewImage.removeAttribute('src');
        if (previewTrigger?.isConnected) previewTrigger.focus();
        previewTrigger = null;
      });
    }

    document.querySelectorAll('[data-year]').forEach((element) => {
      element.textContent = String(new Date().getFullYear());
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
