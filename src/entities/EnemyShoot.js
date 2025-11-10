// ============================================
// EnemyShoot.js - Proyectiles de los ENEMIGOS
// Van hacia la DERECHA (hacia el jugador)
// ============================================

export default class EnemyShoot extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, frame) {
        super(scene, x, y, key, frame); // Llama al constructor de la clase padre

        // ✅ Añadir el objeto a la escena y al sistema de físicas
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configuraciones iniciales
        // ✅ Aquí puedes cambiar el tamaño del proyectil del enemigo.
        this.setScale(0.2); // Antes era 0.5, ahora será un 70% del tamaño original.
        this.body.setSize(650, 100);  // Tamaño en píxeles del sprite original
        this.body.setAllowGravity(false);
    }

    fire(x, y, speed = 500) {

if (x < 0 || x > this.scene.scale.width) {
       this.stop();
       return;
   }

        this.body.enable = true;
        
        this.setActive(true);
        this.setVisible(true);

        // Posición inicial desde el ENEMIGO: A la derecha, pero en la MISMA ALTURA Y del carril.
        this.body.reset(x + 40, y - 44);

        this.setActive(true);
        this.setVisible(true);

        // 🔹 Movimiento hacia la DERECHA (positivo)
        this.setVelocityX(speed);
        this.setAccelerationX(800);
    }

    stop() {
        this.setActive(false);
        this.setVisible(false);
        this.setVelocityX(0);
        this.setAccelerationX(0);
        this.body.enable = false;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Si el proyectil sale de la pantalla por la derecha, se desactiva
        if (this.x > this.scene.scale.width + 50) {
            this.stop();
        }
    }
}
