import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

export class HelloKitty {
    constructor(scene, world, player, size = 5, life = 5, speed = 15) {
        this.scene = scene;
        this.world = world;
        this.player = player;
        this.size = size;
        this.life = life;
        this.speed = speed;
        this.isDead = false;
        this.helloKitty = null;
        this.lifeBar = null;
        this.body = null;

        this.init();
    }

    init() {
        // Criar o corpo físico e pegar a posição gerada
        const spawnPosition = this.createPhysicsBody();
    
        const loader = new GLTFLoader();
        loader.load('models/hello kitty/scene.gltf', (gltf) => {
            this.helloKitty = gltf.scene;
            this.helloKitty.scale.set(this.size, this.size, this.size);
    
            // Garantir que o modelo aparece na posição do corpo físico
            this.helloKitty.position.set(spawnPosition.x, spawnPosition.y, spawnPosition.z);
    
            // Criar barra de vida
            const lifeBarGeometry = new THREE.PlaneGeometry(2 * (this.size * 0.3), 0.2);
            this.lifeBarMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x00ff00, 
                side: THREE.DoubleSide // Garantir que é visível dos dois lados
            });
    
            this.lifeBar = new THREE.Mesh(lifeBarGeometry, this.lifeBarMaterial);
            this.lifeBar.position.set(spawnPosition.x, spawnPosition.y + this.size, spawnPosition.z);
    
            // Criar um grupo para o inimigo e a barra de vida
            const enemyGroup = new THREE.Group();
            enemyGroup.add(this.helloKitty);
            enemyGroup.add(this.lifeBar);
            this.scene.add(enemyGroup);
    
            console.log("Modelo carregado:", this.helloKitty);
            console.log("Barra de vida adicionada:", this.lifeBar);
        }, undefined, (error) => {
            console.error('Erro ao carregar modelo:', error);
        });
    }    

    createPhysicsBody() {
        const minDistance = 10;
        const maxDistance = 50;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (maxDistance - minDistance) + minDistance;
        const offsetX = Math.cos(angle) * distance;
        const offsetZ = Math.sin(angle) * distance;
        const position = new CANNON.Vec3(this.player.position.x + offsetX, 1.5, this.player.position.z + offsetZ);

        const shape = new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 1.5));
        this.body = new CANNON.Body({ mass: 5, position, linearDamping: 0.5, angularDamping: 0.8 });
        this.body.addShape(shape);
        this.world.addBody(this.body);

        return position;
    }

    decreaseLife(amount) {
        if (this.isDead) return;

        this.life -= amount;
        if (this.life <= 0) {
            this.life = 0;
            this.isDead = true;
            this.body.velocity.set(0, 0, 0);
            this.body.angularVelocity.set(0, 0, 0);
        }

        const lifePercentage = this.life / 5;
        this.lifeBar.scale.x = lifePercentage;

        if (lifePercentage > 0.5) {
            this.lifeBarMaterial.color.set(0x00ff00);
        } else if (lifePercentage > 0.2) {
            this.lifeBarMaterial.color.set(0xffff00);
        } else {
            this.lifeBarMaterial.color.set(0xff0000);
        }
    }

    updateMovement(player) {
        if (!player || !this.body || !this.helloKitty || this.isDead) return;
    
        const playerPos = new CANNON.Vec3(player.position.x, player.position.y, player.position.z);
        const enemyPos = this.body.position;
        const distanceToPlayer = playerPos.distanceTo(enemyPos);
        const minDistance = 4;
    
        let direction = new CANNON.Vec3();
        if (distanceToPlayer < minDistance) {
            direction.set(enemyPos.x - playerPos.x, 0, enemyPos.z - playerPos.z);
        } else {
            direction.set(playerPos.x - enemyPos.x, 0, playerPos.z - enemyPos.z);
        }
    
        direction.normalize();
        const forceMagnitude = this.body.mass * this.speed;
        
        // Aplicar força corretamente
        const force = new CANNON.Vec3(
            direction.x * forceMagnitude,
            direction.y * forceMagnitude,
            direction.z * forceMagnitude
        );
        this.body.applyForce(force, this.body.position);
    
        // Ajuste a rotação da boneca para olhar para o player
        const kittyPos = this.helloKitty.position.clone();
        const playerPosClone = player.position.clone();
        kittyPos.y = 0;
        playerPosClone.y = 0;
    
        const lookDirection = new THREE.Vector3();
        lookDirection.subVectors(playerPosClone, kittyPos).normalize();
        let angle = Math.atan2(lookDirection.x, lookDirection.z) - Math.PI / 2;
        this.helloKitty.rotation.set(0, angle, 0);
    
        // Ajustar a posição da Hello Kitty para seguir a física
        this.helloKitty.position.copy(this.body.position);
    
        // Ajustar barra de vida para olhar para o player
        this.lifeBar.lookAt(this.player.position);
        this.lifeBar.position.set(this.helloKitty.position.x, this.helloKitty.position.y + this.size, this.helloKitty.position.z);
    }    
}
