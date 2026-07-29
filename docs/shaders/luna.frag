#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_albedo;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_lightDirection; // Derivada del ángulo del limbo brillante real
uniform float u_phase;          // Fracción iluminada 0.0 -> 1.0
uniform float u_intensity;      // Intensidad de luz lunar
uniform vec2 u_moonCenter;     // Posición de la luna en pantalla (e.g. vec2(0.7, 0.7))
uniform float u_moonRadius;     // Radio en coordenadas normalizadas (e.g. 0.28)

// Pseudo-random noise para grano de película en shader por pixel (Cero repaints DOM)
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 st = (gl_FragCoord.xy - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);
    vec2 center = (u_moonCenter - vec2(0.5)) * vec2(u_resolution.x / min(u_resolution.x, u_resolution.y), 1.0);
    
    vec2 p = st - center;
    float dist = length(p);

    vec3 skyColor = vec3(0.08, 0.11, 0.16); // #080B10 --noche

    // Intersección Rayo-Esfera Analítica
    if (dist < u_moonRadius) {
        float z = sqrt(u_moonRadius * u_moonRadius - dist * dist);
        vec3 normal = normalize(vec3(p.x, p.y, z));

        // Coordenadas esféricas -> UV equirectangular (Marea acoplada)
        float u = 0.5 + atan(normal.z, normal.x) / (2.0 * 3.14159265);
        float v = 0.5 - asin(normal.y) / 3.14159265;
        
        vec3 albedo = texture(u_albedo, vec2(u, v)).rgb;

        // Iluminación Lambert con terminador rugoso
        float diff = max(dot(normal, normalize(u_lightDirection)), 0.0);
        
        // Rugosidad en el terminador
        float noiseVal = hash(gl_FragCoord.xy * 0.05 + u_time * 0.01);
        diff = smoothstep(0.0, 0.15 + noiseVal * 0.08, diff);

        // Color lunar teñido con --luna (#BFD4E8)
        vec3 moonColor = albedo * (diff * vec3(0.75, 0.83, 0.91) + vec3(0.04, 0.05, 0.08));

        // Grano de película en shader (~0.045)
        float filmGrain = (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.045;
        moonColor += filmGrain;

        fragColor = vec4(moonColor, 1.0);
    } else {
        // Halo de Glow atenuado en --luna
        float glowDist = dist - u_moonRadius;
        float glow = exp(-glowDist * 14.0) * 0.25 * u_intensity;
        vec3 glowColor = vec3(0.75, 0.83, 0.91) * glow; // --luna #BFD4E8

        // Grano de cielo
        float filmGrain = (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.02;
        fragColor = vec4(skyColor + glowColor + filmGrain, 1.0);
    }
}
