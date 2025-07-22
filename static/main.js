document.addEventListener('DOMContentLoaded', function () {
    // Chat functionality
    const chatInput = document.querySelector('.chat-input input');
    const chatSendButton = document.querySelector('.chat-input button');
    const chatMessages = document.querySelector('.chat-messages');
    const minimizeChatButton = document.querySelector('.minimize-chat');
    const chatBody = document.querySelector('.chat-body');

    // Sidebar toggle for mobile
    const sidebarToggle = document.createElement('button');
    sidebarToggle.classList.add('sidebar-toggle');
    sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.prepend(sidebarToggle);

    const sidebar = document.querySelector('.sidebar');

    // ✅ Chat Functionality: Start with chat minimized
    let chatMinimized = true;
    if (chatBody) chatBody.style.display = 'none';
    if (minimizeChatButton) minimizeChatButton.innerHTML = '<i class="fas fa-plus"></i>';

    if (minimizeChatButton) {
        minimizeChatButton.addEventListener('click', () => {
            chatMinimized = !chatMinimized;
            if (chatBody) chatBody.style.display = chatMinimized ? 'none' : 'flex';
            minimizeChatButton.innerHTML = chatMinimized
                ? '<i class="fas fa-plus"></i>'
                : '<i class="fas fa-minus"></i>';
        });
    }

    // Gemini Chat API Integration
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (message.length === 0) return;

        addMessage(message, 'user');
        chatInput.value = '';

        const loadingMsg = addMessage('Thinking...', 'bot');

        try {
            const res = await fetch('/api/gemini-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            const data = await res.json();

            if (loadingMsg && loadingMsg.parentNode)
                loadingMsg.parentNode.removeChild(loadingMsg);

            if (data.reply) {
                if (typeof data.reply === 'object') {
                    let html = '';
                    if (data.reply.advice?.length) {
                        html += '<div><strong>Advice:</strong><ul>' + data.reply.advice.map(a => `<li>${a}</li>`).join('') + '</ul></div>';
                    }
                    if (data.reply.recommendations?.length) {
                        html += '<div><strong>Recommendations:</strong><ul>' + data.reply.recommendations.map(r => `<li>${r}</li>`).join('') + '</ul></div>';
                    }
                    if (data.reply.summary) {
                        html += `<div><strong>Summary:</strong> ${data.reply.summary}</div>`;
                    }
                    addMessage(html, 'bot', true);
                } else {
                    addMessage(data.reply, 'bot');
                }
            } else {
                addMessage('Sorry, no response from Gemini.', 'bot');
            }
        } catch (err) {
            if (loadingMsg && loadingMsg.parentNode)
                loadingMsg.parentNode.removeChild(loadingMsg);
            addMessage('Error contacting Gemini API.', 'bot');
        }
    }

    function addMessage(text, sender, isHtml = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');

        const messagePara = document.createElement('p');
        if (isHtml) {
            messagePara.innerHTML = text;
        } else {
            messagePara.textContent = text;
        }

        messageContent.appendChild(messagePara);
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);

        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }

    chatSendButton?.addEventListener('click', sendMessage);
    chatInput?.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    sidebarToggle.addEventListener('click', function () {
        sidebar?.classList.toggle('active');
    });

    // Modal: Budget
    function openModal() {
        const modal = document.getElementById('budgetModal');
        if (modal) modal.style.display = 'block';
    }
    window.openModal = openModal;

    function closeModal() {
        const modal = document.getElementById('budgetModal');
        if (modal) modal.style.display = 'none';
    }
    window.closeModal = closeModal;

    function calculateBudget() {
        const rows = document.querySelectorAll('#editable-expenses tr');
        let totalExpenses = 0;

        const mainTableRows = document.querySelectorAll('.expense-table tbody tr');

        rows.forEach((row, index) => {
            const inputs = row.querySelectorAll('input');
            const amount = parseFloat(inputs[0].value) || 0;
            const budget = parseFloat(inputs[1].value) || 0;

            totalExpenses += amount;

            const mainRow = mainTableRows[index];
            const cells = mainRow.querySelectorAll('td');

            cells[1].textContent = `₹${amount.toLocaleString()}`;
            cells[2].textContent = `₹${budget.toLocaleString()}`;

            const progressDiv = cells[3].querySelector('.progress');
            const percent = Math.round((amount / budget) * 100);
            progressDiv.style.width = `${percent}%`;

            progressDiv.classList.remove('over');
            if (percent > 100) {
                progressDiv.classList.add('over');
            }

            const trendSpan = cells[4].querySelector('.trend');
            const trendIcon = trendSpan.querySelector('i');

            if (percent > 105) {
                trendSpan.className = 'trend negative';
                trendIcon.className = 'fas fa-arrow-up';
            } else if (percent < 95) {
                trendSpan.className = 'trend positive';
                trendIcon.className = 'fas fa-arrow-down';
            } else {
                trendSpan.className = 'trend neutral';
                trendIcon.className = 'fas fa-minus';
            }
        });

        const income = 58000;
        const savings = income - totalExpenses;
        const savingsRate = ((savings / income) * 100).toFixed(1);

        document.getElementById('totalExpenses').textContent = `₹${totalExpenses.toLocaleString()}`;
        document.getElementById('totalSavings').textContent = `₹${savings.toLocaleString()}`;
        document.getElementById('savingsRate').textContent = `${savingsRate}%`;

        closeModal();
    }
    window.calculateBudget = calculateBudget;

    const saveButton = document.querySelector('#budgetModal .action-button');
    if (saveButton) {
        saveButton.addEventListener('click', calculateBudget);
    }

    // Savings Goals
    const addGoalButton = document.getElementById('addGoalButton');
    const goalsContainer = document.querySelector('.savings-goals');

    function createGoalCard() {
        const userInputTarget = document.getElementById('userTargetGoal');
        let target = 10000;
        if (userInputTarget) {
            const parsedTarget = parseInt(userInputTarget.value);
            if (!isNaN(parsedTarget) && parsedTarget > 0) {
                target = parsedTarget;
            }
        }

        const saved = 0;
        const title = 'New Goal';
        const date = 'December 2025';
        const monthly = 100;
        const percentage = Math.floor((saved / target) * 100);

        const card = document.createElement('div');
        card.classList.add('goal-card');
        card.innerHTML = `
            <div class="goal-header">
                <h3 contenteditable="true">${title}</h3>
                <span class="goal-status">In Progress</span>
            </div>
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress" style="width: ${percentage}%"></div>
                </div>
                <div class="goal-amounts">
                    <span contenteditable="true">₹${saved.toLocaleString()} / ₹${target.toLocaleString()}</span>
                    <span>${percentage}%</span>
                </div>
            </div>
            <div class="goal-details">
                <p><i class="fas fa-calendar"></i> <span contenteditable="true">Target Date: ${date}</span></p>
                <p><i class="fas fa-money-bill"></i> <span contenteditable="true">Monthly Contribution: ₹${monthly}</span></p>
            </div>
        `;
        goalsContainer.appendChild(card);
        makeCardEditable(card);
    }

    function makeCardEditable(card) {
        const editables = card.querySelectorAll('[contenteditable="true"]');
        editables.forEach(elem => {
            elem.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.blur();
                }
            });
            elem.addEventListener('blur', () => {
                updateCardProgress(card);
            });
        });
    }

    function updateCardProgress(card) {
        const amountSpan = card.querySelector('.goal-amounts span[contenteditable]');
        const progressBar = card.querySelector('.progress-bar .progress');
        const percentDisplay = card.querySelector('.goal-amounts span:last-child');

        const values = amountSpan.textContent.replace(/[^0-9\/]/g, '').split('/');
        const saved = parseInt(values[0].replace(/,/g, '')) || 0;
        const target = parseInt(values[1].replace(/,/g, '')) || 1;

        const percent = Math.min(Math.round((saved / target) * 100), 100);

        progressBar.style.width = `${percent}%`;
        percentDisplay.textContent = `${percent}%`;
    }

    if (addGoalButton && goalsContainer) {
        addGoalButton.addEventListener('click', () => {
            createGoalCard();
        });
        document.querySelectorAll('.goal-card').forEach(makeCardEditable);
    }
    // Budget Pie Chart (Monthly Overview)
const budgetCtx = document.getElementById('budget-chart')?.getContext('2d');
if (budgetCtx) {
    new Chart(budgetCtx, {
        type: 'pie',
        data: {
            labels: ['Expenses', 'Savings'],
            datasets: [{
                data: [39500, 18500], // Replace with real values dynamically if needed
                backgroundColor: ['#ff6b6b', '#1dd1a1']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Expense Breakdown Pie Chart
const expenseCtx = document.getElementById('expense-breakdown-chart')?.getContext('2d');
if (expenseCtx) {
    new Chart(expenseCtx, {
        type: 'pie',
        data: {
            labels: [
                'Rent',
                'Groceries',
                'Transport',
                'Electricity & Gas',
                'Entertainment',
                'Online Shopping',
                'Medical',
                'Education/Classes'
            ],
            datasets: [{
                data: [19000, 6500, 3000, 2800, 2000, 3000, 1200, 2000], // Update these dynamically if needed
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#C9CBCF',
                    '#F67280'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Expense Distribution'
                }
            }
        }
    });
}



    // ✅ Savings Trends Chart
    const ctx = document.getElementById('savings-chart')?.getContext('2d');
    if (ctx) {
        const trendLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const trendData = [5000, 8000, 7500, 6000, 8500, 9000];

        let savingsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendLabels,
                datasets: [{
                    label: 'Savings Over Time',
                    data: trendData,
                    fill: false,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.3,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });

        document.querySelector('.time-range')?.addEventListener('change', function () {
            const selected = this.value;

            if (selected === 'Last Year') {
                savingsChart.data.labels = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'];
                savingsChart.data.datasets[0].data = [4000, 5000, 6000, 7000, 8000, 9000];
            } else if (selected === 'Last 2 Years') {
                savingsChart.data.labels = ['2023', '2024'];
                savingsChart.data.datasets[0].data = [55000, 72000];
            } else {
                savingsChart.data.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                savingsChart.data.datasets[0].data = [5000, 8000, 7500, 6000, 8500, 9000];
            }

            savingsChart.update();
        });
    }
});
