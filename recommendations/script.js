const backButton = document.querySelector('[data-action="back"]');
const allowedList = document.getElementById("allowedList");
const blockedList = document.getElementById("blockedList");
const profileMessage = document.getElementById("profileMessage");
const toast = document.getElementById("toast");
const tabButtons = document.querySelectorAll(".tab-button");
const STORAGE_KEY = "gymAppUsers";

const difficultyRank = {
  Iniciante: 0,
  Intermediário: 1,
  Avançado: 2,
};

const exercises = [
  {
    id: 1,
    name: "Agachamento",
    muscle: "Quadríceps",
    targets: ["Joelho", "Quadril"],
    minLevel: 1,
    description: "Agachamento com foco em pernas e core.",
  },
  {
    id: 2,
    name: "Remada baixa",
    muscle: "Dorsal",
    targets: ["Ombro", "Cervical"],
    minLevel: 0,
    description: "Remada com postura protegida para a coluna.",
  },
  {
    id: 3,
    name: "Elevação lateral",
    muscle: "Ombros",
    targets: ["Ombro"],
    minLevel: 0,
    description: "Elevação lateral para fortalecimento de ombro.",
  },
  {
    id: 4,
    name: "Prancha",
    muscle: "Core",
    targets: ["Lombar"],
    minLevel: 0,
    description: "Prancha para estabilização do abdômen e lombar.",
  },
  {
    id: 5,
    name: "Super-homem",
    muscle: "Costas",
    targets: ["Cervical", "Lombar"],
    minLevel: 1,
    description: "Exercício de extensão para costas e postura.",
  }
];

const levelGuidance = {
  Iniciante: "Treino leve e progressivo, com foco em técnica e segurança.",
  Intermediário: "Treino equilibrado para melhorar consistência e força.",
  Avançado: "Treino mais desafiador, com opção de progressão para alto desempenho.",
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  globalThis.clearTimeout(globalThis.recommendationsToastTimer);
  globalThis.recommendationsToastTimer = globalThis.setTimeout(() => {
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

function isCompletedToday(history, exerciseId) {
  const today = new Date().toISOString().slice(0, 10);
  return history.some((entry) => entry.exerciseId === exerciseId && entry.completedAt.slice(0, 10) === today);
}

function registerWorkoutCompletion(exercise) {
  const users = loadUsers();
  const email = getCurrentUserEmail();
  const index = users.findIndex((user) => user.email === email);
  if (index === -1) return false;

  users[index].workoutHistory = users[index].workoutHistory || [];

  if (isCompletedToday(users[index].workoutHistory, exercise.id)) {
    return false;
  }

  users[index].workoutHistory.push({
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    completedAt: new Date().toISOString(),
  });
  saveUsers(users);
  return true;
}

function buildRestrictionMap(restrictions) {
  const map = new Map();
  restrictions.forEach((restriction) => {
    if (!restriction.region) return;
    const region = restriction.region;
    const reason = `${restriction.type} na região de ${region}: ${restriction.detail}`;
    map.set(region, reason);
  });
  return map;
}

function isExerciseSuitableForLevel(exercise, level) {
  if (!level || !difficultyRank.hasOwnProperty(level)) return true;
  return difficultyRank[level] >= exercise.minLevel;
}

function requiredLevelText(minLevel) {
  if (minLevel === 2) return "Avançado";
  return "Intermediário";
}

function createExerciseCard(exercise, status, reason = "", completedToday = false) {
  const item = document.createElement("li");
  item.className = "exercise-card";

  const title = document.createElement("div");
  title.innerHTML = `<h3>${exercise.name}</h3><span class="exercise-status ${status}">${status === "allowed" ? "Permitido" : "Bloqueado"}</span>`;

  const description = document.createElement("p");
  description.textContent = exercise.description;

  item.appendChild(title);
  item.appendChild(description);

  if (status === "blocked") {
    const reasonElement = document.createElement("div");
    reasonElement.className = "exercise-reason";
    reasonElement.textContent = `Motivo: ${reason}`;
    item.appendChild(reasonElement);
  }

  if (status === "allowed") {
    const completeButton = document.createElement("button");
    completeButton.type = "button";
    completeButton.className = "btn-complete";
    completeButton.dataset.action = "complete";
    completeButton.dataset.exerciseId = exercise.id;
    completeButton.textContent = completedToday ? "Concluído hoje ✓" : "Concluir treino";
    completeButton.disabled = completedToday;
    if (completedToday) completeButton.classList.add("completed");
    item.appendChild(completeButton);
  }

  return item;
}

function renderRecommendations() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    globalThis.location.href = "../index.html";
    return;
  }

  const userLevel = currentUser.level || null;
  const restrictions = Array.isArray(currentUser.restrictions) ? currentUser.restrictions : [];
  const restrictedRegions = buildRestrictionMap(restrictions);
  const workoutHistory = Array.isArray(currentUser.workoutHistory) ? currentUser.workoutHistory : [];

  const levelSummary = userLevel ? `Nível físico: ${userLevel}.` : "Nível físico não definido. Atualize seu perfil para recomendações mais precisas.";
  const levelGuidanceText = userLevel ? levelGuidance[userLevel] : "Selecione um nível para ajustar suas sugestões.";

  if (restrictions.length === 0) {
    profileMessage.innerHTML = `${levelSummary} ${levelGuidanceText} Seu perfil não apresenta restrições. Todos os exercícios abaixo são permitidos, mas continue atento à execução correta.`;
  } else {
    profileMessage.innerHTML = `${levelSummary} ${levelGuidanceText} Encontramos ${restrictions.length} restrição(ões) no seu perfil. Os exercícios bloqueados possuem explicação do motivo.`;
  }

  allowedList.innerHTML = "";
  blockedList.innerHTML = "";

  exercises.forEach((exercise) => {
    const conflictRegion = exercise.targets.find((target) => restrictedRegions.has(target));
    const suitable = isExerciseSuitableForLevel(exercise, userLevel);

    if (!suitable) {
      const reason = `Ajuste de nível físico: recomendado a partir de ${requiredLevelText(exercise.minLevel)}.`;
      blockedList.appendChild(createExerciseCard(exercise, "blocked", reason));
      return;
    }

    if (conflictRegion) {
      const reason = restrictedRegions.get(conflictRegion);
      blockedList.appendChild(createExerciseCard(exercise, "blocked", reason));
    } else {
      const completedToday = isCompletedToday(workoutHistory, exercise.id);
      allowedList.appendChild(createExerciseCard(exercise, "allowed", "", completedToday));
    }
  });

  if (allowedList.childElementCount === 0) {
    const empty = document.createElement("li");
    empty.className = "exercise-card";
    empty.innerHTML = `<p>Nenhum exercício seguro encontrado. Revise suas restrições ou atualize seu nível físico.</p>`;
    allowedList.appendChild(empty);
  }

  if (blockedList.childElementCount === 0) {
    const empty = document.createElement("li");
    empty.className = "exercise-card";
    empty.innerHTML = `<p>Não há exercícios bloqueados no momento.</p>`;
    blockedList.appendChild(empty);
  }
}

backButton.addEventListener("click", () => {
  globalThis.location.href = "../dashboard/index.html";
});

allowedList.addEventListener("click", (event) => {
  const button = event.target.closest('[data-action="complete"]');
  if (!button || button.disabled) return;

  const exerciseId = Number(button.dataset.exerciseId);
  const exercise = exercises.find((item) => item.id === exerciseId);
  if (!exercise) return;

  const registered = registerWorkoutCompletion(exercise);
  if (registered) {
    showToast(`Treino "${exercise.name}" registrado como concluído!`);
    renderRecommendations();
  } else {
    showToast("Esse treino já foi registrado como concluído hoje.");
  }
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

setupTabBar("Recomendações");
renderRecommendations();
