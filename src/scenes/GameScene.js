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

    // Jefe final
    this.finalBoss = null;
    this.bossHealthBar = null;
    this.bossHealthBarBg = null;
    this.bossMaxHealth = 30; // Vida del jefe
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
    this.finalBoss = null;
    this.bossHealthBar = null;
    this.bossHealthBarBg = null;



    // Música nivel 1
    this.sound.stopAll();
    this.level1Music = this.sound.add('nivel1', { loop: true, volume: 3 });
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

    // Debug físicas 🐛
   /*  this.physics.world.createDebugGraphic();
    this.physics.world.defaults.debugShowBody = true;
    this.physics.world.defaults.debugShowVelocity = false; */


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
    if (!this.level2Reached && this.score >= 150) this.reachSecondLevel();

    // Nivel 3: ≥350
    if (!this.level3Reached && this.score >= 350) this.reachThirdLevel();
  }

  // --- Aumenta dificultad (delays de spawn + timeScale global) ---
  adjustDifficulty({ spawnMin, spawnMax, timeScale, enemySpeedSmall, enemySpeedBig }) {
    this.tracks.forEach(t => {
      t.stop?.();
      t.start(spawnMin, spawnMax);

      if (typeof t.setEnemySpeeds === 'function') {
        t.setEnemySpeeds({ small: enemySpeedSmall, big: enemySpeedBig });
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
    if (!this.level2Music) this.level2Music = this.sound.add('nivel2', { loop: true, volume: 0.9 });
    this.level2Music.play();

    // Fondo
    this.backgroundImage?.setTexture('esenario2');

    // ⚡ Dificultad nivel 2 (más rápido)
    this.adjustDifficulty({
      spawnMin: 1500,  // antes de 2–5s aprox
      spawnMax: 3000,
      timeScale: 1.15,  // acelera física/timers ~15%
      enemySpeedSmall: 120, // Aumenta la velocidad del enemigo pequeño
      enemySpeedBig: 100    // Aumenta la velocidad del enemigo grande
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
// Sección de reachThirdLevel() CORREGIDA

reachThirdLevel() {
  this.level3Reached = true;

  // Música
  this.level2Music?.stop();
  try {
    if (this.cache.audio && this.cache.audio.exists('nivel3')) {
      if (!this.level3Music) this.level3Music = this.sound.add('nivel3', { loop: true, volume: 0.45 });
      this.level3Music.play();
    }
  } catch(e) {}

  // Fondo nivel 3
  this.backgroundImage?.setTexture('nivel3');

  // Crear al jefe final
  this.finalBoss = this.physics.add.sprite(280, this.scale.height / 2, 'final_boss');
  this.finalBoss.setOrigin(0.8, 0.5);  // Centrado
  this.finalBoss.play('final_boss_idle');
  this.finalBoss.setScale(1.7);  // Escala ajustada para 213x311px
  this.finalBoss.setImmovable(true);
  this.finalBoss.body.setAllowGravity(false);
  
  // Ajustar hitbox para que coincida con el sprite visible
  this.finalBoss.body.setSize(180, 280);  // Ajusta estos valores según tu sprite
  this.finalBoss.body.setOffset(15, 15);   // Centrar el hitbox
  
  this.finalBoss.health = this.bossMaxHealth;
  this.finalBoss.isAlive = true;
  this.finalBoss.isBoss = true;

  // ✅ INICIA con animación IDLE
  this.finalBoss.play('final_boss_idle');

  // Añadirlo al grupo de enemigos
  this.allEnemies.add(this.finalBoss);

  // Crear la barra de vida del jefe
  const barWidth = 400;
  const barHeight = 25;
  const barX = this.scale.width / 2;
  const barY = 50;

  this.bossHealthBarBg = this.add.graphics();
  this.bossHealthBarBg.fillStyle(0x000000, 0.5);
  this.bossHealthBarBg.fillRect(barX - barWidth / 2, barY - barHeight / 2, barWidth, barHeight);
  this.bossHealthBarBg.setDepth(20);

  this.bossHealthBar = this.add.graphics();
  this.bossHealthBar.fillStyle(0xff0000, 1);
  this.bossHealthBar.fillRect(barX - barWidth / 2, barY - barHeight / 2, barWidth, barHeight);
  this.bossHealthBar.setDepth(21);

  // Mensaje de nivel 3
  this.levelMessage?.destroy();
  this.levelMessage = this.add.text(512, 100, '¡Jefe Final!', {
    fontFamily: 'CartoonFont', fontSize: 48, color: '#ff0000', stroke: '#000', strokeThickness: 6
  }).setOrigin(0.5).setDepth(15);

  this.tweens.add({
    targets: this.levelMessage, alpha: 0, duration: 800, delay: 2200, ease: 'Power2',
    onComplete: () => { 
      this.levelMessage?.destroy(); 
      this.levelMessage = null; 
    }
  });

  // ⚡ Comportamiento del jefe: ataca cada 2 segundos
  this.bossAttackTimer = this.time.addEvent({
    delay: 2000,
    callback: () => {
      if (this.finalBoss && this.finalBoss.isAlive) {
        this.bossAttack();
      }
    },
    loop: true
  });
}

// ✅ NUEVO: Método para que el jefe ataque
bossAttack() {
  if (!this.finalBoss || !this.finalBoss.isAlive) return;

  // Reproducir animación de ataque
  this.finalBoss.play('final_boss_attack');

  // Cuando termine el ataque, volver a idle
  this.finalBoss.once('animationcomplete', () => {
    if (this.finalBoss && this.finalBoss.isAlive) {
      this.finalBoss.play('final_boss_idle');
    }
  });

  // Disparar proyectil (puedes personalizar esto)
  // Aquí usarías tu lógica de EnemyShoot
}

// ✅ CORREGIR hitEnemy() para el jefe
hitEnemy(projectile, enemy) {
  if (!enemy.isAlive || !projectile.active) return;

  projectile.destroy();

  // --- Lógica para el JEFE FINAL ---
  if (enemy.isBoss) {
    enemy.health--;
    this.sound.play('hit', { volume: 0.7 });

    // Reproducir animación de taunt cuando recibe daño
    enemy.play('final_boss_taunt', true);
    
    // Después de 400ms volver a idle
    this.time.delayedCall(400, () => {
      if (enemy && enemy.isAlive) {
        enemy.play('final_boss_idle');
      }
    });

    // Parpadeo rojo
    this.tweens.add({
      targets: enemy,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: 3,
      onStart: () => {
        enemy.setTint(0xff0000); // Tinte rojo
      },
      onComplete: () => {
        enemy.clearTint();
        enemy.alpha = 1;
      }
    });

    // Actualizar barra de vida
    const barWidth = 400;
    const percentage = Math.max(0, enemy.health / this.bossMaxHealth);
    this.bossHealthBar.clear();
    this.bossHealthBar.fillStyle(0xff0000, 1);
    this.bossHealthBar.fillRect(
      (this.scale.width / 2) - barWidth / 2, 
      50 - 25 / 2, 
      barWidth * percentage, 
      25
    );

    if (enemy.health <= 0) {
      enemy.isAlive = false;
      this.sound.play('enemy_kill', { volume: 1.5 });
      
      
      // Detener timer de ataque
      if (this.bossAttackTimer) {
        this.bossAttackTimer.destroy();
      }

      // Explosión del jefe
      enemy.play('final_boss_attack'); // o crea una animación de muerte
      this.tweens.add({
        targets: enemy,
        alpha: 0,
        scale: 1.5,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          enemy.destroy();
          this.bossHealthBar.destroy();
          this.bossHealthBarBg.destroy();
        }
      });

      this.addScore(500); // Puntos extra
      
      // Victoria
      this.time.delayedCall(1000, () => {
        this.gameOver(); // O crea una pantalla de victoria
      });
    }

  // --- Lógica para enemigos normales ---
  } else {
    const points = enemy.size === 'Small' ? 5 : 10;
    this.addScore(points);
    this.sound.play('enemy_kill', { volume: 0.5 });

    enemy.hit();

    if (this.anims.exists('snow_explode')) {
      const explosion = this.add.sprite(enemy.x, enemy.y - 30, 'snow_explosion');
      explosion.setScale(0.4);
      explosion.play('snow_explode');
      explosion.on('animationcomplete', () => explosion.destroy());
    }
  }
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
