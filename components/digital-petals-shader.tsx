"use client";
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const DigitalPetalsShader = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1) Initialisation du Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock = new THREE.Clock();

    // 2) Shaders
    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec2 iMouse;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
        vec2 mouse = (iMouse - 0.5 * iResolution.xy) / iResolution.y;
        float t = iTime * 0.3;
        float r = length(uv);
        float a = atan(uv.y, uv.x);
        float mouseDist = length(uv - mouse);
        float bloom = smoothstep(0.4, 0.0, mouseDist);
        float petals = 5.0 + sin(t) * 2.0;
        float petalShape = sin(a * petals + r * 2.0);
        petalShape = pow(abs(petalShape), 0.5);
        float flow = sin(r * 10.0 - t * 2.0);
        float pattern = mix(petalShape, flow, 0.5) + bloom * 0.5;
        vec3 color1 = vec3(0.8, 0.1, 0.5);
        vec3 color2 = vec3(0.2, 0.4, 0.9);
        vec3 highlightColor = vec3(1.0);
        vec3 finalColor = mix(color1, color2, smoothstep(0.5, 0.8, r + random(vec2(t, t)) * 0.1)) * pattern;
        finalColor += highlightColor * pow(pattern, 10.0) * (1.0 + bloom);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2() },
      iMouse: { value: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2) }
    };

    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 3) Gestion du Resize ultra-stable avec ResizeObserver
    const handleResize = (width: number, height: number) => {
      renderer.setSize(width, height, false);
      uniforms.iResolution.value.set(width, height);
    };

    const ro = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width, height } = entries[0].contentRect;
      // On n'exécute que si les dimensions ont RÉELLEMENT changé d'au moins 1px
      if (Math.abs(renderer.domElement.width - width) > 1 || Math.abs(renderer.domElement.height - height) > 1) {
        handleResize(width, height);
      }
    });

    ro.observe(container);

    // 4) Mouse handler
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      uniforms.iMouse.value.set(e.clientX - rect.left, rect.height - (e.clientY - rect.top));
    };
    window.addEventListener('mousemove', onMouseMove);

    // 5) Loop
    renderer.setAnimationLoop(() => {
      uniforms.iTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    });

    // 6) Cleanup
    return () => {
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      renderer.setAnimationLoop(null);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      material.dispose();
      geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="shader-container w-full h-full absolute inset-0 pointer-events-none"
      aria-label="Digital Petals animated background"
    />
  );
};

export default DigitalPetalsShader;