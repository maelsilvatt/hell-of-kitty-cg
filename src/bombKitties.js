// bombKitties.js

import { HelloKitty } from './kitties.js';
import { models } from './loadModels.js';
import { playBombKittyVoiceLine } from './audio.js';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

export class BombKitty extends HelloKitty {
    constructor(scene, world, player, size = 5, life = 5, speed = 7) {
        super(scene, world, player, size, life, speed);

        this.bombTimer = 70; // 7 segundos
        this.explosionFadeout = 3000; // 3 segundos de animação
        this.isExploding = false;
    }

    init() {
        // Criar o corpo físico
        this.createPhysicsBody();

        if (!models.helloKitty) {
            console.error("❌ Modelo Hello Kitty ainda não carregado!");
            return;
        }
    
        this.helloKitty = models.bombKitty.clone();
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
    }

    // Método sobrescrito para lógica adicional ou modificada
    updateMovement(player) {
        if (!this.isDead && !this.isExploding) { 
            this.bombTimer -= 0.1;
    
            if (this.bombTimer <= 0) {
                playBombKittyVoiceLine();
                this.isExploding = true;  // Impede novas execuções
                this.explode();
    
                setTimeout(() => {
                    this.isExploding = false;  // Libera para próxima chamada após a explosão
                }, this.explosionFadeout);
            }
        }
        super.updateMovement(player);
    }    

    // Função chamada quando a BombKitty explode
    explode() {        
        this.createExplosion();

        // Remover a BombKitty da cena após a explosão
        this.scene.remove(this.helloKitty);
        this.scene.remove(this.lifeBar);
        this.decreaseLife(this.life);
    }

    // Função que cria a explosão em forma de coraçãozinho <3
    createExplosion() {
        const particleCount = 50;
        const particles = new THREE.Group();
    
        // Criar partículas (mini corações) que se espalham
        for (let i = 0; i < particleCount; i++) {
            const heartShape = new THREE.Shape();
            heartShape.moveTo(0, 0.6);
            heartShape.bezierCurveTo(0.2, 0.5, 0.5, 0.3, 0, -0.3);
            heartShape.bezierCurveTo(-0.5, 0.3, -0.2, 0.5, 0, 0.3);
    
            const extrudeSettings = { depth: 0.1, bevelEnabled: false };
            const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
            const heartMaterial = new THREE.MeshBasicMaterial({ color: 0xff69b4 });
    
            const miniHeart = new THREE.Mesh(heartGeometry, heartMaterial);
            miniHeart.scale.set(1.5, 1.5, 1.5);
            miniHeart.position.set(
                this.helloKitty.position.x + (Math.random() - 0.5) * 4,
                this.helloKitty.position.y + (Math.random() - 0.5) * 4,
                this.helloKitty.position.z + (Math.random() - 0.5) * 4
            );
            
            this.scene.add(miniHeart);
    
            // Animação para os mini corações se espalharem
            new TWEEN.Tween(miniHeart.position)
                .to({
                    x: miniHeart.position.x + (Math.random() - 0.5) * 4,
                    y: miniHeart.position.y + (Math.random() - 0.5) * 4,
                    z: miniHeart.position.z + (Math.random() - 0.5) * 4
                }, 2000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onComplete(() => {
                    this.scene.remove(miniHeart);
                })
                .start();
    
            particles.add(miniHeart);
        }
    
        this.scene.add(particles);
    
        // Criar o coração rosa maior
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0.3);
        heartShape.bezierCurveTo(0.2, 0.5, 0.5, 0.3, 0, -0.3);
        heartShape.bezierCurveTo(-0.5, 0.3, -0.2, 0.5, 0, 0.3);
    
        const extrudeSettings = { depth: 0.2, bevelEnabled: false };
        const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
        const heartMaterial = new THREE.MeshBasicMaterial({ color: 0xff69b4 });
    
        const bigHeart = new THREE.Mesh(heartGeometry, heartMaterial);
        bigHeart.scale.set(4, 4, 4);
        bigHeart.position.copy(this.helloKitty.position);
    
        this.scene.add(bigHeart);
    
        // Animação de crescimento do coração grande
        new TWEEN.Tween(bigHeart.scale)
            .to({ x: 15, y: 15, z: 15 }, this.explosionFadeout)
            .easing(TWEEN.Easing.Elastic.Out)
            .onComplete(() => {
                this.scene.remove(bigHeart);
            })
            .start();
    
        // Remover partículas após um tempo
        setTimeout(() => {
            this.scene.remove(bigHeart);
            this.scene.remove(particles);
        }, 2500);
    }    
}

// Função para adicionar BombKitties
export function addBombKitties(kitties, scene, world, camera, size = 8, life = 5, speed = 8) {
    const newBombKitty = new BombKitty(scene, world, camera, size, life, speed);
    newBombKitty.init();
    kitties.push(newBombKitty);
}
