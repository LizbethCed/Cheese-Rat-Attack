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
    this.levelTransitionInProgress = false;
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
    this.winSoundPlayed = false;

    this.bossMaxHealth = 500; // Por ejemplo, para hacerlo más difícil
    this.totalFinalBosses = 1;
    this.finalBossSpawned = false;
    this.level3SmallDefeated = 0;
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
    this.levelTransitionInProgress = false;
    this.level1Music = null;
    this.level2Music = null;
    this.level3Music = null;

    this.finalBosses = [];
    this.bossHealthBars = [];
    this.bossHealthBarBgs = [];
    this.bossHealthTexts = [];
    this.bossAttackTimers = [];
    this.finalBossSpawned = false;
    this.level3SmallDefeated = 0;
    this.finalBossSpawnThreshold = 10;
    this.destroyVictoryUI();
    this.trackShuffleTimer?.remove();
    this.trackShuffleTimer = null;
    this.trackSpawnCalls = [];
    this.trackSpawnsEnabled = true;
    this.firstShuffleDone = false;

    this.deathCause = null;


    // ? Reiniciar el flag del sonido de victoria aquí
    this.winSoundPlayed = false;

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

    // Configuración de carriles
    this.trackConfigs = [];
    this.trackShuffleTimer = null;
    this.activeTrackCount = 3;
    this.trackSpawnsEnabled = true;
    this.trackSpawnCalls = [];
    this.firstShuffleDone = false;

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

    /* this.physics.world.createDebugGraphic();
    this.physics.world.defaults.debugShowBody = true;
    this.physics.world.defaults.debugShowVelocity = false; */
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

    if (!this.level2Reached && this.score >= 150) this.reachSecondLevel();
    if (!this.level3Reached && this.score >= 300) this.reachThirdLevel();
  }

  adjustDifficulty({ spawnMin, spawnMax, timeScale, enemySpeedSmall, enemySpeedBig }) {
    this.tracks.forEach(track => {
      if (typeof track.setDifficulty === 'function') {
        track.setDifficulty({ spawnMin, spawnMax });
      } else if (typeof track.setSpawnRange === 'function') {
        track.setSpawnRange(spawnMin, spawnMax);
      }

      if (typeof track.setEnemySpeeds === 'function') {
        track.setEnemySpeeds({ small: enemySpeedSmall, big: enemySpeedBig });
      }
    });

    // Actualizar configuración base para el shuffle aleatorio
    this.trackConfigs = this.tracks.map(track => {
      const existing = this.trackConfigs.find?.(cfg => cfg.track === track);
      return {
        track,
        min: spawnMin,
        max: spawnMax,
        options: existing?.options
      };
    });
    this.runRandomTrackSpawns();
  }

  stopTrackShuffle() {
    this.trackShuffleTimer?.remove();
    this.trackShuffleTimer = null;
    this.trackSpawnCalls?.forEach(t => t?.remove?.());
    this.trackSpawnCalls = [];
  }

  playLevelTransition({ duration = 600, onMidpoint, onComplete } = {}) {
    const camera = this.cameras?.main;

    if (!camera || this.levelTransitionInProgress) {
      onMidpoint?.();
      onComplete?.();
      return;
    }

    this.levelTransitionInProgress = true;

    const cameraEvents = Phaser.Cameras?.Scene2D?.Events;
    const fadeOutEvent = cameraEvents?.FADE_OUT_COMPLETE || 'camerafadeoutcomplete';
    const fadeInEvent = cameraEvents?.FADE_IN_COMPLETE || 'camerafadeincomplete';

    const handleFadeInComplete = () => {
      camera.off(fadeInEvent, handleFadeInComplete);
      this.levelTransitionInProgress = false;
      onComplete?.();
    };

    const handleFadeOutComplete = () => {
      camera.off(fadeOutEvent, handleFadeOutComplete);
      onMidpoint?.();
      camera.fadeIn(duration, 0, 0, 0);
      camera.once(fadeInEvent, handleFadeInComplete);
    };

    camera.once(fadeOutEvent, handleFadeOutComplete);
    camera.fadeOut(duration, 0, 0, 0);
  }

  showLevelBanner({
    text,
    color = '#ffffff',
    stroke = '#000000',
    strokeThickness = 6,
    fontSize = 48,
    delay = 1800
  } = {}) {
    if (!text) return;

    this.levelMessage?.destroy();

    const camera = this.cameras?.main;
    const x = camera ? camera.centerX : 512;

    this.levelMessage = this.add.text(x, 100, text, {
      fontFamily: 'CartoonFont',
      fontSize,
      color,
      stroke,
      strokeThickness
    }).setOrigin(0.5).setDepth(15);

    this.tweens.add({
      targets: this.levelMessage,
      alpha: 0,
      duration: 800,
      delay,
      ease: 'Power2',
      onComplete: () => {
        this.levelMessage?.destroy();
        this.levelMessage = null;
      }
    });
  }

  reachSecondLevel() {
    this.level2Reached = true;

  const applyChanges = () => {
  this.level1Music?.stop();
  if (!this.level2Music) {
    this.level2Music = this.sound.add('nivel2', { loop: true, volume: 0.9 });
  }
  this.level2Music.play();

  this.backgroundImage?.setTexture('esenario2');

  // Activar 4 carriles pero evitando amontonamiento
  this.activeTrackCount = 4; // 3 activos a la vez evita colisiones masivas

  // NIVEL 2: un poquito más rápido, pero sin excesos
  this.adjustDifficulty({
    spawnMin: 1200,
    spawnMax: 2300,
    timeScale: 1.25,
     enemySpeedSmall: 220,   // MÁS RÁPIDO
  enemySpeedBig: 180   
});

};

    const announce = () => {
      this.showLevelBanner({
        text: 'Segundo nivel',
        color: '#ffeb3b',
        fontSize: 48,
        delay: 2200
      });
    };

    this.playLevelTransition({
      duration: 600,
      onMidpoint: applyChanges,
      onComplete: announce
    });
  }

  reachThirdLevel() {
  this.level3Reached = true;

    const applyChanges = () => {
      this.level2Music?.stop();
      
      // Intentar reproducir música del nivel 3
      try {
        if (this.cache.audio?.exists('nivel3')) {
          if (!this.level3Music) {
            this.level3Music = this.sound.add('nivel3', { loop: true, volume: 0.9 });
          }
          this.level3Music.play();
        }
      } catch (e) {}

      this.backgroundImage?.setTexture('nivel3');

      // Detener tracks actuales
      this.tracks.forEach(track => track.stop());

      // Ajustar dificultad
      this.activeTrackCount = 3;
      this.adjustDifficulty({
        spawnMin: 600,
        spawnMax: 1300,
        timeScale: 1.35,
        enemySpeedSmall: 185,
        enemySpeedBig: 150
      });


      // Reiniciar contadores del boss
      this.level3SmallDefeated = 0;
      this.finalBossSpawned = false;
      this.finalBosses = [];
      this.clearBossUI();
      this.updateBossCountdownText();
    };


    const announce = () => {
      this.showLevelBanner({
        text: '¡FINAL!',
        color: '#ff5722',
        fontSize: 52,
        delay: 1800
      });
    };

    this.playLevelTransition({
      duration: 700,
      onMidpoint: applyChanges,
      onComplete: announce
    });
  }

  updateBossCountdownText() {
    if (this.finalBossSpawned) {
      this.destroyBossCountdownUI();
      return;
    }

    const remaining = Math.max(0, this.finalBossSpawnThreshold - this.level3SmallDefeated);
    const text = `Gatos chicos derrotados: ${this.level3SmallDefeated}/${this.finalBossSpawnThreshold}` +
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
    this.trackSpawnsEnabled = false;
    this.stopTrackShuffle();
    this.tracks.forEach(track => track.pauseSpawns?.());
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
      boss.play('final_boss_idle');

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
      callback: () => this.chooseBossAttack(boss), // ? Elegir qué ataque usar
      loop: true
    });

    this.bossAttackTimers.push(timer);
    boss.attackTimer = timer;
  }

  // ? NUEVO: Elige aleatoriamente entre el ataque normal y el especial
  chooseBossAttack(boss) {
    if (!boss || !boss.isAlive) return;

    const chance = Phaser.Math.Between(0, 100);

    if (chance < 30) { // 30% de probabilidad de usar el ataque de área
      this.bossLaneAttack(boss);
    } else { // 70% de probabilidad de usar el ataque normal
      this.bossAttack(boss);
    }
  }

  // ? MODIFICADO: Ataque especial que dispara en 3 de 4 carriles, con aviso.
  bossLaneAttack(boss) {
    if (!boss || !boss.isAlive || !this.player?.isAlive) return;

    // 1. Animación de "aviso" del jefe
    boss.play?.('final_boss_taunt');

    // 2. Elegir un carril seguro aleatoriamente
    const safeLaneIndex = Phaser.Math.Between(0, this.tracks.length - 1);
    const attackLanes = this.tracks.filter((_, index) => index !== safeLaneIndex);

    // 3. Crear indicadores visuales para los carriles de ataque (telegraphing)
    const indicators = [];
    attackLanes.forEach(track => {
      // ? Añadir la línea roja de fondo
      const laneIndicator = this.add.graphics({ fillStyle: { color: 0xff0000, alpha: 0.4 } });
      laneIndicator.fillRect(0, track.y - 80, this.scale.width, 160);
      laneIndicator.setDepth(9); // Un poco por detrás de la imagen
      indicators.push(laneIndicator);

      // ? Añadir la imagen del indicador centrada
      const imageIndicator = this.add.image(this.scale.width / 2, track.y, 'attack_indicator');
      imageIndicator.setOrigin(0.5, 0.5); // Centrar la imagen en su posición
      imageIndicator.setScale(0.2);
      imageIndicator.setDepth(10);
      imageIndicator.setAlpha(0.7);
      indicators.push(imageIndicator);

      // ? Animación de "pulso" para el indicador
      this.tweens.add({
        targets: [laneIndicator, imageIndicator], // Animar ambos indicadores
        alpha: 0.4,
        duration: 250, // Duración de cada pulso
        ease: 'Sine.easeInOut',
        yoyo: true, // Hace que la animación vaya y vuelva (0.7 -> 0.4 -> 0.7)
        repeat: -1 // Repetir indefinidamente hasta que se destruya
      });
    });

    // 4. Tras un breve momento, lanzar los proyectiles y limpiar los indicadores
    this.time.delayedCall(800, () => {
      if (!boss?.isAlive) return;

      // Volver a la animación normal del jefe
      boss.play?.('final_boss_idle');

      // Disparar en los carriles de ataque
      attackLanes.forEach(track => {
        const projectile = new EnemyShoot(this, boss.x, track.y, 'projectileEnemy');
        this.allEnemyProjectiles.add(projectile);
        projectile.fire(boss.x, track.y, 600);
      });

      // Desvanecer y destruir los indicadores visuales
      // Detenemos los tweens de pulso primero
      indicators.forEach(ind => this.tweens.killTweensOf(ind));

      this.tweens.add({
        targets: indicators,
        alpha: 0,
        duration: 300,
        onComplete: () => indicators.forEach(ind => ind.destroy())
      });
    });
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
    // El conteo ahora se basa en derrotas, no en apariciones.
    if (!enemy) return;
    if (!this.level3Reached || this.finalBossSpawned) return;
    if (enemy.size !== 'Small') return;
  }

  incrementSmallDefeat() {
    this.level3SmallDefeated++;
    this.updateBossCountdownText();
    if (this.level3SmallDefeated >= this.finalBossSpawnThreshold) {
      this.spawnFinalBosses();
    }
  }

  bossAttack(boss) {
    if (!boss || !boss.isAlive) return;

    // Ya verificamos que boss existe y está vivo, así que podemos llamar directamente a play
    boss.play('final_boss_attack');
    boss.once('animationcomplete', () => {
      // ? Añadir verificación de que el jefe todavía existe en la escena
      if (boss && boss.isAlive && boss.scene) {
        boss.play('final_boss_idle');
      }
    });

    // ? Disparar una ráfaga de proyectiles más rápidos
    if (this.player?.isAlive) {
      const projectileCount = 3; // Número de proyectiles en la ráfaga
      const projectileDelay = 120; // Milisegundos entre cada proyectil
      const projectileSpeed = 750; // Más rápido que los enemigos normales (que tienen 500)

      for (let i = 0; i < projectileCount; i++) {
        this.time.delayedCall(i * projectileDelay, () => {
          // Asegurarse de que el jefe y el jugador sigan vivos al disparar
          if (!boss?.isAlive || !this.player?.isAlive) return;

          const projectile = new EnemyShoot(this, boss.x, boss.y, 'projectileEnemy');
          this.allEnemyProjectiles.add(projectile);

          // Usar el método .fire() para consistencia y establecer velocidad
          projectile.fire(boss.x, boss.y);
          projectile.setVelocityX(projectileSpeed); // Sobrescribir la velocidad por defecto
          projectile.setAccelerationX(0); // El jefe dispara balas rápidas y constantes
        });
      }
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
      if (enemy && enemy.isAlive && enemy.scene) {
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

          // ?? Asegura que se elimine de la lista de bosses
          Phaser.Utils.Array.Remove(this.finalBosses, enemy);

          // ? Si ya no quedan jefes, muestra la pantalla de victoria
          if (this.finalBosses.length === 0) {
            console.log('?? Jefe final derrotado — mostrando pantalla de victoria');
 
            // Detener la música de fondo actual
            if (this.level3Music?.isPlaying) this.level3Music.stop();
            if (this.level2Music?.isPlaying) this.level2Music.stop();
            if (this.level1Music?.isPlaying) this.level1Music.stop();
 
            // Reproducir sonido de victoria una sola vez y sin interrupciones
            if (this.cache.audio.exists('victory') && !this.winSoundPlayed) {
              this.winSoundPlayed = this.sound.add('victory', { volume: 1.2 });
              this.winSoundPlayed.play();
            }
            this.time.delayedCall(600, () => this.showVictoryPanel());

          }
        }
      });

      this.addScore(500);
    }
    return;
  }

  // Enemigos normales
  enemy.hit();

  // ? Otorgar puntos SOLO si el enemigo es derrotado en este golpe.
  if (!enemy.isAlive) {
    const points = enemy.size === 'Small' ? 5 : 10;
    this.addScore(points);
    if (this.level3Reached && !this.finalBossSpawned && enemy.size === 'Small') {
      this.incrementSmallDefeat();
    }
    // El sonido de muerte ya se reproduce dentro de enemy.hit()
    // this.sound.play('enemy_kill', { volume: 0.5 });
  }

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

// Nivel 1 — SUPER SUPER LENTO
this.trackConfigs = [
  { track: this.tracks[0], min: 7000, max: 11000, options: { initialSpawnMode: 'randomOne', initialDelayRange: [1200, 2500] } },
  { track: this.tracks[1], min: 7500, max: 11500, options: { initialSpawnMode: 'randomOne', initialDelayRange: [1200, 2500] } },
  { track: this.tracks[2], min: 7800, max: 12000, options: { initialSpawnMode: 'randomOne', initialDelayRange: [1200, 2500] } },
  { track: this.tracks[3], min: 8000, max: 13000, options: { initialSpawnMode: 'randomOne', initialDelayRange: [1200, 2500] } }
];


// Nivel 1: activar los 4 carriles pero MUY lento
this.activeTrackCount = 4;
// Mantener 3 carriles activos (no los 4) para más gatos chicos
    this.runRandomTrackSpawns();

    this.input.keyboard.once('keydown-ESC', () => this.scene.start('MenuScene'));
  }

  runRandomTrackSpawns() {
    if (!this.trackConfigs?.length || !this.trackSpawnsEnabled) return;

    const shuffleAndStart = () => {
      if (!this.trackSpawnsEnabled) return;
      const shuffled = Phaser.Utils.Array.Shuffle([...this.trackConfigs]);
      const chosen = shuffled.slice(0, Math.min(this.activeTrackCount, shuffled.length));
      const rest = shuffled.slice(chosen.length);

      // Pausar solo los timers de los no elegidos (sin borrar enemigos vivos)
      rest.forEach(cfg => cfg.track?.pauseSpawns?.());

      // Arrancar o reanudar solo los carriles seleccionados con un pequeño retraso aleatorio
      chosen.forEach((cfg, index) => {
        const delay = Phaser.Math.Between(200, 1200) + index * 180;
         const fn = this.firstShuffleDone ? 'resumeSpawns' : 'start';

        const timer = this.time.delayedCall(delay, () => {
          if (!this.trackSpawnsEnabled) return;
          cfg.track?.[fn]?.(cfg.min, cfg.max, cfg.options);
        });
        this.trackSpawnCalls.push(timer);
      });
    };

    shuffleAndStart();
    this.firstShuffleDone = true;

    // Repetir el shuffle cada pocos segundos para que los carriles activos cambien dinámicamente
    this.trackShuffleTimer?.remove();
    this.trackShuffleTimer = this.time.addEvent({
      delay: Phaser.Math.Between(3200, 5200),
      loop: true,
      callback: () => {
        if (!this.player?.isAlive) return;
        shuffleAndStart();
        this.trackShuffleTimer.delay = Phaser.Math.Between(3200, 5200);
      }
    });
  }

  update() {
    this.ensureTrackSpawnsActive();
    this.updateBossChase();
  }

  ensureTrackSpawnsActive() {
    if (this.finalBossSpawned || this.trackSpawnsEnabled) return;
    this.trackSpawnsEnabled = true;
    this.runRandomTrackSpawns();
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
          const vy = Phaser.Math.Clamp(dy, -60, 60);
          boss.setVelocityY(vy);
        }
      }

      const targetX = Math.max(this.player.x - 200, 180);
      const dx = targetX - boss.x;
      const vx = Phaser.Math.Clamp(dx, -80, 80);
      boss.setVelocityX(vx);
    });
  }

  hitProjectiles(playerProj, enemyProj) {
    if (!playerProj?.active || !enemyProj?.active) return;
    playerProj.destroy(); enemyProj.destroy();
  }

 hitPlayer(player, enemyProj) {
    if (!player?.isAlive || !player?.active) {
        console.warn('?? Colisión ignorada: jugador no válido');
        return;
    }
    
    if (!enemyProj?.active || !enemyProj?.visible) {
        console.warn('?? Colisión ignorada: proyectil no válido');
        return;
    }

    // ?? LOG DETALLADO
    console.error('?? JUGADOR GOLPEADO por proyectil:', {
        proyectilX: Math.round(enemyProj.x),
        proyectilY: Math.round(enemyProj.y),
        jugadorX: Math.round(player.x),
        jugadorY: Math.round(player.y)
    });

    enemyProj.destroy();
    player.setVisible(false);
    player.stop();
    this.gameOver('PROYECTIL_ENEMIGO');
}

 showVictoryPanel() {
  if (this.victoryShown) return;
  this.victoryShown = true;

  this.destroyVictoryUI();
  this.destroyBossCountdownUI();

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


  gameOver(cause = 'DESCONOCIDO') {
  // ?? LOG CRÍTICO PARA IDENTIFICAR CAUSA
  console.error('?? GAME OVER ACTIVADO');
  console.error('?? Causa:', cause);
  console.error('?? Estado del jugador:', {
    x: this.player?.x,
    y: this.player?.y,
    isAlive: this.player?.isAlive,
    visible: this.player?.visible
  });
  
  // ?? LOG DE ENEMIGOS ACTIVOS
  console.error('?? Enemigos activos:', 
    this.allEnemies.children.entries
      .filter(e => e.active)
      .map(e => ({
        size: e.size,
        x: Math.round(e.x),
        y: Math.round(e.y),
        isAlive: e.isAlive,
        isBoss: e.isBoss
      }))
  );
  
  // ?? LOG DE PROYECTILES ENEMIGOS ACTIVOS
  console.error('?? Proyectiles enemigos activos:', 
    this.allEnemyProjectiles.children.entries
      .filter(p => p.active)
      .map(p => ({
        x: Math.round(p.x),
        y: Math.round(p.y)
      }))
  );
  
  // ?? LOG DE BOSSES
  if (this.finalBosses.length > 0) {
    console.error('?? Jefes activos:', 
      this.finalBosses.map(b => ({
        x: Math.round(b.x),
        y: Math.round(b.y),
        isAlive: b.isAlive
      }))
    );
  }

  console.error('=====================================');
  
  this.deathCause = cause;
  // Detiene todo
  this.tracks.forEach(track => track.stop());
  this.stopTrackShuffle();
  this.trackSpawnsEnabled = false;
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
  this.level3SmallDefeated = 0;
  this.finalBossSpawnThreshold = 10;
  this.destroyBossCountdownUI();
  this.destroyVictoryUI();

  // Actualiza récord
  if (this.score > this.previousHighscore) {
    this.highscoreText?.setText('Record: NEW!');
    this.registry.set('highscore', this.score);
  } else {
    this.highscoreText?.setText(`Record: ${this.highscore}`);
  }

  // --- NUEVO GAME OVER VISUAL ---
  const goBg = this.add.image(
    this.cameras.main.centerX,
    this.cameras.main.centerY,
    'gameover'
  )
    .setOrigin(0.5)
    .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
    .setDepth(1000)
    .setAlpha(0);

  // Texto superior
  const title = this.add.text(this.cameras.main.centerX, 220, '', {
    fontFamily: 'CartoonFont',
    fontSize: 72,
    color: '#ffffff',
    stroke: '#000',
    strokeThickness: 8,
  })
    .setOrigin(0.5)
    .setDepth(1001)
    .setAlpha(0);

  const subtitle = this.add.text(
    this.cameras.main.centerX,
    320,
    `Tu puntuación: ${this.score}`,
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
    .setDepth(1001)
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
      .setDepth(1001)
      .setAlpha(0)
      .setStrokeStyle(4, 0x000000);

    const text = this.add.text(this.cameras.main.centerX, y, label, buttonStyle)
      .setOrigin(0.5)
      .setDepth(1002)
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

  // Contenedor completo
  this.gameOverPanel = this.add.container(0, 0, [
    goBg,
    title,
    subtitle,
    btnReplayBg,
    btnReplayText,
    btnMenuBg,
    btnMenuText,
  ]);
  this.gameOverPanel.setDepth(1002);

  // Animación de aparición
  this.tweens.add({
    targets: [
      goBg,
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




