// Pages de réalisation : sommaire, schéma interactif, frise, tests dépliables, immeuble cliquable.
(function () {
    'use strict';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

    /* ---- aller à une section ---- */
    function jump(id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
    }
    document.addEventListener('click', function (e) {
        var t = e.target.closest('[data-go]');
        if (!t) return;
        e.preventDefault();
        jump(t.getAttribute('data-go'));
    });
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var t = e.target;
        if (t && t.classList && t.classList.contains('hit')) { e.preventDefault(); jump(t.getAttribute('data-go')); }
    });

    /* ---- sommaire : section active ---- */
    var links = $$('.toc a');
    if (links.length && 'IntersectionObserver' in window) {
        var spy = new IntersectionObserver(function (es) {
            es.forEach(function (e) {
                if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-go') === e.target.id); });
            });
        }, { rootMargin: '-25% 0px -65% 0px' });
        $$('.sec').forEach(function (s) { spy.observe(s); });
    }

    /* ---- fiche d'information (schémas interactifs) ---- */
    var out = $('.fo');
    function show(key) {
        var f = null;
        $$('[data-fiche]').forEach(function (x) { if (x.getAttribute('data-fiche') === key) f = x; });
        if (out) out.innerHTML = f ? f.innerHTML : '';
    }

    /* ---- schéma de contexte : clic sur un bloc ---- */
    var nh = $$('.nhit');
    if (nh.length) {
        show('default');
        var pickN = function (el) {
            nh.forEach(function (n) { n.classList.toggle('sel', n === el); });
            show(el.getAttribute('data-p'));
        };
        nh.forEach(function (el) {
            el.addEventListener('click', function () { pickN(el); });
            el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickN(el); } });
        });
    }

    /* ---- schéma interactif ---- */
    var svg = $('.flux');
    function layers(n) { $$('[data-s]', svg).forEach(function (g) { g.classList.toggle('on', +g.getAttribute('data-s') <= n); }); }
    if (svg) {
        var timer = null;
        var play = function () {
            clearInterval(timer);
            if (reduce) { layers(4); return; }
            var n = -1; layers(-1);
            timer = setInterval(function () { n++; layers(n); if (n >= 4) clearInterval(timer); }, 600);
        };
        svg.classList.add('armed');
        show('default');
        function pick(id) {
            svg.setAttribute('data-sel', id);
            $$('.pair', svg).forEach(function (g) { g.classList.toggle('sel', g.getAttribute('data-p') === id); });
            show(id);
        }
        $$('.pair', svg).forEach(function (g) {
            g.addEventListener('click', function () { pick(g.getAttribute('data-p')); });
            g.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(g.getAttribute('data-p')); }
            });
        });
        if ('IntersectionObserver' in window) {
            layers(-1);
            var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); play(); } }); }, { threshold: 0.4 });
            io.observe(svg);
        } else { layers(4); }
        var rp = $('[data-act="replay-flux"]');
        if (rp) rp.addEventListener('click', function () {
            svg.removeAttribute('data-sel'); $$('.pair', svg).forEach(function (g) { g.classList.remove('sel'); });
            show('default'); layers(-1); setTimeout(play, 250);
        });
    }

    /* ---- frise de mise en œuvre ---- */
    var tl = $('.tl'), fill = $('.tl-fill'), steps = $$('.tl-step');
    if (tl) {
        var onScroll = function () {
            var r = tl.getBoundingClientRect(), mid = window.innerHeight * 0.55;
            fill.style.height = Math.max(0, Math.min(r.height - 8, mid - r.top)) + 'px';
            steps.forEach(function (s) { s.classList.toggle('on', s.getBoundingClientRect().top < mid); });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        onScroll();
    }

    /* ---- tests : coches une par une, capture dépliable ---- */
    var rrows = $$('.rt tbody tr.t');
    if (rrows.length) {
        var timers = [];
        var playTests = function () {
            timers.forEach(clearTimeout); timers = [];
            rrows.forEach(function (r) { r.classList.remove('on'); });
            rrows.forEach(function (r, i) { timers.push(setTimeout(function () { r.classList.add('on'); }, reduce ? 0 : 350 + i * 450)); });
        };
        rrows.forEach(function (r) { r.classList.add('armed'); });
        if ('IntersectionObserver' in window) {
            var io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io2.disconnect(); playTests(); } }); }, { threshold: 0.4 });
            io2.observe($('.rt'));
        } else { rrows.forEach(function (r) { r.classList.add('on'); }); }
        var rt = $('[data-act="replay-recette"]');
        if (rt) rt.addEventListener('click', playTests);
        var toggle = function (tr) {
            var open = !tr.classList.contains('open');
            rrows.forEach(function (r) { r.classList.remove('open'); r.setAttribute('aria-expanded', 'false'); r.nextElementSibling.classList.remove('open'); });
            if (open) { tr.classList.add('open'); tr.setAttribute('aria-expanded', 'true'); tr.nextElementSibling.classList.add('open'); }
        };
        rrows.forEach(function (tr) {
            tr.addEventListener('click', function () { toggle(tr); });
            tr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(tr); } });
        });
    }

    /* ---- compétences : premier point au niveau du haut de l'immeuble ---- */
    var ul = $('.cp ul'), cs = $('.cp-visual svg');
    if (ul && cs) {
        var align = function () {
            var wide = window.matchMedia('(min-width: 1001px)').matches;
            var vb = cs.viewBox.baseVal;
            ul.style.marginTop = wide && vb.height ? (cs.getBoundingClientRect().height * 46 / vb.height) + 'px' : '0px';
        };
        window.addEventListener('resize', align);
        align(); setTimeout(align, 300);
    }
})();
