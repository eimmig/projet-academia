const exercises = [
  {
    id: 1,
    name: "Agachamento guiado",
    muscle: "Quadriceps",
    hasVideo: true,
    videoSrc: "media/agachamento.mp4",
    instructions: [
      "Ajuste o banco para alinhar com o quadril.",
      "Mantenha os pes firmes e costas apoiadas.",
      "Desca controlado ate 90 graus.",
      "Empurre de volta sem travar o joelho."
    ]
  },
  {
    id: 2,
    name: "Remada baixa",
    muscle: "Dorsal",
    hasVideo: true,
    videoSrc: "media/remada.mp4",
    instructions: [
      "Segure o triangulo com ombros relaxados.",
      "Puxe em direcao ao abdome.",
      "Mantenha o tronco estavel.",
      "Retorne devagar mantendo tensao."
    ]
  },
  {
    id: 3,
    name: "Elevacao lateral",
    muscle: "Ombros",
    hasVideo: false,
    videoSrc: "",
    instructions: [
      "Use halteres leves para controle.",
      "Eleve ate a linha do ombro.",
      "Evite balancar o tronco.",
      "Desca lentamente mantendo postura."
    ]
  }
];

const appState = {
  selectedId: exercises[0]?.id ?? null,
  filter: "all",
  activeTab: "Biblioteca",
  toastTimerId: null
};

const exerciseList = document.getElementById("exerciseList");
const exerciseName = document.getElementById("exerciseName");
const exerciseMeta = document.getElementById("exerciseMeta");
const muscleTag = document.getElementById("muscleTag");
const instructionList = document.getElementById("instructionList");
const videoWrapper = document.getElementById("videoWrapper");
const videoFallback = document.getElementById("videoFallback");
const exerciseVideo = document.getElementById("exerciseVideo");
const mediaCount = document.getElementById("mediaCount");
const emptyState = document.getElementById("emptyState");
const filterBar = document.querySelector(".filter-bar");
const tabButtons = document.querySelectorAll(".tab-button");
const actionButtons = document.querySelectorAll("[data-action]");
const toast = document.getElementById("toast");

function getFilteredExercises() {
  if (appState.filter === "withVideo") {
    return exercises.filter((exercise) => exercise.hasVideo);
  }

  if (appState.filter === "withoutVideo") {
    return exercises.filter((exercise) => !exercise.hasVideo);
  }

  return exercises;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(appState.toastTimerId);
  appState.toastTimerId = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 2200);
}

function renderList() {
  const filteredExercises = getFilteredExercises();
  if (!filteredExercises.some((item) => item.id === appState.selectedId)) {
    appState.selectedId = filteredExercises[0]?.id ?? null;
  }

  exerciseList.innerHTML = "";
  filteredExercises.forEach((exercise) => {
    const listItem = document.createElement("li");
    listItem.className = "exercise-item";
    if (exercise.id === appState.selectedId) {
      listItem.classList.add("active");
    }

    listItem.dataset.id = exercise.id;

    const info = document.createElement("div");
    const title = document.createElement("p");
    title.className = "exercise-title";
    title.textContent = exercise.name;

    const meta = document.createElement("p");
    meta.className = "exercise-meta";
    meta.textContent = `Grupo: ${exercise.muscle}`;

    info.appendChild(title);
    info.appendChild(meta);

    const status = document.createElement("span");
    status.className = "pill";
    status.classList.add(exercise.hasVideo ? "pill--ok" : "pill--warn");
    status.textContent = exercise.hasVideo ? "Video ok" : "Sem video";

    listItem.appendChild(info);
    listItem.appendChild(status);
    exerciseList.appendChild(listItem);
  });

  const availableCount = exercises.filter((exercise) => exercise.hasVideo).length;
  const filteredCount = filteredExercises.length;
  mediaCount.textContent = `${filteredCount}/${exercises.length} midias`;
  emptyState.classList.toggle("visible", filteredCount === 0);
}

function renderDetail() {
  const exercise = exercises.find((item) => item.id === appState.selectedId);
  if (!exercise) {
    exerciseName.textContent = "Sem exercicios";
    exerciseMeta.textContent = "Selecione um filtro diferente.";
    muscleTag.textContent = "-";
    instructionList.innerHTML = "";
    videoWrapper.style.display = "none";
    videoFallback.classList.add("active");
    return;
  }

  exerciseName.textContent = exercise.name;
  exerciseMeta.textContent = `Grupo muscular: ${exercise.muscle}`;
  muscleTag.textContent = exercise.muscle;

  instructionList.innerHTML = "";
  exercise.instructions.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    instructionList.appendChild(li);
  });

  if (exercise.hasVideo && exercise.videoSrc) {
    videoWrapper.style.display = "block";
    videoFallback.classList.remove("active");
    exerciseVideo.src = exercise.videoSrc;
    exerciseVideo.load();
  } else {
    videoWrapper.style.display = "none";
    videoFallback.classList.add("active");
    exerciseVideo.removeAttribute("src");
  }
}

function renderTabs() {
  tabButtons.forEach((button) => {
    const isActive = button.textContent === appState.activeTab;
    button.classList.toggle("active", isActive);
  });
}

exerciseList.addEventListener("click", (event) => {
  const target = event.target.closest(".exercise-item");
  if (!target) {
    return;
  }

  appState.selectedId = Number(target.dataset.id);
  renderList();
  renderDetail();
});

filterBar.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (!chip) {
    return;
  }

  appState.filter = chip.dataset.filter;
  filterBar.querySelectorAll(".chip").forEach((button) => {
    button.classList.toggle("active", button === chip);
  });

  renderList();
  renderDetail();
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    appState.activeTab = button.textContent;
    renderTabs();
    showToast(`Aba ativa: ${appState.activeTab}`);
  });
});

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    const message =
      action === "add"
        ? "Fluxo de cadastro em breve."
        : "Mostrando todos os videos.";
    showToast(message);
  });
});

renderList();
renderDetail();
renderTabs();
