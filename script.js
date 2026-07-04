const navToggle = document.querySelector(".nav-toggle");
const headerPanel = document.querySelector(".header-panel");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const slides = [...document.querySelectorAll(".hero-slide")];
const dots = [...document.querySelectorAll(".slider-dots button")];
const controls = [...document.querySelectorAll(".slider-control")];
const searchForm = document.getElementById("header-search");
const searchInput = document.getElementById("site-search");
const searchFeedback = document.getElementById("search-feedback");
const currentPage = document.body.dataset.page || "home";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let activeSlide = 0;
let sliderTimer;
let feedbackTimer;

const searchTargets = [
    {
        page: "home",
        label: "Home",
        href: "index.html",
        terms: ["home", "landing", "main", "hero"]
    },
    {
        page: "narrative",
        label: "Narrative",
        href: "narrative.html",
        terms: ["narrative", "native", "mission", "cause", "storyline"]
    },
    {
        page: "stories",
        label: "Stories",
        href: "stories.html",
        terms: ["stories", "story", "journal", "impact"]
    },
    {
        page: "support",
        label: "Support",
        href: "support.html",
        terms: ["support", "donate", "donation", "partner", "give"]
    }
];

function setFeedback(message, isError = false) {
    if (!searchFeedback) {
        return;
    }

    window.clearTimeout(feedbackTimer);
    searchFeedback.textContent = message;
    searchFeedback.style.color = isError ? "#cf4b3c" : "#19a974";
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

function setActiveLink() {
    navLinks.forEach((link) => {
        const isActive = link.dataset.page === currentPage;
        link.classList.toggle("is-active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

function showSlide(nextIndex) {
    if (slides.length === 0) {
        return;
    }

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

setActiveLink();

if (navToggle && headerPanel) {
    navToggle.addEventListener("click", () => {
        const expanded = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", String(!expanded));
        headerPanel.classList.toggle("is-open");
    });
}

navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
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
        showSlide(Number(dot.dataset.dot || 0));
        restartSlider();
    });
});

if (slides.length > 0) {
    showSlide(0);
    restartSlider();
}

if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            setFeedback("Try home, narrative, stories, or support.", true);
            return;
        }

        const match = searchTargets.find((item) =>
            item.terms.some((term) => term.includes(query) || query.includes(term))
        );

        if (!match) {
            setFeedback("No page found. Try home, narrative, stories, or support.", true);
            return;
        }

        if (match.page === currentPage) {
            setFeedback(`You are already on ${match.label}.`);
            closeMenu();
            return;
        }

        window.location.href = match.href;
    });
}
