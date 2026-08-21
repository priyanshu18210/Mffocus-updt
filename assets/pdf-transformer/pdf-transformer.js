/**
 * MFFOCUS — LOCAL PDF TRANSFORMER / PRINT OPTIMIZER
 * 100% Client-Side Privacy-First Document Engine
 * Architectural Overhaul: Canonical Page Model, Orientation Accuracy & Print Optimizer
 */

(function(window) {
    'use strict';

    // Strict 10 MB file size limit (10 * 1024 * 1024 bytes)
    const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
    const CM_TO_POINTS = 28.3465;

    // Standard A4 dimensions in points
    const A4_PORTRAIT = [595.28, 841.89];
    const A4_LANDSCAPE = [841.89, 595.28];

    class PdfTransformerEngine {
        constructor() {
            this.dependenciesLoaded = false;
            this.loadingDependenciesPromise = null;
            this.uiInitialized = false;

            // Session / Generation ID to cancel stale in-flight rendering
            this.renderSessionId = 0;
            
            // Canonical State (Single Source of Truth)
            this.currentFile = null;
            this.fileName = '';
            this.fileSize = 0;
            this.pdfDocProxy = null;
            this.totalPages = 0;
            
            // Canonical Page Model Array:
            // [{ id: 'page_1', sourcePageIndex: 0, originalPageNumber: 1, selected: true,
            //    originalRotation: 0, userRotation: 0, effectiveRotation: 0,
            //    aspectRatio: 1, thumbRendered: false, originalImageData: null, showingOriginal: false }]
            this.pages = [];
            
            this.activePreset = 'clean'; // 'original' | 'clean' | 'print_ready' | 'bw' | 'high_contrast' | 'invert'
            this.colorMode = 'colored'; // 'colored' | 'bw'
            this.rows = 2;
            this.cols = 2;
            this.orientation = 'portrait'; // 'portrait' | 'landscape'
            this.marginCm = 1.0;
            
            this.isProcessing = false;
            this.transformedBlob = null;
            this.transformedUrl = null;
            this.transformedPageCount = 0;

            this.dom = {};
        }

        /**
         * Lazy-load PDF.js and PDF-lib vendor libraries on demand
         */
        async loadDependencies() {
            if (this.dependenciesLoaded && window.pdfjsLib && window.PDFLib) {
                return true;
            }

            if (this.loadingDependenciesPromise) {
                return this.loadingDependenciesPromise;
            }

            this.loadingDependenciesPromise = (async () => {
                const loadScript = (src) => {
                    return new Promise((resolve, reject) => {
                        if (document.querySelector(`script[src="${src}"]`)) {
                            return resolve();
                        }
                        const script = document.createElement('script');
                        script.src = src;
                        script.async = true;
                        script.onload = () => resolve();
                        script.onerror = (e) => reject(new Error(`Failed to load script: ${src}`));
                        document.head.appendChild(script);
                    });
                };

                try {
                    await Promise.all([
                        loadScript('./assets/pdf-transformer/vendor/pdf.min.js'),
                        loadScript('./assets/pdf-transformer/vendor/pdf-lib.min.js')
                    ]);

                    if (window.pdfjsLib) {
                        window.pdfjsLib.GlobalWorkerOptions.workerSrc = './assets/pdf-transformer/vendor/pdf.worker.min.js';
                    }

                    this.dependenciesLoaded = true;
                    return true;
                } catch (err) {
                    console.error('Error lazy-loading PDF libraries:', err);
                    throw err;
                }
            })();

            return this.loadingDependenciesPromise;
        }

        /**
         * Initialize DOM references and bind UI event listeners (IDEMPOTENT)
         */
        initUI() {
            const modal = document.getElementById('pdf-transformer-modal');
            if (!modal) return;

            this.dom = {
                modal: modal,
                fileInput: document.getElementById('pt-file-input'),
                dropzone: document.getElementById('pt-dropzone'),
                errorBanner: document.getElementById('pt-error-banner'),
                errorText: document.getElementById('pt-error-text'),
                
                uploadView: document.getElementById('pt-upload-view'),
                workspaceView: document.getElementById('pt-workspace-view'),
                processingView: document.getElementById('pt-processing-view'),
                successView: document.getElementById('pt-success-view'),

                fileNameEl: document.getElementById('pt-file-name'),
                fileMetaEl: document.getElementById('pt-file-meta'),
                selectionBadge: document.getElementById('pt-selection-badge'),
                thumbnailsContainer: document.getElementById('pt-thumbnails-container'),

                presetBtns: document.querySelectorAll('.pt-preset-btn'),
                colorModeColoredBtn: document.getElementById('pt-colormode-colored'),
                colorModeBwBtn: document.getElementById('pt-colormode-bw'),
                rowsSelect: document.getElementById('pt-rows-select'),
                colsSelect: document.getElementById('pt-cols-select'),
                marginSelect: document.getElementById('pt-margin-select'),
                orientPortraitBtn: document.getElementById('pt-orient-portrait'),
                orientLandscapeBtn: document.getElementById('pt-orient-landscape'),
                sheetPreview: document.getElementById('pt-sheet-preview'),
                layoutSummaryText: document.getElementById('pt-layout-summary-text'),

                transformBtn: document.getElementById('pt-transform-btn'),
                btnWarningMsg: document.getElementById('pt-btn-warning-msg'),

                progressBarFill: document.getElementById('pt-progress-bar-fill'),
                progressPercent: document.getElementById('pt-progress-percent'),
                processingStep: document.getElementById('pt-processing-step'),

                successFileName: document.getElementById('pt-success-filename'),
                successSheets: document.getElementById('pt-success-sheets'),
                successPages: document.getElementById('pt-success-pages'),
                downloadBtn: document.getElementById('pt-download-btn'),
                resetBtn: document.getElementById('pt-reset-btn')
            };

            if (!this.uiInitialized) {
                this.bindEvents();
                this.uiInitialized = true;
            }

            this.updateLayoutPreview();
        }

        bindEvents() {
            // Drag and Drop
            const dropzone = this.dom.dropzone;
            if (dropzone) {
                ['dragenter', 'dragover'].forEach(eventName => {
                    dropzone.addEventListener(eventName, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        dropzone.classList.add('drag-over');
                    });
                });

                ['dragleave', 'drop'].forEach(eventName => {
                    dropzone.addEventListener(eventName, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        dropzone.classList.remove('drag-over');
                    });
                });

                dropzone.addEventListener('drop', (e) => {
                    const files = e.dataTransfer && e.dataTransfer.files;
                    if (files && files.length > 0) {
                        this.handleFileSelect(files[0]);
                    }
                });

                dropzone.addEventListener('click', () => {
                    if (this.dom.fileInput) {
                        this.dom.fileInput.value = '';
                        this.dom.fileInput.click();
                    }
                });
            }

            if (this.dom.fileInput) {
                this.dom.fileInput.addEventListener('change', (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        this.handleFileSelect(e.target.files[0]);
                    }
                });
            }

            // Selection Controls
            const btnSelectAll = document.getElementById('pt-btn-select-all');
            const btnSelectNone = document.getElementById('pt-btn-select-none');
            const btnInvertSelection = document.getElementById('pt-btn-invert-selection');

            if (btnSelectAll) btnSelectAll.addEventListener('click', () => this.selectAllPages(true));
            if (btnSelectNone) btnSelectNone.addEventListener('click', () => this.selectAllPages(false));
            if (btnInvertSelection) btnInvertSelection.addEventListener('click', () => this.invertSelection());

            // Preset Buttons
            if (this.dom.presetBtns) {
                this.dom.presetBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const preset = btn.getAttribute('data-preset');
                        this.setPreset(preset);
                    });
                });
            }

            // Color Mode Segmented Control
            if (this.dom.colorModeColoredBtn) {
                this.dom.colorModeColoredBtn.addEventListener('click', () => {
                    this.setColorMode('colored');
                });
            }
            if (this.dom.colorModeBwBtn) {
                this.dom.colorModeBwBtn.addEventListener('click', () => {
                    this.setColorMode('bw');
                });
            }

            // Layout Selects
            if (this.dom.rowsSelect) {
                this.dom.rowsSelect.addEventListener('change', (e) => {
                    this.rows = parseInt(e.target.value, 10) || 1;
                    this.updateLayoutPreview();
                });
            }

            if (this.dom.colsSelect) {
                this.dom.colsSelect.addEventListener('change', (e) => {
                    this.cols = parseInt(e.target.value, 10) || 1;
                    this.updateLayoutPreview();
                });
            }

            if (this.dom.marginSelect) {
                this.dom.marginSelect.addEventListener('change', (e) => {
                    this.marginCm = parseFloat(e.target.value) || 1.0;
                    this.updateLayoutPreview();
                });
            }

            // Orientation
            if (this.dom.orientPortraitBtn) {
                this.dom.orientPortraitBtn.addEventListener('click', () => {
                    this.setOrientation('portrait');
                });
            }
            if (this.dom.orientLandscapeBtn) {
                this.dom.orientLandscapeBtn.addEventListener('click', () => {
                    this.setOrientation('landscape');
                });
            }

            // Transform Action
            if (this.dom.transformBtn) {
                this.dom.transformBtn.addEventListener('click', () => {
                    this.processPdf();
                });
            }

            // Download & Reset
            if (this.dom.downloadBtn) {
                this.dom.downloadBtn.addEventListener('click', () => {
                    this.downloadPdf();
                });
            }
            if (this.dom.resetBtn) {
                this.dom.resetBtn.addEventListener('click', () => {
                    this.reset();
                });
            }

            // Global ESC key listener to close modal safely
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.dom.modal && this.dom.modal.style.display !== 'none') {
                    if (!this.isProcessing) {
                        window.closePdfTransformer();
                    }
                }
            });
        }

        showError(msg) {
            if (this.dom.errorBanner && this.dom.errorText) {
                this.dom.errorText.textContent = msg;
                this.dom.errorBanner.style.display = 'flex';
            }
        }

        hideError() {
            if (this.dom.errorBanner) {
                this.dom.errorBanner.style.display = 'none';
            }
        }

        /**
         * Immediate file validation & Canonical Model Initialization
         */
        async handleFileSelect(file) {
            this.hideError();

            if (!file) return;

            // Increment render session to abort any previous in-flight tasks
            const sessionId = ++this.renderSessionId;

            // 1. Validate Extension / MIME
            const fileName = file.name || '';
            const isPdfExt = fileName.toLowerCase().endsWith('.pdf');
            const isPdfMime = file.type === 'application/pdf' || file.type === '';

            if (!isPdfExt && !isPdfMime) {
                this.showError('Invalid file format. Please select a valid .pdf file.');
                return;
            }

            // 2. Strict 10 MB Limit
            if (file.size > MAX_FILE_SIZE_BYTES) {
                this.showError('PDF is too large. Please choose a PDF smaller than 10 MB.');
                return;
            }

            this.currentFile = file;
            this.fileName = fileName;
            this.fileSize = file.size;

            try {
                await this.loadDependencies();
                
                const arrayBuffer = await file.arrayBuffer();
                if (sessionId !== this.renderSessionId) return; // Stale session
                
                // Load PDF proxy via PDF.js
                const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
                this.pdfDocProxy = await loadingTask.promise;
                if (sessionId !== this.renderSessionId) return;

                this.totalPages = this.pdfDocProxy.numPages;
                if (this.totalPages < 1) {
                    throw new Error('This PDF has no pages.');
                }

                // --- ESTABLISH CANONICAL PAGE MODEL (Single Source of Truth) ---
                this.pages = [];
                for (let i = 0; i < this.totalPages; i++) {
                    this.pages.push({
                        id: `page_${i + 1}`,
                        sourcePageIndex: i, // 0-indexed
                        originalPageNumber: i + 1, // 1-indexed
                        selected: true,
                        originalRotation: 0, // will be discovered from pdfPage.rotate
                        userRotation: 0,
                        effectiveRotation: 0,
                        aspectRatio: 1 / 1.414,
                        thumbRendered: false,
                        originalImageData: null,
                        showingOriginal: false
                    });
                }

                // Switch to workspace view
                this.dom.uploadView.style.display = 'none';
                this.dom.workspaceView.style.display = 'grid';
                this.dom.processingView.style.display = 'none';
                this.dom.successView.style.display = 'none';

                // Populate file metadata
                if (this.dom.fileNameEl) this.dom.fileNameEl.textContent = this.fileName;
                if (this.dom.fileMetaEl) {
                    const sizeMB = (this.fileSize / (1024 * 1024)).toFixed(2);
                    this.dom.fileMetaEl.textContent = `${this.totalPages} pages · ${sizeMB} MB`;
                }

                this.updateSelectionUI();

                // 1. Build exact N DOM slots upfront (strict duplicate prevention)
                this.renderGallerySlots();

                // 2. Asynchronously populate canvases into their fixed DOM slots
                await this.renderThumbnailsAsync(sessionId);
            } catch (err) {
                console.error('Error loading PDF:', err);
                this.showError(`We couldn't process this PDF. ${err.message || 'Please try another file.'}`);
                this.reset();
            }
        }

        /**
         * Render exact N DOM slots upfront from Canonical Array (Zero Duplicates Guaranteed)
         */
        renderGallerySlots() {
            const container = this.dom.thumbnailsContainer;
            if (!container) return;

            container.innerHTML = '';

            for (let i = 0; i < this.pages.length; i++) {
                const pageModel = this.pages[i];

                const card = document.createElement('div');
                card.id = `pt-page-card-${pageModel.originalPageNumber}`;
                card.className = `pt-page-card ${pageModel.selected ? 'selected' : 'deselected'}`;
                card.setAttribute('data-page-index', pageModel.sourcePageIndex);
                card.setAttribute('data-page-num', pageModel.originalPageNumber);

                // Thumbnail Canvas Wrapper
                const thumbWrapper = document.createElement('div');
                thumbWrapper.className = 'pt-page-thumb-wrapper';
                thumbWrapper.id = `pt-thumb-wrapper-${pageModel.originalPageNumber}`;

                // Loading Skeleton
                const skeleton = document.createElement('div');
                skeleton.className = 'pt-page-skeleton';
                skeleton.id = `pt-skeleton-${pageModel.originalPageNumber}`;
                skeleton.textContent = `Page ${pageModel.originalPageNumber}`;
                thumbWrapper.appendChild(skeleton);

                // Canvas
                const canvas = document.createElement('canvas');
                canvas.className = 'pt-page-canvas';
                canvas.id = `pt-canvas-${pageModel.originalPageNumber}`;
                canvas.style.display = 'none';
                thumbWrapper.appendChild(canvas);

                // Checkbox Selection Badge
                const cbBadge = document.createElement('div');
                cbBadge.className = 'pt-page-cb-badge';
                cbBadge.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                thumbWrapper.appendChild(cbBadge);

                // Manual Rotation Badge (indicates +90°, +180°, etc.)
                const rotBadge = document.createElement('div');
                rotBadge.className = 'pt-rotation-badge';
                rotBadge.id = `pt-rot-badge-${pageModel.originalPageNumber}`;
                thumbWrapper.appendChild(rotBadge);

                // Footer (Page Num + Actions)
                const footer = document.createElement('div');
                footer.className = 'pt-page-footer';

                const pageNumEl = document.createElement('span');
                pageNumEl.className = 'pt-page-num';
                pageNumEl.textContent = `Page ${pageModel.originalPageNumber}`;

                const actions = document.createElement('div');
                actions.className = 'pt-page-actions';

                // Rotate CCW (-90)
                const btnCcw = document.createElement('button');
                btnCcw.className = 'pt-action-icon-btn';
                btnCcw.title = 'Rotate 90° Left';
                btnCcw.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>';
                btnCcw.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.rotatePage(pageModel.sourcePageIndex, -90);
                });

                // Rotate CW (+90)
                const btnCw = document.createElement('button');
                btnCw.className = 'pt-action-icon-btn';
                btnCw.title = 'Rotate 90° Right';
                btnCw.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>';
                btnCw.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.rotatePage(pageModel.sourcePageIndex, 90);
                });

                // Compare Original Toggle
                const btnCompare = document.createElement('button');
                btnCompare.className = 'pt-action-icon-btn';
                btnCompare.id = `pt-btn-compare-${pageModel.originalPageNumber}`;
                btnCompare.title = 'Hold or Click to Compare with Original';
                btnCompare.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
                btnCompare.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.togglePageCompare(pageModel.sourcePageIndex);
                });

                actions.appendChild(btnCcw);
                actions.appendChild(btnCw);
                actions.appendChild(btnCompare);

                footer.appendChild(pageNumEl);
                footer.appendChild(actions);

                card.appendChild(thumbWrapper);
                card.appendChild(footer);

                // Click card to toggle selection
                card.addEventListener('click', () => {
                    this.togglePageSelection(pageModel.sourcePageIndex);
                });

                container.appendChild(card);
            }
        }

        /**
         * Asynchronously render thumbnails into existing DOM slots with orientation precision
         */
        async renderThumbnailsAsync(sessionId) {
            if (!this.pdfDocProxy) return;

            for (let i = 0; i < this.pages.length; i++) {
                if (sessionId !== this.renderSessionId) return; // Stale session abort

                const pageModel = this.pages[i];
                await this.renderSingleThumbnail(pageModel, sessionId);
            }
        }

        async renderSingleThumbnail(pageModel, sessionId) {
            try {
                const pdfPage = await this.pdfDocProxy.getPage(pageModel.originalPageNumber);
                if (sessionId && sessionId !== this.renderSessionId) return;

                // Discover Intrinsic Rotation stored in PDF metadata
                pageModel.originalRotation = pdfPage.rotate || 0;
                pageModel.effectiveRotation = (pageModel.originalRotation + pageModel.userRotation) % 360;

                // Render at standard thumbnail scale (~0.45 scale for sharp retina previews)
                const viewport = pdfPage.getViewport({
                    scale: 0.45,
                    rotation: pageModel.effectiveRotation
                });

                pageModel.aspectRatio = viewport.width / viewport.height;

                const card = document.getElementById(`pt-page-card-${pageModel.originalPageNumber}`);
                const thumbWrapper = document.getElementById(`pt-thumb-wrapper-${pageModel.originalPageNumber}`);
                const skeleton = document.getElementById(`pt-skeleton-${pageModel.originalPageNumber}`);
                const canvas = document.getElementById(`pt-canvas-${pageModel.originalPageNumber}`);
                const rotBadge = document.getElementById(`pt-rot-badge-${pageModel.originalPageNumber}`);

                if (!canvas || !thumbWrapper) return;

                // Set dynamic aspect-ratio container matching true page dimensions
                thumbWrapper.style.aspectRatio = `${viewport.width} / ${viewport.height}`;

                canvas.width = Math.floor(viewport.width);
                canvas.height = Math.floor(viewport.height);

                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                await pdfPage.render({ canvasContext: ctx, viewport: viewport }).promise;
                if (sessionId && sessionId !== this.renderSessionId) return;

                // Cache unenhanced original pixel data for Before/After comparison
                pageModel.originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                pageModel.thumbRendered = true;

                // Apply active enhancement pipeline to canvas
                if (!pageModel.showingOriginal) {
                    this.applyPipeline(canvas, this.activePreset, this.colorMode);
                }

                // Show canvas & hide skeleton
                canvas.style.display = 'block';
                if (skeleton) skeleton.style.display = 'none';

                // Update Rotation Badge if user rotated
                if (rotBadge) {
                    if (pageModel.userRotation !== 0) {
                        rotBadge.textContent = `+${pageModel.userRotation}°`;
                        rotBadge.style.display = 'block';
                    } else {
                        rotBadge.style.display = 'none';
                    }
                }
            } catch (err) {
                console.warn(`Error rendering thumbnail for page ${pageModel.originalPageNumber}:`, err);
            }
        }

        togglePageSelection(pageIndex) {
            const pageModel = this.pages[pageIndex];
            if (!pageModel) return;

            pageModel.selected = !pageModel.selected;

            const card = document.getElementById(`pt-page-card-${pageModel.originalPageNumber}`);
            if (card) {
                card.classList.toggle('selected', pageModel.selected);
                card.classList.toggle('deselected', !pageModel.selected);
            }

            this.updateSelectionUI();
        }

        selectAllPages(select) {
            this.pages.forEach(p => { p.selected = select; });

            this.pages.forEach(p => {
                const card = document.getElementById(`pt-page-card-${p.originalPageNumber}`);
                if (card) {
                    card.classList.toggle('selected', select);
                    card.classList.toggle('deselected', !select);
                }
            });

            this.updateSelectionUI();
        }

        invertSelection() {
            this.pages.forEach(p => {
                p.selected = !p.selected;
                const card = document.getElementById(`pt-page-card-${p.originalPageNumber}`);
                if (card) {
                    card.classList.toggle('selected', p.selected);
                    card.classList.toggle('deselected', !p.selected);
                }
            });

            this.updateSelectionUI();
        }

        async rotatePage(pageIndex, deg) {
            const pageModel = this.pages[pageIndex];
            if (!pageModel || !this.pdfDocProxy) return;

            pageModel.userRotation = (pageModel.userRotation + deg + 360) % 360;
            pageModel.effectiveRotation = (pageModel.originalRotation + pageModel.userRotation) % 360;

            const sessionId = this.renderSessionId;
            await this.renderSingleThumbnail(pageModel, sessionId);
        }

        togglePageCompare(pageIndex) {
            const pageModel = this.pages[pageIndex];
            if (!pageModel || !pageModel.originalImageData) return;

            const canvas = document.getElementById(`pt-canvas-${pageModel.originalPageNumber}`);
            const btn = document.getElementById(`pt-btn-compare-${pageModel.originalPageNumber}`);
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            pageModel.showingOriginal = !pageModel.showingOriginal;

            if (pageModel.showingOriginal) {
                // Display raw original image data
                ctx.putImageData(pageModel.originalImageData, 0, 0);
                if (btn) btn.classList.add('compare-active');
            } else {
                // Restore enhanced version
                ctx.putImageData(pageModel.originalImageData, 0, 0);
                this.applyPipeline(canvas, this.activePreset, this.colorMode);
                if (btn) btn.classList.remove('compare-active');
            }
        }

        updateSelectionUI() {
            const selectedCount = this.pages.filter(p => p.selected).length;
            if (this.dom.selectionBadge) {
                this.dom.selectionBadge.textContent = `${selectedCount} of ${this.totalPages} selected`;
            }

            if (this.dom.transformBtn) {
                if (selectedCount === 0) {
                    this.dom.transformBtn.disabled = true;
                    if (this.dom.btnWarningMsg) {
                        this.dom.btnWarningMsg.style.display = 'block';
                        this.dom.btnWarningMsg.textContent = 'Select at least one page to continue.';
                    }
                } else {
                    this.dom.transformBtn.disabled = false;
                    if (this.dom.btnWarningMsg) {
                        this.dom.btnWarningMsg.style.display = 'none';
                    }
                }
            }
        }

        setColorMode(mode) {
            this.colorMode = mode;
            if (this.dom.colorModeColoredBtn) {
                this.dom.colorModeColoredBtn.classList.toggle('active', mode === 'colored');
            }
            if (this.dom.colorModeBwBtn) {
                this.dom.colorModeBwBtn.classList.toggle('active', mode === 'bw');
            }

            this.reapplyPresetToThumbnails();
        }

        setPreset(preset) {
            this.activePreset = preset;
            if (this.dom.presetBtns) {
                this.dom.presetBtns.forEach(btn => {
                    const bPreset = btn.getAttribute('data-preset');
                    btn.classList.toggle('active', bPreset === preset);
                });
            }

            this.reapplyPresetToThumbnails();
        }

        reapplyPresetToThumbnails() {
            for (let i = 0; i < this.pages.length; i++) {
                const pageModel = this.pages[i];
                if (!pageModel.thumbRendered || !pageModel.originalImageData) continue;

                const canvas = document.getElementById(`pt-canvas-${pageModel.originalPageNumber}`);
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    // Reset to original clean buffer
                    ctx.putImageData(pageModel.originalImageData, 0, 0);
                    pageModel.showingOriginal = false;
                    
                    const btn = document.getElementById(`pt-btn-compare-${pageModel.originalPageNumber}`);
                    if (btn) btn.classList.remove('compare-active');

                    // Apply active enhancement + color mode pipeline
                    this.applyPipeline(canvas, this.activePreset, this.colorMode);
                }
            }
        }

        setOrientation(orient) {
            this.orientation = orient;
            if (this.dom.orientPortraitBtn) {
                this.dom.orientPortraitBtn.classList.toggle('active', orient === 'portrait');
            }
            if (this.dom.orientLandscapeBtn) {
                this.dom.orientLandscapeBtn.classList.toggle('active', orient === 'landscape');
            }
            this.updateLayoutPreview();
        }

        updateLayoutPreview() {
            const preview = this.dom.sheetPreview;
            if (!preview) return;

            const isLandscape = this.orientation === 'landscape';
            preview.className = `pt-sheet-preview ${isLandscape ? 'landscape' : ''}`;
            preview.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
            preview.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;

            preview.innerHTML = '';
            const totalCells = this.rows * this.cols;
            for (let i = 1; i <= totalCells; i++) {
                const cell = document.createElement('div');
                cell.className = 'pt-sheet-cell';
                cell.textContent = i;
                preview.appendChild(cell);
            }

            if (this.dom.layoutSummaryText) {
                this.dom.layoutSummaryText.textContent = `${this.rows} × ${this.cols} (${totalCells} pages/sheet) · ${this.orientation.toUpperCase()}`;
            }
        }

        /**
         * =========================================================================
         * PROFESSIONAL PRINT ENHANCEMENT PIPELINE (100% LOCAL CANVAS ALGORITHMS)
         * =========================================================================
         */
        applyEnhancementFilter(canvas, preset) {
            if (preset === 'original') return;

            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const width = canvas.width;
            const height = canvas.height;
            const imgData = ctx.getImageData(0, 0, width, height);
            const data = imgData.data;
            const len = data.length;

            if (preset === 'clean') {
                /**
                 * 1. CLEAN NOTES (Default for lecture notes)
                 * - Whitens yellowish/gray background and shadow gradients.
                 * - Deepens pencil & pen handwriting for high contrast.
                 * - Preserves all original color annotations, highlighters, and diagrams.
                 */
                for (let i = 0; i < len; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

                    if (lum >= 175) {
                        // Smoothly whiten paper background to 255
                        const w = Math.min(1.0, Math.pow((lum - 175) / 80, 0.85));
                        data[i] = Math.min(255, r + (255 - r) * w);
                        data[i + 1] = Math.min(255, g + (255 - g) * w);
                        data[i + 2] = Math.min(255, b + (255 - b) * w);
                    } else if (lum <= 130) {
                        // Deepen pen / pencil ink
                        const d = Math.max(0.35, Math.pow(lum / 130, 0.45));
                        data[i] = Math.max(0, r * d);
                        data[i + 1] = Math.max(0, g * d);
                        data[i + 2] = Math.max(0, b * d);
                    } else {
                        // Gentle S-curve on midtones
                        const factor = (lum - 130) / (175 - 130);
                        const boost = 1.0 + (factor - 0.5) * 0.25;
                        data[i] = Math.min(255, Math.max(0, r * boost));
                        data[i + 1] = Math.min(255, Math.max(0, g * boost));
                        data[i + 2] = Math.min(255, Math.max(0, b * boost));
                    }
                }
            } else if (preset === 'print_ready') {
                /**
                 * 2. PRINT READY (Toner-saving, High-clarity student print mode)
                 * - Converts to optimized luminance with pure white paper.
                 * - Deepens handwriting and applies subtle 3x3 unsharp mask for formula sharpness.
                 */
                const lumBuffer = new Float32Array(width * height);
                for (let i = 0, p = 0; i < len; i += 4, p++) {
                    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                    if (lum >= 165) {
                        lumBuffer[p] = 255; // Pure white paper
                    } else if (lum <= 135) {
                        // Deep black ink
                        lumBuffer[p] = Math.max(0, (lum / 135) * 40);
                    } else {
                        const t = (lum - 135) / (165 - 135);
                        lumBuffer[p] = 40 + t * 215;
                    }
                }

                // Subtle 3x3 Unsharp Mask Sharpening on text edges
                for (let y = 1; y < height - 1; y++) {
                    for (let x = 1; x < width - 1; x++) {
                        const idx = y * width + x;
                        const center = lumBuffer[idx];
                        if (center > 10 && center < 240) {
                            const top = lumBuffer[(y - 1) * width + x];
                            const bottom = lumBuffer[(y + 1) * width + x];
                            const left = lumBuffer[y * width + (x - 1)];
                            const right = lumBuffer[y * width + (x + 1)];
                            
                            // Kernel: [0, -0.2, 0; -0.2, 1.8, -0.2; 0, -0.2, 0]
                            const sharp = center * 1.8 - (top + bottom + left + right) * 0.2;
                            lumBuffer[idx] = Math.min(255, Math.max(0, sharp));
                        }
                    }
                }

                for (let i = 0, p = 0; i < len; i += 4, p++) {
                    const v = Math.round(lumBuffer[p]);
                    data[i] = v;
                    data[i + 1] = v;
                    data[i + 2] = v;
                }
            } else if (preset === 'bw') {
                /**
                 * 3. BLACK & WHITE (Adaptive local thresholding)
                 * - Bradley-Roth inspired fast local binarization.
                 * - Preserves fine handwriting, fraction bars, superscripts, and math notation.
                 */
                const lumArr = new Float32Array(width * height);
                for (let i = 0, p = 0; i < len; i += 4, p++) {
                    lumArr[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                }

                // Fast Integral Image
                const integral = new Float64Array((width + 1) * (height + 1));
                for (let y = 0; y < height; y++) {
                    let rowSum = 0;
                    for (let x = 0; x < width; x++) {
                        rowSum += lumArr[y * width + x];
                        integral[(y + 1) * (width + 1) + (x + 1)] = integral[y * (width + 1) + (x + 1)] + rowSum;
                    }
                }

                const s = Math.max(4, Math.round(width / 32)); // Window radius
                const t = 0.88; // 12% darker than local average = ink

                for (let y = 0; y < height; y++) {
                    const y1 = Math.max(0, y - s);
                    const y2 = Math.min(height - 1, y + s);
                    for (let x = 0; x < width; x++) {
                        const x1 = Math.max(0, x - s);
                        const x2 = Math.min(width - 1, x + s);
                        const count = (x2 - x1 + 1) * (y2 - y1 + 1);

                        const sum = integral[(y2 + 1) * (width + 1) + (x2 + 1)]
                                  - integral[y1 * (width + 1) + (x2 + 1)]
                                  - integral[(y2 + 1) * (width + 1) + x1]
                                  + integral[y1 * (width + 1) + x1];

                        const localMean = sum / count;
                        const pixelLum = lumArr[y * width + x];
                        
                        // Check if pixel is ink or paper
                        const val = (pixelLum < localMean * t && pixelLum < 200) ? 0 : 255;
                        const idx = (y * width + x) * 4;
                        data[idx] = val;
                        data[idx + 1] = val;
                        data[idx + 2] = val;
                    }
                }
            } else if (preset === 'high_contrast') {
                /**
                 * 4. HIGH CONTRAST
                 */
                for (let i = 0; i < len; i += 4) {
                    for (let c = 0; c < 3; c++) {
                        let val = data[i + c];
                        val = (val - 128) * 1.6 + 128;
                        data[i + c] = Math.min(255, Math.max(0, val));
                    }
                }
            } else if (preset === 'invert') {
                /**
                 * 5. INVERT COLORS (Dark mode notes / chalkboard to white paper)
                 */
                for (let i = 0; i < len; i += 4) {
                    const invR = 255 - data[i];
                    const invG = 255 - data[i + 1];
                    const invB = 255 - data[i + 2];
                    const lum = 0.299 * invR + 0.587 * invG + 0.114 * invB;

                    if (lum >= 170) {
                        data[i] = 255;
                        data[i + 1] = 255;
                        data[i + 2] = 255;
                    } else if (lum <= 120) {
                        data[i] = Math.max(0, invR * 0.4);
                        data[i + 1] = Math.max(0, invG * 0.4);
                        data[i + 2] = Math.max(0, invB * 0.4);
                    } else {
                        data[i] = invR;
                        data[i + 1] = invG;
                        data[i + 2] = invB;
                    }
                }
            }

            ctx.putImageData(imgData, 0, 0);
        }

        /**
         * Unified Enhancement & Color Pipeline
         * Step 1: Apply selected enhancement preset (if not 'original')
         * Step 2: Apply Black & White conversion (if colorMode === 'bw')
         */
        applyPipeline(canvas, preset, colorMode) {
            if (preset && preset !== 'original') {
                this.applyEnhancementFilter(canvas, preset);
            }
            if (colorMode === 'bw') {
                this.applyBlackAndWhiteFilter(canvas);
            }
        }

        /**
         * High-Clarity Print-Ready Black & White Conversion
         * - Pure Rec. 601 luminance calculation for accurate tonal representation.
         * - Crisp background paper whitening (eliminates yellow/gray shadows and scanner tints).
         * - High-contrast ink deepening for bold, sharp, highly legible text and handwriting.
         * - Smooth midtone preservation curve protecting math formulas, superscripts, fractions, diagrams, and table lines.
         * - Adaptive 3x3 Laplacian edge sharpening eliminating blurry, washed-out gray text.
         * - Guaranteed true monochrome output (R === G === B).
         */
        applyBlackAndWhiteFilter(canvas) {
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const width = canvas.width;
            const height = canvas.height;
            const imgData = ctx.getImageData(0, 0, width, height);
            const data = imgData.data;
            const len = data.length;

            const lumBuffer = new Float32Array(width * height);
            for (let i = 0, p = 0; i < len; i += 4, p++) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const lum = 0.299 * r + 0.587 * g + 0.114 * b;

                if (lum >= 195) {
                    // Clean, pure white background paper
                    lumBuffer[p] = 255;
                } else if (lum <= 135) {
                    // Deep, rich black ink / handwriting / typed text
                    const norm = lum / 135;
                    lumBuffer[p] = Math.max(0, Math.pow(norm, 1.25) * 45);
                } else {
                    // Midtones: diagrams, formulas, fine pencil lines, tables
                    const t = (lum - 135) / (195 - 135);
                    lumBuffer[p] = 45 + t * (255 - 45);
                }
            }

            // Adaptive 3x3 Edge Sharpening on text/ink edges
            const sharpened = new Float32Array(width * height);
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = y * width + x;
                    const center = lumBuffer[idx];

                    if (x > 0 && x < width - 1 && y > 0 && y < height - 1 && center > 12 && center < 245) {
                        const top = lumBuffer[(y - 1) * width + x];
                        const bottom = lumBuffer[(y + 1) * width + x];
                        const left = lumBuffer[y * width + (x - 1)];
                        const right = lumBuffer[y * width + (x + 1)];

                        // Unsharp mask kernel: center * 1.6 - neighbors * 0.15
                        const sharpVal = center * 1.6 - (top + bottom + left + right) * 0.15;
                        sharpened[idx] = Math.min(255, Math.max(0, sharpVal));
                    } else {
                        sharpened[idx] = center;
                    }
                }
            }

            // Write back true monochrome channels
            for (let i = 0, p = 0; i < len; i += 4, p++) {
                const v = Math.round(sharpened[p]);
                data[i] = v;
                data[i + 1] = v;
                data[i + 2] = v;
            }

            ctx.putImageData(imgData, 0, 0);
        }

        /**
         * 100% Client-Side Multi-Page PDF Generation Engine
         */
        async processPdf() {
            if (this.isProcessing) return;

            const selectedPages = this.pages.filter(p => p.selected);
            if (selectedPages.length === 0) {
                this.showError('Please select at least one page to transform.');
                return;
            }

            this.isProcessing = true;

            // Switch to processing view
            this.dom.workspaceView.style.display = 'none';
            this.dom.processingView.style.display = 'flex';
            this.dom.successView.style.display = 'none';

            this.updateProgress(0, selectedPages.length, 'Initializing local transformation engine...');

            try {
                await this.loadDependencies();
                const PDFLib = window.PDFLib;
                if (!PDFLib) {
                    throw new Error('PDF-lib library unavailable.');
                }

                const outPdf = await PDFLib.PDFDocument.create();

                const isLandscape = this.orientation === 'landscape';
                const sheetDims = isLandscape ? A4_LANDSCAPE : A4_PORTRAIT;
                const sheetWidth = sheetDims[0];
                const sheetHeight = sheetDims[1];

                const marginPoints = this.marginCm * CM_TO_POINTS;
                const availWidth = sheetWidth - (2 * marginPoints);
                const availHeight = sheetHeight - (2 * marginPoints);

                const cols = this.cols;
                const rows = this.rows;
                const cellsPerSheet = rows * cols;
                const gap = 8; // points

                const cellWidth = (availWidth - (cols - 1) * gap) / cols;
                const cellHeight = (availHeight - (rows - 1) * gap) / rows;

                // Group selected pages into sheet batches
                const totalSheets = Math.ceil(selectedPages.length / cellsPerSheet);
                let processedCount = 0;

                for (let sheetIdx = 0; sheetIdx < totalSheets; sheetIdx++) {
                    const sheet = outPdf.addPage([sheetWidth, sheetHeight]);
                    const batch = selectedPages.slice(sheetIdx * cellsPerSheet, (sheetIdx + 1) * cellsPerSheet);

                    for (let cellIdx = 0; cellIdx < batch.length; cellIdx++) {
                        const pageModel = batch[cellIdx];
                        processedCount++;

                        const modeLabel = this.colorMode === 'bw' ? 'B&W' : 'COLORED';
                        this.updateProgress(
                            processedCount,
                            selectedPages.length,
                            `Processing page ${processedCount} of ${selectedPages.length} (${this.activePreset.toUpperCase()} · ${modeLabel})...`
                        );

                        // Yield event loop for responsive UI & smooth progress updates
                        await new Promise(r => setTimeout(r, 0));

                        // Render page at print-quality DPI (scale 2.0 = ~150-200 DPI for crisp A4 output)
                        const pdfPage = await this.pdfDocProxy.getPage(pageModel.originalPageNumber);
                        const renderScale = 2.0;
                        const viewport = pdfPage.getViewport({
                            scale: renderScale,
                            rotation: pageModel.effectiveRotation
                        });

                        const offscreenCanvas = document.createElement('canvas');
                        offscreenCanvas.width = Math.floor(viewport.width);
                        offscreenCanvas.height = Math.floor(viewport.height);

                        const offCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
                        await pdfPage.render({ canvasContext: offCtx, viewport: viewport }).promise;

                        // Apply the exact same enhancement + color mode pipeline as preview
                        this.applyPipeline(offscreenCanvas, this.activePreset, this.colorMode);

                        // Convert offscreen canvas to JPEG data URL for embedding
                        const dataUrl = offscreenCanvas.toDataURL('image/jpeg', 0.92);
                        const jpgBytes = await fetch(dataUrl).then(res => res.arrayBuffer());
                        const embeddedImg = await outPdf.embedJpg(jpgBytes);

                        // Calculate grid position (r, c)
                        const r = Math.floor(cellIdx / cols);
                        const c = cellIdx % cols;

                        // Fit image maintaining aspect ratio inside cell bounds
                        const imgAspect = viewport.width / viewport.height;
                        const cellAspect = cellWidth / cellHeight;

                        let fitW, fitH;
                        if (imgAspect > cellAspect) {
                            fitW = cellWidth;
                            fitH = cellWidth / imgAspect;
                        } else {
                            fitH = cellHeight;
                            fitW = cellHeight * imgAspect;
                        }

                        // Coordinates on sheet (PDF origin (0,0) is bottom-left)
                        const cellLeft = marginPoints + c * (cellWidth + gap);
                        const cellTop = sheetHeight - marginPoints - r * (cellHeight + gap);
                        
                        const drawX = cellLeft + (cellWidth - fitW) / 2;
                        const drawY = cellTop - cellHeight + (cellHeight - fitH) / 2;

                        sheet.drawImage(embeddedImg, {
                            x: drawX,
                            y: drawY,
                            width: fitW,
                            height: fitH
                        });

                        // Clear offscreen canvas immediately to free RAM
                        offscreenCanvas.width = 1;
                        offscreenCanvas.height = 1;
                    }
                }

                this.updateProgress(selectedPages.length, selectedPages.length, 'Generating final PDF document...');
                await new Promise(r => setTimeout(r, 40));

                const pdfBytes = await outPdf.save();
                this.transformedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
                this.transformedUrl = URL.createObjectURL(this.transformedBlob);
                this.transformedPageCount = totalSheets;

                // Show Success View
                this.dom.processingView.style.display = 'none';
                this.dom.successView.style.display = 'flex';

                const baseName = this.fileName.replace(/\.pdf$/i, '');
                const outputName = `${baseName}-transformed.pdf`;

                if (this.dom.successFileName) this.dom.successFileName.textContent = outputName;
                if (this.dom.successSheets) this.dom.successSheets.textContent = `${totalSheets} sheet${totalSheets > 1 ? 's' : ''}`;
                if (this.dom.successPages) this.dom.successPages.textContent = `${selectedPages.length} pages processed`;
            } catch (err) {
                console.error('Error during transformation:', err);
                this.showError(`Transformation failed: ${err.message || 'Please try again.'}`);
                this.dom.processingView.style.display = 'none';
                this.dom.workspaceView.style.display = 'grid';
            } finally {
                this.isProcessing = false;
            }
        }

        updateProgress(current, total, stepText) {
            const pct = total > 0 ? Math.round((current / total) * 100) : 0;
            if (this.dom.progressBarFill) this.dom.progressBarFill.style.width = `${pct}%`;
            if (this.dom.progressPercent) this.dom.progressPercent.textContent = `${pct}%`;
            if (this.dom.processingStep) this.dom.processingStep.textContent = stepText;
        }

        downloadPdf() {
            if (!this.transformedUrl || !this.transformedBlob) return;

            const baseName = this.fileName.replace(/\.pdf$/i, '');
            const outputName = `${baseName}-transformed.pdf`;

            const a = document.createElement('a');
            a.href = this.transformedUrl;
            a.download = outputName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        /**
         * Comprehensive reset & memory cleanup
         */
        reset() {
            // Cancel any in-flight rendering
            this.renderSessionId++;

            if (this.transformedUrl) {
                URL.revokeObjectURL(this.transformedUrl);
                this.transformedUrl = null;
            }
            this.transformedBlob = null;
            this.currentFile = null;
            this.fileName = '';
            this.fileSize = 0;
            this.pdfDocProxy = null;
            this.totalPages = 0;
            this.pages = [];
            this.isProcessing = false;
            this.colorMode = 'colored';
            if (this.dom.colorModeColoredBtn) this.dom.colorModeColoredBtn.classList.add('active');
            if (this.dom.colorModeBwBtn) this.dom.colorModeBwBtn.classList.remove('active');

            if (this.dom.fileInput) this.dom.fileInput.value = '';
            if (this.dom.thumbnailsContainer) this.dom.thumbnailsContainer.innerHTML = '';
            this.hideError();

            if (this.dom.uploadView) this.dom.uploadView.style.display = 'flex';
            if (this.dom.workspaceView) this.dom.workspaceView.style.display = 'none';
            if (this.dom.processingView) this.dom.processingView.style.display = 'none';
            if (this.dom.successView) this.dom.successView.style.display = 'none';
        }
    }

    // Global Instance
    window.pdfTransformer = new PdfTransformerEngine();

    // Global Navigation Open/Close helpers
    window.openPdfTransformer = async function() {
        // Ensure CSS is loaded
        if (!document.querySelector('link[href*="pdf-transformer.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = './assets/pdf-transformer/pdf-transformer.css';
            document.head.appendChild(link);
        }

        const modal = document.getElementById('pdf-transformer-modal');
        if (modal) {
            modal.style.setProperty('display', 'flex', 'important');
            document.body.classList.add('modal-open');
            window.pdfTransformer.initUI();
            
            // Background pre-warm dependencies
            window.pdfTransformer.loadDependencies().catch(() => {});
        }
    };

    window.closePdfTransformer = function() {
        const modal = document.getElementById('pdf-transformer-modal');
        if (modal) {
            modal.style.setProperty('display', 'none', 'important');
            let openCount = 0;
            document.querySelectorAll('.modal-overlay, .ns-modal-bg').forEach(m => {
                if (m.style.display && m.style.display !== 'none') openCount++;
            });
            if (openCount === 0) {
                document.body.classList.remove('modal-open');
            }
        }
    };

})(window);
