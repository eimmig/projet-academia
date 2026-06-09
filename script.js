const loginForm = document.getElementById("loginForm");
const registerButton = document.querySelector('[data-action="register"]');
const toast = document.getElementById("toast");
const STORAGE_KEY = "gymAppUsers";

const appState = { toastTimerId: null };

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

function saveSession(email) {
  globalThis.localStorage.setItem("gymAppCurrentUser", email);
}

registerButton.addEventListener("click", () => {
  globalThis.location.href = "register/index.html";
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    showToast("Preencha email e senha para entrar.");
    return;
  }

  const users = loadUsers();
  const user = users.find((item) => item.email === email);

  if (!user) {
    showToast("Usuario nao encontrado. Registre-se primeiro.");
    return;
  }

  if (user.password !== password) {
    showToast("Senha incorreta. Verifique e tente novamente.");
    return;
  }

  saveSession(email);
  showToast("Login realizado. Abrindo seu app...");

  globalThis.setTimeout(() => {
    globalThis.location.href = "dashboard/index.html";
  }, 1000);
});
