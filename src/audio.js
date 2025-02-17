// audio.js

let backgroundMusic;

// Função para carregar e tocar a música
export function playBackgroundMusic() {
    // Criação de um novo objeto de áudio
    backgroundMusic = new Audio('sound_effects/doki doki rock cover.mp3'); // Altere o caminho para a sua música
    backgroundMusic.loop = true; // Configura a música para tocar em loop
    backgroundMusic.volume = 0.5; // Define o volume (0.0 a 1.0)

    // Tocar a música
    backgroundMusic.play().catch(error => {
        console.error('Erro ao tentar reproduzir a música:', error);
    });
}

// Função para parar a música (caso precise)
export function stopBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0; // Reseta para o início da música
    }
}

// Variáveis para armazenar o efeito de som de tiro
let gunshotSound;

// Função para carregar e tocar o efeito de tiro
export function playGunshotSound() {
    const gunshotSound = new Audio('sound_effects/gun_shot.mp3');  // Cria uma nova instância do áudio a cada chamada
    gunshotSound.volume = 0.4;  // Ajuste o volume conforme necessário

    // Toca o som de tiro imediatamente
    gunshotSound.play().catch(error => {
        console.error('Erro ao tentar reproduzir o som de tiro:', error);
    });
}

let isKittyVoicePlaying = false; // Variável para controlar se um som está em reprodução

export function playKittyVoiceLine() {
    if (isKittyVoicePlaying) return; // Impede que um novo som seja iniciado enquanto outro está tocando

    // Lista de sons disponíveis
    const kittyVoiceLines = [
        'sound_effects/hello this is kitty (demon).wav',
        'sound_effects/yeah (demon).wav'
    ];

    // Escolhe um dos sons aleatoriamente
    const randomSound = kittyVoiceLines[Math.floor(Math.random() * kittyVoiceLines.length)];

    // Cria uma nova instância do áudio com o som escolhido
    const kittyVoiceLine = new Audio(randomSound);
    kittyVoiceLine.volume = 0.4; 

    isKittyVoicePlaying = true;

    // Quando o som termina, libera para o próximo
    kittyVoiceLine.onended = () => {
        isKittyVoicePlaying = false;
    };

    // Toca o som e trata erros
    kittyVoiceLine.play().catch(error => {
        console.error('Erro ao tentar reproduzir o som da Kitty:', error);
        isKittyVoicePlaying = false;
    });
}
