import Enemy from '../entities/Enemy.js';
import PlayerShoot from '../entities/PlayerShoot.js';
import EnemyShoot from '../entities/EnemyShoot.js';

export default class Track {
    constructor(scene, id, trackY) {
        this.scene = scene;
        this.id = id;
        this.y = trackY;

        // Nido en la derecha (donde está el jugador)
        this.nest = scene.physics.add.image(1024, trackY - 10, 'nest')
        .setOrigin(1, 1)
        .setScale(0.4);

        // CORREGIDO: Crear ENEMIGOS (no players)
        this.snowmanBig = new Enemy(scene, this, 'Big');
        this.snowmanSmall = new Enemy(scene, this, 'Small');

        // Grupos de proyectiles del JUGADOR (van hacia izquierda)
        this.playerSnowballs = scene.physics.add.group({
            frameQuantity: 8,
            key: 'snowball2',
            active: false,
            visible: false,
            classType: PlayerShoot
        });

        // Grupos de proyectiles de ENEMIGOS (van hacia derecha)
        this.enemySnowballs = scene.physics.add.group({
            frameQuantity: 8,
            key: 'snowball3',
            active: false,
            visible: false,
            classType: EnemyShoot
        });

        // Colisión entre proyectiles (se destruyen mutuamente)
        this.snowBallCollider = scene.physics.add.overlap(
            this.playerSnowballs, 
            this.enemySnowballs, 
            this.hitSnowball, 
            null, 
            this
        );

        // Colisión proyectiles del jugador con enemigos
        this.snowmanSmallCollider = scene.physics.add.overlap(
            this.snowmanSmall, 
            this.playerSnowballs, 
            this.hitSnowman, 
            null, 
            this
        );

        this.snowmanBigCollider = scene.physics.add.overlap(
            this.snowmanBig, 
            this.playerSnowballs, 
            this.hitSnowman, 
            null, 
            this
        );

        // Asegurar que los cuerpos de enemigos estén habilitados
        this.snowmanSmall.body.enable = true;
        this.snowmanBig.body.enable = true;


        // Timers para spawn de enemigos
        this.releaseTimerSmall = null;
        this.releaseTimerBig = null;
    }

    start(minDelay, maxDelay) {
        const delay = Phaser.Math.Between(minDelay, maxDelay);

        // Timer para enemigo pequeño
        this.releaseTimerSmall = this.scene.time.addEvent({
            delay: delay,
            callback: () => {
                this.snowmanSmall.start();
            }
        });

        // Timer para enemigo grande (más tarde)
        this.releaseTimerBig = this.scene.time.addEvent({
            delay: delay * 3,
            callback: () => {
                this.snowmanBig.start();
            }
        });
    }

    stop() {
        // Detener enemigos
        this.snowmanSmall.stop();
        this.snowmanBig.stop();

        // Detener proyectiles del jugador
        for (let snowball of this.playerSnowballs.getChildren()) {
            snowball.stop();
        }

        // Detener proyectiles de enemigos
        for (let snowball of this.enemySnowballs.getChildren()) {
            snowball.stop();
        }

        // Remover timers
        if (this.releaseTimerSmall) {
            this.releaseTimerSmall.remove();
        }
        if (this.releaseTimerBig) {
            this.releaseTimerBig.remove();
        }
    }

    // Colisión entre proyectiles
    hitSnowball(ball1, ball2) {
        ball1.stop();
        ball2.stop();
    }

    // Colisión proyectil del jugador con enemigo
    hitSnowman(snowman, ball) {
    if (snowman.isAlive && snowman.x > 0) {
        ball.stop();

        // Llamar al método hit del enemigo
        snowman.hit();

        // Desactivar completamente para evitar más colisiones
        snowman.setActive(false);
        snowman.setVisible(false);
    }
}


    // JUGADOR dispara (desde x=900, va hacia izquierda)
    throwPlayerSnowball(x) {
        let snowball = this.playerSnowballs.getFirstDead(true);
        if (snowball) {
            snowball.fire(x, this.y);
        }
    }

    throwEnemySnowball(x) {
        let snowball = this.enemySnowballs.getFirstDead(true);
        if (snowball) {
            snowball.fire(x, this.y);
        }
    }

}