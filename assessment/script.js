const assessmentForm = document.getElementById("assessmentForm");
const toast = document.getElementById("toast");
const profileSummary = document.getElementById("profileSummary");
const payloadOutput = document.getElementById("payloadOutput");
const backButtons = document.querySelectorAll('[data-action="back"]');

const appState = { toastTimerId: null };

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  globalThis.clearTimeout(appState.toastTimerId);
  appState.toastTimerId = globalThis.setTimeout(() => {
    toast.classList.remove("visible");
  }, 2000);
}

backButtons.forEach((button) => {
  button.addEventListener("click", () => {
    globalThis.location.href = "../index.html";
  });
});

function buildProfilePayload(formData) {
  return {
    goal: formData.get("goal"),
    frequency: formData.get("frequency"),
    level: formData.get("level"),
    limitation: formData.get("limitation")
  };
}

function renderPayload(payload) {
  payloadOutput.textContent = JSON.stringify(payload, null, 2);
  profileSummary.classList.remove("hidden");
}

assessmentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(assessmentForm);

  const requiredFields = ["goal", "frequency", "level", "limitation"];
  const missingField = requiredFields.find((field) => !formData.get(field));

  if (missingField) {
    showToast("Por favor, responda todas as perguntas antes de avançar.");
    return;
  }

  const payload = buildProfilePayload(formData);
  renderPayload(payload);
  showToast("Avaliação inicial estruturada com sucesso.");
});
