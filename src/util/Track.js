// Track.js — Versión final corregida y compatible con tu sistema actual

import Enemy from '../entities/Enemy.js';
import PlayerShoot from '../entities/PlayerShoot.js';
import EnemyShoot from '../entities/EnemyShoot.js';

export default class Track {
  constructor(scene, id, trackY) {
    this.scene = scene;
    this.id = id;
    this.y = trackY;

    // Casa del gato
    this.nest = scene.physics.add
      .image(1024, trackY - 10, 'nest')
      .setOrigin(1.3, 1)
      .setScale(0.1);

    // Grupo dinámico para permitir muchos enemigos en un carril
    this.enemies = scene.physics.add.group({
      runChildUpdate: true,
      allowGravity: false
    });

    // Spawns
    this.currentMinDelay = 8000;
    this.currentMaxDelay = 12000;
    this.spawnTimer = null;

    // Velocidades por defecto
    this.enemySpeedSmall = 120;
    this.enemySpeedBig = 90;
  }

  // =====================================================
  // 🔥 Cambiar velocidad de los enemigos (desde GameScene)
  // =====================================================
  setEnemySpeeds({ small, big }) {
    this.enemySpeedSmall = small;
    this.enemySpeedBig = big;
  }

  // =====================================================
  // 🔥 Crear enemigo nuevo o reutilizado
  // =====================================================
  spawnEnemy(size) {
    let enemy = this.enemies.getFirstDead();

    if (!enemy) {
      enemy = new Enemy(this.scene, this, size);
      this.enemies.add(enemy);
    }

    enemy.size = size;
    enemy.currentTrack = this;

    // ⭐ APLICAR VELOCIDAD SEGÚN EL NIVEL
    enemy.speed = (size === "Small")
      ? this.enemySpeedSmall
      : this.enemySpeedBig;

    enemy.start();
  }

  // =====================================================
  pauseSpawns() {
    if (this.spawnTimer) {
      this.spawnTimer.remove();
      this.spawnTimer = null;
    }
  }

  // =====================================================
  // 🔥 Control de spawns aleatorios
  // =====================================================
  resumeSpawns(min = this.currentMinDelay, max = this.currentMaxDelay) {
    this.currentMinDelay = min;
    this.currentMaxDelay = max;

    const getDelay = () => Phaser.Math.Between(min, max);

    this.spawnTimer = this.scene.time.addEvent({
      delay: getDelay(),
      loop: true,
      callback: () => {
        if (!this.scene || !this.spawnTimer) return;

        // Evitar que dos enemigos salgan pegados
        const tooClose = this.enemies.getChildren().some(e =>
          e.active && e.isAlive && e.x < 240
        );

        if (tooClose) {
          this.spawnTimer.delay = getDelay();
          return;
        }

        // Tipo de enemigo (70% pequeño, 30% grande)
        const type = Phaser.Math.Between(0, 100) < 70 ? "Small" : "Big";

        // Desfase natural para evitar que 4 carriles spawneen juntos
        const offset = Phaser.Math.Between(120, 450);

        this.scene.time.delayedCall(offset, () => {
          this.spawnEnemy(type);
        });

        this.spawnTimer.delay = getDelay();
      }
    });
  }

  // =====================================================
  // 🔥 Cambiar dificultad desde GameScene
  // =====================================================
  setDifficulty({ spawnMin, spawnMax }) {
    this.currentMinDelay = spawnMin;
    this.currentMaxDelay = spawnMax;
    this.pauseSpawns();
    this.resumeSpawns(spawnMin, spawnMax);
  }

  // =====================================================
  // 🔥 Iniciar el carril
  // =====================================================
  start(minDelay, maxDelay, options = {}) {
    this.stop();

    this.currentMinDelay = minDelay;
    this.currentMaxDelay = maxDelay;

    // Un solo gato inicial por carril (aleatorio)
    const type = Phaser.Math.Between(0, 100) < 70 ? "Small" : "Big";

    this.scene.time.delayedCall(
      Phaser.Math.Between(400, 1600),
      () => this.spawnEnemy(type)
    );

    this.resumeSpawns(minDelay, maxDelay);
  }

  // =====================================================
  // 🔥 Detener carril
  // =====================================================
  stop() {
    this.pauseSpawns();
    this.enemies.children.each(e => e.stop?.());
  }

  // =====================================================
  // Disparos del jugador
  // =====================================================
  throwPlayerSnowball(x) {
    const snowball = new PlayerShoot(this.scene, 0, 0, "projectile");
    this.scene.allPlayerProjectiles.add(snowball);
    snowball.fire(x, this.y);
  }

  // =====================================================
  // Disparos del enemigo
  // =====================================================
  throwEnemySnowball(x) {
    const snowball = new EnemyShoot(this.scene, x, this.y, "projectileEnemy");
    this.scene.allEnemyProjectiles.add(snowball);
    snowball.fire(x, this.y);
  }
}
