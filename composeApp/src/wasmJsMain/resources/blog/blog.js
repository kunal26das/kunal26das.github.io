(() => {
    'use strict';

    const root = document.documentElement;
    const themeButton = document.querySelector('[data-theme-toggle]');
    let theme = 'dark';
    try {
        if (localStorage.getItem('theme') === 'light') theme = 'light';
    } catch (_) {
        // Reading remains available when browser storage is blocked.
    }

    function applyTheme() {
        root.dataset.theme = theme;
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1B1916' : '#F3F0E9');
        if (themeButton) {
            const next = theme === 'dark' ? 'Light' : 'Dark';
            themeButton.textContent = next;
            themeButton.setAttribute('aria-label', `Switch to ${next.toLowerCase()} theme`);
        }
    }
    applyTheme();
    if (themeButton) {
        themeButton.hidden = false;
        themeButton.addEventListener('click', () => {
            theme = theme === 'dark' ? 'light' : 'dark';
            applyTheme();
            try { localStorage.setItem('theme', theme); } catch (_) { /* Keep this visit usable. */ }
        });
    }

    document.querySelectorAll('[data-copy-feed], [data-copy-link]').forEach(button => {
        button.hidden = false;
        button.addEventListener('click', async () => {
            const isFeed = button.hasAttribute('data-copy-feed');
            const address = isFeed ? 'https://kunal26das.github.io/feed.xml' : document.querySelector('link[rel="canonical"]').href;
            let status = document.querySelector('[data-copy-status]');
            if (!status) {
                status = document.createElement('span');
                status.className = 'action-status';
                status.dataset.copyStatus = '';
                status.setAttribute('role', 'status');
                status.setAttribute('aria-live', 'polite');
                button.parentElement.appendChild(status);
            }
            button.disabled = true;
            try {
                await navigator.clipboard.writeText(address);
                status.textContent = isFeed ? 'Feed link copied. Add it to your RSS reader.' : 'Article link copied.';
            } catch (_) {
                status.textContent = `Copy this address: ${address}`;
            } finally {
                button.disabled = false;
            }
        });
    });

    const article = document.querySelector('.prose');
    const progress = document.querySelector('[data-reading-progress]');
    if (!article || !progress) return;

    const headings = [...article.querySelectorAll('h2[id]')];
    const contentsLinks = [...document.querySelectorAll('.toc a, .toc-mobile a')];
    let queued = false;
    function updateReadingPosition() {
        const rect = article.getBoundingClientRect();
        const headerHeight = document.querySelector('.site-header').offsetHeight;
        const distance = Math.max(1, rect.height - window.innerHeight + headerHeight);
        const amount = Math.min(1, Math.max(0, (headerHeight - rect.top) / distance));
        progress.style.transform = `scaleX(${amount})`;
        let activeId = null;
        headings.forEach(heading => {
            if (heading.getBoundingClientRect().top <= headerHeight + 100) activeId = heading.id;
        });
        contentsLinks.forEach(link => {
            if (link.hash === `#${activeId}`) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
        queued = false;
    }
    function scheduleUpdate() {
        if (!queued) {
            queued = true;
            requestAnimationFrame(updateReadingPosition);
        }
    }
    addEventListener('scroll', scheduleUpdate, { passive: true });
    addEventListener('resize', scheduleUpdate);
    addEventListener('load', scheduleUpdate, { once: true });
    document.fonts?.ready.then(scheduleUpdate);
    updateReadingPosition();
})();
