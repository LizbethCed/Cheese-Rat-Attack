import Projectile from "./Projectile.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, tracks) {
        // se inicia en la primera ruta
        super(scene, 100, tracks[0].y, "player");
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.tracks = tracks;      // arreglo de objetos Track
        this.currentTrackIndex = 0;

        this.projectiles = scene.physics.add.group({
            classType: Projectile,
            runChildUpdate: true
        });

        this.shootSound = scene.sound.add("shoot");

        // Teclas
        this.upKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.shootKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Mover arriba
        if (Phaser.Input.Keyboard.JustDown(this.upKey)) {
            this.currentTrackIndex = Phaser.Math.Wrap(this.currentTrackIndex - 1, 0, this.tracks.length);
            this.y = this.tracks[this.currentTrackIndex].y;
        }
        // Mover abajo
        else if (Phaser.Input.Keyboard.JustDown(this.downKey)) {
            this.currentTrackIndex = Phaser.Math.Wrap(this.currentTrackIndex + 1, 0, this.tracks.length);
            this.y = this.tracks[this.currentTrackIndex].y;
        }

        // Disparar
        if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
            let proj = this.projectiles.get();
            if (proj) {
                proj.fire(this.x + this.width/2, this.y, 300);  // velocidad a derecha
                this.shootSound.play();
            }
        }
    }
}
