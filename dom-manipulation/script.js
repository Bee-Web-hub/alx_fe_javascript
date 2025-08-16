let quotes = [];
let currentQuoteIndex = -1;
let localStorageKey = 'quotes';

const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const quoteFormContainer = document.getElementById('quoteFormContainer');
const syncStatus = document.getElementById('syncStatus');

// Load quotes on page load
window.onload = async () => {
  loadFromLocalStorage();
  renderQuoteForm();
  updateCategoryFilter();
  displayRandomQuote();
  await syncQuotes();
  setInterval(syncQuotes, 15000); // sync every 15 seconds
};

function loadFromLocalStorage() {
  const saved = localStorage.getItem(localStorageKey);
  if (saved) quotes = JSON.parse(saved);
}

function saveToLocalStorage() {
  localStorage.setItem(localStorageKey, JSON.stringify(quotes));
}

function updateCategoryFilter() {
  const categories = new Set(quotes.map(q => q.category));
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

function displayRandomQuote() {
  const filtered = getFilteredQuotes();
  if (filtered.length === 0) {
    quoteDisplay.innerText = 'No quotes available.';
    return;
  }

  let index;
  do {
    index = Math.floor(Math.random() * filtered.length);
  } while (index === currentQuoteIndex && filtered.length > 1);

  currentQuoteIndex = index;
  const quote = filtered[index];
  quoteDisplay.innerText = `"${quote.text}" — ${quote.author} [${quote.category}]`;
}

function getFilteredQuotes() {
  const selected = categoryFilter.value;
  return selected === 'all'
    ? quotes
    : quotes.filter(q => q.category === selected);
}

document.getElementById('newQuote').addEventListener('click', displayRandomQuote);

function renderQuoteForm() {
  quoteFormContainer.innerHTML = `
    <h3>Add a New Quote</h3>
    <form id="quoteForm">
      <input type="text" name="text" placeholder="Quote text" required />
      <input type="text" name="author" placeholder="Author" required />
      <input type="text" name="category" placeholder="Category" required />
      <button type="submit">Add Quote</button>
    </form>
  `;

  document.getElementById('quoteForm').addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newQuote = {
      text: formData.get('text'),
      author: formData.get('author'),
      category: formData.get('category')
    };

    quotes.push(newQuote);
    saveToLocalStorage();
    updateCategoryFilter();
    displayRandomQuote();
    e.target.reset();
    await postQuoteToServer(newQuote);
  });
}

// ✅ Mock API fetch (simulate server with delay)
async function fetchQuotesFromServer() {
  syncStatus.textContent = '🔄 Syncing from server...';
  return new Promise(resolve => {
    setTimeout(() => {
      const mockQuotes = [
        {
          text: "The only way to do great work is to love what you do.",
          author: "Steve Jobs",
          category: "Motivation"
        },
        {
          text: "Life is what happens when you're busy making other plans.",
          author: "John Lennon",
          category: "Life"
        }
      ];
      syncStatus.textContent = '✅ Synced from server.';
      resolve(mockQuotes);
    }, 1000);
  });
}

// ✅ Mock POST to server
async function postQuoteToServer(quote) {
  console.log('Posting to server:', quote);
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('✅ Quote posted.');
      resolve({ success: true });
    }, 1000);
  });
}

// ✅ Synchronize local and server data
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  let updated = false;
  serverQuotes.forEach(serverQ => {
    if (!quotes.some(q => q.text === serverQ.text && q.author === serverQ.author)) {
      quotes.push(serverQ);
      updated = true;
    }
  });

  if (updated) {
    saveToLocalStorage();
    updateCategoryFilter();
    syncStatus.textContent = '✅ Quotes updated from server.';
  } else {
    syncStatus.textContent = '✅ No new updates.';
  }
}

// ✅ Export to JSON
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'quotes.json';
  link.click();
}

// ✅ Import from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async e => {
    try {
      const imported = JSON.parse(e.target.result);
      imported.forEach(q => {
        if (!quotes.some(existing => existing.text === q.text && existing.author === q.author)) {
          quotes.push(q);
        }
      });
      saveToLocalStorage();
      updateCategoryFilter();
      displayRandomQuote();
      await postQuoteToServer({ text: 'Batch import', author: 'System', category: 'System' });
    } catch (err) {
      alert('Invalid JSON file.');
    }
  };
  reader.readAsText(file);
}
