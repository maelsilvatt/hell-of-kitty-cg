// player_stats.js

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { camera } from './controls';
import { showGameOverScreen } from './gameProgress';

// Criar uma câmera ortográfica para a interface (HUD)
const aspect = window.innerWidth / window.innerHeight;
export const uiCamera = new THREE.OrthographicCamera(
    -aspect, aspect, 1, -1, 0.1, 10
);
export const uiScene = new THREE.Scene();

export class Player {
    constructor(scene, uiScene, uiCamera, world, life = 100) {
        this.scene = scene;
        this.uiScene = uiScene;
        this.uiCamera = uiCamera;
        this.world = world;
        this.life = life;
        this.isDead = false;
        this.lifeBar = null;
        this.body = null;
        this.points = 0;
        this.scoreText = null;

        // DEBUG
        this.debugCube = null; 

        this.init();
    }

    init() {
        // Criar o corpo físico
        this.createPhysicsBody();

        // Cria a barra de vida
        this.createLifeBar();

        // Cria o score de pontos
        this.createScoreIndicator()
    }    

    // Cria o corpo físico do jogador
    createPhysicsBody() {        
        const size = 8;
        const position = new CANNON.Vec3(camera.position.x, this.size / 2, camera.position.z);

        const shape = new CANNON.Box(new CANNON.Vec3(size / 4, size / 2, size / 4));
        this.body = new CANNON.Body({ mass: 0.5, position, linearDamping: 0, angularDamping: 1 });
        this.body.addShape(shape);
        this.world.addBody(this.body);
    }

    // Cria a barra de vida do jogador
    createLifeBar() {
        // Criar o contêiner da barra de vida
        this.lifeBarContainer = document.createElement('div');
        this.lifeBarContainer.style.position = 'absolute';
        this.lifeBarContainer.style.bottom = '10px';
        this.lifeBarContainer.style.left = '10px';
        this.lifeBarContainer.style.width = '300px'; // Largura fixa
        this.lifeBarContainer.style.height = '20px'; // Altura fixa
        this.lifeBarContainer.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // Fundo vermelho semitransparente
        this.lifeBarContainer.style.border = '2px solid white';
        this.lifeBarContainer.style.borderRadius = '5px';
        
        // Criar a barra de vida interna (verde)
        this.lifeBar = document.createElement('div');
        this.lifeBar.style.width = '100%'; // Começa cheia
        this.lifeBar.style.height = '100%';
        this.lifeBar.style.backgroundColor = 'limegreen';
        this.lifeBar.style.borderRadius = '3px';
    
        // Adicionar a barra dentro do contêiner
        this.lifeBarContainer.appendChild(this.lifeBar);
        document.body.appendChild(this.lifeBarContainer);
    }
    
    // Método para atualizar a vida
    updateLifeBar(healthPercentage) {
        // healthPercentage deve estar entre 0 e 100
        this.lifeBar.style.width = `${Math.max(0, Math.min(healthPercentage, 100))}%`;
    }

    // Diminui a vida do jogador
    decreaseLife(amount) {
        if (this.isDead) return;

        this.life -= amount;

        // Se o jogador morreu
        if (this.life <= 0) {
            this.life = 0;
            this.isDead = true;

            // Exibe a tela de game over
            showGameOverScreen();
        }

        // Se o jogador está vivo, a barra de vida diminui
        this.updateLifeBar(this.life);
    }

    // Sincroniza a posição do jogador com o corpo físico
    updateBody(){
        this.body.position.set(
            camera.position.x,
            camera.position.y - this.size / 2,
            camera.position.z
        );
    }

    // Cria o indicador de pontuação
    createScoreIndicator() {
        this.scoreElement = document.createElement('div');
        this.scoreElement.style.position = 'absolute';
        this.scoreElement.style.top = '10px';
        this.scoreElement.style.left = '10px';
        this.scoreElement.style.color = 'white';
        this.scoreElement.style.fontSize = '20px';
        this.scoreElement.style.fontFamily = 'Arial, sans-serif';
        this.scoreElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.scoreElement.style.padding = '5px 10px';
        this.scoreElement.innerText = `Score: ${this.points}`;
    
        document.body.appendChild(this.scoreElement);
    }
    
    // Método para atualizar a pontuação
    increasePoints(newPoints) {
        this.points += newPoints;
    
        if (this.scoreElement) {
            this.scoreElement.innerText = `Score: ${this.points}`;
        }
    }

    // DEBUG
    initDebugCube(scene){
        // Inicializando o cubo de debug na primeira vez
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
        const size = 8;
        const geometry = new THREE.BoxGeometry(size / 2, size, size / 2);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        const cube = new THREE.LineSegments(edges, material);

        // Posiciona o cubo exatamente onde está o body
        cube.position.copy(this.body.position);

        return cube;
    }
}
