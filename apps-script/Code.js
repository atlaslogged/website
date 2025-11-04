// ========================================
// Atlas Logged Roadmap API
// Complete script with setup function
// ========================================

// CONFIGURATION
const SHEET_NAME = 'Features';
const BACKUP_SUBMISSIONS_SHEET = 'Backup_Submissions';  // Inbound: New submissions
const BACKUP_VOTES_SHEET = 'Backup_Votes';              // State changes: Vote/Unvote
const BACKUP_DELETES_SHEET = 'Backup_Deletes';          // Cleanup: Test deletions
const BACKUP_SNAPSHOT_SHEET = 'Backup_Snapshots';       // Full snapshots of Features list
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const VOTE_COOLDOWN_HOURS = 24;
const SUBMIT_COOLDOWN_HOURS = 1;

// ========================================
// ONE-TIME SETUP FUNCTION
// Run this ONCE after deploying to populate sheet
// ========================================

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  } else {
    // Clear existing data
    sheet.clear();
  }

  // Set up headers
  const headers = ['ID', 'Title', 'Description', 'Votes', 'Status', 'Submitted', 'Email'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#4A90E2')
    .setFontColor('#FFFFFF');

  // Freeze header row
  sheet.setFrozenRows(1);

  // Set column widths
  sheet.setColumnWidth(1, 50);
  sheet.setColumnWidth(2, 200);
  sheet.setColumnWidth(3, 350);
  sheet.setColumnWidth(4, 80);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 150);
  sheet.setColumnWidth(7, 200);

  // Add data validation for Status column
  const statusValues = [
    'Under Review',
    'Prioritising',
    'Planned',
    'In Progress',
    'Completed',
    'Exploring',
    'Declined'
  ];

  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(statusValues)
    .build();

  sheet.getRange('E:E').setDataValidation(statusRule);

  // Populate with existing roadmap data
  const features = [
    [1, 'Dark Mode', 'Add a dark theme option for better viewing at night and reduced eye strain', 42, 'Under Review', new Date('2025-01-15'), 'Anonymous'],
    [2, 'Custom Tags', 'Let users add custom tags to locations like business trip or vacation', 38, 'Under Review', new Date('2025-01-14'), 'Anonymous'],
    [3, 'Export to CSV', 'Export all location data as CSV file for analysis in Excel or Numbers', 29, 'Under Review', new Date('2025-01-13'), 'Anonymous'],
    [4, 'Smart Notifications', 'Get notified when you visit a new country or city for the first time', 15, 'Under Review', new Date('2025-01-12'), 'Anonymous'],
    [5, 'Custom Map Styles', 'Choose different map visual styles like satellite terrain or vintage', 12, 'Under Review', new Date('2025-01-11'), 'Anonymous'],
    [6, 'Year in Review', 'Beautiful annual summary of your travels with stats and highlights', 156, 'Prioritising', new Date('2025-01-10'), 'Anonymous'],
    [7, 'Travel Goals', 'Set goals like visit 50 countries and track progress', 89, 'Prioritising', new Date('2025-01-09'), 'Anonymous'],
    [8, 'Timeline View', 'View your travel history as an interactive timeline', 67, 'Prioritising', new Date('2025-01-08'), 'Anonymous'],
    [9, 'Smart Predictions', 'AI-powered predictions of your next destination based on travel patterns', 234, 'Planned', new Date('2025-01-07'), 'Anonymous'],
    [10, 'Visa Tracking', 'Never overstay! Get warnings before reaching visa time limits', 189, 'Planned', new Date('2025-01-06'), 'Anonymous'],
    [11, 'Premium Features', 'Early access to new features before general release', 145, 'Planned', new Date('2025-01-05'), 'Anonymous'],
    [12, 'Advanced Notes', 'Rich notes with timestamps for each location and journey', 98, 'Planned', new Date('2025-01-04'), 'Anonymous'],
    [13, 'Photo Integration', 'Import your travel history from photo metadata in your camera roll', 312, 'In Progress', new Date('2024-12-20'), 'Anonymous'],
    [14, 'Performance Boost', 'Faster app launch and smoother scrolling even with years of data', 267, 'In Progress', new Date('2024-12-19'), 'Anonymous'],
    [15, 'Enhanced Stats', 'More detailed insights into your travel patterns and history', 201, 'In Progress', new Date('2024-12-18'), 'Anonymous'],
    [16, 'Mac App', 'Full-featured desktop companion for macOS', 567, 'Exploring', new Date('2024-12-15'), 'Anonymous'],
    [17, 'Family Sharing', 'Share and coordinate travels with family members', 234, 'Exploring', new Date('2024-12-14'), 'Anonymous'],
    [18, 'Third-Party Integrations', 'Connect with calendar expense and health apps', 178, 'Exploring', new Date('2024-12-13'), 'Anonymous'],
    [19, 'Web Dashboard', 'View your travel history from any browser', 445, 'Exploring', new Date('2024-12-12'), 'Anonymous'],
    [20, 'Travel Planner', 'Plan your future travels and visualize upcoming journeys', 445, 'Completed', new Date('2024-11-15'), 'Anonymous'],
    [21, 'iCloud Sync', 'Free file-based sync and premium automatic CloudKit sync', 389, 'Completed', new Date('2024-11-14'), 'Anonymous'],
    [22, 'Arabic Support', 'Complete right-to-left interface for Arabic speakers', 156, 'Completed', new Date('2024-10-20'), 'Anonymous'],
    [23, 'Map View', 'Visualize your travels on an interactive map', 523, 'Completed', new Date('2024-09-15'), 'Anonymous']
  ];

  // Add all features to sheet
  if (features.length > 0) {
    sheet.getRange(2, 1, features.length, 7).setValues(features);
  }

  // Format votes column as numbers
  sheet.getRange('D:D').setNumberFormat('#,##0');

  // Format date column
  sheet.getRange('F:F').setNumberFormat('yyyy-mm-dd hh:mm:ss');

  // Add alternating row colors for readability
  const dataRange = sheet.getRange(2, 1, features.length, 7);
  dataRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);

  Logger.log('Sheet setup complete! Added ' + features.length + ' features.');
}

// ========================================
// API ENDPOINTS
// ========================================

// NOTE: CORS is handled automatically by Apps Script when deployed with "Anyone" access
// No need to manually set headers - Apps Script does this for us!

function doPost(e) {
  try {
    // Accept form-encoded data to avoid CORS preflight issues
    const data = e.parameter;

    if (!data.title || !data.description) {
      return createResponse(false, 'Title and description are required');
    }

    if (data.title.length > MAX_TITLE_LENGTH) {
      return createResponse(false, 'Title must be less than ' + MAX_TITLE_LENGTH + ' characters');
    }

    if (data.description.length > MAX_DESCRIPTION_LENGTH) {
      return createResponse(false, 'Description must be less than ' + MAX_DESCRIPTION_LENGTH + ' characters');
    }

    const userHash = getUserHash(e);
    const cache = CacheService.getScriptCache();

    if (cache.get('submit_' + userHash)) {
      return createResponse(false, 'Please wait before submitting another feature');
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const lastRow = sheet.getLastRow();
    const newId = lastRow;

    sheet.appendRow([
      newId,
      data.title,
      data.description,
      0,
      'Under Review',
      new Date(),
      data.email || 'Anonymous'
    ]);

    cache.put('submit_' + userHash, 'true', SUBMIT_COOLDOWN_HOURS * 3600);

    // Invalidate feature list cache since we added a new feature
    cache.remove('feature_list');
    Logger.log('Cache invalidated after new submission');

    // Write to backup sheet
    const submittedDate = new Date();
    writeToBackup('SUBMIT', {
      id: newId,
      title: data.title,
      description: data.description,
      votes: 0,
      status: 'Under Review',
      submitted: submittedDate,
      email: data.email || 'Anonymous'
    });

    return createResponse(true, 'Feature submitted successfully!', { id: newId });

  } catch (error) {
    Logger.log('Error in doPost: ' + error);
    return createResponse(false, 'An error occurred. Please try again.');
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'vote') {
      return handleVote(e);
    }

    if (action === 'unvote') {
      return handleUnvote(e);
    }

    if (action === 'delete') {
      return handleDelete(e);
    }

    // Try to get cached feature list
    const cache = CacheService.getScriptCache();
    const cachedData = cache.get('feature_list');

    if (cachedData) {
      Logger.log('Returning cached feature list');
      return ContentService
        .createTextOutput(cachedData)
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Cache miss - fetch from sheet
    Logger.log('Cache miss - fetching from sheet');
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    // OPTIMIZATION: Read only the columns we need and specific range
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return createResponse(true, 'No features yet', []);
    }

    // Read only columns A-G (ID, Title, Description, Votes, Status, Submitted, Email)
    const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();

    const features = data
      .map(function(row) {
        return {
          id: row[0],
          title: row[1],
          description: row[2],
          votes: row[3] || 0,
          status: row[4],
          submitted: row[5],
          email: row[6]
        };
      })
      .filter(function(f) {
        return f.status !== 'Declined';
      })
      .sort(function(a, b) {
        return b.votes - a.votes;
      });

    // Cache for 5 minutes (300 seconds)
    const response = createResponse(true, 'Features retrieved', features);
    const responseText = response.getContent();
    cache.put('feature_list', responseText, 300);

    return response;

  } catch (error) {
    Logger.log('Error in doGet: ' + error);
    return createResponse(false, 'An error occurred');
  }
}

function handleVote(e) {
  try {
    const featureId = parseInt(e.parameter.id);

    if (!featureId) {
      return createResponse(false, 'Invalid feature ID');
    }

    const userHash = getUserHash(e);
    const voteKey = 'vote_' + userHash + '_' + featureId;
    const cache = CacheService.getScriptCache();

    if (cache.get(voteKey)) {
      return createResponse(false, 'You already voted for this feature');
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    // OPTIMIZATION: Use cached row lookup instead of reading entire sheet
    const rowIndex = getFeatureRow(sheet, featureId);

    if (rowIndex === -1) {
      return createResponse(false, 'Feature not found');
    }

    // Read feature data for backup (only the row we need)
    const featureRow = sheet.getRange(rowIndex, 1, 1, 7).getValues()[0];

    // OPTIMIZATION: Read only the votes cell (column 4)
    const voteCell = sheet.getRange(rowIndex, 4);
    const currentVotes = voteCell.getValue() || 0;
    const newVotes = currentVotes + 1;

    // Write updated vote count
    voteCell.setValue(newVotes);

    // Store user's vote
    cache.put(voteKey, 'true', VOTE_COOLDOWN_HOURS * 3600);

    // Write to backup sheet (non-blocking)
    writeToBackup('VOTE', {
      id: featureId,
      title: featureRow[1],
      description: featureRow[2],
      votes: newVotes,
      status: featureRow[4],
      submitted: featureRow[5],
      email: featureRow[6]
    });

    // OPTIMIZATION: Update cached feature list instead of invalidating
    const updated = updateCachedFeatureList(cache, featureId, newVotes);
    if (!updated) {
      // Fall back to invalidation if update failed
      cache.remove('feature_list');
      Logger.log('Cache invalidated after vote (update failed)');
    }

    return createResponse(true, 'Vote recorded!', {
      featureId: featureId,
      newVotes: newVotes
    });

  } catch (error) {
    Logger.log('Error in handleVote: ' + error);
    return createResponse(false, 'Voting error');
  }
}

function handleUnvote(e) {
  try {
    const featureId = parseInt(e.parameter.id);

    if (!featureId) {
      return createResponse(false, 'Invalid feature ID');
    }

    const userHash = getUserHash(e);
    const voteKey = 'vote_' + userHash + '_' + featureId;
    const cache = CacheService.getScriptCache();

    if (!cache.get(voteKey)) {
      return createResponse(false, 'You have not voted for this feature');
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    // OPTIMIZATION: Use cached row lookup instead of reading entire sheet
    const rowIndex = getFeatureRow(sheet, featureId);

    if (rowIndex === -1) {
      return createResponse(false, 'Feature not found');
    }

    // Read feature data for backup (only the row we need)
    const featureRow = sheet.getRange(rowIndex, 1, 1, 7).getValues()[0];

    // OPTIMIZATION: Read only the votes cell (column 4)
    const voteCell = sheet.getRange(rowIndex, 4);
    const currentVotes = voteCell.getValue() || 0;
    const newVotes = Math.max(0, currentVotes - 1);

    // Write updated vote count
    voteCell.setValue(newVotes);

    // Remove user's vote
    cache.remove(voteKey);

    // Write to backup sheet (non-blocking)
    writeToBackup('UNVOTE', {
      id: featureId,
      title: featureRow[1],
      description: featureRow[2],
      votes: newVotes,
      status: featureRow[4],
      submitted: featureRow[5],
      email: featureRow[6]
    });

    // OPTIMIZATION: Update cached feature list instead of invalidating
    const updated = updateCachedFeatureList(cache, featureId, newVotes);
    if (!updated) {
      // Fall back to invalidation if update failed
      cache.remove('feature_list');
      Logger.log('Cache invalidated after unvote (update failed)');
    }

    return createResponse(true, 'Vote removed!', {
      featureId: featureId,
      newVotes: newVotes
    });

  } catch (error) {
    Logger.log('Error in handleUnvote: ' + error);
    return createResponse(false, 'Unvoting error');
  }
}

function handleDelete(e) {
  try {
    const featureId = parseInt(e.parameter.id);

    if (!featureId) {
      return createResponse(false, 'Invalid feature ID');
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();

    // Find and delete the row with matching ID
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === featureId) {
        const featureTitle = data[i][1];

        // SECURITY: Only allow deletion of test features (containing "E2E Test Feature")
        if (!featureTitle || !featureTitle.includes('E2E Test Feature')) {
          Logger.log('Delete attempt blocked for non-test feature: ' + featureId);
          return createResponse(false, 'Delete operation only allowed for test features');
        }

        // Write to backup BEFORE deleting (to preserve data)
        writeToBackup('DELETE', {
          id: featureId,
          title: featureTitle,
          description: data[i][2],
          votes: data[i][3],
          status: data[i][4],
          submitted: data[i][5],
          email: data[i][6]
        });

        sheet.deleteRow(i + 1);

        // Invalidate feature list cache since a feature was deleted
        const cache = CacheService.getScriptCache();
        cache.remove('feature_list');
        Logger.log('Test feature deleted and cache invalidated: ' + featureId);

        return createResponse(true, 'Feature deleted successfully', {
          featureId: featureId
        });
      }
    }

    return createResponse(false, 'Feature not found');

  } catch (error) {
    Logger.log('Error in handleDelete: ' + error);
    return createResponse(false, 'Delete error');
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get the sheet row number for a feature ID
 * Uses cache to avoid repeated lookups
 * OPTIMIZATION: Caches row numbers for 1 hour to avoid full sheet scans
 */
function getFeatureRow(sheet, featureId) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'feature_row_' + featureId;

  // Check cache first
  const cachedRow = cache.get(cacheKey);
  if (cachedRow !== null) {
    Logger.log('Row cache hit for feature ' + featureId);
    return parseInt(cachedRow);
  }

  // Cache miss - read ID column and find row
  Logger.log('Row cache miss for feature ' + featureId);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return -1; // Empty sheet
  }

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === featureId) {
      const rowIndex = i + 2; // +2 for header row and 0-indexed array

      // Cache for 1 hour (row numbers rarely change)
      cache.put(cacheKey, rowIndex.toString(), 3600);

      return rowIndex;
    }
  }

  return -1; // Not found
}

/**
 * Update cached feature list with new vote count
 * Instead of invalidating cache, update it directly
 * OPTIMIZATION: Avoids regenerating entire feature list on every vote
 */
function updateCachedFeatureList(cache, featureId, newVotes) {
  const cachedFeatureList = cache.get('feature_list');
  if (!cachedFeatureList) {
    return false; // No cache to update
  }

  try {
    const parsed = JSON.parse(cachedFeatureList);
    const featuresList = parsed.data;

    // Find and update the vote count in cached data
    for (let i = 0; i < featuresList.length; i++) {
      if (featuresList[i].id === featureId) {
        featuresList[i].votes = newVotes;
        break;
      }
    }

    // Re-sort by votes (descending)
    featuresList.sort(function(a, b) {
      return b.votes - a.votes;
    });

    // Update cache with new sorted list
    parsed.data = featuresList;
    cache.put('feature_list', JSON.stringify(parsed), 300);

    Logger.log('Updated cached feature list with new vote count for feature ' + featureId);
    return true;
  } catch (error) {
    Logger.log('Failed to update cache, will invalidate: ' + error);
    return false;
  }
}

function getUserHash(e) {
  const userAgent = e.parameter.userAgent || 'unknown';
  const ipAddress = e.parameter.ipAddress || 'unknown';

  // Use faster FNV-1a hash instead of MD5 for better performance
  const input = userAgent + ipAddress;
  let hash = 2166136261; // FNV offset basis

  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return (hash >>> 0).toString(36); // Convert to base36 string
}

function createResponse(success, message, data) {
  const response = {
    success: success,
    message: message
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function writeToBackup(action, featureData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Route to appropriate backup sheet based on action type
    let backupSheetName;
    let headers;
    let rowData;

    if (action === 'SUBMIT') {
      backupSheetName = BACKUP_SUBMISSIONS_SHEET;
      headers = ['Timestamp', 'Feature ID', 'Title', 'Description', 'Status', 'Email'];
      rowData = [
        new Date(),
        featureData.id || '',
        featureData.title || '',
        featureData.description || '',
        featureData.status || '',
        featureData.email || ''
      ];
    } else if (action === 'VOTE' || action === 'UNVOTE') {
      backupSheetName = BACKUP_VOTES_SHEET;
      headers = ['Timestamp', 'Action', 'Feature ID', 'Feature Title', 'New Vote Count', 'Status'];
      rowData = [
        new Date(),
        action,
        featureData.id || '',
        featureData.title || '',
        featureData.votes || 0,
        featureData.status || ''
      ];
    } else if (action === 'DELETE') {
      backupSheetName = BACKUP_DELETES_SHEET;
      headers = ['Timestamp', 'Feature ID', 'Title', 'Description', 'Final Votes', 'Status', 'Original Submission', 'Email'];
      rowData = [
        new Date(),
        featureData.id || '',
        featureData.title || '',
        featureData.description || '',
        featureData.votes || 0,
        featureData.status || '',
        featureData.submitted || '',
        featureData.email || ''
      ];
    } else {
      Logger.log('Unknown backup action: ' + action);
      return;
    }

    let backupSheet = ss.getSheetByName(backupSheetName);

    // Create backup sheet if it doesn't exist
    if (!backupSheet) {
      backupSheet = ss.insertSheet(backupSheetName);

      // Set up headers
      backupSheet.getRange(1, 1, 1, headers.length).setValues([headers]);

      // Format headers
      backupSheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#4A90E2')
        .setFontColor('#FFFFFF');

      // Freeze header row
      backupSheet.setFrozenRows(1);

      // Set column widths based on sheet type
      if (action === 'SUBMIT') {
        backupSheet.setColumnWidth(1, 150);  // Timestamp
        backupSheet.setColumnWidth(2, 50);   // ID
        backupSheet.setColumnWidth(3, 200);  // Title
        backupSheet.setColumnWidth(4, 350);  // Description
        backupSheet.setColumnWidth(5, 100);  // Status
        backupSheet.setColumnWidth(6, 200);  // Email
      } else if (action === 'VOTE' || action === 'UNVOTE') {
        backupSheet.setColumnWidth(1, 150);  // Timestamp
        backupSheet.setColumnWidth(2, 80);   // Action
        backupSheet.setColumnWidth(3, 50);   // Feature ID
        backupSheet.setColumnWidth(4, 200);  // Feature Title
        backupSheet.setColumnWidth(5, 80);   // Vote Count
        backupSheet.setColumnWidth(6, 100);  // Status
      } else if (action === 'DELETE') {
        backupSheet.setColumnWidth(1, 150);  // Timestamp
        backupSheet.setColumnWidth(2, 50);   // ID
        backupSheet.setColumnWidth(3, 200);  // Title
        backupSheet.setColumnWidth(4, 350);  // Description
        backupSheet.setColumnWidth(5, 80);   // Votes
        backupSheet.setColumnWidth(6, 100);  // Status
        backupSheet.setColumnWidth(7, 150);  // Submission
        backupSheet.setColumnWidth(8, 200);  // Email
      }

      Logger.log('Backup sheet created: ' + backupSheetName);
    }

    // Append backup entry (append-only for complete historical record)
    backupSheet.appendRow(rowData);

    Logger.log('Backup entry written: ' + action + ' for feature ' + featureData.id);
  } catch (error) {
    // Log error but don't fail the main operation if backup fails
    Logger.log('Backup write error (non-critical): ' + error);
  }
}

function createSnapshot() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const featuresSheet = ss.getSheetByName(SHEET_NAME);
    let snapshotSheet = ss.getSheetByName(BACKUP_SNAPSHOT_SHEET);

    // Create snapshot sheet if it doesn't exist
    if (!snapshotSheet) {
      snapshotSheet = ss.insertSheet(BACKUP_SNAPSHOT_SHEET);
      Logger.log('Snapshot sheet created');
    }

    // Get all data from Features sheet
    const data = featuresSheet.getDataRange().getValues();

    if (data.length === 0) {
      Logger.log('No data to snapshot');
      return;
    }

    // Clear existing snapshots (we only keep the most recent full snapshot)
    snapshotSheet.clear();

    // Add snapshot metadata row
    snapshotSheet.appendRow(['SNAPSHOT TIMESTAMP:', new Date()]);
    snapshotSheet.appendRow([]);  // Empty row for spacing

    // Copy all data including headers
    snapshotSheet.getRange(3, 1, data.length, data[0].length).setValues(data);

    // Format headers (row 3, since we have metadata in rows 1-2)
    snapshotSheet.getRange(3, 1, 1, data[0].length)
      .setFontWeight('bold')
      .setBackground('#4A90E2')
      .setFontColor('#FFFFFF');

    // Freeze header rows
    snapshotSheet.setFrozenRows(3);

    // Copy column widths
    for (let i = 1; i <= data[0].length; i++) {
      const width = featuresSheet.getColumnWidth(i);
      snapshotSheet.setColumnWidth(i, width);
    }

    Logger.log('Snapshot created with ' + (data.length - 1) + ' features');
  } catch (error) {
    Logger.log('Snapshot creation error (non-critical): ' + error);
  }
}

// Trigger to create daily snapshots
// Run this manually or set up a time-driven trigger in Apps Script dashboard
function createDailySnapshot() {
  createSnapshot();
}
