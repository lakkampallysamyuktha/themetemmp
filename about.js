/* ════════════════════════════════════════════════════════
   STACKLY — ABOUT PAGE INTERACTIONS (v4)
   home.js (loaded first) already covers the shared shell:
   particles, image fallback, mobile menu, scroll reveals,
   back to top, smooth scroll, partner marquee cloning.

   This file adds what's unique to this page's components:
   - Mission statement word-by-word stagger reveal
   - Readout panel counters (.rr-value — separate from
     home.js's .stats-strip .stat-number counters)
   - Auto-scroll history marquee (clones cards for infinite loop)
   - Team feature click-to-swap support
   - Locks the "About" nav link as always-active on this page
════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {

    // ─── MISSION STATEMENT — split into words for staggered reveal ───
    const missionSplit = document.querySelector('.mission-split');
    if (missionSplit) {
        const walker = document.createTreeWalker(missionSplit, NodeFilter.SHOW_TEXT, null);
        const textNodes = [];
        let node;
        while ((node = walker.nextNode())) {
            if (node.textContent.trim().length) textNodes.push(node);
        }
        let wordIndex = 0;
        textNodes.forEach(function(textNode) {
            const parts = textNode.textContent.split(/(\s+)/);
            const frag = document.createDocumentFragment();
            parts.forEach(function(part) {
                if (part.trim().length === 0) {
                    frag.appendChild(document.createTextNode(part));
                } else {
                    const span = document.createElement('span');
                    span.className = 'word';
                    span.textContent = part;
                    span.style.animationDelay = (wordIndex * 28) + 'ms';
                    wordIndex++;
                    frag.appendChild(span);
                }
            });
            textNode.parentNode.replaceChild(frag, textNode);
        });
    }

    // ─── MISSION STATEMENT — trigger word reveal on scroll into view ───
    if (missionSplit) {
        if ('IntersectionObserver' in window) {
            const missionObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        missionObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3, rootMargin: '0px 0px -40px 0px' });
            missionObserver.observe(missionSplit);
        } else {
            missionSplit.classList.add('in-view');
        }
    }

    // ─── LOCK "ABOUT" NAV LINK AS ALWAYS ACTIVE ───
    document.querySelectorAll('.nav a').forEach(function(link) {
        if (link.getAttribute('href') === 'about.html') {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    var aboutNavLink = document.querySelector('.nav a[href="about.html"]');
    if (aboutNavLink) {
        window.addEventListener('scroll', function() {
            document.querySelectorAll('.nav a').forEach(function(l) {
                l.classList.remove('active');
            });
            aboutNavLink.classList.add('active');
        }, { passive: true });
    }

    // ─── READOUT PANEL COUNTERS ───
    const rrValues = document.querySelectorAll('.rr-value');

    function runRRCounter(el) {
        if (el.dataset.counted) return;
        el.dataset.counted = '1';
        var target = parseInt(el.getAttribute('data-target') || el.textContent, 10);
        if (isNaN(target)) target = 0;
        var duration = 1800;
        var startTime = null;
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var easeOut = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(easeOut * target);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target;
            }
        }
        requestAnimationFrame(step);
    }

    if (rrValues.length) {
        if ('IntersectionObserver' in window) {
            const rrObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        runRRCounter(entry.target);
                        rrObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            rrValues.forEach(function(el) { rrObserver.observe(el); });
        } else {
            rrValues.forEach(function(el) { runRRCounter(el); });
        }
    }

    // ─── HISTORY AUTO-SCROLL MARQUEE ───
    const historyTrack = document.querySelector('.history-track');
    if (historyTrack) {
        const originalCards = Array.from(historyTrack.children);
        if (originalCards.length > 0) {
            originalCards.forEach(function(card) {
                historyTrack.appendChild(card.cloneNode(true));
            });
        }
    }

    // ─── TEAM FEATURE — click a pick, swap the big photo + info ───
    const picks = document.querySelectorAll('.team-pick');
    const featuredImg = document.getElementById('teamFeaturedImg');
    const featuredBadge = document.getElementById('teamFeaturedBadge');
    const featuredRole = document.getElementById('teamFeaturedRole');
    const featuredName = document.getElementById('teamFeaturedName');
    const featuredBio = document.getElementById('teamFeaturedBio');
    const featuredJoined = document.getElementById('teamFeaturedJoined');
    const featuredFocus = document.getElementById('teamFeaturedFocus');
    const featuredLink = document.getElementById('teamFeaturedLink');

    function showTeamPick(btn) {
        picks.forEach(function(p) {
            p.classList.remove('active');
            p.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        if (featuredImg) {
            featuredImg.style.animation = 'none';
            void featuredImg.offsetWidth;
            featuredImg.style.animation = '';
            featuredImg.src = btn.getAttribute('data-img');
            featuredImg.alt = btn.getAttribute('data-name') || '';
        }
        if (featuredBadge) featuredBadge.textContent = btn.getAttribute('data-badge') || '';
        if (featuredRole) featuredRole.textContent = btn.getAttribute('data-role') || '';
        if (featuredName) featuredName.textContent = btn.getAttribute('data-name') || '';
        if (featuredBio) featuredBio.textContent = btn.getAttribute('data-bio') || '';
        if (featuredJoined) featuredJoined.textContent = btn.getAttribute('data-joined') || '';
        if (featuredFocus) featuredFocus.textContent = btn.getAttribute('data-focus') || '';
        if (featuredLink) featuredLink.setAttribute('aria-label', 'LinkedIn — ' + (btn.getAttribute('data-name') || ''));
    }

    picks.forEach(function(btn) {
        btn.addEventListener('click', function() { showTeamPick(btn); });
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showTeamPick(btn);
            }
        });
    });

});