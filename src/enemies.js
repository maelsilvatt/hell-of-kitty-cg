// enemies.js

import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

// Variáveis globais para o inimigo
let helloKitty;
let helloKittyBody; // Referência ao corpo físico
let player; // Referência ao jogador
let hello_kitty_size = 6;
let helloKittyLife = 5;  // HP inicial
let lifeBar;  // Referência à barra de vida
let lifeBarMaterial;  // Material da barra de vida
let lifeBarGeometry;  // Geometria da barra de vida
let isDead = false;  // Flag para verificar se a Hello Kitty morreu


// Função para criar a Hello Kitty com a barra de vida
export function createHelloKitty(scene, world, playerInstance, hello_kitty_size = 5) {
    player = playerInstance;

    const loader = new GLTFLoader();
    loader.load('models/hello kitty/scene.gltf', function (gltf) {
        helloKitty = gltf.scene;

        // Ajuste do tamanho da Hello Kitty
        helloKitty.scale.set(hello_kitty_size, hello_kitty_size, hello_kitty_size);

        // Adiciona à cena
        scene.add(helloKitty);

        // Criando a barra de vida após carregar o modelo
        lifeBarGeometry = new THREE.PlaneGeometry(2, 0.2);  // Uma barra retangular
        lifeBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });  // Cor verde para vida cheia
        lifeBar = new THREE.Mesh(lifeBarGeometry, lifeBarMaterial);
        lifeBar.position.y = 2;  // Posiciona a barra acima da Hello Kitty
        helloKitty.add(lifeBar);  // Adiciona a barra de vida como filho da Hello Kitty

    }, undefined, function (error) {
        console.error('Erro ao carregar modelo:', error);
    });

    // Gera uma posição aleatória em torno do jogador com uma distância mínima e máxima
    const minDistance = 10;
    const maxDistance = 50;

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * (maxDistance - minDistance) + minDistance;
    const offsetX = Math.cos(angle) * distance;
    const offsetZ = Math.sin(angle) * distance;

    // Gerando a posição aleatória com base no jogador
    const randomPosition = new CANNON.Vec3(player.position.x + offsetX, 1.5, player.position.z + offsetZ);

    // Criando a física da Hello Kitty (corpo físico)
    let enemy_hitbox_size = 1.5;
    const helloKittyShape = new CANNON.Box(new CANNON.Vec3(enemy_hitbox_size, enemy_hitbox_size, enemy_hitbox_size));
    helloKittyBody = new CANNON.Body({
        mass: 5,
        position: randomPosition,
        linearDamping: 0.5,
        angularDamping: 0.8,
    });
    helloKittyBody.addShape(helloKittyShape);
    world.addBody(helloKittyBody);
}

// Função para diminuir a vida do inimigo
export function decreaseLife(amount) {
    if (isDead) return;  // Se já estiver morta, não faz nada

    helloKittyLife -= amount;
    
    // Se a vida for menor ou igual a 0, a Hello Kitty morre
    if (helloKittyLife <= 0) {
        helloKittyLife = 0;
        isDead = true;  // Marca a Hello Kitty como morta

        // Remove as forças de movimento
        helloKittyBody.velocity.set(0, 0, 0);  // Zera a velocidade
        helloKittyBody.angularVelocity.set(0, 0, 0);  // Zera a velocidade angular
    }

    // Atualiza a cor e o tamanho da barra de vida
    const lifePercentage = helloKittyLife / 5;  // 5 é o HP máximo
    lifeBar.scale.x = lifePercentage;  // Ajusta o tamanho da barra

    // Atualiza a cor com base na vida restante
    if (lifePercentage > 0.5) {
        lifeBarMaterial.color.set(0x00ff00);  // Verde
    } else if (lifePercentage > 0.2) {
        lifeBarMaterial.color.set(0xffff00);  // Amarelo
    } else {
        lifeBarMaterial.color.set(0xff0000);  // Vermelho
    }
}

// Função para mover o inimigo em direção ao jogador
export function updateHelloKittyMovement() {
    if (!player || !helloKittyBody || !helloKitty || isDead) return;  // Não faz nada se a Hello Kitty estiver morta

    const playerPos = new CANNON.Vec3(player.position.x, player.position.y, player.position.z);
    const enemyPos = helloKittyBody.position;

    const distanceToPlayer = playerPos.distanceTo(enemyPos);
    const minDistance = 4;

    if (distanceToPlayer < minDistance) {
        const direction = new CANNON.Vec3();
        direction.x = enemyPos.x - playerPos.x;
        direction.y = enemyPos.y - playerPos.y;
        direction.z = enemyPos.z - playerPos.z;

        direction.normalize();
        const speed = 10;
        const forceMagnitude = helloKittyBody.mass * speed;
        helloKittyBody.applyForce(direction.scale(forceMagnitude), helloKittyBody.position);
    } else {
        const direction = new CANNON.Vec3();
        direction.x = playerPos.x - enemyPos.x;
        direction.y = playerPos.y - enemyPos.y;
        direction.z = playerPos.z - enemyPos.z;

        direction.normalize();
        const speed = 10;
        const forceMagnitude = helloKittyBody.mass * speed;
        helloKittyBody.applyForce(direction.scale(forceMagnitude), helloKittyBody.position);
    }

    // Pegar posição do jogador e da Hello Kitty
    const kittyPos = helloKitty.position.clone();
    const playerPosClone = player.position.clone();

    // Ignorar a diferença de altura (Eixo Y)
    kittyPos.y = 0;
    playerPosClone.y = 0;

    // Calcular a direção no plano XZ
    const direction = new THREE.Vector3();
    direction.subVectors(playerPosClone, kittyPos).normalize();

    // Calcular ângulo no eixo Y (usando atan2)
    let angle = Math.atan2(direction.x, direction.z);

    // 🔹 Ajuste de rotação se a Hello Kitty estiver desalinhada
    angle -= Math.PI / 2; // Tente trocar para Math.PI ou -Math.PI/2 se necessário

    // Aplicar a rotação apenas no eixo Y
    helloKitty.rotation.set(0, angle, 0);
}

// Exporta as variáveis para uso no main.js
export { helloKitty, helloKittyBody, helloKittyLife };