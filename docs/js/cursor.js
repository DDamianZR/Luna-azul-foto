/**
 * CURSOR PERSONALIZADO DE ENCUADRE Y PREVIEW FLOTANTE — LUNA AZUL FOTO
 */

export function inicializarCursor() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const cursor = document.getElementById('cursor-encuadre');
    const cursorBox = cursor ? cursor.querySelector('.cursor-box') : null;
    const cursorFocal = cursor ? cursor.querySelector('.cursor-focal') : null;
    const previewFlotante = document.getElementById('preview-flotante');
    const previewImg = previewFlotante ? previewFlotante.querySelector('img') : null;

    let mousePos = { x: -100, y: -100 };
    let currentPos = { x: -100, y: -100 };
    let prevX = 0;

    window.addEventListener('mousemove', (e) => {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
        document.body.classList.add('cursor-active');
    });

    // Loop de interpolación lerp (0.12)
    function animarCursor() {
        currentPos.x += (mousePos.x - currentPos.x) * 0.12;
        currentPos.y += (mousePos.y - currentPos.y) * 0.12;

        if (cursor) {
            cursor.style.transform = `translate3d(${currentPos.x}px, ${currentPos.y}px, 0)`;
        }

        if (previewFlotante && previewFlotante.classList.contains('activo')) {
            const velX = (currentPos.x - prevX);
            const rot = Math.max(-12, Math.min(12, velX * 0.08));
            previewFlotante.style.transform = `translate3d(${currentPos.x}px, ${currentPos.y}px, 0) rotate(${rot}deg)`;
        }

        prevX = currentPos.x;
        requestAnimationFrame(animarCursor);
    }
    requestAnimationFrame(animarCursor);

    // Hover sobre Obras Seleccionadas -> Ajuste de encuadre
    const piezasObra = document.querySelectorAll('.pieza-obra');
    piezasObra.forEach(pieza => {
        pieza.addEventListener('mouseenter', () => {
            if (cursorBox) {
                cursorBox.style.width = '110px';
                cursorBox.style.height = '80px';
            }
            if (cursorFocal) {
                const focal = pieza.getAttribute('data-focal') || '50 MM';
                cursorFocal.textContent = focal;
            }
        });

        pieza.addEventListener('mouseleave', () => {
            if (cursorBox) {
                cursorBox.style.width = '70px';
                cursorBox.style.height = '50px';
            }
            if (cursorFocal) cursorFocal.textContent = '35 MM';
        });
    });

    // Hover sobre Filas de Índice (Servicios) -> Preview Flotante
    const filasIndice = document.querySelectorAll('.indice-fila');
    filasIndice.forEach(fila => {
        fila.addEventListener('mouseenter', () => {
            const imgSrc = fila.getAttribute('data-preview');
            if (imgSrc && previewImg && previewFlotante) {
                previewImg.src = imgSrc;
                previewFlotante.classList.add('activo');
            }
        });

        fila.addEventListener('mouseleave', () => {
            if (previewFlotante) previewFlotante.classList.remove('activo');
        });
    });
}
