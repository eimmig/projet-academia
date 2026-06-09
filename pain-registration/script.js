const painForm = document.getElementById("painForm");
const regionGrid = document.getElementById("regionGrid");
const regionInput = document.getElementById("regionInput");
const summaryPanel = document.getElementById("restrictionSummary");
const summaryContent = document.getElementById("summaryContent");
const toast = document.getElementById("toast");
const backButtons = document.querySelectorAll('[data-action="back"]');
const tabButtons = document.querySelectorAll(".tab-button");
const STORAGE_KEY = "gymAppUsers";

const regionsCatalog = new Set(["Lombar", "Joelho", "Ombro", "Cervical", "Quadril", "Tornozelo"]);
const appState = { selectedRegion: null, toastTimerId: null };

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  globalThis.clearTimeout(appState.toastTimerId);
  appState.toastTimerId = globalThis.setTimeout(() => {
    toast.classList.remove("visible");
  }, 2200);
}

function loadUsers() {
  const raw = globalThis.localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getCurrentUserEmail() {
  return globalThis.localStorage.getItem("gymAppCurrentUser");
}

function getCurrentUser() {
  const email = getCurrentUserEmail();
  if (!email) return null;
  return loadUsers().find((user) => user.email === email) || null;
}

function saveRestriction(restriction) {
  const users = loadUsers();
  const email = getCurrentUserEmail();
  const index = users.findIndex((user) => user.email === email);
  if (index === -1) {
    return false;
  }

  users[index].restrictions = users[index].restrictions || [];
  users[index].restrictions.push(restriction);
  saveUsers(users);
  return true;
}

function renderSummary(restriction) {
  summaryContent.innerHTML = `
    <p><strong>Região:</strong> ${restriction.region}</p>
    <p><strong>Tipo:</strong> ${restriction.type}</p>
    <p><strong>Descrição:</strong> ${restriction.detail}</p>
  `;
  summaryPanel.classList.remove("hidden");
}

function setActiveRegion(button) {
  document.querySelectorAll(".region-button").forEach((item) => {
    item.classList.toggle("active", item === button);
  });
  const region = button.dataset.region;
  appState.selectedRegion = region;
  regionInput.value = region;
}

regionGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".region-button");
  if (!button) return;
  setActiveRegion(button);
});

backButtons.forEach((button) => {
  button.addEventListener("click", () => {
    globalThis.location.href = "../dashboard/index.html";
  });
});

painForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(painForm);
  const region = formData.get("region");
  const type = formData.get("type");
  const detail = formData.get("detail")?.trim();

  if (!region || !regionsCatalog.has(region)) {
    showToast("Selecione uma região válida antes de salvar.");
    return;
  }

  if (!type) {
    showToast("Escolha se é dor ou lesão.");
    return;
  }

  if (!detail) {
    showToast("Descreva a dor ou lesão para continuar.");
    return;
  }

  const restriction = {
    region,
    type,
    detail,
    createdAt: new Date().toISOString()
  };

  const saved = saveRestriction(restriction);
  if (!saved) {
    showToast("Não foi possível salvar. Faça login novamente.");
    globalThis.setTimeout(() => {
      globalThis.location.href = "../index.html";
    }, 1200);
    return;
  }

  renderSummary(restriction);
  showToast("Restrição salva no perfil com sucesso.");
});

function setupTabBar(currentPage) {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.page === currentPage);
    const target = button.dataset.target;
    button.addEventListener("click", () => {
      if (target) {
        globalThis.location.href = target;
      }
    });
  });
}

const currentUser = getCurrentUser();
if (currentUser) {
  setupTabBar("Dores");
} else {
  globalThis.location.href = "../index.html";
}
