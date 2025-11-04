// Cookie Consent Management for Atlas Logged
// Handles GDPR-compliant cookie consent for Chatwoot live chat

(function() {
    'use strict';

    const CONSENT_KEY = 'chatwoot-consent';
    const GEO_CACHE_KEY = 'geo-country-check';
    const CHATWOOT_CONFIG = {
        baseUrl: 'https://app.chatwoot.com',
        websiteToken: 'xiyWsj719fc5BZUsg8i4n88i'
    };

    // Countries that require GDPR-compliant cookie consent
    // EU27 + EEA + UK + Switzerland + Brazil
    const GDPR_COUNTRIES = [
        'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
        'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
        'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', // EU 27
        'IS', 'LI', 'NO', // EEA (non-EU)
        'GB', // United Kingdom
        'CH', // Switzerland
        'BR'  // Brazil
    ];

    // Check if user is coming from the Atlas Logged app
    function isFromApp() {
        // Check custom user agent from iOS app
        const isAppUserAgent = navigator.userAgent.includes('AtlasLogged/');

        // Check URL parameter for explicit consent
        const urlParams = new URLSearchParams(window.location.search);
        const hasConsentParam = urlParams.get('consent') === 'chat';

        return isAppUserAgent || hasConsentParam;
    }

    // Detect if user is in a GDPR region using geolocation
    async function isInGDPRRegion() {
        // Check if geo-targeting is enabled via feature flag
        if (typeof FEATURE_FLAGS === 'undefined' || !FEATURE_FLAGS.enableGeoTargeting) {
            // Feature disabled: assume all visitors need consent (safe default)
            return true;
        }

        // Get cache duration from feature flags (default 24 hours)
        const cacheHours = (typeof FEATURE_FLAGS !== 'undefined' && FEATURE_FLAGS.geoCacheHours)
            ? FEATURE_FLAGS.geoCacheHours
            : 24;
        const cacheDuration = cacheHours * 60 * 60 * 1000; // Convert to milliseconds

        // Check cache first
        try {
            const cached = sessionStorage.getItem(GEO_CACHE_KEY);
            if (cached) {
                const { countryCode, timestamp } = JSON.parse(cached);
                const age = Date.now() - timestamp;

                // Return cached result if still fresh
                if (age < cacheDuration) {
                    console.log('[Cookie Consent] Using cached country:', countryCode);
                    return GDPR_COUNTRIES.includes(countryCode);
                } else {
                    console.log('[Cookie Consent] Geo cache expired, re-checking...');
                }
            }
        } catch (e) {
            console.warn('[Cookie Consent] Failed to read geo cache:', e);
        }

        // Cache miss or expired - fetch from API
        try {
            console.log('[Cookie Consent] Detecting country via country.is API...');
            const response = await fetch('https://api.country.is/', {
                method: 'GET',
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const countryCode = data.country;

            if (!countryCode) {
                throw new Error('No country code in response');
            }

            // Cache the result
            try {
                sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify({
                    countryCode: countryCode,
                    timestamp: Date.now()
                }));
                console.log('[Cookie Consent] Country detected:', countryCode);
            } catch (e) {
                console.warn('[Cookie Consent] Failed to cache geo result:', e);
            }

            return GDPR_COUNTRIES.includes(countryCode);

        } catch (error) {
            // If geolocation fails, show banner to be safe
            console.warn('[Cookie Consent] Geolocation failed, showing banner as fallback:', error);
            return true;
        }
    }

    // Get current consent status from localStorage
    function getConsentStatus() {
        return localStorage.getItem(CONSENT_KEY);
    }

    // Save consent status
    function saveConsentStatus(status) {
        localStorage.setItem(CONSENT_KEY, status);

        // Dispatch custom event for analytics/tracking (optional)
        window.dispatchEvent(new CustomEvent('chatwoot-consent-changed', {
            detail: { consent: status }
        }));
    }

    // Load Chatwoot widget
    function loadChatwoot(autoOpen) {
        // Configure Chatwoot settings
        window.chatwootSettings = {
            hideMessageBubble: false,
            position: "right",
            locale: "en"
        };

        // Load Chatwoot SDK
        var BASE_URL = CHATWOOT_CONFIG.baseUrl;
        var g = document.createElement('script');
        var s = document.getElementsByTagName('script')[0];

        g.src = BASE_URL + "/packs/js/sdk.js";
        g.defer = true;
        g.async = true;

        g.onload = function() {
            if (window.chatwootSDK) {
                window.chatwootSDK.run({
                    websiteToken: CHATWOOT_CONFIG.websiteToken,
                    baseUrl: BASE_URL
                });

                // Auto-open widget if requested (e.g., from app with ?consent=chat)
                if (autoOpen) {
                    // Wait for Chatwoot to be ready before opening
                    window.addEventListener('chatwoot:ready', function() {
                        setTimeout(function() {
                            if (window.$chatwoot) {
                                window.$chatwoot.toggle('open');
                            }
                        }, 500);
                    });

                    // Fallback: If chatwoot:ready already fired
                    setTimeout(function() {
                        if (window.$chatwoot) {
                            window.$chatwoot.toggle('open');
                        }
                    }, 1500);
                }
            }
        };

        s.parentNode.insertBefore(g, s);
    }

    // Accept cookies and load Chatwoot
    function acceptCookies(autoOpen) {
        saveConsentStatus('accepted');
        hideCookieBanner();
        loadChatwoot(autoOpen);
    }

    // Reject cookies
    function rejectCookies() {
        saveConsentStatus('rejected');
        hideCookieBanner();
        // Show chat placeholder when cookies are rejected
        showChatPlaceholder();
    }

    // Show cookie consent banner
    function showCookieBanner() {
        // Check if banner already exists
        if (document.getElementById('cookie-consent-banner')) {
            return;
        }

        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie consent');
        banner.setAttribute('aria-live', 'polite');

        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-text">
                    <p><strong>We use cookies for customer support</strong></p>
                    <p>This website uses Chatwoot (a third-party service) for live chat support. Cookies help maintain your chat session across visits without the need for sharing an email address.</p>
                    <a href="https://atlaslogged.com/privacy.html" target="_blank" rel="noopener noreferrer">View Privacy Policy</a>
                </div>
                <div class="cookie-banner-actions">
                    <button id="cookie-accept" class="cookie-btn cookie-btn-accept" aria-label="Accept cookies">
                        Accept
                    </button>
                    <button id="cookie-reject" class="cookie-btn cookie-btn-reject" aria-label="Reject cookies">
                        Reject
                    </button>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #cookie-consent-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(30, 41, 59, 0.98);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                padding: 1.5rem;
                box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
                z-index: 1000000;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                animation: slideUp 0.3s ease-out;
            }

            @keyframes slideUp {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .cookie-banner-content {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                flex-direction: column;
                gap: 1rem;
                align-items: center;
                text-align: center;
            }

            .cookie-banner-text {
                color: #fff;
            }

            .cookie-banner-text p {
                margin: 0 0 0.5rem 0;
                font-size: 0.95rem;
                line-height: 1.5;
            }

            .cookie-banner-text strong {
                font-weight: 600;
                font-size: 1.05rem;
            }

            .cookie-banner-text a {
                color: #60a5fa;
                text-decoration: underline;
                font-size: 0.9rem;
                transition: color 0.2s;
            }

            .cookie-banner-text a:hover {
                color: #93c5fd;
            }

            .cookie-banner-actions {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
                justify-content: center;
            }

            .cookie-btn {
                padding: 0.75rem 2rem;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 0.95rem;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 120px;
            }

            .cookie-btn-accept {
                background: #2563eb;
                color: white;
            }

            .cookie-btn-accept:hover {
                background: #1d4ed8;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
            }

            .cookie-btn-reject {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .cookie-btn-reject:hover {
                background: rgba(255, 255, 255, 0.15);
            }

            @media (min-width: 768px) {
                .cookie-banner-content {
                    flex-direction: row;
                    justify-content: space-between;
                    text-align: left;
                }

                .cookie-banner-text {
                    flex: 1;
                }

                .cookie-banner-actions {
                    flex-shrink: 0;
                }
            }

            @media (max-width: 767px) {
                #cookie-consent-banner {
                    padding: 1rem;
                }

                .cookie-banner-text p {
                    font-size: 0.875rem;
                }

                .cookie-btn {
                    padding: 0.65rem 1.5rem;
                    font-size: 0.875rem;
                    min-width: 100px;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(banner);

        // Add event listeners
        document.getElementById('cookie-accept').addEventListener('click', function() {
            acceptCookies(false); // Don't auto-open when accepting from banner
        });
        document.getElementById('cookie-reject').addEventListener('click', rejectCookies);
    }

    // Hide cookie banner
    function hideCookieBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.style.animation = 'slideDown 0.3s ease-out';
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }

    // Add slideDown animation
    const slideDownStyle = document.createElement('style');
    slideDownStyle.textContent = `
        @keyframes slideDown {
            from {
                transform: translateY(0);
                opacity: 1;
            }
            to {
                transform: translateY(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(slideDownStyle);

    // Show chat placeholder (when cookies rejected)
    function showChatPlaceholder() {
        // Check if placeholder already exists
        if (document.getElementById('chat-placeholder')) {
            document.getElementById('chat-placeholder').classList.add('show');
            return;
        }

        // Create placeholder button
        const placeholder = document.createElement('button');
        placeholder.id = 'chat-placeholder';
        placeholder.className = 'chat-placeholder show';
        placeholder.setAttribute('aria-label', 'Chat disabled - click to enable cookies');
        placeholder.innerHTML = '💬';

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'chat-placeholder-tooltip';
        tooltip.className = 'chat-placeholder-tooltip';
        tooltip.innerHTML = `
            <h4>Chat Disabled</h4>
            <p>To use our live chat support, you need to enable cookies. This allows us to maintain your chat session.</p>
            <p style="font-size: 0.85rem; margin-bottom: 1rem;"><a href="https://atlaslogged.com/privacy.html" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline;">View Privacy Policy</a></p>
            <div class="tooltip-actions">
                <button class="btn-enable">Enable Cookies</button>
                <button class="btn-close">Close</button>
            </div>
        `;

        document.body.appendChild(placeholder);
        document.body.appendChild(tooltip);

        // Show tooltip on placeholder click
        placeholder.addEventListener('click', function() {
            tooltip.classList.toggle('show');
        });

        // Enable cookies button
        tooltip.querySelector('.btn-enable').addEventListener('click', function() {
            tooltip.classList.remove('show');
            hideChatPlaceholder();
            acceptCookies(false);
        });

        // Close tooltip button
        tooltip.querySelector('.btn-close').addEventListener('click', function() {
            tooltip.classList.remove('show');
        });

        // Close tooltip when clicking outside
        document.addEventListener('click', function(e) {
            if (!placeholder.contains(e.target) && !tooltip.contains(e.target)) {
                tooltip.classList.remove('show');
            }
        });
    }

    // Hide chat placeholder
    function hideChatPlaceholder() {
        const placeholder = document.getElementById('chat-placeholder');
        const tooltip = document.getElementById('chat-placeholder-tooltip');

        if (placeholder) {
            placeholder.classList.remove('show');
            setTimeout(() => placeholder.remove(), 300);
        }

        if (tooltip) {
            tooltip.classList.remove('show');
            setTimeout(() => tooltip.remove(), 300);
        }
    }

    // Initialize on DOM ready
    async function init() {
        // Check if URL has consent=chat parameter (from app)
        const urlParams = new URLSearchParams(window.location.search);
        const hasConsentParam = urlParams.get('consent') === 'chat';
        const isAppUserAgent = navigator.userAgent.includes('AtlasLogged/');

        // If coming from app (URL param or user agent), ALWAYS auto-open
        if (hasConsentParam || isAppUserAgent) {
            saveConsentStatus('accepted');
            loadChatwoot(true); // ALWAYS auto-open when from app
            return;
        }

        // Regular website visitor flow
        const consentStatus = getConsentStatus();

        if (consentStatus === 'accepted') {
            // User previously accepted, load Chatwoot (don't auto-open)
            loadChatwoot(false);
        } else if (consentStatus === 'rejected') {
            // User previously rejected, show chat placeholder
            showChatPlaceholder();
        } else {
            // No consent decision yet - check if user needs to see banner
            const needsConsent = await isInGDPRRegion();

            if (needsConsent) {
                // User is in GDPR region (or geo-check failed) - show banner
                showCookieBanner();
            } else {
                // User is NOT in GDPR region - auto-accept and load Chatwoot
                console.log('[Cookie Consent] Non-GDPR region detected, auto-accepting');
                saveConsentStatus('accepted');
                loadChatwoot(false);
            }
        }
    }

    // Export functions for manual control (optional)
    window.ChatwootConsent = {
        accept: acceptCookies,
        reject: rejectCookies,
        reset: function() {
            localStorage.removeItem(CONSENT_KEY);
            location.reload();
        },
        getStatus: getConsentStatus,
        // Geo-targeting utilities
        clearGeoCache: function() {
            sessionStorage.removeItem(GEO_CACHE_KEY);
            console.log('[Cookie Consent] Geo cache cleared');
        },
        checkGeoCache: function() {
            const cached = sessionStorage.getItem(GEO_CACHE_KEY);
            if (cached) {
                const data = JSON.parse(cached);
                const age = Date.now() - data.timestamp;
                const ageHours = Math.floor(age / (60 * 60 * 1000));
                const ageMinutes = Math.floor(age / (60 * 1000));
                if (ageHours > 0) {
                    console.log(`[Cookie Consent] Cached country: ${data.countryCode} (${ageHours}h old)`);
                } else {
                    console.log(`[Cookie Consent] Cached country: ${data.countryCode} (${ageMinutes}m old)`);
                }
                return data;
            } else {
                console.log('[Cookie Consent] No geo cache found (cleared when browser closed)');
                return null;
            }
        }
    };

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
