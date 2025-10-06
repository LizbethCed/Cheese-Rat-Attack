import Projectile from "./Projectile.js";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, track) {
        super(scene, scene.scale.width + 50, track.y, "enemy");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.track = track;
        this.speed = -100;

        this.projectiles = scene.physics.add.group({
            classType: Projectile,
            runChildUpdate: true
        });

        this.shootSound = scene.sound.add("shoot");
    }

    start() {
        // poner en la posición de inicio
        this.setActive(true);
        this.setVisible(true);
        this.body.reset(this.scene.scale.width + 50, this.track.y);

        // moverse hacia la izquierda
        this.setVelocityX(this.speed);

        // programar disparo ocasional
        this.shootTimer = this.scene.time.addEvent({
            delay: Phaser.Math.Between(1000, 3000),
            callback: () => {
                this.fireProjectile();
            },
            loop: true
        });
    }

    fireProjectile() {
        let proj = this.projectiles.get();
        if (proj) {
            proj.fire(this.x - this.width/2, this.y, -200);
            this.shootSound.play();
        }
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Si sale de la izquierda, reiniciar / desaparecer
        if (this.x < -50) {
            this.setActive(false);
            this.setVisible(false);
            this.body.stop();
            if (this.shootTimer) this.shootTimer.remove();
        }
    }
}
