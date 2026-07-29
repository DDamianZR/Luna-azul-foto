/**
 * VÍNCULO DE EFEMÉRIDES Y MECANISMO DE LUZ — LUNA AZUL FOTO
 * Transforma datos astronómicos en variables CSS (:root) y uniforms de WebGL.
 */

export function aplicarMecanismoDeLuz(efemerides, shaderUniforms = null) {
    const root = document.documentElement;

    const frac = efemerides.fraccionIluminada;
    const alt = efemerides.altitud;
    const esNoche = efemerides.esNoche;

    // 1. Cálculo de Exposición del Retrato Hero (0.62 -> 0.88)
    // Luna llena a medianoche -> foto fría, contraste alto, glow visible.
    // Luna nueva o sol diurno -> tratamiento ajustado.
    let exposicion = 0.62 + (frac * 0.26);
    if (!esNoche) {
        exposicion = 0.82; // Luz de día más abierta
    }
    exposicion = Math.max(0.62, Math.min(0.88, exposicion));

    // 2. Temperatura de Scrim (Frío lunar #0C1826 vs Cálido diurno #1A1208)
    const tempScrim = esNoche ? '#0C1826' : '#1A1208';

    // 3. Intensidad de Luz Emitida por la Luna (0 -> 1)
    let intensidad = Math.max(0.1, frac);
    if (alt < 0) {
        intensidad *= 0.3; // Bajo el horizonte
    }

    // Inyección Quirúrgica en :root CSS
    root.style.setProperty('--exposicion', exposicion.toFixed(3));
    root.style.setProperty('--temp-scrim', tempScrim);
    root.style.setProperty('--intensidad', intensidad.toFixed(3));

    // Si el shader WebGL está activo, actualizar uniforms
    if (shaderUniforms) {
        // Dirección de la luz en el shader según el ángulo del limbo brillante
        const radLimbo = efemerides.anguloLimbo * Math.PI / 180;
        const lx = Math.cos(radLimbo);
        const ly = Math.sin(radLimbo);
        const lz = Math.sin(frac * Math.PI);

        shaderUniforms.lightDirection = [lx, ly, Math.max(0.2, lz)];
        shaderUniforms.phase = frac;
        shaderUniforms.intensity = intensidad;
    }

    return { exposicion, tempScrim, intensidad };
}
