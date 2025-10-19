import Track from '../util/Track.js';
import Player from '../entities/Player.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    
    this.player = null;
    this.tracks = null;
    this.score = 0;
    this.highscore = 0;
    this.infoPanel = null;
    this.scoreTimer = null;
    this.scoreText = null;
    this.highscoreText = null;
  }

  create() {
    this.score = 0;
    this.highscore = this.registry.get('highscore') || 0;

    // Fondo
    this.add.image(512, 384, 'background');

    // Crear las 4 pistas
    this.tracks = [
      new Track(this, 0, 196),
      new Track(this, 1, 376),
      new Track(this, 2, 536),
      new Track(this, 3, 700)
    ];

    // CORREGIDO: Crear el PLAYER (defensor) que el jugador controla
    this.player = new Player(this, this.tracks[0]);

    // Overlay UI
    this.add.image(0, 0, 'overlay').setOrigin(0);

    // Paneles de score (si tienes los sprites)
    // this.add.image(16, 0, 'sprites', 'panel-score').setOrigin(0);
    // this.add.image(1024-16, 0, 'sprites', 'panel-best').setOrigin(1, 0);

    // Panel de información inicial
    this.infoPanel = this.add.image(512, 384, 'controls');

    // Textos de puntuación
    this.scoreText = this.add.text(140, 2, this.score, { 
      fontFamily: 'Arial', 
      fontSize: 32, 
      color: '#ffffff' 
    });

    this.highscoreText = this.add.text(820, 2, this.highscore, { 
      fontFamily: 'Arial', 
      fontSize: 32, 
      color: '#ffffff' 
    });

    // Esperar tecla para iniciar
    this.input.keyboard.once('keydown-SPACE', this.start, this);
    this.input.keyboard.once('keydown-UP', this.start, this);
    this.input.keyboard.once('keydown-DOWN', this.start, this);
  }

  start() {
    // Remover listeners de inicio
    this.input.keyboard.removeAllListeners();

    // Animar panel de información
    this.tweens.add({
      targets: this.infoPanel,
      y: 700,
      alpha: 0,
      duration: 500,
      ease: 'Power2'
    });

    // CORREGIDO: Iniciar el player (defensor)
    this.player.start();

    // Iniciar las pistas con diferentes delays
    this.tracks[0].start(4000, 8000);
    this.tracks[1].start(500, 1000);
    this.tracks[2].start(5000, 9000);
    this.tracks[3].start(6000, 10000);

    // Timer de puntuación (incrementa cada segundo)
    this.scoreTimer = this.time.addEvent({ 
      delay: 1000, 
      callback: () => {
        this.score++;
        this.scoreText.setText(this.score);
      }, 
      callbackScope: this, 
      repeat: -1 
    });
  }

  gameOver() {
    // Cambiar a panel de game over
    this.infoPanel.setTexture('gameover');

    this.tweens.add({
      targets: this.infoPanel,
      y: 384,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });

    // Detener todas las pistas
    this.tracks.forEach((track) => {
      track.stop();
    });

    // Detener audio
    this.sound.stopAll();
    
    if (this.sound.get('gameover')) {
      this.sound.play('gameover');
    }

    // Detener el player
    this.player.stop();

    // Detener timer de puntuación
    this.scoreTimer.destroy();

    // Actualizar highscore si es necesario
    if (this.score > this.highscore) {
      this.highscoreText.setText('NEW!');
      this.registry.set('highscore', this.score);
    }

    // Esperar tecla para volver al menú
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('MenuScene');
    }, this);

    this.input.once('pointerdown', () => {
      this.scene.start('MenuScene');
    }, this);
  }
}