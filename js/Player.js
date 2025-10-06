import Projectile from "./Projectile.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, tracks) {
    super(scene, 0, 0, "player");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.tracks = tracks;

    // Pool de proyectiles
    this.projectiles = scene.physics.add.group({
      classType: Projectile,
      maxSize: 20,
      runChildUpdate: true
    });

    this.shootSound = scene.sound.add("shoot", { volume: 0.4 });
  }

  shoot(fromX, fromY, velX = 300) {
    const proj = this.projectiles.get();
    if (!proj) return;

    const spawnX = fromX - 20;
    const velocityX = -Math.abs(velX);

    proj.fire(spawnX, fromY, velocityX);
    if (this.shootSound) this.shootSound.play();
  }
}
