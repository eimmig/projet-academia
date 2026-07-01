const backButton = document.querySelector('[data-action="back"]');
const sheetForm = document.getElementById("sheetForm");
const sheetStudent = document.getElementById("sheetStudent");
const sheetLevel = document.getElementById("sheetLevel");
const sheetModality = document.getElementById("sheetModality");
const exerciseChecklist = document.getElementById("exerciseChecklist");
const sheetList = document.getElementById("sheetList");
const sheetEmptyState = document.getElementById("sheetEmptyState");
const toast = document.getElementById("toast");

const USERS_STORAGE_KEY = "gymAppUsers";
const STUDENTS_STORAGE_KEY = "gymAppStudents";
const SHEETS_STORAGE_KEY = "gymAppTrainingSheets";
const appState = { toastTimerId: null };

const MODALITY_OPTIONS = new Set([
  "Musculação",
  "Corrida",
  "Natação",
  "Ciclismo",
  "Funcional/Crossfit",
  "Yoga/Pilates",
  "Lutas/Artes marciais",
  "Outro",
]);

const INTENSITY_OPTIONS = ["Leve", "Moderada", "Intensa"];
const INTENSITY_RANK = { Leve: 0, Moderada: 1, Intensa: 2 };

const LEVEL_DEFAULTS = {
  Iniciante: { sets: 2, reps: 12, intensity: "Leve", rest: "90s" },
  Intermediário: { sets: 3, reps: 10, intensity: "Moderada", rest: "60s" },
  Avançado: { sets: 4, reps: 8, intensity: "Intensa", rest: "45s" },
};

const LEVEL_MAX_INTENSITY = {
  Iniciante: "Leve",
  Intermediário: "Moderada",
  Avançado: "Intensa",
};

const LEVEL_OPTIONS = new Set(["Iniciante", "Intermediário", "Avançado"]);

const exercises = [
  { id: 1, name: "Agachamento" },
  { id: 2, name: "Remada baixa" },
  { id: 3, name: "Elevação lateral" },
  { id: 4, name: "Prancha" },
  { id: 5, name: "Super-homem" },
];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  globalThis.clearTimeout(appState.toastTimerId);
  appState.toastTimerId = globalThis.setTimeout(() => {
    toast.classList.remove("visible");
  }, 2400);
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

function getStudentLevel(email) {
  if (!email) return null;
  const student = loadStudents().find((item) => item.email === email);
  return student ? student.level : null;
}

function updateStudentLevel(email, level) {
  if (!email) return;
  const students = loadStudents();
  const student = students.find((item) => item.email === email);
  if (!student || student.level === level) return;
  student.level = level;
  saveStudents(students);
}

function isIntensityAllowed(level, intensity) {
  const maxIntensity = LEVEL_MAX_INTENSITY[level];
  if (!maxIntensity) return true;
  return INTENSITY_RANK[intensity] <= INTENSITY_RANK[maxIntensity];
}

function findUnsafeExercise(exercises, level) {
  return exercises.find((exercise) => !isIntensityAllowed(level, exercise.intensity));
}

function loadSheets() {
  const raw = globalThis.localStorage.getItem(SHEETS_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveSheets(sheets) {
  globalThis.localStorage.setItem(SHEETS_STORAGE_KEY, JSON.stringify(sheets));
}

function populateExerciseChecklist() {
  exerciseChecklist.innerHTML = "";
  exercises.forEach((exercise) => {
    const row = document.createElement("div");
    row.className = "exercise-row";

    const label = document.createElement("label");
    label.className = "checkbox-label";
    label.innerHTML = `<input type="checkbox" name="exercise" value="${exercise.id}" data-exercise-checkbox /> ${exercise.name}`;
    row.appendChild(label);

    const params = document.createElement("div");
    params.className = "exercise-params";
    params.dataset.exerciseParams = exercise.id;
    params.innerHTML = `
      <input class="form-input small" type="number" min="1" placeholder="Séries" data-field="sets" disabled />
      <input class="form-input small" type="number" min="1" placeholder="Repetições" data-field="reps" disabled />
      <select class="form-input small" data-field="intensity" disabled>
        <option value="">Intensidade</option>
        ${INTENSITY_OPTIONS.map((option) => `<option value="${option}">${option}</option>`).join("")}
      </select>
      <input class="form-input small" type="text" placeholder="Descanso (ex: 60s)" data-field="rest" disabled />
    `;
    row.appendChild(params);

    exerciseChecklist.appendChild(row);
  });
}

exerciseChecklist.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-exercise-checkbox]");
  if (!checkbox) return;

  const params = exerciseChecklist.querySelector(`[data-exercise-params="${checkbox.value}"]`);
  if (!params) return;

  params.querySelectorAll("input, select").forEach((field) => {
    field.disabled = !checkbox.checked;
    if (!checkbox.checked) field.value = "";
  });

  if (checkbox.checked) {
    const defaults = LEVEL_DEFAULTS[sheetLevel.value];
    if (defaults) {
      params.querySelector('[data-field="sets"]').value = defaults.sets;
      params.querySelector('[data-field="reps"]').value = defaults.reps;
      params.querySelector('[data-field="intensity"]').value = defaults.intensity;
      params.querySelector('[data-field="rest"]').value = defaults.rest;
    }
  }
});

sheetStudent.addEventListener("change", () => {
  const level = getStudentLevel(sheetStudent.value);
  if (level && LEVEL_OPTIONS.has(level)) {
    sheetLevel.value = level;
  }
});

function populateStudentSelect(select, students, selectedEmail) {
  select.innerHTML = '<option value="">Sem aluno vinculado</option>';
  students.forEach((student) => {
    const option = document.createElement("option");
    option.value = student.email;
    option.textContent = student.level ? `${student.name} (${student.level})` : student.name;
    if (student.email === selectedEmail) option.selected = true;
    select.appendChild(option);
  });
}

function createSheetCard(sheet, students) {
  const item = document.createElement("li");
  item.className = "sheet-card";

  if (sheet.duplicatedFrom) {
    const badge = document.createElement("span");
    badge.className = "origin-badge";
    badge.textContent = `Cópia de: ${sheet.duplicatedFrom.name}`;
    item.appendChild(badge);
  }

  const title = document.createElement("h3");
  title.textContent = sheet.name;
  item.appendChild(title);

  const modality = document.createElement("p");
  modality.textContent = `Modalidade: ${sheet.modality}`;
  item.appendChild(modality);

  if (sheet.duplicatedFrom) {
    const warning = document.createElement("p");
    warning.className = "review-warning";
    warning.textContent = "⚠️ Esta é uma cópia. Revise as restrições do aluno antes de vincular esta ficha.";
    item.appendChild(warning);
  }

  const studentLabel = document.createElement("label");
  studentLabel.className = "field-label";
  studentLabel.textContent = "Aluno vinculado";
  item.appendChild(studentLabel);

  const studentSelect = document.createElement("select");
  studentSelect.className = "form-input";
  studentSelect.dataset.action = "assign-student";
  studentSelect.dataset.sheetId = sheet.id;
  populateStudentSelect(studentSelect, students, sheet.studentEmail);
  item.appendChild(studentSelect);

  const levelLabel = document.createElement("label");
  levelLabel.className = "field-label";
  levelLabel.textContent = "Nível físico do aluno";
  item.appendChild(levelLabel);

  const levelSelect = document.createElement("select");
  levelSelect.className = "form-input";
  levelSelect.dataset.action = "update-level";
  levelSelect.dataset.sheetId = sheet.id;
  levelSelect.disabled = !sheet.studentEmail;
  levelSelect.innerHTML = ['<option value="">Escolha o nível</option>', ...Array.from(LEVEL_OPTIONS).map((level) => `<option value="${level}">${level}</option>`)].join("");
  const currentLevel = getStudentLevel(sheet.studentEmail);
  if (currentLevel) levelSelect.value = currentLevel;
  item.appendChild(levelSelect);

  const exerciseTags = document.createElement("div");
  exerciseTags.className = "exercise-tags";
  exerciseTags.innerHTML = sheet.exercises
    .map((exercise) => `<span class="pill">${exercise.name} — ${exercise.sets}x${exercise.reps} (${exercise.intensity}) · Descanso ${exercise.rest}</span>`)
    .join("");
  item.appendChild(exerciseTags);

  const actions = document.createElement("div");
  actions.className = "sheet-actions";

  const duplicateButton = document.createElement("button");
  duplicateButton.type = "button";
  duplicateButton.className = "btn-secondary";
  duplicateButton.dataset.action = "duplicate";
  duplicateButton.dataset.sheetId = sheet.id;
  duplicateButton.textContent = "Duplicar ficha";
  actions.appendChild(duplicateButton);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "btn-danger";
  deleteButton.dataset.action = "delete";
  deleteButton.dataset.sheetId = sheet.id;
  deleteButton.textContent = "Excluir";
  actions.appendChild(deleteButton);

  item.appendChild(actions);

  return item;
}

function renderSheets(professorEmail) {
  const sheets = loadSheets()
    .filter((sheet) => sheet.professorEmail === professorEmail)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const students = loadStudents().filter((student) => student.professorEmail === professorEmail);

  sheetList.innerHTML = "";
  sheets.forEach((sheet) => {
    sheetList.appendChild(createSheetCard(sheet, students));
  });

  sheetEmptyState.classList.toggle("hidden", sheets.length > 0);
}

backButton.addEventListener("click", () => {
  globalThis.location.href = "../dashboard/index.html";
});

sheetForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast("Faça login novamente para criar fichas.");
    globalThis.setTimeout(() => {
      globalThis.location.href = "../index.html";
    }, 1200);
    return;
  }

  const name = document.getElementById("sheetName").value.trim();
  const studentEmail = sheetStudent.value || null;
  const level = sheetLevel.value;
  const modality = sheetModality.value;

  const checkedBoxes = Array.from(exerciseChecklist.querySelectorAll('input[name="exercise"]:checked'));
  const selectedExercises = checkedBoxes.map((checkbox) => {
    const exercise = exercises.find((item) => item.id === Number(checkbox.value));
    const params = exerciseChecklist.querySelector(`[data-exercise-params="${checkbox.value}"]`);
    const sets = Number(params.querySelector('[data-field="sets"]').value) || 3;
    const reps = Number(params.querySelector('[data-field="reps"]').value) || 10;
    const intensity = params.querySelector('[data-field="intensity"]').value || "Moderada";
    const rest = params.querySelector('[data-field="rest"]').value.trim() || "60s";
    return { id: exercise.id, name: exercise.name, sets, reps, intensity, rest };
  });

  if (!name) {
    showToast("Informe um nome para a ficha.");
    return;
  }

  if (!level || !LEVEL_OPTIONS.has(level)) {
    showToast("Selecione o nível físico do aluno.");
    return;
  }

  if (!modality || !MODALITY_OPTIONS.has(modality)) {
    showToast("Selecione uma modalidade para a ficha.");
    return;
  }

  if (selectedExercises.length === 0) {
    showToast("Selecione ao menos um exercício para a ficha.");
    return;
  }

  const unsafeExercise = findUnsafeExercise(selectedExercises, level);
  if (unsafeExercise) {
    showToast(`Nível ${level} não pode receber intensidade "${unsafeExercise.intensity}" em "${unsafeExercise.name}". Ajuste antes de salvar.`);
    return;
  }

  updateStudentLevel(studentEmail, level);

  const sheets = loadSheets();
  sheets.push({
    id: `sheet_${Date.now()}`,
    name,
    studentEmail,
    modality,
    exercises: selectedExercises,
    professorEmail: currentUser.email,
    createdAt: new Date().toISOString(),
    duplicatedFrom: null,
  });
  saveSheets(sheets);

  sheetForm.reset();
  showToast(`Ficha "${name}" criada com sucesso!`);
  renderSheets(currentUser.email);
});

sheetList.addEventListener("click", (event) => {
  const button = event.target.closest('[data-action="duplicate"]');
  if (!button) return;

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const sheets = loadSheets();
  const original = sheets.find((sheet) => sheet.id === button.dataset.sheetId);
  if (!original) return;

  const copy = {
    id: `sheet_${Date.now()}`,
    name: `${original.name} (Cópia)`,
    studentEmail: null,
    modality: original.modality,
    exercises: original.exercises.map((exercise) => ({ ...exercise })),
    professorEmail: currentUser.email,
    createdAt: new Date().toISOString(),
    duplicatedFrom: { id: original.id, name: original.name },
  };
  sheets.push(copy);
  saveSheets(sheets);

  showToast(`Cópia de "${original.name}" criada. Vincule um aluno e revise as restrições.`);
  renderSheets(currentUser.email);
});

sheetList.addEventListener("click", (event) => {
  const button = event.target.closest('[data-action="delete"]');
  if (!button) return;

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const sheets = loadSheets();
  const sheet = sheets.find((item) => item.id === button.dataset.sheetId);
  if (!sheet) return;

  const confirmed = globalThis.confirm(`Excluir a ficha "${sheet.name}"? Essa ação não pode ser desfeita.`);
  if (!confirmed) return;

  saveSheets(sheets.filter((item) => item.id !== sheet.id));
  showToast(`Ficha "${sheet.name}" excluída.`);
  renderSheets(currentUser.email);
});

sheetList.addEventListener("change", (event) => {
  const select = event.target.closest('[data-action="assign-student"]');
  if (!select) return;

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const sheets = loadSheets();
  const sheet = sheets.find((item) => item.id === select.dataset.sheetId);
  if (!sheet) return;

  const newEmail = select.value || null;
  const newLevel = getStudentLevel(newEmail);
  const unsafeExercise = findUnsafeExercise(sheet.exercises, newLevel);
  if (unsafeExercise) {
    showToast(`Não é possível vincular: nível ${newLevel} não pode receber intensidade "${unsafeExercise.intensity}" em "${unsafeExercise.name}".`);
    select.value = sheet.studentEmail || "";
    return;
  }

  sheet.studentEmail = newEmail;
  saveSheets(sheets);
  showToast("Aluno vinculado à ficha atualizado.");
  renderSheets(currentUser.email);
});

sheetList.addEventListener("change", (event) => {
  const select = event.target.closest('[data-action="update-level"]');
  if (!select) return;

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const sheets = loadSheets();
  const sheet = sheets.find((item) => item.id === select.dataset.sheetId);
  if (!sheet?.studentEmail) return;

  const newLevel = select.value;
  if (!newLevel || !LEVEL_OPTIONS.has(newLevel)) return;

  const unsafeExercise = findUnsafeExercise(sheet.exercises, newLevel);
  if (unsafeExercise) {
    showToast(`Não é possível aplicar: nível ${newLevel} não pode receber intensidade "${unsafeExercise.intensity}" em "${unsafeExercise.name}".`);
    select.value = getStudentLevel(sheet.studentEmail) || "";
    return;
  }

  updateStudentLevel(sheet.studentEmail, newLevel);
  showToast("Nível físico do aluno atualizado.");
  renderSheets(currentUser.email);
});

const currentUser = getCurrentUser();
if (currentUser) {
  populateExerciseChecklist();
  populateStudentSelect(sheetStudent, loadStudents().filter((student) => student.professorEmail === currentUser.email), null);
  renderSheets(currentUser.email);
} else {
  globalThis.location.href = "../index.html";
}
