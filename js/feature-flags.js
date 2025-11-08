// Feature Flags for Atlas Logged Website
// Toggle features on/off without deploying

const FEATURE_FLAGS = {
    // Content Pages
    showChangelogInFooter: false,  // Set to true when ready to go live
    showRoadmapInFooter: false,    // Set to true when ready to go live

    // Cookie Consent
    enableGeoTargeting: true,      // Geo-target cookie banner to GDPR regions only
    geoCacheHours: 1,              // Cache duration in hours (stored in sessionStorage, cleared on browser close)

    // Visual Effects
    enableLiquidGlass: false,      // Enable liquid glass visual effects (requires html2canvas, adds ~100KB)

    // Future flags can go here
    // showBlogInNav: false,
    // enableNewsletter: false,
};

// Apply feature flags on page load
document.addEventListener('DOMContentLoaded', function() {
    // Hide/show changelog link in footer
    const changelogLinks = document.querySelectorAll('a[href="changelog.html"]');
    changelogLinks.forEach(link => {
        if (!FEATURE_FLAGS.showChangelogInFooter) {
            link.style.display = 'none';
        }
    });

    // Hide/show roadmap link in footer
    const roadmapLinks = document.querySelectorAll('a[href="roadmap.html"]');
    roadmapLinks.forEach(link => {
        if (!FEATURE_FLAGS.showRoadmapInFooter) {
            link.style.display = 'none';
        }
    });

    // Handle liquid glass feature flag
    if (!FEATURE_FLAGS.enableLiquidGlass) {
        // Hide settings panel and button
        const settingsPanel = document.getElementById('glass-settings-panel');
        const settingsCog = document.getElementById('settings-cog');

        if (settingsPanel) settingsPanel.remove();
        if (settingsCog) settingsCog.remove();

        // Remove liquid glass CSS if present
        const liquidGlassCSS = document.querySelector('link[href="css/liquid-glass.css"]');
        if (liquidGlassCSS) liquidGlassCSS.remove();

        // Remove liquid glass attribution from footer
        const glassAttribution = document.querySelector('footer p a[href*="liquid-glass"]');
        if (glassAttribution && glassAttribution.parentElement) {
            glassAttribution.parentElement.remove();
        }

        // Prevent liquid glass scripts from loading by removing them
        // Note: Scripts are conditionally loaded based on this flag in HTML
    }
});
