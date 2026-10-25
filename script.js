document.addEventListener('DOMContentLoaded', () => {

    // 1. Mobile Navigation Toggle
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const sidebar = document.querySelector('.sidebar');
    const navLinks = document.querySelectorAll('.nav-link');

    navToggle.addEventListener('click', () => {
        const visibility = sidebar.getAttribute('data-visible');
        if (visibility === "false") {
            sidebar.setAttribute('data-visible', true);
            navToggle.setAttribute('aria-expanded', true);
            navToggle.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        } else {
            sidebar.setAttribute('data-visible', false);
            navToggle.setAttribute('aria-expanded', false);
            navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
    });

    // Close sidebar when clicking a link on mobile
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.setAttribute('data-visible', false);
                navToggle.setAttribute('aria-expanded', false);
                navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            }
        });
    });

    // 2. Active Link Switching on Scroll
    const sections = document.querySelectorAll('section');

    const updateActiveLink = () => {
        // Repère situé au premier tiers de l'écran : la section dont le haut l'a dépassé est active
        const marker = window.scrollY + window.innerHeight / 3;
        let current = sections[0].getAttribute('id');
        sections.forEach(section => {
            if (marker >= section.offsetTop) {
                current = section.getAttribute('id');
            }
        });

        // En bas de page, la dernière section (Contact) est plus courte que l'écran :
        // son haut n'atteint jamais le repère, on l'active donc explicitement.
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        if (atBottom) {
            current = sections[sections.length - 1].getAttribute('id');
        }

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    };

    window.addEventListener('scroll', updateActiveLink);
    window.addEventListener('resize', updateActiveLink);
    updateActiveLink();

    // 3. Scroll Reveal Animation
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;

        // En bas de page, les derniers éléments peuvent rester sous le seuil : on les révèle
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (atBottom || elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load

    // 4. Spotlight Card Glow Effect
    const cards = document.querySelectorAll('.glow-effect');

    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Set css variables for the pseudo element
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Add dynamic CSS rule for the spotglow
    const style = document.createElement('style');
    style.innerHTML = `
        .glow-effect::before {
            background: radial-gradient(
                800px circle at var(--mouse-x) var(--mouse-y), 
                rgba(212, 175, 55, 0.4), /* Gold color */
                transparent 40%
            );
        }
    `;
    document.head.appendChild(style);

    // 5. Carousel Logic
    const track = document.querySelector('.carousel-track');
    if (track) {
        const nextButton = document.querySelector('.carousel-btn.next');
        const prevButton = document.querySelector('.carousel-btn.prev');

        let currentIndex = 0;

        const updateCarousel = () => {
            if (track.children.length === 0) return;
            const slideWidth = track.children[0].getBoundingClientRect().width;
            const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
            const moveAmt = slideWidth + gap;

            track.style.transform = `translateX(-${currentIndex * moveAmt}px)`;
        };

        window.addEventListener('resize', () => {
            // Reset index on resize to ensure correct alignment
            currentIndex = 0;
            updateCarousel();
        });

        nextButton.addEventListener('click', () => {
            if (track.children.length === 0) return;
            const slideWidth = track.children[0].getBoundingClientRect().width;
            const trackWidth = track.parentElement.getBoundingClientRect().width;
            // Calculate how many items are currently visible
            const visibleItems = Math.round(trackWidth / slideWidth) || 1;
            const maxIndex = Math.max(0, track.children.length - visibleItems);

            if (currentIndex < maxIndex) {
                currentIndex = Math.min(maxIndex, currentIndex + visibleItems);
            } else {
                currentIndex = 0; // loop to start
            }
            updateCarousel();
        });

        prevButton.addEventListener('click', () => {
            if (track.children.length === 0) return;
            const slideWidth = track.children[0].getBoundingClientRect().width;
            const trackWidth = track.parentElement.getBoundingClientRect().width;
            const visibleItems = Math.round(trackWidth / slideWidth) || 1;
            const maxIndex = Math.max(0, track.children.length - visibleItems);

            if (currentIndex > 0) {
                currentIndex = Math.max(0, currentIndex - visibleItems);
            } else {
                currentIndex = maxIndex; // loop to end
            }
            updateCarousel();
        });
    }

    // Set Current Year in Footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 6. Back to Top Button Logic
    const backToTopBtn = document.getElementById('btn-back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
