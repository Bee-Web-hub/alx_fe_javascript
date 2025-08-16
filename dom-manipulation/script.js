// Step 1: Sample quotes
const quotes = [
  { text: "The best way to predict the future is to invent it.", category: "inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "life" }
];

// Step 2: Show a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" - Category: ${quote.category}`;
}

// Step 3: Link button to function
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Call it once at start
showRandomQuote();

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

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text === "" || category === "") {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  showRandomQuote(); // Optional: show the new quote right away
}

createAddQuoteForm(); // Run this when the page loads
