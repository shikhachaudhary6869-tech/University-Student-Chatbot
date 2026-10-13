
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");

const newChatBtn = document.getElementById("newChatBtn");
const startChatBtn = document.getElementById("startChatBtn");

const quickButtons = document.querySelectorAll(
    "[data-question]"
);

let conversations = JSON.parse(
    localStorage.getItem("universityChats") || "[]"
);

let currentMessages = [];
let isLoading = false;

function saveConversations() {
    localStorage.setItem(
        "universityChats",
        JSON.stringify(conversations)
    );
}

function addMessage(text, type, renderMarkdown = false) {
    const message = document.createElement("div");
    message.className =
        type === "user" ? "user-message" : "bot-message";

    if (renderMarkdown && typeof marked !== "undefined") {
        message.innerHTML = DOMPurify.sanitize(
            marked.parse(text || "")
        );
    } else {
        message.textContent = text;
    }

    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;

    return message;
}

function showWelcome() {
    chatBox.innerHTML = "";

    addMessage(
        "Hello! 👋 I'm your university support assistant. Ask me about academics, examinations, placements, library services, scholarships or other student-support topics.",
        "bot"
    );
}

function saveCurrentChat() {
    if (currentMessages.length === 0) return;

    const firstUserMessage = currentMessages.find(
        message => message.role === "user"
    );

    if (!firstUserMessage) return;

    const title = firstUserMessage.text.slice(0, 45);

    const existingIndex = conversations.findIndex(
        chat => chat.id === currentChatId
    );

    const chat = {
        id: currentChatId,
        title,
        messages: currentMessages,
        updatedAt: new Date().toLocaleString()
    };

    if (existingIndex >= 0) {
        conversations[existingIndex] = chat;
    } else {
        conversations.unshift(chat);
    }

    conversations = conversations.slice(0, 30);
    saveConversations();
}

let currentChatId = Date.now().toString();

async function sendMessage(question) {
    const prompt = (question ?? userInput.value).trim();

    if (!prompt || isLoading) return;

    currentMessages.push({
        role: "user",
        text: prompt
    });

    addMessage(prompt, "user");
    userInput.value = "";

    isLoading = true;
    sendBtn.disabled = true;
    sendBtn.textContent = "…";

    const loadingMessage = addMessage(
        "Thinking... 💭",
        "bot"
    );

    try {
        const response = await fetch("http://localhost:3000/gemini", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || `Request failed (${response.status})`
            );
        }

        loadingMessage.remove();

        const answer =
            data.output_text ||
            "Sorry, I could not understand that.";

        addMessage(answer, "bot", true);

        currentMessages.push({
            role: "assistant",
            text: answer
        });

        saveCurrentChat();

    } catch (error) {
        console.error(error);
        loadingMessage.remove();

        addMessage(
            "Sorry, I couldn't get a response. Please try again in a moment.",
            "bot"
        );
    } finally {
        isLoading = false;
        sendBtn.disabled = false;
        sendBtn.textContent = "➤";
        userInput.focus();
    }
}

chatForm.addEventListener("submit", function(event) {
    event.preventDefault();
    sendMessage();
});

quickButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        sendMessage(button.dataset.question);
    });
});

newChatBtn.addEventListener("click", function() {
    if (isLoading) return;

    currentMessages = [];
    currentChatId = Date.now().toString();

    showWelcome();
    userInput.focus();
});

startChatBtn.addEventListener("click", function() {
    document.getElementById("chat").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    userInput.focus();
});

document.querySelectorAll(".nav-item").forEach(function(button) {
    button.addEventListener("click", function() {
        document.querySelectorAll(".nav-item").forEach(function(item) {
            item.classList.remove("active");
        });

        button.classList.add("active");

        const section = button.dataset.section;

        if (section === "history") {
            showChatHistory();
        } else if (section === "home") {
            document.getElementById("home").scrollIntoView({
                behavior: "smooth"
            });
        } else if (section === "chat") {
            document.getElementById("chat").scrollIntoView({
                behavior: "smooth"
            });
            userInput.focus();
        } else if (section === "info") {
            document.getElementById("info").scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});

function showChatHistory() {
    chatBox.innerHTML = "";

    const heading = document.createElement("h3");
    heading.textContent = "Recent Conversations";
    heading.style.marginBottom = "15px";
    chatBox.appendChild(heading);

    if (conversations.length === 0) {
        addMessage(
            "No saved conversations yet. Start by asking a question!",
            "bot"
        );
        return;
    }

    conversations.forEach(function(chat) {
        const button = document.createElement("button");
        button.className = "suggestion";
        button.style.width = "100%";
        button.style.marginBottom = "8px";
        button.textContent =
            chat.title + " · " + chat.updatedAt;

        button.addEventListener("click", function() {
            loadConversation(chat);
        });

        chatBox.appendChild(button);
    });
}

function loadConversation(chat) {
    currentChatId = chat.id;
    currentMessages = [...chat.messages];

    chatBox.innerHTML = "";

    currentMessages.forEach(function(message) {
        addMessage(
            message.text,
            message.role === "user" ? "user" : "bot",
            message.role !== "user"
        );
    });

    document.getElementById("chat").scrollIntoView({
        behavior: "smooth"
    });
}

showWelcome();
