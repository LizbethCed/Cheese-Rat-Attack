// ============================================
// EnemyShoot.js - Proyectiles de los ENEMIGOS
// Van hacia la DERECHA (hacia el jugador)
// ============================================

export class EnemyShoot extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, frame) {
        super(scene, x, y, key, frame);
        this.setScale(0.5);
    }

    fire(x, y) {
        this.body.enable = true;
        
        this.setActive(true);
        this.setVisible(true);
        this.body.updateFromGameObject();

        // Posición inicial desde el ENEMIGO (un poco a la derecha)
        this.body.reset(x + 40, y - 44);

        this.setActive(true);
        this.setVisible(true);

        // 🔹 Movimiento hacia la DERECHA (positivo)
        this.setVelocityX(500);
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

        // Si llega al jugador (lado derecho), activar Game Over
        if (this.x >= 950) {
            this.stop();
            
            if (this.scene && this.scene.gameOver && this.scene.isGameRunning) {
                this.scene.gameOver();
            }
        }
    }
}

export default EnemyShoot;
