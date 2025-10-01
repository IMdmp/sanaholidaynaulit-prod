import type { Holiday } from "../lib/types";

type SortKey = "dateISO" | "name" | "type" | "status";
type SortDirection = "asc" | "desc";

interface State {
  holidays: Holiday[];
  filtered: Holiday[];
  searchTerm: string;
  typeFilter: "all" | Holiday["type"];
  statusFilter: "all" | Holiday["status"];
  yearFilter: "all" | string;
  sortKey: SortKey;
  sortDirection: SortDirection;
}

const formatPHT = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

const state: State = {
  holidays: [],
  filtered: [],
  searchTerm: "",
  typeFilter: "all",
  statusFilter: "all",
  yearFilter: "all",
  sortKey: "dateISO",
  sortDirection: "asc",
};

const $ = (selector: string) =>
  document.querySelector(selector) as HTMLElement | null;
const $$ = (selector: string) =>
  Array.from(document.querySelectorAll(selector)) as HTMLElement[];

const normalize = (value: string) => value.normalize("NFKD").toLowerCase();

const sorters: Record<SortKey, (a: Holiday, b: Holiday) => number> = {
  dateISO: (a, b) => a.dateISO.localeCompare(b.dateISO),
  name: (a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  type: (a, b) => a.type.localeCompare(b.type),
  status: (a, b) => a.status.localeCompare(b.status),
};

const updateSortButtons = () => {
  $$("[data-sort]").forEach((btn) => {
    const key = btn.getAttribute("data-sort") as SortKey;
    const indicator = btn.querySelector(".sort-indicator");

    if (!indicator) return;

    if (state.sortKey === key) {
      btn.setAttribute(
        "aria-sort",
        state.sortDirection === "asc" ? "ascending" : "descending"
      );
      indicator.textContent = state.sortDirection === "asc" ? "↑" : "↓";
    } else {
      btn.setAttribute("aria-sort", "none");
      indicator.textContent = "↕";
    }
  });
};

const renderTable = () => {
  const tbody = document.getElementById("holidayTableBody");
  const emptyState = $("#emptyState");
  const countLabel = $("#matchCount");

  if (!tbody) return;

  tbody.innerHTML = "";

  if (state.filtered.length === 0) {
    if (emptyState) emptyState.removeAttribute("hidden");
    if (countLabel) countLabel.textContent = "No holidays match your filters.";
    return;
  }

  if (emptyState) emptyState.setAttribute("hidden", "true");

  const fragment = document.createDocumentFragment();

  state.filtered.forEach((holiday) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <th scope="row" data-label="Date">
        <time datetime="${holiday.dateISO}">${formatPHT(
      `${holiday.dateISO}T00:00:00+08:00`
    )}</time>
      </th>
      <td data-label="Holiday">
        <span class="holiday-name">${holiday.name}</span>
      </td>
      <td data-label="Type">
        <span class="badge badge-${holiday.type}">${holiday.type}</span>
      </td>
      <td data-label="Status">
        <span class="status status-${holiday.status}">${holiday.status}</span>
      </td>
    `;
    fragment.appendChild(row);
  });

  tbody.appendChild(fragment);

  if (countLabel)
    countLabel.textContent = `Showing ${state.filtered.length} holiday${
      state.filtered.length === 1 ? "" : "s"
    }`;
};

const applyState = () => {
  const {
    holidays,
    searchTerm,
    typeFilter,
    statusFilter,
    yearFilter,
    sortKey,
    sortDirection,
  } = state;

  const normalizedQuery = normalize(searchTerm);

  let result = holidays.filter((holiday) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      normalize(holiday.name).includes(normalizedQuery) ||
      normalize(formatPHT(`${holiday.dateISO}T00:00:00+08:00`)).includes(
        normalizedQuery
      );

    const matchesType = typeFilter === "all" || holiday.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || holiday.status === statusFilter;
    const holidayYear = holiday.dateISO.slice(0, 4);
    const matchesYear = yearFilter === "all" || holidayYear === yearFilter;

    return matchesSearch && matchesType && matchesStatus && matchesYear;
  });

  result = result.slice().sort((a, b) => {
    const comparison = sorters[sortKey](a, b);
    return sortDirection === "asc" ? comparison : -comparison;
  });

  state.filtered = result;

  renderTable();
  updateSortButtons();
};

const handleSortClick = (event: Event) => {
  const target = event.currentTarget as HTMLElement;
  const key = target.getAttribute("data-sort") as SortKey | null;
  if (!key) return;

  if (state.sortKey === key) {
    state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
  } else {
    state.sortKey = key;
    state.sortDirection = key === "name" ? "asc" : "asc";
  }

  applyState();
};

const initSortButtons = () => {
  $$("[data-sort]").forEach((btn) => {
    btn.addEventListener("click", handleSortClick);
  });
};

const initFilters = () => {
  const searchInput = document.getElementById(
    "holidaySearch"
  ) as HTMLInputElement | null;
  const typeSelect = document.getElementById(
    "typeFilter"
  ) as HTMLSelectElement | null;
  const statusSelect = document.getElementById(
    "statusFilter"
  ) as HTMLSelectElement | null;
  const yearSelect = document.getElementById(
    "yearFilter"
  ) as HTMLSelectElement | null;

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.searchTerm = searchInput.value.trim();
      applyState();
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener("change", () => {
      state.typeFilter = (typeSelect.value as State["typeFilter"]) || "all";
      applyState();
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener("change", () => {
      state.statusFilter =
        (statusSelect.value as State["statusFilter"]) || "all";
      applyState();
    });
  }

  if (yearSelect) {
    yearSelect.addEventListener("change", () => {
      state.yearFilter = yearSelect.value || "all";
      applyState();
    });
  }
};

const displayError = (message: string) => {
  const host = $("#holidayTableBody");
  const wrapper = $("#tableWrapper");
  if (wrapper) wrapper.classList.add("table-error");

  if (host) {
    host.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="table-message">
            <h3>Cannot load holidays</h3>
            <p>${message}</p>
          </div>
        </td>
      </tr>
    `;
  }
};

const boot = () => {
  const anyWindow = window as any;
  const payload = anyWindow.__HOLIDAY_DATA__;

  if (!Array.isArray(payload)) {
    displayError("Holiday data not available. Please try again later.");
    return;
  }

  state.holidays = payload;
  applyState();

  initFilters();
  initSortButtons();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
