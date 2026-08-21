/**
 * MFFOCUS COMPANION — "STAY WITH ME"
 * Complete Production-Ready Architecture & Persistent State Machine Engine
 * 
 * Core Philosophy: "You don't have to study alone."
 * - Local-First, Durable IndexedDB + Storage Layer
 * - Authoritative Timestamps & Seamless Page Reload Recovery
 * - Strict Zero-Break Focus Enforcement (Break offered ONLY after 100% target completion)
 * - Early Stop Intervention & 3D Companion Phone 5-Digit Confirmation Ritual
 * - Zero Tab Distraction Accusations (External lectures/PDFs treated as legitimate study)
 * - Single Source of Truth Timer Architecture
 */

(function(window, document) {
    'use strict';

    // -------------------------------------------------------------------------
    // 1. CONSTANTS & COMPANION STATE ENUM
    // -------------------------------------------------------------------------
    const CompanionStatus = {
        IDLE: 'IDLE',
        STUDYING: 'STUDYING',
        RESCUE: 'RESCUE',
        PAUSED: 'PAUSED',
        COMPLETED: 'COMPLETED',
        ENDED_EARLY: 'ENDED_EARLY'
    };

    const DB_CONFIG = {
        NAME: 'MFFocusCompanionDB_v1',
        VERSION: 1,
        STORES: {
            SESSION: 'active_session',
            SETTINGS: 'settings',
            RECORDS: 'records',
            HISTORY: 'session_history'
        }
    };

    const LOCAL_KEYS = {
        SESSION_BACKUP: 'mffocus_comp_session_backup',
        SETTINGS: 'mffocus_comp_settings',
        RECORDS: 'mffocus_comp_records',
        CONSENT: 'mffocus_comp_consent'
    };

    // -------------------------------------------------------------------------
    // 2. DIALOGUE LIBRARY (WARM, HUMAN, CONTEXT-AWARE & DETERMINISTIC)
    // -------------------------------------------------------------------------
    const DIALOGUES = {
        sessionStart: {
            short: ["Let's knock this out.", "Quick sprint. Stay sharp.", "Right beside you. Let's go."],
            medium: ["Good commitment. You don't have to think about the whole time—just stay with me.", "Solid plan. Let's get properly locked in.", "Alright. Let's work."],
            long: ["Big session today. We'll take it one milestone at a time.", "Serious focus mode. Just stay with me.", "Pacing is everything. Let's get the first 20 minutes done."]
        },
        milestones: {
            m20: ["20 minutes in. Solid rhythm.", "First 20m in the bag."],
            m30: ["30 already. Nice.", "30 minutes down. Good momentum."],
            m40: ["40 minutes. You're properly locked in now.", "40 down. Great focus today."],
            halfway: ["Halfway there. Half the mountain climbed.", "Halfway through your commitment. Keep going."],
            m60: ["One hour. That's real focus.", "60 minutes down. Solid discipline."],
            m75: ["15 minutes left. You can feel the finish line.", "Entering the home stretch."],
            final5: ["Five more minutes. Finish strong.", "Final 5 minutes. Don't let up now."],
            completed: ["YES. That's the session.", "You actually finished what you committed to.", "That's how it's done. Commitment kept."]
        },
        returnFromExternal: [
            "There you are.",
            "Still locked in on {goal}?",
            "Welcome back.",
            "How's the material going?",
            "Back in the zone."
        ],
        returnFromLongBreak: [
            "Well, well, well… look who returned.",
            "That was a serious 'five-minute break.'",
            "I was starting to wonder if your break had become a vacation.",
            "The chair missed you.",
            "Okay, explorer. Back to the mission."
        ],
        recoveryOnReload: [
            "You're back. Your session is still running smoothly.",
            "Session recovered. We're still right on track."
        ]
    };

    // -------------------------------------------------------------------------
    // 3. DURABLE INDEXEDDB & STORAGE LAYER
    // -------------------------------------------------------------------------
    const Storage = {
        db: null,
        isDBReady: false,

        init() {
            return new Promise((resolve) => {
                if (!window.indexedDB) {
                    this.isDBReady = false;
                    resolve(false);
                    return;
                }
                try {
                    const req = window.indexedDB.open(DB_CONFIG.NAME, DB_CONFIG.VERSION);
                    req.onupgradeneeded = (e) => {
                        const db = e.target.result;
                        if (!db.objectStoreNames.contains(DB_CONFIG.STORES.SESSION)) {
                            db.createObjectStore(DB_CONFIG.STORES.SESSION, { keyPath: 'key' });
                        }
                        if (!db.objectStoreNames.contains(DB_CONFIG.STORES.SETTINGS)) {
                            db.createObjectStore(DB_CONFIG.STORES.SETTINGS, { keyPath: 'key' });
                        }
                        if (!db.objectStoreNames.contains(DB_CONFIG.STORES.RECORDS)) {
                            db.createObjectStore(DB_CONFIG.STORES.RECORDS, { keyPath: 'key' });
                        }
                        if (!db.objectStoreNames.contains(DB_CONFIG.STORES.HISTORY)) {
                            db.createObjectStore(DB_CONFIG.STORES.HISTORY, { keyPath: 'id', autoIncrement: true });
                        }
                    };
                    req.onsuccess = (e) => {
                        this.db = e.target.result;
                        this.isDBReady = true;
                        resolve(true);
                    };
                    req.onerror = () => {
                        this.isDBReady = false;
                        resolve(false);
                    };
                } catch(err) {
                    this.isDBReady = false;
                    resolve(false);
                }
            });
        },

        async set(storeName, key, value) {
            // Synchronous LocalStorage Mirror for instant startup hydration
            try {
                if (storeName === DB_CONFIG.STORES.SESSION) {
                    localStorage.setItem(LOCAL_KEYS.SESSION_BACKUP, JSON.stringify(value));
                } else if (storeName === DB_CONFIG.STORES.SETTINGS) {
                    localStorage.setItem(LOCAL_KEYS.SETTINGS, JSON.stringify(value));
                } else if (storeName === DB_CONFIG.STORES.RECORDS) {
                    localStorage.setItem(LOCAL_KEYS.RECORDS, JSON.stringify(value));
                }
            } catch(e) {}

            if (!this.isDBReady || !this.db) return;
            try {
                const tx = this.db.transaction([storeName], 'readwrite');
                const store = tx.objectStore(storeName);
                store.put({ key, value });
            } catch(e) {}
        },

        async get(storeName, key) {
            // First check memory/localStorage for instant availability
            let fallbackVal = null;
            try {
                if (storeName === DB_CONFIG.STORES.SESSION) {
                    const raw = localStorage.getItem(LOCAL_KEYS.SESSION_BACKUP);
                    if (raw) fallbackVal = JSON.parse(raw);
                } else if (storeName === DB_CONFIG.STORES.SETTINGS) {
                    const raw = localStorage.getItem(LOCAL_KEYS.SETTINGS);
                    if (raw) fallbackVal = JSON.parse(raw);
                } else if (storeName === DB_CONFIG.STORES.RECORDS) {
                    const raw = localStorage.getItem(LOCAL_KEYS.RECORDS);
                    if (raw) fallbackVal = JSON.parse(raw);
                }
            } catch(e) {}

            if (!this.isDBReady || !this.db) return fallbackVal;

            return new Promise((resolve) => {
                try {
                    const tx = this.db.transaction([storeName], 'readonly');
                    const store = tx.objectStore(storeName);
                    const req = store.get(key);
                    req.onsuccess = (e) => {
                        if (e.target.result && e.target.result.value !== undefined) {
                            resolve(e.target.result.value);
                        } else {
                            resolve(fallbackVal);
                        }
                    };
                    req.onerror = () => resolve(fallbackVal);
                } catch(err) {
                    resolve(fallbackVal);
                }
            });
        },

        async remove(storeName, key) {
            try {
                if (storeName === DB_CONFIG.STORES.SESSION) {
                    localStorage.removeItem(LOCAL_KEYS.SESSION_BACKUP);
                }
            } catch(e) {}

            if (!this.isDBReady || !this.db) return;
            try {
                const tx = this.db.transaction([storeName], 'readwrite');
                tx.objectStore(storeName).delete(key);
            } catch(e) {}
        },

        async clearAllCompanionData() {
            try {
                localStorage.removeItem(LOCAL_KEYS.SESSION_BACKUP);
                localStorage.removeItem(LOCAL_KEYS.SETTINGS);
                localStorage.removeItem(LOCAL_KEYS.RECORDS);
                localStorage.removeItem(LOCAL_KEYS.CONSENT);
            } catch(e) {}

            if (this.isDBReady && this.db) {
                try {
                    const tx = this.db.transaction([
                        DB_CONFIG.STORES.SESSION,
                        DB_CONFIG.STORES.SETTINGS,
                        DB_CONFIG.STORES.RECORDS,
                        DB_CONFIG.STORES.HISTORY
                    ], 'readwrite');
                    tx.objectStore(DB_CONFIG.STORES.SESSION).clear();
                    tx.objectStore(DB_CONFIG.STORES.SETTINGS).clear();
                    tx.objectStore(DB_CONFIG.STORES.RECORDS).clear();
                    tx.objectStore(DB_CONFIG.STORES.HISTORY).clear();
                } catch(e) {}
            }
        }
    };

    // -------------------------------------------------------------------------
    // 4. COMPANION CONTROLLER & STATE MACHINE
    // -------------------------------------------------------------------------
    const Companion = {
        // Authoritative Active Session Record
        session: null,

        // Settings (Personalization & Controls)
        settings: {
            visibilityMode: 'always', // 'always' | 'compact' | 'autohide'
            personality: 'warm', // 'warm' | 'calm' | 'playful' | 'firm'
            frequency: 'balanced', // 'balanced' | 'minimal' | 'low'
            humor: true,
            longReturnHumor: true,
            earlyStopGuidance: true
        },

        // Focus Milestones & Records
        records: {
            longestSessionSecs: 0,
            totalKept: 0,
            totalSessions: 0,
            totalMinutes: 0,
            rescueCompleted: 0
        },

        // Verification Phone Token
        verification: {
            code: '',
            expiresAt: 0
        },

        // Background Visibility Watcher
        visibility: {
            hiddenAt: 0,
            lastGreetingAt: 0
        },

        speechTimeout: null,
        tickIntervalId: null,

        // ---------------------------------------------------------------------
        // INITIALIZATION & SESSION RECOVERY
        // ---------------------------------------------------------------------
        async init() {
            await Storage.init();
            await this.loadPreferences();
            await this.loadRecords();
            this.setupCustomDropdowns();
            this.setupPersonalityCards();
            this.setupVisibilityWatcher();
            this.initDigitInputs();
            this.renderAvatarSVG();

            // Perform Authoritative Page-Reload Recovery Check
            await this.recoverActiveSession();

            console.log("MFFOCUS Study Companion Engine Ready (Local-First).");
        },

        async loadPreferences() {
            const saved = await Storage.get(DB_CONFIG.STORES.SETTINGS, 'current');
            if (saved) {
                this.settings = Object.assign(this.settings, saved);
            }
        },

        async savePreferences() {
            await Storage.set(DB_CONFIG.STORES.SETTINGS, 'current', this.settings);
        },

        async loadRecords() {
            const saved = await Storage.get(DB_CONFIG.STORES.RECORDS, 'current');
            if (saved) {
                this.records = Object.assign(this.records, saved);
            }
        },

        async saveRecords() {
            await Storage.set(DB_CONFIG.STORES.RECORDS, 'current', this.records);
        },

        // ---------------------------------------------------------------------
        // ACTIVE SESSION RECOVERY ON BROWSER RELOAD / F5
        // ---------------------------------------------------------------------
        async recoverActiveSession() {
            const savedSession = await Storage.get(DB_CONFIG.STORES.SESSION, 'active');
            if (!savedSession || !savedSession.id) return;

            const now = Date.now();
            const startedAt = savedSession.sessionStartedAt;
            const targetDuration = savedSession.targetDurationSecs;
            const targetEndAt = savedSession.targetEndAt;
            const pausedAt = savedSession.pausedAt;
            const totalPausedMs = savedSession.totalPausedMs || 0;

            if (savedSession.status === CompanionStatus.STUDYING) {
                if (now >= targetEndAt) {
                    // Target was completed while tab was reloading or closed!
                    this.session = savedSession;
                    this.session.status = CompanionStatus.COMPLETED;
                    this.session.accumulatedFocusedSecs = targetDuration;
                    await this.persistSession();
                    this.showWidget();
                    this.onSessionCompleted(true);
                } else {
                    // Session is actively running! Recover with exact timestamp precision
                    const realElapsedSecs = Math.floor((now - startedAt - totalPausedMs) / 1000);
                    const realRemainingSecs = Math.max(0, Math.floor((targetEndAt - now) / 1000));

                    this.session = savedSession;
                    this.session.accumulatedFocusedSecs = realElapsedSecs;
                    await this.persistSession();

                    // Reconnect seamlessly with MFFocus Core Timer
                    if (typeof timeLeft !== 'undefined') timeLeft = realRemainingSecs;
                    if (typeof initialTime !== 'undefined') initialTime = targetDuration;
                    if (typeof currentTask !== 'undefined') currentTask = savedSession.goal;
                    if (typeof setMode === 'function') setMode('countdown', false);
                    if (typeof startTimerAction === 'function') startTimerAction();

                    this.showWidget();
                    this.updateWidgetUI();

                    const doneMins = Math.floor(realElapsedSecs / 60);
                    const leftMins = Math.max(1, Math.floor(realRemainingSecs / 60));
                    const totalMins = Math.floor(targetDuration / 60);

                    this.speak(`You're back. Your ${totalMins}m session is running. ${doneMins}m down, ${leftMins}m to go.`, 5000);
                    if (typeof showToast === 'function') {
                        showToast(`Companion Session Restored (${leftMins}m remaining)`, "info");
                    }
                }
            } else if (savedSession.status === CompanionStatus.PAUSED) {
                // Session was paused before reload
                this.session = savedSession;
                this.showWidget();
                this.updateWidgetUI();
                const dot = document.getElementById('comp-status-dot');
                const label = document.getElementById('comp-status-label');
                if (dot) dot.className = 'comp-status-dot paused';
                if (label) label.textContent = 'PAUSED';
            } else if (savedSession.status === CompanionStatus.RESCUE) {
                if (now >= savedSession.rescueEndAt) {
                    this.session = savedSession;
                    this.completeRescueMode();
                } else {
                    this.session = savedSession;
                    this.showWidget();
                    this.updateWidgetUI();
                    const dot = document.getElementById('comp-status-dot');
                    const label = document.getElementById('comp-status-label');
                    if (dot) dot.className = 'comp-status-dot rescue';
                    if (label) label.textContent = 'RESCUE (5M)';
                }
            }
        },

        async persistSession() {
            if (this.session) {
                await Storage.set(DB_CONFIG.STORES.SESSION, 'active', this.session);
            } else {
                await Storage.remove(DB_CONFIG.STORES.SESSION, 'active');
            }
        },

        // ---------------------------------------------------------------------
        // ENTRY & STARTING A SESSION
        // ---------------------------------------------------------------------
        openEntry() {
            const hasConsent = localStorage.getItem(LOCAL_KEYS.CONSENT);
            if (!hasConsent) {
                this.openModal('companion-consent-modal');
            } else {
                this.openSetupModal();
            }
        },

        acceptConsent() {
            localStorage.setItem(LOCAL_KEYS.CONSENT, 'true');
            this.closeModal('companion-consent-modal');
            this.openSetupModal();
        },

        declineConsent() {
            this.closeModal('companion-consent-modal');
            if (typeof showToast === 'function') showToast("Companion mode is optional. Enable it anytime.", "info");
        },

        openSetupModal() {
            const goalInput = document.getElementById('comp-setup-goal-input');
            if (goalInput) {
                if (typeof currentTask !== 'undefined' && currentTask) {
                    goalInput.value = currentTask;
                } else if (typeof selectedSubject !== 'undefined' && selectedSubject) {
                    goalInput.value = selectedSubject + " Revision";
                } else {
                    goalInput.value = "Rotational Motion Lecture 3";
                }
            }
            this.updateSetupPreview();
            this.openModal('companion-setup-modal');
            setTimeout(() => { if (goalInput && typeof goalInput.focus === 'function') goalInput.focus(); }, 120);
        },

        selectDuration(mins, element) {
            document.querySelectorAll('.comp-duration-chip').forEach(c => c.classList.remove('active'));
            if (element) element.classList.add('active');
            const customGroup = document.getElementById('comp-custom-duration-group');
            if (mins === 'custom') {
                if (customGroup) customGroup.style.display = 'flex';
            } else {
                if (customGroup) customGroup.style.display = 'none';
                const customInput = document.getElementById('comp-custom-duration-val');
                if (customInput) customInput.value = mins;
            }
            this.updateSetupPreview();
        },

        setGoalSuggestion(text) {
            const goalInput = document.getElementById('comp-setup-goal-input');
            if (goalInput) {
                goalInput.value = text;
                this.updateSetupPreview();
            }
        },

        getSelectedDurationMins() {
            const activeChip = document.querySelector('.comp-duration-chip.active');
            if (!activeChip) return 25;
            const val = activeChip.getAttribute('data-val');
            if (val === 'custom') {
                const customInput = document.getElementById('comp-custom-duration-val');
                return parseInt(customInput && customInput.value ? customInput.value : 30, 10);
            }
            return parseInt(val, 10);
        },

        updateSetupPreview() {
            const mins = this.getSelectedDurationMins();
            const previewEl = document.getElementById('comp-setup-preview-text');
            if (!previewEl) return;
            
            if (mins <= 25) {
                previewEl.textContent = `"${mins} minutes. Quick, clean sprint. Let's get right into it."`;
            } else if (mins <= 60) {
                previewEl.textContent = `"${mins} minutes. You don't have to think about the whole ${mins}—just stay with me."`;
            } else {
                previewEl.textContent = `"${mins} minutes. Alright. We'll take it one milestone at a time. Just stay with me."`;
            }
        },

        async startSession() {
            const mins = this.getSelectedDurationMins();
            const goalInput = document.getElementById('comp-setup-goal-input');
            const goal = (goalInput && goalInput.value.trim()) ? goalInput.value.trim() : "Deep Study Session";
            
            this.closeModal('companion-setup-modal');

            const totalSecs = mins * 60;
            const now = Date.now();

            this.session = {
                id: 'comp_sess_' + now,
                status: CompanionStatus.STUDYING,
                goal: goal,
                subject: (typeof selectedSubject !== 'undefined') ? selectedSubject : 'Physics',
                targetDurationSecs: totalSecs,
                sessionStartedAt: now,
                targetEndAt: now + (totalSecs * 1000),
                pausedAt: null,
                totalPausedMs: 0,
                accumulatedFocusedSecs: 0,
                isRescueActive: false,
                rescueStartedAt: null,
                rescueEndAt: null,
                earlyStopAttempts: 0,
                milestonesHit: {},
                stayWithMe: false
            };

            await this.persistSession();

            // Sync with MFFocus core timer
            if (typeof currentTask !== 'undefined') currentTask = goal;
            if (typeof setMode === 'function') setMode('countdown', false);
            if (typeof timeLeft !== 'undefined') timeLeft = totalSecs;
            if (typeof initialTime !== 'undefined') initialTime = totalSecs;

            if (typeof startTimerAction === 'function') {
                startTimerAction();
            }

            this.showWidget();
            this.updateWidgetUI();

            const startGreetings = totalSecs <= 1500 ? DIALOGUES.sessionStart.short : (totalSecs <= 3600 ? DIALOGUES.sessionStart.medium : DIALOGUES.sessionStart.long);
            const msg = startGreetings[Math.floor(Math.random() * startGreetings.length)];
            this.speak(msg, 4500);

            if (typeof showToast === 'function') {
                showToast(`Companion Session Started (${mins}m • ${goal})`, "success");
            }
        },

        isSessionActive() {
            return !!(this.session && (this.session.status === CompanionStatus.STUDYING || this.session.status === CompanionStatus.RESCUE));
        },

        shouldInterceptPause() {
            // Intercept only if user has an active, uncompleted companion commitment
            return !!(this.session && (this.session.status === CompanionStatus.STUDYING || this.session.status === CompanionStatus.RESCUE));
        },

        // ---------------------------------------------------------------------
        // STUDY TICK & STRICT ZERO-BREAK FOCUS ENGINE
        // ---------------------------------------------------------------------
        onStudyTick(segSecs) {
            if (!this.session || this.session.status === CompanionStatus.PAUSED || this.session.status === CompanionStatus.COMPLETED) {
                return;
            }

            const now = Date.now();
            
            // Calculate authoritative time from timestamps
            const totalPaused = this.session.totalPausedMs || 0;
            const elapsedSecs = Math.floor((now - this.session.sessionStartedAt - totalPaused) / 1000);
            const remainingSecs = Math.max(0, Math.floor((this.session.targetEndAt - now) / 1000));
            
            this.session.accumulatedFocusedSecs = elapsedSecs;

            // Handle Rescue Mode countdown if active
            if (this.session.isRescueActive) {
                if (now >= this.session.rescueEndAt) {
                    this.completeRescueMode();
                    return;
                }
            }

            // Check Milestone Timing (Strictly concise, zero annoyance, SILENT MODE)
            this.evaluateMilestones(elapsedSecs, remainingSecs);

            // Check Genuine 100% Target Completion
            if (now >= this.session.targetEndAt || remainingSecs <= 0) {
                this.onSessionCompleted(false);
                return;
            }

            this.updateWidgetUI();
        },

        evaluateMilestones(elapsedSecs, remainingSecs) {
            if (this.session.stayWithMe && this.settings.frequency === 'minimal') return;
            if (this.settings.frequency === 'low' && elapsedSecs % 1800 !== 0) return;

            const elapsedMins = Math.floor(elapsedSecs / 60);
            const remainingMins = Math.floor(remainingSecs / 60);
            const totalMins = Math.floor(this.session.targetDurationSecs / 60);
            const pct = Math.floor((elapsedSecs / this.session.targetDurationSecs) * 100);

            if (elapsedMins === 20 && !this.session.milestonesHit.m20 && totalMins >= 30) {
                this.session.milestonesHit.m20 = true;
                this.triggerMilestoneDialogue(DIALOGUES.milestones.m20);
            } else if (elapsedMins === 30 && !this.session.milestonesHit.m30 && totalMins >= 45) {
                this.session.milestonesHit.m30 = true;
                this.triggerMilestoneDialogue(DIALOGUES.milestones.m30);
            } else if (elapsedMins === 40 && !this.session.milestonesHit.m40 && totalMins >= 60) {
                this.session.milestonesHit.m40 = true;
                this.triggerMilestoneDialogue(DIALOGUES.milestones.m40);
            } else if (pct >= 50 && !this.session.milestonesHit.halfway && totalMins >= 30) {
                this.session.milestonesHit.halfway = true;
                this.triggerMilestoneDialogue(DIALOGUES.milestones.halfway);
            } else if (elapsedMins === 60 && !this.session.milestonesHit.m60 && totalMins >= 75) {
                this.session.milestonesHit.m60 = true;
                this.triggerMilestoneDialogue(DIALOGUES.milestones.m60);
            } else if (remainingMins === 15 && !this.session.milestonesHit.m75 && totalMins >= 45) {
                this.session.milestonesHit.m75 = true;
                this.triggerMilestoneDialogue(DIALOGUES.milestones.m75);
            } else if (remainingMins === 5 && !this.session.milestonesHit.final5 && totalMins >= 15) {
                this.session.milestonesHit.final5 = true;
                this.triggerMilestoneDialogue(DIALOGUES.milestones.final5);
            }
        },

        triggerMilestoneDialogue(dialogueOptions) {
            const msg = dialogueOptions[Math.floor(Math.random() * dialogueOptions.length)];
            this.speak(msg, 3800);
            this.persistSession();
        },

        onTimerStateChange(isRunningState) {
            if (!this.session) return;
            const dot = document.getElementById('comp-status-dot');
            const label = document.getElementById('comp-status-label');
            if (dot && label) {
                if (isRunningState) {
                    dot.className = 'comp-status-dot';
                    label.textContent = this.session.stayWithMe ? 'STAY WITH ME' : 'STUDYING';
                } else {
                    dot.className = 'comp-status-dot paused';
                    label.textContent = 'PAUSED';
                }
            }
        },

        // ---------------------------------------------------------------------
        // SESSION COMPLETION (BREAKS ARE PERMITTED ONLY HERE!)
        // ---------------------------------------------------------------------
        async onSessionCompleted(fromReload = false) {
            if (!this.session) return;
            
            this.session.status = CompanionStatus.COMPLETED;
            this.session.accumulatedFocusedSecs = this.session.targetDurationSecs;
            await this.persistSession();

            // Record Milestones
            this.records.totalKept++;
            this.records.totalSessions++;
            this.records.totalMinutes += Math.floor(this.session.targetDurationSecs / 60);
            if (this.session.targetDurationSecs > this.records.longestSessionSecs) {
                this.records.longestSessionSecs = this.session.targetDurationSecs;
            }
            await this.saveRecords();

            if (typeof triggerConfetti === 'function') {
                triggerConfetti();
                setTimeout(triggerConfetti, 500);
            }

            const celebrationMsgs = DIALOGUES.milestones.completed;
            const msg = celebrationMsgs[Math.floor(Math.random() * celebrationMsgs.length)];
            this.speak(msg, 6000);

            this.openCompletionModal();
        },

        openCompletionModal() {
            const plannedMins = Math.floor(this.session.targetDurationSecs / 60);
            const goalText = this.session.goal || 'Focus Sprint';

            const summaryEl = document.getElementById('comp-complete-summary-text');
            if (summaryEl) {
                summaryEl.innerHTML = `You said you'd stay for <strong>${plannedMins} minutes</strong> on <strong>${goalText}</strong>. And you did. That's real discipline.`;
            }
            this.openModal('companion-completion-modal');
        },

        // Break Options (Permitted ONLY AFTER completion)
        takeBreakAfterCompletion() {
            this.closeModal('companion-completion-modal');
            this.session = null;
            this.persistSession();
            this.hideWidget();
            if (typeof pauseTimerAction === 'function') pauseTimerAction();
            if (typeof showToast === 'function') showToast("Take a well-earned break! See you soon.", "info");
        },

        continueStudyingAfterCompletion() {
            this.closeModal('companion-completion-modal');
            this.session = null;
            this.persistSession();
            this.openSetupModal();
        },

        finishSessionAfterCompletion() {
            this.closeModal('companion-completion-modal');
            this.session = null;
            this.persistSession();
            this.hideWidget();
            if (typeof pauseTimerAction === 'function') pauseTimerAction();
        },

        // ---------------------------------------------------------------------
        // EARLY PAUSE INTERVENTION FLOW
        // ---------------------------------------------------------------------
        requestPauseOrStop() {
            if (this.shouldInterceptPause()) {
                this.handleEarlyPauseAttempt('widget_button');
            } else {
                if (typeof pauseTimerAction === 'function') pauseTimerAction();
            }
        },

        handleEarlyPauseAttempt(triggerSource) {
            if (!this.session) return;
            this.session.earlyStopAttempts++;

            const plannedMins = Math.floor(this.session.targetDurationSecs / 60);
            const now = Date.now();
            const totalPaused = this.session.totalPausedMs || 0;
            const doneSecs = Math.floor((now - this.session.sessionStartedAt - totalPaused) / 1000);
            const doneMins = Math.floor(doneSecs / 60);
            const leftMins = Math.max(1, Math.floor((this.session.targetEndAt - now) / 60000));

            const statsEl = document.getElementById('comp-intervention-stats');
            if (statsEl) {
                statsEl.innerHTML = `You planned for <strong>${plannedMins} minutes</strong>. You've completed <strong>${doneMins}m</strong>, with <strong>${leftMins} minutes</strong> still left.`;
            }

            this.openModal('companion-intervention-modal');
        },

        // Option 1: Something Came Up (Clean, respectful pause)
        async selectSomethingCameUp() {
            this.closeModal('companion-intervention-modal');
            if (!this.session) return;

            this.session.status = CompanionStatus.PAUSED;
            this.session.pausedAt = Date.now();
            await this.persistSession();

            this.speak("Got it. Real life comes first. I'll keep your session safe.", 4500);
            
            if (typeof pauseTimerAction === 'function') {
                pauseTimerAction();
            }
        },

        // Option 2: I'm Struggling (5-Minute Rescue Mode, STILL STUDYING)
        async selectStruggling() {
            this.closeModal('companion-intervention-modal');
            if (!this.session) return;

            const now = Date.now();
            this.session.isRescueActive = true;
            this.session.rescueStartedAt = now;
            this.session.rescueEndAt = now + (300 * 1000); // 5 mins
            this.session.status = CompanionStatus.RESCUE;
            await this.persistSession();

            const dot = document.getElementById('comp-status-dot');
            const label = document.getElementById('comp-status-label');
            if (dot) dot.className = 'comp-status-dot rescue';
            if (label) label.textContent = 'RESCUE (5M)';

            this.speak("That's okay. Don't think about the rest. Give me just 5 more minutes.", 4500);
            if (typeof showToast === 'function') showToast("5-Minute Rescue Sprint active. Stay with me.", "info");
        },

        async completeRescueMode() {
            if (!this.session) return;
            this.session.isRescueActive = false;
            this.records.rescueCompleted++;
            await this.saveRecords();
            await this.persistSession();

            if (typeof triggerConfetti === 'function') triggerConfetti();
            this.speak("See? You made it through another five. Pushed right through the friction.", 5000);

            // Open Rescue complete choice: CONTINUE or I STILL WANT TO STOP
            this.openModal('companion-rescue-modal');
        },

        resumeAfterRescue() {
            this.closeModal('companion-rescue-modal');
            if (!this.session) return;
            this.session.status = CompanionStatus.STUDYING;
            this.persistSession();

            const dot = document.getElementById('comp-status-dot');
            const label = document.getElementById('comp-status-label');
            if (dot) dot.className = 'comp-status-dot';
            if (label) label.textContent = 'STUDYING';

            this.speak("Awesome. Let's keep cruising.", 3200);
        },

        // Option 3: I Still Want to Stop (The 3D Companion Phone 5-Digit Ritual)
        selectWantToStop() {
            this.closeModal('companion-intervention-modal');
            this.closeModal('companion-rescue-modal');
            this.openStopConfirmation();
        },

        openStopConfirmation() {
            if (!this.session) return;

            // Generate unpredictable client-side 5-digit verification code
            const code = Math.floor(10000 + Math.random() * 90000).toString();
            this.verification.code = code;
            this.verification.expiresAt = Date.now() + 90000; // 90 seconds expiry

            const codeEl = document.getElementById('comp-phone-code-val');
            if (codeEl) codeEl.textContent = code.split('').join(' ');

            const plannedMins = Math.floor(this.session.targetDurationSecs / 60);
            const now = Date.now();
            const leftMins = Math.max(1, Math.floor((this.session.targetEndAt - now) / 60000));

            const phoneStatsEl = document.getElementById('comp-phone-stats-text');
            if (phoneStatsEl) {
                phoneStatsEl.textContent = `${leftMins} minutes remain of your ${plannedMins}m goal`;
            }

            for (let i = 1; i <= 5; i++) {
                const box = document.getElementById(`comp-digit-${i}`);
                if (box) box.value = '';
            }
            const errEl = document.getElementById('comp-digit-error');
            if (errEl) errEl.textContent = '';

            this.openModal('companion-phone-modal');
            setTimeout(() => {
                const b1 = document.getElementById('comp-digit-1');
                if (b1 && typeof b1.focus === 'function') b1.focus();
            }, 150);
        },

        initDigitInputs() {
            for (let i = 1; i <= 5; i++) {
                const box = document.getElementById(`comp-digit-${i}`);
                if (!box) continue;

                box.addEventListener('input', (e) => {
                    const val = e.target.value;
                    if (val.length >= 1) {
                        e.target.value = val.slice(-1);
                        if (i < 5) {
                            const next = document.getElementById(`comp-digit-${i+1}`);
                            if (next && typeof next.focus === 'function') next.focus();
                        } else {
                            this.verifyEnteredCode();
                        }
                    }
                });

                box.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace' && !e.target.value && i > 1) {
                        const prev = document.getElementById(`comp-digit-${i-1}`);
                        if (prev) {
                            if (typeof prev.focus === 'function') prev.focus();
                            prev.value = '';
                        }
                    } else if (e.key === 'Enter') {
                        this.verifyEnteredCode();
                    }
                });

                box.addEventListener('paste', (e) => {
                    e.preventDefault();
                    const text = (e.clipboardData || window.clipboardData).getData('text').trim().slice(0, 5);
                    if (/^\d{5}$/.test(text)) {
                        for (let j = 0; j < 5; j++) {
                            const b = document.getElementById(`comp-digit-${j+1}`);
                            if (b) b.value = text[j];
                        }
                        this.verifyEnteredCode();
                    }
                });
            }
        },

        async verifyEnteredCode() {
            let entered = '';
            for (let i = 1; i <= 5; i++) {
                const b = document.getElementById(`comp-digit-${i}`);
                entered += (b && b.value) ? b.value : '';
            }

            if (entered.length < 5) return;

            const inputsContainer = document.getElementById('comp-digit-inputs-wrap');
            const errEl = document.getElementById('comp-digit-error');

            if (Date.now() > this.verification.expiresAt) {
                if (errEl) errEl.textContent = "Code expired. Generating a new one...";
                setTimeout(() => this.openStopConfirmation(), 1000);
                return;
            }

            if (entered === this.verification.code) {
                // Correct Code Verified!
                this.closeModal('companion-phone-modal');
                
                if (this.session) {
                    this.session.status = CompanionStatus.ENDED_EARLY;
                    const totalPaused = this.session.totalPausedMs || 0;
                    const doneSecs = Math.floor((Date.now() - this.session.sessionStartedAt - totalPaused) / 1000);
                    this.session.accumulatedFocusedSecs = doneSecs;

                    this.records.totalSessions++;
                    this.records.totalMinutes += Math.floor(doneSecs / 60);
                    await this.saveRecords();

                    this.session = null;
                    await this.persistSession();

                    this.hideWidget();

                    this.speak("Alright. Your choice. No guilt. I'll be here when you're ready.", 5000);
                    if (typeof showToast === 'function') {
                        showToast(`Session ended (${Math.floor(doneSecs/60)}m focused). Tomorrow we try again.`, "info");
                    }

                    if (typeof pauseTimerAction === 'function') {
                        pauseTimerAction();
                    }
                }
            } else {
                // Incorrect Code
                if (inputsContainer) {
                    inputsContainer.classList.add('error');
                    setTimeout(() => inputsContainer.classList.remove('error'), 500);
                }
                if (errEl) errEl.textContent = "Hmm… that's not it. Try again.";
                for (let i = 1; i <= 5; i++) {
                    const b = document.getElementById(`comp-digit-${i}`);
                    if (b) b.value = '';
                }
                const b1 = document.getElementById('comp-digit-1');
                if (b1 && typeof b1.focus === 'function') b1.focus();
            }
        },

        // ---------------------------------------------------------------------
        // BACKGROUND STUDY & TAB SWITCHING (ZERO DISTRACTION ACCUSATIONS)
        // ---------------------------------------------------------------------
        setupVisibilityWatcher() {
            document.addEventListener('visibilitychange', () => {
                const isHidden = document.visibilityState === 'hidden';
                if (isHidden) {
                    this.visibility.hiddenAt = Date.now();
                } else {
                    this.handleReturnFromBackground();
                }
            });
        },

        handleReturnFromBackground() {
            if (!this.visibility.hiddenAt) return;
            const awaySecs = Math.floor((Date.now() - this.visibility.hiddenAt) / 1000);
            this.visibility.hiddenAt = 0;

            if (this.session && this.session.status === CompanionStatus.STUDYING) {
                // Short tab switch (< 15s) -> Completely silent!
                if (awaySecs < 15) return;

                // Cooldown for return greetings: at least 3 minutes
                const now = Date.now();
                if (now - this.visibility.lastGreetingAt < 180000) return;
                this.visibility.lastGreetingAt = now;

                // Neutral, supportive continuity (Never accused of distraction!)
                const template = DIALOGUES.returnFromExternal[Math.floor(Math.random() * DIALOGUES.returnFromExternal.length)];
                const msg = template.replace('{goal}', this.session.goal || 'your material');
                this.speak(msg, 3500);
            }
        },

        // ---------------------------------------------------------------------
        // STAY WITH ME MODE
        // ---------------------------------------------------------------------
        toggleStayWithMe() {
            if (!this.session) return;
            this.session.stayWithMe = !this.session.stayWithMe;
            this.persistSession();

            const btn = document.getElementById('comp-stay-mode-btn');
            if (btn) {
                if (this.session.stayWithMe) {
                    btn.classList.add('active');
                    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -0.15em; margin-right: 6px;"><path d="M11 17l-5-5a3 3 0 0 1 4.24-4.24L12 9.5l1.76-1.74a3 3 0 0 1 4.24 4.24L13 17"></path><path d="M14 14l3.5 3.5a2.5 2.5 0 0 1-3.5 3.5L8.5 15.5"></path><path d="M2 13l3.5-3.5"></path><path d="M22 13l-3.5-3.5"></path></svg>Stay With Me: ON';
                    this.speak("Okay. You don't need to talk. I'll stay right here. Let's study.", 4000);
                } else {
                    btn.classList.remove('active');
                    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -0.15em; margin-right: 6px;"><path d="M11 17l-5-5a3 3 0 0 1 4.24-4.24L12 9.5l1.76-1.74a3 3 0 0 1 4.24 4.24L13 17"></path><path d="M14 14l3.5 3.5a2.5 2.5 0 0 1-3.5 3.5L8.5 15.5"></path><path d="M2 13l3.5-3.5"></path><path d="M22 13l-3.5-3.5"></path></svg>Stay With Me';
                }
            }
        },

        // ---------------------------------------------------------------------
        // UI & FLOATING WIDGET UPDATES
        // ---------------------------------------------------------------------
        showWidget() {
            const widget = document.getElementById('mffocus-companion-widget');
            const pill = document.getElementById('mffocus-companion-pill');
            if (widget) {
                widget.style.display = 'flex';
                widget.classList.add('active');
                widget.classList.remove('minimized');
            }
            if (pill) {
                pill.style.display = 'none';
                pill.classList.remove('active');
            }
            this.updateWidgetUI();
        },

        hideWidget() {
            const widget = document.getElementById('mffocus-companion-widget');
            const pill = document.getElementById('mffocus-companion-pill');
            if (widget) widget.style.display = 'none';
            if (pill) pill.style.display = 'none';
        },

        minimizeWidget() {
            const widget = document.getElementById('mffocus-companion-widget');
            const pill = document.getElementById('mffocus-companion-pill');
            if (widget) {
                widget.style.display = 'none';
                widget.classList.add('minimized');
            }
            if (pill) {
                pill.style.display = 'flex';
                pill.classList.add('active');
            }
        },

        expandWidget() {
            const widget = document.getElementById('mffocus-companion-widget');
            const pill = document.getElementById('mffocus-companion-pill');
            if (pill) {
                pill.style.display = 'none';
                pill.classList.remove('active');
            }
            if (widget) {
                widget.style.display = 'flex';
                widget.classList.remove('minimized');
            }
        },

        updateWidgetUI() {
            if (!this.session) return;

            const goalEl = document.getElementById('comp-widget-goal');
            const timeEl = document.getElementById('comp-widget-time-left');
            const pctEl = document.getElementById('comp-widget-pct');
            const circleBar = document.getElementById('comp-circle-bar');

            if (goalEl) goalEl.textContent = this.session.goal || 'Focus Session';

            const now = Date.now();
            const total = this.session.targetDurationSecs || 1;
            const remainingSecs = Math.max(0, Math.floor((this.session.targetEndAt - now) / 1000));
            const elapsedSecs = Math.min(total, Math.floor((now - this.session.sessionStartedAt - (this.session.totalPausedMs || 0)) / 1000));

            const h = Math.floor(remainingSecs / 3600);
            const m = Math.floor((remainingSecs % 3600) / 60);
            const s = remainingSecs % 60;
            const timeStr = h > 0 ? `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s} left` : `${m}:${s < 10 ? '0' : ''}${s} left`;

            if (timeEl) timeEl.textContent = timeStr;

            const pct = Math.min(100, Math.floor((elapsedSecs / total) * 100));
            if (pctEl) pctEl.textContent = `${pct}%`;
            if (circleBar) {
                const circumference = 125.6;
                const offset = circumference - (pct / 100) * circumference;
                circleBar.style.strokeDashoffset = offset;
            }
        },

        speak(message, durationMs = 4000) {
            const bubble = document.getElementById('comp-speech-bubble');
            const textEl = document.getElementById('comp-speech-text');
            if (!bubble || !textEl) return;

            if (this.speechTimeout) clearTimeout(this.speechTimeout);

            textEl.textContent = message;
            bubble.style.opacity = '1';
            bubble.style.transform = 'scale(1)';

            this.speechTimeout = setTimeout(() => {
                bubble.style.opacity = '0';
                bubble.style.transform = 'scale(0.95)';
            }, durationMs);
        },

        // ---------------------------------------------------------------------
        // CUSTOM GLASSMORPHIC SETTINGS & DROPDOWNS SETUP
        // ---------------------------------------------------------------------
        setupCustomDropdowns() {
            document.querySelectorAll('.comp-custom-select').forEach(sel => {
                const trigger = sel.querySelector('.comp-select-trigger');
                const optionsList = sel.querySelector('.comp-select-options');
                const fieldName = sel.getAttribute('data-field');

                if (trigger && optionsList) {
                    trigger.addEventListener('click', (e) => {
                        e.stopPropagation();
                        // Close all other dropdowns
                        document.querySelectorAll('.comp-select-options').forEach(o => {
                            if (o !== optionsList) o.classList.remove('open');
                        });
                        optionsList.classList.toggle('open');
                    });

                    optionsList.querySelectorAll('.comp-select-option').forEach(opt => {
                        opt.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const val = opt.getAttribute('data-val');
                            const label = opt.querySelector('.comp-opt-label') ? opt.querySelector('.comp-opt-label').textContent : opt.textContent;

                            const triggerVal = trigger.querySelector('.comp-select-val');
                            if (triggerVal) triggerVal.textContent = label;

                            optionsList.querySelectorAll('.comp-select-option').forEach(o => o.classList.remove('selected'));
                            opt.classList.add('selected');
                            optionsList.classList.remove('open');

                            if (fieldName && this.settings[fieldName] !== undefined) {
                                this.settings[fieldName] = val;
                            }
                        });
                    });
                }
            });

            // Close on click outside
            document.addEventListener('click', () => {
                document.querySelectorAll('.comp-select-options').forEach(o => o.classList.remove('open'));
            });
        },

        setupPersonalityCards() {
            document.querySelectorAll('.comp-personality-card').forEach(card => {
                card.addEventListener('click', () => {
                    document.querySelectorAll('.comp-personality-card').forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    const personality = card.getAttribute('data-val');
                    this.settings.personality = personality;
                });
            });
        },

        openSettingsModal() {
            // Hydrate UI with current settings
            document.querySelectorAll('.comp-personality-card').forEach(card => {
                if (card.getAttribute('data-val') === this.settings.personality) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });

            const hTog = document.getElementById('comp-set-humor');
            const lTog = document.getElementById('comp-set-long-return');
            const gTog = document.getElementById('comp-set-guidance');

            if (hTog) hTog.checked = this.settings.humor;
            if (lTog) lTog.checked = this.settings.longReturnHumor;
            if (gTog) gTog.checked = this.settings.earlyStopGuidance;

            this.openModal('companion-settings-modal');
        },

        async saveSettingsFromUI() {
            const hTog = document.getElementById('comp-set-humor');
            const lTog = document.getElementById('comp-set-long-return');
            const gTog = document.getElementById('comp-set-guidance');

            if (hTog) this.settings.humor = hTog.checked;
            if (lTog) this.settings.longReturnHumor = lTog.checked;
            if (gTog) this.settings.earlyStopGuidance = gTog.checked;

            await this.savePreferences();
            this.closeModal('companion-settings-modal');
            if (typeof showToast === 'function') showToast("Companion preferences saved.", "success");
        },

        async clearCompanionData() {
            if (confirm("Clear all Companion history and preferences stored on this device?")) {
                await Storage.clearAllCompanionData();
                this.session = null;
                this.records = {
                    longestSessionSecs: 0,
                    totalKept: 0,
                    totalSessions: 0,
                    totalMinutes: 0,
                    rescueCompleted: 0
                };
                this.settings = {
                    visibilityMode: 'always',
                    personality: 'warm',
                    frequency: 'balanced',
                    humor: true,
                    longReturnHumor: true,
                    earlyStopGuidance: true
                };
                this.hideWidget();
                this.closeModal('companion-settings-modal');
                if (typeof showToast === 'function') showToast("Companion data cleared.", "info");
            }
        },

        openRecordsModal() {
            const longestEl = document.getElementById('comp-rec-longest');
            const keptEl = document.getElementById('comp-rec-kept');
            const rescueEl = document.getElementById('comp-rec-rescue');
            const totalHoursEl = document.getElementById('comp-rec-total-hours');
            const rateEl = document.getElementById('comp-rec-rate');

            const hLong = Math.floor(this.records.longestSessionSecs / 3600);
            const mLong = Math.floor((this.records.longestSessionSecs % 3600) / 60);

            if (longestEl) longestEl.textContent = `${hLong}h ${mLong}m`;
            if (keptEl) keptEl.textContent = this.records.totalKept.toString();
            if (rescueEl) rescueEl.textContent = this.records.rescueCompleted.toString();
            if (totalHoursEl) totalHoursEl.textContent = (this.records.totalMinutes / 60).toFixed(1) + 'h';

            const rate = this.records.totalSessions > 0 ? Math.round((this.records.totalKept / this.records.totalSessions) * 100) : 100;
            if (rateEl) rateEl.textContent = `${rate}%`;

            this.openModal('companion-records-modal');
        },

        // ---------------------------------------------------------------------
        // MODALS HELPER
        // ---------------------------------------------------------------------
        openModal(id) {
            const el = document.getElementById(id);
            if (el) {
                el.style.setProperty('display', 'flex', 'important');
                document.body.classList.add('modal-open');
            }
        },

        closeModal(id) {
            const el = document.getElementById(id);
            if (el) {
                el.style.setProperty('display', 'none', 'important');
            }
            let openCount = 0;
            document.querySelectorAll('.modal-overlay, .ns-modal-bg').forEach(m => {
                if (m.style.display && m.style.display !== 'none') openCount++;
            });
            if (openCount === 0) {
                document.body.classList.remove('modal-open');
            }
        },

        // ---------------------------------------------------------------------
        // COMPANION SVG CHARACTER (PHYSICAL STUDY FRIEND PRESENCE)
        // ---------------------------------------------------------------------
        renderAvatarSVG() {
            const svgMarkup = `
            <svg class="companion-svg-character" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="compGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#64ffda" stop-opacity="0.4"/>
                        <stop offset="100%" stop-color="#64ffda" stop-opacity="0"/>
                    </radialGradient>
                    <linearGradient id="compHoodie" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#1e293b"/>
                        <stop offset="100%" stop-color="#0f172a"/>
                    </linearGradient>
                    <linearGradient id="compCyanAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#64ffda"/>
                        <stop offset="100%" stop-color="#00b4d8"/>
                    </linearGradient>
                </defs>
                <circle cx="40" cy="40" r="32" fill="url(#compGlow)" class="comp-aura-glow"/>
                <g class="comp-char-body">
                    <path d="M16 68 C16 54 26 48 40 48 C54 48 64 54 64 68 Z" fill="url(#compHoodie)" stroke="#334155" stroke-width="1.5"/>
                    <path d="M36 50 L40 60 L44 50 Z" fill="#64ffda" opacity="0.3"/>
                    <circle cx="40" cy="34" r="16" fill="#f8fafc"/>
                    <path d="M24 30 C25 20 34 18 40 18 C46 18 55 20 56 30 C53 23 45 22 40 22 C34 22 27 24 24 30 Z" fill="#1e293b"/>
                    <rect x="22" y="28" width="4" height="12" rx="2" fill="url(#compCyanAccent)"/>
                    <rect x="54" y="28" width="4" height="12" rx="2" fill="url(#compCyanAccent)"/>
                    <path d="M24 30 C24 16 56 16 56 30" stroke="url(#compCyanAccent)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    <g class="comp-char-eyes">
                        <circle cx="34" cy="34" r="2.2" fill="#0f172a"/>
                        <circle cx="46" cy="34" r="2.2" fill="#0f172a"/>
                        <circle cx="35" cy="33.2" r="0.7" fill="#64ffda"/>
                        <circle cx="47" cy="33.2" r="0.7" fill="#64ffda"/>
                    </g>
                    <path d="M37 39 Q40 42 43 39" stroke="#64748b" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                </g>
            </svg>`;

            const slots = document.querySelectorAll('.comp-avatar-slot');
            slots.forEach(slot => slot.innerHTML = svgMarkup);
        }
    };

    // Expose Globally
    window.MFFocusCompanion = Companion;

    // Initialize on DOM load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Companion.init());
    } else {
        Companion.init();
    }

})(window, document);
