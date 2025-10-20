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
      .setOrigin(1, 1)
      .setScale(0.4);

    // Crear los enemigos individuales
    this.snowmanBig = new Enemy(scene, this, 'Big');
    this.snowmanSmall = new Enemy(scene, this, 'Small');
    
    // ✅ Añadirlos al grupo GLOBAL de enemigos
    if (scene.allEnemies) {
      scene.allEnemies.add(this.snowmanBig);
      scene.allEnemies.add(this.snowmanSmall);
      console.log(`✅ Enemigos del track ${id} añadidos al grupo global`);
    }

    this.releaseTimerSmall = null;
    this.releaseTimerBig = null;
  }

  start(minDelay, maxDelay) {
    const delay = Phaser.Math.Between(minDelay, maxDelay);
    this.releaseTimerSmall = this.scene.time.addEvent({
      delay,
      callback: () => this.snowmanSmall.start()
    });

    this.releaseTimerBig = this.scene.time.addEvent({
      delay: delay * 3,
      callback: () => this.snowmanBig.start()
    });
  }

  stop() {
    this.snowmanSmall.stop();
    this.snowmanBig.stop();

    if (this.releaseTimerSmall) this.releaseTimerSmall.remove();
    if (this.releaseTimerBig) this.releaseTimerBig.remove();
  }

  // =========================
  // Disparos
  // =========================
  throwPlayerSnowball(x) {
    console.log('🔫 Disparando proyectil del jugador en track', this.id);
    
    // Crear nuevo proyectil (sin posición inicial para evitar conflictos)
    const snowball = new PlayerShoot(this.scene, 0, 0, 'projectile');
    
    // ✅ Añadir al grupo GLOBAL
    this.scene.allPlayerProjectiles.add(snowball);
    
    // Activar proyectil
    snowball.fire(x, this.y);
    
    console.log('✅ Proyectil añadido al grupo global', {
      x: snowball.x,
      y: snowball.y,
      totalProjectiles: this.scene.allPlayerProjectiles.getLength()
    });
  }

  throwEnemySnowball(x) {
    const snowball = new EnemyShoot(this.scene, x, this.y, 'projectile');
    this.scene.add.existing(snowball);
    this.scene.physics.add.existing(snowball);
    
    // ✅ Añadir al grupo GLOBAL
    this.scene.allEnemyProjectiles.add(snowball);
    
    snowball.fire(x, this.y);
  }
}