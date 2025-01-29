import * as THREE from 'three';
import { liquidShaderMaterial } from './liquidShader.js';

export function createScene() {
    // Criar a cena
    const scene = new THREE.Scene();

    // Criar a câmera
    const camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        100
    );
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

    // Ajustar o z-index do canvas via JavaScript para evitar sumiço da esfera
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "1";

    // Adicionar luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Criar a geometria da esfera
    const geometry = new THREE.SphereGeometry(2.2, 128, 128);

    // Criar a esfera usando o shader líquido
    const sphere = new THREE.Mesh(geometry, liquidShaderMaterial);
    scene.add(sphere);

    // Função de animação
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotaciona a esfera continuamente
        sphere.rotation.y += 0.0099;
        sphere.rotation.x += 0.0005;

        liquidShaderMaterial.uniforms.time.value += 0.05;
    
        // Renderiza a cena
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

    window.scene = scene; // Expõe a cena globalmente
    return scene;
}
