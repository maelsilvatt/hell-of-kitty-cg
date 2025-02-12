// enemies.js

import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Variáveis globais para o inimigo
let helloKitty;
let helloKittyBody; // Referência ao corpo físico
let player; // Referência ao jogador
let hello_kitty_size = 6;

export function createHelloKitty(scene, world, playerInstance, hello_kitty_size=5) {
    // Atribuindo o jogador passado como parâmetro
    player = playerInstance;

    const loader = new GLTFLoader();
    loader.load('models/hello kitty/scene.gltf', function (gltf) {
        helloKitty = gltf.scene;

        // Ajuste do tamanho da Hello Kitty
        helloKitty.scale.set(hello_kitty_size, hello_kitty_size, hello_kitty_size);

        // Adiciona à cena
        scene.add(helloKitty);
    }, undefined, function (error) {
        console.error('Erro ao carregar modelo:', error);
    });

    // Distância mínima do jogador
    const minDistance = 10;
    const maxDistance = 50;

    // Gera uma posição aleatória em torno do jogador com uma distância mínima e máxima
    const angle = Math.random() * Math.PI * 2; // Aleatório em torno do círculo (360 graus)
    const distance = Math.random() * (maxDistance - minDistance) + minDistance; // Distância aleatória dentro do intervalo
    const offsetX = Math.cos(angle) * distance;
    const offsetZ = Math.sin(angle) * distance;

    // Gerando a posição aleatória com base no jogador
    const randomPosition = new CANNON.Vec3(player.position.x + offsetX, 1.5, player.position.z + offsetZ);

    // Criando a física da Hello Kitty (corpo físico)
    let enemy_hitbox_size = 1.5;

    const helloKittyShape = new CANNON.Box(new CANNON.Vec3(enemy_hitbox_size, enemy_hitbox_size, enemy_hitbox_size)); // Ajuste para o tamanho real
    helloKittyBody = new CANNON.Body({
        mass: 1, // Massa ajustada para o tamanho maior
        position: randomPosition, // A posição aleatória gerada
        linearDamping: 0.5, // Resistência ao movimento
        angularDamping: 0.8, // Evita giros excessivos
    });
    helloKittyBody.addShape(helloKittyShape);

    world.addBody(helloKittyBody);
}

// Função para mover o inimigo em direção ao jogador
export function updateHelloKittyMovement() {
    if (!player || !helloKittyBody || !helloKitty) return;

    // Criando os vetores de posição do jogador e do inimigo
    const playerPos = new CANNON.Vec3(player.position.x, player.position.y, player.position.z);
    const enemyPos = helloKittyBody.position;

    // Criando a direção entre o inimigo e o jogador
    const direction = new CANNON.Vec3();
    direction.x = playerPos.x - enemyPos.x;
    direction.y = playerPos.y - enemyPos.y;
    direction.z = playerPos.z - enemyPos.z;

    // Normalizando o vetor para manter a direção
    direction.normalize();

    const speed = 10; // Velocidade do inimigo
    const forceMagnitude = helloKittyBody.mass * speed; // A força a ser aplicada

    // Aplica a força de movimento na direção do jogador
    helloKittyBody.applyForce(direction.scale(forceMagnitude), helloKittyBody.position);

    // Girar a Hello Kitty (modelo 3D) para olhar na direção do jogador
    helloKitty.lookAt(player.position); // Faz o modelo 3D olhar para o jogador
}

// Exporta as variáveis para uso no main.js
export { helloKitty, helloKittyBody };
