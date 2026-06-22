/* ════════════════════════════════════════════════════════
   STACKLY — CONTACT PAGE INTERACTIONS
   home.js (loaded first) covers: particles, mobile menu,
   back-to-top, smooth scroll.

   This file adds:
   - Locks "Contact" nav link as always-active
   - Scroll reveal (.reveal → .is-visible)
   - Multi-step form with validation, char counter, submit sim
   - FAQ accordion
   - Clear form when returning from 404 (using sessionStorage)
   - Clear newsletter emails (footer + blog CTA) on return
════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

    // ─── LOCK "CONTACT" NAV LINK AS ALWAYS ACTIVE ───
    var contactLink = document.querySelector('.nav a[href="contact.html"]');
    function lockContactNav() {
        document.querySelectorAll('.nav a').forEach(function (l) { l.classList.remove('active'); });
        if (contactLink) contactLink.classList.add('active');
    }
    lockContactNav();
    window.addEventListener('scroll', lockContactNav, { passive: true });

    // ─── SCROLL REVEAL ───
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
                setTimeout(function () { el.classList.add('is-visible'); }, delay);
                obs.unobserve(el);
            });
        }, { threshold: 0.1 });
        revealEls.forEach(function (el) { obs.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }

    // ─── MULTI-STEP FORM ───
    var form       = document.getElementById('contactFormEl');
    var pages      = form ? form.querySelectorAll('.cf-page') : [];
    var steps      = document.querySelectorAll('.cf-step');
    var stepLines  = document.querySelectorAll('.cf-step-line');
    var successEl  = document.getElementById('cfSuccess');
    var resetBtn   = document.getElementById('cfReset');
    var currentPage = 1;

    function goToPage(n) {
        pages.forEach(function (p) {
            p.classList.remove('active');
            if (parseInt(p.getAttribute('data-page'), 10) === n) {
                p.classList.add('active');
            }
        });
        updateSteps(n);
        currentPage = n;
    }

    function updateSteps(active) {
        steps.forEach(function (s, i) {
            var num = i + 1;
            s.classList.remove('active', 'done');
            if (num < active) s.classList.add('done');
            else if (num === active) s.classList.add('active');
        });
        stepLines.forEach(function (line, i) {
            line.classList.toggle('done', i + 1 < active);
        });
    }

    // Validate a single fieldset
    function validatePage(n) {
        var page = form ? form.querySelector('.cf-page[data-page="' + n + '"]') : null;
        if (!page) return true;
        var fields = page.querySelectorAll('[required]');
        var valid = true;
        fields.forEach(function (f) {
            f.classList.remove('error');
            if (!f.value.trim() || (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value))) {
                f.classList.add('error');
                valid = false;
                f.animate([
                    { transform: 'translateX(-4px)' },
                    { transform: 'translateX(4px)' },
                    { transform: 'translateX(-3px)' },
                    { transform: 'translateX(3px)' },
                    { transform: 'translateX(0)' }
                ], { duration: 320, easing: 'ease' });
            }
        });
        // Show/hide error message
        var errorMsg = document.getElementById('cf-error-msg');
        if (errorMsg) {
            errorMsg.style.display = valid ? 'none' : 'block';
        }
        return valid;
    }

    // ─── NEXT / BACK BUTTONS ───
    document.querySelectorAll('.cf-next').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var goto = parseInt(btn.getAttribute('data-goto'), 10);
            if (!validatePage(currentPage)) return;
            goToPage(goto);
        });
    });

    document.querySelectorAll('.cf-back').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var goto = parseInt(btn.getAttribute('data-goto'), 10);
            goToPage(goto);
        });
    });

    // ─── SUBMIT – set flag, then redirect to 404.html ───
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!validatePage(currentPage)) return;

            var submitBtn = form.querySelector('.cf-submit');
            submitBtn && submitBtn.classList.add('loading');

            setTimeout(function () {
                submitBtn && submitBtn.classList.remove('loading');
                // Set flag in sessionStorage
                sessionStorage.setItem('contactFormSubmitted', 'true');
                // Redirect to 404.html
                window.location.href = '404.html';
            }, 1600);
        });
    }

    // ─── RESET FORM (existing reset button) ───
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            if (form) form.reset();
            if (successEl) successEl.classList.remove('show');
            var charCount = document.getElementById('cfCharCount');
            if (charCount) charCount.textContent = '0';
            goToPage(1);
        });
    }

    // ─── CHARACTER COUNTER ───
    var msgArea   = document.getElementById('cfMessage');
    var charCount = document.getElementById('cfCharCount');
    var maxChars  = 600;
    if (msgArea && charCount) {
        msgArea.addEventListener('input', function () {
            var len = msgArea.value.length;
            if (len > maxChars) {
                msgArea.value = msgArea.value.substring(0, maxChars);
                len = maxChars;
            }
            charCount.textContent = len;
            charCount.style.color = len >= maxChars ? '#e53e3e' : '';
        });
    }

    // ─── CLEAR CONTACT FORM ON BACK FROM 404 ───
    function clearFormIfReturned() {
        if (sessionStorage.getItem('contactFormSubmitted') === 'true') {
            // Clear all form fields
            if (form) form.reset();
            // Reset character counter
            var charCountEl = document.getElementById('cfCharCount');
            if (charCountEl) charCountEl.textContent = '0';
            // Hide error message
            var errorMsg = document.getElementById('cf-error-msg');
            if (errorMsg) errorMsg.style.display = 'none';
            // Go back to step 1
            goToPage(1);
            // Remove flag
            sessionStorage.removeItem('contactFormSubmitted');
        }
    }

    // ─── CLEAR NEWSLETTER EMAILS ON BACK FROM 404 ───
    function clearNewsletterIfReturned() {
        if (sessionStorage.getItem('newsletterSubmitted') === 'true') {
            // Clear footer newsletter
            var footerInputs = document.querySelectorAll('.newsletter-pill-form input[type="email"]');
            footerInputs.forEach(function(input) { input.value = ''; });
            // Clear blog CTA newsletter
            var ctaInputs = document.querySelectorAll('.blog-cta-form input[type="email"]');
            ctaInputs.forEach(function(input) { input.value = ''; });
            // Remove flag
            sessionStorage.removeItem('newsletterSubmitted');
        }
    }

    // Run on page load and when returning from bfcache
    document.addEventListener('DOMContentLoaded', function() {
        clearFormIfReturned();
        clearNewsletterIfReturned();
    });
    window.addEventListener('pageshow', function() {
        clearFormIfReturned();
        clearNewsletterIfReturned();
    });

    // ─── FAQ ACCORDION ───
    var faqBtns = document.querySelectorAll('.cq-q');
    faqBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var expanded = btn.getAttribute('aria-expanded') === 'true';
            var answer   = btn.nextElementSibling;

            faqBtns.forEach(function (b) {
                if (b !== btn) {
                    b.setAttribute('aria-expanded', 'false');
                    var a = b.nextElementSibling;
                    if (a) a.classList.remove('open');
                }
            });

            btn.setAttribute('aria-expanded', String(!expanded));
            if (answer) answer.classList.toggle('open', !expanded);
        });
    });

});