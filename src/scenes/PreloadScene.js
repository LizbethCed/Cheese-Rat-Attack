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

    // Imágenes de fondo y UI
    this.load.image("background_menu", "assets/images/background_menu.png");
    this.load.image("background", "assets/images/background.png");
    this.load.image("cheese", "assets/images/cheese.png");
    this.load.image("mouse", "assets/images/raton.png");
    this.load.image("btnBlue", "assets/images/button_rectangle_depth_border.svg");
    
    // NUEVAS IMÁGENES NECESARIAS
    this.load.image("overlay", "assets/images/overlay.png"); // Interfaz superior
    this.load.image("controls", "assets/images/elementos/controls.png"); // Panel de controles
    this.load.image("gameover", "assets/images/gameover.png"); // Panel game over
    this.load.image("nest", "assets/images/elementos/nest.png"); // Nido (o usa cheese)
    
    // Proyectiles
    this.load.image("projectile", "assets/images/bala.png");
    this.load.image("snowball2", "assets/images/bala.png"); // Bola jugador
    this.load.image("snowball3", "assets/images/bala2.png"); // Bola enemigo

    // Enemigos
    this.load.image('snowman-small-idle0', 'assets/sprites/small_cat.png');
    this.load.image('snowman-big-throw', 'assets/sprites/big_cat.png');

    // Audio
    this.load.audio("shoot", "assets/audio/shoot.wav");
    this.load.audio("hit", "assets/audio/hit.wav");
    this.load.audio("music", "assets/audio/music.mp3");
    this.load.audio("music_menu", "assets/audio/music_menu.wav");
    this.load.audio("move", "assets/audio/move.wav");
    this.load.audio("gameover", "assets/audio/gameover.wav"); // FALTA ESTE AUDIO
  }

  create() {
    this.scene.start("MenuScene");
  }
}