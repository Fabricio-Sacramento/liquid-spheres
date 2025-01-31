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

    // Carregar HDRI **APENAS para o plano côncavo**
    const hdrLoader = new RGBELoader();
    hdrLoader.load('/textures/lakeside_4k.hdr', function (hdrEquirect) {
        hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = hdrEquirect; // **Agora afeta apenas o plano côncavo**
    });

    // Criar câmera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;
    window.camera = camera;

    // Configurar renderizador
    const canvas = document.getElementById('webgl-canvas');
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true, 
        alpha: true 
    });
    window.renderer = renderer;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Ajustar posição do canvas para garantir exibição correta
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "1";

    // ** Criar Esfera Líquida (AGORA COM O SHADER NOVAMENTE) **
    const sphereGeometry = new THREE.SphereGeometry(2.0, 128, 128);
    const sphere = new THREE.Mesh(sphereGeometry, liquidShaderMaterial);
    sphere.position.set(0, 0, 0);
    sphere.renderOrder = 1;  
    sphere.material.depthWrite = true;
    
    // ** A Esfera líquida NÃO recebe o HDRI diretamente! **
    sphere.material.envMap = null; 

    scene.add(sphere);
    window.sphere = sphere;

    // ** Criar Plano Côncavo (Vidro Fosco) **
    const concaveGeometry = new THREE.SphereGeometry(10, 128, 128);
    const concaveMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.9,  // Translúcido, mas não totalmente transparente
        opacity: 1.0,
        transparent: true,
        ior: 1.1,  
        thickness: 2.0,
        roughness: 0.3,  // Vidro fosco
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.2,
        depthWrite: false,
        envMap: scene.environment // **HDRI aplicado SOMENTE no plano côncavo**
    });

    const concaveMesh = new THREE.Mesh(concaveGeometry, concaveMaterial);
    concaveMesh.scale.set(-1, 1, 1);  // Inverter a esfera para criar um plano côncavo
    concaveMesh.position.set(0, 0, -6);
    concaveMesh.renderOrder = 0;
    scene.add(concaveMesh);
    window.concaveMesh = concaveMesh;

    // ** Criar Background (Gradiente Dinâmico) **
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
                
                float wave = sin(vUv.y * 5.0 + time * 0.5) * 0.1;
                float gradient = smoothstep(0.2, 0.8, vUv.y + wave);
                
                vec3 color = mix(darkGray, lightGray, gradient);
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        side: THREE.DoubleSide
    });

    const gradientMesh = new THREE.Mesh(gradientGeometry, gradientMaterial);
    gradientMesh.scale.set(5, 5, 1);
    gradientMesh.position.set(0, 0, -12);  // Ajuste fino para garantir que fique atrás do plano côncavo
    scene.add(gradientMesh);
    window.gradientMesh = gradientMesh;

    // ** Função de animação (AGORA A ESFERA LÍQUIDA SE MOVE NOVAMENTE) **
    function animate() {
        requestAnimationFrame(animate);
        
        // **Restauramos a rotação da esfera líquida**
        sphere.rotation.y += 0.0099;
        sphere.rotation.x += 0.0005;

        liquidShaderMaterial.uniforms.time.value += 0.05;
        gradientMaterial.uniforms.time.value += 0.01;

        renderer.render(scene, camera);
    }

    animate();

    // ** Ajustar tamanho da tela ao redimensionar **
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    return scene;
}
