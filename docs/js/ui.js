/**
 * UI CONTROLLER (Preloader, Header, Reloj CDMX, Count-Up, Formulario) — LUNA AZUL FOTO
 */

export function inicializarUI() {
    // 1. PRELOADER (Sección 01)
    const preloader = document.getElementById('preloader');
    const contador = document.getElementById('preloader-contador');
    const barra = document.getElementById('preloader-progreso');

    let progreso = 0;
    const startTime = performance.now();

    const intervalId = setInterval(() => {
        progreso += Math.floor(Math.random() * 8) + 4;
        if (progreso > 36) progreso = 36;

        if (contador) contador.textContent = String(progreso).padStart(2, '0');
        if (barra) barra.style.width = `${(progreso / 36) * 100}%`;

        const elapsed = performance.now() - startTime;
        if (progreso >= 36 && elapsed >= 700) {
            clearInterval(intervalId);
            setTimeout(() => {
                if (preloader) preloader.classList.add('oculto');
            }, 200);
        }
    }, 60);

    // Hard timeout 2.5 s
    setTimeout(() => {
        clearInterval(intervalId);
        if (preloader) preloader.classList.add('oculto');
    }, 2500);

    // 2. HEADER FIJO EN SCROLL
    const header = document.getElementById('header-sitio');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    }, { passive: true });

    // 3. RELOJ EN VIVO DE CDMX (Sección 11)
    const relojElem = document.getElementById('reloj-cdmx');
    function actualizarRelojCDMX() {
        if (!relojElem) return;
        const ahora = new Date();
        const formato = new Intl.DateTimeFormat('es-MX', {
            timeZone: 'America/Mexico_City',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        relojElem.textContent = `${formato.format(ahora)} CDMX`;
    }
    actualizarRelojCDMX();
    setInterval(actualizarRelojCDMX, 1000);

    // 4. COUNT-UP ESTADÍSTICAS EL ESTUDIO (Sección 07)
    const statCeldas = document.querySelectorAll('.stat-celda');
    const observerStats = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target.querySelector('.stat-numero');
                if (target) {
                    const finalVal = parseFloat(target.getAttribute('data-val'));
                    const isDecimal = target.getAttribute('data-val').includes('.');
                    const duration = 1500;
                    const start = performance.now();

                    function updateCount(now) {
                        const elapsed = now - start;
                        const progress = Math.min(1, elapsed / duration);
                        // easeOutCubic
                        const easeProgress = 1 - Math.pow(1 - progress, 3);
                        const current = finalVal * easeProgress;
                        
                        target.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
                        if (progress < 1) {
                            requestAnimationFrame(updateCount);
                        } else {
                            target.textContent = isDecimal ? finalVal.toFixed(1) : finalVal;
                        }
                    }
                    requestAnimationFrame(updateCount);
                }
                observerStats.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    statCeldas.forEach(celda => observerStats.observe(celda));

    // 5. FORMULARIO DE RESERVA (Sección 10)
    const form = document.getElementById('form-reserva');
    const formEstado = document.getElementById('form-estado');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = form.querySelector('[name="nombre"]').value.trim();
            const email = form.querySelector('[name="email"]').value.trim();
            const sesion = form.querySelector('[name="sesion"]').value;
            const mensaje = form.querySelector('[name="mensaje"]').value.trim();

            if (!nombre || !email) {
                if (formEstado) {
                    formEstado.textContent = 'ERROR: Favor de ingresar tu nombre y correo.';
                    formEstado.style.color = '#d9534f';
                }
                return;
            }

            if (formEstado) {
                formEstado.textContent = 'ENVIANDO...';
                formEstado.style.color = 'var(--luna)';
            }

            setTimeout(() => {
                const mailtoUrl = `mailto:hola@lunaazulfoto.mx?subject=${encodeURIComponent('Reserva de Sesión: ' + sesion)}&body=${encodeURIComponent(`Nombre: ${nombre}\nEmail: ${email}\nTipo: ${sesion}\n\nMensaje:\n${mensaje}`)}`;
                window.location.href = mailtoUrl;

                if (formEstado) {
                    formEstado.textContent = 'ÉXITO: Se ha abierto tu cliente de correo para enviar la solicitud.';
                    formEstado.style.color = 'var(--laton)';
                }
                form.reset();
            }, 600);
        });
    }
}
