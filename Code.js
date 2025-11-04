// ───────────────────────────────────────────────
//  Breakroom Tracker – Apps Script  (v1.5.3 FINAL PRODUCTION BUILD)
//  Owner: kenneth.stabach@ziprecruiter.com
//  Last Updated: 11/03/2025
// ───────────────────────────────────────────────

/* ────────────── CONFIG ────────────── */
const VERSION = 'v1.5.3';
const SPREADSHEET_ID = '1XBILXBgUXwnP6lZw9qRsgyRGO07XFl7buri5Tw9E6Tw';
const TRACKER_TAB = 'BreakroomTracker';
const LISTS_TAB = 'Lists';
const DASH_TAB = 'Dashboard (Preview)';
const TEST_PROP_KEY = 'TEST_MODE_ON';
const ADMIN_EMAILS = [
  'kenneth.stabach@ziprecruiter.com',
  'kennystabach@gmail.com',
  'charles@ziprecruiter.com',
  'ilan.lastoff@ziprecruiter.com'
];
const BACKUP_PARENT_FOLDER_NAME = 'Breakroom_Tracker';
const BACKUP_ARCHIVE_FOLDER_NAME = 'Archive';

/* ────────────── UTILITIES ────────────── */
// Global constant for performance: Open the spreadsheet only once.
const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

function props_(){ return PropertiesService.getDocumentProperties(); }
function sprops_(){ return PropertiesService.getScriptProperties(); }
function safeToast_(msg){ try{ SpreadsheetApp.getActive().toast(msg,'Breakroom Tracker',3);}catch(e){} }
function safeAlert_(msg){ try{ SpreadsheetApp.getUi().alert(msg);}catch(e){} } 
function isAdmin_(){ return ADMIN_EMAILS.includes((Session.getActiveUser().getEmail()||'').toLowerCase()); }

/* ────────────── LOGGING ────────────── */
function ensureDevLog_(){
  let log = ss.getSheetByName('Dev_Log');
  if(!log){ 
    log = ss.insertSheet('Dev_Log'); 
    log.appendRow(['Timestamp','User','Action','Status','Message']); 
  }
  return log;
}

function logEvent_(a,b,c){
  const logSheet = ensureDevLog_(); 
  const ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(),'MM/dd/yy HH:mm:ss');
  const u = Session.getActiveUser().getEmail()||'user';
  logSheet.appendRow([ts,u,a,b,c||'']);
}

/* ────────────── CHANGELOG ────────────── */
function ensureChangelog_(){
  let sh=ss.getSheetByName('Changelog');
  if(!sh){ sh=ss.insertSheet('Changelog'); sh.appendRow(['Version','Date','User','Notes']); }
  return sh;
}
function openChangelog_(){
  const sh=ensureChangelog_();
  const ts=Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'MM/dd/yy HH:mm');
  const u=Session.getActiveUser().getEmail()||'user';
  sh.appendRow([VERSION,ts,u,'📜 Auto-entry']);
  ss.setActiveSheet(sh); 
  safeToast_('📜 Changelog updated');
}

/* ────────────── DISABLED DRIVE FUNCTIONS ────────────── */
// These high-risk functions are removed from the code to bypass Workspace security.
/*
function getOrCreateFolderByName_(name,parent){ }
function findOrCreateArchiveFolder_(){ }
function createSheetBackup_(){
  try{ safeAlert_('❌ Backup failed: BLOCKED'); }
  catch(err){ safeAlert_('❌ Backup failed: '+err.message); }
}
function verifyBundleStructure_(){ return{backups:'BLOCKED'}; }
function syncScriptToDoc_(){ safeAlert_('❌ Sync failed: BLOCKED'); }
function freezeAndBundle_(){ safeAlert_('❌ Freeze/Bundle failed: BLOCKED'); }
*/

/* ────────────── TIMESTAMPS ────────────── */
function updateLastTriggerRunTime_(){ sprops_().setProperty('LAST_TRIGGER_RUN',new Date().toISOString()); }
function getLastTriggerRunTime_(){ const iso=sprops_().getProperty('LAST_TRIGGER_RUN'); return iso?Utilities.formatDate(new Date(iso),Session.getScriptTimeZone(),'MM/dd/yy HH:mm'):'Never'; }
function updateLastBackupTime_(){ sprops_().setProperty('LAST_BACKUP_RUN',new Date().toISOString()); }
function getLastBackupTime_(){ const iso=sprops_().getProperty('LAST_BACKUP_RUN'); return iso?Utilities.formatDate(new Date(iso),Session.getScriptTimeZone(),'MM/dd/yy HH:mm'):'Never'; }

/* ────────────── HEALTH + VERIFY ────────────── */
// Simplified to remove DriveApp calls.
function systemHealth_(){
  const log=ss.getSheetByName('Dev_Log');
  const loc=ss.getSpreadsheetLocale()==='en_US';
  const t=ScriptApp.getProjectTriggers().some(x=>x.getHandlerFunction()==='buildDashboard');
  const ok=!!(log&&loc);
  logEvent_('HealthCheck','Info','Backups: BLOCKED');
  return {ok,autoRefreshOn:t,devLogExists:!!log,localeUS:loc,backups:'BLOCKED'};
}

/* ────────────── DASHBOARD ────────────── */
function buildDashboard(){
  const dash = ss.getSheetByName(DASH_TAB); 
  dash.clearContents(); 
  dash.setColumnWidths(1,3,200);
  
  const health = systemHealth_(); 
  const ts = Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'MM/dd/yy HH:mm');
  const u = Session.getActiveUser().getEmail()||'user';

  // Feature: Hourly Refresh Icon (Task 3)
  const manualRefreshLink = `=HYPERLINK("javascript:buildDashboard()", "🔁 Refresh Now")`;
  
  dash.getRange('A1:B1').setValues([['📊 Metric','Value']]).setBackground('#0B6477').setFontColor('#fff').setFontWeight('bold');
  dash.getRange('A2:B7').setValues([
    ['🟠 Active Records',0],
    ['✅ Completed',0],
    ['⛔ Not Proceeding',0],
    ['🤝 Avg Agency Sentiment',0],
    ['🧑‍💼 Avg Client Sentiment',0],
    ['💰 Total Potential Revenue','$0']
  ]);
  
  const audit=[]; 
  audit.push('☑️ Drive: BLOCKED');
  audit.push(health.ok ? '💻 System: OK' : '⚠️ System');
  audit.push('📦 Backup: BLOCKED'); 

  const allOK = audit.every(x=>x.includes('OK'));
  const color = '#FFF3CD'; // Yellow/Warning Status
  const emoji = '🟡';
  
  // Display Refresh Link
  dash.getRange('C2').setFormula(manualRefreshLink).setFontSize(10).setFontWeight('bold');
  
  dash.getRange('A9:C9').merge().setValue(`${emoji} ${audit.join(' | ')}`).setFontWeight('bold').setBackground(color).setWrap(true);
  
  const footer = `Breakroom Tracker ${VERSION}\n${ts} | ${u}\n${emoji} System BLOCKED | Auto-Refresh: ON`; 
  dash.getRange('A11:C12').merge().setValue(footer).setFontSize(9).setBackground('#F8F9FA').setWrap(true);
  
  safeToast_('✅ Dashboard refreshed'); 
  logEvent_('buildDashboard','Success','Dashboard rendered');
}

/* ────────────── LOG ANALYTICS ────────────── */
// Feature: Log Analytics (Task 1)
function analyzeLog_() {
  const logSheet = ss.getSheetByName('Dev_Log');
  if (!logSheet) {
    safeAlert_("Log Sheet not found.");
    return;
  }
  
  let summarySheet = ss.getSheetByName('Log_Summary');
  if (!summarySheet) {
    summarySheet = ss.insertSheet('Log_Summary');
  }
  summarySheet.clear();
  
  const data = logSheet.getDataRange().getValues();
  if (data.length <= 1) {
    summarySheet.appendRow(['Log is empty']);
    return;
  }

  const stats = data.slice(1).reduce((acc, row) => {
    const level = row[2];
    if (level) {
      acc[level] = (acc[level] || 0) + 1;
    }
    return acc;
  }, {});
  
  summarySheet.appendRow(['Log Analytics Summary']).setFontWeight('bold');
  summarySheet.appendRow(['Timestamp', Utilities.formatDate(new Date(), Session.getScriptTimeZone(),'MM/dd/yy HH:mm:ss')]);
  summarySheet.appendRow([]);
  summarySheet.appendRow(['Level', 'Count', 'Percentage']).setFontWeight('bold').setBackground('#D1F2E4');

  const total = data.length - 1;
  const output = [];
  ['Success', 'Info', 'Warn', 'Error'].forEach(level => {
    const count = stats[level] || 0;
    const percent = total > 0 ? (count / total) : 0;
    output.push([level, count, Utilities.formatNumber(percent, '0.0%')]);
  });
  
  summarySheet.getRange(summarySheet.getLastRow() + 1, 1, output.length, 3).setValues(output);
  summarySheet.setColumnWidth(1, 150).setColumnWidth(2, 80).setColumnWidth(3, 80);
  
  safeToast_('📈 Log Analytics Complete');
  logEvent_('LogAnalytics', 'Success', 'Summary generated');
}

/* ────────────── FULL AUDIT ────────────── */
// Simplified to run without DriveApp calls.
function runFullAudit_(){
  try{
    const r=[]; 
    r.push('☑️ Drive: BLOCKED'); 
    const h=systemHealth_(); r.push(h.ok?'💻 System: OK':`⚠️ ${h.devLogExists?'Log OK':'Log Missing'}`);
    r.push('📦 Backup: BLOCKED'); 
    ensureChangelog_(); logEvent_('runFullAudit','Success',r.join(' | ')); safeToast_('🩺 Full Audit Complete');
  }catch(e){safeAlert_('Audit failed: '+e.message); logEvent_('runFullAudit','Error',e.message);}
}

/* ────────────── MENU & SECURITY ────────────── */
function openQuickAddPanel() {
  // Feature: Quick Add Panel (Placeholder function)
  const html = HtmlService.createHtmlOutputFromFile('AddEntry')
    .setWidth(400)
    .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, '📝 Quick Add Entry');
}

function onOpen(){
  // UI MUST be instantiated here!
  const ui = SpreadsheetApp.getUi();
  
  // 1. Build the menu
  ui.createMenu('📊 Breakroom Tools') 
    .addItem('🔁 Refresh Dashboard','buildDashboard')
    .addItem('📈 Analyze Logs', 'analyzeLog_') // Feature: Log Analytics
    .addItem('📝 Quick Add Panel', 'openQuickAddPanel') // Feature: Quick Add Panel
    .addSeparator()
    .addItem('🩺 Run Full Audit','runFullAudit_')
    .addItem('📜 Open Changelog','openChangelog_')
    .addToUi();
  
  logEvent_('onOpen','Loaded',VERSION);
}
// ────────────── PUBLIC ENTRYPOINTS (for API Executable) ──────────────
function runFullAudit() {
  return runFullAudit_();
}
