// bombKitties.js

import { HelloKitty } from './kitties.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class BombKitty extends HelloKitty {
    constructor(scene, world, player, size = 5, life = 5, speed = 7) {
        super(scene, world, player, size, life, speed);

        this.explosionDuration = 1;
        this.particleSystem = null;
        this.bombTimer = 70; // 7 segundos
    }

    init() {
        // Criar o corpo físico
        this.createPhysicsBody();

        const loader = new GLTFLoader();

        // Altere a linha abaixo para carregar o modelo da BombKitty
        loader.load('models/bomb kitty/bomb kitty.glb', (gltf) => {
            this.helloKitty = gltf.scene;
            this.helloKitty.scale.set(this.size, this.size, this.size); 

            // Criar barra de vida
            const lifeBarGeometry = new THREE.PlaneGeometry(2 * (this.size * 0.3), 0.2);
            this.lifeBarMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x00ff00, 
                side: THREE.DoubleSide
            });

            this.lifeBar = new THREE.Mesh(lifeBarGeometry, this.lifeBarMaterial); 
            const lifePercentage = this.life / 5;
            this.lifeBar.scale.x = lifePercentage;       

            // Criar um grupo para o inimigo e a barra de vida
            const enemyGroup = new THREE.Group();
            enemyGroup.add(this.helloKitty);
            enemyGroup.add(this.lifeBar);
            this.scene.add(enemyGroup);
        }, undefined, (error) => {
            console.error('Erro ao carregar modelo:', error);
        });
    }

    // Método sobrescrito para lógica adicional ou modificada
    updateMovement(player) {
        super.updateMovement(player);

        if (!this.isDead) {
            this.bombTimer -= 0.1;

            if (this.bombTimer <= 0) {
                this.explode();
            }
        }
    }

    // Função chamada quando a BombKitty explode
    explode() {
        console.log("BOOM! BombKitty explodiu!");
        
        // Criar o sistema de partículas para a explosão
        // this.createExplosion();

        // Remover a BombKitty da cena após a explosão
        this.scene.remove(this.helloKitty);
        this.scene.remove(this.lifeBar);
        this.decreaseLife(this.life);
    }

    // Função para criar a explosão
    createExplosion() {
        // Número de partículas
        const particleCount = 10;
        
        // Geometria das partículas (usando pontos, onde cada partícula será um ponto)
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3); // Para armazenar a velocidade de cada partícula

        // Preencher as partículas com posições e velocidades
        for (let i = 0; i < particleCount; i++) {
            // Posições aleatórias para as partículas
            positions[i * 3] = Math.random() * 2 - 1;  // X
            positions[i * 3 + 1] = Math.random() * 2 - 1;  // Y
            positions[i * 3 + 2] = Math.random() * 2 - 1;  // Z

            // Velocidades aleatórias para as partículas
            velocities[i * 3] = Math.random() * 0.5 - 0.25;  // X
            velocities[i * 3 + 1] = Math.random() * 0.5 - 0.25;  // Y
            velocities[i * 3 + 2] = Math.random() * 0.5 - 0.25;  // Z
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3)); // Atribuindo velocidades

        // Criar material com shader customizado
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0xff66cc) } // Rosa
            },
            vertexShader: `
                attribute vec3 velocity;
                uniform float time;
                void main() {
                    vec3 pos = position + velocity * time;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                void main() {
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        // Criar sistema de partículas (Points)
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);

        // Atualizar a explosão
        const clock = new THREE.Clock();
        const updateExplosion = () => {
            material.uniforms.time.value += clock.getDelta();

            // Atualizar a posição das partículas
            const positions = geometry.attributes.position.array;
            const velocities = geometry.attributes.velocity.array;

            for (let i = 0; i < particleCount; i++) {
                const velocityIndex = i * 3;
                positions[velocityIndex] += velocities[velocityIndex];
                positions[velocityIndex + 1] += velocities[velocityIndex + 1];
                positions[velocityIndex + 2] += velocities[velocityIndex + 2];
            }

            geometry.attributes.position.needsUpdate = true;

            // Remover partículas após 2 segundos (dissipar)
            if (material.uniforms.time.value > 2) {
                this.scene.remove(particles); // Remover as partículas depois de 2 segundos
            }
        }

        // Atualizar o efeito de explosão
        setTimeout(() => {
            this.scene.remove(particles); // Remover as partículas após 2 segundos
        }, 2000);

        this.scene.onBeforeRender = updateExplosion;
    }
}

// Função para adicionar BombKitties
export function addBombKitties(kitties, scene, world, camera, size = 8, life = 5, speed = 8) {
    const newBombKitty = new BombKitty(scene, world, camera, size, life, speed);
    newBombKitty.init();
    kitties.push(newBombKitty);
}
