const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const dialog = document.querySelector(".image-dialog");
const dialogImage = dialog.querySelector(".dialog-body img");
const dialogTitle = dialog.querySelector("#dialog-title");
const dialogClose = dialog.querySelector(".dialog-close");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  siteNav.classList.toggle("is-open", !isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  });
});

document.querySelectorAll("[data-gallery]").forEach((gallery) => {
  const tabs = [...gallery.querySelectorAll(".gallery-tab")];
  const stage = gallery.querySelector(".gallery-stage");
  const image = gallery.querySelector(".gallery-image");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => {
        const isCurrent = item === tab;
        item.classList.toggle("is-active", isCurrent);
        item.setAttribute("aria-selected", String(isCurrent));
      });

      image.src = tab.dataset.image;
      image.alt = tab.dataset.alt;
      stage.dataset.image = tab.dataset.image;
      stage.dataset.title = tab.dataset.title;
    });
  });
});

document.querySelectorAll(".zoom-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const imagePath = trigger.dataset.image;
    const title = trigger.dataset.title || "完整看板";
    dialogImage.src = imagePath;
    dialogImage.alt = `${title}完整看板`;
    dialogTitle.textContent = title;
    dialog.showModal();
    document.body.classList.add("dialog-open");
  });
});

function closeDialog() {
  dialog.close();
  document.body.classList.remove("dialog-open");
}

dialogClose.addEventListener("click", closeDialog);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeDialog();
});
dialog.addEventListener("cancel", () => {
  document.body.classList.remove("dialog-open");
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const collapsibleCases = [...document.querySelectorAll(".case-details")];

function syncCaseToggleLabel(detail) {
  const toggle = detail.querySelector(".case-details-toggle");
  if (!toggle) return;
  toggle.textContent = detail.open ? "收起补充案例" : "展开完整案例";
}

collapsibleCases.forEach((detail) => {
  syncCaseToggleLabel(detail);
  detail.addEventListener("toggle", () => {
    syncCaseToggleLabel(detail);
  });
});

function openCaseFromHash(hashValue = window.location.hash) {
  if (!hashValue) return;
  const section = document.querySelector(hashValue);
  const detail = section?.querySelector('.case-details[data-auto-open="true"]');

  if (!detail) return;
  detail.open = true;
  syncCaseToggleLabel(detail);
}

document.querySelectorAll('a[href^="#case-"]').forEach((link) => {
  link.addEventListener("click", () => {
    openCaseFromHash(link.getAttribute("href"));
  });
});

window.addEventListener("hashchange", () => {
  openCaseFromHash();
});

openCaseFromHash();

const projectFloatNav = document.querySelector("[data-project-nav]");
const projectFloatLinks = [...projectFloatNav.querySelectorAll('a[href^="#case-"]')];
const projectSections = projectFloatLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const projectsOverview = document.querySelector("#projects");
const methodSection = document.querySelector("#method");
let requestedProjectId = null;
let requestedProjectTimer;

function setActiveProject(sectionId) {
  projectFloatLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

function syncProjectNavigation() {
  const start = projectsOverview.offsetTop - window.innerHeight * 0.35;
  const end = methodSection.offsetTop - window.innerHeight * 0.45;
  projectFloatNav.classList.toggle("is-visible", window.scrollY >= start && window.scrollY < end);

  if (requestedProjectId) {
    setActiveProject(requestedProjectId);
    return;
  }

  const readingLine = window.scrollY + window.innerHeight * 0.32;
  const current = projectSections.reduce(
    (active, section) => (section.offsetTop <= readingLine ? section : active),
    projectSections[0],
  );
  if (current) setActiveProject(current.id);
}

projectFloatLinks.forEach((link) => {
  link.addEventListener("click", () => {
    requestedProjectId = link.getAttribute("href").slice(1);
    window.clearTimeout(requestedProjectTimer);
    requestedProjectTimer = window.setTimeout(() => {
      requestedProjectId = null;
      syncProjectNavigation();
    }, 3000);
    setActiveProject(requestedProjectId);
  });
});

setActiveProject(projectSections[0]?.id);
syncProjectNavigation();
window.addEventListener("scroll", syncProjectNavigation, { passive: true });
window.addEventListener("resize", syncProjectNavigation);
window.addEventListener("load", syncProjectNavigation);
requestAnimationFrame(() => requestAnimationFrame(syncProjectNavigation));

const sectionMap = new Map([
  ["projects", document.querySelector('#site-nav a[href="#projects"]')],
  ["method", document.querySelector('#site-nav a[href="#method"]')],
  ["about", document.querySelector('#site-nav a[href="#about"]')],
]);

const navObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    navLinks.forEach((link) => link.classList.remove("is-active"));
    sectionMap.get(visible.target.id)?.classList.add("is-active");
  },
  { rootMargin: "-22% 0px -60% 0px", threshold: [0.05, 0.2, 0.5] },
);

sectionMap.forEach((_, id) => {
  const section = document.getElementById(id);
  if (section) navObserver.observe(section);
});
