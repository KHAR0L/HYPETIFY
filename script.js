document.addEventListener('DOMContentLoaded', () => {
    // 1. LÓGICA DE ANIMACIÓN AL HACER SCROLL (Intersection Observer)
    const observerOptions = {
        root: null, // Usa el viewport como raíz
        rootMargin: '0px',
        threshold: 0.1 // El elemento se activa cuando el 10% es visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Si está visible, añade la clase para animar la entrada
                entry.target.classList.add('visible');
                // Deja de observar el elemento, ya ha aparecido
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observa todos los elementos que tienen la clase 'reveal'
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    // 2. FUNCIÓN DE MENÚ HAMBURGUESA MÓVIL
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Cerrar menú al hacer clic en un enlace (en móvil)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        });
    });
});