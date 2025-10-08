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

    this.speed = 80; // velocidad positiva
    this.setVelocityX(-this.speed); // se mueve hacia la izquierda

    this.shootDelay = 2000;
  }

  start(track, enemyProjectilesGroup) {
    this.x = -50;
    this.y = track.y;
    this.track = track;
    this.enemyProjectilesGroup = enemyProjectilesGroup;

    this.setScale(0.80); // 75% del tamaño original
    
    this.setActive(true);
    this.setVisible(true);
    this.isAlive = true;
    this.setVelocityX(this.speed);
  }

 shoot() {
    if (!this.enemyProjectilesGroup) return;
    
    const proj = this.enemyProjectilesGroup.get(); // ✅ Grupo GLOBAL
    
    if (!proj) {
        const newProj = new Projectile(this.scene, 0, 0);
        this.enemyProjectilesGroup.add(newProj);
        newProj.fire(this.x + 20, this.y, 400);
    } else {
        proj.fire(this.x + 20, this.y, 400);
    }

    
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
