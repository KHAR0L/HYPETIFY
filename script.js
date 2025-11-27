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
                entry.target.classList.add('visible');
                // Dejamos de observar elementos que no son el carrusel
                if (!entry.target.classList.contains('carousel-container')) {
                    observer.unobserve(entry.target);
                }
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


    // ===============================================
    // 3. LÓGICA DEL CARRUSEL INFINITO, CENTRADO Y AUTOPLAY
    // ===============================================
    const carouselTrack = document.querySelector('.carousel-track');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    
    // Obtener los items originales
    const originalItems = Array.from(carouselTrack.querySelectorAll('.carousel-item:not(.clone-start):not(.clone-end)'));
    
    if (originalItems.length === 0) return; 

    const originalLength = originalItems.length;
    const cloneCount = originalLength; // Cantidad de clones a cada lado
    
    let currentIndex; // El índice activo actual (empezará en el primer original)

    const AUTO_PLAY_TIME = 3000; // Tiempo normal: 3 segundos
    const USER_CLICK_TIME = AUTO_PLAY_TIME * 2; // Tiempo duplicado: 6 segundos
    let autoPlayTimer;
    let autoPlayInterval = AUTO_PLAY_TIME;

    /**
     * Clona los elementos para crear la ilusión de infinito.
     */
    function setupClones() {
        // Clonar al final
        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            clone.classList.add('clone-end');
            carouselTrack.appendChild(clone);
        });
        // Clonar al inicio (usando prepend para que aparezcan al principio del track)
        for (let i = originalLength - 1; i >= 0; i--) {
            const clone = originalItems[i].cloneNode(true);
            clone.classList.add('clone-start');
            carouselTrack.prepend(clone);
        }
    }
    setupClones();

    // Obtener la lista completa de ítems (originales + clones)
    const allItems = Array.from(carouselTrack.querySelectorAll('.carousel-item'));
    const allItemsLength = allItems.length;

    /**
     * Calcula el ancho de un solo item (incluyendo padding).
     */
    function getItemFullWidth() {
        // allItems[cloneCount] es un item original que debe tener el tamaño correcto.
        if (allItems.length > cloneCount) {
             return allItems[cloneCount].offsetWidth;
        }
        return 0;
    }

    /**
     * Mueve el carrusel a un índice específico.
     * @param {number} index El índice del elemento en allItems que debe centrarse.
     * @param {boolean} smooth Indica si el movimiento debe tener transición.
     */
    function moveToSlide(index, smooth = true) {
        if (index < 0 || index >= allItemsLength) return;

        const itemFullWidth = getItemFullWidth();
        
        if (smooth) {
            carouselTrack.style.transition = `transform 0.5s ease-in-out`;
        } else {
            carouselTrack.style.transition = 'none';
        }
        
        currentIndex = index;
        
        // El offset se calcula para centrar el elemento. 
        // Desplazamiento = (Índice - 1) * Ancho del ítem
        const offset = (currentIndex - 1) * itemFullWidth; 
        carouselTrack.style.transform = `translateX(${-offset}px)`;

        // Marcar la tarjeta central como activa
        allItems.forEach((item, i) => {
            item.classList.remove('active');
        });

        // La tarjeta central es la que tiene el currentIndex.
        allItems[currentIndex].classList.add('active');
    }

    /**
     * Lógica para el bucle infinito después de la transición.
     */
    function checkInfinityLoop() {
        if (currentIndex >= originalLength + originalLength) {
            // Si pasamos el último clon del final, saltamos al primer original (sin transición)
            currentIndex = originalLength;
            moveToSlide(currentIndex, false);
        } else if (currentIndex < originalLength) {
            // Si pasamos el primer clon del inicio, saltamos al último original (sin transición)
            currentIndex = originalLength + originalLength - 1;
            moveToSlide(currentIndex, false);
        }
    }

    /**
     * Inicia o reinicia el autoplay con el intervalo actual.
     */
    function startAutoPlay() {
        clearInterval(autoPlayTimer);
        autoPlayTimer = setInterval(() => {
            // Mover a la siguiente diapositiva
            moveToSlide(currentIndex + 1);
            
            // Si el intervalo fue duplicado (por click), resetearlo después de la primera ejecución
            if (autoPlayInterval === USER_CLICK_TIME) {
                autoPlayInterval = AUTO_PLAY_TIME;
                startAutoPlay(); // Reinicia el timer con el tiempo normal
            }
        }, autoPlayInterval);
    }
    
    // 4. INICIALIZACIÓN Y EVENTOS

    // Asignar el listener para el bucle
    carouselTrack.addEventListener('transitionend', checkInfinityLoop);


    // Inicializar la posición al primer elemento original (índice 3 en un set de 8 clones)
    currentIndex = cloneCount;
    moveToSlide(currentIndex, false); 
    startAutoPlay(); // Iniciar el autoplay al cargar

    // Eventos de Navegación (Botones)
    prevButton.addEventListener('click', () => {
        moveToSlide(currentIndex - 1);
        
        // Resetear y duplicar el tiempo de autoplay
        autoPlayInterval = USER_CLICK_TIME;
        startAutoPlay();
    });

    nextButton.addEventListener('click', () => {
        moveToSlide(currentIndex + 1);

        // Resetear y duplicar el tiempo de autoplay
        autoPlayInterval = USER_CLICK_TIME;
        startAutoPlay();
    });

    // Eventos de Click en las Tarjetas
    allItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            // Mover a la tarjeta clickeada (su índice absoluto)
            moveToSlide(index);
            
            // Resetear y duplicar el tiempo de autoplay
            autoPlayInterval = USER_CLICK_TIME;
            startAutoPlay();
        });
    });

    // Ajuste de Responsive 
    window.addEventListener('resize', () => {
        // Reposicionar sin transición para mantener la vista correcta
        moveToSlide(currentIndex, false); 
    });


    // ===============================================
    // 5. LÓGICA DE MENSAJE PERSONALIZADO DE WHATSAPP
    // ===============================================
    const whatsappNumber = '523327823578'; // NÚMERO DE WHATSAPP ACTUALIZADO
    
    document.querySelectorAll('.cotizar-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Detener la navegación por defecto (el href="#")

            const paquete = button.getAttribute('data-paquete');
            const detalles = button.getAttribute('data-detalles');
            
            const mensaje = `Hola, estoy interesado en el paquete "${paquete}" que incluye: ${detalles}. Me gustaría cotizar este servicio.`;
            
            // Codificar el mensaje para la URL
            const mensajeCodificado = encodeURIComponent(mensaje);

            // Construir la URL de WhatsApp
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${mensajeCodificado}`;
            
            // Redirigir al usuario
            window.open(whatsappURL, '_blank');
        });
    });

    // Opcional: Agregar la misma lógica al CTA principal (general)
    document.querySelector('.contact-whatsapp-cta').addEventListener('click', (e) => {
         e.preventDefault();
         const mensajeGeneral = encodeURIComponent("Hola, estoy interesado en sus Paquetes Modulares HYPETIFY y me gustaría iniciar una cotización general.");
         const whatsappURLGeneral = `https://wa.me/${whatsappNumber}?text=${mensajeGeneral}`;
         window.open(whatsappURLGeneral, '_blank');
    });

});