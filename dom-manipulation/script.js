// Load quotes from local storage or use default quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
    { text: "The purpose of our lives is to be happy.", category: "Happiness" },
];

// Function to display a random quote
function showRandomQuote() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(quote => quote.category === selectedCategory);

    if (filteredQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        const quote = filteredQuotes[randomIndex];
        const quoteDisplay = document.getElementById('quoteDisplay');
        quoteDisplay.innerHTML = `<p>${quote.text}</p><p><em>${quote.category}</em></p>`;
        
        // Save the last viewed quote to session storage
        sessionStorage.setItem('lastQuote', JSON.stringify(quote));
    } else {
        const quoteDisplay = document.getElementById('quoteDisplay');
        quoteDisplay.innerHTML = `<p>No quotes available in this category.</p>`;
    }
}

// Function to add a new quote
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;

    if (newQuoteText && newQuoteCategory) {
        quotes.push({ text: newQuoteText, category: newQuoteCategory });
        saveQuotes();
        updateCategorySelect();
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        alert('Quote added successfully!');
    } else {
        alert('Please enter both a quote and a category.');
    }
}

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to update the category dropdown
function updateCategorySelect() {
    const categorySelect = document.getElementById('categoryFilter');
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    
    categorySelect.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Function to filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    localStorage.setItem('selectedCategory', selectedCategory);
    showRandomQuote();
}

// Function to export quotes to a JSON file
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        updateCategorySelect();
        alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
}

// Simulated server interaction
const serverUrl = 'https://jsonplaceholder.typicode.com/posts'; // Example server URL

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(serverUrl);
        const serverQuotes = await response.json();
        handleServerQuotes(serverQuotes);
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
    }
}

// Function to handle quotes fetched from the server
function handleServerQuotes(serverQuotes) {
    const newQuotes = serverQuotes.map(q => ({ text: q.title, category: q.body })); // Adjust based on actual server data structure
    const combinedQuotes = mergeQuotes(quotes, newQuotes);
    quotes = combinedQuotes;
    saveQuotes();
    updateCategorySelect();
    notifyUser('Quotes updated from server');
}

// Function to merge local and server quotes
function mergeQuotes(localQuotes, serverQuotes) {
    const combinedQuotes = [...localQuotes];
    serverQuotes.forEach(sq => {
        if (!localQuotes.some(lq => lq.text === sq.text && lq.category === sq.category)) {
            combinedQuotes.push(sq);
        }
    });
    return combinedQuotes;
}

// Function to notify the user of updates
function notifyUser(message) {
    const notification = document.getElementById('notification');
    notification.innerText = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('addQuoteButton').addEventListener('click', addQuote);
document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
document.getElementById('exportButton').addEventListener('click', exportToJsonFile);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);

// Periodic data fetching
setInterval(fetchQuotesFromServer, 60000); // Fetch new quotes every 60 seconds

// Initial setup
updateCategorySelect();
const lastSelectedCategory = localStorage.getItem('selectedCategory');
if (lastSelectedCategory) {
    document.getElementById('categoryFilter').value = lastSelectedCategory;
}
showRandomQuote();

// Display the last viewed quote from session storage if available
const lastQuote = JSON.parse(sessionStorage.getItem('lastQuote'));
if (lastQuote) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `<p>${lastQuote.text}</p><p><em>${lastQuote.category}</em></p>`;
}
