import Snowman from "../entities/Snowman.js";
import PlayerSnowball from "../entities/PlayerSnowball.js";
import EnemySnowball from "../entities/EnemySnowball.js";

export default class Track {
  constructor(scene, id, trackY) {
    this.scene = scene;
    this.id = id;
    this.y = trackY;

    // Base (nido de nieve)
    this.nest = scene.physics.add
      .image(1024, trackY - 10, "sprites", "nest")
      .setOrigin(1, 1);

    // Muñecos de nieve (enemigos grandes y pequeños)
    this.snowmanBig = new Snowman(scene, this, "Big");
    this.snowmanSmall = new Snowman(scene, this, "Small");

    // Bolas del jugador
    this.playerSnowballs = scene.physics.add.group({
      key: "sprites",
      frame: "snowball2",
      classType: PlayerSnowball,
      frameQuantity: 8,
      active: false,
      visible: false,
      runChildUpdate: true
    });

    // Bolas del enemigo
    this.enemySnowballs = scene.physics.add.group({
      key: "sprites",
      frame: "snowball3",
      classType: EnemySnowball,
      frameQuantity: 8,
      active: false,
      visible: false,
      runChildUpdate: true
    });

    // Colisiones entre bolas y muñecos
    scene.physics.add.overlap(
      this.playerSnowballs,
      this.enemySnowballs,
      this.hitSnowball,
      null,
      this
    );
    scene.physics.add.overlap(
      this.snowmanSmall,
      this.playerSnowballs,
      this.hitSnowman,
      null,
      this
    );
    scene.physics.add.overlap(
      this.snowmanBig,
      this.playerSnowballs,
      this.hitSnowman,
      null,
      this
    );

    // Timers de lanzamiento
    this.releaseTimerSmall = null;
    this.releaseTimerBig = null;
  }

  // 🔹 Iniciar los enemigos en este track
  start(minDelay, maxDelay) {
    const delay = Phaser.Math.Between(minDelay, maxDelay);

    this.releaseTimerSmall = this.scene.time.addEvent({
      delay,
      callback: () => {
        if (this.snowmanSmall) this.snowmanSmall.start();
      },
      loop: false
    });

    this.releaseTimerBig = this.scene.time.addEvent({
      delay: delay * 3,
      callback: () => {
        if (this.snowmanBig) this.snowmanBig.start();
      },
      loop: false
    });
  }

  // 🔹 Detener enemigos y bolas
  stop() {
    this.snowmanSmall?.stop();
    this.snowmanBig?.stop();

    for (const ball of this.playerSnowballs.getChildren()) ball.stop?.();
    for (const ball of this.enemySnowballs.getChildren()) ball.stop?.();

    this.releaseTimerSmall?.remove(false);
    this.releaseTimerBig?.remove(false);
  }

  // 🔹 Colisión bola contra bola
  hitSnowball(ball1, ball2) {
    ball1.stop?.();
    ball2.stop?.();
  }

  // 🔹 Colisión bola contra muñeco
  hitSnowman(snowman, ball) {
    if (snowman.isAlive && snowman.x > 0) {
      ball.stop?.();
      snowman.hit?.();
    }
  }

  // 🔹 Disparo del jugador
  throwPlayerSnowball(x) {
    const snowball = this.playerSnowballs.getFirstDead(false);
    if (snowball) snowball.fire(x, this.y);
  }

  // 🔹 Disparo del enemigo
  throwEnemySnowball(x) {
    const snowball = this.enemySnowballs.getFirstDead(false);
    if (snowball) snowball.fire(x, this.y);
  }
}
