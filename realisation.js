// Pages de réalisation : schémas qui se dessinent à l'arrivée, pause hors écran, agrandissement des captures.
(function () {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var svgs = Array.prototype.slice.call(document.querySelectorAll('.anim'));

    /* ----- Schémas ----- */
    function play(svg) {
        svg.classList.add('armed');
        svg.classList.remove('draw', 'done');
        void svg.getBoundingClientRect();
        if (svg.setCurrentTime) svg.setCurrentTime(0);
        svg.classList.add('draw');
        setTimeout(function () { svg.classList.add('done'); }, 5200);   // les paquets ne partent qu'une fois le tracé fini
    }

    if (reduce) {
        // mouvement réduit : schéma complet et immobile, sans paquets
        svgs.forEach(function (s) { s.classList.add('static'); if (s.pauseAnimations) s.pauseAnimations(); });
    } else if ('IntersectionObserver' in window) {
        var seen = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { seen.unobserve(en.target); play(en.target); }
            });
        }, { threshold: 0.35 });
        var pauser = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                var s = en.target;
                if (en.isIntersecting) { s.unpauseAnimations && s.unpauseAnimations(); } else { s.pauseAnimations && s.pauseAnimations(); }
            });
        });
        svgs.forEach(function (s) {
            s.classList.add('armed');       // masqué jusqu'au tracé
            seen.observe(s);
            pauser.observe(s);
        });
    }

    /* ----- Agrandissement des captures (sans changer de page) ----- */
    var dlg = document.getElementById('lightbox');
    var shots = Array.prototype.slice.call(document.querySelectorAll('button.shot[data-full]'));
    if (!dlg || !shots.length || typeof dlg.showModal !== 'function') return;
    var img = dlg.querySelector('img'), cap = dlg.querySelector('figcaption'), idx = 0;

    function show(i) {
        idx = (i + shots.length) % shots.length;
        var s = shots[idx];
        img.src = s.dataset.full;
        img.alt = s.dataset.alt || s.dataset.caption || '';
        cap.textContent = s.dataset.caption || '';
    }
    shots.forEach(function (s, i) {
        s.addEventListener('click', function () {
            dlg.classList.toggle('single', shots.length < 2);
            show(i);
            dlg.showModal();
        });
    });
    dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    dlg.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });   // clic hors de l'image
    dlg.addEventListener('keydown', function (e) {
        if (shots.length < 2) return;
        if (e.key === 'ArrowLeft') { show(idx - 1); e.preventDefault(); }
        if (e.key === 'ArrowRight') { show(idx + 1); e.preventDefault(); }
    });
})();
