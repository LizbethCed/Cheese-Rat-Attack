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
    this.previousHighscore = 0;
    this.infoPanel = null;
    this.scoreTimer = null;
    this.scoreText = null;
    this.highscoreText = null;

    // Niveles / música
    this.level2Reached = false;
    this.level3Reached = false;
    this.levelMessage = null;
    this.level1Music = null;
    this.level2Music = null;
    this.level3Music = null;
  }

  create() {
    this.score = 0;
    this.highscore = this.registry.get('highscore') || 0;
    this.previousHighscore = this.highscore;

    // reset flags y música
    this.level2Reached = false;
    this.level3Reached = false;
    this.levelMessage = null;
    this.level1Music = null;
    this.level2Music = null;
    this.level3Music = null;

    // Música nivel 1
    this.sound.stopAll();
    this.level1Music = this.sound.add('nivel1', { loop: true, volume: 1 });
    this.level1Music.play();

    // Fondo
    this.backgroundImage = this.add.image(512, 384, 'background');
    this.backgroundImage.setDepth(-10);

    // Imagen decorativa del jugador
    this.playerDisplay = this.add.image(2000, 720, 'player')
      .setOrigin(0.5, 1)
      .setDepth(5);

    // Grupos globales
    this.allEnemies = this.physics.add.group({ runChildUpdate: true, allowGravity: false });
    this.allPlayerProjectiles = this.physics.add.group({ runChildUpdate: true, allowGravity: false });
    this.allEnemyProjectiles = this.physics.add.group({ runChildUpdate: true, allowGravity: false });

    // 4 pistas
    this.tracks = [
      new Track(this, 0, 196),
      new Track(this, 1, 376),
      new Track(this, 2, 536),
      new Track(this, 3, 700)
    ];

    // PLAYER
    this.player = new Player(this, this.tracks[0]);
    this.player.start();

    // Panel inicial
    this.infoPanel = this.add.image(512, 384, 'controls').setScale(0.3);

    // UI Puntos / Record
    this.add.text(720, 2, 'Puntos:', { fontFamily: 'CartoonFont', fontSize: 32, color: '#ffffff' });
    this.scoreText = this.add.text(840, 2, this.score, { fontFamily: 'CartoonFont', fontSize: 32, color: '#ffffff' }).setDepth(10);
    this.highscoreText = this.add.text(720, 42, `Record: ${this.highscore}`, { fontFamily: 'CartoonFont', fontSize: 32, color: '#ffffff' }).setDepth(10);

    // Colisiones
    this.physics.add.overlap(this.allPlayerProjectiles, this.allEnemies, this.hitEnemy, this.checkCollision, this);
    this.physics.add.overlap(this.allPlayerProjectiles, this.allEnemyProjectiles, this.hitProjectiles, null, this);
    this.physics.add.overlap(this.player, this.allEnemyProjectiles, this.hitPlayer, null, this);

    // Verificación de overlap
    this.checkCollision = (projectile, enemy) => projectile.active && enemy.active && enemy.isAlive;

    // Teclas de inicio
    this.input.keyboard.once('keydown-SPACE', this.start, this);
    this.input.keyboard.once('keydown-UP', this.start, this);
    this.input.keyboard.once('keydown-DOWN', this.start, this);

    // ESC para volver
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('MenuScene'));
  }

  addScore(points = 1) {
    this.score += points;
    this.scoreText?.setText(this.score);

    if (this.score > this.highscore) {
      this.highscore = this.score;
      this.highscoreText?.setText(`Record: ${this.highscore}`);
      this.registry.set('highscore', this.highscore);
    }

    // Nivel 2: ≥150
    if (!this.level2Reached && this.score >= 40) this.reachSecondLevel();

    // Nivel 3: ≥200
    if (!this.level3Reached && this.score >= 80) this.reachThirdLevel();
  }

  // --- Aumenta dificultad (delays de spawn + timeScale global) ---
  adjustDifficulty({ spawnMin, spawnMax, timeScale }) {
    // Si el Track no tiene setter, paramos y reiniciamos con nuevos delays
    this.tracks.forEach(t => {
      if (typeof t.setDifficulty === 'function') {
        t.setDifficulty({ spawnMin, spawnMax });
      } else if (typeof t.setSpawnRange === 'function') {
        t.setSpawnRange(spawnMin, spawnMax);
      } else {
        t.stop?.();
        t.start(spawnMin, spawnMax);
      }
    });

    // Escala global (timers + físicas)
    if (timeScale) {
      this.time.timeScale = timeScale;
      if (this.physics?.world) this.physics.world.timeScale = timeScale;
    }
  }

  reachSecondLevel() {
    this.level2Reached = true;

    // Música
    this.level1Music?.stop();
    if (!this.level2Music) this.level2Music = this.sound.add('nivel2', { loop: true, volume: 0.4 });
    this.level2Music.play();

    // Fondo
    this.backgroundImage?.setTexture('esenario2');

    // ⚡ Dificultad nivel 2 (más rápido)
    this.adjustDifficulty({
      spawnMin: 1500,  // antes de 2–5s aprox
      spawnMax: 3000,
      timeScale: 1.15  // acelera física/timers ~15%
    });

    // Mensaje
    this.levelMessage?.destroy();
    this.levelMessage = this.add.text(512, 100, 'Segundo nivel', {
      fontFamily: 'CartoonFont', fontSize: 48, color: '#ffeb3b', stroke: '#000', strokeThickness: 6
    }).setOrigin(0.5).setDepth(15);

    this.tweens.add({
      targets: this.levelMessage, alpha: 0, duration: 800, delay: 2200, ease: 'Power2',
      onComplete: () => { this.levelMessage?.destroy(); this.levelMessage = null; }
    });
  }

  // --- NUEVO: Nivel 3 ---
  reachThirdLevel() {
    this.level3Reached = true;

    // Música (si existe)
    this.level2Music?.stop();
    try {
      if (this.cache.audio && this.cache.audio.exists('nivel3')) {
        if (!this.level3Music) this.level3Music = this.sound.add('nivel3', { loop: true, volume: 0.45 });
        this.level3Music.play();
      }
    } catch(e) {}

    // Fondo nivel 3
    this.backgroundImage?.setTexture('nivel3');

    // ⚡⚡ Dificultad nivel 3 (más rápido que el 2)
    this.adjustDifficulty({
      spawnMin: 900,
      spawnMax: 1800,
      timeScale: 1.30  // acelera física/timers ~30%
    });

    // Mensaje
    this.levelMessage?.destroy();
    this.levelMessage = this.add.text(512, 100, 'Tercer nivel', {
      fontFamily: 'CartoonFont', fontSize: 48, color: '#00e5ff', stroke: '#000', strokeThickness: 6
    }).setOrigin(0.5).setDepth(15);

    this.tweens.add({
      targets: this.levelMessage, alpha: 0, duration: 800, delay: 2200, ease: 'Power2',
      onComplete: () => { this.levelMessage?.destroy(); this.levelMessage = null; }
    });
  }

  start() {
    // Remover listeners de inicio
    this.input.keyboard.removeAllListeners();

    // Animar panel
    this.tweens.add({ targets: this.infoPanel, y: 700, alpha: 0, duration: 500, ease: 'Power2' });

    // Player
    this.player.start();

    // Iniciar pistas base (nivel 1)
    this.tracks[0].start(3000, 5000);
    this.tracks[1].start(2000, 4000);
    this.tracks[2].start(4000, 6000);
    this.tracks[3].start(5000, 7000);

    // ESC para volver
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('MenuScene'));
  }

  update() { /* debug opcional */ }

  // === Colisiones ===
  hitEnemy(projectile, enemy) {
    if (!enemy.isAlive || !projectile.active) return;

    const points = enemy.size === 'Small' ? 5 : 10;
    this.addScore(points);
    this.sound.play('enemy_kill', { volume: 0.5 });

    projectile.destroy();
    enemy.hit();

    if (this.anims.exists('snow_explode')) {
      const explosion = this.add.sprite(enemy.x, enemy.y - 30, 'snow_explosion');
      explosion.setScale(0.4);
      explosion.play('snow_explode');
      explosion.on('animationcomplete', () => explosion.destroy());
    }
  }

  hitProjectiles(playerProj, enemyProj) {
    if (!playerProj?.active || !enemyProj?.active) return;
    playerProj.destroy(); enemyProj.destroy();
  }

  hitPlayer(player, enemyProj) {
    if (!player.isAlive) return;
    enemyProj.destroy();
    player.setVisible(false);
    player.stop();
    this.gameOver();
  }

  gameOver() {
    // Panel game over
    this.infoPanel.setTexture('gameover');
    this.infoPanel.setScale(0.5);
    this.tweens.add({ targets: this.infoPanel, y: 384, alpha: 1, duration: 500, ease: 'Power2' });

    // Detener pistas y audio
    this.tracks.forEach(t => t.stop());
    this.sound.stopAll();
    this.sound.play('gameover', { volume: 1 });

    // Player y timer
    this.player.stop();
    if (this.scoreTimer) this.scoreTimer.destroy();

    // Highscore
    if (this.score > this.previousHighscore) {
      this.highscoreText?.setText('Record: NEW!');
      this.registry.set('highscore', this.score);
    } else {
      this.highscoreText?.setText(`Record: ${this.highscore}`);
    }

    // Volver al menú
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('MenuScene'), this);
    this.input.once('pointerdown', () => this.scene.start('MenuScene'), this);
  }
}
