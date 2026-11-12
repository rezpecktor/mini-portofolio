(function () {
  "use strict";

  const STORAGE_KEY = "portfolio-theme";
  const root = document.documentElement;
  const systemPreference = window.matchMedia("(prefers-color-scheme: light)");
  const toggles = document.querySelectorAll("[data-theme-toggle]");

  function readSavedTheme() {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY);
      return savedTheme === "light" || savedTheme === "dark" ? savedTheme : null;
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      return;
    }
  }

  function updateThemeColor(theme) {
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute("content", theme === "light" ? "#FAFAFA" : "#09090B");
    }
  }

  function updateToggleLabels(theme) {
    const nextTheme = theme === "dark" ? "light" : "dark";

    toggles.forEach((toggle) => {
      toggle.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
      const label = toggle.querySelector("[data-theme-label]");
      if (label) {
        label.textContent = `Switch to ${nextTheme} theme`;
      }
    });
  }

  function applyTheme(theme, persist) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    updateThemeColor(theme);
    updateToggleLabels(theme);

    if (persist) {
      saveTheme(theme);
    }

    document.dispatchEvent(
      new CustomEvent("portfolio:themechange", { detail: { theme } })
    );

    return theme;
  }

  function getTheme() {
    return root.dataset.theme === "light" ? "light" : "dark";
  }

  function toggleTheme() {
    return applyTheme(getTheme() === "dark" ? "light" : "dark", true);
  }

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", toggleTheme);
  });

  systemPreference.addEventListener("change", (event) => {
    if (!readSavedTheme()) {
      applyTheme(event.matches ? "light" : "dark", false);
    }
  });

  window.portfolioTheme = Object.freeze({
    get: getTheme,
    toggle: toggleTheme,
  });

  applyTheme(getTheme(), false);
})();
