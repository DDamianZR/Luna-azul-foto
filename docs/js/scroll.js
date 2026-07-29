/**
 * CAPA DE MOVIMIENTO Y SCROLL (Lenis + Sticky Contact Sheet + Reveals) — LUNA AZUL FOTO
 */

import Lenis from '../vendor/lenis.mjs';

export function inicializarScroll() {
    let lenis = null;

    try {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            touchMultiplier: 1.5,
            smoothWheel: true
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    } catch (err) {
        console.warn('Lenis no pudo inicializarse, usando scroll nativo:', err);
    }

    // 1. Reveals con IntersectionObserver y Stagger
    const revealElements = document.querySelectorAll('.revelar');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, idx) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('revelado');
                }, idx * 110);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => observer.observe(el));

    // 2. Hoja de Contactos Sticky Translation (Sección 05)
    // Solo en pantallas desktop (pointer fine)
    const stickyContenedor = document.getElementById('hoja-contactos-contenedor');
    const stickyTrack = document.getElementById('hoja-contactos-track');

    if (stickyContenedor && stickyTrack && window.matchMedia('(pointer: fine)').matches) {
        function actualizarTrackSticky() {
            const rect = stickyContenedor.getBoundingClientRect();
            const totalScroll = stickyContenedor.offsetHeight - window.innerHeight;
            if (totalScroll > 0) {
                const progreso = Math.max(0, Math.min(1, -rect.top / totalScroll));
                const maxTranslate = stickyTrack.scrollWidth - window.innerWidth + 80;
                stickyTrack.style.transform = `translateX(${-progreso * maxTranslate}px)`;
            }
            requestAnimationFrame(actualizarTrackSticky);
        }
        requestAnimationFrame(actualizarTrackSticky);
    }

    return lenis;
}
