// ===== ELEMENTS =====
const fileInput = document.getElementById("fileInput");
const chooseBtn = document.getElementById("chooseBtn");
const resetBtn = document.getElementById("resetBtn");
const downloadBtn = document.getElementById("downloadBtn");

const mainImage = document.getElementById("mainImage");
const thumbPreview = document.getElementById("thumbPreview");

const zoomInfo = document.getElementById("zoomInfo");

const sliders = {
  brightness: document.getElementById("brightness"),
  contrast: document.getElementById("contrast"),
  saturation: document.getElementById("saturation"),
  hue: document.getElementById("hue"),
  blur: document.getElementById("blur"),
  opacity: document.getElementById("opacity"),
};

const presetButtons = document.querySelectorAll(".preset-btn");
const hiddenCanvas = document.getElementById("hiddenCanvas");

// state
const state = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
  opacity: 100,
  zoom: 100,
  originalURL: "",
};

// ===== HELPERS =====

function applyFilters() {
  if (!mainImage) return;
  const { brightness, contrast, saturation, hue, blur, opacity } = state;

  const filter = `
    brightness(${brightness}%)
    contrast(${contrast}%)
    saturate(${saturation}%)
    hue-rotate(${hue}deg)
    blur(${blur}px)
  `;

  mainImage.style.filter = filter;
  mainImage.style.opacity = opacity / 100;

  if (thumbPreview) {
    thumbPreview.style.filter = filter;
    thumbPreview.style.opacity = opacity / 100;
  }
}

function resetState() {
  state.brightness = 100;
  state.contrast = 100;
  state.saturation = 100;
  state.hue = 0;
  state.blur = 0;
  state.opacity = 100;
  state.zoom = 100;

  sliders.brightness.value = 100;
  sliders.contrast.value = 100;
  sliders.saturation.value = 100;
  sliders.hue.value = 0;
  sliders.blur.value = 0;
  sliders.opacity.value = 100;

  zoomInfo.textContent = `${state.zoom}%`;
  applyFilters();
}

function setPreset(name) {
  if (name === "original") {
    resetState();
  } else if (name === "warm") {
    state.brightness = 110;
    state.contrast = 110;
    state.saturation = 130;
    state.hue = 15;
    state.blur = 0;
    state.opacity = 100;
  } else if (name === "cold") {
    state.brightness = 105;
    state.contrast = 115;
    state.saturation = 120;
    state.hue = -20;
    state.blur = 0;
    state.opacity = 100;
  } else if (name === "dramatic") {
    state.brightness = 90;
    state.contrast = 140;
    state.saturation = 110;
    state.hue = 0;
    state.blur = 1.5;
    state.opacity = 100;
  }

  // sync sliders with state
  sliders.brightness.value = state.brightness;
  sliders.contrast.value = state.contrast;
  sliders.saturation.value = state.saturation;
  sliders.hue.value = state.hue;
  sliders.blur.value = state.blur;
  sliders.opacity.value = state.opacity;

  applyFilters();
}

function loadImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    state.originalURL = e.target.result;
    mainImage.src = state.originalURL;
    thumbPreview.src = state.originalURL;
    resetState();
  };
  reader.readAsDataURL(file);
}

function downloadImage() {
  if (!state.originalURL) {
    alert("Please choose an image first.");
    return;
  }

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const canvas = hiddenCanvas;
    const ctx = canvas.getContext("2d");

    const width = img.naturalWidth;
    const height = img.naturalHeight;
    canvas.width = width;
    canvas.height = height;

    const { brightness, contrast, saturation, hue, blur, opacity } = state;

    ctx.filter = `
      brightness(${brightness}%)
      contrast(${contrast}%)
      saturate(${saturation}%)
      hue-rotate(${hue}deg)
      blur(${blur}px)
      opacity(${opacity}%)
    `;

    ctx.drawImage(img, 0, 0, width, height);

    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  img.src = state.originalURL;
}

// ===== EVENTS =====

chooseBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    return;
  }
  loadImage(file);
});

resetBtn.addEventListener("click", resetState);

downloadBtn.addEventListener("click", downloadImage);

Object.entries(sliders).forEach(([key, input]) => {
  input.addEventListener("input", (e) => {
    const val = Number(e.target.value);
    state[key] = val;
    applyFilters();
  });
});

presetButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const preset = btn.dataset.preset;
    setPreset(preset);
  });
});

// simple zoom display on mouse wheel over main image
mainImage.addEventListener("wheel", (e) => {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 5 : -5;
  state.zoom = Math.min(200, Math.max(50, state.zoom + delta));
  zoomInfo.textContent = `${state.zoom}%`;
  const scale = state.zoom / 100;
  mainImage.style.transform = `scale(${scale})`;
});

// init
zoomInfo.textContent = `${state.zoom}%`;
