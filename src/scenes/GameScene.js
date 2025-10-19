import Track from '../util/Track.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import PlayerShoot from '../entities/PlayerShoot.js';
import EnemyShoot from '../entities/EnemyShoot.js';

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

    // grupos físicos
    this.enemies = null;
    this.playerProjectiles = null;
    this.enemyProjectiles = null;
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

    // Crear los grupos físicos
    this.enemies = this.physics.add.group();
    this.playerProjectiles = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();

    // Crear el PLAYER (defensor)
    this.player = new Player(this, this.tracks[0]);
    this.player.start();

    // Overlay UI
    this.add.image(0, 0, 'overlay').setOrigin(0);

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

    // Overlaps
    this.physics.add.overlap(this.playerProjectiles, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.enemyProjectiles, this.player, this.hitPlayer, null, this);

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

    // Iniciar el player (defensor)
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

  // ===========================================
  //  FUNCIONES NUEVAS  🧨
  // ===========================================

  // Disparo del jugador (ratón)
  throwPlayerSnowball(x, y) {
    const snowball = new PlayerShoot(this, x, y, 'projectile');
    this.add.existing(snowball);
    this.physics.add.existing(snowball);
    snowball.fire(x, y);
    this.playerProjectiles.add(snowball);
  }

  // Disparo del enemigo (gato)
  throwEnemySnowball(x, y) {
    const snowball = new EnemyShoot(this, x, y, 'projectile');
    this.add.existing(snowball);
    this.physics.add.existing(snowball);
    snowball.fire(x, y);
    this.enemyProjectiles.add(snowball);
  }

  // Cuando bala del jugador impacta enemigo
  hitEnemy(projectile, enemy) {
    if (!enemy.isAlive || !projectile.active) return;

    // Desactivar proyectil
    if (projectile.stop) projectile.stop();
    projectile.setActive(false).setVisible(false);

    // Ejecutar reacción de golpe del enemigo
    enemy.hit();

    // Efecto visual de nieve
    const particles = this.add.particles('snow');
    particles.createEmitter({
      x: enemy.x,
      y: enemy.y - 40,
      speed: { min: -100, max: 100 },
      lifespan: 400,
      quantity: 6
    });
    this.time.delayedCall(400, () => particles.destroy());

    // Incrementar puntuación
    this.score += 5;
    this.scoreText.setText(this.score);
  }

  // Cuando bala del enemigo impacta al jugador
  hitPlayer(player, projectile) {
    if (!player.isAlive || !projectile.active) return;

    projectile.stop?.();
    projectile.setActive(false).setVisible(false);

    player.stop();
    this.gameOver();
  }

  // ===========================================
  //  GAME OVER
  // ===========================================
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
    this.tracks.forEach((track) => track.stop());

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

    // Esperar tecla o click para volver al menú
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('MenuScene');
    }, this);

    this.input.once('pointerdown', () => {
      this.scene.start('MenuScene');
    }, this);
  }
}
