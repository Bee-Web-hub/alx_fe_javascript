// ===== DYNAMIC QUOTE GENERATOR JS =====

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "Life" }
];

let currentQuoteIndex = 0;

// ===== DISPLAY / RANDOM QUOTE =====
function displayRandomQuote() {
  if (!quotes.length) return;
  currentQuoteIndex = Math.floor(Math.random() * quotes.length);
  renderQuote();
}

function renderQuote() {
  const quote = quotes[currentQuoteIndex % quotes.length];
  document.getElementById("quoteDisplay").innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p>- ${quote.author} (${quote.category})</p>
  `;
}

// ===== CATEGORY FILTER =====
function renderCategories() {
  const select = document.getElementById("categoryFilter");
  const categories = ["All Categories", ...new Set(quotes.map(q => q.category))];
  select.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
}

function filterQuotes() {
  const filter = document.getElementById("categoryFilter").value;
  const filtered = filter === "All Categories" ? quotes : quotes.filter(q => q.category === filter);
  if (filtered.length) {
    currentQuoteIndex = 0;
    renderQuote();
  } else {
    document.getElementById("quoteDisplay").innerHTML = "<p>No quotes found for this category.</p>";
  }
}

// ===== ADD QUOTE FORM =====
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

function addQuote() {
  const text = document.getElementById("quoteText").value.trim();
  const author = document.getElementById("quoteAuthor").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();
  if (text && author && category) {
    const newQuote = { text, author, category };
    quotes.push(newQuote);
    localStorage.setItem("quotes", JSON.stringify(quotes));
    renderQuote();
    renderCategories();
    postQuoteToServer(newQuote);
    alert("Quote added!");
  } else {
    alert("All fields are required.");
  }
}

// ===== EXPORT / IMPORT =====
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  alert("Quotes exported!");
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (Array.isArray(imported)) {
        const newQuotes = imported.filter(iq => !quotes.some(q => q.text === iq.text));
        quotes = [...quotes, ...newQuotes];
        localStorage.setItem("quotes", JSON.stringify(quotes));
        renderQuote();
        renderCategories();
        if (newQuotes.length) alert(`${newQuotes.length} quotes imported!`);
      }
    } catch (e) {
      alert("Invalid file format.");
    }
  };
  reader.readAsText(file);
}

// ===== FETCH / POST / SYNC =====
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
    if (newQuotes.length) {
      quotes = [...quotes, ...newQuotes];
      localStorage.setItem("quotes", JSON.stringify(quotes));
      alert(`${newQuotes.length} new quote(s) synced with server!`);
      renderQuote();
      renderCategories();
    }
  } catch (error) {
    console.error("Error fetching quotes:", error);
  }
}

async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
  } catch (error) {
    console.error("Error posting quote:", error);
  }
}

async function syncQuotes() {
  await fetchQuotesFromServer();
}

// ===== EVENTS =====
document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
document.getElementById("categoryFilter").addEventListener("change", filterQuotes);

// ===== AUTO SYNC =====
setInterval(syncQuotes, 30000);

// ===== INITIALIZE =====
window.onload = async () => {
  displayRandomQuote();
  renderCategories();
  setupForm();
  await syncQuotes();
};
