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

    // ✅ Configuración actual y estado
    this.currentMinDelay = 3000;
    this.currentMaxDelay = 6000;
    this.isActive = true; // ✅ NUEVO: Tracking del estado del carril
    this.spawnEnabled = false; // ✅ NUEVO: Control de generación
  }

  // ✅ NUEVO: Método para verificar si un enemigo puede aparecer
  canSpawnEnemy(enemy) {
    if (!enemy || !this.scene || !this.isActive || !this.spawnEnabled) {
      return false;
    }
    
    // ✅ CORREGIDO: Solo verificar si NO está vivo y NO está activo
    // La posición x < 0 era demasiado restrictiva
    return !enemy.isAlive && !enemy.active;
  }

  // ✅ Iniciar el carril (llamado desde GameScene.start())
  start(minDelay = 1600, maxDelay = 2600) {
    this.spawnEnabled = true;
    this.isActive = true;
    this.resumeSpawns(minDelay, maxDelay);
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

  // ✅ MEJORADO: Reanuda timers con mejor lógica
  resumeSpawns(minDelay = this.currentMinDelay, maxDelay = this.currentMaxDelay) {
    // Actualizar configuración
    this.currentMinDelay = minDelay;
    this.currentMaxDelay = maxDelay;
    this.spawnEnabled = true;
    
    const getDelay = () => Phaser.Math.Between(minDelay, maxDelay);
    
    // --- LÓGICA DE FRECUENCIA ---
    // Hacemos que los enemigos grandes sean más raros que los pequeños.
    const bigEnemyDelayMultiplier = 1.8; // Aparecerán casi el doble de lento.

    // ✅ Timer para enemigos pequeños
    if (!this.releaseTimerSmall) {
      this.releaseTimerSmall = this.scene.time.addEvent({
        delay: getDelay(),
        callback: () => {
          if (!this.scene || !this.spawnEnabled) return;
          
          // ✅ Usar el nuevo método de verificación
          if (this.canSpawnEnemy(this.snowmanSmall)) {
            console.log(`🔵 Spawning SMALL enemy on track ${this.id}`);
            this.snowmanSmall.start();
          } else {
            console.log(`⚠️ Cannot spawn SMALL on track ${this.id}:`, {
              isAlive: this.snowmanSmall?.isAlive,
              active: this.snowmanSmall?.active,
              visible: this.snowmanSmall?.visible,
              x: Math.round(this.snowmanSmall?.x || 0)
            });
          }
          
          // ✅ Siempre actualizar el delay para el próximo ciclo
          if (this.releaseTimerSmall) {
            this.releaseTimerSmall.delay = getDelay();
          }
        },
        loop: true
      });
    }

    // ✅ Timer para enemigos grandes
    if (!this.releaseTimerBig) {
      this.releaseTimerBig = this.scene.time.addEvent({
        delay: getDelay() * bigEnemyDelayMultiplier, // Aplicamos el multiplicador
        callback: () => {
          if (!this.scene || !this.spawnEnabled) return;
          
          // ✅ Usar el nuevo método de verificación
          if (this.canSpawnEnemy(this.snowmanBig)) {
            console.log(`🔴 Spawning BIG enemy on track ${this.id}`);
            this.snowmanBig.start();
          } else {
            console.log(`⚠️ Cannot spawn BIG on track ${this.id}:`, {
              isAlive: this.snowmanBig?.isAlive,
              active: this.snowmanBig?.active,
              visible: this.snowmanBig?.visible,
              x: Math.round(this.snowmanBig?.x || 0)
            });
          }
          
          // ✅ Siempre actualizar el delay para el próximo ciclo
          if (this.releaseTimerBig) {
            this.releaseTimerBig.delay = getDelay() * bigEnemyDelayMultiplier;
          }
        },
        loop: true
      });
    }
  }

  // ✅ MEJORADO: Ajustar velocidades de enemigos
  setEnemySpeeds({ small, big }) {
    if (typeof small === 'number') {
      this.snowmanSmall.speed = small;

      // Actualizar velocidad si está caminando activamente
      if (
        this.snowmanSmall.isAlive &&
        this.snowmanSmall.active &&
        this.snowmanSmall.previousAction === 0 &&
        this.snowmanSmall.body &&
        this.snowmanSmall.body.enable
      ) {
        this.snowmanSmall.setVelocityX(small);
      }
    }

    if (typeof big === 'number') {
      this.snowmanBig.speed = big;

      // Actualizar velocidad si está caminando activamente
      if (
        this.snowmanBig.isAlive &&
        this.snowmanBig.active &&
        this.snowmanBig.previousAction === 0 &&
        this.snowmanBig.body &&
        this.snowmanBig.body.enable
      ) {
        this.snowmanBig.setVelocityX(big);
      }
    }
  }

  // ✅ MEJORADO: Detener completamente el carril
  stop() {
    this.isActive = false;
    this.spawnEnabled = false;
    this.pauseSpawns();
    
    // Detener enemigos activos
    if (this.snowmanSmall) this.snowmanSmall.stop();
    if (this.snowmanBig) this.snowmanBig.stop();
  }

  // ✅ NUEVO: Reactivar el carril
  activate() {
    this.isActive = true;
    this.spawnEnabled = true;
    if (!this.releaseTimerSmall || !this.releaseTimerBig) {
      this.resumeSpawns();
    }
  }

  // ✅ NUEVO: Desactivar temporalmente (sin detener enemigos vivos)
  deactivate() {
    this.isActive = false;
    this.spawnEnabled = false;
    this.pauseSpawns();
  }

  // Proyectiles del jugador
  throwPlayerSnowball(playerX) {
    if (!this.scene) return;
    
    const projectile = new PlayerShoot(this.scene, playerX, this.y, 'projectile');
    this.scene.allPlayerProjectiles.add(projectile);
    projectile.fire(playerX, this.y);
  }

  // Proyectiles de enemigos
  throwEnemySnowball(enemyX) {
    if (!this.scene) return;
    
    const projectile = new EnemyShoot(this.scene, enemyX, this.y, 'projectileEnemy');
    this.scene.allEnemyProjectiles.add(projectile);
    projectile.fire(enemyX, this.y);
  }

  // ✅ NUEVO: Forzar spawn inmediato (útil para testing o eventos especiales)
  forceSpawn(size = 'Small') {
    const enemy = size === 'Small' ? this.snowmanSmall : this.snowmanBig;
    if (this.canSpawnEnemy(enemy)) {
      enemy.start();
      return true;
    }
    return false;
  }

  // ✅ NUEVO: Obtener estado del carril (útil para debugging)
  getStatus() {
    return {
      id: this.id,
      isActive: this.isActive,
      spawnEnabled: this.spawnEnabled,
      smallAlive: this.snowmanSmall?.isAlive || false,
      bigAlive: this.snowmanBig?.isAlive || false,
      hasTimers: !!(this.releaseTimerSmall && this.releaseTimerBig)
    };
  }
}