// Track.js - Versión corregida con mejor manejo de timers

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
    
    // ✅ Añadirlos al grupo GLOBAL de enemigos
    if (scene.allEnemies) {
      scene.allEnemies.add(this.snowmanBig);
      scene.allEnemies.add(this.snowmanSmall);
    }

    this.releaseTimerSmall = null;
    this.releaseTimerBig = null;

    // ✅ NUEVO: Guardar configuración actual
    this.currentMinDelay = 3000;
    this.currentMaxDelay = 6000;
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

  start(minDelay, maxDelay) {
    // ✅ CRÍTICO: Detener timers anteriores ANTES de crear nuevos
    this.stop();

    // ✅ Guardar configuración
    this.currentMinDelay = minDelay;
    this.currentMaxDelay = maxDelay;

    // ✅ Iniciar el primer enemigo pequeño inmediatamente
    if (!this.snowmanSmall.isAlive) {
      this.snowmanSmall.start();
    }

    // Función para obtener delay aleatorio
    const getDelay = () => Phaser.Math.Between(minDelay, maxDelay);

    // ✅ Timer para enemigo pequeño con verificación de estado
    this.releaseTimerSmall = this.scene.time.addEvent({
      delay: getDelay(),
      callback: () => {
        // ✅ Verificar que el timer sigue siendo válido
        if (!this.releaseTimerSmall) return;

        if (!this.snowmanSmall.isAlive) {
          this.snowmanSmall.start();
        }
        
        // ✅ Asignar nuevo delay aleatorio
        if (this.releaseTimerSmall) {
          this.releaseTimerSmall.delay = getDelay();
        }
      },
      loop: true
    });

    // ✅ Timer para enemigo grande
    this.releaseTimerBig = this.scene.time.addEvent({
      delay: getDelay() * 2,
      callback: () => {
        // ✅ Verificar que el timer sigue siendo válido
        if (!this.releaseTimerBig) return;

        if (!this.snowmanBig.isAlive) {
          this.snowmanBig.start();
        }
        
        // ✅ Asignar nuevo delay aleatorio
        if (this.releaseTimerBig) {
          this.releaseTimerBig.delay = getDelay() * 2;
        }
      },
      loop: true
    });

    console.log(`✅ Track ${this.id} iniciado con delays: ${minDelay}-${maxDelay}ms`);
  }

  stop() {
    // ✅ Detener enemigos
    if (this.snowmanSmall) {
      this.snowmanSmall.stop();
    }
    if (this.snowmanBig) {
      this.snowmanBig.stop();
    }

    // ✅ Remover timers de forma segura
    if (this.releaseTimerSmall) {
      this.releaseTimerSmall.remove();
      this.releaseTimerSmall = null;
    }
    if (this.releaseTimerBig) {
      this.releaseTimerBig.remove();
      this.releaseTimerBig = null;
    }

    console.log(`🛑 Track ${this.id} detenido`);
  }

  // ✅ NUEVO: Método para reiniciar con los mismos parámetros
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