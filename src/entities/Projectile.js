// Projectile.js
export default class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "projectile");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.setActive(false);
    this.setVisible(false);
  }

  fire(x, y, velocityX = 0) {
    this.body.reset(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setVelocityX(velocityX); // usa negativo para ir derecha→izquierda
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.x < -50 || this.x > this.scene.scale.width + 50) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}
