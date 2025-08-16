// Final script.js that includes:
// - Full quote generator logic
// - Fetch from mock API
// - Post to mock API
// - Syncing local storage
// - UI update

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
  }
];

let currentQuoteIndex = 0;

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

    // Simple conflict resolution: Avoid duplicate text entries
    const newQuotes = serverQuotes.filter(sq => !storedQuotes.some(lq => lq.text === sq.text));
    const mergedQuotes = [...storedQuotes, ...newQuotes];

    localStorage.setItem("quotes", JSON.stringify(mergedQuotes));
    quotes = mergedQuotes;
    renderQuote();
    renderCategories();
    notify("Quotes updated from server.");
  } catch (error) {
    console.error("Error fetching quotes:", error);
  }
}

async function postQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quote)
    });
    const result = await response.json();
    console.log("Posted to server:", result);
  } catch (error) {
    console.error("Error posting quote:", error);
  }
}

function renderQuote() {
  const quote = quotes[currentQuoteIndex % quotes.length];
  document.getElementById("quoteDisplay").innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p>- ${quote.author} (${quote.category})</p>
  `;
}

function renderCategories() {
  const select = document.getElementById("categoryFilter");
  const categories = ["All Categories", ...new Set(quotes.map(q => q.category))];
  select.innerHTML = categories
    .map(cat => `<option value="${cat}">${cat}</option>`)
    .join("");
}

function filterQuotes() {
  const filter = document.getElementById("categoryFilter").value;
  const filtered = filter === "All Categories" ? quotes : quotes.filter(q => q.category === filter);
  if (filtered.length) {
    currentQuoteIndex = 0;
    document.getElementById("quoteDisplay").innerHTML = `
      <blockquote>"${filtered[0].text}"</blockquote>
      <p>- ${filtered[0].author} (${filtered[0].category})</p>
    `;
  } else {
    document.getElementById("quoteDisplay").innerHTML = "<p>No quotes found for this category.</p>";
  }
}

function setupForm() {
  const container = document.getElementById("quoteFormContainer");
  container.innerHTML = `
    <h3>Add a Quote</h3>
    <input type="text" id="quoteText" placeholder="Quote text" /><br />
    <input type="text" id="quoteAuthor" placeholder="Author" /><br />
    <input type="text" id="quoteCategory" placeholder="Category" /><br />
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
    notify("Quote added!");
    postQuoteToServer(newQuote);
  } else {
    notify("All fields are required.");
  }
}

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
  notify("Exported quotes.");
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (Array.isArray(imported)) {
        quotes = [...quotes, ...imported];
        localStorage.setItem("quotes", JSON.stringify(quotes));
        renderQuote();
        renderCategories();
        notify("Quotes imported.");
      }
    } catch (e) {
      notify("Invalid file.");
    }
  };
  reader.readAsText(file);
}

function notify(message) {
  const div = document.createElement("div");
  div.textContent = message;
  div.style.background = "#def";
  div.style.padding = "10px";
  div.style.marginTop = "10px";
  document.body.appendChild(div);
  setTimeout(() => document.body.removeChild(div), 3000);
}

// Periodically sync with server every 30 seconds
setInterval(fetchQuotesFromServer, 30000);

document.getElementById("newQuote").addEventListener("click", () => {
  currentQuoteIndex++;
  renderQuote();
});

window.onload = async () => {
  await fetchQuotesFromServer();
  renderQuote();
  renderCategories();
  setupForm();
};
