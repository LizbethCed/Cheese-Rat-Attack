import Projectile from "./Projectile.js";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "enemy");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(false);

    this.projectiles = scene.physics.add.group({
      classType: Projectile,
      maxSize: 10,
      runChildUpdate: true
    });

    this.speed = -80;
    this.shootDelay = 2000;
  }

  start(track) {
    this.x = this.scene.scale.width + 50;
    this.y = track.y;
    this.setActive(true).setVisible(true);
    this.setVelocityX(-this.speed);

    this.scene.time.addEvent({
      delay: this.shootDelay,
      callback: () => {
        if (this.active) this.shoot();
      },
      callbackScope: this,
      loop: true
    });
  }

  shoot() {
    const proj = this.projectiles.get();
    if (proj) proj.fire(this.x - 20, this.y, -300);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.x < -50) {
      this.setActive(false);
      this.setVisible(false);
      this.setVelocityX(0);
    }
  }
}
