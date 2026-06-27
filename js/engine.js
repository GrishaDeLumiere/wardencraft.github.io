document.addEventListener('DOMContentLoaded', () => {

    // --- 1. АНИМАЦИИ ПОЯВЛЕНИЯ (REVEAL) ---
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    const observeElements = () => {
        document.querySelectorAll('.reveal:not(.active)').forEach(el => revealOnScroll.observe(el));
    };

    // --- 2. ЛОГИКА КНОПОК "В РАЗРАБОТКЕ" ---
    document.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const container = button.closest('.action-container');
            const errorSpan = container.querySelector('.error-span');
            errorSpan.textContent = 'ОШИБКА: ПРОЕКТ В РАЗРАБОТКЕ!';
            errorSpan.style.opacity = '1';
            container.classList.remove('shake');
            void container.offsetWidth;
            container.classList.add('shake');
            button.style.borderColor = '#ff3333';
            button.style.color = '#ff3333';
            setTimeout(() => {
                errorSpan.style.opacity = '0';
                button.style.borderColor = '';
                button.style.color = '';
            }, 2500);
        });
    });

    // --- 3. СЧЕТЧИКИ FPS (VULKAN) ---
    const counters = document.querySelectorAll('.counter');
    let hasAnimated = false;
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000;
                    const step = target / (duration / 16);
                    let current = 0;
                    const updateCounter = () => {
                        current += step;
                        if (current < target) {
                            counter.innerText = Math.ceil(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    updateCounter();
                });
            }
        });
    }, { threshold: 0.5 });
    const statsSection = document.querySelector('.stats-wrapper');
    if (statsSection) statsObserver.observe(statsSection);

    // --- 4. ПАРАЛЛАКС ДЛЯ HERO v---
    const heroSection = document.getElementById('hero');
    const heroContent = document.querySelector('.hero-content');
    if (heroSection && heroContent) {
        let isHeroVisible = true;
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isHeroVisible = entry.isIntersecting;
                if (!isHeroVisible) {
                    heroContent.style.transform = 'translateY(0px) rotateY(0deg) rotateX(0deg)';
                }
            });
        }, {
            threshold: 0.1
        });
        heroObserver.observe(heroSection);
        document.addEventListener('mousemove', (e) => {
            if (!isHeroVisible) return;

            const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
            heroContent.style.transform = `translateY(0px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });
        heroSection.style.perspective = "1000px";
        heroContent.style.transition = "transform 0.1s ease-out";
        heroSection.addEventListener('mouseleave', () => {
            heroContent.style.transform = 'translateY(0px) rotateY(0deg) rotateX(0deg)';
        });
        heroSection.addEventListener('mouseenter', () => {
            heroContent.style.transition = "transform 0.3s ease-out";
        });
    }

    // ==========================================
    // UI ENGINE: РЕНДЕР ДАННЫХ ИЗ DATA.JS
    // ==========================================

    // --- 5. ГЕНЕРАЦИЯ ROADMAP С ПРОГРЕССОМ ---
    const roadmapContainer = document.getElementById('roadmap-container');
    if (typeof WARDENCRAFT_ROADMAP !== 'undefined' && roadmapContainer) {
        WARDENCRAFT_ROADMAP.forEach((item, index) => {
            const el = document.createElement('div');
            el.className = `timeline-item reveal ${item.status}`;
            el.style.transitionDelay = `${index * 0.1}s`;
            let statusText = '';
            switch (item.status) {
                case 'completed':
                    statusText = 'ЗАВЕРШЕНО';
                    break;
                case 'active':
                    statusText = 'В РАЗРАБОТКЕ';
                    break;
                case 'pending':
                    statusText = 'ОЖИДАЕТ';
                    break;
            }

            el.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <h3>${item.phase}</h3>
                <p>${item.desc}</p>
                <div class="progress-container">
                    <div class="progress-info">
                        <span class="progress-label">${statusText}</span>
                        <span class="progress-percentage" data-target="${item.progress}">0%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" data-progress="${item.progress}"></div>
                    </div>
                </div>
            </div>
        `;

            roadmapContainer.appendChild(el);
        });

        function animateProgressBars() {
            const progressFills = document.querySelectorAll('.progress-fill');
            const progressPercentages = document.querySelectorAll('.progress-percentage');

            progressFills.forEach((fill, index) => {
                const targetProgress = fill.getAttribute('data-progress');
                const percentageEl = progressPercentages[index];
                const targetPercent = percentageEl ? percentageEl.getAttribute('data-target') : targetProgress;

                if (fill.style.width === '' || fill.style.width === '0px') {
                    setTimeout(() => {
                        fill.style.width = targetProgress + '%';

                        // Анимация чисел
                        if (percentageEl && targetPercent > 0) {
                            animateNumber(percentageEl, 0, parseInt(targetPercent), 1500);
                        }
                    }, 300 + (index * 200));
                }
            });
        }

        function animateNumber(element, start, end, duration) {
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Используем easeOutQuad для плавности
                const eased = 1 - (1 - progress) * (1 - progress);
                const current = Math.floor(start + (end - start) * eased);

                element.textContent = current + '%';

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }

            requestAnimationFrame(update);
        }
        const roadmapObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateProgressBars();
                    roadmapObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: "0px 0px -50px 0px"
        });

        roadmapObserver.observe(roadmapContainer);
    }

    // --- 6. ГЕНЕРАЦИЯ НОВОСТЕЙ С ПАГИНАЦИЕЙ ---
    const newsContainer = document.getElementById('news-grid-container');
    const ITEMS_PER_PAGE = 3;
    let currentPage = 1;
    let allNewsCards = [];

    if (typeof WARDENCRAFT_NEWS !== 'undefined' && newsContainer) {
        WARDENCRAFT_NEWS.forEach((newsItem, index) => {
            const card = document.createElement('div');
            card.className = 'news-card reveal';
            card.style.transitionDelay = `${(index % ITEMS_PER_PAGE) * 0.1}s`;

            if (index >= ITEMS_PER_PAGE) {
                card.style.display = 'none';
            }

            let dateFormatted = '';
            if (newsItem.date) {
                const d = new Date(newsItem.date);
                dateFormatted = d.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }).toUpperCase();
            }

            card.innerHTML = `
            <div class="news-img" style="background-image: url('${newsItem.image}');"></div>
            <div class="news-content">
                <span class="news-date">${dateFormatted} — ${newsItem.tag}</span>
                <h3>${newsItem.title}</h3>
                <p>${newsItem.shortDesc}</p>
                <button class="read-more-btn" data-id="${newsItem.id}">ЧИТАТЬ ДАЛЕЕ</button>
            </div>
        `;

            newsContainer.appendChild(card);
            allNewsCards.push(card);
        });

        if (WARDENCRAFT_NEWS.length > ITEMS_PER_PAGE) {
            const paginationDiv = document.createElement('div');
            paginationDiv.className = 'news-pagination';
            paginationDiv.innerHTML = `
            <button class="load-more-btn" id="load-more-btn">
                <span>ЗАГРУЗИТЬ ЕЩЁ</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <span class="news-counter">
                <span id="shown-count">3</span> / ${WARDENCRAFT_NEWS.length}
            </span>
        `;

            newsContainer.after(paginationDiv);

            setTimeout(() => paginationDiv.classList.add('visible'), 500);

            document.getElementById('load-more-btn').addEventListener('click', function () {
                const start = currentPage * ITEMS_PER_PAGE;
                const end = start + ITEMS_PER_PAGE;

                this.classList.add('loading');

                setTimeout(() => {
                    for (let i = start; i < end && i < allNewsCards.length; i++) {
                        allNewsCards[i].style.display = '';
                    }

                    currentPage++;
                    document.getElementById('shown-count').textContent = Math.min(currentPage * ITEMS_PER_PAGE, WARDENCRAFT_NEWS.length);

                    this.classList.remove('loading');

                    if (currentPage * ITEMS_PER_PAGE >= WARDENCRAFT_NEWS.length) {
                        this.classList.add('disabled');
                        this.querySelector('span').textContent = 'ВСЕ НОВОСТИ ЗАГРУЖЕНЫ';
                    }

                    observeElements();
                }, 500);
            });
        }
    }

    // --- 7. ЛОГИКА МОДАЛЬНОГО ОКНА (ЧИТАЛКИ) ---
    const articleModal = document.getElementById('article-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    const modalTitle = document.getElementById('modal-title');
    const modalTag = document.getElementById('modal-tag');
    const modalBody = document.getElementById('modal-body');
    const closeModal = () => {
        articleModal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            if (modalBody) modalBody.innerHTML = '';
        }, 400);
    };
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeModal);
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && articleModal && articleModal.classList.contains('active')) {
            closeModal();
        }
    });
    if (newsContainer) {
        newsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('read-more-btn')) {
                const targetId = e.target.getAttribute('data-id');
                const articleData = WARDENCRAFT_NEWS.find(item => item.id === targetId);

                if (articleData && articleModal && modalTitle && modalTag && modalBody) {
                    let dateFormatted = '';
                    if (articleData.date) {
                        const d = new Date(articleData.date);
                        dateFormatted = d.toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        }).toUpperCase();
                    }

                    modalTitle.innerText = articleData.title;
                    modalTag.innerText = `${dateFormatted} — ${articleData.tag}`;
                    let fullContent = articleData.content;
                    if (articleData.externalLink || articleData.telegramLink) {
                        fullContent += `
    <div class="modal-social-links">
        ${articleData.externalLink ? `
        <a href="${articleData.externalLink}" target="_blank" class="modal-social-btn vk">
            <i class="fab fa-vk"></i> ЧИТАТЬ В VK
        </a>` : ''}
        ${articleData.telegramLink ? `
        <a href="${articleData.telegramLink}" target="_blank" class="modal-social-btn telegram">
            <i class="fab fa-telegram"></i> ЧИТАТЬ В TELEGRAPH
        </a>` : ''}
    </div>
    `;
                    }

                    modalBody.innerHTML = fullContent;

                    articleModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    }
    observeElements();
});

// ==========================================
// ЛОГИКА АНИМАЦИЙ И ИНИЦИАЛИЗАЦИИ
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // --- 8. БАЗОВЫЙ ПРЕЛОАДЕР ---
    const initSimpleLoader = () => {
        const loaderContainer = document.getElementById('simpleLoadingContainer');
        if (!loaderContainer) return;
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            loaderContainer.style.opacity = '0';
            setTimeout(() => {
                loaderContainer.style.visibility = 'hidden';
                document.body.style.overflow = '';
            }, 600);
        }, 1200);
    };
    initSimpleLoader();

    // --- 9. CANVAS ЧАСТИЦЫ: ПЕПЕЛ (ZERO-ALLOCATION LOOP) ---
    const initCanvasParticles = () => {
        const canvas = document.getElementById('bg-particles');
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const particleCount = 60;
        const particles = Array.from({ length: particleCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 0.5,
            speedY: Math.random() * -1 - 0.5,
            speedX: Math.random() * 1 - 0.5,
            alpha: Math.random() * 0.5 + 0.1
        }));

        const renderLoop = () => {
            ctx.fillStyle = '#080808';
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 80, 0, ${p.alpha})`;
                ctx.fill();

                p.y += p.speedY;
                p.x += p.speedX;

                if (p.y < -10) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }
            }
            requestAnimationFrame(renderLoop);
        };
        requestAnimationFrame(renderLoop);
    };
    initCanvasParticles();

    // --- 10. 3D TILT ЭФФЕКТ ДЛЯ КАРТОЧЕК НОВОСТЕЙ ---
    document.body.addEventListener('mousemove', (e) => {
        const card = e.target.closest('.news-card');
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.transition = 'none';
        card.style.zIndex = '10';
        card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.8)';
    }, { passive: true });

    document.body.addEventListener('mouseout', (e) => {
        const card = e.target.closest('.news-card');
        if (!card) return;

        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        card.style.transition = 'transform 0.4s ease-out, box-shadow 0.4s ease-out';
        card.style.zIndex = '1';
        card.style.boxShadow = '';
    }, { passive: true });

});

window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById('scroll-progress').style.width = scrolled + "%";
});