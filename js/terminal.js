(function () {
  "use strict";

  const controls = document.getElementById("terminal-controls");
  const input = document.getElementById("terminal-input");
  const runButton = document.getElementById("terminal-run");
  const output = document.getElementById("terminal-output");
  const status = document.getElementById("terminal-status");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!controls || !input || !runButton || !output || !status) {
    return;
  }

  input.disabled = false;
  runButton.disabled = false;
  status.textContent = "";

  const commands = Object.freeze({
    "/help": {
      message: "Available commands: /help, /about, /projects, /stack, /contact, /theme, /clear.",
    },
    "/about": {
      message: "M. Reza Pahlevi is a Software Engineer working across application development, machine learning, and forecasting.",
      target: "#about",
    },
    "/projects": {
      message: "TrashGu is a team-built web application; HHT-GRU documents forecasting work.",
      target: "#projects",
    },
    "/stack": {
      message: "The stack lists technologies used or being learned; n8n is marked as Learning.",
      target: "#stack",
    },
    "/contact": {
      message: "GitHub: github.com/rezpecktor.",
      target: "#contact",
    },
  });

  function announce(message) {
    status.textContent = "";
    window.requestAnimationFrame(() => {
      status.textContent = message;
    });
  }

  function appendLine(message, className) {
    const line = document.createElement("p");
    line.className = className ? `terminal-line ${className}` : "terminal-line";
    line.textContent = message;
    output.append(line);

    while (output.childElementCount > 40) {
      output.firstElementChild.remove();
    }

    output.scrollTop = output.scrollHeight;
  }

  function navigateTo(targetSelector) {
    const target = document.querySelector(targetSelector);

    if (!target) {
      return;
    }

    window.history.pushState(null, "", targetSelector);
    target.focus({ preventScroll: true });
    target.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  }

  function runCommand(command) {
    if (command === "/clear") {
      output.replaceChildren();
      announce("Terminal output cleared.");
      return;
    }

    if (command === "/theme") {
      if (window.portfolioTheme) {
        const theme = window.portfolioTheme.toggle();
        const message = `Theme changed to ${theme}.`;
        appendLine(message);
      }
      return;
    }

    const commandDefinition = commands[command];

    if (!commandDefinition) {
      const message = "Command not recognized. Type /help to list the fixed commands.";
      appendLine(message);
      return;
    }

    appendLine(commandDefinition.message);

    if (commandDefinition.target) {
      navigateTo(commandDefinition.target);
    }
  }

  function submitCommand() {
    const command = input.value.trim().toLowerCase();

    if (!command) {
      const message = "Enter a command, or type /help.";
      appendLine(message);
      input.focus();
      return;
    }

    appendLine(command, "terminal-line-command");
    input.value = "";
    runCommand(command);

    if (!commands[command] || !commands[command].target) {
      input.focus();
    }
  }

  runButton.addEventListener("click", submitCommand);

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.isComposing) {
      return;
    }

    event.preventDefault();
    submitCommand();
  });
})();
