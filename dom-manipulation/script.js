// ===== DYNAMIC QUOTE GENERATOR JS =====

// ===== INITIAL QUOTES & STORAGE SETUP =====
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
  {
    text: "The best way to get started is to quit talking and begin doing.",
    category: "Motivation"
  },
  {
    text: "Success is not the key to happiness. Happiness is the key to success.",
    category: "Success"
  },
  {
    text: "Your time is limited, so don’t waste it living someone else’s life.",
    category: "Life"
  }
];

let selectedCategory = localStorage.getItem('selectedCategory') || 'all';
let currentQuoteIndex = 0;

// ===== DOM ELEMENTS =====
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const quoteFormContainer = document.getElementById('quoteFormContainer');
const categoryFilter = document.getElementById('categoryFilter');

// ===== UTILITY FUNCTIONS =====
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function saveSelectedCategory(category) {
  localStorage.setItem('selectedCategory', category);
}

// ===== FETCH / POST TO SERVER =====
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    const serverQuotes = data.slice(0, 5).map(item => ({
      text: item.body,
      author: `User ${item.userId}`,
      category: "Imported"
    }));
    const storedQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
    const newQuotes = serverQuotes.filter(sq => !storedQuotes.some(lq => lq.text === sq.text));
    const mergedQuotes = [...storedQuotes, ...newQuotes];
    localStorage.setItem("quotes", JSON.stringify(mergedQuotes));
    quotes = mergedQuotes;
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

// ===== SYNC FUNCTION =====
async function syncQuotes() {
  await fetchQuotesFromServer();
  quotes = JSON.parse(localStorage.getItem("quotes")) || [];
  renderQuote();
  renderCategories();
  alert("Quotes synced with server!");
}

// ===== QUOTE DISPLAY =====
function getFilteredQuotes() {
  return selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);
}

function showRandomQuote() {
  const filtered = getFilteredQuotes();
  if (filtered.length === 0) {
    quoteDisplay.innerText = "No quotes found in this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];
  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    ${quote.author ? `<p>- ${quote.author} (${quote.category})</p>` : `<p>- ${quote.category}</p>`}
  `;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function renderQuote() {
  if (!quotes.length) return;
  const quote = quotes[currentQuoteIndex % quotes.length];
  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    ${quote.author ? `<p>- ${quote.author} (${quote.category})</p>` : `<p>- ${quote.category}</p>`}
  `;
}

// ===== CATEGORY DROPDOWN =====
function populateCategories() {
  const categories = ["All Categories", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = categories.map(cat => `<option value="${cat}" ${selectedCategory === cat ? "selected" : ""}>${cat}</option>`).join("");
}

function filterQuotes() {
  selectedCategory = categoryFilter.value;
  saveSelectedCategory(selectedCategory);
  const filtered = selectedCategory === "All Categories" ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (filtered.length) {
    currentQuoteIndex = 0;
    quoteDisplay.innerHTML = `
      <blockquote>"${filtered[0].text}"</blockquote>
      ${filtered[0].author ? `<p>- ${filtered[0].author} (${filtered[0].category})</p>` : `<p>- ${filtered[0].category}</p>`}
    `;
  } else {
    quoteDisplay.innerHTML = "<p>No quotes found for this category.</p>";
  }
}

// ===== ADD QUOTE FUNCTIONS =====
function addQuote() {
  const textInput = document.getElementById("quoteText") || document.getElementById("newQuoteText");
  const authorInput = document.getElementById("quoteAuthor");
  const categoryInput = document.getElementById("quoteCategory") || document.getElementById("newQuoteCategory");

  const text = textInput?.value.trim();
  const author = authorInput?.value.trim();
  const category = categoryInput?.value.trim();

  if (!text || !category) return alert("Please enter all required fields.");

  const newQuote = { text, category };
  if (author) newQuote.author = author;

  quotes.push(newQuote);
  saveQuotes();
  renderQuote();
  renderCategories();
  postQuoteToServer(newQuote);
  alert("Quote added!");

  if (textInput) textInput.value = "";
  if (authorInput) authorInput.value = "";
  if (categoryInput) categoryInput.value = "";
}

// ===== CREATE QUOTE FORMS =====
function createAddQuoteForm() {
  const container = document.getElementById("quoteFormContainer");
  container.innerHTML = ""; // Clear previous
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

function setupForm() {
  const container = document.getElementById("quoteFormContainer");
  container.innerHTML = `
    <h3>Add a Quote</h3>
    <input type="text" id="quoteText" placeholder="Quote text" /><br/>
    <input type="text" id="quoteAuthor" placeholder="Author" /><br/>
    <input type="text" id="quoteCategory" placeholder="Category" /><br/>
    <button onclick="addQuote()">Add Quote</button>
  `;
}

// ===== EXPORT / IMPORT =====
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
        localStorage.setItem("quotes", JSON.stringify(quotes));
        renderQuote();
        renderCategories();
        alert("Quotes imported!");
      }
    } catch (e) {
      alert("Invalid file format.");
    }
  };
  reader.readAsText(file);
}

// ===== EVENT LISTENERS =====
newQuoteBtn.addEventListener("click", () => {
  currentQuoteIndex++;
  renderQuote();
});
categoryFilter.addEventListener("change", filterQuotes);
window.importFromJsonFile = importFromJsonFile;
window.exportToJsonFile = exportToJsonFile;

// ===== AUTO SYNC =====
setInterval(syncQuotes, 30000);

// ===== INITIAL LOAD =====
window.onload = async () => {
  await syncQuotes();
  setupForm();
  createAddQuoteForm();
  populateCategories();

  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    quoteDisplay.innerHTML = `
      <blockquote>"${quote.text}"</blockquote>
      ${quote.author ? `<p>- ${quote.author} (${quote.category})</p>` : `<p>- ${quote.category}</p>`}
    `;
  } else {
    renderQuote();
  }
};
