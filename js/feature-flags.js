// Feature Flags for Atlas Logged Website
// Toggle features on/off without deploying

const FEATURE_FLAGS = {
    // Content Pages
    showChangelogInFooter: false,  // Set to true when ready to go live
    showRoadmapInFooter: false,    // Set to true when ready to go live

    // Cookie Consent
    enableGeoTargeting: true,      // Geo-target cookie banner to GDPR regions only
    geoCacheHours: 1,              // Cache duration in hours (stored in sessionStorage, cleared on browser close)

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
});
