(function () {
  "use strict";

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-navigation]");
  const navigationLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
  const desktopNavigation = window.matchMedia("(min-width: 48rem)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setMenuState(isOpen) {
    if (!menuToggle || !navigation) {
      return;
    }

    navigation.dataset.open = String(isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "Close" : "Menu";
  }

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      setMenuState(menuToggle.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        setMenuState(false);
        menuToggle.focus();
      }
    });

    desktopNavigation.addEventListener("change", () => setMenuState(false));
  }

  function setCurrentSection(sectionId) {
    navigationLinks.forEach((link) => {
      if (link.getAttribute("href") === `#${sectionId}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  navigationLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
      setCurrentSection(link.hash.slice(1));
    });
  });

  const projectFilterButtons = Array.from(
    document.querySelectorAll("[data-project-filter]")
  );
  const projectCards = Array.from(document.querySelectorAll("[data-project-card]"));
  const projectFilterStatus = document.querySelector("[data-filter-status]");

  function setProjectFilter(filter) {
    let visibleProjectCount = 0;

    projectFilterButtons.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.projectFilter === filter)
      );
    });

    projectCards.forEach((card) => {
      const isVisible =
        filter === "all" || card.dataset.projectCategory === filter;

      card.hidden = !isVisible;
      if (isVisible) {
        visibleProjectCount += 1;
      }
    });

    if (!projectFilterStatus) {
      return;
    }

    const activeButton = projectFilterButtons.find(
      (button) => button.dataset.projectFilter === filter
    );
    const activeLabel = activeButton ? activeButton.textContent.trim() : "selected category";

    if (visibleProjectCount === 0) {
      projectFilterStatus.textContent =
        `No projects match ${activeLabel}. Choose another category.`;
      return;
    }

    const projectLabel = visibleProjectCount === 1 ? "project" : "projects";
    projectFilterStatus.textContent = filter === "all"
      ? `Showing all ${visibleProjectCount} ${projectLabel}.`
      : `Showing ${visibleProjectCount} ${projectLabel} for ${activeLabel}.`;
  }

  projectFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setProjectFilter(button.dataset.projectFilter);
    });
  });

  if (projectFilterButtons.length > 0 && projectCards.length > 0) {
    setProjectFilter("all");
  }

  const typewriterOutput = document.querySelector("[data-typewriter]");
  const typewriterToggle = document.querySelector("[data-typewriter-toggle]");
  const typewriterToggleLabel = typewriterToggle?.querySelector("[data-typewriter-label]");
  const typewriterPhrases = Object.freeze([
    "I build software solutions.",
    "I work with machine learning.",
    "I build forecasting models.",
  ]);
  let typewriterTimer;
  let typewriterRun = 0;
  let typewriterPaused = false;
  let resumeTypewriter = null;

  function updateTypewriterToggle() {
    if (!typewriterToggle) {
      return;
    }

    if (reducedMotion.matches) {
      typewriterToggle.disabled = true;
      typewriterToggle.setAttribute("aria-pressed", "false");
      typewriterToggle.setAttribute("aria-label", "Typewriter motion disabled");
      if (typewriterToggleLabel) {
        typewriterToggleLabel.textContent = "Typewriter motion disabled";
      }
      return;
    }

    typewriterToggle.disabled = false;
    typewriterToggle.setAttribute("aria-pressed", String(typewriterPaused));
    const toggleLabel = typewriterPaused ? "Resume typewriter" : "Pause typewriter";
    typewriterToggle.setAttribute("aria-label", toggleLabel);
    if (typewriterToggleLabel) {
      typewriterToggleLabel.textContent = toggleLabel;
    }
  }

  function startTypewriter() {
    if (!typewriterOutput) {
      return;
    }

    window.clearTimeout(typewriterTimer);
    typewriterRun += 1;
    const currentRun = typewriterRun;
    typewriterPaused = false;
    resumeTypewriter = null;
    updateTypewriterToggle();

    if (reducedMotion.matches) {
      typewriterOutput.textContent = typewriterPhrases[0];
      typewriterOutput.dataset.complete = "true";
      return;
    }

    let phraseIndex = 0;
    let characterIndex = 0;
    let isDeleting = false;
    typewriterOutput.textContent = "";
    typewriterOutput.dataset.complete = "false";

    function scheduleNextStep(delay) {
      resumeTypewriter = () => {
        if (currentRun === typewriterRun) {
          stepTypewriter();
        }
      };

      if (!typewriterPaused) {
        typewriterTimer = window.setTimeout(resumeTypewriter, delay);
      }
    }

    function stepTypewriter() {
      const phrase = typewriterPhrases[phraseIndex];

      if (!isDeleting) {
        characterIndex += 1;
        typewriterOutput.textContent = phrase.slice(0, characterIndex);

        if (characterIndex === phrase.length) {
          isDeleting = true;
          scheduleNextStep(1000);
          return;
        }

        scheduleNextStep(24);
        return;
      }

      characterIndex -= 1;
      typewriterOutput.textContent = phrase.slice(0, characterIndex);

      if (characterIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % typewriterPhrases.length;
        scheduleNextStep(120);
        return;
      }

      scheduleNextStep(10);
    }

    stepTypewriter();
  }

  if (typewriterOutput) {
    reducedMotion.addEventListener("change", startTypewriter);
    startTypewriter();
  }

  if (typewriterToggle) {
    typewriterToggle.addEventListener("click", () => {
      if (typewriterToggle.disabled) {
        return;
      }

      typewriterPaused = !typewriterPaused;
      window.clearTimeout(typewriterTimer);
      updateTypewriterToggle();

      if (!typewriterPaused && resumeTypewriter) {
        resumeTypewriter();
      }
    });
  }

  const cursorGlow = document.querySelector("[data-cursor-glow]");
  const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let pointerFrame;

  function updateCursorGlow(event) {
    if (!cursorGlow || reducedMotion.matches || !precisePointer.matches) {
      return;
    }

    window.cancelAnimationFrame(pointerFrame);
    pointerFrame = window.requestAnimationFrame(() => {
      cursorGlow.style.setProperty("--pointer-x", `${event.clientX}px`);
      cursorGlow.style.setProperty("--pointer-y", `${event.clientY}px`);
      cursorGlow.dataset.visible = "true";
    });
  }

  if (cursorGlow) {
    window.addEventListener("pointermove", updateCursorGlow, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => {
      cursorGlow.dataset.visible = "false";
    });
  }

  const revealItems = Array.from(
    document.querySelectorAll(
      ".terminal, .section-intro, .about-layout, .project-filters, .filter-status, .project-card, .stack-marquee, .contact-panel"
    )
  );

  if (!reducedMotion.matches && "IntersectionObserver" in window) {
    revealItems.forEach((item, index) => {
      item.classList.add("reveal-ready");
      item.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
    });

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const sections = Array.from(document.querySelectorAll("[data-page-section]"));

  if ("IntersectionObserver" in window && sections.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio);

        if (visibleSections[0]) {
          setCurrentSection(visibleSections[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0.05, 0.25, 0.5],
      }
    );

    sections.forEach((section) => observer.observe(section));
  } else {
    setCurrentSection("home");
  }
})();
