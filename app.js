"use strict";

const themeToggle = document.querySelector(".theme-toggle");
const imageInput = document.querySelector("#imageInput");
const canvas = document.querySelector("#graphCanvas");
const ctx = canvas.getContext("2d");
const magnifier = document.querySelector("#magnifier");
const magnifierCanvas = document.querySelector("#magnifierCanvas");
const magnifierCtx = magnifierCanvas.getContext("2d");
const emptyState = document.querySelector("#emptyState");
const statusText = document.querySelector("#statusText");
const calibrationList = document.querySelector("#calibrationList");
const pointTable = document.querySelector("#pointTable");
const seriesList = document.querySelector("#seriesList");
const modeButtons = [...document.querySelectorAll(".mode-button")];
const languageSelect = document.querySelector("#languageSelect");
const xAxisType = document.querySelector("#xAxisType");
const yAxisType = document.querySelector("#yAxisType");
const xScaleType = document.querySelector("#xScaleType");
const yScaleType = document.querySelector("#yScaleType");
const seriesNameInput = document.querySelector("#seriesNameInput");
const addSeriesButton = document.querySelector("#addSeriesButton");
const saveProjectButton = document.querySelector("#saveProjectButton");
const loadProjectButton = document.querySelector("#loadProjectButton");
const loadProjectInput = document.querySelector("#loadProjectInput");
const projectNameInput = document.querySelector("#projectNameInput");
const valueInputs = {
  x1: document.querySelector("#x1Value"),
  x2: document.querySelector("#x2Value"),
  y1: document.querySelector("#y1Value"),
  y2: document.querySelector("#y2Value"),
};

const state = {
  mode: "x1",
  activeCalibration: null,
  activePointIndex: null,
  lastPointerImagePoint: null,
  image: null,
  imageDataUrl: null,
  imageScale: 1,
  imageOffsetX: 0,
  imageOffsetY: 0,
  calibration: {
    x1: null,
    x2: null,
    y1: null,
    y2: null,
  },
  activeSeriesId: "series-1",
  series: [
    {
      id: "series-1",
      name: "Series 1",
      color: "#b42318",
      points: [],
    },
  ],
};

const translations = window.appTranslations;

const savedTheme = localStorage.getItem("theme");
const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
const savedLanguage = translations[requestedLanguage]
  ? requestedLanguage
  : (localStorage.getItem("language") || "ko");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const magnifierZoom = 4;

function t(key) {
  return translations[languageSelect.value]?.[key] || translations.ko[key] || key;
}

function setLanguage(language) {
  languageSelect.value = translations[language] ? language : "ko";
  document.documentElement.lang = languageSelect.value;
  document.title = t("appTitle");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });

  document.querySelectorAll("[data-language-link]").forEach((element) => {
    const url = new URL(element.getAttribute("href"), window.location.href);
    url.searchParams.set("lang", languageSelect.value);
    element.href = `${url.pathname.split("/").pop()}${url.search}`;
  });

  localStorage.setItem("language", languageSelect.value);
  setTheme(document.body.classList.contains("dark"));
  refresh();
}

function setTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  themeToggle.textContent = isDark ? "☀" : "☾";
  themeToggle.setAttribute("aria-label", isDark ? t("lightOn") : t("darkOn"));
  themeToggle.setAttribute("aria-pressed", String(isDark));
  draw();
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  draw();
}

function setMode(mode) {
  state.mode = mode;
  if (mode !== "data" && state.calibration[mode]) {
    state.activeCalibration = mode;
    state.activePointIndex = null;
  }
  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  updateStatus();
}

function calibrationLabel(key) {
  const labels = {
    x1: t("modeX1"),
    x2: t("modeX2"),
    y1: t("modeY1"),
    y2: t("modeY2"),
  };
  return labels[key] || key;
}

function getCssColor(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function imageToCanvas(point) {
  return {
    x: state.imageOffsetX + point.x * state.imageScale,
    y: state.imageOffsetY + point.y * state.imageScale,
  };
}

function canvasToImage(point) {
  return {
    x: (point.x - state.imageOffsetX) / state.imageScale,
    y: (point.y - state.imageOffsetY) / state.imageScale,
  };
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function isCalibrationMode() {
  return state.mode !== "data";
}

function hideMagnifier() {
  magnifier.hidden = true;
}

function updateMagnifier(event) {
  if (!state.image) {
    hideMagnifier();
    return;
  }

  const canvasPoint = getCanvasPoint(event);
  const imagePoint = canvasToImage(canvasPoint);
  state.lastPointerImagePoint = imagePoint;
  const previousActivePointIndex = state.activePointIndex;
  activateNearestPoint(imagePoint);
  if (previousActivePointIndex !== state.activePointIndex) {
    draw();
    renderTable();
  }
  updateMagnifierAtImagePoint(imagePoint, canvasPoint);
}

function activateNearestPoint(imagePoint) {
  if (!allPoints().length || state.activeCalibration) {
    return;
  }

  let nearest = null;
  let nearestDistance = Infinity;
  allPoints().forEach((point) => {
    const dx = point.image.x - imagePoint.x;
    const dy = point.image.y - imagePoint.y;
    const distance = dx * dx + dy * dy;
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = point;
    }
  });

  if (nearest) {
    state.activeSeriesId = nearest.series.id;
    state.activePointIndex = nearest.series.points.indexOf(nearest.point);
  }
}

function updateMagnifierAtImagePoint(imagePoint, canvasPoint = null) {
  if (!state.image) {
    hideMagnifier();
    return;
  }

  if (
    imagePoint.x < 0 ||
    imagePoint.y < 0 ||
    imagePoint.x > state.image.width ||
    imagePoint.y > state.image.height
  ) {
    hideMagnifier();
    return;
  }

  const wrapRect = canvas.parentElement.getBoundingClientRect();
  const lensSize = magnifierCanvas.width;
  const sourceSize = lensSize / magnifierZoom;
  const sourceX = Math.max(0, Math.min(state.image.width - sourceSize, imagePoint.x - sourceSize / 2));
  const sourceY = Math.max(0, Math.min(state.image.height - sourceSize, imagePoint.y - sourceSize / 2));
  const displayPoint = canvasPoint || imageToCanvas(imagePoint);
  const left = Math.min(wrapRect.width - 210, displayPoint.x + 18);
  const top = Math.max(102, Math.min(wrapRect.height - 102, displayPoint.y));

  magnifier.hidden = false;
  magnifier.style.left = `${Math.max(12, left)}px`;
  magnifier.style.top = `${top}px`;

  magnifierCtx.clearRect(0, 0, lensSize, lensSize);
  magnifierCtx.imageSmoothingEnabled = false;
  magnifierCtx.drawImage(
    state.image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    lensSize,
    lensSize
  );

  const accent = getCssColor("--accent") || "#0f766e";
  const danger = getCssColor("--danger") || "#b42318";

  Object.entries(state.calibration).forEach(([key, point]) => {
    if (!point) return;

    const x = (point.x - sourceX) * magnifierZoom;
    const y = (point.y - sourceY) * magnifierZoom;
    if (x < -20 || y < -20 || x > lensSize + 20 || y > lensSize + 20) {
      return;
    }

    const isActive = key === state.activeCalibration;
    magnifierCtx.save();
    magnifierCtx.strokeStyle = isActive ? danger : accent;
    magnifierCtx.fillStyle = isActive ? danger : accent;
    magnifierCtx.lineWidth = isActive ? 2.5 : 2;
    magnifierCtx.beginPath();
    magnifierCtx.arc(x, y, isActive ? 7 : 5, 0, Math.PI * 2);
    magnifierCtx.stroke();
    magnifierCtx.beginPath();
    magnifierCtx.moveTo(x - 12, y);
    magnifierCtx.lineTo(x + 12, y);
    magnifierCtx.moveTo(x, y - 12);
    magnifierCtx.lineTo(x, y + 12);
    magnifierCtx.stroke();
    magnifierCtx.font = "12px system-ui";
    magnifierCtx.fillText(key.toUpperCase(), x + 9, y - 9);
    magnifierCtx.restore();
  });

  state.series.forEach((series) => {
    series.points.forEach((point, index) => {
      const x = (point.image.x - sourceX) * magnifierZoom;
      const y = (point.image.y - sourceY) * magnifierZoom;
      if (x < -16 || y < -16 || x > lensSize + 16 || y > lensSize + 16) {
        return;
      }

      magnifierCtx.save();
      const isActive = series.id === state.activeSeriesId && index === state.activePointIndex;
      magnifierCtx.fillStyle = series.color;
      magnifierCtx.strokeStyle = "#ffffff";
      magnifierCtx.lineWidth = isActive ? 3 : 2;
      magnifierCtx.beginPath();
      magnifierCtx.arc(x, y, isActive ? 7 : 5, 0, Math.PI * 2);
      magnifierCtx.fill();
      magnifierCtx.stroke();
      magnifierCtx.fillStyle = series.color;
      magnifierCtx.font = "12px system-ui";
      magnifierCtx.fillText(String(index + 1), x + 8, y - 8);
      magnifierCtx.restore();
    });
  });

  magnifierCtx.save();
  magnifierCtx.strokeStyle = danger;
  magnifierCtx.lineWidth = 1.5;
  magnifierCtx.beginPath();
  magnifierCtx.moveTo(lensSize / 2 - 18, lensSize / 2);
  magnifierCtx.lineTo(lensSize / 2 + 18, lensSize / 2);
  magnifierCtx.moveTo(lensSize / 2, lensSize / 2 - 18);
  magnifierCtx.lineTo(lensSize / 2, lensSize / 2 + 18);
  magnifierCtx.stroke();
  magnifierCtx.restore();
}

function hasCalibration() {
  return state.calibration.x1 && state.calibration.x2 && state.calibration.y1 && state.calibration.y2;
}

function activeSeries() {
  return state.series.find((series) => series.id === state.activeSeriesId) || state.series[0];
}

function allPoints() {
  return state.series.flatMap((series) =>
    series.points.map((point) => ({
      point,
      image: point.image,
      value: point.value,
      series,
    }))
  );
}

function pointSeries(pointRecord) {
  return state.series.find((series) => series.points.includes(pointRecord));
}

function values() {
  const x1 = parseAxisValue(valueInputs.x1.value, xAxisType.value);
  const x2 = parseAxisValue(valueInputs.x2.value, xAxisType.value);
  const y1 = parseAxisValue(valueInputs.y1.value, yAxisType.value);
  const y2 = parseAxisValue(valueInputs.y2.value, yAxisType.value);

  return {
    x1,
    x2,
    y1,
    y2,
  };
}

function parseAxisValue(value, type) {
  if (type === "date") {
    const timestamp = Date.parse(`${value}T00:00:00`);
    return Number.isFinite(timestamp) ? timestamp : NaN;
  }

  return Number(value);
}

function interpolateValue(ratio, start, end, scale) {
  if (scale === "log") {
    if (start <= 0 || end <= 0) {
      return NaN;
    }
    return 10 ** (Math.log10(start) + ratio * (Math.log10(end) - Math.log10(start)));
  }

  return start + ratio * (end - start);
}

function toDataValue(imagePoint) {
  const cal = state.calibration;
  const val = values();
  const xRatio = (imagePoint.x - cal.x1.x) / (cal.x2.x - cal.x1.x);
  const yRatio = (cal.y1.y - imagePoint.y) / (cal.y1.y - cal.y2.y);

  return {
    x: interpolateValue(xRatio, val.x1, val.x2, xScaleType.value),
    y: interpolateValue(yRatio, val.y1, val.y2, yScaleType.value),
  };
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "";
  }
  return Number(value.toPrecision(8)).toString();
}

function formatDate(value) {
  if (!Number.isFinite(value)) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function formatXValue(value) {
  return xAxisType.value === "date" ? formatDate(value) : formatNumber(value);
}

function formatYValue(value) {
  return yAxisType.value === "date" ? formatDate(value) : formatNumber(value);
}

function recalculatePoints() {
  if (!hasCalibration()) {
    return;
  }

  const series = activeSeries();
  const activePoint = state.activePointIndex !== null ? series.points[state.activePointIndex] : null;
  state.series.forEach((item) => {
    item.points.forEach((point) => {
      point.value = toDataValue(point.image);
    });
  });
  sortPointsByX(activePoint);
}

function sortPointsByX(activePoint = null) {
  state.series.forEach((series) => {
    series.points.sort((a, b) => {
      const ax = Number.isFinite(a.value.x) ? a.value.x : Infinity;
      const bx = Number.isFinite(b.value.x) ? b.value.x : Infinity;
      if (ax !== bx) {
        return ax - bx;
      }

      const ay = Number.isFinite(a.value.y) ? a.value.y : Infinity;
      const by = Number.isFinite(b.value.y) ? b.value.y : Infinity;
      return ay - by;
    });
  });

  if (activePoint) {
    const series = pointSeries(activePoint);
    state.activeSeriesId = series?.id || state.activeSeriesId;
    state.activePointIndex = series ? series.points.indexOf(activePoint) : null;
  }
}

function drawMarker(point, color, label) {
  const canvasPoint = imageToCanvas(point);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(canvasPoint.x, canvasPoint.y, 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(canvasPoint.x - 10, canvasPoint.y);
  ctx.lineTo(canvasPoint.x + 10, canvasPoint.y);
  ctx.moveTo(canvasPoint.x, canvasPoint.y - 10);
  ctx.lineTo(canvasPoint.x, canvasPoint.y + 10);
  ctx.stroke();
  ctx.font = "13px system-ui";
  ctx.fillText(label, canvasPoint.x + 10, canvasPoint.y - 10);
  ctx.restore();
}

function draw() {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);

  if (!state.image) {
    return;
  }

  const scale = Math.min(rect.width / state.image.width, rect.height / state.image.height);
  state.imageScale = scale;
  state.imageOffsetX = (rect.width - state.image.width * scale) / 2;
  state.imageOffsetY = (rect.height - state.image.height * scale) / 2;

  ctx.drawImage(
    state.image,
    state.imageOffsetX,
    state.imageOffsetY,
    state.image.width * scale,
    state.image.height * scale
  );

  const accent = getCssColor("--accent") || "#0f766e";
  const danger = getCssColor("--danger") || "#b42318";
  const text = getCssColor("--text") || "#172033";

  if (state.calibration.x1) drawMarker(state.calibration.x1, accent, "X1");
  if (state.calibration.x2) drawMarker(state.calibration.x2, accent, "X2");
  if (state.calibration.y1) drawMarker(state.calibration.y1, accent, "Y1");
  if (state.calibration.y2) drawMarker(state.calibration.y2, accent, "Y2");

  if (hasCalibration()) {
    const x1 = imageToCanvas(state.calibration.x1);
    const x2 = imageToCanvas(state.calibration.x2);
    const y1 = imageToCanvas(state.calibration.y1);
    const y2 = imageToCanvas(state.calibration.y2);
    ctx.save();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(x1.x, x1.y);
    ctx.lineTo(x2.x, x2.y);
    ctx.moveTo(y1.x, y1.y);
    ctx.lineTo(y2.x, y2.y);
    ctx.stroke();
    ctx.restore();
  }

  state.series.forEach((series) => {
    series.points.forEach((point, index) => {
      const canvasPoint = imageToCanvas(point.image);
      const isActive = series.id === state.activeSeriesId && index === state.activePointIndex;
      ctx.save();
      ctx.fillStyle = series.color;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = isActive ? 3 : 2;
      ctx.beginPath();
      ctx.arc(canvasPoint.x, canvasPoint.y, isActive ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = text;
      ctx.font = "12px system-ui";
      ctx.fillText(String(index + 1), canvasPoint.x + 8, canvasPoint.y - 8);
      ctx.restore();
    });
  });
}

function updateStatus() {
  if (!state.image) {
    statusText.textContent = t("uploadImage");
    return;
  }

  const missing = [];
  if (!state.calibration.x1) missing.push(t("modeX1"));
  if (!state.calibration.x2) missing.push(t("modeX2"));
  if (!state.calibration.y1) missing.push(t("modeY1"));
  if (!state.calibration.y2) missing.push(t("modeY2"));

  if (missing.length) {
    statusText.innerHTML = `${t("missingPrefix")} <strong>${missing.join(", ")}</strong>`;
    return;
  }

  if (state.mode === "data") {
    const pointHint = state.activePointIndex !== null ? ` ${t("pointAdjustHint")} ${t("deleteKeyHint")}` : "";
    statusText.innerHTML = `${t("dataModeStatus")} <strong>${activeSeries().points.length}</strong> ${t("countSuffix")}${pointHint}`;
    return;
  }

  if (state.activeCalibration) {
    statusText.innerHTML = `${t("calibrationReady")} <strong>${calibrationLabel(state.activeCalibration)}</strong> ${t("keyboardAdjustHint")}`;
    return;
  }

  statusText.textContent = t("calibrationReady");
}

function renderTable() {
  pointTable.innerHTML = "";
  state.series.forEach((series) => {
    series.points.forEach((point, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${series.name}</td>
        <td>${formatXValue(point.value.x)}</td>
        <td>${formatYValue(point.value.y)}</td>
        <td><button class="delete-button" type="button" data-series="${series.id}" data-index="${index}">${t("deletePoint")}</button></td>
      `;
      row.dataset.seriesId = series.id;
      row.dataset.pointIndex = String(index);
      pointTable.append(row);
    });
  });
}

function renderSeriesList() {
  seriesList.innerHTML = "";
  state.series.forEach((series) => {
    const button = document.createElement("button");
    button.className = "series-button";
    button.type = "button";
    button.dataset.seriesId = series.id;
    button.classList.toggle("active", series.id === state.activeSeriesId);
    button.innerHTML = `
      <span class="series-swatch" style="color: ${series.color}"></span>
      <span>${series.name} (${series.points.length})</span>
    `;
    seriesList.append(button);
  });
}

function renderCalibrationList() {
  const keys = ["x1", "x2", "y1", "y2"];
  calibrationList.innerHTML = "";

  keys.forEach((key) => {
    const point = state.calibration[key];
    const item = document.createElement("div");
    item.className = "calibration-item";
    const coordinate = point
      ? `${t("set")} (${formatNumber(point.x)}, ${formatNumber(point.y)})`
      : t("notSet");

    item.innerHTML = `
      <span><strong>${calibrationLabel(key)}</strong> ${coordinate}</span>
      ${
        point
          ? `<button class="calibration-delete" type="button" data-calibration="${key}">${t("deleteCalibration")}</button>`
          : ""
      }
    `;
    calibrationList.append(item);
  });
}

function refresh() {
  draw();
  updateStatus();
  renderCalibrationList();
  renderSeriesList();
  renderTable();
}

function csvText() {
  const rows = [["series", "index", "x", "y"]];
  state.series.forEach((series) => {
    series.points.forEach((point, index) => {
      rows.push([series.name, index + 1, formatXValue(point.value.x), formatYValue(point.value.y)]);
    });
  });
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const text = String(cell);
          return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
        })
        .join(",")
    )
    .join("\n");
}

function updateXAxisInputs() {
  if (xAxisType.value === "date") {
    valueInputs.x1.type = "date";
    valueInputs.x2.type = "date";
    if (!Number.isFinite(Date.parse(`${valueInputs.x1.value}T00:00:00`))) {
      valueInputs.x1.value = "2024-01-01";
    }
    if (!Number.isFinite(Date.parse(`${valueInputs.x2.value}T00:00:00`))) {
      valueInputs.x2.value = "2024-12-31";
    }
  } else {
    valueInputs.x1.type = "number";
    valueInputs.x2.type = "number";
    valueInputs.x1.step = "any";
    valueInputs.x2.step = "any";
    if (!Number.isFinite(Number(valueInputs.x1.value))) valueInputs.x1.value = "0";
    if (!Number.isFinite(Number(valueInputs.x2.value))) valueInputs.x2.value = "10";
  }

  recalculatePoints();
  refresh();
}

function updateYAxisInputs() {
  if (yAxisType.value === "date") {
    valueInputs.y1.type = "date";
    valueInputs.y2.type = "date";
    if (!Number.isFinite(Date.parse(`${valueInputs.y1.value}T00:00:00`))) {
      valueInputs.y1.value = "2024-01-01";
    }
    if (!Number.isFinite(Date.parse(`${valueInputs.y2.value}T00:00:00`))) {
      valueInputs.y2.value = "2024-12-31";
    }
  } else {
    valueInputs.y1.type = "number";
    valueInputs.y2.type = "number";
    valueInputs.y1.step = "any";
    valueInputs.y2.step = "any";
    if (!Number.isFinite(Number(valueInputs.y1.value))) valueInputs.y1.value = "0";
    if (!Number.isFinite(Number(valueInputs.y2.value))) valueInputs.y2.value = "10";
  }

  recalculatePoints();
  refresh();
}

function projectData() {
  return {
    version: 1,
    name: projectNameInput.value.trim() || "graph-project",
    imageDataUrl: state.imageDataUrl,
    axis: {
      xType: xAxisType.value,
      yType: yAxisType.value,
      xScale: xScaleType.value,
      yScale: yScaleType.value,
      values: {
        x1: valueInputs.x1.value,
        x2: valueInputs.x2.value,
        y1: valueInputs.y1.value,
        y2: valueInputs.y2.value,
      },
    },
    calibration: state.calibration,
    activeSeriesId: state.activeSeriesId,
    series: state.series,
  };
}

function downloadText(filename, text, type) {
  const blob = new Blob([text], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function safeFilename(name) {
  const cleaned = name
    .trim()
    .replace(/[^a-zA-Z0-9가-힣._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "graph-project";
}

function loadImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    if (!dataUrl) {
      state.image = null;
      state.imageDataUrl = null;
      emptyState.hidden = false;
      resolve();
      return;
    }

    const image = new Image();
    image.onload = () => {
      state.image = image;
      state.imageDataUrl = dataUrl;
      emptyState.hidden = true;
      resolve();
    };
    image.onerror = reject;
    image.src = dataUrl;
  });
}

async function loadProject(project) {
  xAxisType.value = project.axis?.xType || "number";
  yAxisType.value = project.axis?.yType || "number";
  xScaleType.value = project.axis?.xScale || "linear";
  yScaleType.value = project.axis?.yScale || "linear";
  updateXAxisInputs();
  updateYAxisInputs();

  valueInputs.x1.value = project.axis?.values?.x1 ?? "0";
  valueInputs.x2.value = project.axis?.values?.x2 ?? "10";
  valueInputs.y1.value = project.axis?.values?.y1 ?? "0";
  valueInputs.y2.value = project.axis?.values?.y2 ?? "10";
  projectNameInput.value = project.name || "graph-project";

  state.calibration = project.calibration || { x1: null, x2: null, y1: null, y2: null };
  state.series = Array.isArray(project.series) && project.series.length
    ? project.series.map((series, index) => ({
        id: series.id || `series-${index + 1}`,
        name: series.name || `Series ${index + 1}`,
        color: series.color || ["#b42318", "#0f766e", "#2563eb", "#9333ea"][index % 4],
        points: Array.isArray(series.points) ? series.points : [],
      }))
    : state.series;
  state.activeSeriesId = project.activeSeriesId || state.series[0].id;
  state.activeCalibration = null;
  state.activePointIndex = null;
  state.lastPointerImagePoint = null;
  await loadImageFromDataUrl(project.imageDataUrl);
  recalculatePoints();
  refresh();
  statusText.textContent = t("projectLoaded");
}

setLanguage(savedLanguage);
setTheme(savedTheme ? savedTheme === "dark" : prefersDark);
resizeCanvas();

themeToggle.addEventListener("click", () => {
  const isDark = !document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  setTheme(isDark);
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

languageSelect.addEventListener("change", () => setLanguage(languageSelect.value));

Object.values(valueInputs).forEach((input) => {
  input.addEventListener("input", () => {
    recalculatePoints();
    refresh();
  });
});

xAxisType.addEventListener("change", updateXAxisInputs);
yAxisType.addEventListener("change", updateYAxisInputs);
xScaleType.addEventListener("change", () => {
  recalculatePoints();
  refresh();
});
yScaleType.addEventListener("change", () => {
  recalculatePoints();
  refresh();
});

saveProjectButton.addEventListener("click", () => {
  const filename = `${safeFilename(projectNameInput.value)}.json`;
  downloadText(
    filename,
    JSON.stringify(projectData(), null, 2),
    "application/json;charset=utf-8"
  );
});

loadProjectButton.addEventListener("click", () => loadProjectInput.click());

loadProjectInput.addEventListener("change", async () => {
  const file = loadProjectInput.files[0];
  if (!file) return;
  const text = await file.text();
  await loadProject(JSON.parse(text));
  loadProjectInput.value = "";
});

seriesList.addEventListener("click", (event) => {
  const button = event.target.closest(".series-button");
  if (!button) return;
  state.activeSeriesId = button.dataset.seriesId;
  state.activePointIndex = null;
  refresh();
});

addSeriesButton.addEventListener("click", () => {
  const nextIndex = state.series.length + 1;
  const colors = ["#b42318", "#0f766e", "#2563eb", "#9333ea", "#ca8a04", "#db2777"];
  const id = `series-${Date.now()}`;
  state.series.push({
    id,
    name: seriesNameInput.value.trim() || `Series ${nextIndex}`,
    color: colors[state.series.length % colors.length],
    points: [],
  });
  state.activeSeriesId = id;
  state.activePointIndex = null;
  seriesNameInput.value = `Series ${nextIndex + 1}`;
  refresh();
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  const image = new Image();
  image.onload = () => {
    state.image = image;
    state.imageDataUrl = image.src;
    state.activeCalibration = null;
    state.activePointIndex = null;
    state.lastPointerImagePoint = null;
    state.calibration = { x1: null, x2: null, y1: null, y2: null };
    state.series.forEach((series) => {
      series.points = [];
    });
    emptyState.hidden = true;
    setMode("x1");
    refresh();
  };
  reader.addEventListener("load", () => {
    image.src = reader.result;
  });
  reader.readAsDataURL(file);
});

canvas.addEventListener("click", (event) => {
  if (!state.image) return;

  const imagePoint = canvasToImage(getCanvasPoint(event));
  if (
    imagePoint.x < 0 ||
    imagePoint.y < 0 ||
    imagePoint.x > state.image.width ||
    imagePoint.y > state.image.height
  ) {
    return;
  }

  if (state.mode === "data") {
    if (!hasCalibration()) {
      updateStatus();
      return;
    }
    const series = activeSeries();
    series.points.push({
      image: imagePoint,
      value: toDataValue(imagePoint),
    });
    sortPointsByX(series.points[series.points.length - 1]);
    state.activeCalibration = null;
    refresh();
    updateMagnifierAtImagePoint(imagePoint);
    return;
  }

  state.calibration[state.mode] = imagePoint;
  state.activeCalibration = state.mode;
  state.activePointIndex = null;
  const nextMode =
    state.mode === "x1"
      ? "x2"
      : state.mode === "x2"
        ? "y1"
        : state.mode === "y1"
          ? "y2"
          : "data";
  setMode(nextMode);
  refresh();
  updateMagnifierAtImagePoint(imagePoint);
});

canvas.addEventListener("mousemove", updateMagnifier);
canvas.addEventListener("mouseleave", hideMagnifier);

calibrationList.addEventListener("click", (event) => {
  const button = event.target.closest(".calibration-delete");
  if (!button) return;

  const key = button.dataset.calibration;
  state.calibration[key] = null;
  state.activeCalibration = null;
  state.activePointIndex = null;
  hideMagnifier();
  setMode(key);
  refresh();
});

window.addEventListener("keydown", (event) => {
  if (["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName)) {
    return;
  }

  const keys = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
  };
  const delta = keys[event.key];
  if (state.lastPointerImagePoint && !state.activeCalibration) {
    activateNearestPoint(state.lastPointerImagePoint);
  }
  const activeCalibrationPoint = state.activeCalibration ? state.calibration[state.activeCalibration] : null;
  const series = activeSeries();
  const activeDataPoint =
    state.activePointIndex !== null ? series.points[state.activePointIndex]?.image : null;

  if (event.key === "Delete" && state.image && activeDataPoint) {
    event.preventDefault();
    series.points.splice(state.activePointIndex, 1);
    state.activePointIndex = null;
    refresh();
    updateMagnifierAtImagePoint(state.lastPointerImagePoint || activeDataPoint);
    return;
  }

  const activePoint = activeCalibrationPoint || activeDataPoint;

  if (!delta || !state.image || !activePoint) {
    return;
  }

  event.preventDefault();
  const step = event.shiftKey ? 10 : 1;
  activePoint.x = Math.max(0, Math.min(state.image.width, activePoint.x + delta[0] * step));
  activePoint.y = Math.max(0, Math.min(state.image.height, activePoint.y + delta[1] * step));
  if (activeDataPoint && hasCalibration()) {
    const activePointRecord = series.points[state.activePointIndex];
    activePointRecord.value = toDataValue(activeDataPoint);
    sortPointsByX(activePointRecord);
  } else {
    recalculatePoints();
  }
  refresh();
  updateMagnifierAtImagePoint(activePoint);
});

pointTable.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-button");
  if (button) {
    const deletedIndex = Number(button.dataset.index);
    const series = state.series.find((item) => item.id === button.dataset.series);
    if (!series) return;
    series.points.splice(deletedIndex, 1);
    if (series.id === state.activeSeriesId) {
      if (state.activePointIndex === deletedIndex) {
        state.activePointIndex = null;
      } else if (state.activePointIndex > deletedIndex) {
        state.activePointIndex -= 1;
      }
    }
    sortPointsByX();
    refresh();
    return;
  }

  const row = event.target.closest("tr");
  if (row) {
    state.activeSeriesId = row.dataset.seriesId;
    state.activePointIndex = Number(row.dataset.pointIndex);
    state.activeCalibration = null;
    setMode("data");
    updateMagnifierAtImagePoint(activeSeries().points[state.activePointIndex].image);
  }
  refresh();
});

document.querySelector("#undoButton").addEventListener("click", () => {
  const series = activeSeries();
  series.points.pop();
  if (state.activePointIndex !== null && state.activePointIndex >= series.points.length) {
    state.activePointIndex = series.points.length ? series.points.length - 1 : null;
  }
  sortPointsByX();
  refresh();
});

document.querySelector("#clearButton").addEventListener("click", () => {
  activeSeries().points = [];
  state.activePointIndex = null;
  sortPointsByX();
  refresh();
});

document.querySelector("#csvButton").addEventListener("click", () => {
  downloadText("graph-points.csv", csvText(), "text/csv;charset=utf-8");
});

document.querySelector("#copyButton").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(csvText());
    statusText.innerHTML = `${t("copied")} <strong>${allPoints().length}</strong> ${t("countSuffix")}`;
  } catch {
    statusText.textContent = t("clipboardDenied");
  }
});

window.addEventListener("resize", resizeCanvas);
