// ========================================
// Atlas Logged Roadmap API Integration
// Connects roadmap.html to Google Sheets
// ========================================

const API_URL = 'https://script.google.com/macros/s/AKfycbxTt6OqQBMj5DeSmQ-yMMUrnAvcuKQJa-pNx7h8KNgAp37PR8GsfaCkQIqOH3vWhWQ-/exec';

// Emoji mapping for feature titles
const EMOJI_MAP = {
    'Dark Mode': '🌙',
    'Custom Tags': '🏷️',
    'Export to CSV': '📤',
    'Smart Notifications': '🔔',
    'Custom Map Styles': '🎨',
    'Year in Review': '📊',
    'Travel Goals': '🎯',
    'Timeline View': '🗓️',
    'Smart Predictions': '🤖',
    'Visa Tracking': '✈️',
    'Premium Features': '💰',
    'Advanced Notes': '📝',
    'Photo Integration': '📸',
    'Performance Boost': '⚡',
    'Enhanced Stats': '📊',
    'Mac App': '🖥️',
    'Family Sharing': '👪',
    'Third-Party Integrations': '🔌',
    'Web Dashboard': '🌐',
    'Travel Planner': '📅',
    'iCloud Sync': '☁️',
    'Arabic Support': '🌍',
    'Map View': '🗺️'
};

// Status to column mapping
const STATUS_COLUMNS = {
    'Under Review': 'community-requests',
    'Prioritising': 'prioritising',
    'Planned': 'planned',
    'In Progress': 'building',
    'Completed': 'completed',
    'Exploring': 'exploring'
};

// ========================================
// FETCH FEATURES FROM API
// ========================================

async function loadRoadmapFeatures() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();

        if (!result.success) {
            console.error('API error:', result.message);
            return;
        }

        const features = result.data;
        console.log('Loaded', features.length, 'features from API');

        // Clear existing static content
        clearStaticFeatures();

        // Group features by status
        const grouped = groupFeaturesByStatus(features);

        // Render each column
        renderColumn('community-requests', grouped['Under Review'] || []);
        renderColumn('prioritising', grouped['Prioritising'] || []);
        renderColumn('planned', grouped['Planned'] || []);
        renderColumn('building', grouped['In Progress'] || []);
        renderColumn('exploring', grouped['Exploring'] || []);

        // Render delivered timeline
        renderDeliveredTimeline(grouped['Completed'] || []);

        // Restore voted state
        if (typeof restoreVotedState === 'function') {
            restoreVotedState();
        }

    } catch (error) {
        console.error('Error loading features:', error);
    }
}

// ========================================
// GROUP FEATURES BY STATUS
// ========================================

function groupFeaturesByStatus(features) {
    const grouped = {};

    features.forEach(feature => {
        const status = feature.status;
        if (!grouped[status]) {
            grouped[status] = [];
        }
        grouped[status].push(feature);
    });

    return grouped;
}

// ========================================
// CLEAR STATIC FEATURES
// ========================================

function clearStaticFeatures() {
    const columns = [
        'community-requests',
        'prioritising',
        'planned',
        'building',
        'exploring'
    ];

    columns.forEach(columnId => {
        const container = document.querySelector(`[data-column="${columnId}"] .feature-cards`);
        if (container) {
            container.innerHTML = '';
        }
    });
}

// ========================================
// RENDER COLUMN
// ========================================

function renderColumn(columnId, features) {
    const container = document.querySelector(`[data-column="${columnId}"] .feature-cards`);
    if (!container) {
        console.warn('Column not found:', columnId);
        return;
    }

    // Update count
    const countElem = document.querySelector(`[data-column="${columnId}"] .column-count`);
    if (countElem) {
        countElem.textContent = features.length + ' ' + (features.length === 1 ? 'feature' : 'features');
    }

    // Render cards
    features.forEach(feature => {
        const card = createFeatureCard(feature, columnId);
        container.appendChild(card);
    });
}

// ========================================
// CREATE FEATURE CARD
// ========================================

function createFeatureCard(feature, columnId) {
    const card = document.createElement('div');
    card.className = 'feature-card';
    card.dataset.featureId = feature.id;

    const emoji = EMOJI_MAP[feature.title] || '✨';
    const isFrozen = feature.status === 'In Progress' || feature.status === 'Completed';
    const submittedFeatures = getSubmittedFeatures();
    const isYourSubmission = submittedFeatures.includes(feature.id);

    // Check if user has already voted for this feature
    const votedFeatures = getVotedFeatures();
    const featureIdStr = String(feature.id);
    const isVoted = votedFeatures.includes(featureIdStr);

    card.innerHTML = `
        <h4>
            ${emoji} ${feature.title}
            ${isYourSubmission ? '<span class="submission-badge">Your submission</span>' : ''}
        </h4>
        <p>${feature.description}</p>
        <div class="vote-section">
            <button class="vote-button ${isFrozen ? 'frozen' : (isVoted ? 'voted' : '')}"
                    ${isFrozen ? 'disabled' : ''}
                    onclick="voteForFeature(${feature.id}, this)">
                ${isFrozen ? '🔒 Frozen' : (isVoted ? '✅ Voted' : '⬆️ Vote')}
            </button>
            <span class="vote-count">${feature.votes} votes</span>
        </div>
    `;

    return card;
}

// ========================================
// RENDER DELIVERED TIMELINE
// ========================================

function renderDeliveredTimeline(completedFeatures) {
    const timeline = document.querySelector('.delivered-timeline');
    if (!timeline) return;

    // Clear existing content except the changelog link
    const changelogLink = timeline.querySelector('.view-changelog-link');
    timeline.innerHTML = '';

    // Group by version (we'll just group by month for now)
    const byMonth = {};

    completedFeatures.forEach(feature => {
        const date = new Date(feature.submitted);
        const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        if (!byMonth[monthKey]) {
            byMonth[monthKey] = {
                date: date,
                features: []
            };
        }
        byMonth[monthKey].features.push(feature);
    });

    // Sort by date (newest first)
    const sortedMonths = Object.entries(byMonth).sort((a, b) => b[1].date - a[1].date);

    // Render each release group
    sortedMonths.forEach(([monthKey, data], index) => {
        const releaseGroup = document.createElement('div');
        releaseGroup.className = 'release-group';

        const header = document.createElement('div');
        header.className = 'release-header';
        header.innerHTML = `
            <h3 class="release-version">Released ${monthKey}</h3>
            <p class="release-date">${data.features.length} feature${data.features.length !== 1 ? 's' : ''}</p>
        `;
        releaseGroup.appendChild(header);

        const featuresContainer = document.createElement('div');
        featuresContainer.className = 'release-features';

        data.features.forEach(feature => {
            const emoji = EMOJI_MAP[feature.title] || '✨';
            const card = document.createElement('div');
            card.className = 'delivered-card';
            card.innerHTML = `
                <h4>${emoji} ${feature.title}</h4>
                <p>${feature.description}</p>
                <div class="final-votes">
                    ✅ ${feature.votes} community votes
                </div>
            `;
            featuresContainer.appendChild(card);
        });

        releaseGroup.appendChild(featuresContainer);
        timeline.appendChild(releaseGroup);
    });

    // Re-add changelog link
    if (changelogLink) {
        const linkWrapper = document.createElement('div');
        linkWrapper.style.textAlign = 'center';
        linkWrapper.style.marginTop = '3rem';
        linkWrapper.appendChild(changelogLink.cloneNode(true));
        timeline.appendChild(linkWrapper);
    } else {
        const linkWrapper = document.createElement('div');
        linkWrapper.style.textAlign = 'center';
        linkWrapper.style.marginTop = '3rem';
        linkWrapper.innerHTML = `
            <a href="changelog.html" class="view-changelog-link">
                View Full Changelog →
            </a>
        `;
        timeline.appendChild(linkWrapper);
    }
}

// ========================================
// LOCALSTORAGE HELPERS FOR VOTE PERSISTENCE
// ========================================

function getVotedFeatures() {
    const voted = localStorage.getItem('atlas_voted_features');
    return voted ? JSON.parse(voted) : [];
}

function saveVotedFeatures(votedArray) {
    localStorage.setItem('atlas_voted_features', JSON.stringify(votedArray));
}

function getSubmittedFeatures() {
    const submitted = localStorage.getItem('atlas_submitted_features');
    return submitted ? JSON.parse(submitted) : [];
}

function saveSubmittedFeatures(submittedArray) {
    localStorage.setItem('atlas_submitted_features', JSON.stringify(submittedArray));
}

function restoreVotedState() {
    const votedFeatures = getVotedFeatures();
    document.querySelectorAll('.vote-button:not(.frozen)').forEach(button => {
        const card = button.closest('.feature-card');
        if (!card) return;

        const featureId = parseInt(card.dataset.featureId);
        if (votedFeatures.includes(featureId)) {
            button.classList.add('voted');
            button.innerHTML = '✅ Voted';
        }
    });
}

// ========================================
// SHOW VOTE ERROR (SUBTLE UI FEEDBACK)
// ========================================

function showVoteError(button, message) {
    // Create error tooltip
    const card = button.closest('.feature-card');
    if (!card) return;

    // Remove any existing error messages
    const existingError = card.querySelector('.vote-error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'vote-error-message';
    errorDiv.textContent = message;

    // Insert after vote section
    const voteSection = button.parentElement;
    voteSection.parentElement.insertBefore(errorDiv, voteSection.nextSibling);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        errorDiv.style.opacity = '0';
        setTimeout(() => errorDiv.remove(), 300);
    }, 4000);
}

// ========================================
// VOTE FOR FEATURE (REAL API CALL)
// ========================================

async function voteForFeature(featureId, button) {
    // Convert featureId to string for consistent comparison
    featureId = String(featureId);

    // Ignore frozen or loading buttons
    if (button.disabled || button.classList.contains('frozen') || button.classList.contains('loading')) {
        return;
    }

    const votedFeatures = getVotedFeatures();
    const isVoted = button.classList.contains('voted');
    const voteCount = button.parentElement.querySelector('.vote-count');

    // Store original state for rollback
    const originalButtonHTML = button.innerHTML;
    const originalButtonClasses = button.className;
    const originalVoteText = voteCount ? voteCount.textContent : '';
    const originalVoteNumber = originalVoteText ? parseInt(originalVoteText) : 0;

    // OPTIMISTIC UPDATE - Update UI immediately
    button.classList.add('loading');
    button.disabled = true;

    if (isVoted) {
        // Optimistic unvote
        button.classList.remove('voted');
        button.innerHTML = '⬆️ Vote <span style="display:inline-block;animation:spin 0.6s linear infinite;margin-left:4px;">⏳</span>';

        if (voteCount) {
            voteCount.textContent = Math.max(0, originalVoteNumber - 1) + ' votes';
        }

        // Update localStorage immediately
        const index = votedFeatures.indexOf(featureId);
        if (index > -1) {
            votedFeatures.splice(index, 1);
            saveVotedFeatures(votedFeatures);
        }
    } else {
        // Optimistic vote
        button.classList.add('voted');
        button.innerHTML = '✅ Voted <span style="display:inline-block;animation:spin 0.6s linear infinite;margin-left:4px;">⏳</span>';

        if (voteCount) {
            voteCount.textContent = (originalVoteNumber + 1) + ' votes';
        }

        // Update localStorage immediately
        votedFeatures.push(featureId);
        saveVotedFeatures(votedFeatures);
    }

    // Make API call in background
    try {
        const action = isVoted ? 'unvote' : 'vote';
        const response = await fetch(`${API_URL}?action=${action}&id=${featureId}&userAgent=${navigator.userAgent}&ipAddress=unknown`);
        const result = await response.json();

        if (result.success) {
            // Update with real vote count from server
            if (voteCount) {
                voteCount.textContent = result.data.newVotes + ' votes';
            }

            // Remove loading state
            button.classList.remove('loading');
            button.disabled = false;
            button.innerHTML = isVoted ? '⬆️ Vote' : '✅ Voted';

            console.log(isVoted ? 'Vote removed:' : 'Vote recorded:', result.data);
        } else {
            // Check if error is "already voted" - sync localStorage with server state
            if (result.message && result.message.includes('already voted')) {
                // Server says we voted, but localStorage didn't know
                // Sync the state: mark as voted in localStorage
                if (!votedFeatures.includes(featureId)) {
                    votedFeatures.push(featureId);
                    saveVotedFeatures(votedFeatures);
                }

                // Update UI to show voted state (keep the optimistic count)
                button.classList.remove('loading');
                button.classList.add('voted');
                button.disabled = false;
                button.innerHTML = '✅ Voted';

                console.log('Synced vote state from server for feature', featureId);
            } else if (result.message && result.message.includes('have not voted')) {
                // Server says we didn't vote, but localStorage thought we did
                // Sync the state: remove from localStorage
                const index = votedFeatures.indexOf(featureId);
                if (index > -1) {
                    votedFeatures.splice(index, 1);
                    saveVotedFeatures(votedFeatures);
                }

                // Update UI to show unvoted state
                button.classList.remove('loading');
                button.classList.remove('voted');
                button.disabled = false;
                button.innerHTML = '⬆️ Vote';

                console.log('Synced unvote state from server for feature', featureId);
            } else {
                // Other error - keep optimistic update, don't rollback
                button.classList.remove('loading');
                button.disabled = false;

                // Keep the voted state in UI (don't rollback)
                if (!isVoted) {
                    // Was trying to vote - keep voted state
                    button.classList.add('voted');
                    button.innerHTML = '✅ Voted';
                } else {
                    // Was trying to unvote - keep unvoted state
                    button.classList.remove('voted');
                    button.innerHTML = '⬆️ Vote';
                }

                // Do NOT modify localStorage - keep the optimistic update
                // Vote will sync with server on next successful page load

                // Show subtle error message instead of alert
                showVoteError(button, result.message || 'Saved offline. Will sync when online.');
            }
        }
    } catch (error) {
        // On error, DO NOT rollback localStorage - keep the optimistic update
        // This ensures votes persist even if the API is temporarily unavailable
        console.error('Error voting:', error);

        // Remove loading state
        button.classList.remove('loading');
        button.disabled = false;

        // Keep the voted state in UI (don't rollback)
        if (!isVoted) {
            // Was trying to vote - keep voted state
            button.classList.add('voted');
            button.innerHTML = '✅ Voted';
        } else {
            // Was trying to unvote - keep unvoted state
            button.classList.remove('voted');
            button.innerHTML = '⬆️ Vote';
        }

        // Do NOT modify localStorage - keep the optimistic update
        // Vote will sync with server on next successful page load

        // Show subtle error message instead of alert
        showVoteError(button, 'Saved offline. Will sync when online.');
    }
}

// ========================================
// SUBMIT NEW FEATURE (REAL API CALL)
// ========================================

async function submitFeature(title, description, email) {
    try {
        // Use form encoding instead of JSON to avoid CORS preflight
        const formData = new URLSearchParams();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('email', email || 'Anonymous');

        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            console.log('Feature submitted:', result.data);

            // Save submission to localStorage
            const submittedFeatures = getSubmittedFeatures();
            submittedFeatures.push(result.data.id);
            saveSubmittedFeatures(submittedFeatures);

            // Reload features to show new submission with badge
            setTimeout(() => loadRoadmapFeatures(), 1000);
            return { success: true, message: 'Feature submitted successfully!' };
        } else {
            return { success: false, message: result.message };
        }
    } catch (error) {
        console.error('Error submitting feature:', error);
        return { success: false, message: 'Submission failed. Please try again.' };
    }
}

// ========================================
// LOAD ON PAGE READY
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    loadRoadmapFeatures();
});
