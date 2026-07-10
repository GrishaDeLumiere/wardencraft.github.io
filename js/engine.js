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

    // --- 2. ЛОГИКА КНОПКИ "ПРИСОЕДИНИТЬСЯ К ЗБТ" ---
    document.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();

            // Скроллим к CTA-секции с соцсетями
            const ctaSection = document.getElementById('cta-section');
            if (ctaSection) {
                ctaSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });

                // Подсвечиваем кнопки соцсетей
                const socialBtns = ctaSection.querySelectorAll('.cta-social-btn');
                socialBtns.forEach(btn => {
                    btn.style.transform = 'scale(1.1)';
                    btn.style.boxShadow = '0 0 30px rgba(255, 51, 51, 0.6)';
                    setTimeout(() => {
                        btn.style.transform = '';
                        btn.style.boxShadow = '';
                    }, 1500);
                });
            }
        });
    });

    // --- 3. СЧЕТЧИКИ FPS (VULKAN) С ПОДДЕРЖКОЙ ФЛОАТОВ ---
    const counters = document.querySelectorAll('.counter');
    let hasAnimated = false;
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                counters.forEach(counter => {
                    const targetStr = counter.getAttribute('data-target');
                    const target = parseFloat(targetStr);
                    // Детектим, нужно ли нам десятичное чило (например 2.9)
                    const isFloat = targetStr.includes('.') || target % 1 !== 0;
                    const duration = 2000; // 2 секунды
                    let startTime = null;

                    const updateCounter = (currentTime) => {
                        if (!startTime) startTime = currentTime;
                        const elapsed = currentTime - startTime;
                        let progress = Math.min(elapsed / duration, 1);

                        // Easing функция (easeOutExpo) для AAA-плавности (тормозит под конец)
                        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                        const current = easeProgress * target;

                        if (isFloat) {
                            counter.innerText = current.toFixed(1); // Рендерит 0.5, 1.2, 2.9
                        } else {
                            counter.innerText = Math.floor(current); // Рендерит 1500, 3000
                        }

                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            // Финальное запечатывание значения
                            counter.innerText = isFloat ? target.toFixed(1) : target;
                        }
                    };
                    requestAnimationFrame(updateCounter);
                });
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats-wrapper');
    if (statsSection) statsObserver.observe(statsSection);

    // --- 4. ПАРАЛЛАКС ДЛЯ HERO ---
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
                    modalBody.innerHTML = articleData.content;
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


    // --- 11. ZOOM ФОТОГРАФИЙ В МОДАЛКЕ ---
    const initImageZoom = () => {
        const modalBody = document.getElementById('modal-body');
        if (!modalBody) return;

        const zoomOverlay = document.createElement('div');
        zoomOverlay.className = 'image-zoom-overlay';
        zoomOverlay.innerHTML = `
        <div class="zoom-close-btn">
            <i class="fas fa-times"></i>
        </div>
        <img src="" alt="Zoomed Image" class="zoomed-image">
        <div class="zoom-counter">1/1</div>
    `;
        document.body.appendChild(zoomOverlay);

        const zoomedImg = zoomOverlay.querySelector('.zoomed-image');
        const zoomCloseBtn = zoomOverlay.querySelector('.zoom-close-btn');
        const zoomCounter = zoomOverlay.querySelector('.zoom-counter');

        let currentImageIndex = 0;
        let allImages = [];
        let isZoomed = false;
        let scale = 1;
        let isDragging = false;
        let startX, startY, translateX = 0, translateY = 0;

        const closeZoom = () => {
            zoomOverlay.classList.remove('active');
            document.body.style.overflow = '';
            isZoomed = false;
            scale = 1;
            translateX = 0;
            translateY = 0;
            zoomedImg.style.transform = `scale(1) translate(0px, 0px)`;
            zoomedImg.style.cursor = 'zoom-in';
        };

        zoomCloseBtn.addEventListener('click', closeZoom);
        zoomOverlay.addEventListener('click', (e) => {
            if (e.target === zoomOverlay) closeZoom();
        });

        modalBody.addEventListener('click', (e) => {
            const img = e.target.closest('.news-image');
            if (!img) return;

            allImages = Array.from(modalBody.querySelectorAll('.news-image'));
            currentImageIndex = allImages.indexOf(img);

            zoomedImg.src = img.src;
            zoomedImg.alt = img.alt || '';
            zoomCounter.textContent = `${currentImageIndex + 1}/${allImages.length}`;

            zoomOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            isZoomed = true;
        });

        const navigateImage = (direction) => {
            if (allImages.length <= 1) return;

            currentImageIndex = (currentImageIndex + direction + allImages.length) % allImages.length;
            zoomedImg.src = allImages[currentImageIndex].src;
            zoomedImg.alt = allImages[currentImageIndex].alt || '';
            zoomCounter.textContent = `${currentImageIndex + 1}/${allImages.length}`;

            // Сброс зума при переключении
            scale = 1;
            translateX = 0;
            translateY = 0;
            zoomedImg.style.transform = `scale(1) translate(0px, 0px)`;
        };

        document.addEventListener('keydown', (e) => {
            if (!isZoomed) return;

            if (e.key === 'ArrowLeft') navigateImage(-1);
            if (e.key === 'ArrowRight') navigateImage(1);
            if (e.key === 'Escape') closeZoom();
        });

        let touchStartX = 0;
        let touchStartY = 0;

        zoomedImg.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1 && scale === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        });

        zoomedImg.addEventListener('touchend', (e) => {
            if (scale > 1) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;

            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                navigateImage(diffX > 0 ? 1 : -1);
            }
        });

        zoomedImg.addEventListener('wheel', (e) => {
            if (!isZoomed) return;
            e.preventDefault();

            const delta = e.deltaY > 0 ? -0.2 : 0.2;
            scale = Math.min(Math.max(1, scale + delta), 5);

            zoomedImg.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
            zoomedImg.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
        });

        zoomedImg.addEventListener('click', (e) => {
            e.stopPropagation();

            if (scale > 1) {
                scale = 1;
                translateX = 0;
                translateY = 0;
                zoomedImg.style.transform = `scale(1) translate(0px, 0px)`;
                zoomedImg.style.cursor = 'zoom-in';
            } else {
                scale = 2;
                zoomedImg.style.transform = `scale(2)`;
                zoomedImg.style.cursor = 'grab';
            }
        });

        zoomedImg.addEventListener('mousedown', (e) => {
            if (scale <= 1) return;
            e.preventDefault();

            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            zoomedImg.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            zoomedImg.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            if (zoomOverlay.classList.contains('active')) {
                zoomedImg.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImageZoom);
    } else {
        initImageZoom();
    }

});

window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById('scroll-progress').style.width = scrolled + "%";
});