// Simple JavaScript for Atlas Logged Landing Page

document.addEventListener('DOMContentLoaded', () => {
    detectSafari();
    initFAQ();
    initSmoothScroll();
    initMobileMenu();
});

// Safari Browser Detection
function detectSafari() {
    // Detect Safari browser (but not Chrome which also has Safari in UA)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari) {
        document.documentElement.classList.add('is-safari');
    }
}

// FAQ Accordion
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    // Exit early if no FAQ items exist on this page
    if (faqItems.length === 0) {
        return;
    }

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        // Function to toggle FAQ
        const toggleFAQ = () => {
            const isOpen = item.classList.contains('open');

            // Close all FAQs and update their aria-expanded
            faqItems.forEach(faq => {
                faq.classList.remove('open');
                const faqQuestion = faq.querySelector('.faq-question');
                if (faqQuestion) {
                    faqQuestion.setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current FAQ
            if (!isOpen) {
                item.classList.add('open');
                question.setAttribute('aria-expanded', 'true');
            }
        };

        // Click event
        question.addEventListener('click', toggleFAQ);

        // Keyboard support for accessibility (Enter and Space keys)
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // Prevent page scroll on Space
                toggleFAQ();
            }
        });
    });
}

// Smooth Scroll for Navigation
function initSmoothScroll() {
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');

    // Exit early if no anchor links exist
    if (smoothScrollLinks.length === 0) {
        return;
    }

    smoothScrollLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed nav
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Mobile Menu Toggle
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
}
