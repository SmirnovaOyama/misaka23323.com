import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import styles from './styles.css';

marked.use(markedKatex({
    throwOnError: false,
    nonStandard: true,
    strict: false,
    trust: true,
    macros: {
        "\\label": "\\href{#1}{}",
        "\\eqref": "\\href{#1}{}",
        "\\require": "\\href{#1}{}",
    }
}));

const calloutExtension = {
    name: 'callout',
    level: 'block' as const,
    start(src: string) { return src.match(/^:{3}/)?.index; },
    tokenizer(this: any, src: string, tokens: any) {
        const rule = /^:{3}(info|success|warning|error)(?:\[(.*?)\])?(?:\{(.*?)\})?\n([\s\S]*?)\n:{3}(?:\n|$)/;
        const match = rule.exec(src);
        if (match) {
            const token = {
                type: 'callout',
                raw: match[0],
                kind: match[1],
                title: match[2],
                attrs: match[3],
                text: match[4].trim(),
                tokens: []
            };
            this.lexer.blockTokens(token.text, token.tokens);
            return token;
        }
    },
    renderer(this: any, token: any) {
        const isOpen = token.attrs && token.attrs.includes('open');
        const title = token.title || token.kind.toUpperCase();
        const kind = token.kind;
        const body = this.parser.parse(token.tokens);
        return `<div class="callout callout-${kind}">
            <details ${isOpen ? 'open' : ''}>
                <summary>${title}</summary>
                <div class="callout-body">${body}</div>
            </details>
        </div>`;
    }
};

marked.use({ extensions: [calloutExtension] });

const renderer = {
  heading(text: string, level: number) {
    const slug = text.toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `<h${level} id="${slug}">${text}</h${level}>`;
  }
};

marked.use({ renderer });

function escapeHtml(value: string) {
    return (value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const GITHUB_OWNER = 'SmirnovaOyama';
const GITHUB_REPO = 'misaka23323.com';
const GITHUB_BRANCH = 'main';
const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/src`;

async function fetchArticlesList() {
    const response = await fetch(`${BASE_URL}/articles.json`);
    if (!response.ok) return [];
    const raw = await response.json() as any[];
    // Normalize file paths in case entries point to unexpected locations
    return raw.map(entry => {
        const e = { ...entry } as any;
        if (e.file && typeof e.file === 'string') {
            let p = e.file.replace(/^\.\//, ''); // remove leading ./
            p = p.replace(/^src\//, ''); // remove leading src/
            p = p.replace(/^\/+/, ''); // remove leading /
            if (!p.startsWith('articles/')) {
                p = `articles/${p}`;
            }
            e.file = p;
        }
        return e;
    });
}

async function fetchArticleContent(filename: string) {
    // Normalize various possible file path forms to point under `src/articles/`
    let cleanPath = filename.replace(/^\.\//, ''); // remove leading ./
    cleanPath = cleanPath.replace(/^src\//, ''); // remove leading src/
    cleanPath = cleanPath.replace(/^\/+/, ''); // remove leading /
    if (!cleanPath.startsWith('articles/')) {
        cleanPath = `articles/${cleanPath}`;
    }
    const response = await fetch(`${BASE_URL}/${cleanPath}`);
    if (!response.ok) return '';
    return await response.text();
}

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
  ASSETS: Fetcher;
    TELEGRAM_CHANNEL?: string;
}

// CSS moved to styles.css

const navBar = `
<div class="progress-container">
    <div class="progress-bar" id="progressBar"></div>
</div>
<div class="overlay"></div>
<div class="modal-overlay" id="externalLinkModal">
    <div class="modal-content">
        <div class="modal-title">Leaving Site</div>
        <p class="modal-text">You are about to visit an external website. Continue?</p>
        <div class="modal-buttons">
            <button class="modal-btn modal-btn-cancel" id="modalCancelBtn">Cancel</button>
            <button class="modal-btn modal-btn-confirm" id="modalConfirmBtn">Continue</button>
        </div>
    </div>
</div>
<nav class="navbar">
    <a href="/" class="logo">Mahiro Oyama</a>
    <div class="menu-toggle">☰</div>
    <ul class="nav-links">
        <li class="nav-item"><a href="/">Home</a></li>
        <li class="nav-item"><a href="/articles">Articles</a></li>
        <li class="nav-item" id="navRefreshItem" style="display:none"><a href="#" id="navRefreshBtn">Refresh Article</a></li>
        <li class="nav-item"><a href="/projects">Projects</a></li>
        <li class="nav-item"><a href="/articles/about-me">About</a></li>
        <li class="nav-item"><a href="/articles/privacy-policy">Privacy Policy</a></li>
    </ul>
</nav>
`;

const scripts = `
<script>
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.overlay');
    const closeBtn = document.querySelector('.mobile-close-btn');
    
    function toggleMenu() {
        navLinks.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    }

    menuToggle.addEventListener('click', toggleMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
             // Don't close menu if clicking a dropdown toggle
             if (link.parentElement.classList.contains('dropdown')) {
                 e.preventDefault();
                 return;
             }
             if (navLinks.classList.contains('active')) toggleMenu();
        });
    });

    // Mobile Dropdown Toggle
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.stopPropagation(); // Prevent bubbling to navLinks click
                dropdown.classList.toggle('active');
            }
        });
    });

    // Progress Bar
    window.onscroll = function() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const progressBar = document.getElementById("progressBar");
        if (progressBar) {
            progressBar.style.width = scrolled + "%";
        }
    };

    // External Link Modal
    const modal = document.getElementById('externalLinkModal');
    const cancelBtn = document.getElementById('modalCancelBtn');
    const confirmBtn = document.getElementById('modalConfirmBtn');
    let targetUrl = '';

    function showModal(url) {
        targetUrl = url;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        targetUrl = '';
    }

    if (cancelBtn) cancelBtn.addEventListener('click', hideModal);
    
    if (confirmBtn) confirmBtn.addEventListener('click', () => {
        if (targetUrl) {
            window.open(targetUrl, '_blank');
            hideModal();
        }
    });

    if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            const href = link.href;
            if (href && href.startsWith('http') && new URL(href).hostname !== window.location.hostname) {
                e.preventDefault();
                showModal(href);
            }
        }
    });
</script>
`;

async function injectLayout(response: Response) {
    const contentType = response.headers.get('content-type');
    if (response.ok && contentType && contentType.includes('text/html')) {
        let text = await response.text();
        // Inject styles and spacer
        text = text.replace('</head>', '<link rel="stylesheet" href="/styles.css">\n<style>body { padding-top: var(--nav-height); }</style>\n</head>');
        // Inject navbar
        text = text.replace('<body>', '<body>\n' + navBar);
        // Inject scripts
        text = text.replace('</body>', scripts + '\n</body>');
        
        return new Response(text, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
    }
    return response;
}

function render(title: string, content: string, metaTags: string = '') {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    ${metaTags}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.css" crossorigin="anonymous">
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    ${navBar}
    <main class="container">
        ${content}
    </main>
    ${scripts}
</body>
</html>
`;
}

function renderHomePage() {
    const content = `
<div class="hero">
    <div class="hero-content">
        <h1>Hello, I'm<br>Mahiro Oyama</h1>
        <p>An undergraduate student from China.</p>
    </div>
    
    <div class="hero-links">
        <a href="/articles" class="link-card">
            <h3>Articles <span>→</span></h3>
            <p>Wrote some interesting stuffs ( ´▽｀)</p>
        </a>
        
        <a href="/projects" class="link-card">
            <h3>Projects <span>→</span></h3>
            <p>Check out what I've been working on.</p>
        </a>
    </div>
</div>
<div class="article-card" style="margin-top: 1rem; text-align: center;">
    <a href="https://icp.gov.moe/?keyword=20255514" target="_blank">萌ICP备20255514号</a>
</div>
`;
    return render("Mahiro Oyama", content);
}

function renderProjectsPage() {
    const content = `
<style>.container { padding-top: calc(var(--nav-height) + 0.75rem) !important; }</style>
<div class="article-list">
    <div style="display: flex; align-items: baseline; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.25rem;">
        <h1 style="margin: 0;">Projects</h1>

    </div>
    <div class="projects-grid">
        <a href="https://hrt.misaka23323.com" target="_blank" class="project-card">
            <div class="project-preview" style="background-color: #ff6b81;">
                <svg width="80" height="80" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path style="fill:#AFAFAF;" d="M64.2,3.67c4.09,0,13.2,8.02,13.2,8.02S93.43,10.12,96.42,12c2.99,1.89,5.82,16.03,5.82,16.03
                        s11.48,2.04,13.52,5.03c2.04,2.99,0.79,16.98,0.79,16.98s7.86,8.8,7.55,13.2s-8.02,13.36-8.02,13.36s2.67,14.31,0.94,17.45
                        c-1.73,3.14-14.46,8.8-14.46,8.8s-4.72,12.1-6.92,13.52c-2.2,1.41-18.39-0.31-18.39-0.31s-9.75,8.49-12.42,8.65
                        c-2.67,0.16-13.2-8.8-13.2-8.8s-16.03,2.2-18.39,0.79c-2.66-1.59-6.6-12.89-6.6-12.89s-12.69-3.26-14.78-6.6
                        c-1.57-2.52-1.1-17.29-1.1-17.29S3.72,69.22,3.52,64.82c-0.16-3.46,8.33-13.36,8.33-13.36s-1.26-15.56,0.47-18.55
                        s11.79-3.93,11.79-3.93s4.56-14.62,7.7-16.51s18.55,0.63,18.55,0.63S60.42,3.67,64.2,3.67z"/>
                    <path style="fill:#E2E2E2;" d="M64.04,7.29c-1.88-0.17-11.95,9.59-11.95,9.59s-15.41-1.57-17.13-0.79
                        c-1.73,0.79-6.6,15.41-6.6,15.41s-11.48,1.57-13.05,3.77s0.79,17.13,0.79,17.13S7.6,62.78,7.6,64.51c0,1.73,7.86,13.52,7.86,13.52
                        s-1.41,11.79-0.47,13.36c0.94,1.57,13.68,5.97,13.68,5.97s4.09,12.89,6.29,13.68c2.2,0.79,17.61-1.41,17.61-1.41
                        s9.9,7.55,11.63,7.55c1.73,0,11.16-8.02,11.16-8.02s16.66,1.89,18.24,1.26s8.02-13.99,8.02-13.99s11.79-3.93,12.42-5.82
                        s-2.36-16.98-2.36-16.98s8.96-9.75,8.8-12.26c-0.16-2.52-7.86-10.85-7.86-10.85s1.26-13.99,0.16-15.88
                        c-1.1-1.89-13.52-3.77-13.52-3.77s-3.14-14.31-4.72-15.25c-1.57-0.94-16.82,0.79-16.82,0.79S65.77,7.45,64.04,7.29z"/>
                    <path style="fill:#FEFFFF;" d="M64.2,12.63c0,0,10.53,8.17,11.95,8.49c1.41,0.31,15.41-1.73,15.41-1.73s2.99,13.83,3.93,14.78
                        s13.05,3.62,13.05,3.62s-0.31,13.2,0.16,13.99c0.47,0.79,6.92,9.75,6.92,9.75s-8.02,9.9-8.33,11.16s2.99,15.88,2.99,15.88
                        s-11.32,4.4-12.26,5.19c-0.94,0.79-6.29,12.1-6.29,12.1s-15.56-1.73-17.45-1.26c-1.89,0.47-9.75,6.92-9.75,6.92
                        s-9.75-6.29-11.16-6.76c-1.41-0.47-16.35,1.73-16.35,1.73s-4.87-12.1-5.66-12.89c-0.79-0.79-11.63-5.03-11.63-5.03
                        s0.79-12.26,0.47-13.2c-0.31-0.94-7.23-11.16-7.23-11.16s7.23-9.59,7.7-11.63s-0.94-14.62-0.94-14.62s11.63-2.67,12.42-3.46
                        c0.79-0.79,5.19-14.78,5.19-14.78s14.31,2.2,15.88,1.89S64.2,12.63,64.2,12.63z"/>
                    <path style="fill:#EF7EAD;" d="M67.54,29.39c0.24,1.93-5.32,2.25-11.38,5.3c-5.56,2.8-25.58,16.83-14.3,39.29
                        c4.98,9.92,14.98,13.91,25.58,12.64c13.13-1.57,23.93-12.25,20.52-26.07c-2.13-8.63-8.25-11.86-14.36-12.56
                        c-8.4-0.96-15.48,4.97-15.6,11.39c-0.19,10.99,12.94,9.73,12.74,4.08s2.92-6.13,3.79-6.22c0.88-0.1,4.77,0.78,4.96,5.84
                        s-3.3,15.11-16.24,14.2c-13.71-0.96-15.18-14.29-14.5-19.73c0.34-2.73,3.51-17.32,20.73-18.49c17.29-1.17,26.77,12.4,27.36,23.68
                        c1.17,22.56-16.66,34.48-35.53,33.41S30.48,78.66,30.87,59.79c0.41-19.84,17.15-27.88,22.03-30.02
                        C58.19,27.46,67.25,27.01,67.54,29.39z"/>
                </svg>
            </div>
            <div class="project-info">
                <h3>Oyama's HRT Tracker</h3>
                <p>Personal Hormone Replacement Therapy tracking dashboard and data visualization.</p>
                <div class="project-tags">
                    <span class="project-tag">Health</span>
                    <span class="project-tag">Data</span>
                </div>
            </div>
        </a>
        <a href="/2048/" class="project-card">
            <div class="project-preview" style="background-color: #edc22e;">
                <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="10" width="35" height="35" rx="4" fill="white" fill-opacity="0.9"/>
                    <rect x="55" y="10" width="35" height="35" rx="4" fill="white" fill-opacity="0.5"/>
                    <rect x="10" y="55" width="35" height="35" rx="4" fill="white" fill-opacity="0.5"/>
                    <rect x="55" y="55" width="35" height="35" rx="4" fill="white" fill-opacity="0.3"/>
                </svg>
            </div>
            <div class="project-info">
                <h3>2048 Game</h3>
                <p>The classic sliding tile puzzle game. Join the numbers and get to the 2048 tile!</p>
                <div class="project-tags">
                    <span class="project-tag">Game</span>
                    <span class="project-tag">Puzzle</span>
                </div>
            </div>
        </a>
        <a href="/2dots/" class="project-card">
            <div class="project-preview" style="background-color: #34495e;">
                <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="30" cy="50" r="15" fill="#e74c3c"/>
                    <circle cx="70" cy="50" r="15" fill="#e74c3c"/>
                    <line x1="45" y1="50" x2="55" y2="50" stroke="white" stroke-width="4" stroke-linecap="round"/>
                </svg>
            </div>
            <div class="project-info">
                <h3>2dots Game</h3>
                <p>Connect dots of the same color to clear them.</p>
                <div class="project-tags">
                    <span class="project-tag">Game</span>
                    <span class="project-tag">Puzzle</span>
                </div>
            </div>
        </a>
        <div class="project-card" style="opacity: 0.6; cursor: not-allowed; filter: grayscale(1);">
            <div class="project-preview" style="background-color: #39c5bb;">
                <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="30" width="60" height="50" rx="8" fill="white"/>
                    <circle cx="35" cy="50" r="5" fill="#39c5bb"/>
                    <circle cx="65" cy="50" r="5" fill="#39c5bb"/>
                    <path d="M40 70 Q50 75 60 70" stroke="#39c5bb" stroke-width="3" stroke-linecap="round"/>
                    <rect x="15" y="40" width="10" height="20" rx="2" fill="white"/>
                    <rect x="75" y="40" width="10" height="20" rx="2" fill="white"/>
                    <path d="M50 30 L50 15" stroke="white" stroke-width="3"/>
                    <circle cx="50" cy="12" r="4" fill="white"/>
                </svg>
            </div>
            <div class="project-info">
                <h3>MikuBot <span style="font-size: 0.7em; background: #e74c3c; color: white; padding: 2px 6px; border-radius: 4px; vertical-align: middle; margin-left: 8px;">Unavailable</span></h3>
                <p>Chat with Hatsune Miku!</p>
                <div class="project-tags">
                    <span class="project-tag">Bot</span>
                    <span class="project-tag">Tool</span>
                </div>
            </div>
        </div>
    </div>
</div>
`;
    return render("Projects", content);
}

async function renderArticlesPage(url?: URL) {
    const articles = await fetchArticlesList();
    const collectionFilter = url?.searchParams.get('collection') || '';
    // Sort articles by date descending (newest first)
    const sortedArticles = [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // collect unique collections
    const collections = Array.from(new Set(sortedArticles.map(a => (a as any).collection).filter(Boolean)));

    const filtered = collectionFilter ? sortedArticles.filter(a => (a as any).collection === collectionFilter) : sortedArticles;

    const articlesHtml = filtered.map(article => `
        <div class="article-item">
            <h2>
                <a href="/articles/${article.slug}">${article.title}</a>
                ${(article as any).collection ? ` <span class="article-tag"><a href="/articles?collection=${encodeURIComponent((article as any).collection)}">${(article as any).collection}</a></span>` : ''}
            </h2>
            <p>${article.date}</p>
        </div>
    `).join('');

        // Render a custom dropdown server-side using available collections
        const items = ['All', ...collections];
        const toggleLabel = collectionFilter || 'All';
        const itemsHtml = items.map(it => {
            const value = it === 'All' ? '' : encodeURIComponent(it);
            return `<li class="cd-item"><button type="button" data-value="${value}">${it}</button></li>`;
        }).join('');

        const collectionsHtml = `
            <div class="collections">
                <label><strong>Collections:</strong></label>
                <div class="collection-dropdown" id="collectionDropdown">
                    <button type="button" class="cd-toggle" id="cdToggle">${toggleLabel} <span class="chev">▾</span></button>
                    <ul class="cd-menu" id="cdMenu" aria-hidden="true">
                        ${itemsHtml}
                    </ul>
                </div>
            </div>
            <script>
                (function(){
                    const toggle = document.getElementById('cdToggle');
                    const menu = document.getElementById('cdMenu');
                    if (!toggle || !menu) return;
                    function closeMenu() { menu.classList.remove('open'); menu.setAttribute('aria-hidden','true'); toggle.querySelector('.chev').style.transform = ''; }
                    function openMenu() { menu.classList.add('open'); menu.setAttribute('aria-hidden','false'); toggle.querySelector('.chev').style.transform = 'rotate(180deg)'; }
                    toggle.addEventListener('click', function(e){ e.stopPropagation(); if (menu.classList.contains('open')) closeMenu(); else openMenu(); });
                    document.addEventListener('click', function(){ closeMenu(); });
                    menu.addEventListener('click', function(e){ e.stopPropagation(); });
                    // handle clicks on items
                    Array.from(menu.querySelectorAll('button[data-value]')).forEach(btn => {
                        btn.addEventListener('click', function(){
                            const v = this.dataset.value || '';
                            if (!v) location.href = '/articles'; else location.href = '/articles?collection=' + v;
                        });
                    });
                })();
            <\/script>
        `;

    const content = `
<div class="article-list">
    <div class="header-actions">
        <h1>Articles</h1>
        <div class="header-buttons">
            <a href="/publish" class="btn-primary">Publish Article</a>
            <button id="refreshArticles" class="btn-primary">Refresh Articles</button>
        </div>
    </div>
    ${collectionsHtml}
    <div id="articlesContainer">
        ${articlesHtml}
    </div>
</div>
`;
    return render("Articles", content + `
<script>
    (function(){
        const refresh = async function(btn) {
            try {
                btn.classList.add('btn-loading');
                const minDelay = new Promise(resolve => setTimeout(resolve, 500));
                
                const resp = await fetch('${BASE_URL}/articles.json');
                if (!resp.ok) throw new Error('Network response was not ok');
                const list = await resp.json();

                // sort by date desc
                list.sort((a,b)=> new Date(b.date).getTime() - new Date(a.date).getTime());

                const urlParams = new URL(window.location.href).searchParams;
                const collectionFilter = urlParams.get('collection') || '';

                const container = document.getElementById('articlesContainer');
                if (container) {
                    const filtered = collectionFilter ? list.filter(a => a.collection === collectionFilter) : list;
                    // Clear container
                    container.innerHTML = '';
                    filtered.forEach(article => {
                        const item = document.createElement('div');
                        item.className = 'article-item';

                        const h2 = document.createElement('h2');
                        const a = document.createElement('a');
                        a.href = '/articles/' + encodeURIComponent(article.slug || '');
                        a.textContent = article.title || '';
                        h2.appendChild(a);

                        if (article.collection) {
                            const span = document.createElement('span');
                            span.className = 'article-tag';
                            const link = document.createElement('a');
                            link.href = '/articles?collection=' + encodeURIComponent(article.collection);
                            link.textContent = article.collection;
                            span.appendChild(link);
                            h2.appendChild(document.createTextNode(' '));
                            h2.appendChild(span);
                        }

                        item.appendChild(h2);
                        const p = document.createElement('p');
                        p.textContent = article.date || '';
                        item.appendChild(p);
                        container.appendChild(item);
                    });
                }

                // rebuild collections dropdown
                const collections = Array.from(new Set(list.map(a => a.collection).filter(Boolean)));
                const items = ['All', ...collections];
                const menu = document.getElementById('cdMenu');
                const toggle = document.getElementById('cdToggle');
                if (menu && toggle) {
                    menu.innerHTML = items.map(it => {
                        const value = it === 'All' ? '' : encodeURIComponent(it);
                        return '<li class="cd-item"><button type="button" data-value="' + value + '">' + it + '</button></li>';
                    }).join('');

                    // reattach handlers
                    Array.from(menu.querySelectorAll('button[data-value]')).forEach(btnEl => {
                        btnEl.addEventListener('click', function(){
                            const v = this.dataset.value || '';
                            if (!v) location.href = '/articles'; else location.href = '/articles?collection=' + v;
                        });
                    });
                }

                await minDelay;

            } catch (err) {
                alert('Refresh failed: ' + (err && err.message ? err.message : err));
            } finally {
                btn.classList.remove('btn-loading');
            }
        };

        const btns = [document.getElementById('refreshArticles')];
        btns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', function(e){
                    e.preventDefault();
                    refresh(this);
                });
            }
        });
    })();
</script>`);
}

function renderPublishPage() {
    const content = `
<div class="publish-form">
    <h1>Publish New Article</h1>
    <form id="publishForm">
        <div class="form-group">
            <label for="token">GitHub Token</label>
            <input type="password" id="token" name="token" required placeholder="ghp_...">
        </div>
        <div class="form-group">
            <label for="title">Title</label>
            <input type="text" id="title" name="title" required placeholder="My New Article">
        </div>
        <div class="form-group">
            <label for="slug">Slug</label>
            <input type="text" id="slug" name="slug" required placeholder="my-new-article">
        </div>
        <div class="form-group">
            <label for="collection">Collection (optional)</label>
            <div class="combobox-wrapper">
                <input type="text" id="collection" name="collection" placeholder="Choose or type to add" autocomplete="off">
                <ul id="collectionMenu" class="combobox-menu"></ul>
            </div>
        </div>
        <div class="form-group">
            <label for="content">Content (Markdown)</label>
            <textarea id="content" name="content" required placeholder="# Hello World\n\nWrite your content here..."></textarea>
        </div>
        <button type="submit" class="btn-submit" id="submitBtn">Publish</button>
    </form>
</div>

<script>
    const form = document.getElementById('publishForm');
    const submitBtn = document.getElementById('submitBtn');
    const titleInput = document.getElementById('title');
    const slugInput = document.getElementById('slug');

    // Auto-generate slug from title
    titleInput.addEventListener('input', (e) => {
        if (!slugInput.value || slugInput.value === slugInput.getAttribute('data-auto')) {
            const slug = e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            slugInput.value = slug;
            slugInput.setAttribute('data-auto', slug);
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Publishing...';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/publish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            alert('Article published successfully! It may take a few minutes for the site to update.');
            window.location.href = '/articles';
        } catch (error) {
            alert('Error publishing article: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publish';
        }
    });
</script>
<script>
        // Custom combobox for collection
        (function(){
            const input = document.getElementById('collection');
            const menu = document.getElementById('collectionMenu');
            if (!input || !menu) return;

            let collections = [];

            function renderMenu(filterText = '') {
                menu.innerHTML = '';
                const filtered = collections.filter(c => c.toLowerCase().includes(filterText.toLowerCase()));
                
                if (filtered.length === 0) {
                    menu.style.display = 'none';
                    return;
                }

                filtered.forEach(c => {
                    const li = document.createElement('li');
                    li.textContent = c;
                    li.addEventListener('mousedown', (e) => {
                        e.preventDefault(); // prevent blur
                        input.value = c;
                        menu.style.display = 'none';
                    });
                    menu.appendChild(li);
                });
                menu.style.display = 'block';
            }

            input.addEventListener('focus', () => renderMenu(input.value));
            input.addEventListener('input', () => renderMenu(input.value));
            
            input.addEventListener('blur', () => {
                menu.style.display = 'none';
            });

            fetch('${BASE_URL}/articles.json')
              .then(r => r.json())
              .then(list => {
                collections = Array.from(new Set(list.map(a => a.collection).filter(Boolean)));
              }).catch(() => {/* ignore errors */});
        })();
    </script>
`;
    return render("Publish Article", content);
}

async function handlePublish(request: Request) {
    try {
        const { token, title, slug, content, collection } = await request.json() as any;
        
        if (!token || !title || !slug || !content) {
            return new Response('Missing required fields', { status: 400 });
        }

        const owner = 'SmirnovaOyama';
        const repo = 'misaka23323.com';
        const date = new Date().toISOString().split('T')[0];
        
        // Use timestamp (YYYYMMDDHHmmss) in filename to ensure uniqueness
        const now = new Date();
        const timestamp = now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');
            
        const filename = `${timestamp}-${slug}.md`;
        const filePath = `src/articles/${filename}`;
        
        // Helper to call GitHub API
        const githubFetch = async (path: string, options: any = {}): Promise<any> => {
            const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
            const res = await fetch(url, {
                ...options,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'User-Agent': 'Cloudflare-Worker',
                    'Accept': 'application/vnd.github.v3+json',
                    ...options.headers,
                },
            });
            if (!res.ok) {
                throw new Error(`GitHub API Error: ${res.status} ${res.statusText}`);
            }
            return res.json();
        };

        // 1. Create the markdown file
        await githubFetch(filePath, {
            method: 'PUT',
            body: JSON.stringify({
                message: `Add article: ${title}`,
                content: btoa(unescape(encodeURIComponent(content))), // Handle UTF-8
            }),
        });

        // 2. Update articles.json
        // First get current content to get SHA
        const articlesJsonPath = 'src/articles.json';
        const currentFile = await githubFetch(articlesJsonPath);
        const currentContent = JSON.parse(decodeURIComponent(escape(atob(currentFile.content))));
        
        // Add new article
        const newArticle: any = {
            title,
            slug,
            date,
            file: `./articles/${filename}`
        };

        // include collection if provided
        if (collection) {
            newArticle.collection = collection;
        }
        
        const newContent = [...currentContent, newArticle];

        // Update file
        await githubFetch(articlesJsonPath, {
            method: 'PUT',
            body: JSON.stringify({
                message: `Update articles.json for: ${title}`,
                content: btoa(unescape(encodeURIComponent(JSON.stringify(newContent, null, 2)))),
                sha: currentFile.sha,
            }),
        });

        return new Response('Published successfully', { status: 200 });

    } catch (error: any) {
        return new Response(error.message || 'Internal Server Error', { status: 500 });
    }
}

async function renderArticlePage(slug: string, url: string, telegramChannel?: string) {
    const articles = await fetchArticlesList();
    const article = articles.find((a: any) => a.slug === slug);
    if (!article) {
        return new Response('Not Found', { status: 404 });
    }

    const markdown = await fetchArticleContent(article.file);
    // Strip YAML frontmatter if present
    const contentWithoutFrontmatter = markdown.replace(/^---\n[\s\S]*?\n---\n/, '');
    const htmlContent = await marked(contentWithoutFrontmatter);

    // Generate description for meta tags
    const plainText = htmlContent.replace(/<[^>]+>/g, '');
    const trimmedText = plainText.replace(/\s+/g, ' ').trim();
    const summary = trimmedText.length > 200 ? `${trimmedText.substring(0, 200).trim()}...` : trimmedText;
    const escapedDescription = escapeHtml(summary || 'Mahiro Oyama Article');
    const escapedTitle = escapeHtml(article.title);
    const canonicalUrl = url.split('#')[0];
    const publishedDate = new Date(`${article.date}T00:00:00Z`);
    const isoPublished = Number.isNaN(publishedDate.getTime()) ? article.date : publishedDate.toISOString();
    const isoModified = isoPublished;
    const section = (article as any).collection ? String((article as any).collection) : '';
    const escapedSection = section ? escapeHtml(section) : '';
    const telegramHandle = telegramChannel ? telegramChannel.trim() : '';

    const jsonLd: Record<string, any> = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        datePublished: isoPublished,
        dateModified: isoModified,
        author: {
            '@type': 'Person',
            name: 'Mahiro Oyama',
        },
        mainEntityOfPage: canonicalUrl,
        description: summary || 'Mahiro Oyama Article',
        url: canonicalUrl,
    };

    if (section) {
        jsonLd.articleSection = section;
    }

    const jsonLdString = JSON.stringify(jsonLd, null, 2).replace(/</g, '\\u003C');

    const metaParts = [
        `<link rel="canonical" href="${canonicalUrl}">`,
        `<meta property="og:title" content="${escapedTitle}">`,
        `<meta property="og:description" content="${escapedDescription}">`,
        `<meta property="og:type" content="article">`,
        `<meta property="og:url" content="${canonicalUrl}">`,
        `<meta property="og:site_name" content="Mahiro Oyama">`,
        `<meta property="article:published_time" content="${isoPublished}">`,
        `<meta property="article:modified_time" content="${isoModified}">`,
        `<meta property="article:author" content="Mahiro Oyama">`,
        section ? `<meta property="article:section" content="${escapedSection}">` : '',
        `<meta name="twitter:card" content="summary_large_image">`,
        `<meta name="twitter:title" content="${escapedTitle}">`,
        `<meta name="twitter:description" content="${escapedDescription}">`,
        `<meta name="twitter:url" content="${canonicalUrl}">`,
        telegramHandle ? `<meta property="telegram:channel" content="${telegramHandle.startsWith('@') ? telegramHandle : '@' + telegramHandle}">` : '',
        `<script type="application/ld+json">${jsonLdString}</script>`
    ].filter(Boolean);

    const metaTags = metaParts.join('\n    ');

    const collectionHtml = section ? ` <span class="article-tag" itemprop="articleSection"><a href="/articles?collection=${encodeURIComponent(section)}">${section}</a></span>` : '';

    const content = `
<article class="article-content" itemscope itemtype="https://schema.org/Article" data-iv-entry="article">
    <meta itemprop="mainEntityOfPage" content="${canonicalUrl}">
    <meta itemprop="url" content="${canonicalUrl}">
    <header class="article-header">
        <h1 itemprop="headline">${article.title}${collectionHtml}</h1>
        <div class="article-meta">
            <time datetime="${isoPublished}" itemprop="datePublished">${article.date}</time>
            <meta itemprop="dateModified" content="${isoModified}">
            <span class="article-author" itemprop="author" itemscope itemtype="https://schema.org/Person">
                <meta itemprop="name" content="Mahiro Oyama">
                Mahiro Oyama
            </span>
        </div>
    </header>
    <div class="content" itemprop="articleBody">
        ${htmlContent}
    </div>
</article>
<script>
    (function() {
        const navItem = document.getElementById('navRefreshItem');
        const navBtn = document.getElementById('navRefreshBtn');
        if (navItem && navBtn) {
            navItem.style.display = 'flex';
            
            navBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                navBtn.classList.add('btn-loading');
                const minDelay = new Promise(resolve => setTimeout(resolve, 500));
                
                try {
                    const response = await fetch(window.location.href);
                    if (!response.ok) throw new Error('Network error');
                    const html = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const newContent = doc.querySelector('.article-content');
                    const currentContent = document.querySelector('.article-content');
                    if (newContent && currentContent) {
                        currentContent.innerHTML = newContent.innerHTML;
                    }
                    await minDelay;
                } catch (err) {
                    alert('Failed to refresh: ' + (err.message || err));
                } finally {
                    navBtn.classList.remove('btn-loading');
                }
            });
        }
    })();
</script>
`;
    return render(article.title, content, metaTags);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/styles.css') {
      return new Response(styles, {
        headers: { 'Content-Type': 'text/css' },
      });
    }

    if (path === '/') {
        return new Response(renderHomePage(), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    if (path === '/articles') {
        const html = await renderArticlesPage(url);
        return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    if (path === '/projects') {
        return new Response(renderProjectsPage(), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    if (path === '/publish') {
        return new Response(renderPublishPage(), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    if (path === '/api/publish' && request.method === 'POST') {
        return handlePublish(request);
    }

    if (path.startsWith('/2048')) {
        // Handle 2048 game assets
        let response = await env.ASSETS.fetch(request);
        
        if (response.status === 404) {
            // If accessing /2048 without slash, redirect to /2048/
            if (path === '/2048') {
                return Response.redirect(url.origin + '/2048/', 301);
            }
            // If accessing a directory (ending in /), try index.html
            if (path.endsWith('/')) {
                const newUrl = new URL(url);
                newUrl.pathname += 'index.html';
                response = await env.ASSETS.fetch(new Request(newUrl, request));
            }
        }
        return injectLayout(response);
    }

    if (path.startsWith('/2dots')) {
        // Handle 2dots game assets
        let response = await env.ASSETS.fetch(request);
        
        if (response.status === 404) {
            // If accessing /2dots without slash, redirect to /2dots/
            if (path === '/2dots') {
                return Response.redirect(url.origin + '/2dots/', 301);
            }
            // If accessing a directory (ending in /), try index.html
            if (path.endsWith('/')) {
                const newUrl = new URL(url);
                newUrl.pathname += 'index.html';
                response = await env.ASSETS.fetch(new Request(newUrl, request));
            }
        }

        return injectLayout(response);
    }

    if (path.startsWith('/MikuBot')) {
        // Handle mikubot assets
        let response = await env.ASSETS.fetch(request);
        
        if (response.status === 404) {
            // If accessing /MikuBot without slash, redirect to /MikuBot/
            if (path === '/MikuBot') {
                return Response.redirect(url.origin + '/MikuBot/', 301);
            }
            // If accessing a directory (ending in /), try index.html
            if (path.endsWith('/')) {
                const newUrl = new URL(url);
                newUrl.pathname += 'index.html';
                response = await env.ASSETS.fetch(new Request(newUrl, request));
            }
        }

        return injectLayout(response);
    }

    const articleMatch = path.match(/^\/articles\/(.+)/);
    if (articleMatch) {
        const slug = articleMatch[1];
        const response = await renderArticlePage(slug, request.url, env.TELEGRAM_CHANNEL);
        if (response instanceof Response) {
            return response;
        }
        return new Response(response, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    return new Response('Not Found', { status: 404 });
  },
};
