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
    // Criar a cena
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
    camera.position.z = 5;  
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

    // Ajustar o z-index do canvas via JavaScript
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "1";

    // Criar luz ambiente para melhorar a iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Criar luz direcional para realçar reflexos
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Criar a geometria da esfera líquida
    const geometry = new THREE.SphereGeometry(2.0, 128, 128);
    const sphere = new THREE.Mesh(geometry, liquidShaderMaterial);
    sphere.position.set(0, 0, 0);
    sphere.renderOrder = 1; // Garante que a esfera seja renderizada depois do fundo

    // Adicionar efeito de transparência para um visual mais vítreo
    sphere.material.transparent = true;
    sphere.material.opacity = 0.95;
    sphere.material.depthWrite = true; 

    scene.add(sphere);

    // Criar a geometria do plano côncavo (fundo)
    const backgroundGeometry = new THREE.SphereGeometry(10, 128, 128);
    
    // Criar material de fundo com leve transparência para evitar esconder a esfera
    const backgroundMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.9,
        opacity: 0.9,
        transparent: true,
        ior: 1.1,
        thickness: 1.0,
        roughness: 0.3,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.2,
        envMap: scene.environment
    });

    // Criar a malha do fundo
    const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    backgroundMesh.scale.set(-1, 1, 1);
    backgroundMesh.position.set(0, 0, -6);
    backgroundMesh.rotation.set(0, 0, 0); 
    backgroundMesh.renderOrder = 0; // Renderiza antes da esfera
    backgroundMesh.material.depthWrite = false; // Evita que esconda a esfera
    scene.add(backgroundMesh);

    // Criar a geometria do plano de fundo (gradiente dinâmico)
    const gradientGeometry = new THREE.PlaneGeometry(50, 50);
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

    // Criar a malha do gradiente de fundo
    const gradientMesh = new THREE.Mesh(gradientGeometry, gradientMaterial);
    gradientMesh.scale.set(5, 5, 1);
    gradientMesh.position.set(0, 0, -8);
    scene.add(gradientMesh);

    // Função de animação
    function animate() {
        requestAnimationFrame(animate);

        // Mantém a esfera líquida girando
        sphere.rotation.y += 0.0099;
        sphere.rotation.x += 0.0005;

        // Atualiza os shaders animados
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
