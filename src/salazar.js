import * as CANNON from 'cannon-es';
import { playSalazarVoiceLine, playSalazarGunshotSound } from './audio.js';
import * as THREE from 'three';

export class Salazar {
    constructor(scene, world, camera, size = 50, life = 100, speed = 7) {
        this.scene = scene;
        this.world = world;
        this.camera = camera;
        this.size = size;
        this.life = life;
        this.speed = speed;
        this.isDead = false;
        this.salazar = null;
        this.handRight = null;
        this.handLeft = null;
        this.salazar_fire = null;
        this.lifeBar = null;
        this.body = null;

        // DEBUG
        this.debugCube = null; 

        this.init();
    }

    init() {
        // Criar o corpo físico
        this.createPhysicsBody();

        // Carregar a foto do Salazar
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('images/Final boss/Ialis (lacinho).png', (texture) => {
            // Criar um plano para exibir a imagem
            const imageGeometry = new THREE.PlaneGeometry(this.size, this.size);
            const imageMaterial = new THREE.MeshBasicMaterial({ 
                map: texture, 
                side: THREE.DoubleSide,
                transparent: true
        });

        this.salazar = new THREE.Mesh(imageGeometry, imageMaterial);

        // Criar mão direita
        const hands_size = this.size / 2.2;

        const handRightMaterial = new THREE.MeshBasicMaterial({
            map: createVideoTexture('images/Final boss/floating_hand.webm'), // Caminho do WebM com transparência
            side: THREE.DoubleSide,
            transparent: true
        });
        this.handRight = new THREE.Mesh(new THREE.PlaneGeometry(hands_size, hands_size), handRightMaterial);

        // Criar mão esquerda (invertida)
        const handLeftMaterial = handRightMaterial.clone();
        this.handLeft = new THREE.Mesh(new THREE.PlaneGeometry(hands_size, hands_size), handLeftMaterial);
        this.handLeft.scale.x = -1; // Inverte horizontalmente
 
        // Criar o fogo do Salazar
        const salazar_fire_size = hands_size / 2;

        const salazarFireMaterial = new THREE.MeshBasicMaterial({
            map: createVideoTexture('images/Final boss/salazar_fire.webm'),
            side: THREE.DoubleSide,  // Garante que o plano seja visível dos dois lados
            transparent: true,
            depthWrite: false,       // Impede que a transparência afete a profundidade
            depthTest: true,         // Mantém o teste de profundidade ativado
        });        

        this.salazar_fire = new THREE.Mesh(new THREE.PlaneGeometry(salazar_fire_size, salazar_fire_size), salazarFireMaterial);

        // Criar a barra de vida do Salazar
        const lifeBarGeometry = new THREE.PlaneGeometry(2 * (this.size * 0.3), 2);
        this.lifeBarMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            side: THREE.DoubleSide
        });

        this.lifeBar = new THREE.Mesh(lifeBarGeometry, this.lifeBarMaterial);    
        const lifePercentage = this.life / 200;
        this.lifeBar.scale.x = lifePercentage;  

        // DEBUG
        // this.initSalazarDebugCube(this.scene);

        // Criar um grupo para o inimigo e a barra de vida
        const enemyGroup = new THREE.Group();
        enemyGroup.add(this.salazar);
        enemyGroup.add(this.handRight);
        enemyGroup.add(this.handLeft);
        enemyGroup.add(this.lifeBar);
        this.scene.add(enemyGroup);
        }, undefined, (error) => {
            console.error('Erro ao carregar imagem:', error);
        });

    }    

    createPhysicsBody() {
        const minDistance = 80;
        const maxDistance = 100;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (maxDistance - minDistance) + minDistance;
        const offsetX = Math.cos(angle) * distance;
        const offsetZ = Math.sin(angle) * distance;
        const position = new CANNON.Vec3(this.camera.position.x + offsetX, this.size / 2, this.camera.position.z + offsetZ);

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
            this.body.allowSleep = false; // Impede que ela congele
        }

        const lifePercentage = this.life / 200;
        this.lifeBar.scale.x = lifePercentage;

        if (lifePercentage > 0.5) {
            this.lifeBarMaterial.color.set(0x00ff00);
        } else if (lifePercentage > 0.2) {
            this.lifeBarMaterial.color.set(0xffff00);
        } else {
            this.lifeBarMaterial.color.set(0xff0000);
        }
    }

    // Atualiza a movimentação do Salazar
        updateMovement(player) {
        if (!player || !this.body || !this.salazar || this.isDead) return;
    
        const playerPos = new CANNON.Vec3(player.position.x, player.position.y, player.position.z);
        const enemyPos = this.body.position;
        const distanceToPlayer = playerPos.distanceTo(enemyPos);
        const minDistance = 2;
    
        let direction = new CANNON.Vec3();
    
        // Lógica de movimento mais robusta
        if (distanceToPlayer > minDistance) {
            // Vai atrás do jogador se a distância for maior que o mínimo
            direction.set(playerPos.x - enemyPos.x, 0, playerPos.z - enemyPos.z);
        } else if (distanceToPlayer < minDistance) {
            // Afasta-se do jogador se estiver muito perto
            direction.set(enemyPos.x - playerPos.x, 0, enemyPos.z - playerPos.z);
        }
    
        // Normaliza a direção para garantir que o movimento seja consistente
        direction.normalize();
    
        // A magnitude da força será ajustada em função da distância
        let forceMagnitude = this.body.mass * this.speed;
    
        // Se a distância for muito pequena, aplicar um valor mínimo de força
        if (distanceToPlayer < minDistance && forceMagnitude < 5) {
            forceMagnitude = 20;  // Define um valor mínimo para garantir o movimento
        }
    
        // Aplique a força considerando a direção e a intensidade
        const force = new CANNON.Vec3(
            direction.x * forceMagnitude,
            0,  // Manter o movimento no plano XZ
            direction.z * forceMagnitude
        );
    
        // Aplica a força na física
        this.body.applyForce(force, this.body.position);
    
        // Sincroniza a posição do Salazar com o corpo físico
        this.salazar.position.set(
            this.body.position.x,
            this.body.position.y + this.size / 5,
            this.body.position.z
        );

        // Faz o Salazar sempre olhar para o jogador
        this.salazar.lookAt(this.camera.position);

        // Criamos deslocamentos relativos em um espaço local (esquerda e direita)
        const offsetLeft = new THREE.Vector3(this.size / 1.5, 0, 0);  // Mão esquerda ao lado
        const offsetRight = new THREE.Vector3(-this.size / 1.5, 0, 0);  // Mão direita ao lado

        // Rotacionamos esses vetores com base na rotação do Salazar
        offsetLeft.applyQuaternion(this.salazar.quaternion);
        offsetRight.applyQuaternion(this.salazar.quaternion);

        // Aplicamos a posição do Salazar para mover as mãos corretamente
        this.handLeft.position.copy(this.salazar.position).add(offsetLeft);
        this.handRight.position.copy(this.salazar.position).add(offsetRight);

        // Mantemos a rotação das mãos sincronizada com a do Salazar
        this.handRight.rotation.copy(this.salazar.rotation);
        this.handLeft.rotation.copy(this.salazar.rotation);

        // Faz as mãos olharem para o jogador
        this.handRight.lookAt(this.camera.position);
        this.handLeft.lookAt(this.camera.position);

        // Dispara o foguinho aleatoriamente
        if (Math.random() < 0.01) {
            this.fireAtPlayer(player);            
        }

        // Ajustar a barra de vida para olhar para o jogador
        this.lifeBar.lookAt(this.camera.position);
        this.lifeBar.position.set(this.salazar.position.x, this.salazar.position.y + 0.7 *  this.size, this.salazar.position.z);
    }     

    // Função responsável pelo ataques de Salazar contra o jogador
    fireAtPlayer(camera) {
        if (!this.salazar || !this.salazar_fire || !camera) return;

        // Toca o efeito sonoro
        playSalazarGunshotSound();
    
        // Cria um novo foguinho baseado no original
        const fireball = this.salazar_fire.clone();
        this.scene.add(fireball);
    
        // Define a posição inicial do foguinho (mão direita de Salazar)
        fireball.position.set(this.handRight.position.x, this.handRight.position.y + 3, this.handRight.position.z);
    
        // Cria um corpo físico para o foguinho
        const hands_size = this.size / 2.2;
        const fireBody = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Sphere(hands_size / 2),
            material: new CANNON.Material({ friction: 0, restitution: 0.2 })
        });
    
        // Define a posição inicial do corpo físico
        fireBody.position.copy(fireball.position);
        this.world.addBody(fireBody);
    
        // Calcular a direção do disparo em relação ao jogador
        const direction = new CANNON.Vec3(
            camera.position.x - fireBody.position.x,
            camera.position.y - fireBody.position.y,
            camera.position.z - fireBody.position.z
        );
    
        if (direction.length() === 0) {
            direction.set(0, 1, 0); // Se for zero, lança para cima
        } else {
            direction.normalize();
        }
    
        // Definir a velocidade do foguinho
        const fireSpeed = 100;
        fireBody.velocity.set(
            direction.x * fireSpeed,
            direction.y * fireSpeed,
            direction.z * fireSpeed
        );
    
        // Atualiza a posição e a rotação do foguinho conforme ele se move
        const updateFireball = () => {
            if (fireball && fireBody) {
                fireball.position.copy(fireBody.position);
    
                // Faz o foguinho olhar na direção que está indo
                const futurePosition = fireball.position.clone().add(new THREE.Vector3(
                    fireBody.velocity.x,
                    fireBody.velocity.y,
                    fireBody.velocity.z
                ).normalize());

                fireball.lookAt(futurePosition);
                requestAnimationFrame(updateFireball);
            }
        };
        updateFireball();
    
        // Define o tempo de vida do projétil
        setTimeout(() => {
            removeFireball();
        }, 5000);
    
        // Função para remover o projétil corretamente
        const removeFireball = () => {
            if (fireBody && this.world.bodies.includes(fireBody)) {
                this.world.removeBody(fireBody);
            }
            if (fireball && this.scene.children.includes(fireball)) {
                this.scene.remove(fireball);
            }
        };
    }      

    // DEBUG
    initSalazarDebugCube(scene){
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

// Função para atualizar o Salazar no jogo
export function updateSalazar(salazar, scene, camera){
    if (salazar) {
        // Atualiza o movimento da kitty
        if (!salazar.isDead){
            salazar.updateMovement(camera);

            // Toca um som aleatoriamente
            if (Math.random() < 0.015) {
                playSalazarVoiceLine();
            }
        }

        // DEBUG

        //Atualiza o cubo de debug
        // salazar.updateDebugCube();

        // Remove o cubo de debug se salazar estiver morto
        if (salazar.isDead || salazar.life < 1) {
            if (salazar.debugCube) {
            scene.remove(salazar.debugCube);
            salazar.debugCube = null;
            }
        };
    }
}

// Cria o Salazar no mundo
export function spawnSalazar(scene, world, camera){
    const salazar = new Salazar(scene, world, camera);
    return salazar;
}


// Cria uma textura com base em um video webM
const createVideoTexture = (url) => {
    const video = document.createElement('video');
    video.src = url;
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.setAttribute('playsinline', ''); // Necessário para funcionar no mobile
    video.play();

    const texture = new THREE.VideoTexture(video);
    texture.format = THREE.RGBAFormat; // Mantém transparência
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    return texture;
};

