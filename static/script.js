document.addEventListener('DOMContentLoaded', () => {
    // DOM references
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const messagesContainer = document.getElementById('messages');
    const learnMoreBtn = document.getElementById('learn-more-btn');
    const modal = document.getElementById('learn-more-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const tabBtns = document.querySelectorAll('.tab-btn');

    // === Chat UI: Minimized by default ===
    const chatBody = document.querySelector('.chat-body');
    const minimizeBtn = document.querySelector('.minimize-chat');
    let chatMinimized = true;

    if (chatBody && minimizeBtn) {
        chatBody.style.display = 'none';
        minimizeBtn.innerHTML = '<i class="fas fa-plus"></i>';
        minimizeBtn.addEventListener('click', () => {
            chatMinimized = !chatMinimized;
            chatBody.style.display = chatMinimized ? 'none' : 'flex';
            minimizeBtn.innerHTML = chatMinimized ? '<i class="fas fa-plus"></i>' : '<i class="fas fa-minus"></i>';
        });
    }

    // === Financial Advice Bot Responses ===
    const responses = {
        'investment': 'Based on current market trends, I recommend diversifying your portfolio with a mix of stocks, bonds, and ETFs.',
        'budget': 'Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings.',
        'savings': 'Automate your savings, reduce discretionary spending, and increase income streams.',
        'stock market': 'The stock market is volatile; diversify and research before investing.',
        'cryptocurrency': 'Cryptocurrency is volatile and speculative—invest wisely.'
    };

    const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good evening'];

    function addMessage(text, isBot = false) {
        if (!messagesContainer) return;
        const msg = document.createElement('div');
        msg.classList.add('message', isBot ? 'bot' : 'user');
        msg.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;
        messagesContainer.appendChild(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function generateResponse(input) {
        const lower = input.toLowerCase();
        if (greetings.some(greet => lower.includes(greet))) {
            return "Hello! I'm your financial assistant. How can I help you today?";
        }
        for (const [keyword, reply] of Object.entries(responses)) {
            if (lower.includes(keyword)) return reply;
        }
        return "I'm sorry, I don't have specific info on that. Try asking about investments, budget, or savings.";
    }

    function handleSearch() {
        const query = searchInput.value.trim();
        if (!query) return;
        addMessage(query, false);
        searchInput.value = '';
        setTimeout(() => {
            const reply = generateResponse(query);
            addMessage(reply, true);
        }, 1000);
    }

    if (searchButton) searchButton.addEventListener('click', handleSearch);
    if (searchInput) {
        searchInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') handleSearch();
        });
    }

    // === Modal: Learn More ===
    function openLearnModal() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeLearnModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    window.onclick = function (e) {
        if (e.target === modal) closeLearnModal();
    };

    if (learnMoreBtn) learnMoreBtn.addEventListener('click', openLearnModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeLearnModal);

    // === Tabs ===
    function switchTab(tabId) {
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        tabBtns.forEach(b => b.classList.remove('active'));
        document.getElementById(`${tabId}-tab`)?.classList.add('active');
        document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.getAttribute('data-tab'));
        });
    });

    // === Edit Budget Modal ===
    function openModal() {
        const modal = document.getElementById('budgetModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        const modal = document.getElementById('budgetModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    window.openModal = openModal;
    window.closeModal = closeModal;

    function calculateBudget() {
        const modalRows = document.querySelectorAll('#editable-expenses tr');
        const tableRows = document.querySelectorAll('.expense-table tbody tr');

        let totalExpenses = 0;
        const income = 58000;

        modalRows.forEach((row, index) => {
            const [amountInput, budgetInput] = row.querySelectorAll('input');
            const amount = parseFloat(amountInput.value) || 0;
            const budget = parseFloat(budgetInput.value) || 0;
            totalExpenses += amount;

            const tableCells = tableRows[index].querySelectorAll('td');
            tableCells[1].textContent = `₹${amount.toLocaleString()}`;
            tableCells[2].textContent = `₹${budget.toLocaleString()}`;

            const progress = tableCells[3].querySelector('.progress');
            const percent = Math.round((amount / budget) * 100);
            progress.style.width = `${Math.min(percent, 100)}%`;
            progress.classList.toggle('over', percent > 100);

            const trendSpan = tableCells[4].querySelector('.trend');
            const icon = trendSpan.querySelector('i');

            if (percent > 105) {
                trendSpan.className = 'trend negative';
                icon.className = 'fas fa-arrow-up';
            } else if (percent < 95) {
                trendSpan.className = 'trend positive';
                icon.className = 'fas fa-arrow-down';
            } else {
                trendSpan.className = 'trend neutral';
                icon.className = 'fas fa-minus';
            }
        });

        const savings = income - totalExpenses;
        const rate = ((savings / income) * 100).toFixed(1);

        document.getElementById('totalExpenses').textContent = `₹${totalExpenses.toLocaleString()}`;
        document.getElementById('totalSavings').textContent = `₹${savings.toLocaleString()}`;
        document.getElementById('savingsRate').textContent = `${rate}%`;

        closeModal();
    }

    document.querySelector('#budgetModal .action-button')?.addEventListener('click', calculateBudget);

    // === Dust Animation ===
    function createDustParticles() {
        const container = document.getElementById('dust-container');
        if (!container) return;

        for (let i = 0; i < 50; i++) {
            const p = document.createElement('div');
            p.classList.add('dust-particle');
            const size = Math.random() * 3 + 1;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.left = `${Math.random() * 100}%`;
            p.style.top = `${Math.random() * 100}%`;
            p.style.opacity = Math.random() * 0.5 + 0.3;
            p.style.animation = `float ${Math.random() * 10 + 10}s linear infinite`;
            p.style.animationDelay = `${Math.random() * 10}s`;
            container.appendChild(p);
        }
    }

    createDustParticles();

    const style = document.createElement('style');
    style.innerHTML = `
    @keyframes float {
        0% { transform: translateY(0) translateX(0); }
        50% { transform: translateY(-100px) translateX(20px); }
        100% { transform: translateY(-200px) translateX(0); opacity: 0; }
    }`;
    document.head.appendChild(style);
});
