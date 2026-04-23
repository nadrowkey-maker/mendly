"use client";

import { useEffect, useRef } from "react";

// Full-screen quad — two triangles in triangle-strip order
const VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Fragment shader: FBM-warped blobs matching brand colors
const FRAG = `
  precision mediump float;
  uniform float u_time;
  uniform vec2  u_res;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),               hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    float t  = u_time * 0.1;

    // --- Blob 1: violet #8B5CF6 — top-left (mirrors original motion.div) ---
    vec2  c1 = vec2(0.15 + sin(t * 0.70) * 0.10, 0.82 + cos(t * 0.50) * 0.08);
    float b1 = smoothstep(0.65 + fbm(uv * 1.5 + t * 0.30) * 0.30, 0.0, length(uv - c1)) * 0.40;

    // --- Blob 2: cyan #06B6D4 — bottom-right ---
    vec2  c2 = vec2(0.83 + cos(t * 0.60) * 0.08, 0.15 + sin(t * 0.45) * 0.10);
    float b2 = smoothstep(0.60 + fbm(uv * 1.2 - t * 0.25) * 0.25, 0.0, length(uv - c2)) * 0.30;

    // --- Blob 3: fuchsia #F0ABFC — center ---
    vec2  c3 = vec2(0.50 + sin(t * 0.40) * 0.15, 0.50 + cos(t * 0.35) * 0.12);
    float b3 = smoothstep(0.45 + fbm(uv * 2.0 + t * 0.20) * 0.20, 0.0, length(uv - c3)) * 0.18;

    // Base: --bg-primary #05030E = (0.0196, 0.012, 0.055)
    vec3 col = vec3(0.0196, 0.0118, 0.0549);
    col = mix(col, vec3(0.545, 0.361, 0.965), b1); // --accent-primary
    col = mix(col, vec3(0.024, 0.714, 0.831), b2); // --accent-hot
    col = mix(col, vec3(0.941, 0.671, 0.988), b3); // --accent-warm

    gl_FragColor = vec4(col, 1.0);
  }
`;

function initGL(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl");
  if (!gl) return null;

  const vs = gl.createShader(gl.VERTEX_SHADER);
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;

  gl.shaderSource(vs, VERT);  gl.compileShader(vs);
  gl.shaderSource(fs, FRAG);  gl.compileShader(fs);
  gl.attachShader(prog, vs);  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  const posLoc = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  return {
    gl,
    prog,
    uTime: gl.getUniformLocation(prog, "u_time"),
    uRes:  gl.getUniformLocation(prog, "u_res"),
  };
}

export function AuroraShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = initGL(canvas);
    if (!ctx) return; // no WebGL — section bg-primary already shows through

    const { gl, prog, uTime, uRes } = ctx;

    const resize = () => {
      // Cap pixel ratio at 1.5 for mobile performance
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf: number;
    let start: number | null = null;

    const render = (ts: number) => {
      if (start === null) start = ts;
      const t = reduced ? 0.0 : (ts - start) / 1000;
      gl.useProgram(prog);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
