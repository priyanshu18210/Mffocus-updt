/**
 * ============================================================================
 * MFFOCUS — GROUP STUDY ROOMS (STUDY MEET) ENGINE
 * Single Media Controller • Real Hardware Track Release • Isolated Lifecycle
 * ============================================================================
 */

(function (window, document) {
    'use strict';

    // ------------------------------------------------------------------------
    // SVG ICONS DICTIONARY (ZERO EMOJIS)
    // ------------------------------------------------------------------------
    const ICONS = {
        micOn: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',
        micOff: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',
        camOn: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>',
        camOff: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M21 15.5l-5-3.5 5-3.5v7z"></path><path d="M1 6.5A2.5 2.5 0 0 1 3.5 4h10.38L2 19.38A2.5 2.5 0 0 1 1 17.5v-11z"></path><path d="M16 16.5A2.5 2.5 0 0 1 13.5 19H6.12L16 9.12v7.38z"></path></svg>',
        screenShare: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
        chat: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        people: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
        leave: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
        status: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
        
        // Study status specific icons
        statusStudying: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
        statusPaused: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>',
        statusBreak: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',
        statusCompleted: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        statusAvailable: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
        goalTarget: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',

        hostCrown: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffd700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z"></path></svg>',
        lock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
        unlock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>',
        play: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',
        pause: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>',
        reset: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>',
        send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
        invite: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
        copy: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
        close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
        timerPulse: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
    };

    // ------------------------------------------------------------------------
    // CONSTANTS & CONFIGURATION
    // ------------------------------------------------------------------------
    const MAX_PARTICIPANTS = 6;
    const ICE_SERVERS = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
    ];

    const STATUS_METADATA = {
        studying: { label: 'Studying', iconSvg: ICONS.statusStudying, className: 'status-studying' },
        paused: { label: 'Paused', iconSvg: ICONS.statusPaused, className: 'status-paused' },
        break: { label: 'Break', iconSvg: ICONS.statusBreak, className: 'status-break' },
        completed: { label: 'Completed', iconSvg: ICONS.statusCompleted, className: 'status-completed' },
        available: { label: 'Available', iconSvg: ICONS.statusAvailable, className: 'status-available' }
    };

    // ------------------------------------------------------------------------
    // GLOBAL STATE (100% LAZY INITIALIZED)
    // ------------------------------------------------------------------------
    const state = {
        activeRoomId: null,
        roomData: null,
        isHost: false,
        myUsername: '',
        myDisplayName: '',
        myAvatar: 'avatar1.png',

        // User preference choices (ON / OFF)
        micEnabled: true,
        camEnabled: true,

        // Hardware Permission States
        camPermissionState: 'prompt',
        micPermissionState: 'prompt',
        camErrorMessage: '',
        micErrorMessage: '',

        // Goal Privacy Setting
        shareGoalWithRoom: localStorage.getItem('sr_share_goal') !== 'false',
        isPanelMinimized: localStorage.getItem('sr_timer_minimized') === 'true',

        // WebRTC Mesh Peers
        peers: {},

        // Speaking Detection
        remoteAnalysers: {},
        speakingCheckInterval: null,

        // MFFOCUS Timer Observer State
        timerObserverInterval: null,
        lastBroadcastedTimerState: null,
        cachedRoomMembers: {},

        // UI State
        activeDrawer: null,
        unreadChatCount: 0,
        chatCooldown: false,

        // Firebase Listeners Refs
        roomRef: null,
        membersRef: null,
        signalsRef: null,
        chatsRef: null,
        presenceDisconnectRef: null
    };

    // ------------------------------------------------------------------------
    // SINGLE MEDIA CONTROLLER (EXCLUSIVE OWNER OF ALL getUserMedia & HARDWARE TRACKS)
    // ------------------------------------------------------------------------
    const StudyRoomMediaController = {
        localStream: null,
        previewStream: null,
        screenStream: null,
        localVideoTrack: null,
        localAudioTrack: null,
        screenTrack: null,
        audioContext: null,
        localAnalyser: null,
        previewVisualizerCtx: null,

        // --- CAMERA OPERATIONS ---
        async startCamera(isPrejoin = false) {
            console.debug("[MFFOCUS MEDIA] getUserMedia START (Camera)");
            this.stopCamera(isPrejoin);

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 360 },
                        facingMode: 'user'
                    }
                });
                console.debug("[MFFOCUS MEDIA] getUserMedia SUCCESS (Camera)");

                const vTrack = stream.getVideoTracks()[0];
                if (!vTrack) throw new Error("No video track in stream");

                console.debug("[MFFOCUS MEDIA] CAMERA TRACK CREATED:", vTrack.id);

                vTrack.onended = () => {
                    console.debug("[MFFOCUS MEDIA] CAMERA TRACK ONENDED (OS/Browser Revoked):", vTrack.id);
                    state.camEnabled = false;
                    StudyRoomMediaController.stopCamera(isPrejoin);
                    if (isPrejoin) {
                        updatePreJoinUI();
                    } else {
                        updateDockButtonStates();
                        const db = getDb();
                        if (db && state.activeRoomId) {
                            db.ref(`studyRooms/${state.activeRoomId}/members/${state.myUsername}/videoEnabled`).set(false).catch(e => {});
                        }
                        const videoEl = document.getElementById(`sr-video-${state.myUsername}`);
                        const avatarEl = document.getElementById(`sr-avatar-view-${state.myUsername}`);
                        if (videoEl && avatarEl) {
                            videoEl.style.display = 'none';
                            avatarEl.style.display = 'flex';
                        }
                    }
                };

                if (isPrejoin) {
                    if (!this.previewStream) this.previewStream = new MediaStream();
                    this.previewStream.addTrack(vTrack);
                } else {
                    this.localVideoTrack = vTrack;
                    if (!this.localStream) this.localStream = new MediaStream();
                    this.localStream.addTrack(vTrack);

                    // Update all WebRTC peer video senders
                    Object.values(state.peers).forEach(peerObj => {
                        const videoSender = peerObj.pc.getSenders().find(s => s.track ? s.track.kind === 'video' : (s.dtlsTransport || true));
                        if (videoSender) {
                            videoSender.replaceTrack(vTrack).catch(e => {});
                        } else {
                            try { peerObj.pc.addTrack(vTrack, this.localStream); } catch(e){}
                        }
                    });

                    // Attach to local video element
                    const myVideo = document.getElementById(`sr-video-${state.myUsername}`);
                    if (myVideo) {
                        myVideo.srcObject = this.localStream;
                        myVideo.play().catch(e => {});
                    }
                }

                state.camPermissionState = 'granted';
                state.camErrorMessage = '';
                return vTrack;
            } catch (err) {
                console.warn('[MFFOCUS MEDIA] Camera getUserMedia error:', err);
                state.camEnabled = false;
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    state.camPermissionState = 'denied';
                    state.camErrorMessage = 'Camera access was denied.';
                } else {
                    state.camPermissionState = 'unavailable';
                    state.camErrorMessage = 'Camera unavailable.';
                }
                return null;
            }
        },

        stopCamera(isPrejoin = false) {
            console.debug("[MFFOCUS MEDIA] CAMERA TRACK STOPPED (Request)");

            // Stop local video track
            if (this.localVideoTrack) {
                try {
                    this.localVideoTrack.stop();
                    console.debug("[MFFOCUS MEDIA] CAMERA TRACK STOPPED:", this.localVideoTrack.id, "readyState:", this.localVideoTrack.readyState);
                } catch(e){}
                this.localVideoTrack = null;
            }

            // Stop any video tracks in localStream
            if (this.localStream) {
                this.localStream.getVideoTracks().forEach(t => {
                    try {
                        t.stop();
                        console.debug("[MFFOCUS MEDIA] Extra video track stopped:", t.id, "readyState:", t.readyState);
                    } catch(e){}
                    this.localStream.removeTrack(t);
                });
            }

            // Stop any video tracks in previewStream
            if (this.previewStream) {
                this.previewStream.getVideoTracks().forEach(t => {
                    try {
                        t.stop();
                        console.debug("[MFFOCUS MEDIA] Preview video track stopped:", t.id, "readyState:", t.readyState);
                    } catch(e){}
                    this.previewStream.removeTrack(t);
                });
            }

            // Set video sender to null across all peer connections
            Object.values(state.peers).forEach(peerObj => {
                const videoSender = peerObj.pc.getSenders().find(s => (s.track && s.track.kind === 'video') || (s.dtlsTransport && !s.track));
                if (videoSender) {
                    videoSender.replaceTrack(null).catch(e => {});
                }
            });

            // Clear video srcObjects
            if (isPrejoin) {
                const preVideo = document.getElementById('sr-prejoin-video');
                if (preVideo) preVideo.srcObject = null;
            } else {
                const myVideo = document.getElementById(`sr-video-${state.myUsername}`);
                if (myVideo) myVideo.srcObject = null;
            }
        },

        // --- MICROPHONE OPERATIONS ---
        async startMicrophone(isPrejoin = false) {
            console.debug("[MFFOCUS MEDIA] getUserMedia START (Mic)");
            this.stopMicrophone(isPrejoin);

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });
                console.debug("[MFFOCUS MEDIA] getUserMedia SUCCESS (Mic)");

                const aTrack = stream.getAudioTracks()[0];
                if (!aTrack) throw new Error("No audio track in stream");

                console.debug("[MFFOCUS MEDIA] MIC TRACK CREATED:", aTrack.id);

                aTrack.onended = () => {
                    console.debug("[MFFOCUS MEDIA] MIC TRACK ONENDED (OS/Browser Revoked):", aTrack.id);
                    state.micEnabled = false;
                    StudyRoomMediaController.stopMicrophone(isPrejoin);
                    if (isPrejoin) {
                        updatePreJoinUI();
                    } else {
                        updateDockButtonStates();
                        const db = getDb();
                        if (db && state.activeRoomId) {
                            db.ref(`studyRooms/${state.activeRoomId}/members/${state.myUsername}/audioEnabled`).set(false).catch(e => {});
                        }
                        const micIcon = document.getElementById(`sr-mic-icon-${state.myUsername}`);
                        if (micIcon) {
                            micIcon.className = 'sr-mic-icon-card muted';
                            micIcon.innerHTML = ICONS.micOff;
                        }
                    }
                };

                if (isPrejoin) {
                    if (!this.previewStream) this.previewStream = new MediaStream();
                    this.previewStream.addTrack(aTrack);
                    this.setupPreviewVisualizer(this.previewStream);
                } else {
                    this.localAudioTrack = aTrack;
                    if (!this.localStream) this.localStream = new MediaStream();
                    this.localStream.addTrack(aTrack);

                    // Update all WebRTC peer audio senders
                    Object.values(state.peers).forEach(peerObj => {
                        const audioSender = peerObj.pc.getSenders().find(s => s.track ? s.track.kind === 'audio' : (s.dtlsTransport || true));
                        if (audioSender) {
                            audioSender.replaceTrack(aTrack).catch(e => {});
                        } else {
                            try { peerObj.pc.addTrack(aTrack, this.localStream); } catch(e){}
                        }
                    });

                    this.connectLocalAnalyser();
                }

                state.micPermissionState = 'granted';
                state.micErrorMessage = '';
                return aTrack;
            } catch (err) {
                console.warn('[MFFOCUS MEDIA] Microphone getUserMedia error:', err);
                state.micEnabled = false;
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    state.micPermissionState = 'denied';
                    state.micErrorMessage = 'Microphone access was denied.';
                } else {
                    state.micPermissionState = 'unavailable';
                    state.micErrorMessage = 'Microphone unavailable.';
                }
                return null;
            }
        },

        stopMicrophone(isPrejoin = false) {
            console.debug("[MFFOCUS MEDIA] MIC TRACK STOPPED (Request)");

            if (this.localAudioTrack) {
                try {
                    this.localAudioTrack.stop();
                    console.debug("[MFFOCUS MEDIA] MIC TRACK STOPPED:", this.localAudioTrack.id, "readyState:", this.localAudioTrack.readyState);
                } catch(e){}
                this.localAudioTrack = null;
            }

            if (this.localStream) {
                this.localStream.getAudioTracks().forEach(t => {
                    try {
                        t.stop();
                        console.debug("[MFFOCUS MEDIA] Extra audio track stopped:", t.id, "readyState:", t.readyState);
                    } catch(e){}
                    this.localStream.removeTrack(t);
                });
            }

            if (this.previewStream) {
                this.previewStream.getAudioTracks().forEach(t => {
                    try {
                        t.stop();
                        console.debug("[MFFOCUS MEDIA] Preview audio track stopped:", t.id, "readyState:", t.readyState);
                    } catch(e){}
                    this.previewStream.removeTrack(t);
                });
            }

            // Set audio sender to null across all peer connections
            Object.values(state.peers).forEach(peerObj => {
                const audioSender = peerObj.pc.getSenders().find(s => (s.track && s.track.kind === 'audio') || (s.dtlsTransport && !s.track));
                if (audioSender) {
                    audioSender.replaceTrack(null).catch(e => {});
                }
            });

            this.stopPreviewVisualizer();
        },

        // --- PREJOIN TO ROOM TRANSITION ---
        adoptPreviewStream() {
            console.debug("[MFFOCUS MEDIA] Adopting preview stream into active room");
            if (this.previewStream) {
                this.localStream = this.previewStream;
                this.localVideoTrack = this.previewStream.getVideoTracks()[0] || null;
                this.localAudioTrack = this.previewStream.getAudioTracks()[0] || null;
                this.previewStream = null;
            } else {
                this.localStream = new MediaStream();
            }
            this.stopPreviewVisualizer();
        },

        // --- SCREEN SHARING ---
        async startScreenShare() {
            console.debug("[MFFOCUS MEDIA] getDisplayMedia START");
            if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
                throw new Error("getDisplayMedia unsupported");
            }

            this.screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });
            console.debug("[MFFOCUS MEDIA] getDisplayMedia SUCCESS");

            this.screenTrack = this.screenStream.getVideoTracks()[0];
            this.screenTrack.onended = () => {
                StudyRooms.toggleScreenShare();
            };

            Object.values(state.peers).forEach(peerObj => {
                const sender = peerObj.pc.getSenders().find(s => s.track && s.track.kind === 'video');
                if (sender) {
                    sender.replaceTrack(this.screenTrack).catch(e => {});
                }
            });

            return this.screenStream;
        },

        stopScreenShare() {
            console.debug("[MFFOCUS MEDIA] SCREEN SHARE STOPPED");
            if (this.screenTrack) {
                try { this.screenTrack.stop(); } catch(e){}
                this.screenTrack = null;
            }
            if (this.screenStream) {
                this.screenStream.getTracks().forEach(t => {
                    try { t.stop(); } catch(e){}
                });
                this.screenStream = null;
            }

            // Restore camera track to senders
            const camTrack = this.localVideoTrack;
            Object.values(state.peers).forEach(peerObj => {
                const sender = peerObj.pc.getSenders().find(s => s.track && s.track.kind === 'video');
                if (sender) {
                    sender.replaceTrack(camTrack || null).catch(e => {});
                }
            });
        },

        // --- AUDIO VISUALIZER & SPEAKING ANALYSIS ---
        connectLocalAnalyser() {
            try {
                if (!this.audioContext) {
                    const AC = window.AudioContext || window.webkitAudioContext;
                    if (AC) this.audioContext = new AC();
                }
                if (this.audioContext && this.localStream && this.localAudioTrack) {
                    const source = this.audioContext.createMediaStreamSource(this.localStream);
                    this.localAnalyser = this.audioContext.createAnalyser();
                    this.localAnalyser.fftSize = 64;
                    source.connect(this.localAnalyser);
                }
            } catch(e){
                console.warn("[MFFOCUS MEDIA] Analyser error:", e);
            }
        },

        setupPreviewVisualizer(stream) {
            this.stopPreviewVisualizer();
            try {
                const AC = window.AudioContext || window.webkitAudioContext;
                if (!AC) return;
                const ctx = new AC();
                this.previewVisualizerCtx = ctx;

                const src = ctx.createMediaStreamSource(stream);
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 64;
                src.connect(analyser);

                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                const vuBar = document.getElementById('sr-prejoin-vu-level');

                const updateVu = () => {
                    if (!this.previewVisualizerCtx || !state.micEnabled) {
                        if (vuBar) vuBar.style.width = '0%';
                        return;
                    }
                    analyser.getByteFrequencyData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                    const avg = sum / dataArray.length;
                    const percent = Math.min(100, Math.round((avg / 128) * 100));
                    if (vuBar) vuBar.style.width = percent + '%';
                    requestAnimationFrame(updateVu);
                };
                updateVu();
            } catch(e){}
        },

        stopPreviewVisualizer() {
            if (this.previewVisualizerCtx) {
                try { this.previewVisualizerCtx.close(); } catch(e){}
                this.previewVisualizerCtx = null;
            }
            const vuBar = document.getElementById('sr-prejoin-vu-level');
            if (vuBar) vuBar.style.width = '0%';
        },

        // --- IDEMPOTENT TEARDOWN OF ALL HARDWARE TRACKS ---
        releaseAllMedia() {
            console.debug("[MFFOCUS MEDIA] STREAM CLEANUP (Full Hardware Release)");
            this.stopCamera(false);
            this.stopCamera(true);
            this.stopMicrophone(false);
            this.stopMicrophone(true);
            this.stopScreenShare();

            if (this.localStream) {
                this.localStream.getTracks().forEach(t => {
                    try { t.stop(); } catch(e){}
                });
                this.localStream = null;
            }
            if (this.previewStream) {
                this.previewStream.getTracks().forEach(t => {
                    try { t.stop(); } catch(e){}
                });
                this.previewStream = null;
            }

            if (this.audioContext) {
                try { this.audioContext.close(); } catch(e){}
                this.audioContext = null;
                this.localAnalyser = null;
            }

            // Clear all video elements in the DOM
            document.querySelectorAll('#study-rooms-modal video').forEach(v => {
                v.srcObject = null;
            });
        }
    };

    // ------------------------------------------------------------------------
    // UTILITY HELPERS
    // ------------------------------------------------------------------------
    function getDb() {
        if (typeof firebase !== 'undefined' && firebase.database) {
            return firebase.database();
        }
        if (typeof window.database !== 'undefined') {
            return window.database;
        }
        return null;
    }

    function getAuthUser() {
        const u = localStorage.getItem('aimUsername') || sessionStorage.getItem('aimUsername') || 'guest_' + Math.floor(Math.random()*10000);
        const dn = localStorage.getItem('aimDisplayName') || sessionStorage.getItem('aimDisplayName') || u;
        const av = (typeof currentUserAvatar !== 'undefined' && currentUserAvatar) ? currentUserAvatar : 'avatar1.png';
        return { username: u.toLowerCase(), displayName: dn, avatar: av };
    }

    function generateRoomId() {
        const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        let part1 = '';
        let part2 = '';
        for (let i = 0; i < 4; i++) part1 += chars.charAt(Math.floor(Math.random() * chars.length));
        for (let i = 0; i < 4; i++) part2 += chars.charAt(Math.floor(Math.random() * chars.length));
        return `SR-${part1}-${part2}`;
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatTime(seconds) {
        if (typeof window.formatTimeComponent === 'function') {
            return window.formatTimeComponent(seconds);
        }
        const isNegative = seconds < 0;
        const absSecs = Math.abs(Math.floor(seconds || 0));
        const hrs = Math.floor(absSecs / 3600);
        const mins = Math.floor((absSecs % 3600) / 60);
        const secs = absSecs % 60;
        const formatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        return isNegative ? `+${formatted}` : formatted;
    }

    function getInitials(name) {
        if (!name) return 'MF';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }

    // ------------------------------------------------------------------------
    // MFFOCUS LIVE TIMER OBSERVER (SINGLE SOURCE OF TRUTH)
    // ------------------------------------------------------------------------
    function getMffocusTimerState() {
        if (typeof window.MFFocusSession !== 'undefined' && typeof window.MFFocusSession.getState === 'function') {
            const s = window.MFFocusSession.getState();
            return {
                isRunning: s.isRunning,
                task: s.task,
                mode: s.mode,
                phase: s.phase,
                status: s.status,
                displaySecs: s.displaySecs,
                startedAt: s.startedAt || Date.now(),
                baseSecs: s.mode === 'stopwatch' ? s.stopwatchTime : s.timeLeft
            };
        }
        const isRunning = (typeof window.isRunning !== 'undefined') ? Boolean(window.isRunning) : false;
        const task = (typeof window.currentTask !== 'undefined') ? (window.currentTask || '') : '';
        const mode = (typeof window.currentMode !== 'undefined') ? (window.currentMode || 'countdown') : 'countdown';
        const phase = (typeof window.pomodoroPhase !== 'undefined') ? (window.pomodoroPhase || 'work') : 'work';
        const timeLeft = (typeof window.timeLeft !== 'undefined') ? window.timeLeft : 0;
        const stopwatchTime = (typeof window.stopwatchTime !== 'undefined') ? window.stopwatchTime : 0;
        const sessionStartTime = (typeof window.sessionStartTime !== 'undefined') ? window.sessionStartTime : null;

        let status = 'available';
        let displaySecs = 0;

        if (mode === 'pomodoro' && phase === 'break') {
            status = 'break';
            displaySecs = Math.max(0, timeLeft);
        } else if (isRunning) {
            status = 'studying';
            displaySecs = mode === 'stopwatch' ? stopwatchTime : timeLeft;
        } else if (!isRunning && task) {
            status = (timeLeft <= 0 && mode !== 'stopwatch' && !sessionStartTime) ? 'completed' : 'paused';
            displaySecs = mode === 'stopwatch' ? stopwatchTime : timeLeft;
        } else {
            status = 'available';
            displaySecs = mode === 'stopwatch' ? stopwatchTime : timeLeft;
        }

        return {
            isRunning,
            task,
            mode,
            phase,
            status,
            displaySecs,
            startedAt: sessionStartTime || Date.now(),
            baseSecs: mode === 'stopwatch' ? stopwatchTime : timeLeft
        };
    }

    function startTimerObserver() {
        if (state.timerObserverInterval) clearInterval(state.timerObserverInterval);
        
        state.timerObserverInterval = setInterval(() => {
            if (!state.activeRoomId) return;
            checkAndSyncTimerState();
            renderAllParticipantTimersLocally();
        }, 250);
    }

    function checkAndSyncTimerState() {
        if (!state.activeRoomId) return;
        const timerState = getMffocusTimerState();
        const last = state.lastBroadcastedTimerState;

        const hasChanged = !last ||
            last.isRunning !== timerState.isRunning ||
            last.status !== timerState.status ||
            last.task !== timerState.task ||
            last.mode !== timerState.mode ||
            last.phase !== timerState.phase;

        if (hasChanged) {
            state.lastBroadcastedTimerState = { ...timerState };

            const db = getDb();
            if (db && state.activeRoomId) {
                const goalToShare = (state.shareGoalWithRoom && timerState.task) ? timerState.task : '';
                db.ref(`studyRooms/${state.activeRoomId}/members/${state.myUsername}`).update({
                    studyStatus: timerState.status,
                    goalTitle: goalToShare,
                    timerMode: timerState.mode,
                    timerPhase: timerState.phase,
                    isTimerRunning: timerState.isRunning,
                    timerStartedAt: timerState.startedAt,
                    timerBaseSecs: timerState.baseSecs,
                    lastStateChange: Date.now()
                }).catch(e => {});
            }

            updateLocalParticipantGoalCard(timerState);
            updatePersonalStudyPanel(timerState);
            recalculateRoomFocusSummary();
        }
    }

    function renderAllParticipantTimersLocally() {
        if (!state.activeRoomId) return;

        Object.keys(state.cachedRoomMembers).forEach(username => {
            const m = state.cachedRoomMembers[username];
            const isMe = (username === state.myUsername);
            
            let secs = 0;
            if (isMe) {
                const myState = getMffocusTimerState();
                secs = myState.displaySecs;
            } else if (m.isTimerRunning && m.timerStartedAt) {
                const elapsed = Math.floor((Date.now() - m.timerStartedAt) / 1000);
                if (m.timerMode === 'stopwatch') {
                    secs = (m.timerBaseSecs || 0) + elapsed;
                } else {
                    secs = (m.timerBaseSecs || 0) - elapsed;
                }
            } else {
                secs = m.timerBaseSecs || 0;
            }

            const clockEl = document.getElementById(`sr-timer-val-${username}`);
            if (clockEl) {
                clockEl.textContent = formatTime(secs);
            }
        });

        const myState = getMffocusTimerState();
        const personalClock = document.getElementById('sr-personal-clock');
        if (personalClock) {
            personalClock.textContent = formatTime(myState.displaySecs);
        }
        const miniClock = document.getElementById('sr-personal-mini-clock');
        if (miniClock) {
            miniClock.textContent = formatTime(myState.displaySecs);
        }
    }

    function updateLocalParticipantGoalCard(myState) {
        const card = document.getElementById(`sr-card-${state.myUsername}`);
        if (!card) return;

        const goalBox = document.getElementById(`sr-goal-box-${state.myUsername}`);
        const statusMeta = STATUS_METADATA[myState.status] || STATUS_METADATA.available;

        if (myState.status === 'studying') {
            card.classList.add('is-studying');
        } else {
            card.classList.remove('is-studying');
        }

        if (goalBox) {
            const goalTitleToShow = myState.task || '';
            goalBox.innerHTML = `
                <div class="sr-goal-status-row">
                    <div class="sr-goal-status-badge ${statusMeta.className}">
                        ${statusMeta.iconSvg}
                        <span>${statusMeta.label}</span>
                    </div>
                    <div class="sr-goal-timer-val" id="sr-timer-val-${state.myUsername}">${formatTime(myState.displaySecs)}</div>
                </div>
                ${goalTitleToShow ? `
                    <div class="sr-goal-title-row" title="${escapeHtml(goalTitleToShow)}">
                        ${ICONS.goalTarget}
                        <span>${escapeHtml(goalTitleToShow)}</span>
                    </div>
                ` : ''}
            `;
        }
    }

    function applyPanelMinimizedState() {
        const panel = document.getElementById('sr-personal-panel');
        if (!panel) return;
        if (state.isPanelMinimized) {
            panel.classList.add('is-minimized');
        } else {
            panel.classList.remove('is-minimized');
        }
    }

    function toggleTimerPanelMinimize() {
        state.isPanelMinimized = !state.isPanelMinimized;
        localStorage.setItem('sr_timer_minimized', state.isPanelMinimized ? 'true' : 'false');
        applyPanelMinimizedState();
    }

    function updatePersonalStudyPanel(myState) {
        const activeSection = document.getElementById('sr-personal-active-section');
        const emptySection = document.getElementById('sr-personal-empty-section');
        const goalNameEl = document.getElementById('sr-personal-goal-name');
        const statusBadgeEl = document.getElementById('sr-personal-status');
        const toggleBtn = document.getElementById('sr-p-btn-toggle');
        const clockEl = document.getElementById('sr-personal-clock');

        // Minimized bar elements
        const miniStatusIcon = document.getElementById('sr-mini-status-icon');
        const miniClockEl = document.getElementById('sr-personal-mini-clock');
        const miniToggleBtn = document.getElementById('sr-mini-btn-toggle');

        const statusMeta = STATUS_METADATA[myState.status] || STATUS_METADATA.available;

        if (statusBadgeEl) {
            statusBadgeEl.className = `sr-goal-status-badge ${statusMeta.className}`;
            statusBadgeEl.innerHTML = `${statusMeta.iconSvg} <span>${statusMeta.label}</span>`;
        }

        if (miniStatusIcon) {
            miniStatusIcon.className = `sr-mini-status-icon ${statusMeta.className}`;
            miniStatusIcon.innerHTML = statusMeta.iconSvg;
            miniStatusIcon.title = statusMeta.label + (myState.task ? `: ${myState.task}` : '');
        }

        if (miniClockEl) {
            miniClockEl.textContent = formatTime(myState.displaySecs);
        }

        if (miniToggleBtn) {
            if (myState.isRunning) {
                miniToggleBtn.className = 'sr-mini-btn';
                miniToggleBtn.innerHTML = ICONS.pause;
                miniToggleBtn.title = 'Pause Focus Session';
            } else {
                miniToggleBtn.className = 'sr-mini-btn primary';
                miniToggleBtn.innerHTML = ICONS.play;
                miniToggleBtn.title = 'Resume Focus Session';
            }
        }

        if (!myState.task && !myState.isRunning) {
            if (activeSection) activeSection.style.display = 'none';
            if (emptySection) emptySection.style.display = 'flex';
        } else {
            if (emptySection) emptySection.style.display = 'none';
            if (activeSection) activeSection.style.display = 'flex';

            if (goalNameEl) {
                goalNameEl.textContent = myState.task || 'Focus Session';
                goalNameEl.title = myState.task || 'Focus Session';
            }

            if (clockEl) {
                clockEl.textContent = formatTime(myState.displaySecs);
            }

            if (toggleBtn) {
                if (myState.isRunning) {
                    toggleBtn.className = 'sr-personal-btn';
                    toggleBtn.innerHTML = `${ICONS.pause} <span>Pause</span>`;
                } else {
                    toggleBtn.className = 'sr-personal-btn primary';
                    toggleBtn.innerHTML = `${ICONS.play} <span>Resume</span>`;
                }
            }
        }
    }

    function recalculateRoomFocusSummary() {
        const members = Object.values(state.cachedRoomMembers);
        const total = members.length;
        if (total === 0) return;

        const studyingCount = members.filter(m => m.studyStatus === 'studying').length;
        const pausedCount = members.filter(m => m.studyStatus === 'paused').length;
        const breakCount = members.filter(m => m.studyStatus === 'break').length;
        const availableCount = members.filter(m => !['studying', 'paused', 'break'].includes(m.studyStatus)).length;

        const summaryTextEl = document.getElementById('sr-room-focus-text');
        const summaryPill = document.getElementById('sr-room-focus-pill');

        if (summaryTextEl) {
            summaryTextEl.textContent = `${studyingCount} / ${total} studying`;
        }
        if (summaryPill) {
            summaryPill.title = `${total} members • ${studyingCount} studying • ${pausedCount} paused • ${breakCount} on break • ${availableCount} available`;
        }
    }

    function toggleGoalPrivacy(enabled) {
        state.shareGoalWithRoom = Boolean(enabled);
        localStorage.setItem('sr_share_goal', state.shareGoalWithRoom ? 'true' : 'false');
        state.lastBroadcastedTimerState = null;
        checkAndSyncTimerState();
    }

    // ------------------------------------------------------------------------
    // PREJOIN SCREEN MEDIA MANAGEMENT
    // ------------------------------------------------------------------------
    async function requestPreJoinMedia() {
        console.debug("[MFFOCUS MEDIA] Requesting pre-join media setup");
        if (state.camEnabled) {
            await StudyRoomMediaController.startCamera(true);
        } else {
            StudyRoomMediaController.stopCamera(true);
        }

        if (state.micEnabled) {
            await StudyRoomMediaController.startMicrophone(true);
        } else {
            StudyRoomMediaController.stopMicrophone(true);
        }

        updatePreJoinUI();
    }

    function updatePreJoinUI() {
        const videoEl = document.getElementById('sr-prejoin-video');
        const avatarBox = document.getElementById('sr-prejoin-avatar-box');
        const micText = document.getElementById('sr-prejoin-mic-text');
        const camText = document.getElementById('sr-prejoin-cam-text');
        const micDot = document.getElementById('sr-prejoin-mic-dot');
        const camDot = document.getElementById('sr-prejoin-cam-dot');
        const micBtn = document.getElementById('sr-prejoin-toggle-mic');
        const camBtn = document.getElementById('sr-prejoin-toggle-cam');
        const noticeEl = document.getElementById('sr-prejoin-permission-notice');

        const hasLiveVideo = state.camEnabled && StudyRoomMediaController.previewStream && StudyRoomMediaController.previewStream.getVideoTracks().length > 0;
        
        if (videoEl && avatarBox) {
            if (hasLiveVideo) {
                videoEl.srcObject = StudyRoomMediaController.previewStream;
                videoEl.style.display = 'block';
                avatarBox.style.display = 'none';
            } else {
                videoEl.srcObject = null;
                videoEl.style.display = 'none';
                avatarBox.style.display = 'flex';
            }
        }

        if (camDot && camText) {
            if (state.camPermissionState === 'granted' || state.camEnabled) {
                camDot.className = 'sr-dot-status ' + (state.camEnabled ? 'sr-dot-connected' : 'sr-dot-disconnected');
                camText.textContent = state.camEnabled ? 'Camera: ON' : 'Camera: OFF';
            } else if (state.camPermissionState === 'denied') {
                camDot.className = 'sr-dot-status sr-dot-disconnected';
                camText.textContent = 'Camera: Permission denied';
            } else {
                camDot.className = 'sr-dot-status sr-dot-disconnected';
                camText.textContent = 'Camera: Not detected';
            }
        }

        if (micDot && micText) {
            if (state.micPermissionState === 'granted' || state.micEnabled) {
                micDot.className = 'sr-dot-status ' + (state.micEnabled ? 'sr-dot-connected' : 'sr-dot-disconnected');
                micText.textContent = state.micEnabled ? 'Microphone: ON' : 'Microphone: OFF (Muted)';
            } else if (state.micPermissionState === 'denied') {
                micDot.className = 'sr-dot-status sr-dot-disconnected';
                micText.textContent = 'Microphone: Permission denied';
            } else {
                micDot.className = 'sr-dot-status sr-dot-disconnected';
                micText.textContent = 'Microphone: Not detected';
            }
        }

        if (camBtn) {
            const isCamOk = (state.camPermissionState !== 'denied');
            camBtn.disabled = !isCamOk;
            camBtn.className = 'sr-prejoin-toggle-btn ' + (state.camEnabled ? 'on' : 'off');
            camBtn.innerHTML = state.camEnabled ? ICONS.camOn : ICONS.camOff;
        }

        if (micBtn) {
            const isMicOk = (state.micPermissionState !== 'denied');
            micBtn.disabled = !isMicOk;
            micBtn.className = 'sr-prejoin-toggle-btn ' + (state.micEnabled ? 'on' : 'off');
            micBtn.innerHTML = state.micEnabled ? ICONS.micOn : ICONS.micOff;
        }

        if (noticeEl) {
            let notices = [];
            if (state.camErrorMessage) notices.push(state.camErrorMessage);
            if (state.micErrorMessage) notices.push(state.micErrorMessage);
            if (notices.length > 0) {
                noticeEl.style.display = 'block';
                noticeEl.textContent = notices.join(' • ');
            } else {
                noticeEl.style.display = 'none';
                noticeEl.textContent = '';
            }
        }
    }

    async function togglePreJoinCam() {
        state.camEnabled = !state.camEnabled;
        if (state.camEnabled) {
            await StudyRoomMediaController.startCamera(true);
        } else {
            StudyRoomMediaController.stopCamera(true);
        }
        updatePreJoinUI();
    }

    async function togglePreJoinMic() {
        state.micEnabled = !state.micEnabled;
        if (state.micEnabled) {
            await StudyRoomMediaController.startMicrophone(true);
        } else {
            StudyRoomMediaController.stopMicrophone(true);
        }
        updatePreJoinUI();
    }

    // ------------------------------------------------------------------------
    // ROOM CREATION & JOIN LOGIC
    // ------------------------------------------------------------------------
    async function createRoom(options = {}) {
        const db = getDb();
        if (!db) {
            showNoticeDialog("Database connection unavailable. Please check your connection.");
            return;
        }

        const user = getAuthUser();
        state.myUsername = user.username;
        state.myDisplayName = user.displayName;
        state.myAvatar = user.avatar;

        const initialTimerState = getMffocusTimerState();

        const roomId = generateRoomId();
        const roomName = (options.name || `${user.displayName}'s Study Meet`).trim().slice(0, 60);
        const description = (options.description || '').trim().slice(0, 200);
        const isPrivate = Boolean(options.isPrivate);

        const newRoomData = {
            id: roomId,
            name: roomName,
            description: description,
            host: user.username,
            isLocked: false,
            isPrivate: isPrivate,
            maxMembers: MAX_PARTICIPANTS,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            members: {
                [user.username]: {
                    username: user.username,
                    displayName: user.displayName,
                    avatar: user.avatar,
                    isHost: true,
                    joinedAt: firebase.database.ServerValue.TIMESTAMP,
                    audioEnabled: state.micEnabled,
                    videoEnabled: state.camEnabled,
                    screenSharing: false,
                    isSpeaking: false,
                    studyStatus: initialTimerState.status,
                    goalTitle: (state.shareGoalWithRoom && initialTimerState.task) ? initialTimerState.task : '',
                    timerMode: initialTimerState.mode,
                    isTimerRunning: initialTimerState.isRunning,
                    timerStartedAt: initialTimerState.startedAt,
                    timerBaseSecs: initialTimerState.baseSecs,
                    connectionQuality: 'good',
                    lastPing: firebase.database.ServerValue.TIMESTAMP
                }
            }
        };

        try {
            await db.ref(`studyRooms/${roomId}`).set(newRoomData);
            openPreJoinScreen(roomId, newRoomData, true);
        } catch (err) {
            console.error('[StudyRooms] Error creating room:', err);
            showNoticeDialog("Failed to create room. Please try again.");
        }
    }

    async function joinRoom(roomId) {
        const db = getDb();
        if (!db) {
            showNoticeDialog("Database connection unavailable. Please check your connection.");
            return;
        }

        roomId = roomId.trim().toUpperCase();
        if (!roomId) {
            showNoticeDialog("Please enter a valid study room code.");
            return;
        }

        const user = getAuthUser();
        state.myUsername = user.username;
        state.myDisplayName = user.displayName;
        state.myAvatar = user.avatar;

        const roomRef = db.ref(`studyRooms/${roomId}`);
        const snap = await roomRef.once('value');
        
        if (!snap.exists()) {
            showNoticeDialog("This study room has ended or does not exist.");
            return;
        }

        const roomData = snap.val();

        if (roomData.isLocked && (!roomData.members || !roomData.members[user.username])) {
            showNoticeDialog("This study room is currently locked by the host.");
            return;
        }

        openPreJoinScreen(roomId, roomData, roomData.host === user.username);
    }

    async function executeJoinTransaction(roomId, roomData) {
        const db = getDb();
        const user = getAuthUser();
        const membersRef = db.ref(`studyRooms/${roomId}/members`);
        const initialTimerState = getMffocusTimerState();

        try {
            const txResult = await membersRef.transaction(currentMembers => {
                currentMembers = currentMembers || {};
                const keys = Object.keys(currentMembers);

                if (currentMembers[user.username]) {
                    currentMembers[user.username].lastPing = Date.now();
                    currentMembers[user.username].audioEnabled = state.micEnabled;
                    currentMembers[user.username].videoEnabled = state.camEnabled;
                    currentMembers[user.username].studyStatus = initialTimerState.status;
                    return currentMembers;
                }

                if (keys.length >= MAX_PARTICIPANTS) {
                    return; // ABORT: ROOM FULL
                }

                if (roomData.isLocked) {
                    return; // ABORT: LOCKED
                }

                currentMembers[user.username] = {
                    username: user.username,
                    displayName: user.displayName,
                    avatar: user.avatar,
                    isHost: (keys.length === 0) || (roomData.host === user.username),
                    joinedAt: Date.now(),
                    audioEnabled: state.micEnabled,
                    videoEnabled: state.camEnabled,
                    screenSharing: false,
                    isSpeaking: false,
                    studyStatus: initialTimerState.status,
                    goalTitle: (state.shareGoalWithRoom && initialTimerState.task) ? initialTimerState.task : '',
                    timerMode: initialTimerState.mode,
                    isTimerRunning: initialTimerState.isRunning,
                    timerStartedAt: initialTimerState.startedAt,
                    timerBaseSecs: initialTimerState.baseSecs,
                    connectionQuality: 'good',
                    lastPing: Date.now()
                };

                return currentMembers;
            });

            if (!txResult.committed) {
                const latestSnap = await db.ref(`studyRooms/${roomId}`).once('value');
                if (!latestSnap.exists()) {
                    showNoticeDialog("This study room has ended.");
                    return;
                }
                const latest = latestSnap.val();
                if (latest.isLocked) {
                    showNoticeDialog("This study room is currently locked by the host.");
                } else {
                    showNoticeDialog("This study room is full — maximum 6 members.");
                }
                return;
            }

            enterRoom(roomId, roomData, roomData.host === user.username);
        } catch (err) {
            console.error('[StudyRooms] Join transaction error:', err);
            showNoticeDialog("Connection couldn't be established. Check your network and try again.");
        }
    }

    // ------------------------------------------------------------------------
    // ACTIVE ROOM ENTRY & WEBRTC MESH
    // ------------------------------------------------------------------------
    async function enterRoom(roomId, roomData, isHost) {
        console.debug("[MFFOCUS MEDIA] StudyRoom mounted");
        state.activeRoomId = roomId;
        state.roomData = roomData;
        state.isHost = isHost;

        // Transition preview media into room
        StudyRoomMediaController.adoptPreviewStream();

        switchModalView('active-room');

        setupRoomRealtimeListeners(roomId);

        const initialTimerState = getMffocusTimerState();

        renderParticipantCard(state.myUsername, {
            username: state.myUsername,
            displayName: state.myDisplayName,
            avatar: state.myAvatar,
            isHost: state.isHost,
            audioEnabled: state.micEnabled,
            videoEnabled: state.camEnabled,
            studyStatus: initialTimerState.status,
            goalTitle: (state.shareGoalWithRoom && initialTimerState.task) ? initialTimerState.task : '',
            timerBaseSecs: initialTimerState.displaySecs
        }, StudyRoomMediaController.localStream, true);

        updateRoomHeaderUI();
        updateDockButtonStates();

        // Start local analyser if audio is active
        if (state.micEnabled) {
            StudyRoomMediaController.connectLocalAnalyser();
        }

        if (state.speakingCheckInterval) clearInterval(state.speakingCheckInterval);
        state.speakingCheckInterval = setInterval(checkSpeakingVolumes, 100);

        startTimerObserver();
    }

    // ------------------------------------------------------------------------
    // WEBRTC PEER CONNECTION MANAGEMENT
    // ------------------------------------------------------------------------
    function getOrCreatePeer(peerUsername) {
        if (state.peers[peerUsername]) {
            return state.peers[peerUsername];
        }

        console.debug("[MFFOCUS MEDIA] PEER CONNECTION CREATED:", peerUsername);
        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        const isPolite = state.myUsername > peerUsername;

        const peerObj = {
            pc: pc,
            isPolite: isPolite,
            makingOffer: false,
            ignoreOffer: false,
            remoteStream: new MediaStream(),
            candidateQueue: []
        };

        if (StudyRoomMediaController.localStream) {
            StudyRoomMediaController.localStream.getTracks().forEach(track => {
                try { pc.addTrack(track, StudyRoomMediaController.localStream); } catch(e){}
            });
        }

        const hasVideoSender = pc.getSenders().some(s => s.track && s.track.kind === 'video');
        if (!hasVideoSender) {
            try { pc.addTransceiver('video', { direction: 'sendrecv' }); } catch(e){}
        }
        const hasAudioSender = pc.getSenders().some(s => s.track && s.track.kind === 'audio');
        if (!hasAudioSender) {
            try { pc.addTransceiver('audio', { direction: 'sendrecv' }); } catch(e){}
        }

        pc.onnegotiationneeded = async () => {
            try {
                peerObj.makingOffer = true;
                await pc.setLocalDescription();
                sendSignal(state.activeRoomId, peerUsername, {
                    type: 'offer',
                    sdp: pc.localDescription
                });
            } catch (err) {
                console.error(`[StudyRooms] Negotiation error with ${peerUsername}:`, err);
            } finally {
                peerObj.makingOffer = false;
            }
        };

        pc.onicecandidate = ({ candidate }) => {
            if (candidate) {
                sendSignal(state.activeRoomId, peerUsername, {
                    type: 'candidate',
                    candidate: candidate
                });
            }
        };

        pc.ontrack = (event) => {
            event.streams[0].getTracks().forEach(track => {
                if (!peerObj.remoteStream.getTracks().some(t => t.id === track.id)) {
                    peerObj.remoteStream.addTrack(track);
                }
            });

            const videoEl = document.getElementById(`sr-video-${peerUsername}`);
            if (videoEl && videoEl.srcObject !== peerObj.remoteStream) {
                videoEl.srcObject = peerObj.remoteStream;
            }

            attachRemoteAudioAnalyser(peerUsername, peerObj.remoteStream);
        };

        pc.onconnectionstatechange = () => {
            handlePeerConnectionStateChange(peerUsername, pc.connectionState);
        };

        pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === 'failed') {
                pc.restartIce();
            }
        };

        state.peers[peerUsername] = peerObj;
        return peerObj;
    }

    function sendSignal(roomId, targetUsername, data) {
        const db = getDb();
        if (!db || !roomId) return;
        const packetId = `${state.myUsername}_${targetUsername}_${Date.now()}_${Math.floor(Math.random()*1000)}`;
        db.ref(`studyRoomSignals/${roomId}/${packetId}`).set({
            from: state.myUsername,
            to: targetUsername,
            type: data.type,
            sdp: data.sdp ? { type: data.sdp.type, sdp: data.sdp.sdp } : null,
            candidate: data.candidate ? data.candidate.toJSON() : null,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }

    async function handleIncomingSignal(packetId, signal) {
        if (!signal || signal.to !== state.myUsername) return;
        const peerUsername = signal.from;
        if (!peerUsername || peerUsername === state.myUsername) return;

        const peerObj = getOrCreatePeer(peerUsername);
        const pc = peerObj.pc;

        try {
            if (signal.type === 'offer') {
                const offerCollision = (pc.signalingState !== 'stable' || peerObj.makingOffer);
                peerObj.ignoreOffer = !peerObj.isPolite && offerCollision;

                if (peerObj.ignoreOffer) {
                    return;
                }

                await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

                while (peerObj.candidateQueue.length > 0) {
                    const c = peerObj.candidateQueue.shift();
                    await pc.addIceCandidate(c).catch(e => {});
                }

                await pc.setLocalDescription(await pc.createAnswer());
                sendSignal(state.activeRoomId, peerUsername, {
                    type: 'answer',
                    sdp: pc.localDescription
                });
            } 
            else if (signal.type === 'answer') {
                if (pc.signalingState === 'have-local-offer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                    while (peerObj.candidateQueue.length > 0) {
                        const c = peerObj.candidateQueue.shift();
                        await pc.addIceCandidate(c).catch(e => {});
                    }
                }
            } 
            else if (signal.type === 'candidate' && signal.candidate) {
                const candidate = new RTCIceCandidate(signal.candidate);
                if (pc.remoteDescription && pc.remoteDescription.type) {
                    await pc.addIceCandidate(candidate).catch(e => {});
                } else {
                    peerObj.candidateQueue.push(candidate);
                }
            }
        } catch (err) {
            console.error(`[StudyRooms] Signal error with ${peerUsername}:`, err);
        } finally {
            const db = getDb();
            if (db && state.activeRoomId) {
                db.ref(`studyRoomSignals/${state.activeRoomId}/${packetId}`).remove();
            }
        }
    }

    function handlePeerConnectionStateChange(peerUsername, pcState) {
        const dot = document.getElementById(`sr-conn-dot-${peerUsername}`);
        if (!dot) return;

        if (pcState === 'connected') {
            dot.className = 'sr-conn-dot sr-conn-good';
            dot.title = 'Connection: Good';
        } else if (pcState === 'connecting') {
            dot.className = 'sr-conn-dot sr-conn-unstable';
            dot.title = 'Connecting...';
        } else if (pcState === 'disconnected' || pcState === 'failed') {
            dot.className = 'sr-conn-dot sr-conn-poor';
            dot.title = 'Connection: Unstable/Poor';
        }
    }

    function removePeer(peerUsername) {
        if (state.peers[peerUsername]) {
            console.debug("[MFFOCUS MEDIA] PEER CONNECTION CLOSED:", peerUsername);
            try {
                state.peers[peerUsername].pc.close();
            } catch (e) {}
            delete state.peers[peerUsername];
        }
        if (state.remoteAnalysers[peerUsername]) {
            delete state.remoteAnalysers[peerUsername];
        }
        const card = document.getElementById(`sr-card-${peerUsername}`);
        if (card) card.remove();
        updateGridClass();
    }

    // ------------------------------------------------------------------------
    // REALTIME DATABASE LISTENERS
    // ------------------------------------------------------------------------
    function setupRoomRealtimeListeners(roomId) {
        const db = getDb();
        if (!db) return;

        state.presenceDisconnectRef = db.ref(`studyRooms/${roomId}/members/${state.myUsername}`);
        state.presenceDisconnectRef.onDisconnect().remove();

        state.roomRef = db.ref(`studyRooms/${roomId}`);
        state.roomRef.on('value', (snap) => {
            if (!snap.exists()) {
                showNoticeDialog("This study room has been ended by the host.");
                leaveRoom(false);
                return;
            }
            const data = snap.val();
            state.roomData = data;
            state.isHost = (data.host === state.myUsername);
            updateRoomHeaderUI();
        });

        state.membersRef = db.ref(`studyRooms/${roomId}/members`);
        state.membersRef.on('value', (snap) => {
            const members = snap.val() || {};
            state.cachedRoomMembers = members;
            handleMembersUpdate(members);
        });

        state.signalsRef = db.ref(`studyRoomSignals/${roomId}`);
        state.signalsRef.on('child_added', (snap) => {
            const packet = snap.val();
            if (packet && packet.to === state.myUsername) {
                handleIncomingSignal(snap.key, packet);
            }
        });

        state.chatsRef = db.ref(`studyRooms/${roomId}/chats`);
        state.chatsRef.limitToLast(50).on('child_added', (snap) => {
            const chat = snap.val();
            if (chat) renderChatMessage(chat);
        });
    }

    function handleMembersUpdate(members) {
        const currentMemberKeys = Object.keys(members);

        if (!members[state.myUsername] && state.activeRoomId) {
            showNoticeDialog("You have been removed from the study room.");
            leaveRoom(false);
            return;
        }

        // Automatic Host Handover
        if (state.roomData && !members[state.roomData.host] && currentMemberKeys.length > 0) {
            const oldestMember = currentMemberKeys.sort((a, b) => (members[a].joinedAt || 0) - (members[b].joinedAt || 0))[0];
            if (oldestMember === state.myUsername) {
                const db = getDb();
                if (db) {
                    db.ref(`studyRooms/${state.activeRoomId}/host`).set(state.myUsername);
                    db.ref(`studyRooms/${state.activeRoomId}/members/${state.myUsername}/isHost`).set(true);
                }
            }
        }

        // Remove peers that left
        Object.keys(state.peers).forEach(peerUsername => {
            if (!members[peerUsername]) {
                removePeer(peerUsername);
            }
        });

        // Add or update member cards
        currentMemberKeys.forEach(username => {
            const m = members[username];
            if (username === state.myUsername) {
                // Handled via local timer observer
            } else {
                const peerObj = getOrCreatePeer(username);
                renderParticipantCard(username, m, peerObj.remoteStream, false);
            }
        });

        updateGridClass();
        renderParticipantsDrawerList(members);
        recalculateRoomFocusSummary();
    }

    // ------------------------------------------------------------------------
    // SPEAKING DETECTION
    // ------------------------------------------------------------------------
    function attachRemoteAudioAnalyser(peerUsername, stream) {
        if (!StudyRoomMediaController.audioContext || !stream || stream.getAudioTracks().length === 0) return;
        try {
            const source = StudyRoomMediaController.audioContext.createMediaStreamSource(stream);
            const analyser = StudyRoomMediaController.audioContext.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            state.remoteAnalysers[peerUsername] = analyser;
        } catch (e) {}
    }

    function checkSpeakingVolumes() {
        const threshold = 18;
        const buf = new Uint8Array(32);

        if (StudyRoomMediaController.localAnalyser && state.micEnabled) {
            StudyRoomMediaController.localAnalyser.getByteFrequencyData(buf);
            let sum = 0;
            for (let i = 0; i < buf.length; i++) sum += buf[i];
            const avg = sum / buf.length;
            const isSpeaking = avg > threshold;
            const myCard = document.getElementById(`sr-card-${state.myUsername}`);
            if (myCard) {
                if (isSpeaking) myCard.classList.add('speaking');
                else myCard.classList.remove('speaking');
            }
        }

        Object.keys(state.remoteAnalysers).forEach(peerUsername => {
            const analyser = state.remoteAnalysers[peerUsername];
            if (analyser) {
                analyser.getByteFrequencyData(buf);
                let sum = 0;
                for (let i = 0; i < buf.length; i++) sum += buf[i];
                const avg = sum / buf.length;
                const isSpeaking = avg > threshold;
                const card = document.getElementById(`sr-card-${peerUsername}`);
                if (card) {
                    if (isSpeaking) card.classList.add('speaking');
                    else card.classList.remove('speaking');
                }
            }
        });
    }

    // ------------------------------------------------------------------------
    // MEDIA TOGGLE CONTROLS (USING CONTROLLER)
    // ------------------------------------------------------------------------
    async function toggleMic() {
        state.micEnabled = !state.micEnabled;

        if (state.micEnabled) {
            await StudyRoomMediaController.startMicrophone(false);
        } else {
            StudyRoomMediaController.stopMicrophone(false);
        }

        updateDockButtonStates();
        
        const db = getDb();
        if (db && state.activeRoomId) {
            db.ref(`studyRooms/${state.activeRoomId}/members/${state.myUsername}/audioEnabled`).set(state.micEnabled).catch(e => {});
        }

        const micIcon = document.getElementById(`sr-mic-icon-${state.myUsername}`);
        if (micIcon) {
            micIcon.className = 'sr-mic-icon-card ' + (state.micEnabled ? 'active' : 'muted');
            micIcon.innerHTML = state.micEnabled ? ICONS.micOn : ICONS.micOff;
        }
    }

    async function toggleCamera() {
        state.camEnabled = !state.camEnabled;

        if (state.camEnabled) {
            await StudyRoomMediaController.startCamera(false);
        } else {
            StudyRoomMediaController.stopCamera(false);
        }

        updateDockButtonStates();

        const db = getDb();
        if (db && state.activeRoomId) {
            db.ref(`studyRooms/${state.activeRoomId}/members/${state.myUsername}/videoEnabled`).set(state.camEnabled).catch(e => {});
        }

        const videoEl = document.getElementById(`sr-video-${state.myUsername}`);
        const avatarEl = document.getElementById(`sr-avatar-view-${state.myUsername}`);
        if (videoEl && avatarEl) {
            videoEl.style.display = state.camEnabled ? 'block' : 'none';
            avatarEl.style.display = state.camEnabled ? 'none' : 'flex';
        }
    }

    async function toggleScreenShare() {
        if (state.isScreenSharing) {
            stopScreenShare();
            return;
        }

        try {
            await StudyRoomMediaController.startScreenShare();
            state.isScreenSharing = true;

            const myVideo = document.getElementById(`sr-video-${state.myUsername}`);
            const myCard = document.getElementById(`sr-card-${state.myUsername}`);
            if (myVideo) {
                myVideo.srcObject = StudyRoomMediaController.screenStream;
                myVideo.style.display = 'block';
            }
            if (myCard) {
                myCard.classList.add('screen-sharing');
            }

            const banner = document.getElementById('sr-screen-share-banner');
            if (banner) banner.style.display = 'flex';

            updateDockButtonStates();

            const db = getDb();
            if (db && state.activeRoomId) {
                db.ref(`studyRooms/${state.activeRoomId}/members/${state.myUsername}/screenSharing`).set(true).catch(e => {});
            }
        } catch (err) {
            state.isScreenSharing = false;
            updateDockButtonStates();
        }
    }

    function stopScreenShare() {
        StudyRoomMediaController.stopScreenShare();
        state.isScreenSharing = false;

        const myVideo = document.getElementById(`sr-video-${state.myUsername}`);
        const avatarEl = document.getElementById(`sr-avatar-view-${state.myUsername}`);
        const myCard = document.getElementById(`sr-card-${state.myUsername}`);

        if (myCard) myCard.classList.remove('screen-sharing');
        if (myVideo) {
            myVideo.srcObject = state.camEnabled ? StudyRoomMediaController.localStream : null;
            myVideo.style.display = state.camEnabled ? 'block' : 'none';
        }
        if (avatarEl) {
            avatarEl.style.display = state.camEnabled ? 'none' : 'flex';
        }

        const banner = document.getElementById('sr-screen-share-banner');
        if (banner) banner.style.display = 'none';

        updateDockButtonStates();

        const db = getDb();
        if (db && state.activeRoomId) {
            db.ref(`studyRooms/${state.activeRoomId}/members/${state.myUsername}/screenSharing`).set(false).catch(e => {});
        }
    }

    // ------------------------------------------------------------------------
    // EPHEMERAL CHAT
    // ------------------------------------------------------------------------
    function sendChatMessage() {
        const input = document.getElementById('sr-chat-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text || text.length > 500) return;

        if (state.chatCooldown) return;

        state.chatCooldown = true;
        setTimeout(() => { state.chatCooldown = false; }, 1200);

        const db = getDb();
        if (!db || !state.activeRoomId) return;

        db.ref(`studyRooms/${state.activeRoomId}/chats`).push({
            u: state.myUsername,
            dn: state.myDisplayName,
            av: state.myAvatar,
            m: text,
            t: firebase.database.ServerValue.TIMESTAMP
        });

        input.value = '';
        updateCharCounter();
    }

    function renderChatMessage(chat) {
        const body = document.getElementById('sr-chat-body');
        if (!body) return;

        const isMe = chat.u === state.myUsername;
        const timeStr = new Date(chat.t || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const msgDiv = document.createElement('div');
        msgDiv.className = 'sr-chat-msg ' + (isMe ? 'is-me' : '');
        msgDiv.innerHTML = `
            <div class="sr-chat-msg-meta">
                <span>${escapeHtml(chat.dn || chat.u)}</span>
                <span>•</span>
                <span>${timeStr}</span>
            </div>
            <div class="sr-chat-msg-bubble">
                ${escapeHtml(chat.m)}
            </div>
        `;

        body.appendChild(msgDiv);
        body.scrollTop = body.scrollHeight;

        if (state.activeDrawer !== 'chat' && !isMe) {
            state.unreadChatCount++;
            const badge = document.getElementById('sr-chat-unread-badge');
            if (badge) {
                badge.style.display = 'flex';
                badge.textContent = state.unreadChatCount > 9 ? '9+' : state.unreadChatCount;
            }
        }
    }

    function updateCharCounter() {
        const input = document.getElementById('sr-chat-input');
        const counter = document.getElementById('sr-chat-counter');
        if (input && counter) {
            counter.textContent = `${input.value.length} / 500`;
        }
    }

    // ------------------------------------------------------------------------
    // PARTICIPANTS DRAWER
    // ------------------------------------------------------------------------
    function toggleDrawer(name) {
        const chatDrawer = document.getElementById('sr-drawer-chat');
        const peopleDrawer = document.getElementById('sr-drawer-people');
        const chatBtn = document.getElementById('sr-dock-btn-chat');
        const peopleBtn = document.getElementById('sr-dock-btn-people');

        if (state.activeDrawer === name) {
            if (chatDrawer) chatDrawer.classList.remove('is-open');
            if (peopleDrawer) peopleDrawer.classList.remove('is-open');
            if (chatBtn) chatBtn.classList.remove('active');
            if (peopleBtn) peopleBtn.classList.remove('active');
            state.activeDrawer = null;
        } else {
            if (name === 'chat') {
                if (peopleDrawer) peopleDrawer.classList.remove('is-open');
                if (peopleBtn) peopleBtn.classList.remove('active');
                if (chatDrawer) chatDrawer.classList.add('is-open');
                if (chatBtn) chatBtn.classList.add('active');
                state.unreadChatCount = 0;
                const badge = document.getElementById('sr-chat-unread-badge');
                if (badge) badge.style.display = 'none';
            } else if (name === 'people') {
                if (chatDrawer) chatDrawer.classList.remove('is-open');
                if (chatBtn) chatBtn.classList.remove('active');
                if (peopleDrawer) peopleDrawer.classList.add('is-open');
                if (peopleBtn) peopleBtn.classList.add('active');
            }
            state.activeDrawer = name;
        }
    }

    function renderParticipantsDrawerList(members) {
        const listEl = document.getElementById('sr-participants-list');
        const countBadge = document.getElementById('sr-people-count-badge');
        const drawerTitle = document.getElementById('sr-drawer-people-title');
        if (!listEl) return;

        const keys = Object.keys(members);
        if (countBadge) countBadge.textContent = `${keys.length}/${MAX_PARTICIPANTS}`;
        if (drawerTitle) drawerTitle.textContent = `Participants (${keys.length}/${MAX_PARTICIPANTS})`;

        let html = '';
        keys.forEach(u => {
            const m = members[u];
            const isMe = u === state.myUsername;
            const statusMeta = STATUS_METADATA[m.studyStatus] || STATUS_METADATA.available;
            const goalText = m.goalTitle ? ` • ${escapeHtml(m.goalTitle)}` : '';
            
            html += `
                <div class="sr-participant-row">
                    <div class="sr-participant-info">
                        <img src="${m.avatar || 'avatar1.png'}" class="sr-p-avatar" onerror="this.src='avatar1.png'" />
                        <div>
                            <div class="sr-p-name">
                                ${escapeHtml(m.displayName || m.username)} ${m.isHost ? ICONS.hostCrown : ''} ${isMe ? '(You)' : ''}
                            </div>
                            <div class="sr-p-status">${statusMeta.iconSvg} <span>${statusMeta.label}${goalText}</span></div>
                        </div>
                    </div>
                    <div class="sr-p-actions">
                        <span class="sr-p-indicator-icon">${m.audioEnabled ? ICONS.micOn : ICONS.micOff}</span>
                        <span class="sr-p-indicator-icon">${m.videoEnabled ? ICONS.camOn : ICONS.camOff}</span>
                        ${(state.isHost && !isMe) ? `<button onclick="StudyRooms.kickParticipant('${u}')" class="sr-kick-btn">Kick</button>` : ''}
                    </div>
                </div>
            `;
        });

        listEl.innerHTML = html;
    }

    // ------------------------------------------------------------------------
    // HOST CONTROLS
    // ------------------------------------------------------------------------
    function kickParticipant(targetUsername) {
        if (!state.isHost || !state.activeRoomId || targetUsername === state.myUsername) return;
        const db = getDb();
        if (db) {
            db.ref(`studyRooms/${state.activeRoomId}/members/${targetUsername}`).remove();
        }
    }

    function toggleRoomLock() {
        if (!state.isHost || !state.activeRoomId) return;
        const db = getDb();
        const newLockState = !state.roomData?.isLocked;
        if (db) {
            db.ref(`studyRooms/${state.activeRoomId}/isLocked`).set(newLockState);
        }
    }

    function confirmEndRoom() {
        showCustomConfirmDialog(
            "End Study Room?",
            "This will end the study room for all participants and clean up the session.",
            "End Room",
            () => {
                const db = getDb();
                if (db && state.activeRoomId) {
                    db.ref(`studyRooms/${state.activeRoomId}`).remove();
                    db.ref(`studyRoomSignals/${state.activeRoomId}`).remove();
                }
                leaveRoom(false);
            }
        );
    }

    function confirmLeaveRoom() {
        showCustomConfirmDialog(
            "Leave Study Room?",
            "You can rejoin anytime as long as the room is not full or locked.",
            "Leave Room",
            () => {
                leaveRoom(true);
            }
        );
    }

    // ------------------------------------------------------------------------
    // ROOM TEARDOWN & HARDWARE CLEANUP
    // ------------------------------------------------------------------------
    async function leaveRoom(notifyDb = true) {
        console.debug("[MFFOCUS MEDIA] StudyRoom unmounted / cleanup");
        const roomId = state.activeRoomId;

        if (state.timerObserverInterval) {
            clearInterval(state.timerObserverInterval);
            state.timerObserverInterval = null;
        }

        // FULL IDEMPOTENT HARDWARE RELEASE
        StudyRoomMediaController.releaseAllMedia();

        if (state.speakingCheckInterval) clearInterval(state.speakingCheckInterval);

        Object.keys(state.peers).forEach(peerUsername => {
            try { state.peers[peerUsername].pc.close(); } catch(e){}
        });
        state.peers = {};
        state.remoteAnalysers = {};
        state.cachedRoomMembers = {};

        const db = getDb();
        if (db && roomId && notifyDb) {
            try {
                await db.ref(`studyRooms/${roomId}/members/${state.myUsername}`).remove();
                
                const snap = await db.ref(`studyRooms/${roomId}/members`).once('value');
                if (!snap.exists() || snap.numChildren() === 0) {
                    await db.ref(`studyRooms/${roomId}`).remove();
                    await db.ref(`studyRoomSignals/${roomId}`).remove();
                }
            } catch(e) {}
        }

        if (state.roomRef) state.roomRef.off();
        if (state.membersRef) state.membersRef.off();
        if (state.signalsRef) state.signalsRef.off();
        if (state.chatsRef) state.chatsRef.off();

        state.activeRoomId = null;
        state.roomData = null;
        state.isHost = false;
        state.isScreenSharing = false;

        const grid = document.getElementById('sr-video-grid');
        if (grid) grid.innerHTML = '';
        const chatBody = document.getElementById('sr-chat-body');
        if (chatBody) chatBody.innerHTML = '';

        switchModalView('dashboard');
        loadPublicRoomsFeed();
    }

    // ------------------------------------------------------------------------
    // UI RENDERING HELPERS
    // ------------------------------------------------------------------------
    function updateRoomHeaderUI() {
        const nameEl = document.getElementById('sr-room-header-name');
        const codeBtn = document.getElementById('sr-room-code-badge');
        const lockBtn = document.getElementById('sr-lock-room-btn');
        const hostCrown = document.getElementById('sr-host-indicator');

        if (nameEl && state.roomData) nameEl.textContent = state.roomData.name;
        if (codeBtn) codeBtn.innerHTML = `${ICONS.copy} <span>${state.activeRoomId || ''}</span>`;
        if (hostCrown) {
            hostCrown.style.display = state.isHost ? 'inline-flex' : 'none';
            hostCrown.innerHTML = ICONS.hostCrown;
        }

        if (lockBtn) {
            lockBtn.style.display = state.isHost ? 'inline-flex' : 'none';
            lockBtn.innerHTML = state.roomData?.isLocked ? `${ICONS.lock} <span>Locked</span>` : `${ICONS.unlock} <span>Unlocked</span>`;
            lockBtn.className = 'sr-glass-pill ' + (state.roomData?.isLocked ? 'sr-badge-locked' : '');
        }
    }

    function renderParticipantCard(username, memberData, stream, isMe) {
        const grid = document.getElementById('sr-video-grid');
        if (!grid) return;

        let card = document.getElementById(`sr-card-${username}`);
        const statusMeta = STATUS_METADATA[memberData.studyStatus] || STATUS_METADATA.available;
        const goalTitle = memberData.goalTitle || '';

        if (!card) {
            card = document.createElement('div');
            card.id = `sr-card-${username}`;
            card.className = 'sr-card ' + (isMe ? 'is-me ' : '') + (memberData.studyStatus === 'studying' ? 'is-studying ' : '');
            
            card.innerHTML = `
                <video id="sr-video-${username}" class="sr-card-video" autoplay playsinline ${isMe ? 'muted' : ''}></video>
                <div id="sr-avatar-view-${username}" class="sr-card-avatar-view" style="display: ${memberData.videoEnabled ? 'none' : 'flex'};">
                    <div class="sr-avatar-wrapper">
                        <div class="sr-avatar-halo"></div>
                        <img src="${memberData.avatar || 'avatar1.png'}" class="sr-avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                        <div class="sr-avatar-initials" style="display:none;">${getInitials(memberData.displayName || memberData.username)}</div>
                    </div>
                    <div class="sr-avatar-name">${escapeHtml(memberData.displayName || memberData.username)}</div>
                </div>
                <div class="sr-card-overlay">
                    <div class="sr-card-user-row">
                        <div class="sr-user-pill">
                            ${memberData.isHost ? `<span class="sr-host-crown" title="Host">${ICONS.hostCrown}</span>` : ''}
                            <span class="sr-card-username">${escapeHtml(memberData.displayName || memberData.username)} ${isMe ? '(You)' : ''}</span>
                        </div>
                        <div class="sr-card-indicators">
                            <div id="sr-mic-icon-${username}" class="sr-mic-icon-card ${memberData.audioEnabled ? 'active' : 'muted'}">
                                ${memberData.audioEnabled ? ICONS.micOn : ICONS.micOff}
                            </div>
                            <div id="sr-conn-dot-${username}" class="sr-conn-dot sr-conn-good" title="Connection: Good"></div>
                        </div>
                    </div>
                    <div class="sr-card-goal-box" id="sr-goal-box-${username}">
                        <div class="sr-goal-status-row">
                            <div class="sr-goal-status-badge ${statusMeta.className}">
                                ${statusMeta.iconSvg}
                                <span>${statusMeta.label}</span>
                            </div>
                            <div class="sr-goal-timer-val" id="sr-timer-val-${username}">${formatTime(memberData.timerBaseSecs || 0)}</div>
                        </div>
                        ${goalTitle ? `
                            <div class="sr-goal-title-row" title="${escapeHtml(goalTitle)}">
                                ${ICONS.goalTarget}
                                <span>${escapeHtml(goalTitle)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            grid.appendChild(card);
        } else {
            if (memberData.studyStatus === 'studying') card.classList.add('is-studying');
            else card.classList.remove('is-studying');

            const goalBox = document.getElementById(`sr-goal-box-${username}`);
            if (goalBox) {
                goalBox.innerHTML = `
                    <div class="sr-goal-status-row">
                        <div class="sr-goal-status-badge ${statusMeta.className}">
                            ${statusMeta.iconSvg}
                            <span>${statusMeta.label}</span>
                        </div>
                        <div class="sr-goal-timer-val" id="sr-timer-val-${username}">${formatTime(memberData.timerBaseSecs || 0)}</div>
                    </div>
                    ${goalTitle ? `
                        <div class="sr-goal-title-row" title="${escapeHtml(goalTitle)}">
                            ${ICONS.goalTarget}
                            <span>${escapeHtml(goalTitle)}</span>
                        </div>
                    ` : ''}
                `;
            }
        }

        const videoEl = document.getElementById(`sr-video-${username}`);
        const avatarEl = document.getElementById(`sr-avatar-view-${username}`);

        if (videoEl && stream && videoEl.srcObject !== stream && memberData.videoEnabled) {
            videoEl.srcObject = stream;
            videoEl.play().catch(e => {});
        } else if (videoEl && !memberData.videoEnabled) {
            videoEl.srcObject = null;
        }

        if (videoEl && avatarEl) {
            videoEl.style.display = memberData.videoEnabled ? 'block' : 'none';
            avatarEl.style.display = memberData.videoEnabled ? 'none' : 'flex';
        }
    }

    function updateGridClass() {
        const grid = document.getElementById('sr-video-grid');
        if (!grid) return;
        const count = grid.children.length;
        grid.className = `sr-video-grid grid-${Math.min(6, Math.max(1, count))}`;
    }

    function updateDockButtonStates() {
        const micBtn = document.getElementById('sr-dock-btn-mic');
        const camBtn = document.getElementById('sr-dock-btn-cam');
        const screenBtn = document.getElementById('sr-dock-btn-screen');

        if (micBtn) {
            micBtn.className = 'sr-dock-btn ' + (state.micEnabled ? 'active' : 'off');
            micBtn.innerHTML = state.micEnabled ? ICONS.micOn : ICONS.micOff;
            micBtn.setAttribute('data-tooltip', state.micEnabled ? 'Mute Microphone' : 'Unmute Microphone');
        }
        if (camBtn) {
            camBtn.className = 'sr-dock-btn ' + (state.camEnabled ? 'active' : 'off');
            camBtn.innerHTML = state.camEnabled ? ICONS.camOn : ICONS.camOff;
            camBtn.setAttribute('data-tooltip', state.camEnabled ? 'Turn Off Camera' : 'Turn On Camera');
        }
        if (screenBtn) {
            screenBtn.className = 'sr-dock-btn ' + (state.isScreenSharing ? 'active' : '');
            screenBtn.innerHTML = ICONS.screenShare;
            screenBtn.setAttribute('data-tooltip', state.isScreenSharing ? 'Stop Sharing' : 'Share Screen');
        }
    }

    // ------------------------------------------------------------------------
    // MODAL NAVIGATION (100% LAZY)
    // ------------------------------------------------------------------------
    function openStudyRoomsModal() {
        const modal = document.getElementById('study-rooms-modal');
        if (!modal) return;
        modal.style.display = 'block';
        document.body.classList.add('modal-open');

        const user = getAuthUser();
        state.myUsername = user.username;
        state.myDisplayName = user.displayName;
        state.myAvatar = user.avatar;

        if (state.activeRoomId) {
            switchModalView('active-room');
        } else {
            switchModalView('dashboard');
            loadPublicRoomsFeed();
        }
    }

    function closeStudyRoomsModal() {
        if (state.activeRoomId) {
            confirmLeaveRoom();
            return;
        }
        StudyRoomMediaController.releaseAllMedia();
        const modal = document.getElementById('study-rooms-modal');
        if (modal) modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }

    function switchModalView(viewName) {
        document.querySelectorAll('.sr-view-container').forEach(el => el.style.display = 'none');
        const target = document.getElementById(`sr-view-${viewName}`);
        if (target) target.style.display = 'flex';
    }

    function openPreJoinScreen(roomId, roomData, isHost) {
        switchModalView('prejoin');
        const titleEl = document.getElementById('sr-prejoin-room-name');
        const descEl = document.getElementById('sr-prejoin-room-desc');
        const hostEl = document.getElementById('sr-prejoin-host-name');
        const countEl = document.getElementById('sr-prejoin-member-count');
        const joinBtn = document.getElementById('sr-prejoin-join-btn');

        if (titleEl) titleEl.textContent = roomData.name || 'Study Room';
        if (descEl) descEl.textContent = roomData.description || 'Join live focus session';
        if (hostEl) hostEl.textContent = `Host: @${roomData.host}`;
        
        const count = Object.keys(roomData.members || {}).length;
        if (countEl) countEl.textContent = `Participants: ${count} / ${MAX_PARTICIPANTS}`;

        if (joinBtn) {
            joinBtn.onclick = () => {
                executeJoinTransaction(roomId, roomData);
            };
        }

        requestPreJoinMedia();
    }

    async function loadPublicRoomsFeed() {
        const feed = document.getElementById('sr-rooms-feed');
        if (!feed) return;
        const db = getDb();
        if (!db) return;

        feed.innerHTML = `<div style="color:var(--sr-text-muted); text-align:center; padding:30px;">Scanning active study rooms...</div>`;

        try {
            const snap = await db.ref('studyRooms').limitToLast(20).once('value');
            if (!snap.exists()) {
                feed.innerHTML = `<div style="color:var(--sr-text-muted); text-align:center; padding:30px;">No public study rooms open right now. Create one to start!</div>`;
                return;
            }

            const rooms = snap.val();
            let html = '';
            
            Object.keys(rooms).forEach(rId => {
                const r = rooms[rId];
                if (r.isPrivate) return;
                
                const memberList = Object.values(r.members || {});
                const memberCount = memberList.length;
                const isLocked = Boolean(r.isLocked);
                const studyingCount = memberList.filter(m => m.studyStatus === 'studying').length;

                html += `
                    <div class="sr-room-item-card">
                        <div class="sr-room-item-header">
                            <div>
                                <h4 class="sr-room-item-name">${escapeHtml(r.name)}</h4>
                                <div class="sr-room-item-host">Host: @${escapeHtml(r.host)}</div>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
                                <span class="sr-badge-pill sr-badge-members">${memberCount}/${MAX_PARTICIPANTS} Members</span>
                                ${isLocked ? `<span class="sr-badge-pill sr-badge-locked">${ICONS.lock} <span>Locked</span></span>` : ''}
                                ${studyingCount > 0 ? `<span class="sr-badge-pill sr-badge-timer">${ICONS.timerPulse} <span>${studyingCount} Studying</span></span>` : ''}
                            </div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:0.75rem; color:var(--sr-text-muted); font-family:monospace;">${rId}</span>
                            <button onclick="StudyRooms.joinRoom('${rId}')" class="sr-primary-btn" style="padding:8px 18px; font-size:0.85rem;" ${memberCount >= MAX_PARTICIPANTS ? 'disabled' : ''}>
                                ${memberCount >= MAX_PARTICIPANTS ? 'Full' : 'Join Room'}
                            </button>
                        </div>
                    </div>
                `;
            });

            feed.innerHTML = html || `<div style="color:var(--sr-text-muted); text-align:center; padding:30px;">No open public study rooms found. Create the first one!</div>`;
        } catch (e) {
            console.error('[StudyRooms] Error loading rooms feed:', e);
            feed.innerHTML = `<div style="color:var(--sr-text-muted); text-align:center; padding:30px;">Failed to load active rooms. Check connection.</div>`;
        }
    }

    // ------------------------------------------------------------------------
    // FRIENDS INVITATION MODAL
    // ------------------------------------------------------------------------
    async function openInviteFriendsModal() {
        if (!state.activeRoomId) return;
        const modal = document.getElementById('sr-invite-modal');
        const listEl = document.getElementById('sr-invite-friends-list');
        if (!modal || !listEl) return;

        modal.style.display = 'flex';
        listEl.innerHTML = `<div style="color:var(--sr-text-muted); text-align:center; padding:20px;">Loading friends list...</div>`;

        const db = getDb();
        if (!db) return;

        try {
            const snap = await db.ref(`friends/${state.myUsername}`).once('value');
            if (!snap.exists()) {
                listEl.innerHTML = `<div style="color:var(--sr-text-muted); text-align:center; padding:20px;">No friends found. Add friends to invite them to study meets!</div>`;
                return;
            }

            const friends = snap.val();
            const friendNames = Object.keys(friends);
            let html = '';

            for (const fName of friendNames) {
                html += `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.04); padding:10px 14px; border-radius:12px;">
                        <span style="font-weight:700;">@${escapeHtml(fName)}</span>
                        <button onclick="StudyRooms.sendInviteToFriend('${fName}')" class="sr-primary-btn" style="padding:6px 14px; font-size:0.8rem;">
                            ${ICONS.invite} <span>Invite</span>
                        </button>
                    </div>
                `;
            }

            listEl.innerHTML = html;
        } catch (err) {
            listEl.innerHTML = `<div style="color:var(--sr-text-muted); text-align:center; padding:20px;">Error loading friends.</div>`;
        }
    }

    function closeInviteFriendsModal() {
        const modal = document.getElementById('sr-invite-modal');
        if (modal) modal.style.display = 'none';
    }

    async function sendInviteToFriend(friendUsername) {
        if (!state.activeRoomId) {
            showNoticeDialog("You are not currently in an active study room.");
            return;
        }
        const db = getDb();
        if (!db) return;

        try {
            await db.ref(`notifications/${friendUsername.toLowerCase()}`).push({
                type: 'study_room_invite',
                from: state.myUsername,
                fromName: state.myDisplayName,
                roomId: state.activeRoomId,
                roomName: state.roomData?.name || 'Study Meet',
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                text: `${state.myDisplayName} invited you to a Group Study Meet!`
            });
            showNoticeDialog(`Invitation sent to @${friendUsername}!`);
        } catch (e) {
            showNoticeDialog(`Could not send invitation.`);
        }
    }

    function copyRoomCode() {
        if (!state.activeRoomId) return;
        navigator.clipboard.writeText(state.activeRoomId).then(() => {
            showNoticeDialog(`Room code copied: ${state.activeRoomId}`);
        }).catch(() => {
            showNoticeDialog(`Room code: ${state.activeRoomId}`);
        });
    }

    // ------------------------------------------------------------------------
    // MFFOCUS TIMER DIRECT PASSTHROUGH
    // ------------------------------------------------------------------------
    function toggleMffocusTimer() {
        if (typeof window.audioCtx !== 'undefined' && window.audioCtx) {
            if (window.audioCtx.state === 'suspended') window.audioCtx.resume();
        } else if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            try {
                const AC = window.AudioContext || window.webkitAudioContext;
                window.audioCtx = new AC();
            } catch(e){}
        }

        if (typeof window.MFFocusSession !== 'undefined' && typeof window.MFFocusSession.getState === 'function') {
            const s = window.MFFocusSession.getState();
            if (s.isRunning) {
                window.MFFocusSession.pause();
            } else if (s.task) {
                window.MFFocusSession.resume();
            } else {
                triggerStartGoalModal();
            }
            if (typeof window.updateDisplay === 'function') window.updateDisplay();
            checkAndSyncTimerState();
            return;
        }

        const isRunning = (typeof window.isRunning !== 'undefined') ? Boolean(window.isRunning) : false;
        const currentTask = (typeof window.currentTask !== 'undefined') ? window.currentTask : '';

        if (isRunning) {
            if (typeof window.pauseTimerAction === 'function') {
                window.pauseTimerAction();
            }
        } else {
            if (!currentTask) {
                triggerStartGoalModal();
            } else {
                if (typeof window.startTimerAction === 'function') {
                    window.startTimerAction();
                }
            }
        }

        if (typeof window.updateDisplay === 'function') {
            window.updateDisplay();
        }

        checkAndSyncTimerState();
    }

    function triggerStartGoalModal() {
        if (typeof window.openTaskModal === 'function') {
            window.openTaskModal();
        }
    }

    function triggerResetTimer() {
        if (typeof window.resetTimerSafe === 'function') {
            window.resetTimerSafe();
        } else if (typeof window.resetTimer === 'function') {
            window.resetTimer();
        } else if (typeof window.stopTimerLoop === 'function') {
            window.stopTimerLoop();
        }
        checkAndSyncTimerState();
    }

    // ------------------------------------------------------------------------
    // NOTICES & CONFIRMATION
    // ------------------------------------------------------------------------
    function showNoticeDialog(message) {
        const overlay = document.createElement('div');
        overlay.className = 'sr-dialog-overlay';
        overlay.innerHTML = `
            <div class="sr-dialog-box">
                <h3 class="sr-dialog-title">Study Rooms</h3>
                <p class="sr-dialog-desc">${escapeHtml(message)}</p>
                <div class="sr-dialog-actions">
                    <button class="sr-primary-btn" onclick="this.closest('.sr-dialog-overlay').remove()">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    function showCustomConfirmDialog(title, message, confirmBtnText, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'sr-dialog-overlay';
        overlay.innerHTML = `
            <div class="sr-dialog-box">
                <h3 class="sr-dialog-title">${escapeHtml(title)}</h3>
                <p class="sr-dialog-desc">${escapeHtml(message)}</p>
                <div class="sr-dialog-actions">
                    <button class="sr-secondary-btn" id="sr-dialog-cancel-btn">Cancel</button>
                    <button class="sr-danger-btn" id="sr-dialog-confirm-btn">${escapeHtml(confirmBtnText)}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('#sr-dialog-cancel-btn').onclick = () => overlay.remove();
        overlay.querySelector('#sr-dialog-confirm-btn').onclick = () => {
            overlay.remove();
            if (typeof onConfirm === 'function') onConfirm();
        };
    }

    // ------------------------------------------------------------------------
    // WINDOW UNLOAD & PAGE NAVIGATION CLEANUP
    // ------------------------------------------------------------------------
    window.addEventListener('beforeunload', () => {
        if (state.activeRoomId) {
            leaveRoom(true);
        } else {
            StudyRoomMediaController.releaseAllMedia();
        }
    });

    window.addEventListener('pagehide', () => {
        if (state.activeRoomId) {
            leaveRoom(true);
        } else {
            StudyRoomMediaController.releaseAllMedia();
        }
    });

    // ------------------------------------------------------------------------
    // PUBLIC API EXPORT
    // ------------------------------------------------------------------------
    window.StudyRooms = {
        open: openStudyRoomsModal,
        close: closeStudyRoomsModal,
        createRoom: createRoom,
        joinRoom: joinRoom,
        leaveRoom: confirmLeaveRoom,
        toggleMic: toggleMic,
        toggleCamera: toggleCamera,
        togglePreJoinMic: togglePreJoinMic,
        togglePreJoinCam: togglePreJoinCam,
        toggleScreenShare: toggleScreenShare,
        toggleDrawer: toggleDrawer,
        kickParticipant: kickParticipant,
        toggleRoomLock: toggleRoomLock,
        endRoom: confirmEndRoom,
        sendChatMessage: sendChatMessage,
        updateCharCounter: updateCharCounter,
        openInviteModal: openInviteFriendsModal,
        closeInviteModal: closeInviteFriendsModal,
        sendInviteToFriend: sendInviteToFriend,
        copyRoomCode: copyRoomCode,
        switchView: switchModalView,
        toggleGoalPrivacy: toggleGoalPrivacy,
        toggleTimerPanelMinimize: toggleTimerPanelMinimize,
        toggleMffocusTimer: toggleMffocusTimer,
        triggerStartGoalModal: triggerStartGoalModal,
        triggerResetTimer: triggerResetTimer,
        getMffocusTimerState: getMffocusTimerState,
        mediaController: StudyRoomMediaController,
        ICONS: ICONS
    };

})(window, document);
