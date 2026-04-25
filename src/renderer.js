const state = {
  jobs: [],
  outputDir: "",
  running: false,
  canResume: false,
  zipPromptResolver: null,
  donePromptResolver: null,
  optimizePromptResolver: null,
  optimizeFiles: [],
  optimizationDrafts: [],
  optimizeZipVisible: false,
  optimizeZipBusy: false,
  optimizeZipProgress: 0,
  optimizeZipTimer: null,
  lastOptimizeQuality: 80,
  logDocked: false,
  previewMouseX: 0,
  previewMouseY: 0,
  previewMouseAt: 0,
  previewContextKey: "optimizeQuality"
};

const elements = {
  clearQueueButton: document.querySelector("#clearQueueButton"),
  pickOutputButton: document.querySelector("#pickOutputButton"),
  goToOutputLink: document.querySelector("#goToOutputLink"),
  saveZipButton: document.querySelector("#saveZipButton"),
  optimizeZipButton: document.querySelector("#optimizeZipButton"),
  brandLinkButton: document.querySelector("#brandLinkButton"),
  startButton: document.querySelector("#startButton"),
  runExportButton: document.querySelector("#runExportButton"),
  selectAllButton: document.querySelector("#selectAllButton"),
  applyAllFpsButton: document.querySelector("#applyAllFpsButton"),
  applySelectedFpsButton: document.querySelector("#applySelectedFpsButton"),
  queueCount: document.querySelector("#queueCount"),
  outputPathLabel: document.querySelector("#outputPathLabel"),
  summaryChip: document.querySelector("#summaryChip"),
  summaryChipLabel: document.querySelector("#summaryChipLabel"),
  progressCounter: document.querySelector("#progressCounter"),
  statusMessage: document.querySelector("#statusMessage"),
  completionHint: document.querySelector("#completionHint"),
  logShell: document.querySelector("#logShell"),
  queueTableBody: document.querySelector("#queueTableBody"),
  logPanel: document.querySelector("#logPanel"),
  logResizeHandle: document.querySelector("#logResizeHandle"),
  logCloseButton: document.querySelector("#logCloseButton"),
  logDockButton: document.querySelector("#logDockButton"),
  overwriteCheckbox: document.querySelector("#overwriteCheckbox"),
  bulkFpsInput: document.querySelector("#bulkFpsInput"),
  colorsInput: document.querySelector("#colorsInput"),
  renderProfileSelect: document.querySelector("#renderProfileSelect"),
  scaleModeSelect: document.querySelector("#scaleModeSelect"),
  sizePrimaryLabel: document.querySelector("#sizePrimaryLabel"),
  sizeSecondaryLabel: document.querySelector("#sizeSecondaryLabel"),
  widthInput: document.querySelector("#widthInput"),
  heightField: document.querySelector("#heightField"),
  heightInput: document.querySelector("#heightInput"),
  experimentalPanel: document.querySelector("#experimentalPanel"),
  experimentalDitherSelect: document.querySelector("#experimentalDitherSelect"),
  experimentalStatsModeSelect: document.querySelector("#experimentalStatsModeSelect"),
  experimentalDiffModeSelect: document.querySelector("#experimentalDiffModeSelect"),
  experimentalBayerMatrixWrap: document.querySelector("#experimentalBayerMatrixWrap"),
  experimentalBayerMatrixSelect: document.querySelector("#experimentalBayerMatrixSelect"),
  experimentalDitherStrengthInput: document.querySelector("#experimentalDitherStrengthInput"),
  experimentalDitherStrengthValue: document.querySelector("#experimentalDitherStrengthValue"),
  experimentalNoiseProtectInput: document.querySelector("#experimentalNoiseProtectInput"),
  experimentalNoiseProtectValue: document.querySelector("#experimentalNoiseProtectValue"),
  experimentalFlatProtectInput: document.querySelector("#experimentalFlatProtectInput"),
  experimentalFlatProtectValue: document.querySelector("#experimentalFlatProtectValue"),
  experimentalEdgeBiasInput: document.querySelector("#experimentalEdgeBiasInput"),
  experimentalEdgeBiasValue: document.querySelector("#experimentalEdgeBiasValue"),
  experimentalTemporalStableSelect: document.querySelector("#experimentalTemporalStableSelect"),
  experimentalRetroCrtSelect: document.querySelector("#experimentalRetroCrtSelect"),
  experimentalPosterizeInput: document.querySelector("#experimentalPosterizeInput"),
  experimentalPosterizeValue: document.querySelector("#experimentalPosterizeValue"),
  experimentalAdaptiveSelect: document.querySelector("#experimentalAdaptiveSelect"),
  applySelectedQualityButton: document.querySelector("#applySelectedQualityButton"),
  dropZone: document.querySelector("#dropZone"),
  optimizePrompt: document.querySelector("#optimizePrompt"),
  optimizeList: document.querySelector("#optimizeList"),
  optimizeSelectAll: document.querySelector("#optimizeSelectAll"),
  optimizePercentInput: document.querySelector("#optimizePercentInput"),
  optimizePreviewInfoButton: document.querySelector("#optimizePreviewInfoButton"),
  optimizeCloseButton: document.querySelector("#optimizeCloseButton"),
  optimizeRunButton: document.querySelector("#optimizeRunButton"),
  optimizeContinueButton: document.querySelector("#optimizeContinueButton"),
  zipPrompt: document.querySelector("#zipPrompt"),
  zipYesButton: document.querySelector("#zipYesButton"),
  zipNoButton: document.querySelector("#zipNoButton"),
  confirmPromptTitle: document.querySelector("#confirmPromptTitle"),
  confirmPromptHeading: document.querySelector("#confirmPromptHeading"),
  confirmPromptCopy: document.querySelector("#confirmPromptCopy"),
  donePrompt: document.querySelector("#donePrompt"),
  donePromptText: document.querySelector("#donePromptText"),
  doneOkButton: document.querySelector("#doneOkButton"),
  topResumeButton: document.querySelector("#topResumeButton"),
  topStopButton: document.querySelector("#topStopButton"),
  qualityPreviewBubble: document.querySelector("#qualityPreviewBubble"),
  qualityPreviewTitle: document.querySelector("#qualityPreviewTitle"),
  qualityPreviewCopy: document.querySelector("#qualityPreviewCopy"),
  qualityPreviewOriginalLabel: document.querySelector("#qualityPreviewOriginalLabel"),
  qualityPreviewOriginalVideo: document.querySelector("#qualityPreviewOriginalVideo"),
  qualityPreviewAdjustedVideo: document.querySelector("#qualityPreviewAdjustedVideo"),
  qualityPreviewAdjustedFrame: document.querySelector("#qualityPreviewAdjustedFrame"),
  qualityPreviewAdjustedLabel: document.querySelector("#qualityPreviewAdjustedLabel"),
  previewInfoButtons: document.querySelectorAll(".preview-info-button")
};

function getDefaultFps() {
  const fps = Number(elements.bulkFpsInput.value) || 15;
  return Math.max(1, Math.min(60, fps));
}

function getParentDir(inputPath) {
  return inputPath.replace(/[\\/][^\\/]+$/, "");
}

function ensureOutputDir(seedPath) {
  if (state.outputDir || !seedPath) {
    return;
  }

  state.outputDir = `${getParentDir(seedPath)}\\gif-exports`;
  elements.outputPathLabel.textContent = state.outputDir;
  elements.goToOutputLink.disabled = false;
  addLog(`Default output folder set: ${state.outputDir}`);
}

function makeJob(inputPath, previewUrl = "") {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    inputPath,
    fileName: inputPath.split(/[/\\]/).pop(),
    previewUrl,
    fps: getDefaultFps(),
    renderSettings: null,
    optimizedOnce: false,
    selected: false,
    status: "waiting",
    progress: 0,
    outputPath: "",
    error: ""
  };
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function toFileUrl(filePath) {
  const normalized = String(filePath).replace(/\\/g, "/");
  return encodeURI(`file:///${normalized}`);
}

function updateStatus(message, tone = "ready") {
  elements.statusMessage.textContent = message;
  const textColors = {
    ready: "#2a6b3f",
    warn: "#8d6a1d",
    error: "#8a2b24"
  };
  elements.statusMessage.style.background = "transparent";
  elements.statusMessage.style.color = textColors[tone];
}

function updateCompletionHint(message) {
  if (elements.completionHint) {
    elements.completionHint.textContent = message;
  }
}

function getLogTone(message) {
  const text = String(message).toLowerCase();
  if (
    text.includes("error") ||
    text.includes("failed") ||
    text.includes("cancelled")
  ) {
    return "error";
  }
  if (
    text.includes("success") ||
    text.includes("ready") ||
    text.includes("saved") ||
    text.includes("created") ||
    text.includes("converted to gif successfully") ||
    text.includes("optimized gifs were saved")
  ) {
    return "success";
  }
  return "default";
}

function addLog(message) {
  const item = document.createElement("div");
  item.className = `log-entry log-entry-${getLogTone(message)}`;
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  item.innerHTML = `<div>${escapeHtml(message)}</div><div class="log-time">${timestamp}</div>`;
  elements.logPanel.prepend(item);
}

function setLogDocked(isDocked) {
  state.logDocked = isDocked;
  elements.logShell.classList.toggle("hidden", isDocked);
  elements.logDockButton.classList.toggle("hidden", !isDocked);
}

function enableLogResize() {
  if (!elements.logResizeHandle) {
    return;
  }

  let active = null;

  const handleMove = (event) => {
    if (!active) {
      return;
    }

    const width = Math.max(
      240,
      Math.min(window.innerWidth - 32, active.width + (event.clientX - active.startX))
    );
    const height = Math.max(
      92,
      Math.min(window.innerHeight - 32, active.height + (event.clientY - active.startY))
    );

    elements.logShell.style.left = `${active.left}px`;
    elements.logShell.style.top = `${active.top}px`;
    elements.logShell.style.right = "auto";
    elements.logShell.style.bottom = "auto";
    elements.logShell.style.width = `${width}px`;
    elements.logShell.style.height = `${height}px`;
  };

  const stopResize = () => {
    if (!active) {
      return;
    }
    active = null;
    elements.logShell.classList.remove("is-resizing");
    document.removeEventListener("mousemove", handleMove);
    document.removeEventListener("mouseup", stopResize);
  };

  elements.logResizeHandle.addEventListener("mousedown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = elements.logShell.getBoundingClientRect();
    active = {
      startX: event.clientX,
      startY: event.clientY,
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top
    };
    elements.logShell.classList.add("is-resizing");
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", stopResize);
  });
}

function getCompletedGifJobs() {
  return state.jobs.filter((job) => job.status === "done" && job.outputPath);
}

function getSingleCompletedJob() {
  const completedJobs = getCompletedGifJobs();
  return completedJobs.length === 1 ? completedJobs[0] : null;
}

function setOptimizeZipProgress(value) {
  state.optimizeZipProgress = Math.max(0, Math.min(100, value));
  elements.optimizeZipButton.style.setProperty(
    "--progress-action-progress",
    `${state.optimizeZipProgress}%`
  );
}

function updateOptimizeZipButton() {
  const completedJobs = getCompletedGifJobs();
  const singleCompletedJob = completedJobs.length === 1 ? completedJobs[0] : null;
  const hasPendingOptimize = completedJobs.some((job) => !job.optimizedOnce);
  const shouldShow = state.optimizeZipVisible && completedJobs.length > 0;
  elements.optimizeZipButton.classList.toggle("hidden", !shouldShow);
  elements.optimizeZipButton.disabled =
    !shouldShow ||
    state.running ||
    state.optimizeZipBusy ||
    (!singleCompletedJob && !hasPendingOptimize);
  elements.optimizeZipButton.classList.toggle("is-busy", state.optimizeZipBusy);
  elements.optimizeZipButton.querySelector(".progress-action-label").textContent = state.optimizeZipBusy
    ? singleCompletedJob
      ? "Optimizing GIF"
      : "Optimizing ZIP"
    : singleCompletedJob
      ? "Optimize GIF"
      : "Optimize ZIP";
  if (!state.optimizeZipBusy && !shouldShow) {
    setOptimizeZipProgress(0);
  }
}

function startOptimizeZipProgress() {
  clearInterval(state.optimizeZipTimer);
  setOptimizeZipProgress(8);
  state.optimizeZipTimer = setInterval(() => {
    if (!state.optimizeZipBusy) {
      clearInterval(state.optimizeZipTimer);
      state.optimizeZipTimer = null;
      return;
    }
    setOptimizeZipProgress(Math.min(92, state.optimizeZipProgress + 4));
  }, 180);
}

function stopOptimizeZipProgress(done = false) {
  clearInterval(state.optimizeZipTimer);
  state.optimizeZipTimer = null;
  setOptimizeZipProgress(done ? 100 : 0);
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getOptimizePreviewSourcePath() {
  const selectedQueueJob = state.jobs.find((job) => job.selected && job.inputPath);
  if (selectedQueueJob?.inputPath) {
    return selectedQueueJob.inputPath;
  }

  const selectedOptimizeFile =
    state.optimizeFiles.find((item) => item.selected)?.filePath ||
    state.optimizeFiles[0]?.filePath;

  if (selectedOptimizeFile) {
    const matchingJob = state.jobs.find((job) => job.outputPath === selectedOptimizeFile);
    if (matchingJob?.inputPath) {
      return matchingJob.inputPath;
    }
  }

  return state.jobs[0]?.inputPath || "";
}

function updateQualityPreviewBubble() {
  const previewSourcePath = getOptimizePreviewSourcePath();
  const previewSourceUrl = previewSourcePath ? toFileUrl(previewSourcePath) : "";
  applyPreviewConfig(state.previewContextKey);

  if (previewSourceUrl) {
    if (elements.qualityPreviewOriginalVideo.src !== previewSourceUrl) {
      elements.qualityPreviewOriginalVideo.src = previewSourceUrl;
    }
    if (elements.qualityPreviewAdjustedVideo.src !== previewSourceUrl) {
      elements.qualityPreviewAdjustedVideo.src = previewSourceUrl;
    }
  } else {
    elements.qualityPreviewOriginalVideo.removeAttribute("src");
    elements.qualityPreviewAdjustedVideo.removeAttribute("src");
  }
}

function syncExperimentalValueLabels() {
  elements.experimentalDitherStrengthValue.textContent = elements.experimentalDitherStrengthInput.value;
  elements.experimentalNoiseProtectValue.textContent = elements.experimentalNoiseProtectInput.value;
  elements.experimentalFlatProtectValue.textContent = elements.experimentalFlatProtectInput.value;
  elements.experimentalEdgeBiasValue.textContent = elements.experimentalEdgeBiasInput.value;
  elements.experimentalPosterizeValue.textContent = elements.experimentalPosterizeInput.value;
}

function getPreviewConfigForKey(key) {
  const renderMode = elements.renderProfileSelect.value;
  const renderModeLabel =
    elements.renderProfileSelect.options[elements.renderProfileSelect.selectedIndex]?.text || "Clean";
  const configs = {
    optimizeQuality: {
      title: "Keep quality %",
      copy: "Left shows the original look. Right shows the current quality value.",
      leftLabel: "100",
      rightLabel: String(Math.max(0, Math.min(100, Number(elements.optimizePercentInput.value) || 0))),
      strength: 100 - Math.max(0, Math.min(100, Number(elements.optimizePercentInput.value) || 0)),
        contrastBoost: 0,
        saturateDrop: 0,
        brightnessDrop: 0,
        scanlines: false
      },
      renderMode: {
        title: "Render mode",
        copy:
          renderMode === "clean"
            ? "Compare the original video against the clean render profile."
            : "Compare the current render profile against Clean before exporting.",
        leftLabel: renderMode === "clean" ? "Original" : "Clean",
        rightLabel: renderModeLabel,
        strength:
          renderMode === "clean"
            ? 18
            : renderMode === "detail"
            ? 44
            : renderMode === "retro"
              ? 74
              : renderMode === "stable"
                ? 34
                : renderMode === "experimental"
                  ? 88
                  : 12,
        contrastBoost:
          renderMode === "detail"
            ? 0.08
            : renderMode === "retro"
              ? 0.18
              : renderMode === "stable"
                ? 0.04
                : renderMode === "experimental"
                  ? 0.22
                  : 0,
        saturateDrop:
          renderMode === "retro"
            ? 0.18
            : renderMode === "stable"
              ? 0.08
              : renderMode === "experimental"
                ? 0.2
                : 0.04,
        brightnessDrop:
          renderMode === "retro"
            ? 0.08
            : renderMode === "experimental"
              ? 0.06
              : 0.02,
        scanlines: renderMode === "retro" || renderMode === "experimental"
      },
      baseAlgorithm: {
        title: "Base algorithm",
        copy: "Clean compares against the selected base algorithm so you can see the texture pattern change.",
        leftLabel: "Clean",
      rightLabel: elements.experimentalDitherSelect.options[elements.experimentalDitherSelect.selectedIndex].text,
      strength:
        elements.experimentalDitherSelect.value === "floyd_steinberg"
          ? 46
          : elements.experimentalDitherSelect.value === "bayer"
            ? 62
            : elements.experimentalDitherSelect.value === "adaptive"
              ? 38
              : 28,
      contrastBoost: elements.experimentalDitherSelect.value === "floyd_steinberg" ? 0.12 : 0.05,
      saturateDrop: elements.experimentalDitherSelect.value === "bayer" ? 0.12 : 0.04,
      brightnessDrop: 0.04,
      scanlines: false
    },
      paletteMode: {
        title: "Palette mode",
        copy: "Compare the selected palette behavior against a clean baseline.",
        leftLabel: "Clean",
        rightLabel: elements.experimentalStatsModeSelect.value,
        strength: elements.experimentalStatsModeSelect.value === "full" ? 22 : elements.experimentalStatsModeSelect.value === "single" ? 12 : 34,
        contrastBoost: 0.04,
        saturateDrop: 0.02,
        brightnessDrop: 0.02,
        scanlines: false
      },
      motionHandling: {
        title: "Motion handling",
        copy: "Compare the selected motion behavior against a clean baseline.",
        leftLabel: "Clean",
        rightLabel: elements.experimentalDiffModeSelect.value === "rectangle" ? "Stable" : "Dynamic",
        strength: elements.experimentalDiffModeSelect.value === "rectangle" ? 18 : 32,
        contrastBoost: 0.03,
        saturateDrop: 0.03,
        brightnessDrop: 0.01,
        scanlines: false
      },
      bayerMatrix: {
        title: "Bayer matrix",
        copy: "Compare the selected Bayer size against a clean baseline.",
        leftLabel: "Clean",
        rightLabel: elements.experimentalBayerMatrixSelect.value,
        strength:
          elements.experimentalBayerMatrixSelect.value === "8x8"
          ? 72
          : elements.experimentalBayerMatrixSelect.value === "4x4"
            ? 54
            : 34,
      contrastBoost: 0.05,
      saturateDrop: 0.08,
      brightnessDrop: 0.02,
      scanlines: false
    },
      ditherStrength: {
        title: "Dither strength",
        copy: "Compare the selected dither amount against a clean baseline.",
        leftLabel: "Clean",
        rightLabel: elements.experimentalDitherStrengthInput.value,
        strength: Number(elements.experimentalDitherStrengthInput.value),
        contrastBoost: Number(elements.experimentalDitherStrengthInput.value) / 900,
      saturateDrop: Number(elements.experimentalDitherStrengthInput.value) / 1100,
      brightnessDrop: Number(elements.experimentalDitherStrengthInput.value) / 1600,
      scanlines: false
    },
      noiseProtect: {
        title: "Noise protect",
        copy: "Compare the selected dark-area protection against a clean baseline.",
        leftLabel: "Clean",
        rightLabel: elements.experimentalNoiseProtectInput.value,
        strength: Number(elements.experimentalNoiseProtectInput.value) / 3.2,
        contrastBoost: -Number(elements.experimentalNoiseProtectInput.value) / 1800,
      saturateDrop: Number(elements.experimentalNoiseProtectInput.value) / 1200,
      brightnessDrop: 0,
      scanlines: false
    },
      flatAreaProtect: {
        title: "Flat area protect",
        copy: "Compare the selected flat-area cleanup against a clean baseline.",
        leftLabel: "Clean",
        rightLabel: elements.experimentalFlatProtectInput.value,
        strength: Number(elements.experimentalFlatProtectInput.value) / 2.7,
        contrastBoost: 0.02,
      saturateDrop: Number(elements.experimentalFlatProtectInput.value) / 1500,
      brightnessDrop: 0.01,
      scanlines: false
    },
      edgeBias: {
        title: "Edge bias",
        copy: "Compare the selected edge emphasis against a clean baseline.",
        leftLabel: "Clean",
        rightLabel: elements.experimentalEdgeBiasInput.value,
        strength: Number(elements.experimentalEdgeBiasInput.value) / 3,
        contrastBoost: Number(elements.experimentalEdgeBiasInput.value) / 600,
      saturateDrop: 0.02,
      brightnessDrop: 0.01,
      scanlines: false
    },
      temporalStable: {
        title: "Temporal stable",
        copy: "Compare the selected temporal stability against a clean baseline.",
        leftLabel: "Clean",
        rightLabel: elements.experimentalTemporalStableSelect.value === "on" ? "On" : "Off",
        strength: elements.experimentalTemporalStableSelect.value === "on" ? 16 : 32,
        contrastBoost: 0.03,
      saturateDrop: 0.03,
      brightnessDrop: 0.01,
      scanlines: false
    },
      retroCrt: {
        title: "Retro CRT Bayer",
        copy: "Compare the retro treatment against a clean baseline.",
        leftLabel: "Clean",
        rightLabel: elements.experimentalRetroCrtSelect.value === "on" ? "On" : "Off",
        strength: elements.experimentalRetroCrtSelect.value === "on" ? 64 : 28,
        contrastBoost: elements.experimentalRetroCrtSelect.value === "on" ? 0.16 : 0.05,
      saturateDrop: elements.experimentalRetroCrtSelect.value === "on" ? 0.12 : 0.04,
      brightnessDrop: 0.03,
      scanlines: elements.experimentalRetroCrtSelect.value === "on"
    },
      posterizeDither: {
        title: "Posterize + Dither",
        copy: "Compare the selected posterize amount against a clean baseline.",
        leftLabel: "Clean",
        rightLabel: elements.experimentalPosterizeInput.value,
        strength: Number(elements.experimentalPosterizeInput.value) * 11,
        contrastBoost: Number(elements.experimentalPosterizeInput.value) / 160,
      saturateDrop: Number(elements.experimentalPosterizeInput.value) / 180,
      brightnessDrop: Number(elements.experimentalPosterizeInput.value) / 400,
      scanlines: false
    },
      adaptiveDither: {
        title: "Adaptive dither",
        copy: "Compare adaptive behavior against a clean baseline.",
        leftLabel: "Clean",
        rightLabel: elements.experimentalAdaptiveSelect.value === "on" ? "On" : "Off",
        strength: elements.experimentalAdaptiveSelect.value === "on" ? 40 : 26,
        contrastBoost: 0.06,
      saturateDrop: 0.05,
      brightnessDrop: 0.02,
      scanlines: false
    }
  };

  return configs[key] || configs.optimizeQuality;
}

function applyPreviewConfig(key) {
  const config = getPreviewConfigForKey(key);
  const effectStrength = Math.max(0, Math.min(100, Number(config.strength) || 0));
  const contrast = 1 + effectStrength / 260 + (config.contrastBoost || 0);
  const saturate = 1 - effectStrength / 240 - (config.saturateDrop || 0);
  const brightness = 1 - effectStrength / 500 - (config.brightnessDrop || 0);
  const adjustedFilter = `contrast(${Math.max(0.7, contrast)}) saturate(${Math.max(0.35, saturate)}) brightness(${Math.max(0.65, brightness)})`;

  elements.qualityPreviewTitle.textContent = config.title;
  elements.qualityPreviewCopy.textContent = config.copy || "";
  elements.qualityPreviewOriginalLabel.textContent = config.leftLabel || "Before";
  elements.qualityPreviewAdjustedLabel.textContent = config.rightLabel || "After";
  elements.qualityPreviewAdjustedFrame.style.setProperty("--preview-strength", String(effectStrength));
  elements.qualityPreviewAdjustedFrame.classList.toggle("preview-scanlines", Boolean(config.scanlines));
  elements.qualityPreviewOriginalVideo.style.filter = "none";
  elements.qualityPreviewAdjustedVideo.style.filter = adjustedFilter;
}

function closeQualityPreviewBubble() {
  elements.qualityPreviewBubble.classList.add("hidden");
}

function refreshQualityPreviewBubbleIfOpen() {
  if (!elements.qualityPreviewBubble.classList.contains("hidden")) {
    updateQualityPreviewBubble();
  }
}

function positionQualityPreviewBubble(clientX, clientY) {
  const offsetX = 22;
  const offsetY = 10;
  const reserveRight = 180;
  const bubbleWidth = elements.qualityPreviewBubble.offsetWidth || 760;
  const bubbleHeight = elements.qualityPreviewBubble.offsetHeight || 420;
  const left = Math.min(
    clientX + offsetX,
    window.innerWidth - bubbleWidth - reserveRight
  );
  const top = Math.min(clientY + offsetY, window.innerHeight - bubbleHeight - 12);
  elements.qualityPreviewBubble.style.left = `${Math.max(12, left)}px`;
  elements.qualityPreviewBubble.style.top = `${Math.max(12, top)}px`;
}

function toggleQualityPreviewBubble(event) {
  if (!elements.qualityPreviewBubble.classList.contains("hidden")) {
    closeQualityPreviewBubble();
    return;
  }

  updateQualityPreviewBubble();
  state.previewMouseX = event.clientX;
  state.previewMouseY = event.clientY;
  state.previewMouseAt = performance.now();
  elements.qualityPreviewBubble.classList.remove("hidden");
  positionQualityPreviewBubble(event.clientX, event.clientY);
}

function updateSummary() {
  const doneCount = state.jobs.filter((job) => job.status === "done").length;
  const totalCount = state.jobs.length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const completedJobs = getCompletedGifJobs();
  const singleCompletedJob = completedJobs.length === 1 ? completedJobs[0] : null;
  if (elements.queueCount) {
    elements.queueCount.textContent =
      totalCount === 0
        ? ""
        : `${totalCount} videos in queue, ${doneCount} completed.`;
  }
  elements.summaryChipLabel.textContent = `${totalCount} jobs`;
  elements.progressCounter.textContent = `${doneCount} / ${totalCount} completed`;
  elements.summaryChip.style.setProperty("--completion-progress", `${progressPercent}%`);
  elements.summaryChip.classList.toggle("is-running", state.running && doneCount < totalCount);
  elements.saveZipButton.textContent = singleCompletedJob ? "Save GIF File" : "Save ZIP File";
  elements.saveZipButton.disabled = completedJobs.length === 0 || state.running || state.optimizeZipBusy;
  updateOptimizeZipButton();
}

function renderQueue() {
  if (state.jobs.length === 0) {
    elements.queueTableBody.innerHTML =
      '<tr class="empty-row"><td colspan="6"></td></tr>';
    updateSummary();
    return;
  }

  elements.queueTableBody.innerHTML = state.jobs
    .map((job) => {
      const statusLabels = {
        waiting: "Waiting",
        running: "Converting",
        done: "Completed",
        error: "Error",
        cancelled: "Cancelled"
      };

      const previewInner =
        job.status === "done" && job.outputPath
          ? `<img
              class="file-preview"
              src="${escapeHtml(toFileUrl(job.outputPath))}"
              alt="${escapeHtml(job.fileName)} GIF preview"
            />`
          : job.previewUrl
            ? job.status === "running"
              ? `<video
                  class="file-preview file-preview-video"
                  src="${escapeHtml(toFileUrl(job.inputPath))}"
                  muted
                  autoplay
                  loop
                  playsinline
                  preload="metadata"
                ></video>`
              : `<img class="file-preview" src="${escapeHtml(job.previewUrl)}" alt="${escapeHtml(job.fileName)} preview" />`
            : '<div class="file-preview file-preview-empty">No preview</div>';

      const previewBlock = `
        <div class="preview-shell" data-job-preview="${job.id}">
          ${previewInner}
          ${
            job.status === "running"
              ? `<button class="preview-stop-button" type="button" data-stop-row="${job.id}" aria-label="Stop">x</button>`
              : ""
          }
        </div>
      `;

      const outputCell =
        job.outputPath && job.status === "done"
          ? `<a class="output-link" href="#" data-open="${escapeHtml(job.outputPath)}">Open GIF</a>`
          : job.error
            ? `<span class="file-sub">${escapeHtml(job.error.slice(0, 180))}</span>`
            : '<span class="file-sub">Not ready</span>';

      return `
        <tr>
          <td>
            <label class="row-check">
              <input
                type="checkbox"
                data-select-input="${job.id}"
                ${job.selected ? "checked" : ""}
                ${state.running ? "disabled" : ""}
              />
            </label>
          </td>
          <td>
            <div class="file-cell">
              ${previewBlock}
              <div class="file-meta">
                <div class="file-name">${escapeHtml(job.fileName)}</div>
                <div class="file-sub">${escapeHtml(job.inputPath)}</div>
              </div>
            </div>
          </td>
          <td>
            <label class="fps-field">
              <span>FPS</span>
              <input
                class="row-fps-input"
                type="number"
                min="1"
                max="60"
                step="1"
                value="${escapeHtml(job.fps)}"
                data-fps-input="${job.id}"
                ${state.running ? "disabled" : ""}
              />
            </label>
          </td>
          <td>
            <span class="status-badge status-${job.status}">${statusLabels[job.status]}</span>
          </td>
          <td>
            <div class="progress-shell">
              <div class="progress-bar" style="width:${Math.round(job.progress * 100)}%"></div>
            </div>
            <div class="progress-text">${Math.round(job.progress * 100)}%</div>
          </td>
          <td>${outputCell}</td>
        </tr>
      `;
    })
    .join("");

  updateSummary();
}

function renderOptimizeList() {
  if (state.optimizeFiles.length === 0) {
    elements.optimizeList.innerHTML = '<div class="optimize-row"><div></div><div class="optimize-name">No GIF files available.</div><div class="optimize-size"></div></div>';
    return;
  }

  elements.optimizeList.innerHTML = state.optimizeFiles
    .map(
      (item) => `
        <label class="optimize-row">
          <input type="checkbox" data-optimize-file="${escapeHtml(item.filePath)}" ${
            item.selected ? "checked" : ""
          } />
          <span class="optimize-name">${escapeHtml(item.fileName)}</span>
          <span class="optimize-size">${formatBytes(item.sizeBytes)}</span>
        </label>
      `
    )
    .join("");

  const allSelected =
    state.optimizeFiles.length > 0 && state.optimizeFiles.every((item) => item.selected);
  elements.optimizeSelectAll.checked = allSelected;
}

function collectGlobalSettings() {
    return {
      colors: Number(elements.colorsInput.value) || 96,
      scaleMode: elements.scaleModeSelect.value,
      width: Number(elements.widthInput.value) || 480,
      height: Number(elements.heightInput.value) || 480,
      renderProfile: elements.renderProfileSelect.value,
      experimental: {
      dither: elements.experimentalDitherSelect.value,
      statsMode: elements.experimentalStatsModeSelect.value,
      diffMode: elements.experimentalDiffModeSelect.value,
      bayerMatrix: elements.experimentalBayerMatrixSelect.value,
      ditherStrength: Number(elements.experimentalDitherStrengthInput.value) || 0,
      noiseProtect: Number(elements.experimentalNoiseProtectInput.value) || 0,
      flatProtect: Number(elements.experimentalFlatProtectInput.value) || 0,
      edgeBias: Number(elements.experimentalEdgeBiasInput.value) || 0,
      temporalStable: elements.experimentalTemporalStableSelect.value === "on",
      retroCrt: elements.experimentalRetroCrtSelect.value === "on",
      posterize: Number(elements.experimentalPosterizeInput.value) || 0,
      adaptive: elements.experimentalAdaptiveSelect.value === "on"
    }
  };
}

function collectExportSettings() {
  return {
    outputDir: state.outputDir,
    overwriteExisting: elements.overwriteCheckbox.checked,
    ...collectGlobalSettings()
  };
}

function applyQualitySettingsToSelectedJobs() {
  if (state.jobs.length === 0) {
    updateStatus("Select videos first.", "warn");
    return;
  }

  const selectedJobs = state.jobs.filter((job) => job.selected);
  if (selectedJobs.length === 0) {
    updateStatus("Select videos first.", "warn");
    return;
  }

  const renderSettings = collectGlobalSettings();
  selectedJobs.forEach((job) => {
    job.renderSettings = structuredClone(renderSettings);
  });

  updateStatus(`Quality settings applied to ${selectedJobs.length} videos.`, "ready");
  addLog(`Quality settings applied to ${selectedJobs.length} selected videos.`);
}

function toggleSelectAllJobs() {
  if (state.jobs.length === 0) {
    updateStatus("Select videos first.", "warn");
    return;
  }

  const shouldSelectAll = state.jobs.some((job) => !job.selected);
  state.jobs.forEach((job) => {
    job.selected = shouldSelectAll;
  });
  renderQueue();
}

function syncRenderProfileUi() {
  const isExperimental = elements.renderProfileSelect.value === "experimental";
  const isBayer =
    elements.experimentalDitherSelect.value === "bayer" ||
    elements.experimentalRetroCrtSelect.value === "on";
  elements.experimentalPanel.classList.toggle("hidden", !isExperimental);
  elements.experimentalBayerMatrixWrap.classList.toggle("hidden", !isExperimental || !isBayer);
  syncExperimentalValueLabels();
  refreshQualityPreviewBubbleIfOpen();
}

function syncScaleModeUi() {
  const custom = elements.scaleModeSelect.value === "custom";
  elements.sizePrimaryLabel.textContent = custom ? "Width (px)" : "Long edge (px)";
  elements.sizeSecondaryLabel.textContent = custom ? "Height (px)" : "Height (auto)";
  elements.heightField.classList.toggle("field-disabled", !custom);
  elements.heightInput.disabled = !custom;
  refreshQualityPreviewBubbleIfOpen();
}

function hasResumableJobs() {
  return state.jobs.some((job) => job.status !== "done");
}

function setRunning(isRunning) {
  state.running = isRunning;
  elements.startButton.disabled = isRunning;
  elements.runExportButton.disabled = isRunning;
  elements.topResumeButton.disabled = isRunning || !state.canResume;
  elements.topStopButton.disabled = !isRunning;
  elements.clearQueueButton.disabled = isRunning;
  elements.bulkFpsInput.disabled = isRunning;
  elements.applyAllFpsButton.disabled = isRunning;
  elements.applySelectedFpsButton.disabled = isRunning;
  renderQueue();
}

async function addPaths(paths, sourceLabel) {
  const known = new Set(state.jobs.map((job) => job.inputPath.toLowerCase()));
  const freshPaths = paths.filter((item) => !known.has(item.toLowerCase()));

  if (freshPaths.length === 0) {
    updateStatus("No new supported videos were found.", "warn");
    return;
  }

  const previews = await window.converterApi.generateVideoPreviews(freshPaths);
  const previewMap = new Map(previews.map((item) => [item.inputPath.toLowerCase(), item.previewUrl]));
  const freshJobs = freshPaths.map((inputPath) =>
    makeJob(inputPath, previewMap.get(inputPath.toLowerCase()) || "")
  );

  state.jobs = state.jobs.concat(freshJobs);
  ensureOutputDir(freshPaths[0]);
  renderQueue();
  updateStatus(`${freshJobs.length} videos added.`, "ready");
  addLog(`${freshJobs.length} videos added via ${sourceLabel}.`);
}

async function addFiles() {
  const filePaths = await window.converterApi.pickVideoFiles();
  if (filePaths.length === 0) {
    return;
  }

  await addPaths(filePaths, "file picker");
}

async function scanFolder() {
  const filePaths = await window.converterApi.pickVideoFolder();
  if (filePaths.length === 0) {
    updateStatus("No supported videos were found in the selected folder.", "warn");
    return;
  }

  await addPaths(filePaths, "folder scan");
}

async function handleDrop(event) {
  event.preventDefault();
  elements.dropZone.classList.remove("drag-active");

  const droppedPaths = Array.from(event.dataTransfer.files || [])
    .map((file) => file.path)
    .filter(Boolean);

  if (droppedPaths.length === 0) {
    updateStatus("The dropped item could not be read.", "warn");
    return;
  }

  const normalized = await window.converterApi.normalizeDropPaths(droppedPaths);
  if (normalized.length === 0) {
    updateStatus("No supported videos were found in the dropped items.", "warn");
    return;
  }

  await addPaths(normalized, "drag and drop");
}

async function pickOutputDir() {
  const outputDir = await window.converterApi.pickOutputFolder();
  if (!outputDir) {
    return;
  }

  state.outputDir = outputDir;
  elements.outputPathLabel.textContent = outputDir;
  elements.goToOutputLink.disabled = false;
  addLog(`Output folder set: ${outputDir}`);
}

async function saveZipForCompletedJobs() {
  const zipFiles = getCompletedGifJobs().map((job) => job.outputPath);

  if (zipFiles.length === 0) {
    updateStatus("No GIF files are ready for ZIP.", "warn");
    return;
  }

  try {
    const zipResult = await window.converterApi.saveZipArchive({
      files: zipFiles,
      outputDir: state.outputDir
    });

    if (zipResult.cancelled) {
      updateStatus("ZIP save was cancelled.", "warn");
      addLog("ZIP save step was cancelled.");
      return;
    }

    updateStatus("ZIP file is ready.", "ready");
    addLog(`ZIP created: ${zipResult.zipPath}`);
    window.converterApi.openPath(zipResult.zipPath);
  } catch (error) {
    updateStatus("An error occurred while creating the ZIP.", "error");
    addLog(`ZIP error: ${error.message}`);
  }
}

async function saveGifFileFromPath(sourcePath, suggestedName) {
  try {
    const saveResult = await window.converterApi.saveGifFileAs({
      sourcePath,
      suggestedName,
      outputDir: state.outputDir
    });

    if (saveResult.cancelled) {
      updateStatus("GIF save was cancelled.", "warn");
      addLog("GIF save step was cancelled.");
      return null;
    }

    updateStatus("GIF file is ready.", "ready");
    addLog(`GIF saved: ${saveResult.filePath}`);
    window.converterApi.openPath(saveResult.filePath);
    return saveResult.filePath;
  } catch (error) {
    updateStatus("An error occurred while saving the GIF.", "error");
    addLog(`GIF save error: ${error.message}`);
    return null;
  }
}

async function saveCompletedGifFile() {
  const singleCompletedJob = getSingleCompletedJob();
  if (!singleCompletedJob) {
    updateStatus("A single GIF is not ready to save.", "warn");
    return null;
  }

  return saveGifFileFromPath(
    singleCompletedJob.outputPath,
    singleCompletedJob.outputPath.split(/[/\\]/).pop()
  );
}

async function stageOptimizedGifFiles(filePaths, qualityPercent) {
  updateStatus(`Optimizing ${filePaths.length} GIFs...`, "ready");
  updateCompletionHint("A dialog will open when optimization is complete.");
  addLog(`Optimization started for ${filePaths.length} GIFs at ${qualityPercent}% quality.`);

  const optimizedEntries = await window.converterApi.stageOptimizeGifs({
    files: filePaths,
    qualityPercent
  });
  state.optimizationDrafts = optimizedEntries;
  return optimizedEntries;
}

async function discardOptimizationDrafts() {
  if (state.optimizationDrafts.length === 0) {
    return;
  }

  await window.converterApi.discardOptimizedGifs(state.optimizationDrafts);
  state.optimizationDrafts = [];
}

async function commitOptimizationDrafts() {
  if (state.optimizationDrafts.length === 0) {
    return [];
  }

  const committedEntries = await window.converterApi.commitOptimizedGifs(state.optimizationDrafts);
  state.optimizationDrafts = [];
  const committedMap = new Map(committedEntries.map((item) => [item.filePath, item]));
  state.optimizeFiles = state.optimizeFiles.map((item) =>
    committedMap.has(item.filePath)
      ? { ...committedMap.get(item.filePath), selected: item.selected }
      : item
  );
  state.jobs = state.jobs.map((job) =>
    committedMap.has(job.outputPath)
      ? { ...job, optimizedOnce: true }
      : job
  );
  renderOptimizeList();
  renderQueue();
  updateStatus("Optimized GIFs were saved.", "ready");
  updateCompletionHint("");
  addLog(`Optimized GIFs were saved for ${committedEntries.length} files.`);
  return committedEntries;
}

async function optimizeZipAndDownload() {
  const singleCompletedJob = getSingleCompletedJob();
  if (singleCompletedJob) {
    state.optimizeZipBusy = true;
    startOptimizeZipProgress();
    updateOptimizeZipButton();

    try {
      state.lastOptimizeQuality = Math.max(
        10,
        Math.min(100, Number(elements.optimizePercentInput.value) || state.lastOptimizeQuality || 80)
      );
      const drafts = await stageOptimizedGifFiles(
        [singleCompletedJob.outputPath],
        state.lastOptimizeQuality
      );
      stopOptimizeZipProgress(true);
      const wantsSave = await askConfirmPrompt({
        title: "Save",
        heading: "Save?",
        copy: ""
      });

      if (wantsSave && drafts[0]) {
        const savedPath = await saveGifFileFromPath(
          drafts[0].tempPath,
          singleCompletedJob.outputPath.split(/[/\\]/).pop()
        );
        if (savedPath) {
          singleCompletedJob.optimizedOnce = true;
        }
      } else {
        addLog("Optimized GIF save was skipped.");
      }

      await discardOptimizationDrafts();
      state.optimizeZipVisible = true;
      renderQueue();
      return;
    } catch (error) {
      await discardOptimizationDrafts();
      updateStatus("GIF optimization failed.", "error");
      updateCompletionHint("Optimization failed. Review the log and try again.");
      addLog(`Optimization error: ${error.message}`);
      stopOptimizeZipProgress(false);
    } finally {
      state.optimizeZipBusy = false;
      updateOptimizeZipButton();
    }
    return;
  }

  const pendingFiles = getCompletedGifJobs()
    .filter((job) => !job.optimizedOnce)
    .map((job) => job.outputPath);

  if (pendingFiles.length === 0) {
    await saveZipForCompletedJobs();
    return;
  }

  state.optimizeZipBusy = true;
  startOptimizeZipProgress();
  updateOptimizeZipButton();

  try {
    await stageOptimizedGifFiles(pendingFiles, state.lastOptimizeQuality);
    await commitOptimizationDrafts();
    stopOptimizeZipProgress(true);
    state.optimizeZipVisible = false;
    updateOptimizeZipButton();
    await saveZipForCompletedJobs();
  } catch (error) {
    await discardOptimizationDrafts();
    updateStatus("GIF optimization failed.", "error");
    updateCompletionHint("Optimization failed. Review the log and try again.");
    addLog(`Optimization error: ${error.message}`);
    stopOptimizeZipProgress(false);
  } finally {
    state.optimizeZipBusy = false;
    updateOptimizeZipButton();
  }
}

async function saveCompletedOutputs() {
  if (getSingleCompletedJob()) {
    await saveCompletedGifFile();
    return;
  }

  await saveZipForCompletedJobs();
}

function getBulkFps() {
  const value = Number(elements.bulkFpsInput.value) || 15;
  return Math.max(1, Math.min(60, value));
}

function applyBulkFps(mode) {
  if (state.jobs.length === 0) {
    updateStatus("Add videos first.", "warn");
    return;
  }

  const fps = getBulkFps();
  const targets =
    mode === "selected" ? state.jobs.filter((job) => job.selected) : state.jobs;

  if (targets.length === 0) {
    updateStatus("No videos are selected.", "warn");
    return;
  }

  targets.forEach((job) => {
    job.fps = fps;
  });

  renderQueue();
  updateStatus(`FPS set to ${fps} for ${targets.length} videos.`, "ready");
  addLog(
    mode === "selected"
      ? `Applied FPS ${fps} to ${targets.length} selected videos.`
      : `Applied FPS ${fps} to all videos.`
  );
}

function askConfirmPrompt({
  title = "Save",
  heading = "Save a ZIP copy too?",
  copy = "Choose Yes to continue."
} = {}) {
  elements.confirmPromptTitle.textContent = title;
  elements.confirmPromptHeading.textContent = heading;
  if (elements.confirmPromptCopy) {
    elements.confirmPromptCopy.textContent = copy;
  }
  elements.zipPrompt.classList.remove("hidden");
  return new Promise((resolve) => {
    state.zipPromptResolver = resolve;
  });
}

function closeZipPrompt(answer) {
  elements.zipPrompt.classList.add("hidden");
  if (state.zipPromptResolver) {
    state.zipPromptResolver(answer);
    state.zipPromptResolver = null;
  }
}

function showOptimizePrompt(files) {
  state.optimizeFiles = files.map((item) => ({
    ...item,
    selected: true
  }));
  state.optimizeZipVisible = false;
  elements.optimizeSelectAll.checked = true;
  state.lastOptimizeQuality = Math.max(
    10,
    Math.min(100, Number(elements.optimizePercentInput.value) || 80)
  );
  renderOptimizeList();
  elements.optimizePrompt.classList.remove("hidden");
  updateOptimizeZipButton();

  return new Promise((resolve) => {
    state.optimizePromptResolver = resolve;
  });
}

function closeOptimizePrompt(action = "continue") {
  closeQualityPreviewBubble();
  elements.optimizePrompt.classList.add("hidden");
  if (action === "continue" && getCompletedGifJobs().some((job) => !job.optimizedOnce)) {
    state.optimizeZipVisible = true;
  } else if (action !== "continue") {
    state.optimizeZipVisible = false;
  }
  updateOptimizeZipButton();
  if (state.optimizePromptResolver) {
    state.optimizePromptResolver(action);
    state.optimizePromptResolver = null;
  }
}

function showDonePrompt(message) {
  if (elements.donePromptText) {
    elements.donePromptText.textContent = message;
  }
  elements.donePrompt.classList.remove("hidden");
  return new Promise((resolve) => {
    state.donePromptResolver = resolve;
  });
}

function closeDonePrompt() {
  elements.donePrompt.classList.add("hidden");
  if (state.donePromptResolver) {
    state.donePromptResolver();
    state.donePromptResolver = null;
  }
}

async function startConversion() {
  return runConversion(false);
}

async function continueConversion() {
  return runConversion(true);
}

async function runConversion(resumeMode) {
  if (state.running) {
    return;
  }

  if (state.jobs.length === 0) {
    updateStatus("Add videos or drag them into the workspace first.", "warn");
    return;
  }

  if (!state.outputDir) {
    updateStatus("Select an output folder before starting export.", "warn");
    return;
  }

  const jobsToProcess = resumeMode
    ? state.jobs.filter((job) => job.status !== "done")
    : state.jobs;

  if (jobsToProcess.length === 0) {
    updateStatus("No remaining videos to continue.", "warn");
    return;
  }

  for (const job of state.jobs) {
    if (resumeMode && job.status === "done") {
      continue;
    }
    job.fps = Math.max(1, Math.min(60, Number(job.fps) || getDefaultFps()));
    job.status = "waiting";
    job.progress = 0;
    job.outputPath = "";
    if (!resumeMode) {
      job.optimizedOnce = false;
    }
    job.error = "";
  }
  state.canResume = false;
  state.optimizeZipVisible = false;
  updateOptimizeZipButton();

  setRunning(true);
  updateStatus(resumeMode ? "Export resumed." : "Export started.", "ready");
  updateCompletionHint("A dialog will open when the process is complete.");
  addLog(
    resumeMode
      ? `Export resumed for ${jobsToProcess.length} remaining videos.`
      : `Export started for ${state.jobs.length} videos.`
  );

  const results = await window.converterApi.convertBatch({
    jobs: jobsToProcess.map((job) => ({
      id: job.id,
      inputPath: job.inputPath,
      fps: job.fps,
      renderSettings: job.renderSettings
    })),
    settings: collectExportSettings()
  });

  const successCount = results.filter((item) => item.status === "done").length;
  const errorCount = results.filter((item) => item.status === "error").length;
  const cancelledCount = results.filter((item) => item.status === "cancelled").length;
  const gifFiles = results
    .filter((item) => item.status === "done" && item.outputPath)
    .map((item) => item.outputPath);

  state.canResume = hasResumableJobs();
  setRunning(false);
  if (cancelledCount > 0 && successCount === 0) {
    updateStatus("Export was cancelled.", "warn");
    updateCompletionHint("The process was cancelled before completion.");
  } else if (errorCount > 0) {
    updateStatus(
      `${successCount} done, ${errorCount} errors, ${cancelledCount} cancelled.`,
      "warn"
    );
    updateCompletionHint("The process finished with issues. A dialog may still appear for the completed files.");
  } else {
    updateStatus(`${successCount} GIFs are ready.`, "ready");
    updateCompletionHint("The process is complete. A dialog will open next.");
  }
  addLog(
    `Export finished. Success: ${successCount}, errors: ${errorCount}, cancelled: ${cancelledCount}.`
  );

  if (gifFiles.length > 0) {
    const fileEntries = await window.converterApi.getFileEntries(gifFiles);
    const optimizeAction = await showOptimizePrompt(fileEntries);
    if (
      optimizeAction === "optimized-saved" ||
      optimizeAction === "optimized-discarded" ||
      optimizeAction === "continue"
    ) {
      updateCompletionHint("");
      return;
    }
  }
}

async function cancelConversion() {
  if (!state.running) {
    return;
  }

  await window.converterApi.cancelBatch(state.jobs.map((job) => ({ id: job.id })));
  updateStatus("Cancel request sent.", "warn");
  addLog("The user requested cancellation.");
}

  elements.startButton.addEventListener("click", addFiles);
  elements.pickOutputButton.addEventListener("click", pickOutputDir);
elements.goToOutputLink.addEventListener("click", () => {
  if (state.outputDir) {
    window.converterApi.openPath(state.outputDir);
  }
});
elements.saveZipButton.addEventListener("click", saveCompletedOutputs);
elements.optimizeZipButton.addEventListener("click", optimizeZipAndDownload);
elements.clearQueueButton.addEventListener("click", () => {
  if (state.running) {
    return;
  }
  state.canResume = false;
  state.jobs = [];
  renderQueue();
  updateStatus("List cleared.", "ready");
});
elements.brandLinkButton.addEventListener("click", () => {
  window.converterApi.openExternalUrl("https://ycswu.co");
});
elements.runExportButton.addEventListener("click", startConversion);
elements.topResumeButton.addEventListener("click", continueConversion);
elements.topStopButton.addEventListener("click", cancelConversion);
elements.selectAllButton.addEventListener("click", toggleSelectAllJobs);
elements.applyAllFpsButton.addEventListener("click", () => applyBulkFps("all"));
elements.applySelectedFpsButton.addEventListener("click", () => applyBulkFps("selected"));
elements.applySelectedQualityButton.addEventListener("click", applyQualitySettingsToSelectedJobs);
elements.renderProfileSelect.addEventListener("change", syncRenderProfileUi);
elements.experimentalDitherSelect.addEventListener("change", syncRenderProfileUi);
elements.experimentalRetroCrtSelect.addEventListener("change", syncRenderProfileUi);
[
  elements.experimentalDitherStrengthInput,
  elements.experimentalNoiseProtectInput,
  elements.experimentalFlatProtectInput,
  elements.experimentalEdgeBiasInput,
  elements.experimentalPosterizeInput
].forEach((input) => {
  input.addEventListener("input", () => {
    syncExperimentalValueLabels();
    refreshQualityPreviewBubbleIfOpen();
  });
});
[
  elements.experimentalDitherSelect,
  elements.experimentalStatsModeSelect,
  elements.experimentalDiffModeSelect,
  elements.experimentalBayerMatrixSelect,
  elements.experimentalTemporalStableSelect,
  elements.experimentalRetroCrtSelect,
  elements.experimentalAdaptiveSelect
].forEach((input) => {
  input.addEventListener("change", refreshQualityPreviewBubbleIfOpen);
});
elements.scaleModeSelect.addEventListener("change", syncScaleModeUi);

elements.queueTableBody.addEventListener("input", (event) => {
  const selectionTarget = event.target.closest("[data-select-input]");
  if (selectionTarget) {
    const selectionJob = state.jobs.find(
      (item) => item.id === selectionTarget.dataset.selectInput
    );
    if (selectionJob) {
      selectionJob.selected = selectionTarget.checked;
    }
    return;
  }

  const target = event.target.closest("[data-fps-input]");
  if (!target) {
    return;
  }

  const job = state.jobs.find((item) => item.id === target.dataset.fpsInput);
  if (!job) {
    return;
  }

  job.fps = Math.max(1, Math.min(60, Number(target.value) || getDefaultFps()));
});

elements.queueTableBody.addEventListener("change", (event) => {
  const target = event.target.closest("[data-fps-input]");
  if (!target) {
    return;
  }

  const job = state.jobs.find((item) => item.id === target.dataset.fpsInput);
  if (!job) {
    return;
  }

  target.value = String(job.fps);
});

elements.queueTableBody.addEventListener("change", (event) => {
  const selectionTarget = event.target.closest("[data-select-input]");
  if (!selectionTarget) {
    return;
  }

  const selectionJob = state.jobs.find((item) => item.id === selectionTarget.dataset.selectInput);
  if (!selectionJob) {
    return;
  }

  selectionJob.selected = selectionTarget.checked;
});

elements.queueTableBody.addEventListener("click", (event) => {
  const stopTarget = event.target.closest("[data-stop-row]");
  if (stopTarget) {
    event.preventDefault();
    cancelConversion();
    return;
  }
  const target = event.target.closest("[data-open]");
  if (!target) {
    return;
  }
  event.preventDefault();
  window.converterApi.openPath(target.dataset.open);
});

elements.queueTableBody.addEventListener("dblclick", (event) => {
  const previewTarget = event.target.closest("[data-job-preview]");
  if (!previewTarget || state.running) {
    return;
  }

  const selectedId = previewTarget.dataset.jobPreview;
  state.jobs.forEach((job) => {
    job.selected = job.id === selectedId;
  });
  renderQueue();
});

elements.dropZone.addEventListener("dragenter", (event) => {
  event.preventDefault();
  if (!state.running) {
    elements.dropZone.classList.add("drag-active");
  }
});

elements.dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  if (!state.running) {
    elements.dropZone.classList.add("drag-active");
  }
});

elements.dropZone.addEventListener("dragleave", (event) => {
  if (!elements.dropZone.contains(event.relatedTarget)) {
    elements.dropZone.classList.remove("drag-active");
  }
});

elements.dropZone.addEventListener("drop", (event) => {
  if (state.running) {
    event.preventDefault();
    return;
  }

  handleDrop(event);
});

document.addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.addEventListener("drop", (event) => {
  if (!event.target.closest("#dropZone")) {
    event.preventDefault();
  }
});

elements.zipYesButton.addEventListener("click", () => closeZipPrompt(true));
elements.zipNoButton.addEventListener("click", () => closeZipPrompt(false));
elements.doneOkButton.addEventListener("click", closeDonePrompt);
elements.logCloseButton.addEventListener("click", () => setLogDocked(true));
elements.logDockButton.addEventListener("click", () => setLogDocked(false));
elements.optimizePreviewInfoButton.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  state.previewContextKey = "optimizeQuality";
  toggleQualityPreviewBubble(event);
});
elements.previewInfoButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    state.previewContextKey = button.dataset.previewKey || "optimizeQuality";
    toggleQualityPreviewBubble(event);
  });
});
elements.optimizePercentInput.addEventListener("mousedown", closeQualityPreviewBubble);
elements.optimizePercentInput.addEventListener("input", closeQualityPreviewBubble);
elements.optimizeSelectAll.addEventListener("change", () => {
  state.optimizeFiles = state.optimizeFiles.map((item) => ({
    ...item,
    selected: elements.optimizeSelectAll.checked
  }));
  renderOptimizeList();
});
elements.optimizeList.addEventListener("change", (event) => {
  const target = event.target.closest("[data-optimize-file]");
  if (!target) {
    return;
  }

  state.optimizeFiles = state.optimizeFiles.map((item) =>
    item.filePath === target.dataset.optimizeFile
      ? { ...item, selected: target.checked }
      : item
  );
  renderOptimizeList();
});
elements.optimizeList.addEventListener("click", (event) => {
  const target = event.target.closest("[data-optimize-file]");
  if (!target || event.detail < 2) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  const selectedPath = target.dataset.optimizeFile;
  state.optimizeFiles = state.optimizeFiles.map((item) => ({
    ...item,
    selected: item.filePath === selectedPath
  }));
  renderOptimizeList();
});
elements.optimizeList.addEventListener("dblclick", (event) => {
  const target =
    event.target.closest("[data-optimize-file]") ||
    event.target.closest(".optimize-row")?.querySelector("[data-optimize-file]");

  if (!target) {
    return;
  }

  event.preventDefault();
  const selectedPath = target.dataset.optimizeFile;
  state.optimizeFiles = state.optimizeFiles.map((item) => ({
    ...item,
    selected: item.filePath === selectedPath
  }));
  renderOptimizeList();
});
elements.optimizeRunButton.addEventListener("click", async () => {
  const selectedFiles = state.optimizeFiles.filter((item) => item.selected).map((item) => item.filePath);
  if (selectedFiles.length === 0) {
    updateStatus("Select at least one GIF to optimize.", "warn");
    return;
  }

  const qualityPercent = Math.max(
    10,
    Math.min(100, Number(elements.optimizePercentInput.value) || 80)
  );
  state.lastOptimizeQuality = qualityPercent;
  try {
    const drafts = await stageOptimizedGifFiles(selectedFiles, qualityPercent);

    if (selectedFiles.length === 1) {
      const wantsSave = await askConfirmPrompt({
        title: "Save",
        heading: "Save?",
        copy: ""
      });

      if (wantsSave && drafts[0]) {
        const savedPath = await saveGifFileFromPath(
          drafts[0].tempPath,
          state.optimizeFiles.find((item) => item.filePath === selectedFiles[0])?.fileName ||
            drafts[0].fileName
        );

        if (savedPath) {
          state.jobs = state.jobs.map((job) =>
            job.outputPath === selectedFiles[0] ? { ...job, optimizedOnce: true } : job
          );
          renderQueue();
          closeOptimizePrompt("optimized-saved");
        } else {
          closeOptimizePrompt("optimized-discarded");
        }
      } else {
        addLog("Optimized GIF save was skipped.");
        closeOptimizePrompt("optimized-discarded");
      }

      await discardOptimizationDrafts();
      return;
    }

    const wantsZip = await askConfirmPrompt({
      title: "Save",
      heading: "Save ZIP?",
      copy: ""
    });

    if (wantsZip) {
      await commitOptimizationDrafts();
      await saveZipForCompletedJobs();
      closeOptimizePrompt("optimized-saved");
      return;
    }

    addLog("Optimized ZIP save was skipped.");
    await discardOptimizationDrafts();
    closeOptimizePrompt("optimized-discarded");
  } catch (error) {
    await discardOptimizationDrafts();
    updateStatus("GIF optimization failed.", "error");
    updateCompletionHint("Optimization failed. Review the log and try again.");
    addLog(`Optimization error: ${error.message}`);
  }
});
elements.optimizeContinueButton.addEventListener("click", () => closeOptimizePrompt("continue"));
elements.optimizeCloseButton.addEventListener("click", () => closeOptimizePrompt("continue"));
elements.optimizePrompt.addEventListener("click", (event) => {
  if (event.target === elements.optimizePrompt) {
    closeOptimizePrompt("continue");
  }
});

document.addEventListener("mousemove", (event) => {
  if (elements.qualityPreviewBubble.classList.contains("hidden")) {
    return;
  }

  const now = performance.now();
  const dx = event.clientX - state.previewMouseX;
  const dy = event.clientY - state.previewMouseY;
  const dt = Math.max(1, now - state.previewMouseAt);
  const distance = Math.hypot(dx, dy);
  const horizontalSweep = Math.abs(dx);
  const speed = distance / dt;

  if (horizontalSweep > 260 || speed > 4.5) {
    closeQualityPreviewBubble();
    state.previewMouseX = event.clientX;
    state.previewMouseY = event.clientY;
    state.previewMouseAt = now;
    return;
  }

  positionQualityPreviewBubble(event.clientX, event.clientY);
  state.previewMouseX = event.clientX;
  state.previewMouseY = event.clientY;
  state.previewMouseAt = now;
});

document.addEventListener("click", (event) => {
  if (
    !elements.qualityPreviewBubble.classList.contains("hidden") &&
    !event.target.closest("#qualityPreviewBubble") &&
    !event.target.closest("#optimizePreviewInfoButton")
  ) {
    closeQualityPreviewBubble();
  }
});

document.addEventListener("contextmenu", (event) => {
  if (
    !elements.qualityPreviewBubble.classList.contains("hidden") &&
    !event.target.closest("#qualityPreviewBubble") &&
    !event.target.closest("#optimizePreviewInfoButton")
  ) {
    closeQualityPreviewBubble();
  }
});

window.converterApi.onConversionStarted(({ id, queueIndex, total }) => {
  const job = state.jobs.find((item) => item.id === id);
  if (!job) {
    return;
  }
  job.status = "running";
  job.progress = 0;
  renderQueue();
  updateStatus(`Export in progress: ${queueIndex}/${total}`, "ready");
  addLog(`GIF generation started for ${job.fileName}. FPS: ${job.fps}`);
});

window.converterApi.onConversionProgress(({ id, progress, outputPath }) => {
  const job = state.jobs.find((item) => item.id === id);
  if (!job) {
    return;
  }
  job.progress = progress;
  job.outputPath = outputPath;
  renderQueue();
});

window.converterApi.onConversionFinished(({ id, status, outputPath, error }) => {
  const job = state.jobs.find((item) => item.id === id);
  if (!job) {
    return;
  }

  job.status = status;
  job.progress = status === "done" ? 1 : job.progress;
  job.outputPath = outputPath || "";
  job.error = error || "";
  renderQueue();

  if (status === "done") {
    addLog(`${job.fileName} was converted to GIF successfully.`);
  } else if (status === "cancelled") {
    addLog(`${job.fileName} was cancelled.`);
  } else {
    addLog(`${job.fileName} failed.`);
  }
});

renderQueue();
updateStatus("Ready.", "ready");
updateCompletionHint("A dialog will open when the process is complete.");
enableLogResize();
setLogDocked(false);
syncRenderProfileUi();
syncScaleModeUi();
