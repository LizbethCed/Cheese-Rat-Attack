// ============================================
// PlayerShoot.js - Proyectiles del JUGADOR
// Van hacia la IZQUIERDA (hacia los enemigos)
// ============================================

export class PlayerShoot extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, frame) {
        super(scene, x, y, key, frame);
        this.setScale(0.5);
    }

    fire(x, y) {
        this.body.enable = true;
        this.setActive(true);
        this.setVisible(true);
        this.body.updateFromGameObject();

        
        // Posición inicial ligeramente a la izquierda del jugador
        this.body.reset(x - 40, y - 44);

        this.setActive(true);
        this.setVisible(true);

        // 🔹 Movimiento hacia la IZQUIERDA
        this.setVelocityX(-600);
        this.setAccelerationX(-1400);

        
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

        // Destruir cuando sale por la IZQUIERDA
        if (this.x <= 0) {
            this.stop();
        }
    }
}

export default PlayerShoot;
