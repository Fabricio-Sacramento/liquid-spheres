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

    // Criar o renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Adicionar luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Criar uma esfera simples (por enquanto)
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshStandardMaterial({ color: 0x0077ff, roughness: 0.2, metalness: 0.5 });
    const sphere = new THREE.Mesh(geometry, liquidShaderMaterial);
    scene.add(sphere);

    // Função de animação
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotaciona a esfera continuamente
        sphere.rotation.y += 0.01;
        sphere.rotation.x += 0.005;

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
}
