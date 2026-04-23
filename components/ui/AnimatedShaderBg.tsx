"use client";

import { useEffect, useRef } from "react";

const VERT = `#version 300 es
in vec4 position;
void main() { gl_Position = position; }`;

// Mendly-branded aurora — violet / cyan / fuchsia blobs on deep-space black.
// Uses the ravikatiyar WebGL2 renderer architecture with mouse-reactive uniforms.
const FRAG = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2  resolution;
uniform float time;
uniform vec2  touch;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p) {
  float v=0.,a=.5;
  for(int i=0;i<4;i++){v+=a*noise(p);p*=2.1;a*=.5;}
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float t  = time * 0.09;

  // Mouse push — subtle organic distortion near cursor
  vec2 m = touch / resolution;
  float push = smoothstep(0.35, 0.0, length(uv - m)) * 0.10;

  // Blob 1: violet  --accent-primary #8B5CF6
  vec2 c1 = vec2(.15+sin(t*.70+push)*.12, .82+cos(t*.50)*.10);
  float b1 = smoothstep(.65+fbm(uv*1.5+t*.30)*.35, 0., length(uv-c1))*.42;

  // Blob 2: cyan  --accent-hot #06B6D4
  vec2 c2 = vec2(.83+cos(t*.60)*.10, .15+sin(t*.45+push)*.12);
  float b2 = smoothstep(.60+fbm(uv*1.2-t*.25)*.28, 0., length(uv-c2))*.32;

  // Blob 3: fuchsia  --accent-warm #F0ABFC
  vec2 c3 = vec2(.50+sin(t*.40)*.18, .50+cos(t*.35+push*.5)*.14);
  float b3 = smoothstep(.45+fbm(uv*2.0+t*.20)*.22, 0., length(uv-c3))*.20;

  // Base: --bg-primary #05030E
  vec3 col = vec3(.0196,.0118,.0549);
  col = mix(col, vec3(.545,.361,.965), b1);  // violet
  col = mix(col, vec3(.024,.714,.831), b2);  // cyan
  col = mix(col, vec3(.941,.671,.988), b3);  // fuchsia
  O = vec4(col, 1.);
}`;

export function AnimatedShaderBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = canvas.getContext("webgl2");
    if (!gl) return;

    function mkShader(type: number, src: string): WebGLShader {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const vs = mkShader(gl.VERTEX_SHADER, VERT);
    const fs = mkShader(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes   = gl.getUniformLocation(prog, "resolution");
    const uTime  = gl.getUniformLocation(prog, "time");
    const uTouch = gl.getUniformLocation(prog, "touch");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      mouse.current = [
        (e.clientX - r.left) * dpr,
        canvas.height - (e.clientY - r.top) * dpr,
      ];
    };
    window.addEventListener("mousemove", onMove);

    let raf: number;
    let t0: number | null = null;

    const loop = (ts: number) => {
      if (t0 === null) t0 = ts;
      const t = reduced ? 0 : (ts - t0) / 1000;
      gl.useProgram(prog);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uTouch, mouse.current[0], mouse.current[1]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
