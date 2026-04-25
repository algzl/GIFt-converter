import { FFmpeg } from "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js";
import { fetchFile, toBlobURL } from "https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.2/dist/esm/index.js";
import JSZip from "https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm";

const state = {
  jobs: [],
  ffmpeg: null,
  ffmpegLoaded: false,
  running: false
};

const elements = {
  fileInput: document.querySelector("#fileInput"),
  pickButton: document.querySelector("#pickButton"),
  statusLine: document.querySelector("#statusLine"),
  bulkFpsInput: document.querySelector("#bulkFpsInput"),
  applyAllFpsButton: document.querySelector("#applyAllFpsButton"),
  applySelectedFpsButton: document.querySelector("#applySelectedFpsButton"),
  renderModeSelect: document.querySelector("#renderModeSelect"),
  colorCountInput: document.querySelector("#colorCountInput"),
  sizeModeSelect: document.querySelector("#sizeModeSelect"),
  widthInput: document.querySelector("#widthInput"),
  heightInput: document.querySelector("#heightInput"),
  heightField: document.querySelector("#heightField"),
  primarySizeLabel: document.querySelector("#primarySizeLabel"),
  secondarySizeLabel: document.querySelector("#secondarySizeLabel"),
  exportButton: document.querySelector("#exportButton"),
  zipButton: document.querySelector("#zipButton"),
  selectAllButton: document.querySelector("#selectAllButton"),
  clearButton: document.querySelector("#clearButton"),
  progressCounter: document.querySelector("#progressCounter"),
  jobsMeter: document.querySelector("#jobsMeter"),
  jobsMeterLabel: document.querySelector("#jobsMeterLabel"),
  queueBody: document.querySelector("#queueBody"),
  dropZone: document.querySelector("#dropZone"),
  logPanel: document.querySelector("#logPanel")
};

function addLog(message, tone = "default") {
  const item = document.createElement("div");
  item.className = `log-entry${tone === "default" ? "" : ` log-entry-${tone}`}`;
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  item.innerHTML = `<div>${message}</div><div class="log-time">${timestamp}</div>`;
  elements.logPanel.prepend(item);
}

function setStatus(text, tone = "ready") {
  elements.statusLine.textContent = text;
  elements.statusLine.style.color =
    tone === "error" ? "#a62e2e" : tone === "warn" ? "#8a6300" : "#387a49";
}

function getDefaultFps() {
  return Math.max(1, Math.min(60, Number(elements.bulkFpsInput.value) || 15));
}

function updateSizeModeUi() {
  const custom = elements.sizeModeSelect.value === "custom";
  elements.primarySizeLabel.textContent = custom ? "Width (px)" : "Long edge (px)";
  elements.secondarySizeLabel.textContent = custom ? "Height (px)" : "Height (auto)";
  elements.heightInput.disabled = !custom;
  elements.heightField.classList.toggle("field-disabled", !custom);
}

function createJob(file) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    file,
    selected: true,
    fps: getDefaultFps(),
    status: "Waiting",
    progress: 0,
    gifBlob: null,
    gifName: file.name.replace(/\.[^.]+$/, "") + ".gif",
    previewUrl: URL.createObjectURL(file)
  };
}

function updateSummary() {
  const total = state.jobs.length;
  const completed = state.jobs.filter((job) => job.gifBlob).length;
  elements.progressCounter.textContent = `${completed} / ${total} completed`;
  elements.jobsMeterLabel.textContent = `${total} jobs`;
  const progress = total === 0 ? 0 : (completed / total) * 100;
  elements.jobsMeter.style.setProperty("--completion-progress", `${progress}%`);
  elements.zipButton.disabled = completed === 0 || state.running;
}

function renderQueue() {
  if (state.jobs.length === 0) {
    elements.queueBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="6">Drop videos here or use Start Import.</td>
      </tr>
    `;
    updateSummary();
    return;
  }

  elements.queueBody.innerHTML = state.jobs
    .map((job) => {
      const output = job.gifBlob
        ? `<a class="output-link" href="${URL.createObjectURL(job.gifBlob)}" download="${job.gifName}">Download GIF</a>`
        : "Not ready";
      return `
        <tr>
          <td><input type="checkbox" data-select="${job.id}" ${job.selected ? "checked" : ""} /></td>
          <td>
            <div class="file-cell">
              <video class="preview" src="${job.previewUrl}" muted playsinline loop autoplay></video>
              <div>
                <div class="file-name">${job.file.name}</div>
                <div class="file-sub">${job.file.name}</div>
              </div>
            </div>
          </td>
          <td><input class="row-fps-input" type="number" min="1" max="60" value="${job.fps}" data-fps="${job.id}" /></td>
          <td><span class="status-pill">${job.status}</span></td>
          <td>
            <div class="progress-wrap">
              <div class="progress-bar"><span style="width:${job.progress}%"></span></div>
              <div class="progress-copy">${Math.round(job.progress)}%</div>
            </div>
          </td>
          <td>${output}</td>
        </tr>
      `;
    })
    .join("");

  updateSummary();
}

function getRenderSettings() {
  const mode = elements.renderModeSelect.value;
  const colors = Number(elements.colorCountInput.value) || 96;
  if (mode === "detail") {
    return { dither: "floyd_steinberg", colors: Math.max(96, colors), stats: "full" };
  }
  if (mode === "retro") {
    return { dither: "bayer", colors: Math.min(96, colors), stats: "single", bayerScale: 3 };
  }
  if (mode === "stable") {
    return { dither: "sierra2_4a", colors, stats: "single" };
  }
  return { dither: "sierra2_4a", colors, stats: "diff" };
}

function getScaleFilter() {
  const sizeMode = elements.sizeModeSelect.value;
  const width = Math.max(64, Number(elements.widthInput.value) || 640);
  const height = Math.max(64, Number(elements.heightInput.value) || 480);
  if (sizeMode === "custom") {
    return `scale=${width}:${height}:flags=lanczos`;
  }
  return `scale='if(gt(iw,ih),${width},-1)':'if(gt(iw,ih),-1,${width})':flags=lanczos`;
}

async function ensureFfmpeg() {
  if (state.ffmpegLoaded) {
    return state.ffmpeg;
  }

  setStatus("Loading browser engine...", "warn");
  addLog("Loading browser engine...");
  const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm";
  const packageURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm";
  const ffmpeg = new FFmpeg();
  const [coreURL, wasmURL, workerURL] = await Promise.all([
    toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript")
  ]);
  const classWorkerURL = URL.createObjectURL(
    new Blob([`import "${packageURL}/worker.js";`], { type: "text/javascript" })
  );
  await ffmpeg.load({
    coreURL,
    wasmURL,
    workerURL,
    classWorkerURL
  });
  state.ffmpeg = ffmpeg;
  state.ffmpegLoaded = true;
  addLog("Browser engine is ready.", "success");
  return ffmpeg;
}

async function convertJob(job, index, total) {
  const ffmpeg = await ensureFfmpeg();
  const inputName = `${job.id}-${job.file.name}`;
  const outputName = `${job.id}.gif`;
  const paletteName = `${job.id}.png`;
  const fps = Math.max(1, Math.min(60, Number(job.fps) || 15));
  const render = getRenderSettings();
  const scale = getScaleFilter();

  addLog(`GIF generation started for ${job.file.name}. FPS: ${fps}`);
  job.status = "Converting";
  job.progress = 6;
  renderQueue();

  ffmpeg.on("progress", ({ progress }) => {
    job.progress = Math.max(6, Math.min(98, progress * 100));
    renderQueue();
  });

  await ffmpeg.writeFile(inputName, await fetchFile(job.file));
  await ffmpeg.exec([
    "-i",
    inputName,
    "-vf",
    `fps=${fps},${scale},palettegen=max_colors=${render.colors}:stats_mode=${render.stats}`,
    paletteName
  ]);

  const paletteUse =
    render.dither === "bayer"
      ? `paletteuse=dither=bayer:bayer_scale=${render.bayerScale || 3}`
      : `paletteuse=dither=${render.dither}`;

  await ffmpeg.exec([
    "-i",
    inputName,
    "-i",
    paletteName,
    "-lavfi",
    `fps=${fps},${scale}[x];[x][1:v]${paletteUse}`,
    "-loop",
    "0",
    outputName
  ]);

  const data = await ffmpeg.readFile(outputName);
  job.gifBlob = new Blob([data.buffer], { type: "image/gif" });
  job.status = "Completed";
  job.progress = 100;
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(paletteName);
  await ffmpeg.deleteFile(outputName);
  addLog(`${job.file.name} was converted to GIF successfully.`, "success");
  setStatus(`Converted ${index + 1}/${total}.`, "ready");
  renderQueue();
}

async function exportAll() {
  if (state.running || state.jobs.length === 0) {
    return;
  }

  state.running = true;
  elements.exportButton.disabled = true;
  elements.zipButton.disabled = true;

  try {
    const jobs = state.jobs.filter((job) => job.selected);
    if (jobs.length === 0) {
      setStatus("Select videos first.", "warn");
      addLog("Select videos first.", "error");
      return;
    }

    for (let index = 0; index < jobs.length; index += 1) {
      await convertJob(jobs[index], index, jobs.length);
    }
    setStatus("GIFs are ready.", "ready");
  } catch (error) {
    console.error(error);
    setStatus("Browser conversion failed.", "error");
    addLog(`Conversion error: ${error.message}`, "error");
  } finally {
    state.running = false;
    elements.exportButton.disabled = false;
    updateSummary();
  }
}

async function downloadZip() {
  const ready = state.jobs.filter((job) => job.gifBlob);
  if (ready.length === 0) {
    setStatus("No GIFs are ready for ZIP.", "warn");
    addLog("No GIFs are ready for ZIP.", "error");
    return;
  }

  const zip = new JSZip();
  ready.forEach((job) => zip.file(job.gifName, job.gifBlob));
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "gift-converter-web-export.zip";
  link.click();
  URL.revokeObjectURL(url);
  setStatus("ZIP downloaded.", "ready");
  addLog("ZIP download is ready.", "success");
}

function addFiles(fileList) {
  const fresh = Array.from(fileList).filter((file) => file.type.startsWith("video/"));
  if (fresh.length === 0) {
    setStatus("No supported videos found.", "warn");
    addLog("No supported videos found.", "error");
    return;
  }
  state.jobs.push(...fresh.map(createJob));
  renderQueue();
  setStatus(`${fresh.length} videos added.`, "ready");
  addLog(`${fresh.length} videos added.`, "success");
}

elements.pickButton.addEventListener("click", () => elements.fileInput.click());
elements.fileInput.addEventListener("change", (event) => addFiles(event.target.files));
elements.applyAllFpsButton.addEventListener("click", () => {
  const fps = getDefaultFps();
  state.jobs.forEach((job) => {
    job.fps = fps;
  });
  renderQueue();
  addLog(`Applied FPS ${fps} to all videos.`);
});
elements.applySelectedFpsButton.addEventListener("click", () => {
  const fps = getDefaultFps();
  const selected = state.jobs.filter((job) => job.selected);
  if (selected.length === 0) {
    setStatus("Select videos first.", "warn");
    addLog("Select videos first.", "error");
    return;
  }
  selected.forEach((job) => {
    job.fps = fps;
  });
  renderQueue();
  addLog(`Applied FPS ${fps} to ${selected.length} selected videos.`);
});
elements.sizeModeSelect.addEventListener("change", updateSizeModeUi);
elements.exportButton.addEventListener("click", exportAll);
elements.zipButton.addEventListener("click", downloadZip);
elements.selectAllButton.addEventListener("click", () => {
  const next = state.jobs.some((job) => !job.selected);
  state.jobs = state.jobs.map((job) => ({ ...job, selected: next }));
  renderQueue();
});
elements.clearButton.addEventListener("click", () => {
  state.jobs.forEach((job) => URL.revokeObjectURL(job.previewUrl));
  state.jobs = [];
  renderQueue();
  setStatus("List cleared.", "ready");
  addLog("List cleared.");
});
elements.queueBody.addEventListener("change", (event) => {
  const selectTarget = event.target.closest("[data-select]");
  if (selectTarget) {
    state.jobs = state.jobs.map((job) =>
      job.id === selectTarget.dataset.select ? { ...job, selected: selectTarget.checked } : job
    );
    renderQueue();
    return;
  }

  const fpsTarget = event.target.closest("[data-fps]");
  if (fpsTarget) {
    const fps = Math.max(1, Math.min(60, Number(fpsTarget.value) || 15));
    state.jobs = state.jobs.map((job) =>
      job.id === fpsTarget.dataset.fps ? { ...job, fps } : job
    );
    renderQueue();
  }
});

["dragenter", "dragover"].forEach((type) => {
  elements.dropZone.addEventListener(type, (event) => {
    event.preventDefault();
  });
});

elements.dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  addFiles(event.dataTransfer.files);
});

updateSizeModeUi();
renderQueue();
addLog("Web app is ready.");
