// entities/Projectile.js
export default class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "projectile");
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.body.setAllowGravity(false);
    this.setActive(false);
    this.setVisible(false);
    
    // Ajustar tamaño de colisión
    this.body.setSize(16, 16);
    this.setScale(0.8);
  }

  fire(x, y, velocityX = 0) {
    // Reiniciar posición
    this.body.reset(x, y);
    
    // Activar proyectil
    this.setActive(true);
    this.setVisible(true);
    
    // Establecer velocidad
    this.setVelocityX(velocityX);
    
    // Rotación basada en dirección
    if (velocityX < 0) {
      this.setAngle(180); // Izquierda
    } else {
      this.setAngle(0); // Derecha
    }
    
    // Efecto de rotación durante el vuelo
    this.scene.tweens.add({
      targets: this,
      angle: this.angle + (velocityX < 0 ? -360 : 360),
      duration: 1000,
      ease: "Linear",
      repeat: -1
    });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    
    // Desactivar si sale de pantalla
    if (this.x < -50 || this.x > this.scene.scale.width + 50) {
      this.deactivate();
    }
  }

  deactivate() {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocityX(0);
    this.setAngle(0);
    
    // Detener todas las animaciones en este proyectil
    this.scene.tweens.killTweensOf(this);
  }
}