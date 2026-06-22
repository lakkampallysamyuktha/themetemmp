/* ════════════════════════════════════════════════════════
   STACKLY — RESEARCH PAGE INTERACTIONS (v2)
   home.js (loaded first) already covers the shared shell.
   This file adds page‑specific features.
════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {

    // ─── LOCK "RESEARCH" NAV LINK AS ALWAYS ACTIVE ───
    var researchNavLink = document.querySelector('.nav a[href="research.html"]');
    function lockResearchNav() {
        document.querySelectorAll('.nav a').forEach(function(l) {
            l.classList.remove('active');
        });
        if (researchNavLink) researchNavLink.classList.add('active');
    }
    lockResearchNav();
    window.addEventListener('scroll', lockResearchNav, { passive: true });

    // ─── PUBLICATIONS: SEARCH + FILTER ───
    const searchInput = document.getElementById('pubSearchInput');
    const filterChips = document.querySelectorAll('#pubFilters .pub-chip');
    const pubCards = document.querySelectorAll('#pubGrid .pub-card');
    const countPill = document.getElementById('pubCountPill');
    const emptyState = document.getElementById('pubEmpty');

    let activeFilter = 'all';

    function applyPubFilters() {
        var query = (searchInput && searchInput.value || '').trim().toLowerCase();
        var visibleCount = 0;

        pubCards.forEach(function(card) {
            var domain = card.getAttribute('data-domain');
            var haystack = (card.getAttribute('data-search') || '') + ' ' +
                            (card.querySelector('h4') ? card.querySelector('h4').textContent.toLowerCase() : '');
            var matchesDomain = activeFilter === 'all' || domain === activeFilter;
            var matchesQuery = !query || haystack.toLowerCase().indexOf(query) !== -1;

            if (matchesDomain && matchesQuery) {
                card.classList.remove('is-hidden');
                visibleCount++;
            } else {
                card.classList.add('is-hidden');
            }
        });

        if (countPill) {
            countPill.textContent = visibleCount + (visibleCount === 1 ? ' paper' : ' papers');
        }
        if (emptyState) {
            emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyPubFilters);
    }

    filterChips.forEach(function(chip) {
        chip.addEventListener('click', function() {
            filterChips.forEach(function(c) { c.classList.remove('active'); });
            chip.classList.add('active');
            activeFilter = chip.getAttribute('data-filter');
            applyPubFilters();
        });
    });

    applyPubFilters();

    // ─── LAB CONSOLE: RE-TRIGGER FEED ROW ANIMATION ON SCROLL ───
    const labFeed = document.getElementById('labFeed');
    if (labFeed && 'IntersectionObserver' in window) {
        const feedRows = labFeed.querySelectorAll('.lab-feed-row');
        const feedObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    feedRows.forEach(function(row, i) {
                        row.style.animation = 'none';
                        void row.offsetWidth;
                        row.style.animation = '';
                        row.style.animationDelay = (i * 0.1 + 0.05) + 's';
                    });
                    feedObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        feedObserver.observe(labFeed);
    }

    // ─── CONSOLE METRICS: COUNT-UP TICKERS ───
    const tickEls = document.querySelectorAll('.lcf-tick');

    function runTick(el) {
        if (el.dataset.counted) return;
        el.dataset.counted = '1';
        var target = parseFloat(el.getAttribute('data-target'));
        if (isNaN(target)) target = 0;
        var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1600;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var easeOut = 1 - Math.pow(1 - progress, 3);
            var current = easeOut * target;
            el.textContent = current.toFixed(decimals) + suffix;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target.toFixed(decimals) + suffix;
            }
        }
        requestAnimationFrame(step);
    }

    if (tickEls.length) {
        if ('IntersectionObserver' in window) {
            const tickObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        runTick(entry.target);
                        tickObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.4 });
            tickEls.forEach(function(el) { tickObserver.observe(el); });
        } else {
            tickEls.forEach(function(el) { runTick(el); });
        }
    }
});