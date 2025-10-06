export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: "PreloadScene" });
    }

    preload() {
        // Mostrar “cargando…”
        const w = this.scale.width;
        const h = this.scale.height;
        this.add.text(w/2, h/2, "Cargando...", {
            fontSize: "32px",
            fill: "#ffffff"
        }).setOrigin(0.5);

        // Carga tus recursos aquí:
        // imágenes / atlas / sprites / audio
        // Ejemplo:
        this.load.image("background", "assets/images/background.png");
        this.load.spritesheet("player", "assets/sprites/player.png", {
            frameWidth: 32, frameHeight: 48
        });
        this.load.spritesheet("enemy", "assets/sprites/enemy.png", {
            frameWidth: 32, frameHeight: 48
        });
        this.load.image("projectile", "assets/images/projectile.png");
        this.load.audio("shoot", "assets/audio/shoot.wav");
        this.load.audio("hit", "assets/audio/hit.wav");
        this.load.audio("music", "assets/audio/music.mp3");

        this.load.image("btnBlue", "assets/images/button_rectangle_depth_border.svg");
    }

    create() {
        // Después de cargar, pasar al menú
        this.scene.start("MenuScene");
    }
}
