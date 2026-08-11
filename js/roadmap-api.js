// Atlas Logged Roadmap API integration. The API and data-column contracts are public-site stable.
(function () {
    'use strict';

    const API_URL = 'https://script.google.com/macros/s/AKfycbxTt6OqQBMj5DeSmQ-yMMUrnAvcuKQJa-pNx7h8KNgAp37PR8GsfaCkQIqOH3vWhWQ-/exec';
    const columns = ['community-requests', 'prioritising', 'planned', 'building', 'exploring'];
    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function makeElement(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    async function loadRoadmapFeatures() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`Roadmap service returned ${response.status}`);
            const result = await response.json();
            if (!result.success || !Array.isArray(result.data)) throw new Error(result.message || 'Invalid roadmap response');
            clearStaticFeatures();
            const grouped = groupFeaturesByStatus(result.data);
            renderColumn('community-requests', grouped['Under Review'] || []);
            renderColumn('prioritising', grouped.Prioritising || []);
            renderColumn('planned', grouped.Planned || []);
            renderColumn('building', grouped['In Progress'] || []);
            renderColumn('exploring', grouped.Exploring || []);
            renderDeliveredTimeline(grouped.Completed || []);
            restoreVotedState();
        } catch (error) {
            console.error('Error loading roadmap features:', error);
            columns.forEach((columnId) => {
                const column = document.querySelector(`[data-column="${columnId}"]`);
                const count = column?.querySelector('.column-count');
                const container = column?.querySelector('.feature-cards');
                if (count) count.textContent = 'Unavailable right now';
                if (container) {
                    container.replaceChildren(makeElement('p', 'roadmap-empty', 'The live roadmap could not be loaded. Please try again later.'));
                }
            });
            const timeline = document.querySelector('.delivered-timeline');
            if (timeline) timeline.replaceChildren(makeElement('p', 'roadmap-empty', 'Delivered items are unavailable right now.'));
        }
    }

    function groupFeaturesByStatus(features) {
        return features.reduce((grouped, feature) => {
            const status = String(feature.status || 'Under Review');
            (grouped[status] ||= []).push(feature);
            return grouped;
        }, {});
    }

    function clearStaticFeatures() {
        columns.forEach((columnId) => {
            const container = document.querySelector(`[data-column="${columnId}"] .feature-cards`);
            if (container) container.replaceChildren();
        });
    }

    function renderColumn(columnId, features) {
        const container = document.querySelector(`[data-column="${columnId}"] .feature-cards`);
        const count = document.querySelector(`[data-column="${columnId}"] .column-count`);
        if (!container) return;
        if (count) count.textContent = `${features.length} ${features.length === 1 ? 'feature' : 'features'}`;
        if (features.length === 0) {
            container.appendChild(makeElement('p', 'roadmap-empty', 'No features are in this stage right now.'));
            return;
        }
        features.forEach((feature) => container.appendChild(createFeatureCard(feature)));
    }

    function createFeatureCard(feature) {
        const card = makeElement('article', 'feature-card');
        card.dataset.featureId = String(feature.id);
        const title = String(feature.title || 'Untitled feature');
        const isFrozen = feature.status === 'In Progress' || feature.status === 'Completed';
        const isYourSubmission = getSubmittedFeatures().map(String).includes(String(feature.id));
        const isVoted = getVotedFeatures().map(String).includes(String(feature.id));

        const heading = makeElement('h4');
        heading.append(title);
        if (isYourSubmission) heading.appendChild(makeElement('span', 'submission-badge', 'Your submission'));
        const description = makeElement('p', null, String(feature.description || ''));
        const voteSection = makeElement('div', 'vote-section');
        const button = makeElement('button', `vote-button${isFrozen ? ' frozen' : ''}${isVoted ? ' voted' : ''}`, isFrozen ? 'Locked' : (isVoted ? 'Voted' : 'Vote'));
        button.type = 'button';
        button.disabled = isFrozen;
        button.setAttribute('aria-pressed', String(isVoted));
        button.addEventListener('click', () => voteForFeature(feature.id, button));
        voteSection.append(button, makeElement('span', 'vote-count', `${Number(feature.votes) || 0} votes`));
        card.append(heading, description, voteSection);
        return card;
    }

    function renderDeliveredTimeline(features) {
        const timeline = document.querySelector('.delivered-timeline');
        if (!timeline) return;
        timeline.replaceChildren();
        if (features.length === 0) {
            timeline.appendChild(makeElement('p', 'roadmap-empty', 'No delivered roadmap items are listed yet.'));
            return;
        }
        const byMonth = {};
        features.forEach((feature) => {
            const date = new Date(feature.submitted);
            const validDate = Number.isNaN(date.valueOf()) ? new Date() : date;
            const key = validDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            (byMonth[key] ||= { date: validDate, features: [] }).features.push(feature);
        });
        Object.entries(byMonth).sort((a, b) => b[1].date - a[1].date).forEach(([month, release]) => {
            const group = makeElement('section', 'release-group');
            const header = makeElement('header', 'release-header');
            header.append(makeElement('h3', 'release-version', `Released ${month}`), makeElement('p', 'release-date', `${release.features.length} feature${release.features.length === 1 ? '' : 's'}`));
            const list = makeElement('div', 'release-features');
            release.features.forEach((feature) => {
                const card = makeElement('article', 'delivered-card');
                card.append(makeElement('h4', null, String(feature.title || 'Untitled feature')), makeElement('p', null, String(feature.description || '')), makeElement('div', 'final-votes', `${Number(feature.votes) || 0} community votes`));
                list.appendChild(card);
            });
            group.append(header, list);
            timeline.appendChild(group);
        });
        const link = document.createElement('a');
        link.href = 'changelog.html';
        link.className = 'view-changelog-link';
        link.textContent = 'View full changelog';
        timeline.appendChild(link);
    }

    function readStoredList(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || '[]');
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    }
    function writeStoredList(key, values) {
        try {
            localStorage.setItem(key, JSON.stringify(values));
        } catch {
            // Voting and submission still work when browser storage is unavailable.
        }
    }
    function getVotedFeatures() { return readStoredList('atlas_voted_features'); }
    function saveVotedFeatures(features) { writeStoredList('atlas_voted_features', features); }
    function getSubmittedFeatures() { return readStoredList('atlas_submitted_features'); }
    function saveSubmittedFeatures(features) { writeStoredList('atlas_submitted_features', features); }

    function restoreVotedState() {
        const voted = getVotedFeatures().map(String);
        document.querySelectorAll('.vote-button:not(.frozen)').forEach((button) => {
            const card = button.closest('.feature-card');
            if (card && voted.includes(String(card.dataset.featureId))) setVoteButton(button, true);
        });
    }

    function setVoteButton(button, voted, loading = false) {
        button.classList.toggle('voted', voted);
        button.classList.toggle('loading', loading);
        button.disabled = loading;
        button.setAttribute('aria-pressed', String(voted));
        button.textContent = loading ? 'Saving…' : (voted ? 'Voted' : 'Vote');
    }

    function showVoteError(button, message) {
        const card = button.closest('.feature-card');
        if (!card) return;
        card.querySelector('.vote-error-message')?.remove();
        const error = makeElement('p', 'vote-error-message', message);
        error.setAttribute('role', 'status');
        card.appendChild(error);
        window.setTimeout(() => error.remove(), 4000);
    }

    async function voteForFeature(featureId, button) {
        if (button.disabled || button.classList.contains('frozen')) return;
        const voted = getVotedFeatures().map(String);
        const id = String(featureId);
        const wasVoted = button.classList.contains('voted');
        const nextVoted = !wasVoted;
        const count = button.parentElement?.querySelector('.vote-count');
        const currentCount = Number.parseInt(count?.textContent || '0', 10) || 0;
        const optimisticCount = Math.max(0, currentCount + (nextVoted ? 1 : -1));

        if (count) count.textContent = `${optimisticCount} votes`;
        setVoteButton(button, nextVoted, true);

        try {
            const action = wasVoted ? 'unvote' : 'vote';
            const response = await fetch(`${API_URL}?action=${action}&id=${encodeURIComponent(id)}&userAgent=${encodeURIComponent(navigator.userAgent)}&ipAddress=unknown`);
            if (!response.ok) throw new Error(`Vote service returned ${response.status}`);
            const result = await response.json();
            if (!result.success) throw new Error(result.message || 'Vote could not be saved');

            const nextStoredVotes = voted.filter((storedID) => storedID !== id);
            if (nextVoted) nextStoredVotes.push(id);
            saveVotedFeatures(nextStoredVotes);
            const serverCount = Number(result.data?.newVotes);
            if (count) count.textContent = `${Number.isFinite(serverCount) ? serverCount : optimisticCount} votes`;
            setVoteButton(button, nextVoted);
        } catch (error) {
            if (count) count.textContent = `${currentCount} votes`;
            setVoteButton(button, wasVoted);
            showVoteError(button, 'The vote service is unavailable. Your vote was not changed.');
            console.error('Error voting:', error);
        }
    }

    async function submitFeature(title, description, email) {
        try {
            const body = new URLSearchParams({ title, description, email: email || 'Anonymous' });
            const response = await fetch(API_URL, { method: 'POST', body });
            if (!response.ok) throw new Error(`Submission service returned ${response.status}`);
            const result = await response.json();
            if (!result.success) return { success: false, message: result.message || 'Submission failed.' };
            const submitted = getSubmittedFeatures();
            if (result.data?.id !== undefined) {
                submitted.push(result.data.id);
                saveSubmittedFeatures([...new Set(submitted.map(String))]);
            }
            window.setTimeout(loadRoadmapFeatures, 1000);
            return { success: true, message: 'Feature submitted successfully.' };
        } catch (error) {
            console.error('Error submitting feature:', error);
            return { success: false, message: 'Submission failed. Please try again.' };
        }
    }

    function initModal() {
        const modal = document.getElementById('featureModal');
        const opener = document.getElementById('openModal');
        const close = document.getElementById('closeModal');
        const form = document.getElementById('feature-form');
        if (!modal || !opener || !close || !form) return;
        let returnFocus = null;
        const closeModal = () => {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
            if (returnFocus instanceof HTMLElement) returnFocus.focus();
        };
        const openModal = () => {
            returnFocus = document.activeElement;
            const status = document.getElementById('feature-form-status');
            if (status) status.textContent = '';
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open');
            document.getElementById('feature-title')?.focus();
        };
        opener.addEventListener('click', openModal);
        close.addEventListener('click', closeModal);
        modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
        document.addEventListener('keydown', (event) => {
            if (!modal.classList.contains('active')) return;
            if (event.key === 'Escape') { event.preventDefault(); closeModal(); return; }
            if (event.key !== 'Tab') return;
            const focusable = [...modal.querySelectorAll(focusableSelector)];
            const first = focusable[0];
            const last = focusable.at(-1);
            if (!first || !last) return;
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        });
        [['feature-title', 'title-count'], ['feature-description', 'desc-count']].forEach(([field, counter]) => {
            document.getElementById(field)?.addEventListener('input', (event) => { document.getElementById(counter).textContent = event.target.value.length; });
        });
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const submit = form.querySelector('button[type="submit"]');
            submit.disabled = true;
            submit.textContent = 'Submitting…';
            const title = document.getElementById('feature-title').value.trim();
            const description = document.getElementById('feature-description').value.trim();
            const email = document.getElementById('feature-email').value.trim();
            const status = document.getElementById('feature-form-status');
            if (!title || !description) {
                submit.disabled = false;
                submit.textContent = 'Submit feature request';
                if (status) status.textContent = 'Add a title and description before submitting.';
                return;
            }
            const result = await submitFeature(title, description, email);
            submit.disabled = false;
            submit.textContent = 'Submit feature request';
            if (result.success) {
                form.reset();
                document.getElementById('title-count').textContent = '0';
                document.getElementById('desc-count').textContent = '0';
                closeModal();
            } else if (status) {
                status.textContent = result.message;
            }
        });
    }

    window.submitFeature = submitFeature;
    window.voteForFeature = voteForFeature;
    document.addEventListener('DOMContentLoaded', () => { initModal(); loadRoadmapFeatures(); });
})();
