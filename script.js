// Loan Management System - JavaScript Core

// Financial Tips Array
const financialTips = [
  "Track all loan due dates — missing one payment costs more than you think.",
  "Automate payments to avoid late fees and improve credit health.",
  "Avoid taking new loans until your repayment rate is higher than your borrowing rate.",
  "Prioritize high-interest loans first — they drain your money the fastest.",
  "Cut small unnecessary expenses — they add up and slow your debt payoff."
];

let currentTipIndex = 0;
let tipInterval;

// Initialize localStorage
function initializeStorage() {
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]))
  }
  if (!localStorage.getItem("currentUser")) {
    localStorage.setItem("currentUser", null)
  }
}

// Initialize Financial Tips Slideshow
function initFinancialTips() {
  const tipElement = document.getElementById('financialTipSlideshow');
  const dotsContainer = document.getElementById('tipDots');
  
  if (!tipElement || !dotsContainer) return;
  
  // Create dots
  financialTips.forEach((_, index) => {
    const dot = document.createElement('span');
    dot.className = 'dot';
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => showTip(index));
    dotsContainer.appendChild(dot);
  });
  
  // Show first tip
  showTip(0);
  
  // Start slideshow
  tipInterval = setInterval(nextTip, 5000);
}

// Show specific tip
function showTip(index) {
  currentTipIndex = index;
  const tipElement = document.getElementById('financialTipSlideshow');
  const dots = document.querySelectorAll('.dot');
  
  if (tipElement) {
    tipElement.textContent = financialTips[index];
  }
  
  // Update dots
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// Show next tip
function nextTip() {
  currentTipIndex = (currentTipIndex + 1) % financialTips.length;
  showTip(currentTipIndex);
}

// Registration Handler
function handleRegister(e) {
  e.preventDefault()

  const firstName = document.getElementById("firstName").value
  const lastName = document.getElementById("lastName").value
  const email = document.getElementById("regEmail").value
  const phone = document.getElementById("phone").value
  const password = document.getElementById("regPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value

  const messageEl = document.getElementById("registerMessage")

  // Validation
  if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
    showMessage(messageEl, "All fields are required", "error")
    return
  }

  if (password !== confirmPassword) {
    showMessage(messageEl, "Passwords do not match", "error")
    return
  }

  if (password.length < 6) {
    showMessage(messageEl, "Password must be at least 6 characters", "error")
    return
  }

  // Check for duplicate email
  const users = JSON.parse(localStorage.getItem("users")) || []
  if (users.find((user) => user.email === email)) {
    showMessage(messageEl, "Email already registered", "error")
    return
  }

  // Create new user
  const newUser = {
    id: Date.now(),
    firstName,
    lastName,
    email,
    phone,
    password,
    loans: [],
  }

  users.push(newUser)
  localStorage.setItem("users", JSON.stringify(users))

  showMessage(messageEl, "Registration successful! Redirecting to login...", "success")
  setTimeout(() => {
    window.location.href = "login.html"
  }, 2000)
}

// Login Handler
function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value
  const messageEl = document.getElementById("loginMessage")

  if (!email || !password) {
    showMessage(messageEl, "Email and password are required", "error")
    return
  }

  const users = JSON.parse(localStorage.getItem("users")) || []
  const user = users.find((u) => u.email === email && u.password === password)

  if (!user) {
    showMessage(messageEl, "Invalid email or password", "error")
    return
  }

  localStorage.setItem("currentUser", JSON.stringify(user))
  showMessage(messageEl, "Login successful! Redirecting...", "success")
  setTimeout(() => {
    window.location.href = "dashboard.html"
  }, 1500)
}

// Check Authentication
function checkAuth() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser && window.location.pathname.includes("dashboard")) {
    window.location.href = "login.html"
  }
}

// Logout Handler
function handleLogout(e) {
  if (e) e.preventDefault()
  localStorage.setItem("currentUser", null)
  window.location.href = "index.html"
}

// Load Dashboard
function loadDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  if (!currentUser) return

  // Set user greeting
  const userGreeting = document.getElementById("userGreeting")
  if (userGreeting) {
    userGreeting.textContent = `Welcome back, ${currentUser.firstName}!`
  }

  // Initialize financial tips
  initFinancialTips();

  // Load loans
  currentUser.loans = currentUser.loans || []
  updateDashboard(currentUser)
}

// Update Dashboard Display
function updateDashboard(user) {
  if (!user || !user.loans) return

  // Calculate total debt
  const totalDebt = user.loans.reduce((sum, loan) => {
    if (!loan.paid) {
      return sum + Number.parseFloat(loan.totalPayable)
    }
    return sum
  }, 0)

  document.getElementById("totalDebt").textContent = `Ksh${totalDebt.toFixed(2)}`

  // Display upcoming payments
  displayUpcomingPayments(user.loans)

  // Display all loans
  displayAllLoans(user.loans)
}

// Display Upcoming Payments
function displayUpcomingPayments(loans) {
  const container = document.getElementById("upcomingPayments")
  const unpaidLoans = loans.filter((l) => !l.paid)

  if (unpaidLoans.length === 0) {
    container.innerHTML = '<p class="empty-message">No upcoming payments</p>'
    return
  }

  // Sort by due date
  unpaidLoans.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  container.innerHTML = unpaidLoans
    .map(
      (loan) => `
        <div class="payment-item">
            <div class="payment-info">
                <h3>${loan.provider}</h3>
                <p class="payment-date">Due: ${formatDate(loan.dueDate)}</p>
                <p>Ksh${Number.parseFloat(loan.totalPayable).toFixed(2)}</p>
            </div>
            <button class="btn btn-primary btn-small" onclick="markAsPaid(${loan.id})">Mark Paid</button>
        </div>
    `,
    )
    .join("")

  // Show alerts for due dates
  const today = new Date()
  unpaidLoans.forEach((loan) => {
    const dueDate = new Date(loan.dueDate)
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))

    if (daysUntilDue <= 7 && daysUntilDue > 0) {
      setTimeout(() => {
        alert(`Payment due soon for ${loan.provider}: ${daysUntilDue} days remaining`)
      }, 500)
    }
  })
}

// Display All Loans
function displayAllLoans(loans) {
  const container = document.getElementById("allLoansGrid")

  if (loans.length === 0) {
    container.innerHTML = '<p class="empty-message">No loans added yet. Start by adding your first loan!</p>'
    return
  }

  container.innerHTML = loans
    .map(
      (loan) => `
        <div class="loan-card ${loan.paid ? "paid" : ""}">
            <div class="loan-provider">${loan.provider}</div>
            <div class="loan-detail">
                <span class="loan-detail-label">Principal:</span>
                <span class="loan-detail-value">Ksh${Number.parseFloat(loan.principal).toFixed(2)}</span>
            </div>
            <div class="loan-detail">
                <span class="loan-detail-label">Rate:</span>
                <span class="loan-detail-value">${loan.interestRate}%</span>
            </div>
            <div class="loan-detail">
                <span class="loan-detail-label">Total Payable:</span>
                <span class="loan-detail-value">Ksh${Number.parseFloat(loan.totalPayable).toFixed(2)}</span>
            </div>
            <div class="loan-interest">${loan.interestRate}% interest</div>
            <div class="loan-due">
                <div class="loan-due-date">Due Date:</div>
                <div class="loan-due-date-value">${formatDate(loan.dueDate)}</div>
            </div>
            <div class="loan-time-period">
                <div class="loan-time-period-label">Time Period:</div>
                <div class="loan-time-period-value">${loan.timePeriod}</div>
            </div>
            <div class="loan-actions">
                <button class="btn btn-secondary btn-small" onclick="removeLoan(${loan.id})">Remove</button>
            </div>
        </div>
    `,
    )
    .join("")
}

// Add Loan Modal
function openAddLoanModal() {
  document.getElementById("addLoanModal").classList.add("open")
}

function closeAddLoanModal() {
  document.getElementById("addLoanModal").classList.remove("open")
  document.getElementById("addLoanForm").reset()
}

// Handle Add Loan
function handleAddLoan(e) {
  e.preventDefault()

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (!currentUser) return

  const provider = document.getElementById("loanProvider").value
  const principal = Number.parseFloat(document.getElementById("loanPrincipal").value)
  const interestRate = Number.parseFloat(document.getElementById("loanRate").value)
  const timePeriodValue = document.getElementById("loanTimePeriodValue").value
  const timePeriodUnit = document.getElementById("loanTimePeriodUnit").value
  const dueDate = document.getElementById("loanDueDate").value

  // Validation
  if (!provider || !principal || !interestRate || !timePeriodValue || !timePeriodUnit || !dueDate) {
    alert("All fields are required")
    return
  }

  if (principal <= 0 || interestRate < 0 || timePeriodValue <= 0) {
    alert("Please enter valid amounts")
    return
  }

  let timeInYears = Number.parseFloat(timePeriodValue)
  if (timePeriodUnit === "months") {
    timeInYears = Number.parseFloat(timePeriodValue) / 12
  }

  // Calculate total payable using proper time conversion
  const interest = (principal * interestRate * timeInYears) / 100
  const totalPayable = principal + interest

  // Create loan object
  const newLoan = {
    id: Date.now(),
    provider,
    principal,
    interestRate,
    totalPayable,
    dueDate,
    timePeriod: `${timePeriodValue} ${timePeriodUnit}`,
    paid: false,
  }

  // Add to user's loans
  currentUser.loans = currentUser.loans || []
  currentUser.loans.push(newLoan)

  // Update localStorage
  const users = JSON.parse(localStorage.getItem("users"))
  const userIndex = users.findIndex((u) => u.id === currentUser.id)
  users[userIndex] = currentUser
  localStorage.setItem("users", JSON.stringify(users))
  localStorage.setItem("currentUser", JSON.stringify(currentUser))

  // Reset form and close modal
  closeAddLoanModal()
  updateDashboard(currentUser)
}

// Mark Payment as Paid
function markAsPaid(loanId) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const loan = currentUser.loans.find((l) => l.id === loanId)

  if (loan) {
    loan.paid = true

    const users = JSON.parse(localStorage.getItem("users"))
    const userIndex = users.findIndex((u) => u.id === currentUser.id)
    users[userIndex] = currentUser
    localStorage.setItem("users", JSON.stringify(users))
    localStorage.setItem("currentUser", JSON.stringify(currentUser))

    updateDashboard(currentUser)
  }
}

// Remove Loan
function removeLoan(loanId) {
  if (confirm("Are you sure you want to remove this loan?")) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    currentUser.loans = currentUser.loans.filter((l) => l.id !== loanId)

    const users = JSON.parse(localStorage.getItem("users"))
    const userIndex = users.findIndex((u) => u.id === currentUser.id)
    users[userIndex] = currentUser
    localStorage.setItem("users", JSON.stringify(users))
    localStorage.setItem("currentUser", JSON.stringify(currentUser))

    updateDashboard(currentUser)
  }
}

// Calculate Interest
function calculateInterest() {
  const principal = Number.parseFloat(document.getElementById("calcPrincipal").value)
  const rate = Number.parseFloat(document.getElementById("calcRate").value)
  const years = Number.parseFloat(document.getElementById("calcYears").value)

  if (!principal || !rate || !years) {
    document.getElementById("calcResult").textContent = "Enter all values"
    return
  }

  const interest = (principal * rate * years) / 100
  const total = principal + interest

  document.getElementById("calcResult").textContent = `Interest: Ksh${interest.toFixed(2)} | Total: Ksh${total.toFixed(2)}`
}

// Format Date
function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" }
  return new Date(dateString).toLocaleDateString("en-IN", options)
}

// Show Message
function showMessage(element, message, type) {
  element.textContent = message
  element.className = `auth-message ${type}`
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", initializeStorage)