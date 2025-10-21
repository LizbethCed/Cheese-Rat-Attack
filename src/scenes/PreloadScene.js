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

    // =========================
    // IMÁGENES DE FONDO / UI
    // =========================
    this.load.image("background_menu", "assets/images/background_menu.png");
    this.load.image("background",      "assets/images/background.png");
    this.load.image("overlay",         "assets/images/overlay.png");
    this.load.image("controls",        "assets/images/elementos/controls.png");
    this.load.image("gameover",        "assets/images/gameover.png");

    // =========================
    // PERSONAJES / ENEMIGOS
    // =========================
    this.load.image("mouse",                 "assets/images/raton.png");
    this.load.image("snowman-small-idle0",   "assets/sprites/small_cat.png");
    this.load.image("snowman-big-throw",     "assets/sprites/big_cat.png");

    // =========================
    // ELEMENTOS / PROPS
    // =========================
    this.load.image("nest", "assets/images/elementos/nest.png");

    // PROYECTILES (el juego usa 'projectile' como key principal)
    this.load.image("projectile", "assets/images/bala.png");
    // (Opcionales/legacy si los usas en algún lado)
    this.load.image("snowball2",  "assets/images/bala.png");   // jugador
    this.load.image("snowball3",  "assets/images/bala2.png");  // enemigo

    // =========================
    // PARTÍCULA PARA MUERTE
    // =========================
    this.load.spritesheet("snow_explosion", "assets/images/particle_snow.png", {
      frameWidth: 128,   // Ajusta según el tamaño real de cada frame
      frameHeight: 128   // La imagen completa es 1024x1024, dividida en 8x8
    });

    this.load.image("particle_snow", "assets/images/particle_snow.png");


    // =========================
    // AUDIO
    // =========================
    this.load.audio("shoot",     "assets/audio/shoot.wav");
    this.load.audio("move",      "assets/audio/move.wav");
    this.load.audio("hit",       "assets/audio/hit.wav");      // impacto
    this.load.audio("pop",       "assets/audio/pop.wav");      // muerte/explosión
    this.load.audio("gameover",  "assets/audio/gameover.wav");
    // (Opcional)
    this.load.audio("music",      "assets/audio/music.mp3");
    this.load.audio("music_menu", "assets/audio/music_menu.wav");

    // Botón (si lo usas en menú/UI)
    this.load.image("btnBlue", "assets/images/button_rectangle_depth_border.svg");
    // Extra (si lo usas en otro lado)
    this.load.image("cheese",  "assets/images/cheese.png");
  }

  create() {
    // ====== Fallbacks por si falta el PNG de la partícula o projectile ======
    if (!this.textures.exists("snow")) {
      const g1 = this.make.graphics({ x: 0, y: 0, add: false });
      g1.fillStyle(0xffffff, 1);
      g1.fillCircle(4, 4, 4);
      g1.generateTexture("snow", 8, 8);
      g1.destroy();
    }

    if (!this.textures.exists("projectile")) {
      const g2 = this.make.graphics({ x: 0, y: 0, add: false });
      g2.fillStyle(0xFFD54F, 1); // amarillo "queso"
      g2.fillRoundedRect(0, 0, 16, 16, 3);
      g2.generateTexture("projectile", 16, 16);
      g2.destroy();
    }
    // =======================================================================

    this.scene.start("MenuScene");
  }
}
