/* ════════════════════════════════════════════════════════
   STACKLY — BLOG PAGE INTERACTIONS
   home.js (loaded first) already covers the shared shell:
   particles, image fallback, mobile menu, back to top,
   smooth scroll, partner marquee cloning.

   This file adds what's unique to the blog page:
   - Locks the "Blog" nav link as always-active
   - Hero counter animation (.bhs-num) with optional abbr format
   - Blog search + domain filter chips, combined
   - Empty-state message
   - Clear-search button visibility
   - Scroll-reveal (.reveal) for blog-specific elements
   - Topic tile click → scroll to grid + apply filter
════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

    // ─── LOCK "BLOG" NAV LINK AS ALWAYS ACTIVE ───
    var blogNavLink = document.querySelector('.nav a[href="blog.html"]');
    function lockBlogNav() {
        document.querySelectorAll('.nav a').forEach(function (l) { l.classList.remove('active'); });
        if (blogNavLink) blogNavLink.classList.add('active');
    }
    lockBlogNav();
    window.addEventListener('scroll', lockBlogNav, { passive: true });

    // ─── REVEAL ON SCROLL ───
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var revealObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
                setTimeout(function () { el.classList.add('is-visible'); }, delay);
                revealObs.unobserve(el);
            });
        }, { threshold: 0.12 });
        revealEls.forEach(function (el) { revealObs.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }

    // ─── HERO STAT COUNTERS (.bhs-num) ───
    var bhsNums = document.querySelectorAll('.bhs-num');

    function formatAbbr(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (n >= 1000)    return (n / 1000).toFixed(0) + 'K';
        return String(n);
    }

    function runBhsCounter(el) {
        if (el.dataset.counted) return;
        el.dataset.counted = '1';
        var target = parseInt(el.getAttribute('data-target') || '0', 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var isAbbr = el.getAttribute('data-format') === 'abbr';
        var duration = 1800;
        var startTime = null;
        function step(ts) {
            if (!startTime) startTime = ts;
            var progress = Math.min((ts - startTime) / duration, 1);
            var ease = 1 - Math.pow(1 - progress, 3);
            var current = Math.floor(ease * target);
            el.textContent = isAbbr ? formatAbbr(current) + suffix : current + suffix;
            if (progress < 1) { requestAnimationFrame(step); }
            else { el.textContent = isAbbr ? formatAbbr(target) + suffix : target + suffix; }
        }
        requestAnimationFrame(step);
    }

    if (bhsNums.length) {
        if ('IntersectionObserver' in window) {
            var bhsObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        runBhsCounter(entry.target);
                        bhsObs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.4 });
            bhsNums.forEach(function (el) { bhsObs.observe(el); });
        } else {
            bhsNums.forEach(function (el) { runBhsCounter(el); });
        }
    }

    // ─── SEARCH + FILTER ───
    var searchInput  = document.getElementById('blogSearchInput');
    var bsClear      = document.getElementById('bsClear');
    var filterChips  = document.querySelectorAll('#blogFilters .blog-chip');
    var blogCards    = document.querySelectorAll('#blogCardsGrid .blog-card');
    var countPill    = document.getElementById('blogCountPill');
    var emptyState   = document.getElementById('blogEmpty');
    var activeFilter = 'all';

    function applyFilters() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var visible = 0;

        blogCards.forEach(function (card) {
            var domain   = card.getAttribute('data-domain') || '';
            var title    = (card.querySelector('.bc-title')   || {}).textContent || '';
            var excerpt  = (card.querySelector('.bc-excerpt') || {}).textContent || '';
            var author   = (card.querySelector('.bc-author')  || {}).textContent || '';
            var haystack = (title + ' ' + excerpt + ' ' + author + ' ' + domain).toLowerCase();

            var matchDomain = activeFilter === 'all' || domain === activeFilter;
            var matchQuery  = !query || haystack.indexOf(query) !== -1;

            if (matchDomain && matchQuery) {
                card.classList.remove('is-hidden');
                visible++;
            } else {
                card.classList.add('is-hidden');
            }
        });

        if (countPill) countPill.textContent = visible + (visible === 1 ? ' article' : ' articles');
        if (emptyState) emptyState.style.display = visible === 0 ? 'block' : 'none';

        // clear button visibility
        if (bsClear) bsClear.classList.toggle('visible', query.length > 0);
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    if (bsClear) {
        bsClear.addEventListener('click', function () {
            if (searchInput) { searchInput.value = ''; searchInput.focus(); }
            applyFilters();
        });
    }

    filterChips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            filterChips.forEach(function (c) { c.classList.remove('active'); });
            chip.classList.add('active');
            activeFilter = chip.getAttribute('data-filter');
            applyFilters();
        });
    });

    applyFilters();

    // ─── TOPIC TILES → scroll to grid + apply filter ───
    var topicTiles = document.querySelectorAll('.topic-tile[data-filter]');
    topicTiles.forEach(function (tile) {
        tile.addEventListener('click', function (e) {
            e.preventDefault();
            var filter = tile.getAttribute('data-filter');
            // activate matching chip
            filterChips.forEach(function (chip) {
                if (chip.getAttribute('data-filter') === filter) {
                    chip.click();
                }
            });
            // scroll to grid
            var gridSection = document.getElementById('blogGrid');
            if (gridSection) {
                var offset = 100;
                var top = gridSection.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    // ─── LOAD MORE BUTTON (stub — shows a toast) ───
    var loadMoreBtn = document.getElementById('blogLoadMore');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function () {
            loadMoreBtn.textContent = 'All articles loaded ✓';
            loadMoreBtn.disabled = true;
            loadMoreBtn.style.opacity = '0.5';
            loadMoreBtn.style.cursor = 'default';
        });
    }

});