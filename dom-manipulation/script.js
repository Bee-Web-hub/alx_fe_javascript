// ==============================
// Initial Setup
// ==============================
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Success" },
  { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life" }
];

// Load last selected category or default to "all"
let selectedCategory = localStorage.getItem('selectedCategory') || 'all';

// ==============================
// DOM Elements
// ==============================
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const quoteFormContainer = document.getElementById('quoteFormContainer');
const categoryFilter = document.getElementById('categoryFilter');

// ==============================
// Utility Functions
// ==============================
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function saveSelectedCategory(category) {
  localStorage.setItem('selectedCategory', category);
}

// ==============================
// Quote Display
// ==============================
function getFilteredQuotes() {
  if (selectedCategory === 'all') return quotes;
  return quotes.filter(q => q.category === selectedCategory);
}

function showRandomQuote() {
  const filtered = getFilteredQuotes();
  if (filtered.length === 0) {
    quoteDisplay.innerText = "No quotes found in this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filtered.length);
  quoteDisplay.innerText = `"${filtered[randomIndex].text}" - ${filtered[randomIndex].category}`;
}

// ==============================
// Category Dropdown
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
// Add Quote Form
// ==============================
function createQuoteForm() {
  quoteFormContainer.innerHTML = `
    <h2>Add a New Quote</h2>
    <form id="quoteForm">
      <input type="text" id="quoteText" placeholder="Quote text" required><br>
      <input type="text" id="quoteCategory" placeholder="Category" required><br>
      <button type="submit">Add Quote</button>
    </form>
  `;

  const quoteForm = document.getElementById('quoteForm');
  quoteForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const text = document.getElementById('quoteText').value.trim();
    const category = document.getElementById('quoteCategory').value.trim();

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
// Export Quotes as JSON
// ==============================
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

// ==============================
// Import Quotes from JSON
// ==============================
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) {
        alert("Invalid file format.");
        return;
      }
      quotes = quotes.concat(importedQuotes);
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
// Event Listeners
// ==============================
newQuoteBtn.addEventListener('click', showRandomQuote);
categoryFilter.addEventListener('change', filterQuotes);
window.importFromJsonFile = importFromJsonFile;
window.exportToJsonFile = exportToJsonFile;

// ==============================
// Initialize App
// ==============================
populateCategories();
createQuoteForm();
filterQuotes();
