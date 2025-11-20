// Track.js - Versión difícil / spawns rápidos / anti-spawn pegado

import Enemy from '../entities/Enemy.js';
import PlayerShoot from '../entities/PlayerShoot.js';
import EnemyShoot from '../entities/EnemyShoot.js';

export default class Track {
  constructor(scene, id, trackY) {
    this.scene = scene;
    this.id = id;
    this.y = trackY;

    this.nest = scene.physics.add
      .image(1024, trackY - 10, 'nest')
      .setOrigin(1.3, 1)
      .setScale(0.1);

    this.snowmanBig = new Enemy(scene, this, 'Big');
    this.snowmanSmall = new Enemy(scene, this, 'Small');

    if (scene.allEnemies) {
      scene.allEnemies.add(this.snowmanBig);
      scene.allEnemies.add(this.snowmanSmall);
    }

    this.releaseTimerSmall = null;
    this.releaseTimerBig = null;

    this.currentMinDelay = 400;   // 🚀 Spawns muy rápidos
    this.currentMaxDelay = 1000;
  }

  pauseSpawns() {
    if (this.releaseTimerSmall) {
      this.releaseTimerSmall.remove();
      this.releaseTimerSmall = null;
    }
    if (this.releaseTimerBig) {
      this.releaseTimerBig.remove();
      this.releaseTimerBig = null;
    }
  }

  resumeSpawns(minDelay = this.currentMinDelay, maxDelay = this.currentMaxDelay) {
    this.currentMinDelay = minDelay;
    this.currentMaxDelay = maxDelay;

    const getDelay = () => Phaser.Math.Between(minDelay, maxDelay);

    // --- SMALL ---
    this.releaseTimerSmall = this.scene.time.addEvent({
      delay: getDelay(),
      callback: () => {
        if (!this.releaseTimerSmall || !this.scene) return;

        if (this.snowmanSmall && !this.snowmanSmall.isAlive) {
          this.snowmanSmall.start();

          // 🔥 Anti-spawn pegado
          if (this.releaseTimerBig) {
            this.releaseTimerBig.delay += Phaser.Math.Between(500, 1200);
          }
        }

        this.releaseTimerSmall.delay = getDelay();
      },
      loop: true
    });

    // --- BIG ---
    this.releaseTimerBig = this.scene.time.addEvent({
      delay: getDelay(),
      callback: () => {
        if (!this.releaseTimerBig || !this.scene) return;

        if (this.snowmanBig && !this.snowmanBig.isAlive) {
          this.snowmanBig.start();

          // 🔥 Anti-spawn pegado
          if (this.releaseTimerSmall) {
            this.releaseTimerSmall.delay += Phaser.Math.Between(500, 1200);
          }
        }

        this.releaseTimerBig.delay = getDelay();
      },
      loop: true
    });
  }

  setDifficulty({ spawnMin, spawnMax }) {
    this.currentMinDelay = spawnMin;
    this.currentMaxDelay = spawnMax;

    // 🧨 IMPORTANTE: aplicar los nuevos tiempos
    this.pauseSpawns();
    this.resumeSpawns(spawnMin, spawnMax);
  }

  start(minDelay, maxDelay, options = {}) {
    const { initialSpawnMode = "both", initialDelayRange = null } = options;

    this.stop();

    this.currentMinDelay = minDelay;
    this.currentMaxDelay = maxDelay;

    const getDelay = () => Phaser.Math.Between(minDelay, maxDelay);

    const startWithOptionalDelay = (enemy) => {
      if (initialDelayRange && Array.isArray(initialDelayRange)) {
        const [dMin, dMax] = initialDelayRange;
        const delay = Phaser.Math.Between(dMin || 0, dMax || 0);

        this.scene.time.delayedCall(delay, () => {
          if (enemy && !enemy.isAlive) enemy.start();
        });

      } else {
        if (!enemy.isAlive) enemy.start();
      }
    };

    if (initialSpawnMode === "randomOne") {
      const pickSmall = Phaser.Math.Between(0, 1) === 0;
      startWithOptionalDelay(pickSmall ? this.snowmanSmall : this.snowmanBig);
    } else {
      startWithOptionalDelay(this.snowmanSmall);
      startWithOptionalDelay(this.snowmanBig);
    }

    // Timers
    this.releaseTimerSmall = this.scene.time.addEvent({
      delay: getDelay(),
      callback: () => {
        if (!this.releaseTimerSmall) return;

        if (this.snowmanSmall && !this.snowmanSmall.isAlive) {
          this.snowmanSmall.start();

          if (this.releaseTimerBig) {
            this.releaseTimerBig.delay += Phaser.Math.Between(500, 1200);
          }
        }

        this.releaseTimerSmall.delay = getDelay();
      },
      loop: true
    });

    this.releaseTimerBig = this.scene.time.addEvent({
      delay: getDelay(),
      callback: () => {
        if (!this.releaseTimerBig) return;

        if (this.snowmanBig && !this.snowmanBig.isAlive) {
          this.snowmanBig.start();

          if (this.releaseTimerSmall) {
            this.releaseTimerSmall.delay += Phaser.Math.Between(500, 1200);
          }
        }

        this.releaseTimerBig.delay = getDelay();
      },
      loop: true
    });
  }

  stop() {
    if (this.releaseTimerSmall) {
      this.releaseTimerSmall.remove();
      this.releaseTimerSmall = null;
    }
    if (this.releaseTimerBig) {
      this.releaseTimerBig.remove();
      this.releaseTimerBig = null;
    }

    if (this.snowmanSmall) this.snowmanSmall.stop();
    if (this.snowmanBig) this.snowmanBig.stop();
  }

  restart() {
    this.start(this.currentMinDelay, this.currentMaxDelay);
  }

  throwPlayerSnowball(x) {
    const snowball = new PlayerShoot(this.scene, 0, 0, 'projectile');
    this.scene.allPlayerProjectiles.add(snowball);
    snowball.fire(x, this.y);
  }

  throwEnemySnowball(x) {
    const snowball = new EnemyShoot(this.scene, x, this.y, 'projectileEnemy');
    this.scene.add.existing(snowball);
    this.scene.physics.add.existing(snowball);
    this.scene.allEnemyProjectiles.add(snowball);
    snowball.fire(x, this.y);
  }
}
