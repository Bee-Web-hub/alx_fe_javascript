// ====== STORAGE SETUP ======
let quotes = [];

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The best way to predict the future is to invent it.", category: "inspiration" },
      { text: "Life is what happens when you're busy making other plans.", category: "life" }
    ];
    saveQuotes(); // Save the default quotes
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ====== DISPLAY RANDOM QUOTE ======
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  document.getElementById("quoteDisplay").innerHTML = `"${quote.text}" - Category: ${quote.category}`;
  
  // Store last displayed quote in sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// ====== ADD QUOTE FUNCTION ======
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text === "" || category === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  displayRandomQuote();
}

// ====== CREATE ADD QUOTE FORM ======
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

// ====== EXPORT TO JSON FILE ======
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ====== IMPORT FROM JSON FILE ======
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
        displayRandomQuote();
      } else {
        alert("Invalid JSON format.");
      }
    } catch (e) {
      alert("Error reading or parsing file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ====== INITIALIZE PAGE ======
loadQuotes();
createAddQuoteForm();

const lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) {
  const quote = JSON.parse(lastQuote);
  document.getElementById("quoteDisplay").innerHTML = `"${quote.text}" - Category: ${quote.category}`;
} else {
  displayRandomQuote();
}

document.getElementById("newQuote").addEventListener("click", displayRandomQuote);
