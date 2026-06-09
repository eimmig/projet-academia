const backButton = document.querySelector('[data-action="back"]');
const allowedList = document.getElementById("allowedList");
const blockedList = document.getElementById("blockedList");
const profileMessage = document.getElementById("profileMessage");
const toast = document.getElementById("toast");
const tabButtons = document.querySelectorAll(".tab-button");
const STORAGE_KEY = "gymAppUsers";

const exercises = [
  {
    id: 1,
    name: "Agachamento",
    muscle: "Quadríceps",
    targets: ["Joelho", "Quadril"],
    description: "Agachamento com foco em pernas e core.",
  },
  {
    id: 2,
    name: "Remada baixa",
    muscle: "Dorsal",
    targets: ["Ombro", "Cervical"],
    description: "Remada com postura protegida para a coluna.",
  },
  {
    id: 3,
    name: "Elevação lateral",
    muscle: "Ombros",
    targets: ["Ombro"],
    description: "Elevação lateral para fortalecimento de ombro.",
  },
  {
    id: 4,
    name: "Prancha",
    muscle: "Core",
    targets: ["Lombar"],
    description: "Prancha para estabilização do abdômen e lombar.",
  },
  {
    id: 5,
    name: "Super-homem",
    muscle: "Costas",
    targets: ["Cervical", "Lombar"],
    description: "Exercício de extensão para costas e postura.",
  }
];

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

function getCurrentUser() {
  const email = globalThis.localStorage.getItem("gymAppCurrentUser");
  if (!email) return null;
  return loadUsers().find((user) => user.email === email) || null;
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

function createExerciseCard(exercise, status, reason = "") {
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

  return item;
}

function renderRecommendations() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    globalThis.location.href = "../index.html";
    return;
  }

  const restrictions = Array.isArray(currentUser.restrictions) ? currentUser.restrictions : [];
  const restrictedRegions = buildRestrictionMap(restrictions);

  if (restrictions.length === 0) {
    profileMessage.textContent = "Seu perfil não apresenta restrições. Todos os exercícios abaixo são permitidos, mas continue atento à execução correta.";
  } else {
    profileMessage.textContent = `Encontramos ${restrictions.length} restrição(ões) no seu perfil. Os exercícios bloqueados possuem explicação do motivo.`;
  }

  allowedList.innerHTML = "";
  blockedList.innerHTML = "";

  exercises.forEach((exercise) => {
    const conflictRegion = exercise.targets.find((target) => restrictedRegions.has(target));
    if (conflictRegion) {
      const reason = restrictedRegions.get(conflictRegion);
      blockedList.appendChild(createExerciseCard(exercise, "blocked", reason));
    } else {
      allowedList.appendChild(createExerciseCard(exercise, "allowed"));
    }
  });

  if (allowedList.childElementCount === 0) {
    const empty = document.createElement("li");
    empty.className = "exercise-card";
    empty.innerHTML = `<p>Nenhum exercício seguro encontrado. Revise suas restrições ou consulte um profissional.</p>`;
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
