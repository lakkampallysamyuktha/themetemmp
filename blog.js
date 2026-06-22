/* ════════════════════════════════════════════════════════
   STACKLY — BLOG PAGE INTERACTIONS
   (Search now redirects to 404.html – filtering removed)
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

    // ─── SEARCH CLEAR BUTTON (visual only) ───
    var searchInput = document.getElementById('blogSearchInput');
    var bsClear     = document.getElementById('bsClear');

    if (bsClear && searchInput) {
        searchInput.addEventListener('input', function () {
            bsClear.classList.toggle('visible', this.value.length > 0);
        });
        bsClear.addEventListener('click', function () {
            searchInput.value = '';
            searchInput.focus();
            bsClear.classList.remove('visible');
        });
    }

    // ─── TOPIC TILES → scroll to grid + apply filter ───
    var filterChips = document.querySelectorAll('#blogFilters .blog-chip');
    var blogCards   = document.querySelectorAll('#blogCardsGrid .blog-card');
    var countPill   = document.getElementById('blogCountPill');
    var emptyState  = document.getElementById('blogEmpty');
    var activeFilter = 'all';

    function applyFilters() {
        var visible = 0;
        blogCards.forEach(function (card) {
            var domain = card.getAttribute('data-domain') || '';
            var matchDomain = activeFilter === 'all' || domain === activeFilter;
            if (matchDomain) {
                card.classList.remove('is-hidden');
                visible++;
            } else {
                card.classList.add('is-hidden');
            }
        });
        if (countPill) countPill.textContent = visible + (visible === 1 ? ' article' : ' articles');
        if (emptyState) emptyState.style.display = visible === 0 ? 'block' : 'none';
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

    // ─── TOPIC TILES → scroll to grid + activate filter ───
    var topicTiles = document.querySelectorAll('.topic-tile[data-filter]');
    topicTiles.forEach(function (tile) {
        tile.addEventListener('click', function (e) {
            e.preventDefault();
            var filter = tile.getAttribute('data-filter');
            filterChips.forEach(function (chip) {
                if (chip.getAttribute('data-filter') === filter) {
                    chip.click();
                }
            });
            var gridSection = document.getElementById('blogGrid');
            if (gridSection) {
                var offset = 100;
                var top = gridSection.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    // ─── LOAD MORE BUTTON ───
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
