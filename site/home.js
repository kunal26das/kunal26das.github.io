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

    const repositories = [...document.querySelectorAll('.repository')];
    const filters = [...document.querySelectorAll('[data-repo-filter]')];
    const controls = document.querySelector('[data-repo-controls]');
    const count = document.querySelector('[data-repo-count]');
    if (controls && count) {
        controls.hidden = false;
        filters.forEach(button => button.addEventListener('click', () => {
            const selected = button.dataset.repoFilter;
            let visible = 0;
            repositories.forEach(repository => {
                repository.hidden = selected !== 'All' && repository.dataset.category !== selected;
                if (!repository.hidden) visible++;
            });
            filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
            count.textContent = `${visible} ${visible === 1 ? 'repository' : 'repositories'}`;
        }));
    }

    const next = document.querySelector('[data-sort-next]');
    const chart = document.querySelector('[data-sort-bars]');
    if (next && chart) {
        const values = [7, 3, 6, 2, 5, 1];
        const frames = [values.slice()];
        for (let end = values.length - 1; end > 0; end--) {
            for (let i = 0; i < end; i++) {
                if (values[i] > values[i + 1]) {
                    [values[i], values[i + 1]] = [values[i + 1], values[i]];
                    frames.push(values.slice());
                }
            }
        }
        const counter = document.querySelector('[data-sort-count]');
        const status = document.querySelector('[data-sort-status]');
        let step = 0;
        next.hidden = false;
        next.addEventListener('click', () => {
            step = step === frames.length - 1 ? 0 : step + 1;
            chart.querySelectorAll(':scope > div').forEach((bar, i) => {
                bar.style.setProperty('--bar', frames[step][i]);
                bar.querySelector('span').textContent = frames[step][i];
            });
            const finished = step === frames.length - 1;
            const description = `${finished ? 'Sorted values' : 'Values'}: ${frames[step].join(', ')}`;
            chart.setAttribute('aria-label', description);
            counter.textContent = `${step} / ${frames.length - 1}`;
            next.textContent = finished ? 'Replay ↺' : 'Next step →';
            status.textContent = `${finished ? 'Sorted.' : `Step ${step} of ${frames.length - 1}.`} ${description}.`;
        });
    }
})();
