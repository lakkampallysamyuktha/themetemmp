/* ════════════════════════════════════════════════════════
   STACKLY — HOME PAGE INTERACTIONS
   (Includes newsletter clearing on back from 404)
════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {

    // ─── UNIVERSAL IMAGE FALLBACK ───
    function placeholderFor(img) {
        var label = (img.getAttribute('alt') || 'Image').trim();
        var w = img.getAttribute('width') || img.naturalWidth || 600;
        var h = img.getAttribute('height') || img.naturalHeight || 400;
        var text = encodeURIComponent(label.length > 28 ? label.slice(0, 28) + '…' : label);
        return 'https://placehold.co/' + w + 'x' + h + '/0f6b6b/ffffff?text=' + text;
    }
    document.querySelectorAll('img').forEach(function(img) {
        img.addEventListener('error', function handler() {
            img.removeEventListener('error', handler);
            img.src = placeholderFor(img);
            img.style.objectFit = img.style.objectFit || 'cover';
        });
        if (img.complete && img.naturalWidth === 0 && img.src) {
            img.src = placeholderFor(img);
        }
    });

    // ─── PARTICLES ───
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 50, density: { enable: true, value_area: 800 } },
                color: { value: '#0f6b6b' },
                shape: { type: 'circle' },
                opacity: { value: 0.3, random: true },
                size: { value: 2, random: true },
                line_linked: { enable: true, distance: 150, color: '#0f6b6b', opacity: 0.12, width: 1 },
                move: { enable: true, speed: 1, direction: 'none', random: true, out_mode: 'out' }
            },
            interactivity: {
                detect_on: 'canvas',
                events: { onhover: { enable: true, mode: 'repulse' }, resize: true }
            }
        });
    }

    // ─── MOBILE MENU ───
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');
    if (hamburger && nav) {
        hamburger.addEventListener('click', function() {
            var isOpen = nav.classList.toggle('open');
            hamburger.classList.toggle('open', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
        nav.querySelectorAll('a, .btn').forEach(function(link) {
            link.addEventListener('click', function() {
                hamburger.classList.remove('open');
                nav.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                hamburger.classList.remove('open');
                nav.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    // ─── SCROLL REVEAL: fade-in-up/left/right ───
    const hiddenElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var delay = parseInt(entry.target.getAttribute('data-delay')) || 0;
                setTimeout(function() {
                    entry.target.classList.add('visible');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    hiddenElements.forEach(function(el) { observer.observe(el); });

    // ─── SCROLL REVEAL: .reveal ───
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var delay = parseInt(entry.target.getAttribute('data-delay')) || 0;
                setTimeout(function() {
                    entry.target.classList.add('in-view');
                }, delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealElements.forEach(function(el) { revealObserver.observe(el); });

    // ─── STATS CIRCLE ANIMATION ───
    const statCircles = document.querySelectorAll('.stat-circle-item');
    if (statCircles.length) {
        const circleObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    circleObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        statCircles.forEach(function(el) {
            circleObserver.observe(el);
        });
    }

    // ─── RESEARCH TABS ───
    const tabs = document.querySelectorAll('.research-tab');
    const panels = {
        health: document.querySelector('.research-panel[data-domain="health"]'),
        space: document.querySelector('.research-panel[data-domain="space"]'),
        environment: document.querySelector('.research-panel[data-domain="environment"]'),
        energy: document.querySelector('.research-panel[data-domain="energy"]'),
        biotech: document.querySelector('.research-panel[data-domain="biotech"]'),
        robotics: document.querySelector('.research-panel[data-domain="robotics"]'),
        ai: document.querySelector('.research-panel[data-domain="ai"]')
    };

    function activateTab(domain) {
        tabs.forEach(function(tab) {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        });
        const activeTab = document.querySelector('.research-tab[data-domain="' + domain + '"]');
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.setAttribute('aria-selected', 'true');
        }
        Object.keys(panels).forEach(function(key) {
            if (panels[key]) {
                panels[key].classList.remove('active');
            }
        });
        if (panels[domain]) {
            panels[domain].classList.add('active');
        }
    }

    tabs.forEach(function(tab) {
        tab.addEventListener('click', function(e) {
            var domain = this.getAttribute('data-domain');
            activateTab(domain);
        });
    });

    // ─── TIMELINE FILL ───
    const timelineTrack = document.getElementById('timelineTrack');
    const timelineFill = document.getElementById('timelineFill');
    const timelineSteps = document.querySelectorAll('.timeline-step');

    if (timelineTrack && timelineFill && timelineSteps.length) {
        function updateTimelineFill() {
            const rect = timelineTrack.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const trackTop = rect.top;
            const trackHeight = rect.height;
            const viewportLine = windowHeight * 0.55;

            let progress = (viewportLine - trackTop) / trackHeight;
            progress = Math.max(0, Math.min(1, progress));

            timelineFill.style.height = (progress * 100) + '%';
        }

        window.addEventListener('scroll', updateTimelineFill);
        window.addEventListener('resize', updateTimelineFill);
        setTimeout(updateTimelineFill, 100);
        updateTimelineFill();
    }

    // ─── BACK TO TOP ───
    var backToTop = document.querySelector('.back-to-top-circle');
    if (backToTop) {
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ─── SMOOTH SCROLL FOR ANCHOR LINKS ───
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                var headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                var targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // ─── ACTIVE NAV LINK ───
    var navLinks = document.querySelectorAll('.nav a');
    var homeNavLink = document.querySelector('.nav a[href="index.html"]');
    if (homeNavLink) {
        navLinks.forEach(function(l) { l.classList.remove('active'); });
        homeNavLink.classList.add('active');
        window.addEventListener('scroll', function() {
            navLinks.forEach(function(l) { l.classList.remove('active'); });
            homeNavLink.classList.add('active');
        }, { passive: true });
    }

    // ─── PARTNER MARQUEE ───
    const partnerTrack = document.querySelector('.partner-track');
    if (partnerTrack) {
        const originalLogos = Array.from(partnerTrack.children);
        if (originalLogos.length > 0) {
            originalLogos.forEach(function(logo) {
                partnerTrack.appendChild(logo.cloneNode(true));
            });
        }
    }

    // ─── TESTIMONIAL MARQUEE ───
    const testiTrack = document.querySelector('.testi-track');
    if (testiTrack) {
        const originalCards = Array.from(testiTrack.children);
        if (originalCards.length > 0) {
            originalCards.forEach(function(card) {
                testiTrack.appendChild(card.cloneNode(true));
            });
        }
    }

    // ─── PROJECT PICKER — HOVER ───
    const projectCards = document.querySelectorAll('.proj-card');
    const featureImg = document.getElementById('featuredImg');
    const featureBadge = document.getElementById('featuredBadge');
    const featureTag = document.getElementById('featuredTag');
    const featureTitle = document.getElementById('featuredTitle');
    const featureDesc = document.getElementById('featuredDesc');
    const featureProgressLabel = document.getElementById('featuredProgressLabel');
    const featureProgressPct = document.getElementById('featuredProgressPct');
    const featureProgressFill = document.getElementById('featuredProgressFill');
    const featureYears = document.getElementById('featuredYears');
    const featurePubs = document.getElementById('featuredPubs');
    const featurePartner = document.getElementById('featuredPartner');
    const featureLink = document.getElementById('featuredLink');

    function updateFeaturedProject(card) {
        const img = card.getAttribute('data-img') || card.querySelector('img')?.src || '';
        const tag = card.getAttribute('data-tag') || card.querySelector('.proj-domain-tag')?.textContent || '';
        const tagClass = card.getAttribute('data-tag-class') || card.querySelector('.proj-domain-tag')?.className || '';
        const title = card.getAttribute('data-title') || card.querySelector('h4')?.textContent || '';
        const desc = card.getAttribute('data-desc') || card.querySelector('p')?.textContent || '';
        const progress = card.getAttribute('data-progress') || '50';
        const progressLabel = card.getAttribute('data-progress-label') || 'Phase: In progress';
        const statYears = card.getAttribute('data-stats-years') || '2';
        const statPubs = card.getAttribute('data-stats-pubs') || '4';
        const statPartner = card.getAttribute('data-stats-partner') || 'Partner';
        const link = card.getAttribute('data-link') || 'projects.html';

        if (featureImg) {
            featureImg.src = img;
            featureImg.alt = title;
        }
        if (featureBadge) featureBadge.textContent = tag + ' · Featured';
        if (featureTag) {
            const baseClass = featureTag.className.split(' ').filter(c => !c.startsWith('pdt-')).join(' ');
            featureTag.className = baseClass + ' ' + tagClass;
            featureTag.textContent = tag;
        }
        if (featureTitle) featureTitle.textContent = title;
        if (featureDesc) featureDesc.textContent = desc;
        if (featureProgressLabel) featureProgressLabel.textContent = progressLabel;
        if (featureProgressPct) featureProgressPct.textContent = progress + '%';
        if (featureProgressFill) featureProgressFill.style.width = progress + '%';
        if (featureYears) featureYears.textContent = statYears;
        if (featurePubs) featurePubs.textContent = statPubs;
        if (featurePartner) featurePartner.textContent = statPartner;
        if (featureLink) featureLink.setAttribute('href', link);

        projectCards.forEach(function(p) {
            p.classList.remove('active');
        });
        card.classList.add('active');
    }

    if (projectCards.length > 0) {
        projectCards[0].classList.add('active');
        projectCards.forEach(function(card) {
            card.addEventListener('mouseenter', function() {
                updateFeaturedProject(card);
            });
            card.addEventListener('focus', function() {
                updateFeaturedProject(card);
            });
        });
    }

    // ─── NEWSLETTER FORM – set flag on submit ───
    var newsletterForms = document.querySelectorAll('.newsletter-pill-form');
    newsletterForms.forEach(function(form) {
        form.addEventListener('submit', function() {
            sessionStorage.setItem('newsletterSubmitted', 'true');
        });
    });

    // ─── CLEAR NEWSLETTER EMAIL ON BACK FROM 404 ───
    function clearNewsletterIfReturned() {
        if (sessionStorage.getItem('newsletterSubmitted') === 'true') {
            var newsletterInputs = document.querySelectorAll('.newsletter-pill-form input[type="email"]');
            newsletterInputs.forEach(function(input) {
                input.value = '';
            });
            sessionStorage.removeItem('newsletterSubmitted');
        }
    }

    // Run on page load and when returning from bfcache
    document.addEventListener('DOMContentLoaded', clearNewsletterIfReturned);
    window.addEventListener('pageshow', clearNewsletterIfReturned);

});
