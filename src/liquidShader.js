import * as THREE from 'three';

// Vertex Shader - Deforma a superfície para parecer líquida
const vertexShader = `
    varying vec2 vUv;
uniform float time;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = viewPosition.xyz;
    
    // Ondulação mais fluida para manter o efeito líquido
    vec3 newPosition = position;
    float wave = sin(position.x * 6.0 + time * 1.5) * 0.08 + cos(position.y * 6.0 + time * 1.2) * 0.04;
    newPosition += normal * wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

// Fragment Shader - Ajusta a cor e transparência
const fragmentShader = `
    varying vec2 vUv;
    uniform float time;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

void main() {
    // Cor base com variação para dar um efeito mais orgânico
    vec3 baseColor = mix(vec3(0.0, 0.3, 0.8), vec3(0.2, 0.6, 1.0), sin(time * 0.3) * 0.5 + 0.5);
    
    // Reflexos Fresnel - Brilho nas bordas
    vec3 viewDirection = normalize(vViewPosition);
    float fresnel = pow(1.0 - dot(viewDirection, vNormal), 2.0) * 0.5;

    // Reflexos sutis dinâmicos para efeito plástico/óleo
    float highlight = pow(1.0 - length(vUv - 0.5 + sin(time * 0.3) * 0.05), 8.0);
    vec3 reflection = vec3(1.0, 1.0, 1.0) * highlight * 0.55;

    // Combinar os reflexos com a cor base
    vec3 finalColor = baseColor + reflection + fresnel * 0.5;

    // Transparência variável para efeito mais realista
    float alpha = 0.9 + sin(time * 0.5) * 0.5;

    gl_FragColor = vec4(finalColor, alpha);
}

`;

// Criar Material Shader
export const liquidShaderMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0.0 } },
    vertexShader,
    fragmentShader,
    transparent: true
});