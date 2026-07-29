/**
 * EL OBSERVATORIO LUNAR (WebGL2 + Tiers + HUD Telemetría) — LUNA AZUL FOTO
 */

import { aplicarMecanismoDeLuz } from './luz.js';

export class Observatorio {
    constructor(canvas, efemerides) {
        this.canvas = canvas;
        this.efemerides = efemerides;
        this.gl = null;
        this.program = null;
        this.uniforms = {};
        this.animFrameId = null;
        this.isDegraded = false;
        this.tier = 'alto'; // alto, medio, estatico
        this.frametimes = [];
        this.lastTime = performance.now();
        this.uniformValues = {
            lightDirection: [0.5, 0.5, 0.7],
            phase: efemerides.fraccionIluminada,
            intensity: 0.8
        };

        // Offset interactivo para arrastre de ratón (orbit ±18° X / ±10° Y)
        this.mouseOffset = { x: 0, y: 0 };
        this.targetOffset = { x: 0, y: 0 };

        this.init();
    }

    async init() {
        // Verificar prefers-reduced-motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            console.log('Prefers-reduced-motion detectado: Degradando a estático');
            this.tier = 'estatico';
        }

        this.gl = this.canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'high-performance' });
        if (!this.gl) {
            console.warn('WebGL2 no soportado. Activando fallback a póster estático.');
            this.degradar();
            return;
        }

        try {
            await this.cargarShaders();
            await this.cargarTextura();
            this.setupBuffers();
            this.setupInteraccion();
            this.setupObserver();
            
            aplicarMecanismoDeLuz(this.efemerides, this.uniformValues);
            this.render(performance.now());
        } catch (err) {
            console.error('Error inicializando WebGL2 Observatorio:', err);
            this.degradar();
        }
    }

    async cargarShaders() {
        const vertSource = await (await fetch('shaders/luna.vert')).text();
        const fragSource = await (await fetch('shaders/luna.frag')).text();

        const vertShader = this.crearShader(this.gl.VERTEX_SHADER, vertSource);
        const fragShader = this.crearShader(this.gl.FRAGMENT_SHADER, fragSource);

        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertShader);
        this.gl.attachShader(this.program, fragShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            throw new Error('Error al vincular programa WebGL: ' + this.gl.getProgramInfoLog(this.program));
        }

        this.gl.useProgram(this.program);

        // Obtener posiciones de uniforms
        this.uniforms.resolution = this.gl.getUniformLocation(this.program, 'u_resolution');
        this.uniforms.time = this.gl.getUniformLocation(this.program, 'u_time');
        this.uniforms.lightDirection = this.gl.getUniformLocation(this.program, 'u_lightDirection');
        this.uniforms.phase = this.gl.getUniformLocation(this.program, 'u_phase');
        this.uniforms.intensity = this.gl.getUniformLocation(this.program, 'u_intensity');
        this.uniforms.moonCenter = this.gl.getUniformLocation(this.program, 'u_moonCenter');
        this.uniforms.moonRadius = this.gl.getUniformLocation(this.program, 'u_moonRadius');
        this.uniforms.albedo = this.gl.getUniformLocation(this.program, 'u_albedo');
    }

    crearShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const log = this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            throw new Error('Error compilando shader: ' + log);
        }
        return shader;
    }

    async cargarTextura() {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const tex = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
                this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                resolve();
            };
            img.onerror = () => {
                console.warn('Textura lunar no encontrada, activando fallback');
                resolve();
            };
            img.src = 'assets/img/luna-albedo.webp';
        });
    }

    setupBuffers() {
        const positions = new Float32Array([
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
             1.0,  1.0,
        ]);
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

        const posLoc = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(posLoc);
        this.gl.vertexAttribPointer(posLoc, 2, this.gl.FLOAT, false, 0, 0);
    }

    setupInteraccion() {
        // Desktop drag (orbit return)
        let isDragging = false;
        let startX = 0, startY = 0;

        window.addEventListener('mousedown', (e) => {
            if (e.target.closest('.hero-canvas-luna')) {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const dx = (e.clientX - startX) / window.innerWidth;
                const dy = (e.clientY - startY) / window.innerHeight;
                this.targetOffset.x = Math.max(-0.05, Math.min(0.05, dx));
                this.targetOffset.y = Math.max(-0.03, Math.min(0.03, dy));
            }
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            this.targetOffset = { x: 0, y: 0 };
        });

        // Tecla 'I' para toggle de telemetría HUD
        window.addEventListener('keydown', (e) => {
            if (e.key === 'i' || e.key === 'I') {
                const hud = document.getElementById('hero-hud');
                if (hud) hud.classList.toggle('oculto');
            }
        });
    }

    setupObserver() {
        // Pausar rAF cuando el hero sale del viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!this.animFrameId && this.tier !== 'estatico') {
                        this.lastTime = performance.now();
                        this.render(this.lastTime);
                    }
                } else {
                    if (this.animFrameId) {
                        cancelAnimationFrame(this.animFrameId);
                        this.animFrameId = null;
                    }
                }
            });
        }, { threshold: 0.1 });

        observer.observe(this.canvas);
    }

    render(now) {
        if (this.tier === 'estatico') return;

        const delta = now - this.lastTime;
        this.lastTime = now;

        // Monitor de Presupuesto de Frametime (60 fps = 16.6ms)
        this.frametimes.push(delta);
        if (this.frametimes.length > 90) {
            this.frametimes.shift();
            const avg = this.frametimes.reduce((a, b) => a + b, 0) / this.frametimes.length;
            if (avg > 22 && this.tier === 'alto') {
                console.warn('Frametime medio > 22ms. Bajando a tier medio');
                this.tier = 'medio';
            } else if (avg > 35 && this.tier === 'medio') {
                console.warn('Frametime medio > 35ms. Bajando a tier estático');
                this.tier = 'estatico';
                this.degradar();
                return;
            }
        }

        // Interpolación lerp de offset del ratón
        this.mouseOffset.x += (this.targetOffset.x - this.mouseOffset.x) * 0.12;
        this.mouseOffset.y += (this.targetOffset.y - this.mouseOffset.y) * 0.12;

        // Resize Canvas con DPR según tier
        const dpr = this.tier === 'alto' ? Math.min(window.devicePixelRatio, 1.5) : 1.0;
        const width = this.canvas.clientWidth * dpr;
        const height = this.canvas.clientHeight * dpr;
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.gl.viewport(0, 0, width, height);
        }

        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.useProgram(this.program);

        // Actualizar uniforms
        this.gl.uniform2f(this.uniforms.resolution, width, height);
        this.gl.uniform1f(this.uniforms.time, now * 0.001);
        this.gl.uniform3fv(this.uniforms.lightDirection, this.uniformValues.lightDirection);
        this.gl.uniform1f(this.uniforms.phase, this.uniformValues.phase);
        this.gl.uniform1f(this.uniforms.intensity, this.uniformValues.intensity);
        
        // Posición de la luna en pantalla (Cielo alto derecha + offset interactivo)
        const moonCenterX = 0.72 + this.mouseOffset.x;
        const moonCenterY = 0.68 + this.mouseOffset.y;
        this.gl.uniform2f(this.uniforms.moonCenter, moonCenterX, moonCenterY);
        this.gl.uniform1f(this.uniforms.moonRadius, 0.26);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        this.animFrameId = requestAnimationFrame((t) => this.render(t));
    }

    degradar() {
        this.isDegraded = true;
        this.canvas.style.display = 'none';
        const poster = document.getElementById('hero-poster-fallback');
        if (poster) poster.style.display = 'block';
    }
}
