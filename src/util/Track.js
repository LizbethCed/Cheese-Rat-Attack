// Track.js - VersiÃ³n corregida con mejor manejo de timers

import Enemy from '../entities/Enemy.js';
import PlayerShoot from '../entities/PlayerShoot.js';
import EnemyShoot from '../entities/EnemyShoot.js';

export default class Track {
  constructor(scene, id, trackY) {
    this.scene = scene;
    this.id = id;
    this.y = trackY;

    // Nido del lado derecho (jugador)
    this.nest = scene.physics.add
      .image(1024, trackY - 10, 'nest')
      .setOrigin(1.3, 1)
      .setScale(0.1);

    // Crear los enemigos individuales
    this.snowmanBig = new Enemy(scene, this, 'Big');
    this.snowmanSmall = new Enemy(scene, this, 'Small');
    
    // âœ… AÃ±adirlos al grupo GLOBAL de enemigos
    if (scene.allEnemies) {
      scene.allEnemies.add(this.snowmanBig);
      scene.allEnemies.add(this.snowmanSmall);
    }

    this.releaseTimerSmall = null;
    this.releaseTimerBig = null;

    // âœ… NUEVO: Guardar configuraciÃ³n actual
    this.currentMinDelay = 3000;
    this.currentMaxDelay = 6000;
  }

  // Detiene solo los timers de spawn sin quitar enemigos vivos
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

  // Reanuda timers respetando enemigos ya presentes
  resumeSpawns(minDelay = this.currentMinDelay, maxDelay = this.currentMaxDelay) {
    this.currentMinDelay = minDelay;
    this.currentMaxDelay = maxDelay;
    const getDelay = () => Phaser.Math.Between(minDelay, maxDelay);

    if (this.releaseTimerSmall) {
      this.releaseTimerSmall.delay = getDelay();
    } else {
      this.releaseTimerSmall = this.scene.time.addEvent({
        delay: getDelay(),
        callback: () => {
          if (!this.releaseTimerSmall || !this.scene) return;
          if (this.snowmanSmall && !this.snowmanSmall.isAlive) {
            this.snowmanSmall.start();
          }
          if (this.releaseTimerSmall) this.releaseTimerSmall.delay = getDelay();
        },
        loop: true
      });
    }

    if (this.releaseTimerBig) {
      this.releaseTimerBig.delay = getDelay();
    } else {
      this.releaseTimerBig = this.scene.time.addEvent({
        delay: getDelay(),
        callback: () => {
          if (!this.releaseTimerBig || !this.scene) return;
          if (this.snowmanBig && !this.snowmanBig.isAlive) {
            this.snowmanBig.start();
          }
          if (this.releaseTimerBig) this.releaseTimerBig.delay = getDelay();
        },
        loop: true
      });
    }
  }

  setEnemySpeeds({ small, big }) {
    if (typeof small === 'number') {
      this.snowmanSmall.speed = small;

      if (
        this.snowmanSmall.isAlive &&
        this.snowmanSmall.previousAction === 0 &&
        this.snowmanSmall.body &&
        this.snowmanSmall.body.enable
      ) {
        this.snowmanSmall.setVelocityX(small);
      }
    }

    if (typeof big === 'number') {
      this.snowmanBig.speed = big;

      if (
        this.snowmanBig.isAlive &&
        this.snowmanBig.previousAction === 0 &&
        this.snowmanBig.body &&
        this.snowmanBig.body.enable
      ) {
        this.snowmanBig.setVelocityX(big);
      }
    }
  }

     start(minDelay, maxDelay, options = {}) {
    const {
      initialSpawnMode = "both", // "both" | "randomOne"
      initialDelayRange = null   // [min, max] ms or null for immediate
    } = options;
    // �o. CR�?TICO: Detener timers ANTES de crear nuevos
    this.stop();

    // �o. Guardar configuraci�n
    this.currentMinDelay = minDelay;
    this.currentMaxDelay = maxDelay;

    const startWithOptionalDelay = (enemy) => {
      if (initialDelayRange && Array.isArray(initialDelayRange) && initialDelayRange.length === 2) {
        const [dMin, dMax] = initialDelayRange;
        const delay = Phaser.Math.Between(dMin || 0, dMax || 0);
        this.scene.time.delayedCall(delay, () => {
          if (enemy && !enemy.isAlive) enemy.start();
        });
      } else if (!enemy.isAlive) {
        enemy.start();
      }
    };

    if (initialSpawnMode === "randomOne") {
      const pickSmall = Phaser.Math.Between(0, 1) === 0;
      startWithOptionalDelay(pickSmall ? this.snowmanSmall : this.snowmanBig);
    } else {
      startWithOptionalDelay(this.snowmanSmall);
      startWithOptionalDelay(this.snowmanBig);
    }

    // Funci�n para obtener delay aleatorio (M�S CONSISTENTE)
    const getDelay = () => Phaser.Math.Between(minDelay, maxDelay);

    // �o. Timer para enemigo peque�o con verificaci�n estricta
    this.releaseTimerSmall = this.scene.time.addEvent({
      delay: getDelay(),
      callback: () => {
        // Verificar que el timer existe y no ha sido cancelado
        if (!this.releaseTimerSmall || !this.scene) return;
        
        // Solo spawner si no est� vivo
        if (this.snowmanSmall && !this.snowmanSmall.isAlive) {
          this.snowmanSmall.start();
        }
        // Asignar nuevo delay ANTES de la pr�xima iteraci�n
        if (this.releaseTimerSmall) {
          this.releaseTimerSmall.delay = getDelay();
        }
      },
      loop: true
    });

    // �o. Timer para enemigo grande (MISMO INTERVALO que peque�o ahora)
    this.releaseTimerBig = this.scene.time.addEvent({
      delay: getDelay(),
      callback: () => {
        // Verificar que el timer existe y no ha sido cancelado
        if (!this.releaseTimerBig || !this.scene) return;
        
        // Solo spawner si no est� vivo
        if (this.snowmanBig && !this.snowmanBig.isAlive) {
          this.snowmanBig.start();
        }
        // Asignar nuevo delay ANTES de la pr�xima iteraci�n
        if (this.releaseTimerBig) {
          this.releaseTimerBig.delay = getDelay();
        }
      },
      loop: true
    });
  }

  stop() {
    // âœ… Cancelar TODOS los timers de forma segura
    if (this.releaseTimerSmall) {
      this.releaseTimerSmall.remove();
      this.releaseTimerSmall = null;
    }
    if (this.releaseTimerBig) {
      this.releaseTimerBig.remove();
      this.releaseTimerBig = null;
    }

    // Detener enemigos
    if (this.snowmanSmall) this.snowmanSmall.stop();
    if (this.snowmanBig) this.snowmanBig.stop();
  }

    // âœ… NUEVO: Reiniciar con los mismos parÃ¡metros (Ãºtil para cambios de nivel)
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

