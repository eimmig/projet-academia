const exercises = [
  {
    id: 1,
    name: "Agachamento guiado",
    muscle: "Quadriceps",
    hasVideo: true,
    videoSrc: "https://www.youtube.com/watch?v=Ht4iM2I_I8o",
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
    videoSrc: "https://www.youtube.com/watch?v=Ht4iM2I_I8o",
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
const muscleRegion = document.getElementById("muscleRegion");
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
const videoModal = document.getElementById("videoModal");
const videoForm = document.getElementById("videoForm");
const modalExerciseName = document.getElementById("modalExerciseName");
const modalVideoUrl = document.getElementById("modalVideoUrl");
const removeVideoButton = document.querySelector('[data-action="remove-video"]');
const videoLink = document.getElementById("videoLink");

function getYouTubeVideoId(url) {
  try {
    const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const parsedUrl = new URL(normalizedUrl);
    const host = parsedUrl.hostname.replace("www.", "");

    if (host === "youtu.be") {
      return parsedUrl.pathname.replace("/", "");
    }

    if (host.endsWith("youtube.com")) {
      if (parsedUrl.pathname.startsWith("/watch")) {
        return parsedUrl.searchParams.get("v");
      }

      if (parsedUrl.pathname.startsWith("/shorts/")) {
        return parsedUrl.pathname.split("/shorts/")[1]?.split("/")[0];
      }

      if (parsedUrl.pathname.startsWith("/embed/")) {
        return parsedUrl.pathname.split("/embed/")[1]?.split("/")[0];
      }
    }
  } catch {
    return null;
  }

  return null;
}

function getYouTubeEmbedUrl(url) {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) {
    return null;
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
}

function openVideoModal() {
  const exercise = exercises.find((item) => item.id === appState.selectedId);
  if (!exercise) {
    showToast("Selecione um exercicio primeiro.");
    return;
  }

  modalExerciseName.value = exercise.name;
  modalVideoUrl.value = exercise.videoSrc || "";
  removeVideoButton.disabled = !(exercise.hasVideo && exercise.videoSrc);
  videoModal.classList.add("visible");
  videoModal.setAttribute("aria-hidden", "false");
  modalVideoUrl.focus();
}

function closeVideoModal() {
  videoModal.classList.remove("visible");
  videoModal.setAttribute("aria-hidden", "true");
}

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
  globalThis.clearTimeout(appState.toastTimerId);
  appState.toastTimerId = globalThis.setTimeout(() => {
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
    const button = document.createElement("button");
    button.className = "exercise-item";
    button.type = "button";
    if (exercise.id === appState.selectedId) {
      button.classList.add("active");
    }

    button.dataset.id = exercise.id;

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

    button.appendChild(info);
    button.appendChild(status);
    listItem.appendChild(button);
    exerciseList.appendChild(listItem);
  });

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
    muscleRegion.textContent = "-";
    instructionList.innerHTML = "";
    videoWrapper.style.display = "none";
    videoFallback.classList.add("active");
    videoLink.classList.add("hidden");
    return;
  }

  exerciseName.textContent = exercise.name;
  exerciseMeta.textContent = `Grupo muscular: ${exercise.muscle}`;
  muscleTag.textContent = exercise.muscle;
  muscleRegion.textContent = exercise.muscle;

  instructionList.innerHTML = "";
  const instructions = Array.isArray(exercise.instructions)
    ? exercise.instructions
    : [];

  if (instructions.length === 0) {
    const li = document.createElement("li");
    li.className = "instruction-empty";
    li.textContent = "Instrucoes em breve.";
    instructionList.appendChild(li);
  } else {
    instructions.forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      instructionList.appendChild(li);
    });
  }

  if (exercise.hasVideo && exercise.videoSrc) {
    const embedUrl = getYouTubeEmbedUrl(exercise.videoSrc);
    videoWrapper.style.display = "block";
    videoFallback.classList.remove("active");
    if (embedUrl) {
      exerciseVideo.src = embedUrl;
      videoLink.href = exercise.videoSrc;
      videoLink.classList.remove("hidden");
    } else {
      videoWrapper.style.display = "none";
      videoFallback.classList.add("active");
      exerciseVideo.removeAttribute("src");
      videoLink.classList.add("hidden");
    }
  } else {
    videoWrapper.style.display = "none";
    videoFallback.classList.add("active");
    exerciseVideo.removeAttribute("src");
    videoLink.classList.add("hidden");
  }
}

function renderTabs() {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.page === appState.activeTab;
    button.classList.toggle("active", isActive);
  });
}

function initializeTabBar() {
  tabButtons.forEach((button) => {
    const target = button.dataset.target;
    button.addEventListener("click", () => {
      if (target) {
        globalThis.location.href = target;
      }
    });
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
    button.setAttribute("aria-pressed", button === chip ? "true" : "false");
  });

  renderList();
  renderDetail();
});

initializeTabBar();

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (action === "back") {
      globalThis.location.href = "../dashboard/index.html";
      return;
    }

    if (action === "help") {
      showToast("Use os filtros e selecione um exercicio na lista.");
      return;
    }

    if (action === "add") {
      openVideoModal();
      return;
    }

    if (action === "remove-video") {
      const exercise = exercises.find((item) => item.id === appState.selectedId);
      if (!exercise) {
        showToast("Selecione um exercicio primeiro.");
        return;
      }

      const shouldRemove = globalThis.confirm(
        "Deseja apagar o video atual deste exercicio?"
      );
      if (!shouldRemove) {
        return;
      }

      exercise.videoSrc = "";
      exercise.hasVideo = false;
      modalVideoUrl.value = "";
      removeVideoButton.disabled = true;
      renderList();
      renderDetail();
      showToast("Video removido.");
      return;
    }

    if (action === "close-modal" || action === "cancel-modal") {
      closeVideoModal();
      return;
    }

    const message =
      action === "view" ? "Mostrando todos os videos." : "Acao indisponivel.";
    showToast(message);
  });
});

videoModal.addEventListener("click", (event) => {
  if (event.target === videoModal) {
    closeVideoModal();
  }
});

videoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const exercise = exercises.find((item) => item.id === appState.selectedId);
  if (!exercise) {
    showToast("Selecione um exercicio primeiro.");
    return;
  }

  const url = modalVideoUrl.value.trim();
  if (!url) {
    showToast("Informe a URL do video.");
    return;
  }

  const embedUrl = getYouTubeEmbedUrl(url);
  if (!embedUrl) {
    showToast("URL invalida. Use um link do YouTube.");
    return;
  }

  exercise.videoSrc = url;
  exercise.hasVideo = true;
  removeVideoButton.disabled = false;
  closeVideoModal();
  if (appState.filter === "withoutVideo") {
    appState.filter = "all";
    filterBar.querySelectorAll(".chip").forEach((button) => {
      const isActive = button.dataset.filter === "all";
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }
  renderList();
  renderDetail();
  showToast("Video cadastrado com sucesso.");
});

renderList();
renderDetail();
renderTabs();
