// ============================================
// PlayerShoot.js - Proyectiles del JUGADOR
// Van hacia la IZQUIERDA (hacia los enemigos)
// ============================================

export default class PlayerShoot extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key = "projectile", frame) {
    super(scene, x, y, key, frame); // Se crea en la posición del carril (ej: 196)

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.setScale(0.6);
    this.setActive(false);
    this.setVisible(false);

    // Ajusta el tamaño de la hitbox (puedes modificar según tu sprite)
    this.body.setSize(80, 80);
    this.body.setOffset(0, 0);


    // Activar debug visual (opcional)
    // scene.physics.world.createDebugGraphic();
  }

  fire(x, y) {
    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;

    //Efecto de sonido al disparar (asegúrate de tener el sonido cargado)

    this.scene.sound.play('shoot', { volume: 0.5 });

    // ✅ Posición inicial: A la izquierda del jugador, pero en la MISMA ALTURA Y del carril.
    this.body.reset(x - 10, y - 40);

    // ✅ Movimiento hacia la izquierda
    this.setVelocityX(-600);

    // Efecto giratorio opcional (añade dinamismo al disparo)
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 300,
      repeat: -1,
      ease: "Linear",
    });

    // Log para depuración
    // console.log("💥 Disparo lanzado desde:", x, y);
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

    // Si el proyectil sale de la pantalla por la izquierda, se desactiva
    if (this.x < -50) {
      this.stop();
      //console.log("🧊 Disparo eliminado (fuera de pantalla)");
    }
  }
}
