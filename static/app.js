/* ========================================================================
   NEWS RESEARCH AGENT — Application Logic
   ======================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ===================== INIT =====================
    initNeuralCanvas();
    initParticles();
    initTaglineTyping();
    initDateDefault();
    initLanguageToggle();
    initFormSubmit();
    initRetryButton();
    initNewSearchButton();
});

// ===================== NEURAL CANVAS (Background Animation) =====================
function initNeuralCanvas() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height, nodes, mouse;
    const NODE_COUNT = 70;
    const MAX_DIST = 150;

    mouse = { x: -1000, y: -1000 };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createNodes() {
        nodes = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 2 + 1,
                color: Math.random() > 0.5 ? '#00f5ff' : '#a855f7',
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Draw connections
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MAX_DIST) {
                    const opacity = (1 - dist / MAX_DIST) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `rgba(0, 245, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }

            // Mouse interaction
            const mdx = nodes[i].x - mouse.x;
            const mdy = nodes[i].y - mouse.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < 200) {
                const opacity = (1 - mdist / 200) * 0.3;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }

        // Draw nodes
        for (const node of nodes) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
            ctx.fillStyle = node.color;
            ctx.globalAlpha = 0.6;
            ctx.fill();
            ctx.globalAlpha = 1;

            // Move
            node.x += node.vx;
            node.y += node.vy;

            // Bounce
            if (node.x < 0 || node.x > width) node.vx *= -1;
            if (node.y < 0 || node.y > height) node.vy *= -1;
        }

        requestAnimationFrame(draw);
    }

    resize();
    createNodes();
    draw();

    window.addEventListener('resize', () => {
        resize();
        createNodes();
    });

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
}

// ===================== FLOATING PARTICLES =====================
function initParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;

    const colors = ['#00f5ff', '#a855f7', '#ec4899', '#10b981'];

    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 4 + 1;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * 15 + 10;
        const delay = Math.random() * 10;
        const left = Math.random() * 100;

        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${left}%;
            box-shadow: 0 0 ${size * 3}px ${color};
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;

        container.appendChild(particle);

        // Remove after animation
        setTimeout(() => {
            particle.remove();
            createParticle();
        }, (duration + delay) * 1000);
    }

    // Initial particles
    for (let i = 0; i < 25; i++) {
        createParticle();
    }
}

// ===================== TAGLINE TYPING ANIMATION =====================
function initTaglineTyping() {
    const el = document.getElementById('tagline-text');
    if (!el) return;

    const phrases = [
        'AI-Powered News Intelligence',
        'Đọc tin thông minh cùng Gemini',
        'Grounded in Real Sources',
        'Tìm kiếm tin tức mọi lúc, mọi nơi',
    ];

    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeout;

    function type() {
        const current = phrases[phraseIdx];

        if (!isDeleting) {
            el.textContent = current.substring(0, charIdx + 1);
            charIdx++;
            if (charIdx === current.length) {
                isDeleting = true;
                timeout = setTimeout(type, 2500);
                return;
            }
            timeout = setTimeout(type, 60);
        } else {
            el.textContent = current.substring(0, charIdx - 1);
            charIdx--;
            if (charIdx === 0) {
                isDeleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                timeout = setTimeout(type, 400);
                return;
            }
            timeout = setTimeout(type, 30);
        }
    }

    type();
}

// ===================== DEFAULT DATE =====================
function initDateDefault() {
    const dateInput = document.getElementById('input-date');
    if (!dateInput) return;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
}

// ===================== LANGUAGE TOGGLE =====================
function initLanguageToggle() {
    const toggle = document.getElementById('language-toggle');
    if (!toggle) return;

    const buttons = toggle.querySelectorAll('.lang-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            toggle.setAttribute('data-active', btn.dataset.lang);
        });
    });
}

function getSelectedLanguage() {
    const active = document.querySelector('.lang-btn.active');
    return active ? active.dataset.lang : 'vi';
}

// ===================== FORM SUBMISSION =====================
function initFormSubmit() {
    const form = document.getElementById('search-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const date = document.getElementById('input-date').value;
        const topic = document.getElementById('input-topic').value.trim();
        const language = getSelectedLanguage();

        if (!date) return;

        await fetchNews(date, topic, language);
    });
}

async function fetchNews(date, topic, language) {
    showLoading();

    const loadingSteps = [
        { text: 'Đang kết nối với Gemini AI...', pct: 15 },
        { text: 'Đang tìm kiếm tin tức qua Google...', pct: 35 },
        { text: 'Đang phân tích và sắp xếp kết quả...', pct: 60 },
        { text: 'Đang xác minh nguồn tin...', pct: 80 },
        { text: 'Đang hoàn thiện báo cáo...', pct: 95 },
    ];

    let stepIdx = 0;
    const stepInterval = setInterval(() => {
        if (stepIdx < loadingSteps.length) {
            const step = loadingSteps[stepIdx];
            document.getElementById('loading-step').textContent = step.text;
            document.getElementById('loading-bar-fill').style.width = step.pct + '%';
            stepIdx++;
        }
    }, 2200);

    try {
        const response = await fetch('/api/news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, topic, language }),
        });

        clearInterval(stepInterval);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.details || 'Lỗi không xác định');
        }

        showResults(data);

    } catch (err) {
        clearInterval(stepInterval);
        showError(err.message);
    }
}

// ===================== UI STATE MANAGEMENT =====================
function showLoading() {
    document.getElementById('search-panel').style.display = 'none';
    document.getElementById('loading-section').style.display = '';
    document.getElementById('error-section').style.display = 'none';
    document.getElementById('results-section').style.display = 'none';

    // Reset loading bar
    document.getElementById('loading-bar-fill').style.width = '5%';
    document.getElementById('loading-step').textContent = 'Đang khởi tạo...';
}

function showError(message) {
    document.getElementById('search-panel').style.display = 'none';
    document.getElementById('loading-section').style.display = 'none';
    document.getElementById('error-section').style.display = '';
    document.getElementById('results-section').style.display = 'none';

    document.getElementById('error-message').textContent = message;
}

function showResults(data) {
    document.getElementById('search-panel').style.display = 'none';
    document.getElementById('loading-section').style.display = 'none';
    document.getElementById('error-section').style.display = 'none';
    document.getElementById('results-section').style.display = '';

    renderResults(data);
}

function showSearch() {
    document.getElementById('search-panel').style.display = '';
    document.getElementById('loading-section').style.display = 'none';
    document.getElementById('error-section').style.display = 'none';
    document.getElementById('results-section').style.display = 'none';

    // Re-animate search panel
    const panel = document.getElementById('search-panel');
    panel.style.animation = 'none';
    panel.offsetHeight; // trigger reflow
    panel.style.animation = 'fadeInUp 0.6s ease-out';
}

// ===================== RENDER RESULTS =====================
function renderResults(data) {
    // Meta chips
    const metaDate = document.querySelector('#meta-date span');
    const metaTopic = document.querySelector('#meta-topic span');
    const metaModel = document.querySelector('#meta-model span');

    metaDate.textContent = data.requested_date || '';
    metaTopic.textContent = data.topic || 'Tổng hợp';
    metaModel.textContent = data.model || 'Gemini';

    // Hide topic chip if empty
    document.getElementById('meta-topic').style.display = data.topic ? '' : 'none';

    // Summary
    document.getElementById('summary-text').textContent = data.summary || '';

    // Date note
    const dateNote = document.getElementById('date-note');
    if (data.effective_date_note) {
        dateNote.textContent = '⚠ ' + data.effective_date_note;
        dateNote.style.display = '';
    } else {
        dateNote.style.display = 'none';
    }

    // News cards
    const grid = document.getElementById('news-grid');
    grid.innerHTML = '';

    if (data.news && data.news.length > 0) {
        data.news.forEach((item, idx) => {
            const card = createNewsCard(item, idx + 1);
            grid.appendChild(card);
        });
    }

    // Grounding sources
    const sourcesSection = document.getElementById('sources-section');
    const sourcesList = document.getElementById('sources-list');

    if (data.grounding_sources && data.grounding_sources.length > 0) {
        sourcesSection.style.display = '';
        sourcesList.innerHTML = '';
        data.grounding_sources.forEach(src => {
            const chip = document.createElement('a');
            chip.className = 'source-chip';
            chip.href = src.uri;
            chip.target = '_blank';
            chip.rel = 'noopener noreferrer';
            chip.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                <span>${escapeHtml(src.title || src.uri)}</span>
            `;
            sourcesList.appendChild(chip);
        });
    } else {
        sourcesSection.style.display = 'none';
    }

    // Follow-up suggestions
    const suggestionsSection = document.getElementById('suggestions-section');
    const suggestionsList = document.getElementById('suggestions-list');

    if (data.follow_up_suggestions && data.follow_up_suggestions.length > 0) {
        suggestionsSection.style.display = '';
        suggestionsList.innerHTML = '';
        data.follow_up_suggestions.forEach(suggestion => {
            const chip = document.createElement('button');
            chip.className = 'suggestion-chip';
            chip.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                </svg>
                ${escapeHtml(suggestion)}
            `;
            chip.addEventListener('click', () => {
                document.getElementById('input-topic').value = suggestion;
                showSearch();
                // Auto submit after a brief delay
                setTimeout(() => {
                    document.getElementById('search-form').dispatchEvent(new Event('submit'));
                }, 300);
            });
            suggestionsList.appendChild(chip);
        });
    } else {
        suggestionsSection.style.display = 'none';
    }
}

function createNewsCard(item, index) {
    const card = document.createElement('article');
    card.className = 'news-card';
    card.innerHTML = `
        <div class="news-card-header">
            <div class="news-number">${index}</div>
            <h3 class="news-title">${escapeHtml(item.title || '')}</h3>
        </div>
        <div class="news-meta">
            ${item.source ? `<span class="news-meta-item source">📰 ${escapeHtml(item.source)}</span>` : ''}
            ${item.published_date ? `<span class="news-meta-item date">📅 ${escapeHtml(item.published_date)}</span>` : ''}
        </div>
        <p class="news-summary">${escapeHtml(item.summary || '')}</p>
        ${item.why_relevant ? `
        <div class="news-relevance">
            <span class="relevance-tag">RELEVANT</span>
            <span class="relevance-text">${escapeHtml(item.why_relevant)}</span>
        </div>
        ` : ''}
    `;
    return card;
}

// ===================== BUTTONS =====================
function initRetryButton() {
    const btn = document.getElementById('retry-btn');
    if (!btn) return;
    btn.addEventListener('click', showSearch);
}

function initNewSearchButton() {
    const btn = document.getElementById('new-search-btn');
    if (!btn) return;
    btn.addEventListener('click', showSearch);
}

// ===================== UTILS =====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
