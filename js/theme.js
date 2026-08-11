/* atlas-theme-contract:v1 — shared verbatim with ovm/site/theme.js */
(function () {
  "use strict";

  var STORAGE_KEY = "atlas-theme";
  var DEFAULT_THEME = "white";
  var THEMES = ["white", "black", "paper"];
  var THEME_LABELS = { white: "white", black: "black", paper: "paper" };
  var THEME_COLORS = { white: "#ffffff", black: "#11100e", paper: "#f3eee4" };

  function isTheme(value) {
    return THEMES.indexOf(value) !== -1;
  }

  function storedTheme() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return isTheme(value) ? value : DEFAULT_THEME;
    } catch (_error) {
      return DEFAULT_THEME;
    }
  }

  function nextTheme(theme) {
    var index = THEMES.indexOf(theme);
    return THEMES[(index + 1) % THEMES.length];
  }

  function updateControls(theme) {
    var controls = document.querySelectorAll("[data-theme-cycle]");
    var next = nextTheme(theme);
    controls.forEach(function (control) {
      control.setAttribute("data-theme-current", theme);
      control.setAttribute(
        "aria-label",
        "Colour theme: " + THEME_LABELS[theme] + ". Switch to " + THEME_LABELS[next] + "."
      );
      control.setAttribute("title", THEME_LABELS[theme] + " → " + THEME_LABELS[next]);
    });
  }

  function updateThemeColor(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", THEME_COLORS[theme]);
  }

  function applyTheme(theme, persist, announce) {
    var nextTheme = isTheme(theme) ? theme : DEFAULT_THEME;
    document.documentElement.setAttribute("data-theme", nextTheme);
    updateThemeColor(nextTheme);
    updateControls(nextTheme);
    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch (_error) {
        /* The visible theme still works when storage is unavailable. */
      }
    }
    if (announce) {
      window.dispatchEvent(new CustomEvent("atlas-theme-change", { detail: { theme: nextTheme } }));
    }
  }

  function bindControls() {
    updateControls(document.documentElement.getAttribute("data-theme") || DEFAULT_THEME);
    document.addEventListener("click", function (event) {
      var target = event.target.closest("[data-theme-cycle]");
      if (!target) return;
      var current = document.documentElement.getAttribute("data-theme") || DEFAULT_THEME;
      applyTheme(nextTheme(current), true, true);
    });
  }

  window.AtlasTheme = { set: function (theme) { applyTheme(theme, true, true); } };
  applyTheme(storedTheme(), false, false);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindControls, { once: true });
  } else {
    bindControls();
  }
})();
