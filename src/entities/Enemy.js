// Este es el ENEMIGO que ataca (gatos)
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, track, size) {
        // Determinar imagen según el tamaño
        const textureKey = (size === 'Small') ? 'snowman-small-idle0' : 'snowman-big-throw';
        
        // Posición inicial según tamaño (fuera de pantalla izquierda)
        const posX = (size === 'Small') ? 80 : -100;

        super(scene, posX, track.y, textureKey);
        
        this.setOrigin(0.5, 1);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // ⭐ ESCALAR ENEMIGOS - Ajusta estos valores según necesites
        if (size === 'Small') {
            this.setScale(0.5); // 30% del tamaño original
            this.body.setSize(60, 60);  // Hitbox más pequeña
            this.body.setOffset(10, 20);
        } else {
            this.setScale(0.2); // 50% del tamaño original
            this.body.setSize(80, 100);
            this.body.setOffset(30, 30);
        }

        this.scene = scene;
        this.time = scene.time;
        this.sound = scene.sound;

        this.isAlive = true;
        this.isThrowing = false;
        this.size = size;
        this.speed = 50;

        // 0 = walk, 1 = idle, 2 = throw
        this.previousAction = 0;
        this.currentTrack = track;
    }

    start() {
        this.isAlive = true;
        this.isThrowing = false;
        this.previousAction = 0;

        this.y = this.currentTrack.y;
        
        // Resetear posición según tamaño
        this.x = (this.size === 'Small') ? 80 : -100;
        
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;

        // Velocidad hacia la DERECHA (positiva)
        this.setVelocityX(this.speed);

        // Timer para elegir siguiente acción
        this.chooseEvent = this.time.delayedCall(
            Phaser.Math.Between(3000, 6000),
            this.chooseAction,
            [],
            this
        );
    }

    chooseAction() {
        // Reactivar en caso de haber sido deshabilitado por un hit
        this.isAlive = true;
        this.body.enable = true;

        this.setVelocityX(0);

        const t = Phaser.Math.Between(0, 100);

        if (t < 50) {
            if (this.previousAction === 2) {
                this.walk();
            } else {
                this.throw();
            }
        } else if (t > 60) {
            this.walk();
        } else {
            if (this.previousAction === 1) {
                if (t > 55) {
                    this.walk();
                } else {
                    this.throw();
                }
            } else {
                this.goIdle();
            }
        }
    }

    walk() {
        this.previousAction = 0;
        this.setVelocityX(this.speed);

        this.chooseEvent = this.time.delayedCall(
            Phaser.Math.Between(3000, 6000),
            this.chooseAction,
            [],
            this
        );
    }

    goIdle() {
        this.previousAction = 1;

        this.chooseEvent = this.time.delayedCall(
            Phaser.Math.Between(2000, 4000),
            this.chooseAction,
            [],
            this
        );
    }

    throw() {
        this.previousAction = 2;
        this.isThrowing = true;

        this.scene.time.delayedCall(200, () => {
            this.releaseSnowball();
        });
    }

    releaseSnowball() {
        if (!this.isAlive) {
            return;
        }
        
        this.currentTrack.throwEnemySnowball(this.x);

        this.scene.time.delayedCall(200, () => {
            this.throwComplete();
        });
    }

    throwComplete() {
        if (!this.isAlive) {
            return;
        }
        
        this.isThrowing = false;
        
        this.chooseEvent = this.time.delayedCall(
            Phaser.Math.Between(2000, 4000),
            this.chooseAction,
            [],
            this
        );
    }

    hit() {
        if (this.chooseEvent) {
            this.chooseEvent.remove();
        }
        
        this.isAlive = false;
        this.previousAction = -1;

        if (this.sound.get('hit')) {
            this.sound.play('hit');
        }

        this.body.stop();
        this.body.enable = false;

        // Knockback al ser golpeado
        const knockback = this.x - Phaser.Math.Between(100, 200);
        
        this.scene.tweens.add({
            targets: this,
            x: knockback,
            ease: 'sine.out',
            duration: 1000,
            onComplete: () => {
                if (this.x < -100) {
                    this.x = -100;
                }
            }
        });

        // Después de un tiempo, puede reaparecer
        this.chooseEvent = this.time.delayedCall(
            Phaser.Math.Between(1000, 3000),
            this.chooseAction,
            [],
            this
        );
    }

    stop() {
        if (this.chooseEvent) {
            this.chooseEvent.remove();
        }
        
        this.isAlive = false;
        this.setVelocityX(0);
        this.setActive(false);
        this.setVisible(false);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Game over si el enemigo llega a x=880
        if (this.x >= 880) {
            this.stop();
            
            if (this.scene.gameOver) {
                this.scene.gameOver();
            }
        }
    }
}