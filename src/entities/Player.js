// Este es el DEFENSOR que controla el jugador
export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, track) {
        // Posición fija en x=900 (derecha)
        super(scene, 900, track.y, 'mouse');

        this.setOrigin(0.5, 1);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // ⭐ AJUSTAR TAMAÑO DEL JUGADOR
        this.setScale(0.15);
    
        // ✅ Ajustar hitbox al tamaño real del sprite
        this.body.setSize(650, 750);  // Tamaño en píxeles del sprite original
        this.body.setOffset(187, 200); // Centrar en el cuerpo del ratón

    
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
        
        console.log('👤 Player iniciado en track', this.currentTrack.id);
    }

    moveUp() {
        if (this.currentTrack.id === 0) {
            this.currentTrack = this.scene.tracks[3];
        } else {
            this.currentTrack = this.scene.tracks[this.currentTrack.id - 1];
        }
        
        this.y = this.currentTrack.y;
        
        console.log('⬆️ Movido a track', this.currentTrack.id);
        
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
        
        console.log('⬇️ Movido a track', this.currentTrack.id);
        
        if (this.sound.get('move')) {
            this.sound.play('move');
        }
    }

    throw() {
        if (this.isThrowing) {
            console.log('⏳ Ya está disparando, ignorando...');
            return;
        }
        
        console.log('🎯 DISPARO INICIADO en track', this.currentTrack.id);
        
        this.isThrowing = true;
        
        // Reproducir sonido
        if (this.scene.sound.get('shoot')) {
            this.scene.sound.play('shoot');
        }

        this.scene.time.delayedCall(200, () => {
            this.releaseSnowball();
        });
    }

    releaseSnowball() {
        console.log('❄️ Liberando proyectil desde posición', {
            playerX: this.x,
            playerY: this.y,
            trackId: this.currentTrack.id,
            trackY: this.currentTrack.y
        });
        
        // Disparar en el track actual
        this.currentTrack.throwPlayerSnowball(this.x);
        
        this.scene.time.delayedCall(150, () => {
            this.throwComplete();
        });
    }

    throwComplete() {
        this.isThrowing = false;
        console.log('✅ Disparo completado, listo para siguiente');
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