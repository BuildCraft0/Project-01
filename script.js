const navToggle = document.querySelector(".nav-toggle");
const headerPanel = document.querySelector(".header-panel");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const slides = [...document.querySelectorAll(".hero-slide")];
const dots = [...document.querySelectorAll(".slider-dots button")];
const controls = [...document.querySelectorAll(".slider-control")];
const searchForm = document.getElementById("header-search");
const searchInput = document.getElementById("site-search");
const searchFeedback = document.getElementById("search-feedback");
let activeSlide = 0;
let sliderTimer;
let feedbackTimer;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setFeedback(message, isError = false) {
    clearTimeout(feedbackTimer);
    searchFeedback.textContent = message;
    searchFeedback.style.color = isError ? "#cf4b3c" : "#09a46c";
    feedbackTimer = window.setTimeout(() => {
        searchFeedback.textContent = "";
    }, 3200);
}

function closeMenu() {
    if (!navToggle || !headerPanel) {
        return;
    }

    navToggle.setAttribute("aria-expanded", "false");
    headerPanel.classList.remove("is-open");
}

function setActiveLink(sectionId) {
    navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${sectionId}`);
    });
}

function showSlide(nextIndex) {
    activeSlide = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
        slide.classList.toggle("is-active", index === activeSlide);
    });

    dots.forEach((dot, index) => {
        const isActive = index === activeSlide;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-selected", String(isActive));
    });
}

function restartSlider() {
    if (prefersReducedMotion || slides.length < 2) {
        return;
    }

    window.clearInterval(sliderTimer);
    sliderTimer = window.setInterval(() => {
        showSlide(activeSlide + 1);
    }, 5000);
}

if (navToggle && headerPanel) {
    navToggle.addEventListener("click", () => {
        const expanded = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", String(!expanded));
        headerPanel.classList.toggle("is-open");
    });
}

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        const targetId = link.getAttribute("href")?.replace("#", "");
        if (targetId) {
            setActiveLink(targetId);
        }
        closeMenu();
    });
});

controls.forEach((control) => {
    control.addEventListener("click", () => {
        const direction = control.dataset.direction === "next" ? 1 : -1;
        showSlide(activeSlide + direction);
        restartSlider();
    });
});

dots.forEach((dot) => {
    dot.addEventListener("click", () => {
        const nextIndex = Number(dot.dataset.dot || 0);
        showSlide(nextIndex);
        restartSlider();
    });
});

if (slides.length > 0) {
    showSlide(0);
    restartSlider();
}

const sections = navLinks
    .map((link) => {
        const target = link.getAttribute("href");
        return target ? document.querySelector(target) : null;
    })
    .filter(Boolean);

if ("IntersectionObserver" in window && sections.length > 0) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveLink(entry.target.id);
                }
            });
        },
        {
            rootMargin: "-35% 0px -50% 0px",
            threshold: 0.1
        }
    );

    sections.forEach((section) => observer.observe(section));
}

if (searchForm && searchInput) {
    const searchTargets = [
        { id: "home", label: "Home", terms: ["home", "hero", "campaign", "header"] },
        { id: "narrative", label: "Narrative", terms: ["narrative", "food", "cause", "sustainability", "education"] },
        { id: "impact", label: "Impact", terms: ["impact", "nutrition", "trust", "tax", "80g"] },
        { id: "stories", label: "Stories", terms: ["stories", "story", "promise", "childhood"] },
        { id: "support", label: "Support", terms: ["support", "donate", "partner", "celebrate"] }
    ];

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            setFeedback("Try: home, narrative, impact, stories, or support.", true);
            return;
        }

        const match = searchTargets.find((item) =>
            item.terms.some((term) => term.includes(query) || query.includes(term))
        );

        if (!match) {
            setFeedback("No section found. Try home, narrative, impact, stories, or support.", true);
            return;
        }

        const target = document.getElementById(match.id);
        if (target) {
            target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
            setActiveLink(match.id);
            setFeedback(`Jumped to ${match.label}.`);
            closeMenu();
        }
    });
}
