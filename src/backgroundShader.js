import * as THREE from 'three';

// Vertex Shader (Define as posições do plano)
const vertexShader = `
    varying vec2 vUv;
    
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Fragment Shader (Cria o efeito de gradiente dinâmico)
const fragmentShader = `
    varying vec2 vUv;
    uniform float time;

    void main() {
        vec3 color1 = vec3(0.1, 0.1, 0.3); // Azul escuro
        vec3 color2 = vec3(0.8, 0.9, 1.0); // Azul claro

        // Criando o gradiente vertical
        vec3 gradient = mix(color1, color2, vUv.y + sin(time * 0.1) * 0.1);

        gl_FragColor = vec4(gradient, 1.0);
    }
`;

// Criando o material shader
export const backgroundShaderMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0.0 } },
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide
});
