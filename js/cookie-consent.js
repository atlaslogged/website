// Consent-gated customer support for the Atlas Logged public site.
(function () {
    'use strict';

    const CONSENT_KEY = 'chatwoot-consent';
    const GEO_CACHE_KEY = 'geo-country-check';
    const GEO_CACHE_DURATION = 60 * 60 * 1000;
    const COUNTRY_ENDPOINT = 'https://api.country.is/';
    const CHATWOOT_CONFIG = {
        baseUrl: 'https://app.chatwoot.com',
        websiteToken: 'xiyWsj719fc5BZUsg8i4n88i'
    };
    const CONSENT_COUNTRIES = new Set([
        'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
        'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
        'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO',
        'GB', 'CH', 'BR'
    ]);

    let chatwootLoading = false;

    function readStorage(storage, key) {
        try {
            return storage.getItem(key);
        } catch {
            return null;
        }
    }

    function writeStorage(storage, key, value) {
        try {
            storage.setItem(key, value);
            return true;
        } catch {
            return false;
        }
    }

    function removeStorage(storage, key) {
        try {
            storage.removeItem(key);
        } catch {
            // Storage can be unavailable in private or embedded browsing contexts.
        }
    }

    function isFromApp() {
        const parameters = new URLSearchParams(window.location.search);
        return navigator.userAgent.includes('AtlasLogged/') || parameters.get('consent') === 'chat';
    }

    async function isInConsentRegion() {
        const cachedValue = readStorage(sessionStorage, GEO_CACHE_KEY);
        if (cachedValue) {
            try {
                const cached = JSON.parse(cachedValue);
                if (Date.now() - Number(cached.timestamp) < GEO_CACHE_DURATION) {
                    return CONSENT_COUNTRIES.has(String(cached.countryCode));
                }
            } catch {
                removeStorage(sessionStorage, GEO_CACHE_KEY);
            }
        }

        try {
            const response = await fetch(COUNTRY_ENDPOINT, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Country lookup returned ${response.status}`);
            const data = await response.json();
            const countryCode = String(data.country || '').toUpperCase();
            if (!countryCode) throw new Error('Country lookup returned no country code');
            writeStorage(sessionStorage, GEO_CACHE_KEY, JSON.stringify({ countryCode, timestamp: Date.now() }));
            return CONSENT_COUNTRIES.has(countryCode);
        } catch (error) {
            console.warn('[Support consent] Country lookup failed; asking for consent.', error);
            return true;
        }
    }

    function getConsentStatus() {
        return readStorage(localStorage, CONSENT_KEY);
    }

    function saveConsentStatus(status) {
        writeStorage(localStorage, CONSENT_KEY, status);
        window.dispatchEvent(new CustomEvent('chatwoot-consent-changed', {
            detail: { consent: status }
        }));
    }

    function autoOpenChat() {
        function open() {
            if (window.$chatwoot) window.$chatwoot.toggle('open');
        }
        window.addEventListener('chatwoot:ready', open, { once: true });
        window.setTimeout(open, 1500);
    }

    function loadChatwoot(autoOpen = false) {
        if (window.$chatwoot || chatwootLoading) {
            if (autoOpen) autoOpenChat();
            return;
        }

        chatwootLoading = true;
        window.chatwootSettings = {
            hideMessageBubble: false,
            position: 'right',
            locale: 'en'
        };

        const script = document.createElement('script');
        script.src = `${CHATWOOT_CONFIG.baseUrl}/packs/js/sdk.js`;
        script.defer = true;
        script.async = true;
        script.addEventListener('load', () => {
            chatwootLoading = false;
            if (!window.chatwootSDK) return;
            window.chatwootSDK.run({
                websiteToken: CHATWOOT_CONFIG.websiteToken,
                baseUrl: CHATWOOT_CONFIG.baseUrl
            });
            if (autoOpen) autoOpenChat();
        }, { once: true });
        script.addEventListener('error', () => {
            chatwootLoading = false;
            showChatPlaceholder();
        }, { once: true });
        document.head.appendChild(script);
    }

    function hideCookieBanner() {
        document.getElementById('cookie-consent-banner')?.remove();
    }

    function hideChatPlaceholder() {
        document.getElementById('chat-placeholder')?.remove();
        document.getElementById('chat-placeholder-tooltip')?.remove();
    }

    function acceptCookies(autoOpen = false) {
        saveConsentStatus('accepted');
        hideCookieBanner();
        hideChatPlaceholder();
        loadChatwoot(autoOpen);
    }

    function rejectCookies() {
        saveConsentStatus('rejected');
        hideCookieBanner();
        showChatPlaceholder();
    }

    function makeButton(text, className) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.textContent = text;
        return button;
    }

    function showCookieBanner() {
        if (document.getElementById('cookie-consent-banner')) return;

        const banner = document.createElement('section');
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-consent-banner';
        banner.setAttribute('aria-label', 'Customer support cookie choice');

        const content = document.createElement('div');
        content.className = 'cookie-banner-content';
        const copy = document.createElement('div');
        copy.className = 'cookie-banner-text';
        const heading = document.createElement('h2');
        heading.textContent = 'Customer support cookies';
        const description = document.createElement('p');
        description.textContent = 'Optional Chatwoot cookies keep a support conversation available across visits. Atlas Logged never shares your travel or location history with Chatwoot.';
        const privacyLink = document.createElement('a');
        privacyLink.href = 'privacy.html#customer-support';
        privacyLink.textContent = 'Read the support privacy details';
        copy.append(heading, description, privacyLink);

        const actions = document.createElement('div');
        actions.className = 'cookie-banner-actions';
        const reject = makeButton('Not now', 'cookie-btn cookie-btn-reject');
        const accept = makeButton('Enable support chat', 'cookie-btn cookie-btn-accept');
        reject.addEventListener('click', rejectCookies);
        accept.addEventListener('click', () => acceptCookies(false));
        actions.append(reject, accept);
        content.append(copy, actions);
        banner.appendChild(content);
        document.body.appendChild(banner);
    }

    function showChatPlaceholder() {
        if (document.getElementById('chat-placeholder')) return;

        const placeholder = makeButton('Support', 'chat-placeholder');
        placeholder.id = 'chat-placeholder';
        placeholder.setAttribute('aria-expanded', 'false');
        placeholder.setAttribute('aria-controls', 'chat-placeholder-tooltip');

        const tooltip = document.createElement('aside');
        tooltip.id = 'chat-placeholder-tooltip';
        tooltip.className = 'chat-placeholder-tooltip';
        tooltip.hidden = true;
        tooltip.setAttribute('aria-label', 'Enable customer support chat');
        const heading = document.createElement('h2');
        heading.textContent = 'Support chat is off';
        const description = document.createElement('p');
        description.textContent = 'Enable optional support cookies to start or continue a live chat.';
        const privacyLink = document.createElement('a');
        privacyLink.href = 'privacy.html#customer-support';
        privacyLink.textContent = 'Privacy details';
        const actions = document.createElement('div');
        actions.className = 'tooltip-actions';
        const close = makeButton('Close', 'btn-close');
        const enable = makeButton('Enable chat', 'btn-enable');
        actions.append(close, enable);
        tooltip.append(heading, description, privacyLink, actions);

        function setOpen(open) {
            tooltip.hidden = !open;
            tooltip.classList.toggle('show', open);
            placeholder.setAttribute('aria-expanded', String(open));
            if (open) enable.focus();
        }

        placeholder.addEventListener('click', () => setOpen(tooltip.hidden));
        close.addEventListener('click', () => {
            setOpen(false);
            placeholder.focus();
        });
        enable.addEventListener('click', () => acceptCookies(false));
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !tooltip.hidden) {
                setOpen(false);
                placeholder.focus();
            }
        });
        document.addEventListener('click', (event) => {
            if (!tooltip.hidden && !placeholder.contains(event.target) && !tooltip.contains(event.target)) setOpen(false);
        });

        document.body.append(placeholder, tooltip);
    }

    async function init() {
        if (isFromApp()) {
            acceptCookies(true);
            return;
        }

        const consentStatus = getConsentStatus();
        if (consentStatus === 'accepted') {
            loadChatwoot(false);
            return;
        }
        if (consentStatus === 'rejected') {
            showChatPlaceholder();
            return;
        }

        if (await isInConsentRegion()) {
            showCookieBanner();
        } else {
            acceptCookies(false);
        }
    }

    window.ChatwootConsent = {
        accept: acceptCookies,
        reject: rejectCookies,
        reset() {
            removeStorage(localStorage, CONSENT_KEY);
            window.location.reload();
        },
        getStatus: getConsentStatus,
        clearGeoCache() {
            removeStorage(sessionStorage, GEO_CACHE_KEY);
        },
        checkGeoCache() {
            const cached = readStorage(sessionStorage, GEO_CACHE_KEY);
            if (!cached) return null;
            try {
                return JSON.parse(cached);
            } catch {
                return null;
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
