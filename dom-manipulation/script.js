// Final script.js with full support for all required tasks and passing checks

let quotes = JSON.parse(localStorage.getItem('quotes')) || [];
let filteredQuotes = [...quotes];

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const quoteFormContainer = document.getElementById('quoteFormContainer');
const importFile = document.getElementById('importFile');

const syncStatus = document.createElement('div');
syncStatus.style.marginTop = '10px';
document.body.insertBefore(syncStatus, quoteDisplay);

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function renderQuote() {
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = 'No quotes to display.';
    return;
  }
  const random = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = filteredQuotes[random].text;
}

function updateFilterOptions() {
  const categories = ['all', ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  const selected = categoryFilter.value;
  filteredQuotes = selected === 'all' ? [...quotes] : quotes.filter(q => q.category === selected);
  renderQuote();
}

function createQuoteForm() {
  const form = document.createElement('form');
  const textInput = document.createElement('input');
  const categoryInput = document.createElement('input');
  const submitBtn = document.createElement('button');

  textInput.placeholder = 'Enter quote';
  categoryInput.placeholder = 'Enter category';
  submitBtn.textContent = 'Add Quote';
  submitBtn.type = 'submit';

  form.appendChild(textInput);
  form.appendChild(categoryInput);
  form.appendChild(submitBtn);

  form.onsubmit = (e) => {
    e.preventDefault();
    const newQuote = { text: textInput.value, category: categoryInput.value };
    quotes.push(newQuote);
    saveQuotes();
    postQuoteToServer(newQuote);
    updateFilterOptions();
    filterQuotes();
    textInput.value = '';
    categoryInput.value = '';
  };

  quoteFormContainer.appendChild(form);
}

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes = [...quotes, ...importedQuotes];
    saveQuotes();
    updateFilterOptions();
    filterQuotes();
  };
  reader.readAsText(file);
}

function fetchQuotesFromServer() {
  return fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
    .then(res => res.json())
    .then(data => data.map(post => ({ text: post.title, category: 'Server' })))
    .catch(err => {
      console.error('Failed to fetch from server:', err);
      return [];
    });
}

function postQuoteToServer(quote) {
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify(quote),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(res => res.json())
    .then(data => console.log('Posted to server:', data))
    .catch(err => console.error('Post failed:', err));
}

function resolveConflicts(serverQuotes) {
  const newQuotes = serverQuotes.filter(sq => !quotes.some(lq => lq.text === sq.text));
  if (newQuotes.length > 0) {
    quotes = [...quotes, ...newQuotes];
    saveQuotes();
    updateFilterOptions();
    filterQuotes();
    alert(`${newQuotes.length} new quote(s) synced from server.`);
  }
}

function syncQuotes() {
  syncStatus.textContent = '🔄 Syncing with server...';
  fetchQuotesFromServer().then(serverQuotes => {
    resolveConflicts(serverQuotes);
    syncStatus.textContent = '✅ Up to date';
  });
}

// Initialize
updateFilterOptions();
createQuoteForm();
filterQuotes();

newQuoteBtn.onclick = renderQuote;
importFile.onchange = importFromJsonFile;

// Periodic Sync
setInterval(syncQuotes, 10000);
