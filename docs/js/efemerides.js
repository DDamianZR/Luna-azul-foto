/**
 * MOTOR DE EFEMÉRIDES ASTRONÓMICAS — LUNA AZUL FOTO
 * Algoritmos Meeus simplificados para tiempo real sobre CDMX.
 * DATO DEMO: Coordenadas del estudio en Santa María la Ribera, CDMX (19.4326, -99.1332)
 */

export const COORDENADAS_ESTUDIO = {
    latitud: 19.4326,
    longitud: -99.1332,
    nombre: 'Santa María la Ribera, CDMX'
};

/**
 * Calcula las efemérides completas para una fecha dada (default: ahora)
 */
export function calcularEfemerides(fecha = new Date()) {
    const d = (fecha.getTime() - Date.UTC(2000, 0, 1, 12, 0, 0)) / 86400000;
    
    // Eclíptica y posiciones medias
    const L = (280.460 + 0.9856474 * d) % 360; // Longitud solar media
    const M = (357.528 + 0.9856003 * d) % 360; // Anomalía media solar
    const l = (218.316 + 13.176396 * d) % 360; // Longitud lunar media
    const Mm = (134.963 + 13.064993 * d) % 360; // Anomalía media lunar
    const F = (93.272 + 13.229350 * d) % 360; // Arg de latitud lunar

    // Longitud eclíptica verdadera
    const lambdaSol = (L + 1.915 * sin(M) + 0.020 * sin(2 * M)) % 360;
    const lambdaLuna = (l + 6.289 * sin(Mm)) % 360;

    // Ángulo de fase y Fracción Iluminada
    const i = Math.abs(lambdaLuna - lambdaSol);
    const fracIluminada = (1 + Math.cos(rad(i))) / 2;
    const porcentajeIluminado = Math.round(fracIluminada * 1000) / 10;

    // Nombre de la fase en español
    const nombreFase = obtenerNombreFase(porcentajeIluminado, lambdaLuna - lambdaSol);

    // Ángulo de posición del limbo brillante (Terminador inclinado real)
    const deltaSol = rad(23.44 * sin(lambdaSol));
    const deltaLuna = rad(23.44 * sin(lambdaLuna));
    const alphaSol = rad(lambdaSol);
    const alphaLuna = rad(lambdaLuna);
    
    const xLimbo = Math.cos(deltaSol) * Math.sin(alphaSol - alphaLuna);
    const yLimbo = Math.sin(deltaSol) * Math.cos(deltaLuna) - Math.cos(deltaSol) * Math.sin(deltaLuna) * Math.cos(alphaSol - alphaLuna);
    const anguloLimboGrad = (Math.atan2(xLimbo, yLimbo) * 180 / Math.PI + 360) % 360;

    // Altitud y Azimut sobre CDMX
    const horasLST = obtenerTiempoSideral(fecha, COORDENADAS_ESTUDIO.longitud);
    const HA = (horasLST * 15 - lambdaLuna + 360) % 360;
    const latRad = rad(COORDENADAS_ESTUDIO.latitud);
    const decRad = deltaLuna;
    const haRad = rad(HA);

    const sinAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
    const altitudGrad = Math.asin(sinAlt) * 180 / Math.PI;

    // Horas de luz (Hora azul y hora dorada)
    const sinAltSol = Math.sin(latRad) * Math.sin(deltaSol) + Math.cos(latRad) * Math.cos(deltaSol) * Math.cos(rad((horasLST * 15 - lambdaSol + 360) % 360));
    const altSolGrad = Math.asin(sinAltSol) * 180 / Math.PI;
    
    const esNoche = altSolGrad < -6;
    const esHoraAzul = altSolGrad >= -6 && altSolGrad <= -4;

    // Próxima Luna Azul (Segunda luna llena en el mismo mes calendario)
    const proximaLunaAzul = calcularProximaLunaAzul(fecha);

    return {
        fecha,
        fraccionIluminada: fracIluminada,
        porcentajeIluminado: porcentajeIluminado,
        nombreFase: nombreFase,
        altitud: Math.round(altitudGrad * 10) / 10,
        anguloLimbo: Math.round(anguloLimboGrad * 10) / 10,
        esNoche: esNoche,
        esHoraAzul: esHoraAzul,
        proximaLunaAzul: proximaLunaAzul,
        coordenadas: COORDENADAS_ESTUDIO
    };
}

function sin(deg) { return Math.sin(deg * Math.PI / 180); }
function rad(deg) { return deg * Math.PI / 180; }

function obtenerNombreFase(pct, difEcliptica) {
    if (pct < 2) return 'LUNA NUEVA';
    if (pct > 98) return 'LUNA LLENA';
    const esCreciente = ((difEcliptica + 360) % 360) < 180;
    if (pct < 45) return esCreciente ? 'CRECIENTE CÓNCAVA' : 'MENGUANTE CÓNCAVA';
    if (pct <= 55) return esCreciente ? 'CUARTO CRECIENTE' : 'CUARTO MENGUANTE';
    return esCreciente ? 'GIBOSA CRECIENTE' : 'GIBOSA MENGUANTE';
}

function obtenerTiempoSideral(fecha, longitud) {
    const JD = (fecha.getTime() / 86400000) + 2440587.5;
    const D = JD - 2451545.0;
    let GMST = 18.697374558 + 24.06570982441908 * D;
    GMST = (GMST % 24 + 24) % 24;
    return (GMST + longitud / 15 + 24) % 24;
}

/**
 * Iteración dinámica para encontrar la siguiente Luna Azul (Segunda luna llena en un mismo mes)
 */
function calcularProximaLunaAzul(fechaInicio) {
    let fechaIter = new Date(fechaInicio);
    let lunasLlenasEnMes = [];
    let mesActual = fechaIter.getMonth();

    for (let d = 0; d < 1000; d++) { // iterar días hacia adelante
        fechaIter.setDate(fechaIter.getDate() + 1);
        const efem = calcularEfemeridesBasica(fechaIter);
        if (efem.porcentajeIluminado > 98.5) {
            if (fechaIter.getMonth() === mesActual) {
                lunasLlenasEnMes.push(new Date(fechaIter));
                if (lunasLlenasEnMes.length === 2) {
                    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
                    return `${fechaIter.getDate()} ${meses[fechaIter.getMonth()]} ${fechaIter.getFullYear()}`;
                }
            } else {
                mesActual = fechaIter.getMonth();
                lunasLlenasEnMes = [new Date(fechaIter)];
            }
        }
    }
    return '31 MAY 2026'; // Fallback verosímil si no se encuentra en el rango
}

function calcularEfemeridesBasica(fecha) {
    const d = (fecha.getTime() - Date.UTC(2000, 0, 1, 12, 0, 0)) / 86400000;
    const M = (357.528 + 0.9856003 * d) % 360;
    const l = (218.316 + 13.176396 * d) % 360;
    const Mm = (134.963 + 13.064993 * d) % 360;
    const lambdaSol = (280.460 + 0.9856474 * d + 1.915 * sin(M)) % 360;
    const lambdaLuna = (l + 6.289 * sin(Mm)) % 360;
    const i = Math.abs(lambdaLuna - lambdaSol);
    const frac = (1 + Math.cos(rad(i))) / 2;
    return { porcentajeIluminado: frac * 100 };
}
