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

    // Enemigos de esta pista
    this.snowmanBig = new Enemy(scene, this, 'Big');
    this.snowmanSmall = new Enemy(scene, this, 'Small');

    // Grupos de proyectiles
    this.playerSnowballs = scene.physics.add.group({
      classType: PlayerShoot,
      maxSize: 12,
      runChildUpdate: true,
      allowGravity: false
    });

    this.enemySnowballs = scene.physics.add.group({
      classType: EnemyShoot,
      maxSize: 12,
      runChildUpdate: true,
      allowGravity: false
    });

    // 💥 Colisión proyectil del jugador ↔ proyectil enemigo
    scene.physics.add.overlap(
      this.playerSnowballs,
      this.enemySnowballs,
      this.hitSnowball,
      null,
      this
    );

    // 💥 Colisión proyectil del jugador → enemigo
    scene.physics.add.overlap(
      this.playerSnowballs,
      this.snowmanSmall,
      this.hitSnowman,
      null,
      this
    );

    scene.physics.add.overlap(
      this.playerSnowballs,
      this.snowmanBig,
      this.hitSnowman,
      null,
      this
    );

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

    this.playerSnowballs.children.iterate((b) => b?.stop && b.stop());
    this.enemySnowballs.children.iterate((b) => b?.stop && b.stop());

    if (this.releaseTimerSmall) this.releaseTimerSmall.remove();
    if (this.releaseTimerBig) this.releaseTimerBig.remove();
  }

  // =========================
  // Colisiones
  // =========================
  hitSnowball(ball1, ball2) {
    if (!ball1?.active || !ball2?.active) return;
    ball1.stop();
    ball2.stop();
  }

  hitSnowman(projectile, enemy) {
    if (!enemy?.isAlive || !projectile?.active) return;

    projectile.stop();
    enemy.hit();

    const particles = this.scene.add.particles('snow');
    particles.createEmitter({
      x: enemy.x,
      y: enemy.y - 30,
      speed: { min: -150, max: 150 },
      scale: { start: 0.6, end: 0 },
      lifespan: 400,
      quantity: 8
    });
    this.scene.time.delayedCall(300, () => particles.destroy());
  }

  // =========================
  // Disparos
  // =========================
  throwPlayerSnowball(x) {
    let snowball = this.playerSnowballs.getFirstDead();
    if (!snowball) {
      snowball = new PlayerShoot(this.scene, x, this.y, 'projectile');
      this.playerSnowballs.add(snowball);
    }

    // 🔹 Asegura grupo global del Scene
    if (!this.scene.playerProjectiles) {
      this.scene.playerProjectiles = this.scene.physics.add.group({
        runChildUpdate: true,
        allowGravity: false
      });
    }

    if (!this.scene.playerProjectiles.contains(snowball)) {
      this.scene.playerProjectiles.add(snowball);
    }

    // 🔹 Activar proyectil
    snowball.body.enable = true;
    snowball.setActive(true).setVisible(true);
    snowball.fire(x, this.y);
  }

  throwEnemySnowball(x) {
    let snowball = this.enemySnowballs.getFirstDead();
    if (!snowball) {
      snowball = new EnemyShoot(this.scene, x, this.y, 'projectile');
      this.enemySnowballs.add(snowball);
    }

    // 🔹 Asegura grupo global del Scene
    if (!this.scene.enemyProjectiles) {
      this.scene.enemyProjectiles = this.scene.physics.add.group({
        runChildUpdate: true,
        allowGravity: false
      });
    }

    if (!this.scene.enemyProjectiles.contains(snowball)) {
      this.scene.enemyProjectiles.add(snowball);
    }

    snowball.body.enable = true;
    snowball.setActive(true).setVisible(true);
    snowball.fire(x, this.y);
  }
}
