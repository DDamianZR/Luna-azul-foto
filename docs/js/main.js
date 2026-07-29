/**
 * MAIN ORQUESTADOR (Entry ES Module) — LUNA AZUL FOTO
 */

import { calcularEfemerides } from './efemerides.js';
import { Observatorio } from './observatorio.js';
import { aplicarMecanismoDeLuz } from './luz.js';
import { inicializarScroll } from './scroll.js';
import { inicializarCursor } from './cursor.js';
import { inicializarUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar Efemérides Astronómicas
    const efemerides = calcularEfemerides(new Date());

    // 2. Renderizar Telemetría HUD
    renderizarHUD(efemerides);

    // 3. Inicializar Observatorio WebGL2
    const canvasLuna = document.getElementById('hero-canvas-luna');
    let observatorio = null;
    if (canvasLuna) {
        observatorio = new Observatorio(canvasLuna, efemerides);
    }

    // 4. Aplicar Mecanismo de Luz
    aplicarMecanismoDeLuz(efemerides, observatorio ? observatorio.uniformValues : null);

    // Recalcular luz cada 60s
    setInterval(() => {
        const efem = calcularEfemerides(new Date());
        aplicarMecanismoDeLuz(efem, observatorio ? observatorio.uniformValues : null);
        renderizarHUD(efem);
    }, 60000);

    // 5. Inicializar Sistemas de Interacción y Movimiento
    inicializarScroll();
    inicializarCursor();
    inicializarUI();
});

function renderizarHUD(efem) {
    const valFase = document.getElementById('hud-val-fase');
    const valAlt = document.getElementById('hud-val-alt');
    const valAzim = document.getElementById('hud-val-azim');
    const valAzul = document.getElementById('hud-val-azul');
    const valProximaAzul = document.getElementById('hud-val-proxima-azul');

    if (valFase) valFase.textContent = `${efem.nombreFase} · ${efem.porcentajeIluminado}%`;
    if (valAlt) valAlt.textContent = `${efem.altitud >= 0 ? '+' : ''}${efem.altitud.toFixed(1)}°`;
    if (valAzim) valAzim.textContent = `${efem.anguloLimbo.toFixed(1)}°`;
    if (valAzul) valAzul.textContent = efem.esNoche ? '20:14 — 20:33' : 'SALIENDO 21:40';
    if (valProximaAzul) valProximaAzul.textContent = efem.proximaLunaAzul;
}
