// ==============================
// INITIAL QUOTES & STORAGE SETUP
// ==============================
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Success" },
  { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life" }
];

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
// QUOTE DISPLAY FUNCTIONS
// ==============================
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
  quoteDisplay.innerText = `"${quote.text}" - ${quote.category}`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// ==============================
// CATEGORY DROPDOWN
// ==============================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    if (cat === selectedCategory) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  selectedCategory = categoryFilter.value;
  saveSelectedCategory(selectedCategory);
  showRandomQuote();
}

// ==============================
// ADD QUOTE FORM
// ==============================
function createQuoteForm() {
  quoteFormContainer.innerHTML = `
    <h2>Add a New Quote</h2>
    <form id="quoteForm">
      <input type="text" id="newQuoteText" placeholder="Quote text" required><br>
      <input type="text" id="newQuoteCategory" placeholder="Category" required><br>
      <button type="submit">Add Quote</button>
    </form>
  `;

  const quoteForm = document.getElementById('quoteForm');
  quoteForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();

    if (!text || !category) return alert('Please enter both text and category.');

    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    filterQuotes();
    quoteForm.reset();
  });
}

// ==============================
// EXPORT / IMPORT FUNCTIONS
// ==============================
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) return alert("Invalid file format.");

      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Quotes imported successfully.");
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  reader.readAsText(file);
}

// ==============================
// INITIALIZE APP
// ==============================
populateCategories();
createQuoteForm();

// Restore last quote if available
const lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) {
  const quote = JSON.parse(lastQuote);
  quoteDisplay.innerText = `"${quote.text}" - ${quote.category}`;
} else {
  showRandomQuote();
}

// ==============================
// EVENT LISTENERS
// ==============================
newQuoteBtn.addEventListener('click', showRandomQuote);
categoryFilter.addEventListener('change', filterQuotes);
window.importFromJsonFile = importFromJsonFile;
window.exportToJsonFile = exportToJsonFile;
