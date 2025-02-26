import * as CANNON from 'cannon-es';
import { playKittyVoiceLine } from './audio.js';;
import * as THREE from 'three';
import { models } from './loadModels.js';

export class HelloKitty {
    constructor(scene, world, player, size = 5, life = 5, speed = 7) {
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
        this.lastDamageTime = 0; // Inicializa o tempo do último dano
        this.damageCooldown = 500; // Tempo de espera entre danos (em milissegundos)

        // DEBUG
        this.debugCube = null; 
    }

    init() {
        // Criar o corpo físico
        this.createPhysicsBody();
                    
        if (!models.helloKitty) {
            console.error("❌ Modelo Hello Kitty ainda não carregado!");
            return;
        }
    
        this.helloKitty = models.helloKitty.clone();
        
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

    createPhysicsBody() {
        const minDistance = 40;
        const maxDistance = 60;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (maxDistance - minDistance) + minDistance;
        const offsetX = Math.cos(angle) * distance;
        const offsetZ = Math.sin(angle) * distance;
        const position = new CANNON.Vec3(this.player.position.x + offsetX, this.size / 2, this.player.position.z + offsetZ);

        const shape = new CANNON.Box(new CANNON.Vec3(this.size / 4, this.size / 2, this.size / 4));
        this.body = new CANNON.Body({ mass: 5, position, linearDamping: 0.4, angularDamping: 0.8 });
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
        
            // Zerar velocidade
            this.body.velocity.set(0, this.body.velocity.y, 0); // Mantém a gravidade no eixo Y
            this.body.angularVelocity.set(0, 0, 0);
        
            // Permitir que a boneca tombe naturalmente
            this.body.type = CANNON.Body.DYNAMIC;
            this.body.allowSleep = false; // Impede que ela congele antes de cair

            // Sincroniza a posição da boneca com o corpo físico
            this.helloKitty.position.set(
                this.body.position.x,
                0.3,
                this.body.position.z
            );
            this.helloKitty.rotation.x = -Math.PI / 2; // Rotaciona 90° no eixo X para deitar
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

    updateMovement(camera, player) {
        if (!camera || !this.body || !this.helloKitty || this.isDead) return;
    
        const cameraPos = new CANNON.Vec3(camera.position.x, camera.position.y, camera.position.z);
        const enemyPos = this.body.position;
        const distanceToCamera = cameraPos.distanceTo(enemyPos);
        const minDistance = 2;
    
        let direction = new CANNON.Vec3();
    
        // Lógica de movimento mais robusta
        if (distanceToCamera > minDistance) {
            // Vai atrás da câmera se a distância for maior que o mínimo
            direction.set(cameraPos.x - enemyPos.x, 0, cameraPos.z - enemyPos.z);
        } else if (distanceToCamera < minDistance) {
            // Afasta-se da câmera se estiver muito perto
            direction.set(enemyPos.x - cameraPos.x, 0, enemyPos.z - cameraPos.z);
        }
    
        // Normaliza a direção para garantir que o movimento seja consistente
        direction.normalize();
    
        // A magnitude da força será ajustada em função da distância
        let forceMagnitude = this.body.mass * this.speed;
    
        // Se a distância for muito pequena, aplicar um valor mínimo de força
        if (distanceToCamera < minDistance && forceMagnitude < 5) {
            forceMagnitude = 20;  // Define um valor mínimo para garantir o movimento
            
        }

        // Verifica se a kitty tocou no jogador e se o cooldown já passou
        const currentTime = Date.now();
        if (distanceToCamera < minDistance && currentTime - this.lastDamageTime > this.damageCooldown) {
            player.decreaseLife(5); // Diminui em 5 pontos a vida do jogador
            this.lastDamageTime = currentTime; // Atualiza o tempo do último dano
        }
        // Aplique a força considerando a direção e a intensidade
        const force = new CANNON.Vec3(
            direction.x * forceMagnitude,
            0,  // Manter o movimento no plano XZ
            direction.z * forceMagnitude
        );
    
        // Aplica a força na física
        this.body.applyForce(force, this.body.position);
    
        // Ajuste a rotação da boneca para olhar para a câmera
        const kittyPos = this.helloKitty.position.clone();
        const cameraPosClone = camera.position.clone();
        kittyPos.y = 0; // Ignorar a altura para rotação
        cameraPosClone.y = 0;
    
        const lookDirection = new THREE.Vector3();
        lookDirection.subVectors(cameraPosClone, kittyPos).normalize();
        let angle = Math.atan2(lookDirection.x, lookDirection.z) - Math.PI / 2;
        this.helloKitty.rotation.set(0, angle, 0);
    
        // Sincroniza a posição da boneca com o corpo físico
        this.helloKitty.position.set(
            this.body.position.x,
            this.body.position.y - this.size / 2,
            this.body.position.z
        );
    
        // Ajustar a barra de vida para olhar para a câmera
        this.lifeBar.lookAt(camera.position);
        this.lifeBar.position.set(this.helloKitty.position.x, this.helloKitty.position.y + this.size, this.helloKitty.position.z);
    }

    // DEBUG
    initKittyDebugCube(scene){
        // Inicializando o cubo de debug na primeira vez que a Kitty é criada ou quando necessário
        if (!this.debugCube) {  // Verifica se o cubo de debug já foi criado
            this.debugCube = this.createDebugCube(this.body);  // Cria o cubo de debug
            scene.add(this.debugCube);  // Adiciona à cena
        }
    }

    updateDebugCube(){
        if (this.debugCube) {
            // Posiciona o cubo exatamente onde está o body
            this.debugCube.position.copy(this.body.position);
        }
    }

    createDebugCube() {
        // Cria uma geometria de linha (com bordas) com as dimensões do body
        const geometry = new THREE.BoxGeometry(this.size / 2, this.size, this.size / 2);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        const cube = new THREE.LineSegments(edges, material);

        // Posiciona o cubo exatamente onde está o body
        cube.position.copy(this.body.position);

        return cube;
    }
}

// Função para adicionar uma Hello Kitty
export function addKitties(kitties, scene, world, camera, size = 8, life = 5, speed = 8) {
  const newKitty = new HelloKitty(scene, world, camera, size, life, speed);
  newKitty.init();
  kitties.push(newKitty);
}

// Função para atualizar as kitties no jogo
export function updateKitties(player, kitties, scene, camera){
    for (const kitty of kitties) {
        // Atualiza o movimento da kitty
        if (!kitty.isDead){
            kitty.updateMovement(camera, player);

            // Toca um som aleatoriamente
            if (Math.random() < 0.001) {
                playKittyVoiceLine();
            }
        }

        // DEBUG

        // Atualiza o cubo de debug
        // kitty.updateDebugCube();

        // // Remove o cubo de debug se a kitty estiver morta
        // if (kitty.isDead || kitty.life < 1) {
        //     if (kitty.debugCube) {
        //     scene.remove(kitty.debugCube);
        //     kitty.debugCube = null;
        //     }
        // };
    }
}
