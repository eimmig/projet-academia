const logoutButton = document.getElementById("logoutButton");
const libraryButton = document.getElementById("libraryButton");
const painRegistrationButton = document.getElementById("painRegistrationButton");
const recommendationsButton = document.getElementById("recommendationsButton");
const tabButtons = document.querySelectorAll(".tab-button");
const welcomeText = document.getElementById("welcomeText");
const toast = document.getElementById("toast");
const STORAGE_KEY = "gymAppUsers";

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  globalThis.clearTimeout(globalThis.dashboardToastTimer);
  globalThis.dashboardToastTimer = globalThis.setTimeout(() => {
    toast.classList.remove("visible");
  }, 2000);
}

function loadUsers() {
  const raw = globalThis.localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function getCurrentUser() {
  const email = globalThis.localStorage.getItem("gymAppCurrentUser");
  if (email) {
    return loadUsers().find((user) => user.email === email) || null;
  }
  return null;
}

const currentUser = getCurrentUser();
if (currentUser) {
  welcomeText.textContent = `Olá, ${currentUser.name}. Vamos ao treino?`;
  setupTabBar("Dashboard");
} else {
  globalThis.location.href = "../index.html";
}

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

libraryButton.addEventListener("click", () => {
  globalThis.location.href = "../video-library/index.html";
});

painRegistrationButton.addEventListener("click", () => {
  globalThis.location.href = "../pain-registration/index.html";
});

recommendationsButton.addEventListener("click", () => {
  globalThis.location.href = "../recommendations/index.html";
});

logoutButton.addEventListener("click", () => {
  globalThis.localStorage.removeItem("gymAppCurrentUser");
  showToast("Sessao encerrada.");
  globalThis.setTimeout(() => {
    globalThis.location.href = "../index.html";
  }, 900);
});
