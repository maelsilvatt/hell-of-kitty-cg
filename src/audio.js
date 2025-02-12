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
