import Track from '../util/Track.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import PlayerShoot from '../entities/PlayerShoot.js';
import EnemyShoot from '../entities/EnemyShoot.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');

    // Jugador / pistas
    this.player = null;
    this.tracks = null;

    // Marcadores
    this.score = 0;
    this.highscore = 0;
    this.previousHighscore = 0;
    this.scoreTimer = null;
    this.infoPanel = null;
    this.scoreText = null;
    this.highscoreText = null;

    // Progresión de niveles / música
    this.level2Reached = false;
    this.level3Reached = false;
    this.levelMessage = null;
    this.level1Music = null;
    this.level2Music = null;
    this.level3Music = null;

    // Estado del jefe final
    this.finalBosses = [];
    this.bossHealthBars = [];
    this.bossHealthBarBgs = [];
    this.bossHealthTexts = [];
    this.bossAttackTimers = [];
    this.victoryOverlay = null;
    this.victoryPanel = null;

    this.bossMaxHealth = 150;
    this.totalFinalBosses = 1;
    this.finalBossSpawned = false;
    this.level3SmallSpawnCount = 0;
    this.finalBossSpawnThreshold = 10;
    this.bossCountdownText = null;
    this.victoryShown = false;
  }

  create() {
    this.score = 0;
    this.highscore = this.registry.get('highscore') || 0;
    this.previousHighscore = this.highscore;

    // Resetear estado de niveles y jefe
    this.level2Reached = false;
    this.level3Reached = false;
    this.levelMessage = null;
    this.level1Music = null;
    this.level2Music = null;
    this.level3Music = null;

    this.finalBosses = [];
    this.bossHealthBars = [];
    this.bossHealthBarBgs = [];
    this.bossHealthTexts = [];
    this.bossAttackTimers = [];
    this.finalBossSpawned = false;
    this.level3SmallSpawnCount = 0;
    this.finalBossSpawnThreshold = 10;
    this.destroyVictoryUI();
    this.destroyBossCountdownUI();

    // Música de nivel 1
    this.sound.stopAll();
    this.level1Music = this.sound.add('nivel1', { loop: true, volume: 3 });
    this.level1Music.play();

    // Fondo
    this.backgroundImage = this.add.image(512, 384, 'background');
    this.backgroundImage.setDepth(-10);

    // Imagen decorativa del jugador (lado derecho)
    this.playerDisplay = this.add.image(2000, 720, 'player').setOrigin(0.5, 1).setDepth(5);

    // Grupos globales
    this.allEnemies = this.physics.add.group({ runChildUpdate: true, allowGravity: false });
    this.allPlayerProjectiles = this.physics.add.group({ runChildUpdate: true, allowGravity: false });
    this.allEnemyProjectiles = this.physics.add.group({ runChildUpdate: true, allowGravity: false });

    // Crear pistas
    this.tracks = [
      new Track(this, 0, 196),
      new Track(this, 1, 376),
      new Track(this, 2, 536),
      new Track(this, 3, 700)
    ];

    // Jugador
    this.player = new Player(this, this.tracks[0]);
    this.player.start();

    // Panel informativo inicial
    this.infoPanel = this.add.image(512, 384, 'controls').setScale(0.3);

    // UI de puntuaciones
    this.add.text(720, 2, 'Puntos:', { fontFamily: 'CartoonFont', fontSize: 32, color: '#ffffff' });
    this.scoreText = this.add.text(840, 2, this.score, { fontFamily: 'CartoonFont', fontSize: 32, color: '#ffffff' }).setDepth(10);
    this.highscoreText = this.add.text(720, 42, `Record: ${this.highscore}`, { fontFamily: 'CartoonFont', fontSize: 32, color: '#ffffff' }).setDepth(10);
    

    // Colisiones
    this.physics.add.overlap(this.allPlayerProjectiles, this.allEnemies, this.hitEnemy, this.checkCollision, this);
    this.physics.add.overlap(this.allPlayerProjectiles, this.allEnemyProjectiles, this.hitProjectiles, null, this);
    this.physics.add.overlap(this.player, this.allEnemyProjectiles, this.hitPlayer, null, this);

    this.checkCollision = (projectile, enemy) => projectile.active && enemy.active && enemy.isAlive;

    // Teclas de inicio
    this.input.keyboard.once('keydown-SPACE', this.start, this);
    this.input.keyboard.once('keydown-UP', this.start, this);
    this.input.keyboard.once('keydown-DOWN', this.start, this);
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('MenuScene'));
  }

  // --- Puntuación y progresión ---
  addScore(points = 1) {
    this.score += points;
    this.scoreText?.setText(this.score);

    if (this.score > this.highscore) {
      this.highscore = this.score;
      this.highscoreText?.setText(`Record: ${this.highscore}`);
      this.registry.set('highscore', this.highscore);
    }

    if (!this.level2Reached && this.score >= 10) this.reachSecondLevel();
    if (!this.level3Reached && this.score >= 30) this.reachThirdLevel();
  }

  adjustDifficulty({ spawnMin, spawnMax, timeScale, enemySpeedSmall, enemySpeedBig }) {
    this.tracks.forEach(track => {
      if (typeof track.setDifficulty === 'function') {
        track.setDifficulty({ spawnMin, spawnMax });
      } else if (typeof track.setSpawnRange === 'function') {
        track.setSpawnRange(spawnMin, spawnMax);
      } else {
        track.stop?.();
        track.start(spawnMin, spawnMax);
      }

      if (typeof track.setEnemySpeeds === 'function') {
        track.setEnemySpeeds({ small: enemySpeedSmall, big: enemySpeedBig });
      }
    });

    if (timeScale) {
      this.time.timeScale = timeScale;
      this.physics?.world && (this.physics.world.timeScale = timeScale);
    }
  }

  reachSecondLevel() {
    this.level2Reached = true;

    this.level1Music?.stop();
    if (!this.level2Music) this.level2Music = this.sound.add('nivel2', { loop: true, volume: 0.9 });
    this.level2Music.play();

    this.backgroundImage?.setTexture('esenario2');

    this.adjustDifficulty({
      spawnMin: 1500,
      spawnMax: 3000,
      timeScale: 1.15,
      enemySpeedSmall: 120,
      enemySpeedBig: 100
    });

    this.levelMessage?.destroy();
    this.levelMessage = this.add.text(512, 100, 'Segundo nivel', {
      fontFamily: 'CartoonFont',
      fontSize: 48,
      color: '#ffeb3b',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(15);

    this.tweens.add({
      targets: this.levelMessage,
      alpha: 0,
      duration: 800,
      delay: 2200,
      ease: 'Power2',
      onComplete: () => {
        this.levelMessage?.destroy();
        this.levelMessage = null;
      }
    });
  }

  reachThirdLevel() {
    this.level3Reached = true;

    this.level2Music?.stop();
    try {
      if (this.cache.audio?.exists('nivel3')) {
        if (!this.level3Music) this.level3Music = this.sound.add('nivel3', { loop: true, volume: 0.45 });
        this.level3Music.play();
      }
    } catch (e) {}

    this.backgroundImage?.setTexture('nivel3');

    this.tracks.forEach(track => {
      track.stop();
      track.start(1200, 2600);
    });

    this.levelMessage?.destroy();
    this.levelMessage = this.add.text(512, 100, '¡FINAL!', {
      fontFamily: 'CartoonFont',
      fontSize: 52,
      color: '#ff5722',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(15);

    this.tweens.add({
      targets: this.levelMessage,
      alpha: 0,
      duration: 800,
      delay: 1800,
      ease: 'Power2',
      onComplete: () => {
        this.levelMessage?.destroy();
        this.levelMessage = null;
      }
    });

    this.level3SmallSpawnCount = 0;
    this.finalBossSpawned = false;
    this.finalBosses = [];
    this.clearBossUI();

    this.updateBossCountdownText();
  }

  updateBossCountdownText() {
    if (this.finalBossSpawned) {
      this.destroyBossCountdownUI();
      return;
    }

    const remaining = Math.max(0, this.finalBossSpawnThreshold - this.level3SmallSpawnCount);
    const text = `Gatos chicos: ${this.level3SmallSpawnCount}/${this.finalBossSpawnThreshold}` +
      (remaining > 0 ? `\nFaltan ${remaining}` : '\n¡Listo!');

    if (!this.bossCountdownText) {
      this.bossCountdownText = this.add.text(512, 160, text, {
        fontFamily: 'CartoonFont',
        fontSize: 34,
        color: '#ffffff',
        stroke: '#000',
        strokeThickness: 6,
        align: 'center'
      }).setOrigin(0.5).setDepth(15);
    } else {
      this.bossCountdownText.setText(text);
    }
  }

  destroyBossCountdownUI() {
    this.bossCountdownText?.destroy();
    this.bossCountdownText = null;
  }

  spawnFinalBosses() {
    if (this.finalBossSpawned) return;
    this.finalBossSpawned = true;
    this.updateBossCountdownText();
    this.tracks.forEach(track => track.stop());

    const laneYs = this.tracks.map(track => track?.y).filter(y => typeof y === 'number');
    const verticalOffsets = this.totalFinalBosses === 2 ? [-120, 120] : [0];

    this.levelMessage?.destroy();
    this.levelMessage = this.add.text(512, 100, '¡Jefe Final!', {
      fontFamily: 'CartoonFont',
      fontSize: 48,
      color: '#ff0000',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(15);

    this.tweens.add({
      targets: this.levelMessage,
      alpha: 0,
      duration: 800,
      delay: 2000,
      ease: 'Power2',
      onComplete: () => {
        this.levelMessage?.destroy();
        this.levelMessage = null;
      }
    });

    verticalOffsets.slice(0, this.totalFinalBosses).forEach((offset, index) => {
      const boss = this.physics.add.sprite(280, this.scale.height / 2 + offset, 'final_boss');
      boss.setOrigin(0.8, 0.5);
      boss.setScale(1.8);
      boss.setImmovable(true);
      boss.body.setAllowGravity(false);
      boss.body.setSize(180, 280);
      boss.body.setOffset(15, 15);

      boss.health = this.bossMaxHealth;
      boss.maxHealth = this.bossMaxHealth;
      boss.isAlive = true;
      boss.isBoss = true;
      boss.bossIndex = index;
      boss.currentLaneY = this.closestLaneY(boss.y, laneYs);
      boss.nextLaneY = null;
      boss.nextLaneTimer = null;
      boss.play?.('final_boss_idle');

      this.allEnemies.add(boss);
      this.finalBosses.push(boss);
      this.createBossHealthUI(boss, index);
      this.startBossAttackLoop(boss);
      this.assignNextLane(boss, laneYs);
      this.scheduleBossLaneChange(boss, laneYs);
    });
  }

  createBossHealthUI(boss, index) {
    const barWidth = 360;
    const barHeight = 20;
    const spacing = 35;
    const baseY = 40;
    const barX = this.scale.width / 2;
    const barY = baseY + spacing * index;

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRect(barX - barWidth / 2, barY - barHeight / 2, barWidth, barHeight);
    bg.setDepth(20);

    const bar = this.add.graphics();
    bar.fillStyle(0xff1e56, 1);
    bar.fillRect(barX - barWidth / 2, barY - barHeight / 2, barWidth, barHeight);
    bar.setDepth(21);

    const text = this.add.text(barX, barY - barHeight - 8, `Vida: ${boss.health}/${boss.maxHealth}`, {
      fontFamily: 'CartoonFont',
      fontSize: 20,
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5, 1).setDepth(22);

    boss.healthBar = bar;
    boss.healthBarBg = bg;
    boss.healthBarWidth = barWidth;
    boss.healthBarHeight = barHeight;
    boss.healthBarX = barX;
    boss.healthBarY = barY;
    boss.healthText = text;

    this.bossHealthBars.push(bar);
    this.bossHealthBarBgs.push(bg);
    this.bossHealthTexts.push(text);
  }

  startBossAttackLoop(boss) {
    const timer = this.time.addEvent({
      delay: Phaser.Math.Between(2000, 3200),
      callback: () => this.bossAttack(boss),
      loop: true
    });

    this.bossAttackTimers.push(timer);
    boss.attackTimer = timer;
  }

  closestLaneY(value, laneYs) {
    if (!laneYs?.length) return value;
    let closest = laneYs[0];
    for (const lane of laneYs) {
      if (Math.abs(lane - value) < Math.abs(closest - value)) closest = lane;
    }
    return closest;
  }

  pickNextLane(boss, laneYs) {
    if (!laneYs?.length) return boss.currentLaneY ?? 0;
    const options = laneYs.filter(y => Math.abs(y - (boss.currentLaneY ?? y)) > 1);
    if (!options.length) return boss.currentLaneY ?? laneYs[0];
    return options[Phaser.Math.Between(0, options.length - 1)];
  }

  assignNextLane(boss, laneYs) {
    boss.nextLaneY = this.pickNextLane(boss, laneYs);
  }

  scheduleBossLaneChange(boss, laneYs) {
    if (!boss?.isAlive) return;
    boss.nextLaneTimer?.remove();
    boss.nextLaneTimer = this.time.delayedCall(
      Phaser.Math.Between(1200, 2200),
      () => {
        boss.nextLaneTimer = null;
        if (!boss?.isAlive) return;
        this.assignNextLane(boss, laneYs);
      }
    );
  }

  onEnemySpawn(enemy) {
    if (!enemy) return;
    if (!this.level3Reached || this.finalBossSpawned) return;
    if (enemy.size !== 'Small') return;

    this.level3SmallSpawnCount++;
    this.updateBossCountdownText();

    if (this.level3SmallSpawnCount >= this.finalBossSpawnThreshold) {
      this.spawnFinalBosses();
    }
  }

  bossAttack(boss) {
    if (!boss || !boss.isAlive) return;

    boss.play?.('final_boss_attack');
    boss.once('animationcomplete', () => {
      if (boss && boss.isAlive) {
        boss.play?.('final_boss_idle');
      }
    });

    if (this.player && this.player.isAlive) {
      const projectile = new EnemyShoot(this, boss.x + 40, boss.y, 'projectileEnemy');
      this.add.existing(projectile);
      this.physics.add.existing(projectile);
      this.allEnemyProjectiles.add(projectile);
      projectile.body.reset(boss.x + 40, boss.y - 44);
      projectile.setActive(true);
      projectile.setVisible(true);
      projectile.setVelocityX(240);
      projectile.setVelocityY(0);
      projectile.setAccelerationX(0);
    }
  }
hitEnemy(projectile, enemy) {
  if (!enemy.isAlive || !projectile.active) return;

  projectile.destroy();

  if (enemy.isBoss) {
    enemy.health = Math.max(0, enemy.health - 30);
    this.sound.play('hit', { volume: 0.7 });

    enemy.play?.('final_boss_taunt', true);

    this.time.delayedCall(400, () => {
      if (enemy && enemy.isAlive) {
        enemy.play?.('final_boss_idle');
      }
    });

    this.tweens.add({
      targets: enemy,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: 3,
      onStart: () => { enemy.setTint(0xff0000); },
      onComplete: () => {
        enemy.clearTint();
        enemy.alpha = 1;
      }
    });

    const percentage = Math.max(0, enemy.health / enemy.maxHealth);
    if (enemy.healthBar) {
      enemy.healthBar.clear();
      enemy.healthBar.fillStyle(0xff1e56, 1);
      enemy.healthBar.fillRect(
        enemy.healthBarX - enemy.healthBarWidth / 2,
        enemy.healthBarY - enemy.healthBarHeight / 2,
        enemy.healthBarWidth * percentage,
        enemy.healthBarHeight
      );
    }
    enemy.healthText?.setText(`Vida: ${Math.max(0, enemy.health)}/${enemy.maxHealth}`);

    if (enemy.health <= 0) {
      enemy.isAlive = false;
      this.sound.play('enemy_kill', { volume: 1.5 });

      // === Limpieza de timers y destrucción ===
      if (enemy.attackTimer) {
        enemy.attackTimer.destroy();
        Phaser.Utils.Array.Remove(this.bossAttackTimers, enemy.attackTimer);
        enemy.attackTimer = null;
      }
      if (enemy.nextLaneTimer) {
        enemy.nextLaneTimer.remove();
        enemy.nextLaneTimer = null;
      }

      enemy.play?.('final_boss_attack');
      this.tweens.add({
        targets: enemy,
        alpha: 0,
        scale: 1.5,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          enemy.destroy();
          if (enemy.healthBar) {
            enemy.healthBar.destroy();
            Phaser.Utils.Array.Remove(this.bossHealthBars, enemy.healthBar);
          }
          if (enemy.healthBarBg) {
            enemy.healthBarBg.destroy();
            Phaser.Utils.Array.Remove(this.bossHealthBarBgs, enemy.healthBarBg);
          }
          if (enemy.healthText) {
            enemy.healthText.destroy();
            Phaser.Utils.Array.Remove(this.bossHealthTexts, enemy.healthText);
          }

          // 🧩 Asegura que se elimine de la lista de bosses
          Phaser.Utils.Array.Remove(this.finalBosses, enemy);

          // ✅ Si ya no quedan jefes, muestra la pantalla de victoria
          if (this.finalBosses.length === 0) {
            console.log('🎉 Jefe final derrotado — mostrando pantalla de victoria');
            this.time.delayedCall(600, () => this.showVictoryPanel());
          }
        }
      });

      this.addScore(500);
    }
    return;
  }

  // Enemigos normales
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

  start() {
    this.input.keyboard.removeAllListeners();

    this.tweens.add({ targets: this.infoPanel, y: 700, alpha: 0, duration: 500, ease: 'Power2' });
    this.player.start();

    this.tracks[0].start(3000, 5000);
    this.tracks[1].start(2000, 4000);
    this.tracks[2].start(4000, 6000);
    this.tracks[3].start(5000, 7000);

    this.input.keyboard.once('keydown-ESC', () => this.scene.start('MenuScene'));
  }

  update() {
    this.updateBossChase();
  }

  updateBossChase() {
    if (!this.finalBosses?.length || !this.player?.isAlive || !this.tracks?.length) return;

    const laneYs = this.tracks.map(track => track?.y).filter(y => typeof y === 'number');
    if (!laneYs.length) return;

    this.finalBosses.forEach(boss => {
      if (!boss?.isAlive || !boss.body) return;

      boss.currentLaneY ??= this.closestLaneY(boss.y, laneYs);

      if (boss.nextLaneY == null) {
        if (!boss.nextLaneTimer) this.scheduleBossLaneChange(boss, laneYs);
        boss.setVelocityY(0);
      } else {
        const dy = boss.nextLaneY - boss.y;
        if (Math.abs(dy) <= 2) {
          boss.setVelocityY(0);
          boss.setY(boss.nextLaneY);
          boss.currentLaneY = boss.nextLaneY;
          boss.nextLaneY = null;
          this.scheduleBossLaneChange(boss, laneYs);
        } else {
          const vy = Phaser.Math.Clamp(dy, -30, 30);
          boss.setVelocityY(vy);
        }
      }

      const targetX = Math.max(this.player.x - 200, 180);
      const dx = targetX - boss.x;
      const vx = Phaser.Math.Clamp(dx, -40, 40);
      boss.setVelocityX(vx);
    });
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

 showVictoryPanel() {
  if (this.victoryShown) return;
  this.victoryShown = true;

  this.destroyVictoryUI();
  this.destroyBossCountdownUI();

  // Detener música
  this.sound.stopAll();
  this.sound.play('enemy_kill', { volume: 1.2 });

  // Fondo de victoria (ENCIMA DE TODO)
  const victoryBg = this.add.image(
    this.cameras.main.centerX,
    this.cameras.main.centerY,
    'descarga'
  )
    .setOrigin(0.5)
    .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
    .setDepth(999)
    .setAlpha(0);

  // Texto de felicitación
  const title = this.add.text(this.cameras.main.centerX, 220, '¡Felicidades!', {
    fontFamily: 'CartoonFont',
    fontSize: 72,
    color: '#ffffff',
    stroke: '#000',
    strokeThickness: 8,
  })
    .setOrigin(0.5)
    .setDepth(1000)
    .setAlpha(0);

  // Subtítulo
  const subtitle = this.add.text(
    this.cameras.main.centerX,
    320,
    `Derrotaste al Gato Supremo\nPuntos: ${this.score}`,
    {
      fontFamily: 'CartoonFont',
      fontSize: 38,
      align: 'center',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 6,
    }
  )
    .setOrigin(0.5)
    .setDepth(1000)
    .setAlpha(0);

  const buttonStyle = {
    fontFamily: 'CartoonFont',
    fontSize: 34,
    color: '#ffffff',
    stroke: '#000',
    strokeThickness: 6,
  };

  const makeButton = (y, label, color, callback) => {
    const btnBg = this.add.rectangle(
      this.cameras.main.centerX,
      y,
      300,
      70,
      color
    )
      .setDepth(1000)
      .setAlpha(0)
      .setStrokeStyle(4, 0x000000);

    const text = this.add.text(this.cameras.main.centerX, y, label, buttonStyle)
      .setOrigin(0.5)
      .setDepth(1001)
      .setAlpha(0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', callback)
      .on('pointerover', () => btnBg.setFillStyle(0xffa94d, 1))
      .on('pointerout', () => btnBg.setFillStyle(color, 1));

    return [btnBg, text];
  };

  const [btnReplayBg, btnReplayText] = makeButton(
    this.cameras.main.centerY + 80,
    'Volver a jugar',
    0x00bcd4,
    () => this.scene.restart()
  );
  const [btnMenuBg, btnMenuText] = makeButton(
    this.cameras.main.centerY + 170,
    'Menú principal',
    0xff7043,
    () => this.scene.start('MenuScene')
  );

  this.victoryPanel = this.add.container(0, 0, [
    victoryBg,
    title,
    subtitle,
    btnReplayBg,
    btnReplayText,
    btnMenuBg,
    btnMenuText,
  ]);
  this.victoryPanel.setDepth(1002);

  // Animación de aparición
  this.tweens.add({
    targets: [
      victoryBg,
      title,
      subtitle,
      btnReplayBg,
      btnReplayText,
      btnMenuBg,
      btnMenuText,
    ],
    alpha: 1,
    duration: 800,
    ease: 'Power2',
  });
}


  destroyVictoryUI() {
    this.victoryOverlay?.destroy();
    this.victoryOverlay = null;
    if (this.victoryPanel) {
      this.victoryPanel.removeAll(true);
      this.victoryPanel.destroy();
      this.victoryPanel = null;
    }
    this.victoryShown = false;
  }

  gameOver() {
    this.infoPanel.setTexture('gameover');
    this.infoPanel.setScale(0.5);
    this.tweens.add({ targets: this.infoPanel, y: 384, alpha: 1, duration: 500, ease: 'Power2' });

    this.tracks.forEach(track => track.stop());
    this.sound.stopAll();
    this.sound.play('gameover', { volume: 1 });

    this.player.stop();
    if (this.scoreTimer) this.scoreTimer.destroy();

    this.bossAttackTimers.forEach(timer => timer.destroy());
    this.bossAttackTimers = [];

    this.finalBosses.forEach(boss => {
      boss.nextLaneTimer?.remove();
      boss.destroy();
    });
    this.finalBosses = [];

    this.clearBossUI();
    this.finalBossSpawned = false;
    this.level3SmallSpawnCount = 0;
    this.finalBossSpawnThreshold = 10;
    this.destroyBossCountdownUI();
    this.destroyVictoryUI();

    if (this.score > this.previousHighscore) {
      this.highscoreText?.setText('Record: NEW!');
      this.registry.set('highscore', this.score);
    } else {
      this.highscoreText?.setText(`Record: ${this.highscore}`);
    }

    if (!this.victoryShown) {
      this.input.keyboard.once('keydown-SPACE', () => this.scene.start('MenuScene'), this);
      this.input.once('pointerdown', () => this.scene.start('MenuScene'), this);
    }
  }

  clearBossUI() {
    this.bossHealthBars.forEach(bar => bar.destroy());
    this.bossHealthBars = [];
    this.bossHealthBarBgs.forEach(bg => bg.destroy());
    this.bossHealthBarBgs = [];
    this.bossHealthTexts.forEach(text => text.destroy());
    this.bossHealthTexts = [];
  }

  destroyVictoryUI() {
    this.victoryOverlay?.destroy();
    this.victoryOverlay = null;
    if (this.victoryPanel) {
      this.victoryPanel.removeAll(true);
      this.victoryPanel.destroy();
      this.victoryPanel = null;
    }
    this.victoryShown = false;
  }
}
