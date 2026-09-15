const DEFAULT_STATE = {
  "currentSlot": 1,
  "currentVideoUrl": "videos/current.mp4",
  "maxSlots": 21,
  "basePrice": 1,
  "currency": "EUR",
  "experimentStart": "2026-09-15T00:00:00+03:00",
  "experimentDays": 30,
  "maxFileSizeMb": 100,
  "uploadUrl": "",
  "paymentLinks": {
    "card": "https://donate.stripe.com/5kQdR85787ob6yI5jN5gc00"
  },
  "social": {
    "tiktok": "https://www.tiktok.com/@thepaywall",
    "instagram": "https://www.instagram.com/the.paywall.experiment/",
    "youtube": "https://www.youtube.com/@ThePaywallExperiment/shorts"
  }
};

let paywallState = { ...DEFAULT_STATE };

function slotPrice(n) {
  return paywallState.basePrice * 2 ** (n - 1);
}

function formatEuro(amount) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: paywallState.currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function experimentHasEnded() {
  const start = new Date(paywallState.experimentStart);
  if (Number.isNaN(start.getTime())) return false;
  const end = new Date(start.getTime() + paywallState.experimentDays * 24 * 60 * 60 * 1000);
  return Date.now() >= end.getTime();
}

function slotsExhausted() {
  return paywallState.currentSlot > paywallState.maxSlots;
}

function purchasesOpen() {
  return !experimentHasEnded() && !slotsExhausted();
}

function isHttpUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function loadState() {
  paywallState = DEFAULT_STATE;
}

function setYear() {
  const nodes = document.querySelectorAll("#year");
  nodes.forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

function renderHome() {
  const video = document.getElementById("current-video");
  const source = document.getElementById("video-source");
  const empty = document.getElementById("video-empty");
  if (!video || !source) return;

  const price = slotPrice(paywallState.currentSlot);
  document.getElementById("slot-label").textContent = `SLOT #${paywallState.currentSlot}`;
  document.getElementById("slot-price").textContent = formatEuro(price);

  source.src = paywallState.currentVideoUrl || "";
  video.load();
  video.addEventListener("error", () => {
    empty.hidden = false;
  }, { once: true });
  video.addEventListener("loadeddata", () => {
    empty.hidden = true;
  }, { once: true });

  const cta = document.getElementById("contribute-btn");
  const ended = document.getElementById("experiment-ended");
  const soldOut = document.getElementById("slots-ended");
  const open = purchasesOpen();
  cta.disabled = !open;
  ended.hidden = !experimentHasEnded();
  soldOut.hidden = experimentHasEnded() || !slotsExhausted();

  const modalSlot = document.getElementById("modal-slot");
  const modalPrice = document.getElementById("modal-price");
  const modalCopy = document.getElementById("modal-copy");
  modalSlot.textContent = `SLOT #${paywallState.currentSlot}`;
  modalPrice.textContent = formatEuro(price);
  modalCopy.textContent = `You are purchasing Slot #${paywallState.currentSlot} for ${formatEuro(price)}.`;
  bindSocial("social-tiktok", paywallState.social.tiktok);
  bindSocial("social-instagram", paywallState.social.instagram);
  bindSocial("social-youtube", paywallState.social.youtube);
}

function bindSocial(id, href) {
  const node = document.getElementById(id);
  if (!node) return;
  if (isHttpUrl(href)) {
    node.href = href;
    node.hidden = false;
  } else {
    node.hidden = true;
  }
}

function renderSuccess() {
  const size = document.getElementById("max-size");
  if (size) size.textContent = `${paywallState.maxFileSizeMb} MB`;

  const uploadBtn = document.getElementById("upload-btn");
  const note = document.getElementById("upload-note");
  if (!uploadBtn) return;

  if (isHttpUrl(paywallState.uploadUrl) || paywallState.uploadUrl.startsWith("/") || paywallState.uploadUrl.startsWith("mailto:")) {
    uploadBtn.href = paywallState.uploadUrl;
    note.hidden = true;
  } else {
    uploadBtn.href = "#";
    uploadBtn.addEventListener("click", (event) => {
      event.preventDefault();
      note.hidden = false;
      note.textContent = "Configure uploadUrl in state.json with a dedicated upload-only destination.";
    });
  }
}

function openModal() {
  if (!purchasesOpen()) return;
  const modal = document.getElementById("pay-modal");
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("pay-card").focus();
}

function closeModal() {
  const modal = document.getElementById("pay-modal");
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = "";
  document.getElementById("contribute-btn")?.focus();
}

function redirectToPayment(kind) {
  const link = paywallState.paymentLinks[kind];
  const note = document.getElementById("pay-note");
  if (!isHttpUrl(link)) {
    note.hidden = false;
    note.textContent = `Set paymentLinks.${kind} in state.json to a public payment URL. No secrets belong in the frontend.`;
    return;
  }
  window.location.assign(link);
}

function bindHome() {
  const cta = document.getElementById("contribute-btn");
  if (!cta) return;

  cta.addEventListener("click", openModal);
  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  document.querySelector("[data-close]").addEventListener("click", closeModal);
  document.getElementById("pay-card").addEventListener("click", () => redirectToPayment("card"));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
}

async function init() {
  setYear();
  await loadState();
  renderHome();
  renderSuccess();
  bindHome();
}

init();
