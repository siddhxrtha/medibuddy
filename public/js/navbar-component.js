class NavbarComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupScrollListener();
        this.checkAuthStatus();
    }

    render() {
        const shadowRoot = this.shadowRoot;
        shadowRoot.innerHTML = `
            <style>
                :host {
                    --primary: #2563eb;
                    --primary-dark: #1e40af;
                    --text: #111827;
                    --border: #e5e7eb;
                    --white: #ffffff;
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                header {
                    background: var(--white);
                    border-bottom: 2px solid var(--border);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    backdrop-filter: blur(12px);
                    background: rgba(255, 255, 255, 0.97);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                header.scrolled {
                    border-bottom-color: rgba(0, 0, 0, 0.1);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .navbar {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 1rem 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 2rem;
                }

                .navbar-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 1.25rem;
                    color: var(--text);
                    letter-spacing: -0.02em;
                    transition: all 0.3s ease;
                }

                .navbar-brand:hover {
                    color: var(--primary);
                    transform: scale(1.05);
                }

                .logo-img {
                    height: 48px;
                    width: auto;
                    object-fit: contain;
                }

                .nav-links {
                    display: flex;
                    list-style: none;
                    gap: 0;
                    align-items: center;
                    flex: 1;
                }

                .nav-item {
                    position: relative;
                }

                .nav-link {
                    display: inline-block;
                    padding: 0.75rem 1.25rem;
                    color: var(--text);
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    white-space: nowrap;
                }

                .nav-link::before {
                    content: '';
                    position: absolute;
                    bottom: 8px;
                    left: 50%;
                    width: 0;
                    height: 3px;
                    background: linear-gradient(90deg, var(--primary), #10b981);
                    transform: translateX(-50%);
                    transition: width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
                    border-radius: 2px;
                }

                .nav-link:hover,
                .nav-link.active {
                    color: var(--primary);
                }

                .nav-link:hover::before,
                .nav-link.active::before {
                    width: 80%;
                }

                .nav-cta {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                }

                .btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.625rem 1.25rem;
                    font-size: 0.95rem;
                    font-weight: 600;
                    border: none;
                    border-radius: 0.75rem;
                    cursor: pointer;
                    text-decoration: none;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    white-space: nowrap;
                }

                .btn-outline {
                    background: transparent;
                    color: var(--primary);
                    border: 2px solid var(--primary);
                }

                .btn-outline:hover {
                    background: var(--primary);
                    color: var(--white);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
                }

                .btn-primary {
                    background: linear-gradient(135deg, var(--primary), #1e40af);
                    color: var(--white);
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
                    background: linear-gradient(135deg, #1e40af, #1e3a8a);
                }

                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem 1rem;
                    background: rgba(37, 99, 235, 0.1);
                    border-radius: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .user-profile:hover {
                    background: rgba(37, 99, 235, 0.15);
                    transform: translateY(-2px);
                }

                .user-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary), #1e40af);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1rem;
                }

                .user-name {
                    font-weight: 600;
                    color: var(--text);
                    font-size: 0.95rem;
                }

                .btn-danger {
                    background: #dc3545;
                    color: var(--white);
                }

                .btn-danger:hover {
                    background: #c82333;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(220, 53, 69, 0.3);
                }

                .hamburger {
                    display: none;
                    flex-direction: column;
                    background: none;
                    border: none;
                    cursor: pointer;
                    gap: 5px;
                    padding: 0;
                }

                .hamburger span {
                    width: 24px;
                    height: 3px;
                    background: var(--text);
                    border-radius: 2px;
                    transition: all 0.3s ease;
                }

                @media (max-width: 768px) {
                    .nav-links {
                        display: none;
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        flex-direction: column;
                        background: var(--white);
                        gap: 0;
                        border-bottom: 2px solid var(--border);
                        padding: 1rem 0;
                    }

                    .nav-links.active {
                        display: flex;
                    }

                    .nav-item {
                        width: 100%;
                    }

                    .nav-link {
                        display: block;
                        padding: 1rem 1.5rem;
                        border-left: 4px solid transparent;
                    }

                    .nav-link:hover,
                    .nav-link.active {
                        border-left-color: var(--primary);
                        background: rgba(37, 99, 235, 0.05);
                    }

                    .nav-link::before {
                        display: none;
                    }

                    .hamburger {
                        display: flex;
                    }

                    .hamburger.active span:nth-child(1) {
                        transform: rotate(45deg) translate(10px, 10px);
                    }

                    .hamburger.active span:nth-child(2) {
                        opacity: 0;
                    }

                    .hamburger.active span:nth-child(3) {
                        transform: rotate(-45deg) translate(7px, -7px);
                    }

                    .nav-cta {
                        display: none;
                    }

                    .nav-links.active + .nav-cta {
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                        padding: 1rem 1.5rem;
                        border-top: 1px solid var(--border);
                        width: 100%;
                    }
                }
            </style>

            <header>
                <nav class="navbar">
                    <a href="/" class="navbar-brand">
                        <img src="/assets/img/logo.png" alt="MediBuddy Logo" class="logo-img">
                        <span>MediBuddy</span>
                    </a>
                    <ul class="nav-links" id="navLinks">
                        <li class="nav-item"><a href="/" class="nav-link">Home</a></li>
                        <li class="nav-item"><a href="/#how-it-works" class="nav-link">How It Works</a></li>
                        <li class="nav-item"><a href="/#features" class="nav-link">Features</a></li>
                    </ul>
                    <button class="hamburger" id="hamburger" aria-label="Toggle menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    <div class="nav-cta" id="navCta">
                        <a href="/login.html" class="btn btn-outline">Log in</a>
                        <a href="/register.html" class="btn btn-primary">Register</a>
                    </div>
                </nav>
            </header>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const hamburger = this.shadowRoot.getElementById('hamburger');
        const navLinks = this.shadowRoot.getElementById('navLinks');
        const links = this.shadowRoot.querySelectorAll('.nav-link');

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        links.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Active link highlighting
        this.updateActiveLink();
        window.addEventListener('hashchange', () => this.updateActiveLink());
    }

    updateActiveLink() {
        const links = this.shadowRoot.querySelectorAll('.nav-link');
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;

        links.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            
            if (href === '#how-it-works' && currentHash === '#how-it-works') {
                link.classList.add('active');
            } else if (href === '#features' && currentHash === '#features') {
                link.classList.add('active');
            } else if (href === '#reassurance' && currentHash === '#reassurance') {
                link.classList.add('active');
            } else if (href === '/' && currentPath === '/') {
                link.classList.add('active');
            }
        });
    }

    async checkAuthStatus() {
        try {
            const res = await fetch('/api/auth/me', { credentials: 'include' });
            if (!res.ok) return;
            
            const data = await res.json();
            if (data && data.user) {
                this.updateNavbarForLoggedInUser(data.user);
            }
        } catch (error) {
            // User not logged in, keep default navbar
        }
    }

    updateNavbarForLoggedInUser(user) {
        const navLinks = this.shadowRoot.getElementById('navLinks');
        const navCta = this.shadowRoot.getElementById('navCta');
        
        // Add Dashboard link to nav if not already there
        const dashboardExists = Array.from(navLinks.children).some(li => 
            li.querySelector('a[href="/dashboard"]')
        );
        
        if (!dashboardExists) {
            const dashboardItem = document.createElement('li');
            dashboardItem.className = 'nav-item';
            dashboardItem.innerHTML = '<a href="/dashboard" class="nav-link">Dashboard</a>';
            navLinks.appendChild(dashboardItem);
        }
        
        // Update CTA to show profile and logout
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        navCta.innerHTML = `
            <div class="user-profile">
                <div class="user-avatar">${initials}</div>
                <span class="user-name">${user.name}</span>
            </div>
            <button class="btn btn-danger" id="logoutBtn">Logout</button>
        `;
        
        // Add logout functionality
        const logoutBtn = navCta.querySelector('#logoutBtn');
        logoutBtn.addEventListener('click', async () => {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            window.location.href = '/login.html';
        });
    }

    setupScrollListener() {
        const header = this.shadowRoot.querySelector('header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

customElements.define('navbar-atag', NavbarComponent);
