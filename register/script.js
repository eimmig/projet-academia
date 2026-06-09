const registerForm = document.getElementById("registerForm");
const toast = document.getElementById("toast");
const backButtons = document.querySelectorAll('[data-action="back"]');

const appState = { toastTimerId: null };
const STORAGE_KEY = "gymAppUsers";

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

backButtons.forEach((button) => {
  button.addEventListener("click", () => {
    globalThis.location.href = "../index.html";
  });
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("userName").value.trim();
  const email = document.getElementById("userEmail").value.trim().toLowerCase();
  const password = document.getElementById("userPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (!name || !email || !password || !confirmPassword) {
    showToast("Preencha todos os campos para continuar.");
    return;
  }

  if (password !== confirmPassword) {
    showToast("As senhas nao coincidem.");
    return;
  }

  const users = loadUsers();
  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    showToast("Esse email ja esta cadastrado.");
    return;
  }

  users.push({ name, email, password });
  saveUsers(users);
  showToast("Cadastro concluido. Redirecionando para login...");

  globalThis.setTimeout(() => {
    globalThis.location.href = "../index.html";
  }, 1200);
});
