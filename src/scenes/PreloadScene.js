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
    // FUENTES PERSONALIZADAS
    // =========================
    this.add.text(0, 0, '', { fontFamily: 'CartoonFont' }).setVisible(false);

    // =========================
    // IMÁGENES DE FONDO / UI
    // =========================
    this.load.image("background_menu", "assets/images/background_menu.png");
    this.load.image("background",      "assets/images/background.png");
    this.load.image("esenario2",       "assets/images/esenario2.png");
    this.load.image("nivel3",          "assets/images/nivel3.jpeg");
    this.load.image("overlay",         "assets/images/overlay.png");
    this.load.image("controls",        "assets/images/elementos/controls.png");
    this.load.image("gameover",        "assets/images/elementos/gameover.png");
    this.load.image("descarga",        "assets/images/elementos/you_win.png");

    // =========================
    // PERSONAJES / ENEMIGOS
    // =========================
    this.load.image("mouse",                 "assets/sprites/player.png");
    this.load.image("snowman-small-idle0",   "assets/sprites/small_cat.png");
    this.load.image("snowman-big-throw",     "assets/sprites/big_cat.png");

    // =========================
    // JEFE FINAL - 6 FRAMES HORIZONTALES
    // Dimensiones: 1280px × 311px
    // Frames: 1280 ÷ 6 = 213.33px por frame
    // =========================
    this.load.spritesheet("final_boss", "assets/sprites/final_boss_spritesheet.png", {
      frameWidth: 213,    // 1280 / 6 ≈ 213px
      frameHeight: 263,   // Altura completa
      margin: 0,
      spacing: 0
    });

    // =========================
    // ELEMENTOS / PROPS
    // =========================
    this.load.image("nest", "assets/images/elementos/nest.png");

    // PROYECTILES
    this.load.image("projectile",       "assets/images/bala.png");
    this.load.image("snowball2",        "assets/images/bala.png");
    this.load.image("projectileEnemy",  "assets/images/balaEnemy.png");

    // =========================
    // PARTÍCULA PARA MUERTE
    // =========================
    this.load.spritesheet("snow_explosion", "assets/images/particle_snow.png", {
      frameWidth: 212,
      frameHeight: 400
    });

    this.load.image("particle_snow", "assets/images/particle_snow.png");

    // =========================
    // AUDIO
    // =========================
    this.load.audio("shoot",       "assets/audio/shoot.mp3");
    this.load.audio("move",        "assets/audio/move.wav");
    this.load.audio("hit",         "assets/audio/hit.wav");
    this.load.audio("enemy_kill",  "assets/audio/enemy_kill.mp3");
    this.load.audio("gameover",    "assets/audio/gameover.wav");
    this.load.audio("victory",         "assets/audio/win.mp3");
   
    // Música
    this.load.audio("music",       "assets/audio/music.mp3");
    this.load.audio("music_menu",  "assets/audio/main_menu.mp3");
    this.load.audio("nivel1",      "assets/audio/nivel1.mp3");
    this.load.audio("nivel2",      "assets/audio/nivel2.mp3");
    this.load.audio("nivel3",      "assets/audio/nivel3.mp3");


    // UI
    this.load.image("btnBlue", "assets/images/button_rectangle_depth_border.svg");
    this.load.image("cheese",  "assets/images/cheese.png");
  }

  create() {
    // ====== Fallbacks ======
    if (!this.textures.exists("snow")) {
      const g1 = this.make.graphics({ x: 0, y: 0, add: false });
      g1.fillStyle(0xffffff, 1);
      g1.fillCircle(4, 4, 4);
      g1.generateTexture("snow", 8, 8);
      g1.destroy();
    }

    if (!this.textures.exists("projectile")) {
      const g2 = this.make.graphics({ x: 0, y: 0, add: false });
      g2.fillStyle(0xFFD54F, 1);
      g2.fillRoundedRect(0, 0, 16, 16, 3);
      g2.generateTexture("projectile", 16, 16);
      g2.destroy();
    }

     this.anims.create({
      key: 'final_boss_idle',
      frames: this.anims.generateFrameNumbers('final_boss', { start: 0, end: 1 }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'final_boss_taunt',
      frames: this.anims.generateFrameNumbers('final_boss', { start: 2, end: 3 }),
      frameRate: 6,
      repeat: 0
    });

    this.anims.create({
      key: 'final_boss_attack',
      frames: this.anims.generateFrameNumbers('final_boss', { start: 4, end: 5 }),
      frameRate: 8,
      repeat: 0
    });

    if (!this.anims.exists('final_boss_taunt')) {
      this.anims.create({
        key: 'final_boss_taunt',
        frames: [{ key: 'final_boss' }],
        frameRate: 1,
        repeat: 0
      });
    }

    this.scene.start("MenuScene");
  }
}
