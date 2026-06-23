import { performances } from "./performances.js";
import { getDateKey, formatDateLabel, formatTime } from "./time-helper.js";

const storagePerformanceKey = "selected-performance-ids";
const stageStorageKey = "selected-stage";
const dateStorageKey = "selected-date";

const sortedDatePerformances = performances.sort(
  (a, b) => new Date(a.startsAt) - new Date(b.startsAt),
);

const allStages = [
  "全部",
  ...new Set(
    performances
      .sort((a, b) => a.id.split("-")[0] - b.id.split("-")[0])
      .map((performance) => performance.stage),
  ),
];

const allDates = [
  ...new Set(
    sortedDatePerformances.map((performance) =>
      getDateKey(performance.startsAt),
    ),
  ),
];

let selectedStage = localStorage.getItem(stageStorageKey) || "全部";
let selectedIds = new Set(
  JSON.parse(localStorage.getItem(storagePerformanceKey) || "[]"),
);
let selectedDate = localStorage.getItem(dateStorageKey) || allDates[0];

function saveSelectedIds() {
  localStorage.setItem(storagePerformanceKey, JSON.stringify([...selectedIds]));
}

/**
 * Add or cancel the performance.
 */
function togglePerformance(id) {
  if (selectedIds.has(id)) {
    selectedIds.delete(id);
  } else {
    selectedIds.add(id);
  }

  saveSelectedIds();
  render();
}

function createPerformanceCard(performance) {
  const isSelected = selectedIds.has(performance.id);

  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
        <div class="card-header">
          <div>
            <div class="artist">${performance.artist}</div>
            <div class="meta">
              ${formatTime(performance.startsAt)} - ${formatTime(performance.endsAt)}
              / ${performance.stage}
            </div>
          </div>
        </div>
    
        <button class="${isSelected ? "selected" : ""}">
          ${isSelected ? "已加入，點擊取消" : "加入我的行程"}
        </button>
      `;

  card.querySelector("button").addEventListener("click", () => {
    togglePerformance(performance.id);
  });

  return card;
}

function getSelectedPerformances(date = selectedDate) {
  return sortedDatePerformances
    .filter(
      (performance) =>
        selectedIds.has(performance.id) &&
        getDateKey(performance.startsAt) === date,
    )
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
}

function renderTimetable() {
  const timetable = document.querySelector("#timetable");
  timetable.innerHTML = "";

  const specifyDatePerformance = sortedDatePerformances.filter(
    (performance) => {
      return getDateKey(performance.startsAt) === selectedDate;
    },
  );

  const filteredPerformances =
    selectedStage === "全部"
      ? specifyDatePerformance
      : specifyDatePerformance.filter(
          (performance) => performance.stage === selectedStage,
        );

  filteredPerformances.forEach((performance) => {
    timetable.appendChild(createPerformanceCard(performance));
  });
}

function renderDateFilter() {
  const container = document.querySelector("#date-filter");
  container.innerHTML = "";

  allDates.forEach((date) => {
    const button = document.createElement("button");

    button.textContent = formatDateLabel(date);
    button.className = selectedDate === date ? "active" : "";

    button.addEventListener("click", () => {
      selectedDate = date;
      localStorage.setItem(dateStorageKey, selectedDate);

      render();
    });

    container.appendChild(button);
  });
}

function isTimeConflict(target, performances) {
  return performances.some((performance) => {
    if (performance.id === target.id) return false;

    const targetStart = new Date(target.startsAt);
    const targetEnd = new Date(target.endsAt);
    const performanceStart = new Date(performance.startsAt);
    const performanceEnd = new Date(performance.endsAt);

    return targetStart < performanceEnd && performanceStart < targetEnd;
  });
}

function renderMySchedule() {
  const container = document.querySelector("#my-schedule");
  const selectedPerformances = getSelectedPerformances();

  container.innerHTML = "";

  if (selectedPerformances.length === 0) {
    container.innerHTML = `<div class="card empty">還沒有加入任何演出</div>`;
    return;
  }

  selectedPerformances.forEach((performance) => {
    const hasConflict = isTimeConflict(performance, selectedPerformances);

    const card = document.createElement("div");
    card.className = hasConflict ? "card conflict" : "card";

    card.innerHTML = `
      <div class="artist">${performance.artist}</div>
      <div class="meta">
        ${formatTime(performance.startsAt)} - ${formatTime(performance.endsAt)}
        / ${performance.stage}
      </div>
      ${hasConflict ? `<div class="conflict-text">時間衝突</div>` : ""}
    `;

    container.appendChild(card);
  });
}

function renderNextPerformance() {
  const container = document.querySelector("#next-performance");
  const now = new Date();

  const next = getSelectedPerformances().find((performance) => {
    return new Date(performance.startsAt) > now;
  });

  if (!next) {
    container.className = "card empty";
    container.innerHTML = "沒有下一場";
    return;
  }

  container.className = "card";
  container.innerHTML = `
        <div class="artist">${next.artist}</div>
        <div class="meta">
          ${formatTime(next.startsAt)} / ${next.stage}
        </div>
      `;
}

function renderStageFilter() {
  const container = document.querySelector("#stage-filter");
  container.innerHTML = "";

  allStages.forEach((stage) => {
    const button = document.createElement("button");

    button.textContent = stage;
    button.className = selectedStage === stage ? "active" : "";

    button.addEventListener("click", () => {
      selectedStage = stage;
      localStorage.setItem(stageStorageKey, selectedStage);
      renderStageFilter();
      renderTimetable();
    });

    container.appendChild(button);
  });
}

function render() {
  renderDateFilter();
  renderNextPerformance();
  renderMySchedule();
  renderTimetable();
}

renderStageFilter();
render();

setInterval(() => {
  console.log("XD1");
  renderNextPerformance();
}, 30 * 1000);

document.addEventListener("visibilitychange", () => {
  console.log("XD2");

  if (!document.hidden) {
    renderNextPerformance();
  }
});

window.addEventListener("focus", () => {
  console.log("XD3");

  renderNextPerformance();
});
