// ───────────────────────────────────────────────
//  Breakroom Tracker – Apps Script  (v1.5.3 STABLE MENU BUILD)
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
// This function now returns the log sheet for efficiency.
function ensureDevLog_(){
  let log = ss.getSheetByName('Dev_Log');
  if(!log){ 
    log = ss.insertSheet('Dev_Log'); 
    log.appendRow(['Timestamp','User','Action','Status','Message']); 
  }
  return log;
}

// A single, fast log function.
function logEvent_(a,b,c){
  const logSheet = ensureDevLog_(); // Gets the sheet object directly
  const ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(),'MM/dd/yy HH:mm:ss');
  const u = Session.getActiveUser().getEmail()||'user';
  logSheet.appendRow([ts,u,a,b,c||'']);
}

/* ────────────── CHANGELOG ────────────── */
function ensureChangelog_(){
  let sh=ss.getSheetByName('Changelog'); // Uses global 'ss'
  if(!sh){ sh=ss.insertSheet('Changelog'); sh.appendRow(['Version','Date','User','Notes']); }
  return sh;
}
function openChangelog_(){
  const sh=ensureChangelog_();
  const ts=Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'MM/dd/yy HH:mm');
  const u=Session.getActiveUser().getEmail()||'user';
  sh.appendRow([VERSION,ts,u,'📜 Auto-entry']);
  ss.setActiveSheet(sh); // Uses global 'ss'
  safeToast_('📜 Changelog updated');
}

/* ────────────── BACKUP ────────────── */
function getOrCreateFolderByName_(name,parent){
  const it=parent?parent.getFoldersByName(name):DriveApp.getFoldersByName(name);
  return it.hasNext()?it.next():(parent?parent.createFolder(name):DriveApp.createFolder(name));
}
function findOrCreateArchiveFolder_(){
  const parent=getOrCreateFolderByName_(BACKUP_PARENT_FOLDER_NAME,null);
  return getOrCreateFolderByName_(BACKUP_ARCHIVE_FOLDER_NAME,parent);
}
function createSheetBackup_(){
  try{
    const f=DriveApp.getFileById(ss.getId()); // Uses global 'ss'
    const ts=Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'MM-dd-yyyy_HHmm');
    const name=`BreakroomTracker_${VERSION}_Backup_${ts}`;
    const copy=f.makeCopy(name); const folder=findOrCreateArchiveFolder_();
    folder.addFile(copy);
    try{
      const root=DriveApp.getRootFolder();
      if(root){
        const files=root.getFilesByName(name);
        while(files.hasNext()){ const file=files.next(); if(!file.getParents().hasNext()) root.removeFile(file); }
      }
    }catch(e){ Logger.log('Cleanup skipped: '+e.message); }
    sprops_().setProperty('LAST_BACKUP_RUN',new Date().toISOString());
    safeToast_('✅ Backup created'); logEvent_('Backup','Success',name);
  }catch(err){ safeAlert_('❌ Backup failed: '+err.message); logEvent_('Backup','Error',err.message); }
}

/* ────────────── TIMESTAMPS ────────────── */
function updateLastTriggerRunTime_(){ sprops_().setProperty('LAST_TRIGGER_RUN',new Date().toISOString()); }
function getLastTriggerRunTime_(){ const iso=sprops_().getProperty('LAST_TRIGGER_RUN'); return iso?Utilities.formatDate(new Date(iso),Session.getScriptTimeZone(),'MM/dd/yy HH:mm'):'Never'; }
function updateLastBackupTime_(){ sprops_().setProperty('LAST_BACKUP_RUN',new Date().toISOString()); }
function getLastBackupTime_(){ const iso=sprops_().getProperty('LAST_BACKUP_RUN'); return iso?Utilities.formatDate(new Date(iso),Session.getScriptTimeZone(),'MM/dd/yy HH:mm'):'Never'; }

/* ────────────── HEALTH + VERIFY ────────────── */
function systemHealth_(){
  const log=ss.getSheetByName('Dev_Log'); // Uses global 'ss'
  const loc=ss.getSpreadsheetLocale()==='en_US'; // Uses global 'ss'
  const t=ScriptApp.getProjectTriggers().some(x=>x.getHandlerFunction()==='buildDashboard');
  const ok=!!(log&&loc);
  const folder=findOrCreateArchiveFolder_(); const files=folder.getFiles(); let count=0; while(files.hasNext()){files.next();count++;}
  logEvent_('HealthCheck','Info',`Backups:${count}`);
  return {ok,autoRefreshOn:t,devLogExists:!!log,localeUS:loc,backups:count};
}
function verifyBundleStructure_(){
  const f=findOrCreateArchiveFolder_(); let c=0; const files=f.getFiles(); while(files.hasNext()){files.next();c++;}
  if(c<1) throw new Error('No backups found'); logEvent_('verifyBundleStructure_','Success',`${c} backups`);
  return{backups:c};
}

/* ────────────── DASHBOARD ────────────── */
function buildDashboard(){
  const dash = ss.getSheetByName(DASH_TAB); // Uses global 'ss'
  dash.clearContents(); 
  dash.setColumnWidths(1,3,200);
  
  const health = systemHealth_(); 
  const ts = Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'MM/dd/yy HH:mm');
  const u = Session.getActiveUser().getEmail()||'user';
  
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
  try{ verifyBundleStructure_(); audit.push('☑️ Drive: OK'); } catch(e){ audit.push('⚠️ Drive'); }
  audit.push(health.ok ? '💻 System: OK' : '⚠️ System');
  
  // Backup call is now decoupled for performance and only runs from the menu.
  const lastBackup = getLastBackupTime_();
  audit.push(`📦 Backup: ${lastBackup}`);

  const allOK = audit.every(x=>x.includes('OK'));
  const color = allOK ? '#D1F2E4' : audit.some(x=>x.includes('⚠️')) ? '#FFF3CD' : '#F8D7DA';
  const emoji = allOK ? '🟢' : audit.some(x=>x.includes('⚠️')) ? '🟡' : '🔴';
  
  dash.getRange('A9:C9').merge().setValue(`${emoji} ${audit.join(' | ')}`).setFontWeight('bold').setBackground(color).setWrap(true);
  
  const footer = `Breakroom Tracker ${VERSION}\n${ts} | ${u}\n${emoji} ${allOK?'System Healthy':'Review Needed'} | Auto-Refresh: ${health.autoRefreshOn?'ON':'OFF'}`;
  dash.getRange('A11:C12').merge().setValue(footer).setFontSize(9).setBackground('#F8F9FA').setWrap(true);
  
  safeToast_('✅ Dashboard refreshed'); 
  logEvent_('buildDashboard','Success','Dashboard rendered');
}

/* ────────────── FULL AUDIT ────────────── */
function runFullAudit_(){
  try{
    const r=[]; try{verifyBundleStructure_();r.push('☑️ Drive: OK');}catch(e){r.push('⚠️ Drive');}
    const h=systemHealth_(); r.push(h.ok?'💻 System: OK':`⚠️ ${h.devLogExists?'Log OK':'Log Missing'}`);
    try{createSheetBackup_();r.push('📦 Backup OK');}catch(e){r.push('⚠️ Backup');}
    ensureChangelog_(); logEvent_('runFullAudit','Success',r.join(' | ')); safeToast_('🩺 Full Audit Complete');
  }catch(e){safeAlert_('Audit failed: '+e.message); logEvent_('runFullAudit','Error',e.message);}
}

/* ────────────── SYNC DOC ────────────── */
function getCurrentScriptSource_(){
  try{
    const file=DriveApp.getFileById(ScriptApp.getScriptId());
    const blob=file.getBlob(); const txt=blob.getDataAsString();
    if(!txt||txt.length<100) throw new Error('Empty or partial script');
    return txt;
  }catch(e){Logger.log('getCurrentScriptSource_ error: '+e.message);return '⚠️ Script body capture failed.';}
}
function syncScriptToDoc_(){
  try{
    const code=getCurrentScriptSource_();
    if(!code||code.startsWith('⚠️')){logEvent_('syncScriptToDoc_','Warn','Source capture incomplete');safeAlert_('⚠️ Could not capture script text.');return;}
    const folder=findOrCreateArchiveFolder_(); const name='Breakroom_Script_Master'; const existing=folder.getFilesByName(name);
    let docFile;
    if(existing.hasNext()){docFile=existing.next();}
    else{
      const newDoc=DocumentApp.create(name);
      docFile=DriveApp.getFileById(newDoc.getId()); folder.addFile(docFile);
      try{DriveApp.getRootFolder().removeFile(docFile);}catch(e){}
      logEvent_('syncScriptToDoc_','Created','Master doc created');
    }
    const doc=DocumentApp.openById(docFile.getId());
    doc.getBody().setText(`Breakroom Tracker Script – ${VERSION} (${new Date()})\n──────────────────────────────\n\n${code}`);
    doc.saveAndClose(); safeToast_('✅ Script synced to Drive');
  }catch(e){safeAlert_('❌ Sync failed: '+e.message); logEvent_('syncScriptToDoc_','Error',e.message);}
}

/* ────────────── FREEZE & BUNDLE ────────────── */
function freezeAndBundle_(){
  // NOTE: This high-risk function is kept in the codebase but removed from the menu.
  const start=new Date(); const v=VERSION; const ts=Utilities.formatDate(start,Session.getScriptTimeZone(),'MM/dd/yy HH:mm');
  const user=Session.getActiveUser().getEmail()||'user'; const res=[];
  try{
    createSheetBackup_(); res.push('📦 Backup');
    ensureChangelog_(); 
    const sh=ss.getSheetByName('Changelog'); // Uses global 'ss'
    sh.appendRow([v,ts,user,'🔒 Freeze & Bundle']); res.push('📜 Changelog');
    const f=DriveApp.getFileById(ss.getId()); // Uses global 'ss'
    const name=`BreakroomTracker_${v}_Snapshot_${Utilities.formatDate(start,Session.getScriptTimeZone(),'MM-dd-yyyy_HHmm')}.zip`;
    const tmp=DriveApp.createFile('readme.txt',`Breakroom Tracker ${v}\nExported ${ts}\nBy ${user}`); const blob=Utilities.zip([f.getBlob(),tmp.getBlob()],name);
    const folder=findOrCreateArchiveFolder_(); folder.createFile(blob); res.push('🗜 ZIP');
    runFullAudit_(); res.push('🩺 Audit'); syncScriptToDoc_(); res.push('🧾 Script Sync');
    const sum=res.join(' | '); logEvent_('freezeAndBundle_','Success',sum); safeToast_(`✅ Freeze complete: ${sum}`);
  }catch(e){safeAlert_('❌ Freeze failed: '+e.message); logEvent_('freezeAndBundle_','Error',e.message);}
}

/* ────────────── VERSION VALIDATION ────────────── */
function validateScriptVersion_(){
  try{
    const folder=findOrCreateArchiveFolder_(); const docs=folder.getFilesByName('Breakroom_Script_Master');
    if(!docs.hasNext())return;
    const doc=DocumentApp.openById(docs.next().getId()); const text=doc.getBody().getText();
    if(!text.includes(VERSION))safeAlert_(`⚠️ Version mismatch.\nExpected: ${VERSION}`);
  }catch(e){Logger.log('validateScriptVersion_ error: '+e.message);}
}

/* ────────────── MENU & SECURITY ────────────── */
function onOpen(){
  // UI MUST be instantiated here!
  const ui = SpreadsheetApp.getUi();
  
  // 1. Build the menu
  ui.createMenu('📊 Breakroom Tools') 
    .addItem('🔁 Refresh Dashboard','buildDashboard')
    .addSeparator()
    .addItem('🩺 Run Full Audit','runFullAudit_')
    .addItem('📂 Create Backup Now','createSheetBackup_')
    .addItem('📜 Open Changelog','openChangelog_')
    .addSeparator()
    .addItem('🧾 Validate Script Version','validateScriptVersion_')
    .addToUi();
  
  // 3. Run final validation and logging
  validateScriptVersion_(); 
  logEvent_('onOpen','Loaded',VERSION);
}
// ────────────── PUBLIC ENTRYPOINTS (for API Executable) ──────────────
function runFullAudit() {
  return runFullAudit_();
}
