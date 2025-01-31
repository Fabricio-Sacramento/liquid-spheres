import * as THREE from 'three';

window.THREE = THREE; // Expondo globalmente

import { liquidShaderMaterial } from './liquidShader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

console.log("scene.js carregado!");

document.addEventListener('DOMContentLoaded', () => {
    createScene();
    console.log("Cena criada!");
});

export function createScene() {
    // Criar a cena (Apenas uma declaração)
    const scene = new THREE.Scene();
    window.scene = scene;

    // Carregar o mapa de ambiente HDR
    const hdrLoader = new RGBELoader();
    hdrLoader.load('/textures/lakeside_4k.hdr', function (hdrEquirect) {
        hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = hdrEquirect;
    });

    // Criar a câmera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;  // Ajuste fino conforme necessário

    window.camera = camera;

    // Seleciona o canvas do HTML
    const canvas = document.getElementById('webgl-canvas');

    // Criar o renderizador utilizando o canvas existente
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true, 
        alpha: true 
    });
    window.renderer = renderer;

    // Configurar tamanho
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Ajustar o z-index do canvas via JavaScript para evitar sumiço da esfera
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "1";

    // Adicionar luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const fillLight = new THREE.PointLight(0xffffff, 0.5);
    fillLight.position.set(-3, -2, 3);
    scene.add(fillLight);

    // Criar a geometria da esfera
    const geometry = new THREE.SphereGeometry(2.0, 128, 128);
    const sphere = new THREE.Mesh(geometry, liquidShaderMaterial);
    sphere.position.set(0, 0, 0)
    scene.add(sphere);

    // Criar a geometria do plano côncavo (fundo)
    const backgroundGeometry = new THREE.SphereGeometry(10, 64, 64);

    // Criar material de vidro
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x081D4E,
        metalness: 0.1,  // Ajuste fino do reflexo
        roughness: 10,  // Reduz rugosidade para refração mais visível
        transmission: 1,  // Máxima transparência para um efeito realista
        thickness: 1.5,  // Maior refração e distorção da luz
        ior: 1.2,  // Ajusta refração
        opacity: 0.5,  // Opacidade controlada para dar efeito de vidro
        transparent: true,  // Ativa a transparência no material
        depthWrite: false,  // Evita que ele "tape" objetos atrás
        clearcoat: 1,
        clearcoatRoughness: 0.2,
        envMap: scene.environment,
    });    
    

    // Aplicar o material de vidro ao plano côncavo
    const backgroundMesh = new THREE.Mesh(backgroundGeometry, glassMaterial);
    backgroundMesh.scale.set(-1, 1, 1);
    backgroundMesh.position.set(0, 0, -6)
    scene.add(backgroundMesh);

    // Criar a geometria do plano de fundo
    const gradientGeometry = new THREE.PlaneGeometry(20, 20);
    const gradientMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            void main() {
                vec3 darkGray = vec3(0.3); // Preto 70%
                vec3 lightGray = vec3(0.75); // Preto 25%
                
                // Criamos um efeito de onda para mover o gradiente suavemente
                float wave = sin(vUv.y * 5.0 + time * 0.5) * 0.1;
                float gradient = smoothstep(0.2, 0.8, vUv.y + wave);
                
                vec3 color = mix(darkGray, lightGray, gradient);
                gl_FragColor = vec4(color, 1.0);
            }

        `,
        side: THREE.DoubleSide
    });
    
    const gradientMesh = new THREE.Mesh(gradientGeometry, gradientMaterial);
    gradientMesh.scale.set(5, 5, 1);  // Aumenta o fundo para cobrir toda a tela
    gradientMesh.position.set(0, 0, -8);  // Move o plano mais para trás
    scene.add(gradientMesh);

    // Função de animação
    function animate() {
        requestAnimationFrame(animate);
        sphere.rotation.y += 0.0099;
        sphere.rotation.x += 0.0005;

        liquidShaderMaterial.uniforms.time.value += 0.05;
        gradientMaterial.uniforms.time.value += 0.01;

        renderer.render(scene, camera);
    }

    // Inicia a animação
    animate();

    // Ajustar tamanho da tela quando redimensionada
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    return scene;
}
