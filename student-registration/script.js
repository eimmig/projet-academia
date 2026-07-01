const backButton = document.querySelector('[data-action="back"]');
const studentForm = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");
const studentEmptyState = document.getElementById("studentEmptyState");
const studentSearch = document.getElementById("studentSearch");
const toast = document.getElementById("toast");

const USERS_STORAGE_KEY = "gymAppUsers";
const STUDENTS_STORAGE_KEY = "gymAppStudents";
const LEVEL_OPTIONS = new Set(["Iniciante", "Intermediário", "Avançado"]);
const appState = { toastTimerId: null, searchTerm: "" };

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  globalThis.clearTimeout(appState.toastTimerId);
  appState.toastTimerId = globalThis.setTimeout(() => {
    toast.classList.remove("visible");
  }, 2200);
}

function loadUsers() {
  const raw = globalThis.localStorage.getItem(USERS_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function getCurrentUser() {
  const email = globalThis.localStorage.getItem("gymAppCurrentUser");
  if (!email) return null;
  return loadUsers().find((user) => user.email === email) || null;
}

function loadStudents() {
  const raw = globalThis.localStorage.getItem(STUDENTS_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveStudents(students) {
  globalThis.localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
}

function isDuplicateStudent(email) {
  const students = loadStudents();
  return students.some((student) => student.email === email);
}

function createStudentCard(student) {
  const item = document.createElement("li");
  item.className = "student-card";

  const title = document.createElement("h3");
  title.textContent = student.name;

  const email = document.createElement("p");
  email.textContent = student.email;

  const tags = document.createElement("div");
  tags.className = "student-tags";
  tags.innerHTML = `<span class="pill">${student.level}</span><span class="pill">${student.goal}</span><span class="pill">${student.frequency}</span>`;

  item.appendChild(title);
  item.appendChild(email);
  item.appendChild(tags);

  return item;
}

function renderStudents(professorEmail) {
  const term = appState.searchTerm.trim().toLowerCase();
  const students = loadStudents()
    .filter((student) => student.professorEmail === professorEmail)
    .filter((student) => !term || student.name.toLowerCase().includes(term) || student.email.toLowerCase().includes(term))
    .sort((a, b) => a.name.localeCompare(b.name));

  studentList.innerHTML = "";
  students.forEach((student) => {
    studentList.appendChild(createStudentCard(student));
  });

  studentEmptyState.classList.toggle("hidden", students.length > 0);
}

backButton.addEventListener("click", () => {
  globalThis.location.href = "../dashboard/index.html";
});

studentSearch.addEventListener("input", (event) => {
  appState.searchTerm = event.target.value;
  const currentUser = getCurrentUser();
  if (currentUser) renderStudents(currentUser.email);
});

studentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast("Faça login novamente para cadastrar alunos.");
    globalThis.setTimeout(() => {
      globalThis.location.href = "../index.html";
    }, 1200);
    return;
  }

  const name = document.getElementById("studentName").value.trim();
  const email = document.getElementById("studentEmail").value.trim().toLowerCase();
  const level = document.getElementById("studentLevel").value;
  const goal = document.getElementById("studentGoal").value;
  const frequency = document.getElementById("studentFrequency").value;

  if (!name || !email || !level || !goal || !frequency) {
    showToast("Preencha todos os campos para cadastrar o aluno.");
    return;
  }

  if (!LEVEL_OPTIONS.has(level)) {
    showToast("Selecione um nível físico válido.");
    return;
  }

  if (isDuplicateStudent(email)) {
    showToast("Já existe um aluno cadastrado com esse email.");
    return;
  }

  const students = loadStudents();
  students.push({
    id: `student_${Date.now()}`,
    name,
    email,
    level,
    goal,
    frequency,
    professorEmail: currentUser.email,
    createdAt: new Date().toISOString(),
  });
  saveStudents(students);

  studentForm.reset();
  showToast(`Aluno "${name}" cadastrado com sucesso!`);
  renderStudents(currentUser.email);
});

const currentUser = getCurrentUser();
if (currentUser) {
  renderStudents(currentUser.email);
} else {
  globalThis.location.href = "../index.html";
}
