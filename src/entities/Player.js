// Este es el DEFENSOR que controla el jugador
export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, track) {
        // Posición fija en x=900 (derecha)
        super(scene, 900, track.y, 'mouse'); // Usar sprite del ratón/defensor

        this.setOrigin(0.5, 1);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // ⭐ AJUSTAR TAMAÑO DEL JUGADOR si es necesario
        this.setScale(0.8); // 40% del tamaño original - ajusta según necesites
        
        // Ajustar hitbox proporcionalmente
        this.body.setSize(40, 60);
        this.body.setOffset(10, 5);

        this.isAlive = true;
        this.isThrowing = false;

        this.scene = scene;
        this.sound = scene.sound;
        this.currentTrack = track;

        // Teclas de control
        this.spacebar = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.up = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.down = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    }

    start() {
        this.isAlive = true;
        this.isThrowing = false;
        
        this.currentTrack = this.scene.tracks[0];
        this.y = this.currentTrack.y;
    }

    moveUp() {
        if (this.currentTrack.id === 0) {
            this.currentTrack = this.scene.tracks[3];
        } else {
            this.currentTrack = this.scene.tracks[this.currentTrack.id - 1];
        }
        
        this.y = this.currentTrack.y;
        
        if (this.sound.get('move')) {
            this.sound.play('move');
        }
    }

    moveDown() {
        if (this.currentTrack.id === 3) {
            this.currentTrack = this.scene.tracks[0];
        } else {
            this.currentTrack = this.scene.tracks[this.currentTrack.id + 1];
        }
        
        this.y = this.currentTrack.y;
        
        if (this.sound.get('move')) {
            this.sound.play('move');
        }
    }

    throw() {
        if (this.isThrowing) return;
        
        this.isThrowing = true;
        
       // Reproduce el sonido de disparo de forma directa
        this.scene.sound.play('shoot');

        this.scene.time.delayedCall(200, () => {
            this.releaseSnowball();
        });
    }

    releaseSnowball() {
        this.currentTrack.throwPlayerSnowball(this.x);

        this.scene.time.delayedCall(150, () => {
            this.throwComplete();
        });
    }

    throwComplete() {
        this.isThrowing = false;
    }

    stop() {
        this.isAlive = false;
        this.body.stop();
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (!this.isAlive) {
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.up)) {
            this.moveUp();
        } else if (Phaser.Input.Keyboard.JustDown(this.down)) {
            this.moveDown();
        } else if (Phaser.Input.Keyboard.JustDown(this.spacebar) && !this.isThrowing) {
            this.throw();
        }
    }
}