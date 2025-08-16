// ===== DYNAMIC QUOTE GENERATOR JS =====

// ==============================
// INITIAL QUOTES & STORAGE SETUP
// ==============================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  {
    text: "The only limit to our realization of tomorrow is our doubts of today.",
    author: "Franklin D. Roosevelt",
    category: "Motivation"
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon",
    category: "Life"
  },
  { text: "The best way to get started is to quit talking and begin doing.", author: "", category: "Motivation" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", author: "", category: "Success" },
  { text: "Your time is limited, so don’t waste it living someone else’s life.", author: "", category: "Life" }
];

let currentQuoteIndex = 0;
let selectedCategory = localStorage.getItem('selectedCategory') || 'all';

// ==============================
// DOM ELEMENTS
// ==============================
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const quoteFormContainer = document.getElementById('quoteFormContainer');
const categoryFilter = document.getElementById('categoryFilter');

// ==============================
// UTILITY FUNCTIONS
// ==============================
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function saveSelectedCategory(category) {
  localStorage.setItem('selectedCategory', category);
}

// ==============================
// SERVER SYNC
// ==============================
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    const serverQuotes = data.slice(0, 5).map(item => ({
      text: item.body,
      author: `User ${item.userId}`,
      category: "Imported"
    }));

    const newQuotes = serverQuotes.filter(sq => !quotes.some(lq => lq.text === sq.text));
    quotes = [...quotes, ...newQuotes];
    saveQuotes();

    renderQuote();
    renderCategories();

    if (newQuotes.length) alert("Quotes synced with server!");
  } catch (error) {
    console.error("Error fetching quotes:", error);
  }
}

async function postQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    const result = await response.json();
    console.log("Posted to server:", result);
  } catch (error) {
    console.error("Error posting quote:", error);
  }
}

async function syncQuotes() {
  await fetchQuotesFromServer();
  quotes = JSON.parse(localStorage.getItem("quotes")) || [];
  renderQuote();
  renderCategories();
  alert("Quotes synced with server!");
}

// ==============================
// RENDERING
// ==============================
function renderQuote() {
  const filtered = getFilteredQuotes();
  const quote = filtered[currentQuoteIndex % filtered.length];
  if (!quote) {
    quoteDisplay.innerHTML = "<p>No quotes found.</p>";
    return;
  }
  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p>- ${quote.author || "Unknown"} (${quote.category})</p>
  `;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function renderCategories() {
  const categories = ["All Categories", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = categories.map(cat => `<option value="${cat}" ${cat === selectedCategory ? "selected" : ""}>${cat}</option>`).join("");
}

// ==============================
// FILTERING
// ==============================
function getFilteredQuotes() {
  if (selectedCategory === "all" || selectedCategory === "All Categories") return quotes;
  return quotes.filter(q => q.category === selectedCategory);
}

function filterQuotes() {
  selectedCategory = categoryFilter.value;
  saveSelectedCategory(selectedCategory);
  currentQuoteIndex = 0;
  renderQuote();
}

// ==============================
// ADD QUOTE FUNCTIONS
// ==============================
function addQuote() {
  const text = document.getElementById("quoteText")?.value.trim() || document.getElementById("newQuoteText")?.value.trim();
  const author = document.getElementById("quoteAuthor")?.value.trim() || "Unknown";
  const category = document.getElementById("quoteCategory")?.value.trim() || document.getElementById("newQuoteCategory")?.value.trim();

  if (!text || !category) {
    alert("All fields are required.");
    return;
  }

  const newQuote = { text, author, category };
  quotes.push(newQuote);
  saveQuotes();
  renderQuote();
  renderCategories();
  postQuoteToServer(newQuote);
  alert("Quote added!");

  if (document.getElementById("quoteForm")) document.getElementById("quoteForm").reset();
  if (document.getElementById("newQuoteText")) {
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  }
}

// ==============================
// FORM SETUP
// ==============================
function setupForm() {
  const container = document.getElementById("quoteFormContainer");
  container.innerHTML = `
    <h3>Add a Quote</h3>
    <input type="text" id="quoteText" placeholder="Quote text" /><br/>
    <input type="text" id="quoteAuthor" placeholder="Author" /><br/>
    <input type="text" id="quoteCategory" placeholder="Category" /><br/>
    <button type="button" onclick="addQuote()">Add Quote</button>
  `;
}

function createAddQuoteForm() {
  const container = document.getElementById("quoteFormContainer");
  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  container.appendChild(quoteInput);
  container.appendChild(categoryInput);
  container.appendChild(addButton);
}

// ==============================
// EXPORT / IMPORT
// ==============================
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  alert("Quotes exported!");
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (Array.isArray(imported)) {
        quotes = [...quotes, ...imported];
        saveQuotes();
        renderQuote();
        renderCategories();
        alert("Quotes imported!");
      } else {
        alert("Invalid file format.");
      }
    } catch (e) {
      alert("Invalid file format.");
    }
  };
  reader.readAsText(file);
}

// ==============================
// INITIALIZE APP
// ==============================
window.onload = async () => {
  setupForm();
  createAddQuoteForm();
  renderCategories();
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    quoteDisplay.innerHTML = `<blockquote>"${quote.text}"</blockquote><p>- ${quote.author || "Unknown"} (${quote.category})</p>`;
  } else {
    await syncQuotes();
  }
};

// ==============================
// EVENTS
// ==============================
newQuoteBtn.addEventListener("click", () => {
  currentQuoteIndex++;
  renderQuote();
});
categoryFilter.addEventListener("change", filterQuotes);

// ==============================
// AUTO SYNC
// ==============================
setInterval(syncQuotes, 30000);

// ==============================
// GLOBALS
// ==============================
window.importFromJsonFile = importFromJsonFile;
window.exportToJsonFile = exportToJson
