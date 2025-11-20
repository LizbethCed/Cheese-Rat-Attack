// Track.js — Versión corregida, optimizada y compatible con tu juego

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

    // GRUPO DINÁMICO DE ENEMIGOS (permite MUCHOS por carril)
    this.enemies = scene.physics.add.group({
      runChildUpdate: true,
      allowGravity: false
    });

    // Tiempos base
    this.currentMinDelay = 9000;
    this.currentMaxDelay = 1500;

    this.spawnTimer = null;
  }

  // ===========================
  // 🔥 CREA UN ENEMIGO
  // ===========================
  spawnEnemy(size) {
    let enemy = this.enemies.getFirstDead();

    if (!enemy) {
      enemy = new Enemy(this.scene, this, size);
      this.enemies.add(enemy);
    }

    enemy.size = size;
    enemy.currentTrack = this;
    enemy.start();
  }

  pauseSpawns() {
    if (this.spawnTimer) {
      this.spawnTimer.remove();
      this.spawnTimer = null;
    }
  }

  // ===========================
  // 🔥 REANUDAR SPawns
  // ===========================
  resumeSpawns(min = this.currentMinDelay, max = this.currentMaxDelay) {
    this.currentMinDelay = min;
    this.currentMaxDelay = max;

    const delayFn = () => Phaser.Math.Between(min, max);

    this.spawnTimer = this.scene.time.addEvent({
  delay: delayFn(),
  loop: true,
  callback: () => {
    if (!this.scene || !this.spawnTimer) return;

    // Evitar amontonamientos (si un enemigo está muy cerca del inicio)
    const nearest = this.enemies.getChildren().some(e =>
      e.active &&
      e.isAlive &&
      e.x < 200 // si hay un gato recién salido, NO sacar otro encima
    );

    if (nearest) {
      this.spawnTimer.delay = Phaser.Math.Between(min, max);
      return;
    }

    // Spawn normal
    const type = Phaser.Math.Between(0, 100) < 70 ? 'Small' : 'Big';

    // DESFASE natural para evitar que todos los carriles spawn al mismo tiempo
    const offset = Phaser.Math.Between(120, 450);

    this.scene.time.delayedCall(offset, () => {
      this.spawnEnemy(type);
    });

    this.spawnTimer.delay = delayFn();
  }
});

  }

  // ===========================
  // 🔥 CAMBIO DE DIFICULTAD
  // ===========================
  setDifficulty({ spawnMin, spawnMax }) {
    this.currentMinDelay = spawnMin;
    this.currentMaxDelay = spawnMax;
    this.pauseSpawns();
    this.resumeSpawns(spawnMin, spawnMax);
  }

  // ===========================
  // 🔥 INICIO DE CARRIL
  // ===========================
  start(minDelay, maxDelay, options = {}) {
    this.stop();

    this.currentMinDelay = minDelay;
    this.currentMaxDelay = maxDelay;

    // Spawn inicial (uno pequeño y uno grande)
    // Spawn inicial aleatorio y solo 1 gato
const type = Phaser.Math.Between(0, 100) < 70 ? 'Small' : 'Big';

this.scene.time.delayedCall(
  Phaser.Math.Between(400, 1600),   // cada carril inicia en diferente tiempo
  () => this.spawnEnemy(type)
);


    this.resumeSpawns(minDelay, maxDelay);
  }

  // ===========================
  // 🔥 DETENER CARRIL
  // ===========================
  stop() {
    this.pauseSpawns();

    this.enemies.children.each(e => {
      if (e.stop) e.stop();
    });
  }

  // ===========================
  // DISPAROS
  // ===========================
  throwPlayerSnowball(x) {
    const snowball = new PlayerShoot(this.scene, 0, 0, 'projectile');
    this.scene.allPlayerProjectiles.add(snowball);
    snowball.fire(x, this.y);
  }

  throwEnemySnowball(x) {
    const snowball = new EnemyShoot(this.scene, x, this.y, 'projectileEnemy');
    this.scene.allEnemyProjectiles.add(snowball);
    snowball.fire(x, this.y);
  }
}
