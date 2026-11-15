const appShell = document.getElementById("app-shell");
const conversationTitle = document.getElementById("conversation-title");
const promptInput = document.getElementById("prompt-input");
const chatLog = document.getElementById("chat-log");
const composer = document.getElementById("composer");
const statusText = document.getElementById("status-text");
const revealOnScroll = document.querySelectorAll(".reveal-on-scroll");

const API_BASE_URL = "http://127.0.0.1:8082/api";
const BASIC_USER = "student";
const BASIC_PASSWORD = "translator";
const currentStyle = "natural";
const GEMINI_SPARKLE = `
<svg viewBox="0 0 24 24" aria-hidden="true">
    <defs>
        <linearGradient id="sparkle-gradient" x1="6" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#d9ecff"></stop>
            <stop offset="0.38" stop-color="#78b6ff"></stop>
            <stop offset="0.7" stop-color="#2f87ff"></stop>
            <stop offset="1" stop-color="#125fe8"></stop>
        </linearGradient>
    </defs>
    <path fill="url(#sparkle-gradient)" d="M12 1.8c1.55 4.56 2.13 5.16 6.44 6.71-4.31 1.54-4.89 2.14-6.44 6.72-1.55-4.58-2.13-5.18-6.44-6.72C9.87 6.96 10.45 6.36 12 1.8z"></path>
</svg>`;
const REFRESH_ICON = `
<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 11a8 8 0 1 0 2.1 5.4"></path>
    <path d="M20 4v7h-7"></path>
</svg>`;
const COPY_ICON = `
<svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="9" y="9" width="11" height="11" rx="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
</svg>`;

function createMessage(role, text) {
    const article = document.createElement("article");
    article.className = `message ${role}-message fade-up`;

    const body = document.createElement("div");
    body.className = "message-body";
    body.textContent = text;

    if (role === "assistant") {
        const icon = document.createElement("div");
        icon.className = "message-icon";
        icon.innerHTML = GEMINI_SPARKLE;
        article.append(icon, body);
    } else {
        article.append(body);
    }

    return article;
}

function createAssistantMessage(sourceText, text) {
    const article = document.createElement("article");
    article.className = "message assistant-message fade-up";

    const icon = document.createElement("div");
    icon.className = "message-icon";
    icon.innerHTML = GEMINI_SPARKLE;

    const content = document.createElement("div");
    content.className = "message-content";

    const body = document.createElement("div");
    body.className = "message-body";
    body.textContent = text;

    const actions = document.createElement("div");
    actions.className = "message-actions";

    const refreshButton = document.createElement("button");
    refreshButton.type = "button";
    refreshButton.className = "action-button";
    refreshButton.setAttribute("aria-label", "Translate again");
    refreshButton.innerHTML = REFRESH_ICON;

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "action-button";
    copyButton.setAttribute("aria-label", "Copy answer");
    copyButton.innerHTML = COPY_ICON;

    refreshButton.addEventListener("click", async () => {
        refreshButton.disabled = true;
        copyButton.disabled = true;
        body.textContent = "Translating...";
        setStatus("Sending request to backend...");
        try {
            const payload = await translateText(sourceText);
            body.textContent = payload.translatedText;
            setStatus(`Model: ${payload.provider}`);
        } catch (error) {
            body.textContent = error.message;
            setStatus("Check the backend and Gemini key.");
        } finally {
            refreshButton.disabled = false;
            copyButton.disabled = false;
        }
    });

    copyButton.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(body.textContent);
            setStatus("Copied answer.");
        } catch {
            setStatus("Could not copy the answer.");
        }
    });

    actions.append(refreshButton, copyButton);
    content.append(body, actions);
    article.append(icon, content);
    return article;
}

function setStatus(message) {
    statusText.textContent = message;
}

function autoResizeTextarea() {
    promptInput.style.height = "0";
    promptInput.style.height = `${Math.min(promptInput.scrollHeight, 112)}px`;
}

function summarizeConversation(text) {
    const cleaned = text.replace(/\s+/g, " ").replace(/[?!.]+$/g, "").trim();
    if (!cleaned) {
        return "";
    }

    const words = cleaned.split(" ");
    const shortTitle = words.slice(0, 6).join(" ");
    return shortTitle.length < cleaned.length ? `${shortTitle}...` : shortTitle;
}

function activateConversationLayout(sourceText) {
    appShell.classList.add("in-conversation");
    if (!conversationTitle.textContent) {
        conversationTitle.textContent = summarizeConversation(sourceText);
    }
}

function setupScrollReveal() {
    if (!("IntersectionObserver" in window)) {
        revealOnScroll.forEach((section) => section.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
    }, {
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px"
    });

    revealOnScroll.forEach((section) => observer.observe(section));
}

function showAppShell() {
    document.body.classList.add("app-ready");
}

async function translateText(text) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 40000);
    let response;
    try {
        response = await fetch(`${API_BASE_URL}/translator/translate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${btoa(`${BASIC_USER}:${BASIC_PASSWORD}`)}`
            },
            body: JSON.stringify({
                text,
                sourceLanguage: "English",
                targetLanguage: "Darija",
                style: currentStyle
            }),
            signal: controller.signal
        });
    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error("Gemini took too long to respond. Please try again.");
        }
        throw error;
    } finally {
        window.clearTimeout(timeoutId);
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        const message = payload?.message || payload?.error || `Request failed with status ${response.status}.`;
        throw new Error(message);
    }

    return payload;
}

promptInput.addEventListener("input", autoResizeTextarea);
promptInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey) {
        return;
    }

    event.preventDefault();
    composer.requestSubmit();
});

composer.addEventListener("submit", async (event) => {
    event.preventDefault();

    const text = promptInput.value.trim();
    if (!text) {
        promptInput.focus();
        return;
    }

    activateConversationLayout(text);
    const userMessage = createMessage("user", text);
    const loadingMessage = createAssistantMessage(text, "Translating...");
    chatLog.append(userMessage, loadingMessage);
    promptInput.value = "";
    autoResizeTextarea();
    setStatus("");
    const waitNotice = window.setTimeout(() => {
        setStatus("Still waiting for Gemini. This usually takes a few seconds.");
    }, 7000);
    loadingMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });

    try {
        const payload = await translateText(text);
        loadingMessage.querySelector(".message-body").textContent = payload.translatedText;
    } catch (error) {
        loadingMessage.querySelector(".message-body").textContent = error.message;
        setStatus("Translation failed. See the message above.");
    } finally {
        window.clearTimeout(waitNotice);
        promptInput.focus();
    }
});

autoResizeTextarea();
setupScrollReveal();

window.addEventListener("load", () => {
    showAppShell();
});
