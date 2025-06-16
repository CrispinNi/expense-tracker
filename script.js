document.addEventListener("DOMContentLoaded", function () {
  const expenseForm = document.getElementById("expense-form");
  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const dateInput = document.getElementById("date");
  const transactionsList = document.getElementById("transactions-list");
  const balanceElement = document.getElementById("balance");
  const filterDateFrom = document.getElementById("filter-date-from");
  const filterDateTo = document.getElementById("filter-date-to");
  const applyFilterBtn = document.getElementById("apply-filter");
  const clearFilterBtn = document.getElementById("clear-filter");

  // Initialize transactions array from localStorage or empty array
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  function init() {
    expenseForm.addEventListener("submit", addTransaction);
    applyFilterBtn.addEventListener("click", applyDateFilter);
    clearFilterBtn.addEventListener("click", clearDateFilter);
    filterDateFrom.addEventListener("change", applyDateFilter);
    filterDateTo.addEventListener("change", applyDateFilter);

    // Initial render
    updateBalance();
    renderTransactions();
  }

  // Add a new transaction
  function addTransaction(e) {
    e.preventDefault();

    if (!descriptionInput.value || !amountInput.value || !dateInput.value) {
      alert("Please fill in all fields");
      return;
    }

    // Create transaction object
    const transaction = {
      id: generateID(),
      description: descriptionInput.value,
      amount: +amountInput.value,
      date: dateInput.value,
    };

    // Add to transactions array
    transactions.push(transaction);

    updateLocalStorage();
    renderTransactions();
    updateBalance();

    expenseForm.reset();
  }

  // Generate random ID for transactions
  function generateID() {
    return Math.floor(Math.random() * 100000000);
  }

  // Render transactions list with optional date filtering
  function renderTransactions() {
    transactionsList.innerHTML = "";

    let filteredTransactions = [...transactions];
    if (filterDateFrom.value) {
      filteredTransactions = filteredTransactions.filter(
        (transaction) =>
          new Date(transaction.date) >= new Date(filterDateFrom.value)
      );
    }

    if (filterDateTo.value) {
      const endDate = new Date(filterDateTo.value);
      endDate.setHours(23, 59, 59, 999);

      filteredTransactions = filteredTransactions.filter(
        (transaction) => new Date(transaction.date) <= endDate
      );
    }

    // Show message if no transactions
    if (filteredTransactions.length === 0) {
      transactionsList.innerHTML =
        '<li class="empty">No transactions found for selected dates</li>';
      return;
    }

    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Create transaction items
    filteredTransactions.forEach((transaction) => {
      const li = document.createElement("li");
      li.className = `transaction ${
        transaction.amount > 0 ? "income" : "expense"
      }`;

      li.innerHTML = `
                <div class="transaction-description">${
                  transaction.description
                }</div>
                <div class="transaction-amount ${
                  transaction.amount > 0
                    ? "transaction-income"
                    : "transaction-expense"
                }">
                    ${
                      transaction.amount > 0 ? "+" : ""
                    }${transaction.amount.toFixed(2)}
                </div>
                <div class="transaction-date">${formatDate(
                  transaction.date
                )}</div>
                <button class="edit-btn">✏️</button>
                <button class="delete-btn">❌</button>
            `;

      // Add event listeners for edit/delete
      li.querySelector(".delete-btn").addEventListener("click", () =>
        deleteTransaction(transaction.id)
      );
      li.querySelector(".edit-btn").addEventListener("click", () =>
        editTransaction(transaction.id)
      );

      transactionsList.appendChild(li);
    });

    const countDisplay = document.createElement("div");
    countDisplay.className = "filter-count";
    countDisplay.textContent = `Showing ${filteredTransactions.length} of ${transactions.length} transactions`;
    transactionsList.insertBefore(countDisplay, transactionsList.firstChild);
  }

  function formatDate(dateString) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  // Update the balance display
  function updateBalance() {
    const total = transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    );
    balanceElement.textContent = `$${total.toFixed(2)}`;

    if (total > 0) {
      balanceElement.style.color = "var(--income-color)";
    } else if (total < 0) {
      balanceElement.style.color = "var(--expense-color)";
    } else {
      balanceElement.style.color = "inherit";
    }
  }

  // Delete a transaction
  function deleteTransaction(id) {
    if (confirm("Are you sure you want to delete this transaction?")) {
      transactions = transactions.filter(
        (transaction) => transaction.id !== id
      );
      updateLocalStorage();
      renderTransactions();
      updateBalance();
    }
  }

  // Edit a transaction
  function editTransaction(id) {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;

    descriptionInput.value = transaction.description;
    amountInput.value = transaction.amount;
    dateInput.value = transaction.date;

    // Remove the transaction being edited
    transactions = transactions.filter((t) => t.id !== id);

    // Update UI and storage
    updateLocalStorage();
    renderTransactions();
    updateBalance();

    document
      .querySelector(".form-section")
      .scrollIntoView({ behavior: "smooth" });
  }

  function applyDateFilter() {
    renderTransactions();
  }
  function clearDateFilter() {
    filterDateFrom.value = "";
    filterDateTo.value = "";
    renderTransactions();
  }

  // Update localStorage with current transactions
  function updateLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }
  init();
});
