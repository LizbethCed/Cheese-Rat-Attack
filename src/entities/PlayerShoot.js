// ============================================
// PlayerShoot.js - Proyectiles del JUGADOR
// Van hacia la IZQUIERDA (hacia los enemigos)
// ============================================

export default class PlayerShoot extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key = "projectile", frame) {
    super(scene, x, y, key, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.setScale(0.6);
    this.setActive(false);
    this.setVisible(false);

    // Ajusta hitbox
    this.body.setSize(20, 20);
  }

  fire(x, y) {
    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;

    // Posición inicial un poco a la izquierda del ratón
    this.body.reset(x - 40, y - 40);

    // ✅ Movimiento hacia la izquierda
    this.setVelocityX(-600);

    // Efecto giratorio (opcional pero visualmente agradable)
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 300,
      repeat: -1,
      ease: "Linear",
    });
  }

  stop() {
    this.scene.tweens.killTweensOf(this);
    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;
    this.setVelocity(0);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // Si sale de la pantalla, desactivar
    if (this.x < -50) {
      this.stop();
    }
  }
}
