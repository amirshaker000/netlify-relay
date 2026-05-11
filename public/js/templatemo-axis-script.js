/*

TemplateMo 619 Axis Industrial

https://templatemo.com/tm-619-axis-industrial

*/

/* ============================================================
   AXIS INDUSTRIAL — COMMON JAVASCRIPT
   ============================================================ */

(function () {
    'use strict';

    /* ---- UTC Clock ---- */
    const clockEl = document.getElementById('utcClock');
    if (clockEl) {
        function updateClock() {
            const n = new Date();
            clockEl.textContent =
                String(n.getUTCHours()).padStart(2, '0') + ':' +
                String(n.getUTCMinutes()).padStart(2, '0') + ':' +
                String(n.getUTCSeconds()).padStart(2, '0') + ' UTC';
        }
        updateClock();
        setInterval(updateClock, 1000);
    }

    /* ---- Mobile Nav Toggle ---- */
    const burger = document.getElementById('headerBurger');
    const nav = document.getElementById('headerNav');
    if (burger && nav) {
        burger.addEventListener('click', function () {
            const isOpen = nav.classList.toggle('open');
            burger.setAttribute('aria-expanded', isOpen);
        });

        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                nav.classList.remove('open');
                burger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ---- Scroll Reveal (IntersectionObserver with stagger) ---- */
    var reveals = document.querySelectorAll('.reveal');
    if (reveals.length) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var siblings = entry.target.parentElement.querySelectorAll('.reveal');
                    var index = Array.from(siblings).indexOf(entry.target);
                    entry.target.style.transitionDelay = (index * 0.08) + 's';
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -30px 0px'
        });

        /* Fallback: force reveal after 3s for iframe previews */
        setTimeout(function () {
            reveals.forEach(function (el) {
                if (!el.classList.contains('visible')) {
                    el.classList.add('visible');
                }
            });
        }, 3000);

        reveals.forEach(function (el) { revealObserver.observe(el); });
    }

    /* ---- Bar Fill Animation on Scroll ---- */
    var barFills = document.querySelectorAll('.bar-track__fill');
    barFills.forEach(function (bar) {
        var targetWidth = bar.style.width;
        bar.style.width = '0%';

        var barObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    setTimeout(function () { bar.style.width = targetWidth; }, 250);
                    barObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        barObserver.observe(bar);
    });

    /* ---- Back to Top Button ---- */
    var backTop = document.getElementById('backToTop');
    if (backTop) {
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

})();
