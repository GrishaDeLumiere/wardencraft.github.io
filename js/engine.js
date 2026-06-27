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
    if(statsSection) statsObserver.observe(statsSection);

    // --- 4. ПАРАЛЛАКС ДЛЯ HERO ---
    const heroSection = document.getElementById('hero');
    const heroContent = document.querySelector('.hero-content');
    if (heroSection && heroContent) {
        document.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
            heroContent.style.transform = `translateY(0px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });
        heroSection.style.perspective = "1000px";
        heroContent.style.transition = "transform 0.1s ease-out";
    }

    // ==========================================
    // UI ENGINE: РЕНДЕР ДАННЫХ ИЗ DATA.JS
    // ==========================================

    // --- 5. ГЕНЕРАЦИЯ ROADMAP ---
    const roadmapContainer = document.getElementById('roadmap-container');
    if (typeof WARDENCRAFT_ROADMAP !== 'undefined' && roadmapContainer) {
        WARDENCRAFT_ROADMAP.forEach((item, index) => {
            const el = document.createElement('div');
            el.className = `timeline-item reveal ${item.status}`;
            el.style.transitionDelay = `${index * 0.1}s`;
            el.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <h3>${item.phase}</h3>
                    <p>${item.desc}</p>
                </div>
            `;
            roadmapContainer.appendChild(el);
        });
    }

    // --- 6. ГЕНЕРАЦИЯ НОВОСТЕЙ ---
    const newsContainer = document.getElementById('news-grid-container');
    if (typeof WARDENCRAFT_NEWS !== 'undefined' && newsContainer) {
        WARDENCRAFT_NEWS.forEach((newsItem, index) => {
            const card = document.createElement('div');
            card.className = 'news-card reveal';
            card.style.transitionDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <div class="news-img" style="background-image: url('${newsItem.image}');"></div>
                <div class="news-content">
                    <span class="news-date">${newsItem.tag}</span>
                    <h3>${newsItem.title}</h3>
                    <p>${newsItem.shortDesc}</p>
                    <button class="read-more-btn" data-id="${newsItem.id}">ЧИТАТЬ ДАЛЕЕ</button>
                </div>
            `;
            newsContainer.appendChild(card);
        });
    }

    // --- Запускаем анимацию для сгенерированных элементов ---
    observeElements();

    // --- 7. ЛОГИКА МОДАЛЬНОГО ОКНА (ЧИТАЛКИ) ---
    const articleModal = document.getElementById('article-modal');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    const closeModalBtn = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalTag = document.getElementById('modal-tag');
    const modalBody = document.getElementById('modal-body');

    if (newsContainer) {
        newsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('read-more-btn')) {
                const targetId = e.target.getAttribute('data-id');
                const articleData = WARDENCRAFT_NEWS.find(item => item.id === targetId);

                if (articleData) {
                    modalTitle.innerText = articleData.title;
                    modalTag.innerText = articleData.tag;
                    modalBody.innerHTML = articleData.content;
                    articleModal.classList.add('active');
                    document.body.style.overflow = 'hidden'; 
                }
            }
        });
    }

    const closeModal = () => {
        articleModal.classList.remove('active');
        document.body.style.overflow = ''; 
        setTimeout(() => modalBody.innerHTML = '', 400); 
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && articleModal.classList.contains('active')) closeModal();
    });

});