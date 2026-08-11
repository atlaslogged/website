// Shared progressive enhancement for the Atlas Logged public site.
(function () {
    'use strict';

    const focusableSelector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function initAnchors() {
        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (event) => {
                const hash = link.getAttribute('href');
                const target = hash ? document.querySelector(hash) : null;
                if (!target) return;

                event.preventDefault();
                target.scrollIntoView({
                    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                    block: 'start'
                });

                if (link.classList.contains('skip-to-content')) {
                    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: true });
                }

                history.pushState(null, '', hash);
            });
        });
    }

    function initMotionSensitiveMedia() {
        document.querySelectorAll('[data-autoplay-media]').forEach((media) => {
            if (prefersReducedMotion()) {
                media.pause();
                return;
            }

            const playback = media.play();
            if (playback instanceof Promise) playback.catch(() => {});
        });
    }

    function initMobileMenu() {
        const trigger = document.getElementById('hamburger');
        const menu = document.getElementById('navLinks');
        const backdrop = document.getElementById('mobileBackdrop');
        if (!trigger || !menu || !backdrop) return;

        let previouslyFocused = null;
        const isMobile = () => window.matchMedia('(max-width: 760px)').matches;
        const isOpen = () => trigger.getAttribute('aria-expanded') === 'true';

        function setMenu(open) {
            if (open === isOpen()) return;

            if (open) {
                previouslyFocused = document.activeElement;
                menu.inert = false;
                trigger.classList.add('active');
                menu.classList.add('active');
                backdrop.classList.add('active');
                trigger.setAttribute('aria-expanded', 'true');
                trigger.setAttribute('aria-label', 'Close navigation menu');
                document.body.classList.add('menu-open');
                const firstLink = menu.querySelector(focusableSelector);
                if (firstLink) firstLink.focus();
                return;
            }

            trigger.classList.remove('active');
            menu.classList.remove('active');
            backdrop.classList.remove('active');
            trigger.setAttribute('aria-expanded', 'false');
            trigger.setAttribute('aria-label', 'Open navigation menu');
            document.body.classList.remove('menu-open');
            menu.inert = isMobile();
            if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
            previouslyFocused = null;
        }

        menu.inert = isMobile();

        trigger.addEventListener('click', () => setMenu(!isOpen()));
        backdrop.addEventListener('click', () => setMenu(false));
        menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

        document.addEventListener('keydown', (event) => {
            if (!isOpen()) return;
            if (event.key === 'Escape') {
                event.preventDefault();
                setMenu(false);
                return;
            }
            if (event.key !== 'Tab') return;

            const elements = [...menu.querySelectorAll(focusableSelector)].filter((element) => !element.hasAttribute('hidden'));
            if (elements.length === 0) return;
            const first = elements[0];
            const last = elements[elements.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });

        window.addEventListener('resize', () => {
            if (!isMobile()) {
                if (isOpen()) setMenu(false);
                menu.inert = false;
                return;
            }

            if (!isOpen()) menu.inert = true;
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initAnchors();
        initMobileMenu();
        initMotionSensitiveMedia();
    });
})();
