(() => {
    'use strict';

    const menu = document.querySelector('.home-menu');
    if (menu) {
        menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
        document.addEventListener('click', event => {
            if (!menu.contains(event.target)) menu.open = false;
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && menu.open) {
                menu.open = false;
                menu.querySelector('summary').focus();
            }
        });
    }

    // Mark the in-page section being read in the main navigation.
    const sectionLinks = [...document.querySelectorAll('.home-nav a[href^="#"]')];
    const sections = sectionLinks.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
    if (sections.length && 'IntersectionObserver' in window) {
        const visible = new Set();
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) visible.add(entry.target);
                else visible.delete(entry.target);
            });
            const current = sections.find(section => visible.has(section));
            sectionLinks.forEach(link => {
                if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
                else link.removeAttribute('aria-current');
            });
        }, { rootMargin: '-40% 0px -55% 0px' });
        sections.forEach(section => observer.observe(section));
    }
})();
