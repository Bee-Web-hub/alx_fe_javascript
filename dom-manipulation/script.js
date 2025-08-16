// Dynamic Quote Generator with Sync and Conflict Handling

let quotes = [];
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const quoteFormContainer = document.getElementById('quoteFormContainer');
const syncStatus = document.getElementById('syncStatus');

// --- INITIALIZATION ---
loadQuotes();
renderQuoteForm();
fetchServerQuotes(); // Sync from server at start
setInterval(syncWithServer, 10000); // Sync every 10 seconds

// --- FUNCTIONS ---
function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  quotes = stored ? JSON.parse(stored) : [];
  updateCategoryOptions();
  showQuote();
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function showQuote() {
  const filtered = getFilteredQuotes();
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = random
    ? `<div><strong>${random.text}</strong><br><em>${random.category}</em></div>`
    : '<div>No quotes available for this category.</div>';
}

function renderQuoteForm() {
  quoteFormContainer.innerHTML = `
    <form onsubmit="addQuote(event)">
      <input type="text" id="quoteText" placeholder="Quote" required />
      <input type="text" id="quoteCategory" placeholder="Category" required />
      <button type="submit">Add Quote</button>
    </form>
  `;
}

function addQuote(event) {
  event.preventDefault();
  const text = document.getElementById('quoteText').value;
  const category = document.getElementById('quoteCategory').value;
  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  updateCategoryOptions();
  showQuote();
  event.target.reset();
  sendToServer(newQuote);
}

function updateCategoryOptions() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>' +
    categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

function getFilteredQuotes() {
  const selected = categoryFilter.value;
  return selected === 'all' ? quotes : quotes.filter(q => q.category === selected);
}

function filterQuotes() {
  showQuote();
}

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'quotes.json';
  link.click();
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      quotes = imported;
      saveQuotes();
      updateCategoryOptions();
      showQuote();
    } catch (e) {
      alert('Invalid file format');
    }
  };
  reader.readAsText(file);
}

// --- SIMULATED SERVER SYNC ---
async function fetchServerQuotes() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    const data = await res.json();
    const serverQuotes = data.map(post => ({ text: post.title, category: 'Server' }));
    resolveConflicts(serverQuotes);
  } catch (err) {
    console.warn('Failed to fetch from server:', err);
  }
}

function sendToServer(quote) {
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify(quote),
    headers: { 'Content-Type': 'application/json' },
  })
  .then(res => res.json())
  .then(data => {
    console.log('Synced to server:', data);
  });
}

function syncWithServer() {
  syncStatus.textContent = '🔄 Syncing with server...';
  fetchServerQuotes();
  setTimeout(() => {
    syncStatus.textContent = '✅ Up to date';
  }, 1000);
}

function resolveConflicts(serverQuotes) {
  const newOnes = serverQuotes.filter(sq => !quotes.some(lq => lq.text === sq.text));
  if (newOnes.length) {
    quotes = [...quotes, ...newOnes];
    saveQuotes();
    updateCategoryOptions();
    showQuote();
    alert(`${newOnes.length} new quote(s) synced from server.`);
  }
}

// --- EVENTS ---
newQuoteBtn.addEventListener('click', showQuote);
categoryFilter.addEventListener('change', filterQuotes);
