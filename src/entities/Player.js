import Projectile from "./Projectile.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, tracks) {
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

        this.enableMovement = true;
        this.enableShooting = true;

        this.setFlipX(true);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.enableMovement) {
            if (Phaser.Input.Keyboard.JustDown(this.upKey)) {
                this.currentTrackIndex = Phaser.Math.Wrap(this.currentTrackIndex - 1, 0, this.tracks.length);
                this.y = this.tracks[this.currentTrackIndex].y;
            } else if (Phaser.Input.Keyboard.JustDown(this.downKey)) {
                this.currentTrackIndex = Phaser.Math.Wrap(this.currentTrackIndex + 1, 0, this.tracks.length);
                this.y = this.tracks[this.currentTrackIndex].y;
            }
        }

        if (this.enableShooting && Phaser.Input.Keyboard.JustDown(this.shootKey)) {
            let proj = this.projectiles.get();
            if (proj) {
                const startX = this.x - this.width / 2;
                proj.fire(startX, this.y, -300);
                this.shootSound.play();
            }
        }
    }
}
