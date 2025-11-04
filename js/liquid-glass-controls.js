// Liquid Glass Controls for Atlas Logged
// Initializes liquid glass on navigation and provides user controls

let glassContainer = null;
let glassSettingsButton = null;
let liquidGlassEnabled = true;
let originalNav = null;

// Default settings (matching library demo)
const defaultSettings = {
    edgeIntensity: 0.01,
    rimIntensity: 0.05,
    baseIntensity: 0.01,
    edgeDistance: 0.15,
    rimDistance: 0.8,
    baseDistance: 0.1,
    cornerBoost: 0.02,
    rippleEffect: 0.1,
    blurRadius: 5.0,  // Lower = less blurry
    tintOpacity: 0.2   // Lower = more transparent
};

// Make settings available globally for the library
window.glassControls = { ...defaultSettings };

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.innerWidth <= 768;

    // ALWAYS initialize the glass settings button (even when nav glass disabled)
    initGlassSettingsButton();

    if (isMobile) {
        // Mobile: disable liquid glass for nav by default
        liquidGlassEnabled = false;
        document.getElementById('enableLiquidGlass').checked = false;
    } else {
        // Desktop: enable liquid glass for nav by default
        liquidGlassEnabled = true;
        document.getElementById('enableLiquidGlass').checked = true;
        initLiquidGlass();
    }

    initControls();
    loadSavedSettings();
});

// Initialize liquid glass on navigation
function initLiquidGlass() {
    if (typeof Container === 'undefined') {
        console.warn('Liquid glass library not loaded');
        return;
    }

    const nav = document.querySelector('nav');
    if (!nav) {
        console.warn('Nav element not found');
        return;
    }

    try {
        // Store original nav for toggling
        originalNav = nav;

        // Get nav dimensions
        const rect = nav.getBoundingClientRect();

        // Create glass container with capturing enabled
        glassContainer = new Container({
            type: 'rounded',
            borderRadius: 0,
            tintOpacity: window.glassControls.tintOpacity,
            captureBackground: true  // Enable background capture
        });

        // Style the container to match nav
        glassContainer.element.style.position = 'fixed';
        glassContainer.element.style.top = '0';
        glassContainer.element.style.left = '0';
        glassContainer.element.style.right = '0';
        glassContainer.element.style.width = '100%';
        glassContainer.element.style.height = rect.height + 'px';
        glassContainer.element.style.zIndex = '999'; // Below nav content
        glassContainer.element.style.pointerEvents = 'none'; // Allow clicks through
        glassContainer.element.style.background = 'transparent'; // Ensure transparent background

        // Insert glass container before nav
        nav.parentNode.insertBefore(glassContainer.element, nav);

        // Make nav transparent so glass shows through
        nav.style.background = 'transparent';
        nav.style.backdropFilter = 'none';
        nav.classList.add('liquid-glass-active');

        // Trigger initial background capture
        if (glassContainer.captureSnapshot) {
            glassContainer.captureSnapshot();
        }

        // Re-capture on scroll for dynamic blurring
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (glassContainer && glassContainer.captureSnapshot) {
                    glassContainer.captureSnapshot();
                }
            }, 100); // Debounce scroll events
        });

        // Re-capture on window resize
        let resizeTimeout;
        let isResizing = false;
        const handleResize = () => {
            clearTimeout(resizeTimeout);

            if (!isResizing) {
                isResizing = true;
                console.log('Resize started...');
            }

            resizeTimeout = setTimeout(() => {
                if (!glassContainer || !liquidGlassEnabled) {
                    isResizing = false;
                    return;
                }

                console.log('Handling window resize...');

                try {
                    // Update nav height first
                    const nav = document.querySelector('nav');
                    if (nav) {
                        const rect = nav.getBoundingClientRect();
                        glassContainer.element.style.height = rect.height + 'px';
                    }

                    // Update container dimensions and force render
                    if (glassContainer.updateSizeFromDOM) {
                        glassContainer.updateSizeFromDOM();
                    }

                    // Wait for canvas to stabilize before recapturing
                    setTimeout(() => {
                        if (typeof Container !== 'undefined' && Container.recaptureAll) {
                            console.log('Recapturing page snapshot after resize...');
                            Container.recaptureAll();
                        }
                        isResizing = false;
                        console.log('Resize complete');
                    }, 100);
                } catch (error) {
                    console.error('Resize handler error:', error);
                    isResizing = false;
                }
            }, 300); // Increased debounce for stability
        };

        window.addEventListener('resize', handleResize);

        console.log('%cLiquid glass initialized on navigation!', 'color: #10b981; font-weight: bold;');
    } catch (error) {
        console.error('Failed to initialize liquid glass:', error);
    }
}

// Disable liquid glass and return to CSS effect
function disableLiquidGlass() {
    if (glassContainer && glassContainer.element) {
        // Remove the glass container element
        glassContainer.element.remove();
        glassContainer = null;
    }

    const nav = document.querySelector('nav');
    if (nav) {
        // Restore original CSS glassmorphism
        nav.style.background = 'rgba(255, 255, 255, 0.7)';
        nav.style.backdropFilter = 'blur(20px) saturate(180%)';
        nav.classList.remove('liquid-glass-active');
    }

    console.log('%cLiquid glass disabled - using CSS fallback', 'color: #f59e0b;');
}

// Initialize glass effect on settings button
function initGlassSettingsButton() {
    if (typeof Button === 'undefined') {
        console.warn('Button class not loaded');
        return;
    }

    const settingsCog = document.getElementById('settings-cog');
    if (!settingsCog) {
        console.warn('Settings cog not found');
        return;
    }

    try {
        // Hide the original blue CSS button (glass version will replace it)
        settingsCog.style.display = 'none';

        // Create a glass button with water droplet emoji
        // Size 22.4 = 56px circle (22.4 * 2.5 = 56px) to match Chatwoot widget
        glassSettingsButton = new Button({
            text: '💧',
            size: 22.4,
            type: 'circle',
            tintOpacity: window.glassControls.tintOpacity,
            onClick: () => {
                // Directly toggle the settings panel
                const settingsPanel = document.getElementById('glass-settings-panel');
                settingsPanel?.classList.toggle('open');
            }
        });

        // Style the glass button to match original position
        const isMobile = window.innerWidth <= 768;
        glassSettingsButton.element.style.position = 'fixed';
        glassSettingsButton.element.style.bottom = isMobile ? '1rem' : '2rem';
        glassSettingsButton.element.style.left = isMobile ? '1rem' : '2rem';
        glassSettingsButton.element.style.zIndex = '9999';
        glassSettingsButton.element.style.cursor = 'pointer';
        glassSettingsButton.element.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

        // Remove any blue background - glass effect only
        glassSettingsButton.element.style.background = 'transparent';
        glassSettingsButton.element.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';

        // Ensure proper touch handling on mobile
        glassSettingsButton.element.style.touchAction = 'manipulation';

        // Add hover effect (simple scale, no rotation for emoji)
        glassSettingsButton.element.addEventListener('mouseenter', () => {
            glassSettingsButton.element.style.transform = 'scale(1.1)';
        });
        glassSettingsButton.element.addEventListener('mouseleave', () => {
            glassSettingsButton.element.style.transform = 'scale(1)';
        });

        // Add to page
        document.body.appendChild(glassSettingsButton.element);

        // Update on resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.innerWidth <= 768 && glassSettingsButton) {
                    glassSettingsButton.element.style.bottom = '1rem';
                    glassSettingsButton.element.style.left = '1rem';
                } else if (glassSettingsButton) {
                    glassSettingsButton.element.style.bottom = '2rem';
                    glassSettingsButton.element.style.left = '2rem';
                }
            }, 100);
        });

        console.log('%cGlass settings button initialized!', 'color: #10b981; font-weight: bold;');
    } catch (error) {
        console.error('Failed to initialize glass settings button:', error);
        // Show original blue button on error
        settingsCog.style.display = 'flex';
    }
}

// Disable glass settings button
function disableGlassSettingsButton() {
    if (glassSettingsButton && glassSettingsButton.element) {
        glassSettingsButton.element.remove();
        glassSettingsButton = null;
    }

    // Show the original blue CSS button
    const settingsCog = document.getElementById('settings-cog');
    if (settingsCog) {
        settingsCog.style.display = 'flex';
    }
}

// Initialize all controls
function initControls() {
    const settingsPanel = document.getElementById('glass-settings-panel');
    const settingsCog = document.getElementById('settings-cog');
    const closeButton = document.getElementById('close-settings');
    const randomizeButton = document.getElementById('randomize-button');
    const resetButton = document.getElementById('reset-button');
    const enableToggle = document.getElementById('enableLiquidGlass');

    // Toggle settings panel
    settingsCog?.addEventListener('click', () => {
        settingsPanel?.classList.toggle('open');
    });

    closeButton?.addEventListener('click', () => {
        settingsPanel?.classList.remove('open');
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        const isClickOnPanel = settingsPanel?.contains(e.target);
        const isClickOnOriginalCog = settingsCog?.contains(e.target);
        const isClickOnGlassCog = glassSettingsButton?.element?.contains(e.target);

        if (!isClickOnPanel && !isClickOnOriginalCog && !isClickOnGlassCog) {
            settingsPanel?.classList.remove('open');
        }
    });

    // Enable/disable toggle (only controls nav glass, button always stays glass)
    enableToggle?.addEventListener('change', (e) => {
        liquidGlassEnabled = e.target.checked;
        // No localStorage - fresh choice on every page load

        if (liquidGlassEnabled) {
            initLiquidGlass();
        } else {
            disableLiquidGlass();
        }
        // Note: Glass settings button is always visible and always glass
    });

    // Wire up all sliders
    const sliderIds = Object.keys(defaultSettings);
    sliderIds.forEach(id => {
        const slider = document.getElementById(id);
        const label = slider?.previousElementSibling;
        const valueDisplay = label?.querySelector('.setting-value');

        if (slider && valueDisplay) {
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                valueDisplay.textContent = value.toFixed(3);
                updateGlassParameter(id, value);
                saveSettings();
            });
        }
    });

    // Randomize button
    randomizeButton?.addEventListener('click', () => {
        randomizeSettings();
    });

    // Reset button
    resetButton?.addEventListener('click', () => {
        resetToDefaults();
    });
}

// Update a specific glass parameter
function updateGlassParameter(param, value) {
    window.glassControls[param] = value;

    if (!glassContainer || !liquidGlassEnabled) return;

    try {
        // Update WebGL uniforms if available
        if (glassContainer.gl_refs?.gl) {
            const gl = glassContainer.gl_refs.gl;
            const uniformName = param + 'Loc';
            const uniformLoc = glassContainer.gl_refs[uniformName];

            if (uniformLoc) {
                gl.uniform1f(uniformLoc, value);
                if (glassContainer.render) {
                    glassContainer.render();
                }
            }
        }
    } catch (error) {
        console.error(`Failed to update ${param}:`, error);
    }
}

// Randomize all settings
function randomizeSettings() {
    const settings = {
        edgeIntensity: Math.random() * 0.1,
        rimIntensity: Math.random() * 0.2,
        baseIntensity: Math.random() * 0.1,
        edgeDistance: Math.random() * 0.5,
        rimDistance: Math.random(),
        baseDistance: Math.random() * 0.5,
        cornerBoost: Math.random() * 0.1,
        rippleEffect: Math.random() * 0.5,
        blurRadius: Math.random() * 20,
        tintOpacity: Math.random()
    };

    applySettings(settings);
    saveSettings();
}

// Reset to default settings
function resetToDefaults() {
    applySettings(defaultSettings);
    saveSettings();
}

// Apply settings to sliders and glass
function applySettings(settings) {
    Object.entries(settings).forEach(([key, value]) => {
        const slider = document.getElementById(key);
        const label = slider?.previousElementSibling;
        const valueDisplay = label?.querySelector('.setting-value');

        if (slider && valueDisplay) {
            slider.value = value;
            valueDisplay.textContent = value.toFixed(3);
            updateGlassParameter(key, value);
        }
    });
}

// Save settings to localStorage
function saveSettings() {
    const settings = {};
    Object.keys(defaultSettings).forEach(key => {
        const slider = document.getElementById(key);
        if (slider) {
            settings[key] = parseFloat(slider.value);
        }
    });

    try {
        localStorage.setItem('atlas-liquid-glass-settings', JSON.stringify(settings));
    } catch (error) {
        console.warn('Failed to save settings to localStorage:', error);
    }
}

// Load saved settings from localStorage
function loadSavedSettings() {
    try {
        const saved = localStorage.getItem('atlas-liquid-glass-settings');
        if (saved) {
            const settings = JSON.parse(saved);
            applySettings({ ...defaultSettings, ...settings });
            console.log('%cLoaded saved liquid glass settings', 'color: #2563eb;');
        }
    } catch (error) {
        console.warn('Failed to load saved settings:', error);
    }
}

// Export for debugging
window.glassDebug = {
    container: () => glassContainer,
    button: () => glassSettingsButton,
    reset: resetToDefaults,
    randomize: randomizeSettings,
    settings: () => window.glassControls,
    reinit: () => {
        disableLiquidGlass();
        disableGlassSettingsButton();
        setTimeout(() => {
            initLiquidGlass();
            initGlassSettingsButton();
        }, 100);
    },
    recapture: () => {
        if (typeof Container !== 'undefined' && Container.recaptureAll) {
            console.log('Manually triggering recapture...');
            Container.recaptureAll();
        } else {
            console.warn('Container.recaptureAll not available');
        }
    }
};
