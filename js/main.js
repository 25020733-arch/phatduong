/**
 * DIGITAL LEARNING JOURNEY - MAIN JAVASCRIPT
 * Developed in pure ES6. No frameworks used.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LOADER SCREEN ---
    const loader = document.getElementById('loader');
    const statusText = loader.querySelector('.loader-status');
    
    // Smooth status updates
    const statuses = [
        'Đang quét cấu trúc thư mục...',
        'Tải bộ thư viện tài liệu PDF...',
        'Khởi tạo sơ đồ cấu trúc SVG...',
        'Đang kết nối cổng dữ liệu AI...',
        'Hành trình sẵn sàng!'
    ];
    
    let statusIndex = 0;
    const statusInterval = setInterval(() => {
        if (statusIndex < statuses.length) {
            statusText.textContent = statuses[statusIndex];
            statusIndex++;
        }
    }, 250);

    window.addEventListener('load', () => {
        clearInterval(statusInterval);
        statusText.textContent = statuses[statuses.length - 1];
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            setTimeout(() => loader.style.display = 'none', 600);
        }, 300);
    });

    // Fallback if load event takes too long
    setTimeout(() => {
        clearInterval(statusInterval);
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        setTimeout(() => loader.style.display = 'none', 600);
    }, 2500);


    // --- 2. CUSTOM CURSOR (Desktop Only) ---
    const cursorDot = document.getElementById('cursor-dot');
    const cursorFollower = document.getElementById('cursor-follower');
    
    if (window.matchMedia("(pointer: fine)").matches) {
        document.body.classList.remove('cursor-disabled');
        document.body.classList.add('cursor-active');
        
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });
        
        // Smooth follower animation lag
        const renderCursor = () => {
            followerX += (mouseX - followerX) * 0.12;
            followerY += (mouseY - followerY) * 0.12;
            
            cursorFollower.style.left = followerX + 'px';
            cursorFollower.style.top = followerY + 'px';
            
            requestAnimationFrame(renderCursor);
        };
        requestAnimationFrame(renderCursor);

        // Hover states on active elements
        const updateHoverEvents = () => {
            const hoverables = document.querySelectorAll('a, button, .k-card, .accordion-toggle, .op-btn, .ill-box, .doc-card-btn, .filter-btn');
            hoverables.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    cursorDot.classList.add('active');
                    cursorFollower.classList.add('active');
                });
                el.addEventListener('mouseleave', () => {
                    cursorDot.classList.remove('active');
                    cursorFollower.classList.remove('active');
                });
            });
        };
        updateHoverEvents();
        
        // Expose to window so other dynamically added items can update
        window.updateCursorHovers = updateHoverEvents;
    }


    // --- 3. DARK/LIGHT THEME TOGGLE ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = themeToggleBtn.querySelector('.sun-icon');
    const moonIcon = themeToggleBtn.querySelector('.moon-icon');
    
    // Read saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme', nextTheme);
        updateThemeUI(nextTheme);
    });

    function updateThemeUI(theme) {
        if (theme === 'dark') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }


    // --- 4. MOBILE NAVIGATION MENU ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    mobileToggle.addEventListener('click', () => {
        const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        mobileToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
    });

    // Close when clicking nav items
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
        });
    });


    // --- 5. SCROLL SPY & STICKY NAVIGATION ---
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Sticky Header shadow
        if (scrollY > 50) {
            header.style.boxShadow = 'var(--shadow-md)';
        } else {
            header.style.boxShadow = 'none';
        }

        // Back to top visibility
        if (scrollY > 600) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }

        // Scroll Spy active link
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(currentSectionId) && currentSectionId !== '') {
                link.classList.add('active');
            }
        });
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


    // --- 6. SCROLL REVEAL (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Trigger counters if dashboard section is revealed
                if (entry.target.classList.contains('dashboard-content')) {
                    startCounters();
                }
                
                // Trigger progress skills
                if (entry.target.classList.contains('skills-progress-column') || entry.target.closest('.skills-section')) {
                    startSkillProgress();
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));


    // --- 7. ANIMATED COUNTERS ---
    let countersStarted = false;
    function startCounters() {
        if (countersStarted) return;
        countersStarted = true;
        
        const counters = document.querySelectorAll('.stat-num');
        const countSpeed = 80;

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            let count = 0;
            
            const updateCount = () => {
                const step = Math.ceil(target / countSpeed);
                count += step;
                if (count >= target) {
                    counter.textContent = target;
                } else {
                    counter.textContent = count;
                    requestAnimationFrame(updateCount);
                }
            };
            updateCount();
        });
        
        // Animate Dashboard Progress Circle
        const circleProgress = document.querySelector('.circle-fill');
        if (circleProgress) {
            // Stroke dasharray is 754, full circle is 100% completed
            circleProgress.style.strokeDashoffset = '0';
        }
    }


    // --- 8. TYPING ANIMATION (Hero Title) ---
    const typingTarget = document.querySelector('.typing-target');
    const words = ['HỌC TẬP SỐ', 'PHÁT TRIỂN NĂNG LỰC', 'ỨNG DỤNG AI', 'TƯ DUY KỸ THUẬT'];
    let wordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typingSpeed = 120;

    function typeEffect() {
        const currentWord = words[wordIdx];
        
        if (isDeleting) {
            typingTarget.textContent = currentWord.substring(0, charIdx - 1);
            charIdx--;
            typingSpeed = 60;
        } else {
            typingTarget.textContent = currentWord.substring(0, charIdx + 1);
            charIdx++;
            typingSpeed = 120;
        }

        if (!isDeleting && charIdx === currentWord.length) {
            typingSpeed = 2200; // pause on complete word
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            wordIdx = (wordIdx + 1) % words.length;
            typingSpeed = 600; // pause before next word
        }

        setTimeout(typeEffect, typingSpeed);
    }
    
    // Start typing after loader finishes
    setTimeout(typeEffect, 1200);


    // --- 9. ACCORDION PANELS ---
    const accordionToggles = document.querySelectorAll('.accordion-toggle');
    accordionToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const panel = toggle.nextElementSibling;
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            
            // Close other accordions in the same timeline node for clean UI
            const node = toggle.closest('.node-card');
            if (node) {
                node.querySelectorAll('.accordion-toggle').forEach(otherToggle => {
                    if (otherToggle !== toggle && otherToggle.getAttribute('aria-expanded') === 'true') {
                        otherToggle.setAttribute('aria-expanded', 'false');
                        otherToggle.nextElementSibling.style.maxHeight = null;
                    }
                });
            }
            
            toggle.setAttribute('aria-expanded', !isExpanded);
            if (!isExpanded) {
                panel.style.maxHeight = panel.scrollHeight + "px";
            } else {
                panel.style.maxHeight = null;
            }
        });
    });


    // --- 10. HIGH-QUALITY VECTOR SVG GENERATOR (18 Unique SVGs) ---
    const svgDatabase = {
        // Checkpoint 1: Hardware
        'cpu_core': `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="ill-svg">
            <rect x="25" y="20" width="110" height="80" rx="6" fill="none" stroke="var(--primary)" stroke-width="2.5" />
            <rect x="35" y="30" width="40" height="25" rx="3" fill="rgba(var(--primary-rgb), 0.08)" stroke="var(--primary)" stroke-width="1.5" />
            <text x="55" y="46" font-size="8" font-weight="700" fill="var(--text-main)" text-anchor="middle">ALU</text>
            <rect x="85" y="30" width="40" height="25" rx="3" fill="none" stroke="var(--primary)" stroke-width="1.5" />
            <text x="105" y="46" font-size="8" font-weight="700" fill="var(--text-main)" text-anchor="middle">Registers</text>
            <rect x="35" y="65" width="90" height="25" rx="3" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="2 2" />
            <text x="80" y="80" font-size="8" font-weight="700" fill="var(--text-main)" text-anchor="middle">Control Unit (CU)</text>
            <line x1="55" y1="55" x2="55" y2="65" stroke="var(--primary)" stroke-width="1.5" />
            <line x1="105" y1="55" x2="105" y2="65" stroke="var(--primary)" stroke-width="1.5" />
        </svg>`,
        'input_output': `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="ill-svg">
            <circle cx="35" cy="60" r="15" fill="none" stroke="var(--primary)" stroke-width="2" />
            <text x="35" y="63" font-size="8" font-weight="700" fill="var(--text-main)" text-anchor="middle">INPUT</text>
            <circle cx="125" cy="60" r="15" fill="none" stroke="var(--primary)" stroke-width="2" />
            <text x="125" y="63" font-size="8" font-weight="700" fill="var(--text-main)" text-anchor="middle">OUTPUT</text>
            <rect x="65" y="45" width="30" height="30" rx="4" fill="rgba(var(--primary-rgb), 0.08)" stroke="var(--accent)" stroke-width="2" />
            <text x="80" y="63" font-size="8" font-weight="700" fill="var(--text-main)" text-anchor="middle">CPU</text>
            <path d="M50 60 H60" stroke="var(--text-sub)" stroke-width="1.5" marker-end="url(#arrow)" />
            <path d="M95 60 H105" stroke="var(--text-sub)" stroke-width="1.5" marker-end="url(#arrow)" />
        </svg>`,
        'system_bus': `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="ill-svg">
            <rect x="20" y="45" width="120" height="12" rx="2" fill="rgba(var(--primary-rgb), 0.1)" stroke="var(--primary)" stroke-width="2" />
            <text x="80" y="54" font-size="7" font-weight="800" fill="var(--text-main)" text-anchor="middle">SYSTEM BUS (Data/Addr/Ctrl)</text>
            <rect x="25" y="15" width="30" height="18" rx="2" fill="none" stroke="var(--text-sub)" stroke-width="1.5" />
            <text x="40" y="27" font-size="7" font-weight="700" fill="var(--text-main)" text-anchor="middle">CPU</text>
            <rect x="65" y="15" width="30" height="18" rx="2" fill="none" stroke="var(--text-sub)" stroke-width="1.5" />
            <text x="80" y="27" font-size="7" font-weight="700" fill="var(--text-main)" text-anchor="middle">RAM</text>
            <rect x="105" y="15" width="30" height="18" rx="2" fill="none" stroke="var(--text-sub)" stroke-width="1.5" />
            <text x="120" y="27" font-size="7" font-weight="700" fill="var(--text-main)" text-anchor="middle">I/O</text>
            <line x1="40" y1="33" x2="40" y2="45" stroke="var(--accent)" stroke-width="1.5" />
            <line x1="80" y1="33" x2="80" y2="45" stroke="var(--accent)" stroke-width="1.5" />
            <line x1="120" y1="33" x2="120" y2="45" stroke="var(--accent)" stroke-width="1.5" />
        </svg>`,

        // Checkpoint 2: Data & Search
        'search_crawler': `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="ill-svg">
            <circle cx="80" cy="60" r="18" fill="none" stroke="var(--primary)" stroke-width="2" />
            <text x="80" y="63" font-size="7" font-weight="700" fill="var(--text-main)" text-anchor="middle">Indexer</text>
            <circle cx="35" cy="30" r="12" fill="none" stroke="var(--text-sub)" stroke-width="1.5" />
            <text x="35" y="33" font-size="6" fill="var(--text-main)" text-anchor="middle">Web 1</text>
            <circle cx="125" cy="30" r="12" fill="none" stroke="var(--text-sub)" stroke-width="1.5" />
            <text x="125" y="33" font-size="6" fill="var(--text-main)" text-anchor="middle">Web 2</text>
            <polygon points="80,105 100,85 60,85" fill="none" stroke="var(--accent)" stroke-width="1.5" />
            <text x="80" y="97" font-size="6" font-weight="700" fill="var(--text-main)" text-anchor="middle">Query</text>
            <line x1="45" y1="38" x2="68" y2="50" stroke="var(--primary)" stroke-width="1" />
            <line x1="115" y1="38" x2="92" y2="50" stroke="var(--primary)" stroke-width="1" />
            <line x1="80" y1="78" x2="80" y2="85" stroke="var(--accent)" stroke-width="1" />
        </svg>`,
        'craap_scale': `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="ill-svg">
            <line x1="20" y1="90" x2="140" y2="90" stroke="var(--text-main)" stroke-width="3" />
            <line x1="80" y1="90" x2="80" y2="40" stroke="var(--primary)" stroke-width="2" />
            <line x1="30" y1="50" x2="130" y2="50" stroke="var(--accent)" stroke-width="2" />
            <circle cx="30" cy="50" r="8" fill="var(--secondary)" />
            <circle cx="130" cy="50" r="8" fill="var(--accent)" />
            <text x="30" y="35" font-size="7" font-weight="700" fill="var(--text-main)" text-anchor="middle">Độ Tin Cậy</text>
            <text x="130" y="35" font-size="7" font-weight="700" fill="var(--text-main)" text-anchor="middle">Độ Phù Hợp</text>
        </svg>`,
        'sql_schema': `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="ill-svg">
            <rect x="20" y="25" width="45" height="55" rx="3" fill="none" stroke="var(--primary)" stroke-width="1.5" />
            <line x1="20" y1="40" x2="65" y2="40" stroke="var(--primary)" stroke-width="1.5" />
            <text x="42" y="35" font-size="7" font-weight="700" fill="var(--text-main)" text-anchor="middle">T_Source</text>
            <text x="25" y="52" font-size="6" fill="var(--text-sub)">ID (PK)</text>
            <text x="25" y="65" font-size="6" fill="var(--text-sub)">URL</text>
            
            <rect x="95" y="25" width="45" height="55" rx="3" fill="none" stroke="var(--primary)" stroke-width="1.5" />
            <line x1="95" y1="40" x2="140" y2="40" stroke="var(--primary)" stroke-width="1.5" />
            <text x="117" y="35" font-size="7" font-weight="700" fill="var(--text-main)" text-anchor="middle">T_CRAAP</text>
            <text x="100" y="52" font-size="6" fill="var(--text-sub)">SourceID (FK)</text>
            <text x="100" y="65" font-size="6" fill="var(--text-sub)">Score</text>
            
            <line x1="65" y1="48" x2="95" y2="48" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="2 2" />
        </svg>`,

        // Checkpoint 3: AI overview
        'neural_network': `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="ill-svg">
            <circle cx="30" cy="35" r="7" fill="var(--primary)" />
            <circle cx="30" cy="60" r="7" fill="var(--primary)" />
            <circle cx="30" cy="85" r="7" fill="var(--primary)" />
            <circle cx="80" cy="45" r="7" fill="var(--secondary)" />
            <circle cx="80" cy="75" r="7" fill="var(--secondary)" />
            <circle cx="130" cy="60" r="7" fill="var(--accent)" />
            
            <line x1="37" y1="35" x2="73" y2="45" stroke="var(--text-sub)" stroke-width="0.8" />
            <line x1="37" y1="35" x2="73" y2="75" stroke="var(--text-sub)" stroke-width="0.8" />
            <line x1="37" y1="60" x2="73" y2="45" stroke="var(--text-sub)" stroke-width="0.8" />
            <line x1="37" y1="60" x2="73" y2="75" stroke="var(--text-sub)" stroke-width="0.8" />
            <line x1="37" y1="85" x2="73" y2="45" stroke="var(--text-sub)" stroke-width="0.8" />
            <line x1="37" y1="85" x2="73" y2="75" stroke="var(--text-sub)" stroke-width="0.8" />
            <line x1="87" y1="45" x2="123" y2="60" stroke="var(--text-sub)" stroke-width="0.8" />
            <line x1="87" y1="75" x2="123" y2="60" stroke="var(--text-sub)" stroke-width="0.8" />
        </svg>`,
        'ml_vs_dl': `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="ill-svg">
            <circle cx="70" cy="60" r="45" fill="none" stroke="var(--primary)" stroke-width="2" />
            <text x="45" y="32" font-size="7" font-weight="700" fill="var(--primary)">Machine Learning</text>
            <circle cx="85" cy="60" r="25" fill="rgba(var(--primary-rgb), 0.08)" stroke="var(--accent)" stroke-width="2" />
            <text x="85" y="63" font-size="7" font-weight="700" fill="var(--text-main)" text-anchor="middle">Deep Learning</text>
        </svg>`,
        'ai_tree': `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="ill-svg">
            <rect x="65" y="15" width="30" height="15" rx="2" fill="none" stroke="var(--primary)" stroke-width="1.5" />
            <text x="80" y="25" font-size="7" font-weight="700" fill="var(--text-main)" text-anchor="middle">AI</text>
            <rect x="25" y="55" width="40" height="15" rx="2" fill="none" stroke="var(--text-sub)" stroke-width="1.2" />
            <text x="45" y="65" font-size="6" font-weight="600" fill="var(--text-main)" text-anchor="middle">Symbolic AI</text>
            <rect x="95" y="55" width="40" height="15" rx="2" fill="none" stroke="var(--text-sub)" stroke-width="1.2" />
            <text x="115" y="65" font-size="6" font-weight="600" fill="var(--text-main)" text-anchor="middle">Sub-symbolic</text>
            <line x1="80" y1="30" x2="80" y2="42" stroke="var(--primary)" stroke-width="1.2" />
            <line x1="80" y1="42" x2="45" y2="42" stroke="var(--primary)" stroke-width="1.2" />
            <line x1="45" y1="42" x2="45" y2="55" stroke="var(--primary)" stroke-width="1.2" />
            <line x1="80" y1="42" x2="115" y2="42" stroke="var(--primary)" stroke-width="1.2" />
            <line x1="115" y1="42" x2="115" y2="55" stroke="var(--primary)" stroke-width="1.2" />
        </svg>`,

        // Checkpoint 4: Collaboration
        'git_flow': `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="ill-svg">
            <line x1="20" y1="35" x2="140" y2="35" stroke="var(--primary)" stroke-width="2" />
            <circle cx="30" cy="35" r="4" fill="var(--primary)" />
            <circle cx="80" cy="35" r="4" fill="var(--primary)" />
            <circle cx="130" cy="35" r="4" fill="var(--primary)" />
            <text x="145" y="38" font-size="6" font-weight="700" fill="var(--primary)">Main</text>
            
            <path d="M30 35 Q55 75 80 75" fill="none" stroke="var(--accent)" stroke-width="1.5" />
            <line x1="80" y1="75" x2="120" y2="75" stroke="var(--accent)" stroke-width="1.5" />
            <path d="M120 75 Q125 75 130 35" fill="none" stroke="var(--accent)" stroke-width="1.5" />
            <circle cx="60" cy="62" r="3" fill="var(--accent)" />
            <circle cx="100" cy="75" r="3" fill="var(--accent)" />
            <text x="145" y="78" font-size="6" font-weight="700" fill="var(--accent)">Dev</text>
        </svg>`,
        'scrum_cycle': `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="ill-svg">
            <path d="M80 20 A 40 40 0 1 1 79.9 20" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-dasharray="6 3" />
            <text x="80" y="64" font-size="8" font-weight="700" fill="var(--text-main)" text-anchor="middle">Sprint Cycle</text>
            <rect x="65" y="90" width="30" height="15" rx="2" fill="rgba(var(--primary-rgb), 0.08)" stroke="var(--accent)" stroke-width="1.5" />
            <text x="80" y="100" font-size="6" font-weight="700" fill="var(--text-main)" text-anchor="middle">Demo Product</text>
        </svg>`,
        'sync_async': `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="ill-svg">
            <rect x="25" y="25" width="45" height="35" rx="3" fill="none" stroke="var(--primary)" stroke-width="1.5" />
            <text x="47" y="45" font-size="7" font-weight="700" fill="var(--text-main)" text-anchor="middle">Sync</text>
            <text x="47" y="54" font-size="5" fill="var(--text-sub)" text-anchor="middle">Meetings / Chat</text>
            
            <rect x="90" y="25" width="45" height="35" rx="3" fill="none" stroke="var(--accent)" stroke-width="1.5" />
            <text x="112" y="45" font-size="7" font-weight="700" fill="var(--text-main)" text-anchor="middle">Async</text>
            <text x="112" y="54" font-size="5" fill="var(--text-sub)" text-anchor="middle">Notion / PRs</text>
            
            <path d="M70 42 H90" stroke="var(--text-sub)" stroke-width="1" marker-end="url(#arrow)" />
        </svg>`,

        // Checkpoint 5: Creativity
        'design_thinking': `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="ill-svg">
            <circle cx="30" cy="60" r="10" fill="rgba(var(--primary-rgb), 0.1)" stroke="var(--primary)" stroke-width="1.5" />
            <circle cx="55" cy="60" r="10" fill="rgba(var(--primary-rgb), 0.1)" stroke="var(--primary)" stroke-width="1.5" />
            <circle cx="80" cy="60" r="10" fill="rgba(var(--primary-rgb), 0.1)" stroke="var(--primary)" stroke-width="1.5" />
            <circle cx="105" cy="60" r="10" fill="rgba(var(--primary-rgb), 0.1)" stroke="var(--primary)" stroke-width="1.5" />
            <circle cx="130" cy="60" r="10" fill="rgba(var(--primary-rgb), 0.1)" stroke="var(--primary)" stroke-width="1.5" />
            <line x1="40" y1="60" x2="45" y2="60" stroke="var(--text-sub)" />
            <line x1="65" y1="60" x2="70" y2="60" stroke="var(--text-sub)" />
            <line x1="90" y1="60" x2="95" y2="60" stroke="var(--text-sub)" />
            <line x1="115" y1="60" x2="120" y2="60" stroke="var(--text-sub)" />
            <text x="30" y="80" font-size="5" font-weight="700" fill="var(--text-sub)" text-anchor="middle">Thấu hiểu</text>
            <text x="55" y="80" font-size="5" font-weight="700" fill="var(--text-sub)" text-anchor="middle">Xác định</text>
            <text x="80" y="80" font-size="5" font-weight="700" fill="var(--text-sub)" text-anchor="middle">Ý tưởng</text>
            <text x="105" y="80" font-size="5" font-weight="700" fill="var(--text-sub)" text-anchor="middle">Mẫu thử</text>
            <text x="130" y="80" font-size="5" font-weight="700" fill="var(--text-sub)" text-anchor="middle">Thử nghiệm</text>
        </svg>`,
        'conversion_funnel': `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="ill-svg">
            <polygon points="30,25 130,25 105,50 55,50" fill="none" stroke="var(--primary)" stroke-width="1.5" />
            <polygon points="55,50 105,50 90,75 70,75" fill="none" stroke="var(--secondary)" stroke-width="1.5" />
            <polygon points="70,75 90,75 83,95 77,95" fill="none" stroke="var(--accent)" stroke-width="1.5" />
            <text x="80" y="40" font-size="6" font-weight="700" fill="var(--text-main)" text-anchor="middle">Awareness</text>
            <text x="80" y="65" font-size="6" font-weight="700" fill="var(--text-main)" text-anchor="middle">Interest</text>
            <text x="80" y="88" font-size="5" font-weight="700" fill="var(--text-main)" text-anchor="middle">Action</text>
        </svg>`,
        'ui_wireframe': `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="ill-svg">
            <rect x="25" y="20" width="110" height="80" rx="3" fill="none" stroke="var(--primary)" stroke-width="2" />
            <line x1="25" y1="35" x2="135" y2="35" stroke="var(--primary)" stroke-width="1.5" />
            <rect x="35" y="45" width="25" height="45" rx="1" fill="none" stroke="var(--text-sub)" stroke-width="1" />
            <rect x="70" y="45" width="55" height="20" rx="1" fill="none" stroke="var(--accent)" stroke-width="1" />
            <line x1="70" y1="75" x2="125" y2="75" stroke="var(--text-sub)" stroke-width="1" />
            <line x1="70" y1="85" x2="110" y2="85" stroke="var(--text-sub)" stroke-width="1" />
        </svg>`,

        // Checkpoint 6: Security
        'ethics_balance': `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="ill-svg">
            <line x1="30" y1="85" x2="130" y2="85" stroke="var(--text-main)" stroke-width="2" />
            <polygon points="80,55 87,85 73,85" fill="var(--primary)" />
            <line x1="40" y1="55" x2="120" y2="55" stroke="var(--accent)" stroke-width="2" />
            <circle cx="40" cy="55" r="10" fill="rgba(var(--primary-rgb), 0.15)" stroke="var(--primary)" stroke-width="1" />
            <circle cx="120" cy="55" r="10" fill="rgba(var(--primary-rgb), 0.15)" stroke="var(--primary)" stroke-width="1" />
            <text x="40" y="58" font-size="6" font-weight="700" fill="var(--text-main)" text-anchor="middle">AI Lợi ích</text>
            <text x="120" y="58" font-size="6" font-weight="700" fill="var(--text-main)" text-anchor="middle">Đạo đức</text>
        </svg>`,
        'padlock_encrypt': `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="ill-svg">
            <rect x="55" y="55" width="50" height="40" rx="4" fill="none" stroke="var(--primary)" stroke-width="2" />
            <path d="M65 55 V40 A 15 15 0 0 1 95 40 V55" fill="none" stroke="var(--accent)" stroke-width="2" />
            <circle cx="80" cy="75" r="5" fill="var(--primary)" />
            <line x1="80" y1="80" x2="80" y2="90" stroke="var(--primary)" stroke-width="2" />
        </svg>`,
        'cc_license': `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" class="ill-svg">
            <circle cx="55" cy="60" r="20" fill="none" stroke="var(--primary)" stroke-width="2" />
            <text x="55" y="66" font-size="18" font-weight="700" fill="var(--text-main)" text-anchor="middle">C</text>
            <circle cx="105" cy="60" r="20" fill="none" stroke="var(--primary)" stroke-width="2" />
            <text x="105" y="66" font-size="18" font-weight="700" fill="var(--text-main)" text-anchor="middle">C</text>
            <text x="80" y="98" font-size="8" font-weight="700" fill="var(--text-main)" text-anchor="middle">Creative Commons</text>
        </svg>`
    };

    function injectSVGs() {
        const mapping = {
            1: ['cpu_core', 'input_output', 'system_bus'],
            2: ['search_crawler', 'craap_scale', 'sql_schema'],
            3: ['neural_network', 'ml_vs_dl', 'ai_tree'],
            4: ['git_flow', 'scrum_cycle', 'sync_async'],
            5: ['design_thinking', 'conversion_funnel', 'ui_wireframe'],
            6: ['ethics_balance', 'padlock_encrypt', 'cc_license']
        };

        const titles = {
            'cpu_core': 'Kiến trúc CPU',
            'input_output': 'Hệ thống I/O',
            'system_bus': 'System Bus',
            'search_crawler': 'Mô hình Crawler',
            'craap_scale': 'Thang đo CRAAP',
            'sql_schema': 'Lược đồ CSDL',
            'neural_network': 'Mạng Nơ-ron',
            'ml_vs_dl': 'Venn ML & DL',
            'ai_tree': 'Phân loại AI',
            'git_flow': 'Git Flow Branching',
            'scrum_cycle': 'Sprint Scrum',
            'sync_async': 'Sync vs Async Matrix',
            'design_thinking': 'Design Thinking',
            'conversion_funnel': 'Phễu nội dung',
            'ui_wireframe': 'UI Wireframe Mockup',
            'ethics_balance': 'Đạo đức AI',
            'padlock_encrypt': 'Mã hóa Dữ liệu',
            'cc_license': 'Giấy phép CC'
        };

        Object.keys(mapping).forEach(checkpointId => {
            const container = document.querySelector(`.illustrations-container[data-checkpoint="${checkpointId}"]`);
            if (container) {
                container.innerHTML = '';
                mapping[checkpointId].forEach(key => {
                    const box = document.createElement('div');
                    box.className = 'ill-box';
                    box.setAttribute('data-svg-key', key);
                    box.innerHTML = `
                        ${svgDatabase[key]}
                        <span class="ill-title">${titles[key]}</span>
                    `;
                    
                    // Click to open Lightbox
                    box.addEventListener('click', () => {
                        openLightbox(key, titles[key]);
                    });
                    
                    container.appendChild(box);
                });
            }
        });
    }

    injectSVGs();


    // --- 11. INTERACTIVE SEARCH QUERY BUILDER (Bài 2) ---
    const searchInput = document.getElementById('interactive-search-input');
    const clearBtn = document.getElementById('search-clear');
    const runBtn = document.getElementById('search-run-btn');
    const resultsBox = document.getElementById('search-demo-results');
    const operatorBtns = document.querySelectorAll('.op-btn:not(.btn-clear)');

    operatorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-op');
            let currentVal = searchInput.value.trim();
            
            if (currentVal === '') {
                searchInput.value = val;
            } else {
                // Prevent duplicate operators without values
                searchInput.value = currentVal + ' ' + val;
            }
        });
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        resultsBox.innerHTML = '<p class="placeholder-text">Kết quả giả lập tìm kiếm sẽ xuất hiện ở đây...</p>';
    });

    const mockSearchResults = [
        {
            title: 'Khảo sát hiện trạng ứng dụng AI tại các trường Đại học Việt Nam',
            url: 'https://hcmus.edu.vn/research/ai-status-survey.pdf',
            snippet: 'Báo cáo chính thức phân tích dữ liệu thực tế về việc áp dụng LLMs trong hỗ trợ giảng dạy và nâng cao kỹ năng lập trình cho sinh viên tại Việt Nam.',
            keywords: ['site:edu.vn', 'filetype:pdf', 'intitle:"Trí tuệ nhân tạo"']
        },
        {
            title: 'Giáo trình Nhập môn Công nghệ số và AI học thuật',
            url: 'https://uet.vnu.edu.vn/documents/digital-literacy-handbook.pdf',
            snippet: 'Tài liệu hướng dẫn trang bị các kỹ năng số cơ bản, kỹ năng tìm kiếm thông tin học thuật chuẩn CRAAP và hướng dẫn đạo đức AI.',
            keywords: ['site:edu.vn', 'filetype:pdf']
        },
        {
            title: 'Kỷ yếu hội thảo Khoa học: Tương lai Trí tuệ Nhân tạo trong Giáo dục',
            url: 'https://hust.edu.vn/science/ai-education-workshop.pdf',
            snippet: 'Tuyển tập các bài nghiên cứu về thuật toán máy học, xử lý ngôn ngữ tự nhiên và đạo đức học thuật khi sử dụng ChatGPT.',
            keywords: ['site:edu.vn', 'filetype:pdf', 'intitle:"Trí tuệ nhân tạo"']
        },
        {
            title: 'Thông tin tuyển sinh ngành Khoa học dữ liệu & Trí tuệ nhân tạo',
            url: 'https://ts.hust.edu.vn/tuyen-sinh/nganh-ai-data-science',
            snippet: 'Chương trình đào tạo chất lượng cao cung cấp các kiến thức chuyên môn sâu về xây dựng mô hình nơ-ron nhân tạo và khai thác dữ liệu.',
            keywords: ['site:edu.vn', 'inurl:tuyen-sinh']
        }
    ];

    runBtn.addEventListener('click', () => {
        const query = searchInput.value.trim().toLowerCase();
        
        if (query === '') {
            resultsBox.innerHTML = '<p class="placeholder-text" style="color: #EF4444;">Vui lòng chọn hoặc nhập từ khóa tìm kiếm!</p>';
            return;
        }

        resultsBox.innerHTML = '<p class="placeholder-text">Đang chạy truy vấn trên cơ sở dữ liệu giả lập...</p>';

        setTimeout(() => {
            // Find matches
            let matches = [];
            
            // Basic smart filter matching keywords
            mockSearchResults.forEach(item => {
                let isMatch = false;
                
                if (query.includes('site:edu.vn') && item.keywords.includes('site:edu.vn')) isMatch = true;
                if (query.includes('filetype:pdf') && item.keywords.includes('filetype:pdf')) isMatch = true;
                if ((query.includes('intitle:"trí tuệ nhân tạo"') || query.includes('intitle:"ai"')) && item.keywords.includes('intitle:"Trí tuệ nhân tạo"')) isMatch = true;
                if (query.includes('inurl:tuyen-sinh') && item.keywords.includes('inurl:tuyen-sinh')) isMatch = true;
                
                // Fallback basic text search if none of operators matched specifically
                if (!isMatch) {
                    const cleanQuery = query.replace(/(site:|filetype:|intitle:|inurl:|and|or|")/g, '').trim();
                    if (cleanQuery !== '' && item.title.toLowerCase().includes(cleanQuery)) {
                        isMatch = true;
                    }
                }

                if (isMatch) {
                    matches.push(item);
                }
            });

            // If no match found, just show first 2 results as default query matches
            if (matches.length === 0) {
                matches = [mockSearchResults[0], mockSearchResults[1]];
            }

            resultsBox.innerHTML = '';
            matches.forEach(res => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'result-item';
                itemDiv.innerHTML = `
                    <a href="#" class="result-title" onclick="alert('Đây là đường dẫn giả lập học thuật'); return false;">${res.title}</a>
                    <span class="result-url">${res.url}</span>
                    <p class="result-snippet">${res.snippet}</p>
                `;
                resultsBox.appendChild(itemDiv);
            });
            
            if (window.updateCursorHovers) window.updateCursorHovers();

        }, 400);
    });


    // --- 12. KANBAN BOARD SYSTEM DRAG & DROP (Bài 4) ---
    const kCards = document.querySelectorAll('.k-card');
    const kCols = document.querySelectorAll('.kanban-cards-list');
    
    kCards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
            e.dataTransfer.setData('text/plain', card.id);
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
    });

    kCols.forEach(col => {
        col.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingCard = document.querySelector('.k-card.dragging');
            col.closest('.kanban-col').classList.add('drag-over');
            
            // Optional: Insert card before current elements on fly
            const afterElement = getDragAfterElement(col, e.clientY);
            if (afterElement == null) {
                col.appendChild(draggingCard);
            } else {
                col.insertBefore(draggingCard, afterElement);
            }
        });

        col.addEventListener('dragleave', () => {
            col.closest('.kanban-col').classList.remove('drag-over');
        });

        col.addEventListener('drop', (e) => {
            e.preventDefault();
            col.closest('.kanban-col').classList.remove('drag-over');
            const cardId = e.dataTransfer.getData('text/plain');
            const card = document.getElementById(cardId);
            if (card) {
                col.appendChild(card);
            }
        });
    });

    // Helper function to calculate closest element position when dragging
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.k-card:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }


    // --- 13. GALLERY FILTER, SEARCH & LIGHTBOX (Bài 5) ---
    const galleryData = [
        { id: 1, title: 'Bản vẽ Wireframe Portfolio', category: 'design', svgType: 'ui_wireframe', desc: 'Bản phác thảo UX/UI giao diện Journey Roadmap.' },
        { id: 2, title: 'Infographic Đánh giá CRAAP', category: 'content', svgType: 'craap_scale', desc: 'Thiết kế trực quan hóa 5 tiêu chí CRAAP đánh giá tin học thuật.' },
        { id: 3, title: 'Sơ đồ Git Flow Phối Hợp', category: 'design', svgType: 'git_flow', desc: 'Sơ đồ phân nhánh GitHub cho dự án phát triển nhóm.' },
        { id: 4, title: 'Mô hình phễu chuyển đổi nội dung', category: 'content', svgType: 'conversion_funnel', desc: 'Bố cục hình phễu truyền tải nội dung số tiếp cận sinh viên.' },
        { id: 5, title: 'Sơ đồ Lớp mạng Nơ-ron AI', category: 'design', svgType: 'neural_network', desc: 'Minh họa mạng nơ-ron học sâu nhiều lớp.' },
        { id: 6, title: 'Infographic 7 Nguyên tắc AI', category: 'content', svgType: 'cc_license', desc: 'Thiết kế biểu đồ các nguyên tắc đạo đức AI.' }
    ];

    const galleryGrid = document.getElementById('creative-gallery');
    const gallerySearchInput = document.getElementById('gallery-search');
    const filterBtns = document.querySelectorAll('.filter-btn');

    function renderGallery(cat = 'all', query = '') {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';
        
        const filtered = galleryData.filter(item => {
            const matchesCat = cat === 'all' || item.category === cat;
            const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase());
            return matchesCat && matchesQuery;
        });

        if (filtered.length === 0) {
            galleryGrid.innerHTML = '<p class="placeholder-text" style="grid-column: 1/-1;">Không tìm thấy tác phẩm phù hợp!</p>';
            return;
        }

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'gallery-card';
            card.innerHTML = `
                <div class="gallery-visual-wrap">
                    ${svgDatabase[item.svgType]}
                </div>
                <div class="gallery-card-info">
                    <h5>${item.title}</h5>
                    <span>${item.category === 'design' ? 'Thiết kế UI' : 'Ấn phẩm'}</span>
                </div>
            `;
            
            // Lightbox Event
            card.addEventListener('click', () => {
                openLightbox(item.svgType, `${item.title} - ${item.desc}`);
            });

            galleryGrid.appendChild(card);
        });
        
        if (window.updateCursorHovers) window.updateCursorHovers();
    }

    // Initial render
    renderGallery();

    // Search events
    gallerySearchInput.addEventListener('input', (e) => {
        const activeCatBtn = document.querySelector('.filter-btn.active');
        const activeCat = activeCatBtn ? activeCatBtn.getAttribute('data-cat') : 'all';
        renderGallery(activeCat, e.target.value);
    });

    // Filter events
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.getAttribute('data-cat');
            renderGallery(cat, gallerySearchInput.value);
        });
    });


    // --- 14. SKILL RADAR & PROGRESS BARS ANIMATION ---
    let skillsAnimated = false;
    function startSkillProgress() {
        if (skillsAnimated) return;
        skillsAnimated = true;
        
        // Progress fills animation
        const fills = document.querySelectorAll('.skill-progress-fill');
        fills.forEach(fill => {
            const width = fill.getAttribute('data-width');
            fill.style.width = width;
        });
    }


    // --- 15. PDF DOCUMENT CENTER & MODAL VIEWER SYSTEM ---
    const mockPDFs = [
        { id: 1, title: 'Bài tập 1: Máy tính và thiết bị ngoại vi', path: 'Baitap/Bai1/bai1.pdf', date: '10/05/2026', desc: 'Khảo sát cấu trúc CPU, RAM, ổ cứng và các thiết bị ngoại vi, vẽ sơ đồ tổng quan hệ thống máy tính.' },
        { id: 2, title: 'Bài tập 2: Khai thác dữ liệu và thông tin', path: 'Baitap/Bai2/bai2.pdf', date: '15/05/2026', desc: 'Ứng dụng cú pháp toán tử tìm kiếm nâng cao trên Google Scholar để chọn lọc và đánh giá CRAAP.' },
        { id: 3, title: 'Bài tập 3: Tổng quan về trí tuệ nhân tạo', path: 'Baitap/Bai3/bai3.pdf', date: '20/05/2026', desc: 'Tìm hiểu tổng quan lịch sử phát triển AI, các nhánh học máy, học sâu và viết báo cáo phân tích.' },
        { id: 4, title: 'Bài tập 4: Giao tiếp & hợp tác môi trường số', path: 'Baitap/Bai4/bai4.pdf', date: '25/05/2026', desc: 'Đặc tả quy trình làm việc nhóm, xây dựng kênh Discord, Notion wiki và quản lý tiến độ bằng Kanban.' },
        { id: 5, title: 'Bài tập 5: Sáng tạo nội dung số', path: 'Baitap/Bai5/bai5.pdf', date: '30/05/2026', desc: 'Sáng tạo tài liệu slide báo cáo kỹ thuật học thuật, áp dụng quy tắc trực quan và thiết kế đồ họa.' },
        { id: 6, title: 'Bài tập 6: An toàn & liêm chính học thuật', path: 'Baitap/Bai6/bai6.pdf', date: '05/06/2026', desc: 'Phân tích tình huống thực tế về an toàn dữ liệu, chống đạo văn và áp dụng 7 nguyên tắc đạo đức AI.' }
    ];

    const docLibraryContainer = document.getElementById('document-library-container');

    function loadDocumentLibrary() {
        if (!docLibraryContainer) return;
        docLibraryContainer.innerHTML = '';

        mockPDFs.forEach(pdf => {
            const card = document.createElement('div');
            card.className = 'doc-card card reveal-up';
            card.innerHTML = `
                <div class="doc-card-thumb">
                    📄
                </div>
                <div class="doc-card-body">
                    <h4>${pdf.title}</h4>
                    <p class="text-sm text-sub">${pdf.desc}</p>
                    <div class="doc-card-meta">
                        <span>Cập nhật: ${pdf.date}</span>
                        <span>PDF Document</span>
                    </div>
                </div>
                <div class="doc-card-actions">
                    <button class="doc-card-btn view-pdf-direct" data-path="${pdf.path}" data-title="${pdf.title}">Xem trực tiếp</button>
                    <a class="doc-card-btn" href="${pdf.path}" download>Tải xuống</a>
                </div>
            `;
            docLibraryContainer.appendChild(card);
        });

        // Hook click events
        document.querySelectorAll('.view-pdf-direct').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const path = btn.getAttribute('data-path');
                const title = btn.getAttribute('data-title');
                openPDFViewer(path, title);
            });
        });
        
        // Also hook timeline view buttons
        document.querySelectorAll('.open-pdf-view').forEach(btn => {
            btn.addEventListener('click', () => {
                const path = btn.getAttribute('data-path');
                const title = btn.getAttribute('data-title');
                openPDFViewer(path, title);
            });
        });

        if (window.updateCursorHovers) window.updateCursorHovers();
    }

    loadDocumentLibrary();

    // PDF Viewer Modal elements
    const pdfModal = document.getElementById('pdf-modal');
    const pdfTitle = document.getElementById('modal-pdf-title');
    const pdfViewerContent = document.getElementById('pdf-viewer-content');
    const pdfDownloadLink = document.getElementById('pdf-download-link');
    const closePdfBtns = document.querySelectorAll('[data-close="pdf"]');
    
    // PDF Viewer Toolbar state
    let pdfScale = 100;

    function openPDFViewer(path, title) {
        pdfTitle.textContent = title;
        pdfDownloadLink.setAttribute('href', path);
        
        // Cập nhật link mở tab mới
        const openTabLink = document.getElementById('pdf-open-tab');
        if (openTabLink) {
            openTabLink.setAttribute('href', path);
        }
        
        pdfScale = 100;
        
        // Sử dụng iframe thay vì object để tương thích tốt nhất trên mọi trình duyệt
        pdfViewerContent.innerHTML = `
            <iframe id="pdf-iframe-tag" src="${path}" width="100%" height="100%" style="border: none; transform: scale(1.0); transform-origin: top center; transition: transform 0.2s;"></iframe>
        `;

        pdfModal.classList.add('active');
        pdfModal.setAttribute('aria-hidden', 'false');
    }

    function closePDFViewer() {
        pdfModal.classList.remove('active');
        pdfModal.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
            pdfViewerContent.innerHTML = '';
        }, 300);
    }

    closePdfBtns.forEach(btn => {
        btn.addEventListener('click', closePDFViewer);
    });

    // PDF Toolbar actions (Zoom In, Zoom Out, Fullscreen)
    document.getElementById('pdf-zoom-in').addEventListener('click', () => {
        const obj = document.getElementById('pdf-iframe-tag');
        if (obj && pdfScale < 200) {
            pdfScale += 20;
            obj.style.transform = `scale(${pdfScale / 100})`;
            obj.style.height = `${100 * (100 / pdfScale)}%`;
            obj.style.width = `${100 * (100 / pdfScale)}%`;
        }
    });

    document.getElementById('pdf-zoom-out').addEventListener('click', () => {
        const obj = document.getElementById('pdf-iframe-tag');
        if (obj && pdfScale > 60) {
            pdfScale -= 20;
            obj.style.transform = `scale(${pdfScale / 100})`;
            obj.style.height = `${100 * (100 / pdfScale)}%`;
            obj.style.width = `${100 * (100 / pdfScale)}%`;
        }
    });

    document.getElementById('pdf-fullscreen').addEventListener('click', () => {
        const obj = document.getElementById('pdf-iframe-tag');
        if (obj) {
            // Check if it has requestFullscreen
            const container = document.querySelector('.modal-body-viewer');
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) { /* Safari */
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) { /* IE11 */
                container.msRequestFullscreen();
            }
        }
    });


    // --- 16. LIGHTBOX SYSTEM ---
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImgBox = lightboxModal.querySelector('.lightbox-img-box');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightboxBtns = document.querySelectorAll('[data-close="lightbox"]');

    function openLightbox(svgKey, captionText) {
        lightboxImgBox.innerHTML = svgDatabase[svgKey];
        lightboxCaption.textContent = captionText;
        
        lightboxModal.classList.add('active');
        lightboxModal.setAttribute('aria-hidden', 'false');
    }

    function closeLightbox() {
        lightboxModal.classList.remove('active');
        lightboxModal.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
            lightboxImgBox.innerHTML = '';
        }, 300);
    }

    closeLightboxBtns.forEach(btn => {
        btn.addEventListener('click', closeLightbox);
    });

});
