const descriptionInput = document.getElementById('description'); 
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const addButton = document.getElementById('add');
const transactionsList = document.getElementById('transactions-list');
const balanceDisplay = document.getElementById('balance');
const filterRadios = document.querySelectorAll('input[name="filter"]'); // Radio buttons for filtering
const clearAllButton = document.getElementById('clearAll');
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let editIndex = -1; // Track index of the transaction being edited

// Save transactions to localStorage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Update displayed balance based on transactions
function updateBalance() {
    const total = transactions.reduce((acc, transaction) => 
        transaction.type === 'income' ? acc + Number(transaction.amount) : acc - Number(transaction.amount), 0
    );
    balanceDisplay.textContent = `$${total.toFixed(2)}`;
}

// Render transactions based on selected filter
function renderTransactions() {
    transactionsList.innerHTML = '';

    // Get the selected radio filter
    const selectedFilter = document.querySelector('input[name="filter"]:checked').value;

    const filteredTransactions = selectedFilter === 'all' 
        ? transactions 
        : transactions.filter(transaction => transaction.type === selectedFilter);

    filteredTransactions.forEach((transaction, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>${transaction.description}</span>
            <span class="${transaction.type}">$${Number(transaction.amount).toFixed(2)}</span>
            <div>
                <button class="edit" data-index="${index}">✏️</button>
                <button class="delete" data-index="${index}">🗑️</button>
            </div>
        `;
        transactionsList.appendChild(listItem);
    });

    // Update balance after filtering
    updateBalance();

    // Scroll to latest transaction on mobile for better UX
    if (window.innerWidth < 600) {
        transactionsList.scrollTo(0, transactionsList.scrollHeight);
    }
}

// Add or update a transaction
function addTransaction() {
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeSelect.value;

    if (!description || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid description and a positive amount.");
        return;
    }

    if (editIndex === -1) {
        // Add new transaction
        transactions.push({ description, amount, type });
    } else {
        // Edit existing transaction
        transactions[editIndex] = { description, amount, type };
        editIndex = -1; // Reset edit index
        addButton.textContent = "Add Transaction"; // Reset button text
    }
    
    saveTransactions();
    descriptionInput.value = '';
    amountInput.value = '';
    renderTransactions();
}

// Delete a transaction
function deleteTransaction(index) {
    transactions.splice(index, 1);
    saveTransactions();
    renderTransactions();
}

// Edit a transaction
function editTransaction(index) {
    const transaction = transactions[index];
    descriptionInput.value = transaction.description;
    amountInput.value = transaction.amount;
    typeSelect.value = transaction.type;

    editIndex = index; // Store the index of transaction being edited
    addButton.textContent = "Update Transaction"; // Change button text

    // Auto-focus on description input for quick editing
    descriptionInput.focus();
}

// Clear all transactions
function clearAllTransactions() {
    if (transactions.length === 0) return;
    
    if (confirm("Are you sure you want to delete all transactions?")) {
        transactions = [];
        saveTransactions();
        renderTransactions();
    }
}

// Event listener for adding/updating transactions
addButton.addEventListener('click', addTransaction);

// Event listener for clearing all transactions
clearAllButton.addEventListener('click', clearAllTransactions);

// Event delegation for editing and deleting transactions
transactionsList.addEventListener('click', (event) => {
    const index = Number(event.target.dataset.index);
    
    if (event.target.classList.contains('delete')) {
        deleteTransaction(index);
    } else if (event.target.classList.contains('edit')) {
        editTransaction(index);
    }
});

// Event listener for radio button changes
filterRadios.forEach(radio => {
    radio.addEventListener('change', renderTransactions);
});

// ================== DARK MODE FEATURE ===================
// Enable Dark Mode
function enableDarkMode() {
    body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
    darkModeToggle.textContent = '🌙 Dark Mode ON';
}

// Disable Dark Mode
function disableDarkMode() {
    body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
    darkModeToggle.textContent = '☀️ Light Mode ON';
}

// Check dark mode state on page load
if (localStorage.getItem('darkMode') === 'enabled') {
    enableDarkMode();
}

// Toggle dark mode on button click
darkModeToggle.addEventListener('click', () => {
    body.classList.contains('dark-mode') ? disableDarkMode() : enableDarkMode();
});

// Auto-hide keyboard on mobile after submitting a transaction
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addTransaction();
        descriptionInput.blur();
        amountInput.blur();
    }
});

// Initial render
renderTransactions();
