export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.add.text(w / 2, h / 2, "Cargando...", {
      fontSize: "32px",
      fill: "#ffffff"
    }).setOrigin(0.5);

    // Imágenes
    this.load.image("background", "assets/images/background.png");
    this.load.image("cheese", "assets/images/cheese.png");
    this.load.image("mouse", "assets/images/raton.png");
    this.load.image("btnBlue", "assets/images/button_rectangle_depth_border.svg");
    this.load.image("projectile", "assets/images/bala.png");

    // Sprites
    this.load.spritesheet("player", "assets/sprites/player.png", {
      frameWidth: 32,
      frameHeight: 48
    });
    this.load.spritesheet("enemy", "assets/sprites/enemy.png", {
      frameWidth: 32,
      frameHeight: 48
    });

    // Audio
    this.load.audio("shoot", "assets/audio/shoot.wav");
    this.load.audio("hit", "assets/audio/hit.wav");
    this.load.audio("music", "assets/audio/music.mp3");
  }

  create() {
    this.scene.start("MenuScene");
  }
}
