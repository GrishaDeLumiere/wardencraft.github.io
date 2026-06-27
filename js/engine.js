document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ЛОГИКА КНОПОК "В РАЗРАБОТКЕ" ---
    const actionButtons = document.querySelectorAll('.action-btn');

    actionButtons.forEach(button => {
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


    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

});