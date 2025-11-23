export default class CreditsScene extends Phaser.Scene {
    constructor() {
    super({ key: "CreditsScene" });
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0xF2B90C, 0xF2B90C, 0x1BBFAF, 0x1BBFAF, 1);
    graphics.fillRect(0, 0, width, height);

    this.add.text(centerX, 100, "CRÉDITOS", {
      fontSize: "54px",
      fill: "#F2BC1B",
      fontFamily: "CartoonFont",
      stroke: "#000000",
      strokeThickness: 6
    }).setOrigin(0.5);

    const credits = [
      "Desarrollado con Phaser 3",
      "Inspirado en Snowmen Attack",
      "Programación:",
      "Nova Games Studio",
      "Gráficos:",
      "Recursos Propios",
      "Audio:",
      "Efectos de Sonido Gratuitos",
    ];

    // --- IMAGEN A LA DERECHA ---
    const thankImg = this.add.image(centerX + 250, centerY, "tanks")
      .setOrigin(0.5)
      .setScale(0.7)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });

    // Al hacer hover, pequeña animación
    thankImg.on('pointerover', () => this.tweens.add({ targets: thankImg, scale: 0.55, duration: 120 }));
    thankImg.on('pointerout',  () => this.tweens.add({ targets: thankImg, scale: 0.5, duration: 120 }));

    // --- Contador de clics para el easter egg ---
    let clickCount = 0;
    thankImg.on('pointerdown', () => {
      clickCount++;
      if (clickCount >= 40) {
        this.triggerEasterEgg();
        clickCount = 0; // Reiniciar contador
      }
      // Pequeño efecto visual en cada clic
      this.tweens.add({ targets: thankImg, scale: 0.65, duration: 80, yoyo: true });
    });

    // --- TEXTO A LA IZQUIERDA ---
    credits.forEach((line, index) => {
      this.add.text(110, 200 + index * 40, line, {
        fontSize: "28px",
        fill: "#ffffff",
        fontFamily: "CartoonFont",
      }).setOrigin(0, 0.5);
    });

    // --- BOTÓN DE VOLVER CON ESTILO MEJORADO ---
    const btnBackY = this.sys.game.config.height - 60; // Posicionar en la parte inferior
    const btnBack = this.add.image(centerX, btnBackY, "btnBlue")
      .setDisplaySize(320, 64)
      .setInteractive({ useHandCursor: true });

    const txtBack = this.add.text(centerX, btnBackY, "VOLVER", {
      fontSize: "32px",
      fill: "#203c5b",
      fontFamily: "CartoonFont"
    }).setOrigin(0.5);

    const backAction = () => {
      this.sound.play("click");
      this.scene.start("MenuScene");
    };

    btnBack.on("pointerover", () => btnBack.setTint(0x99ccff));
    btnBack.on("pointerout", () => btnBack.clearTint());
    btnBack.on("pointerdown", backAction);

    txtBack.setInteractive({ useHandCursor: true })
      .on("pointerover", () => btnBack.setTint(0x99ccff))
      .on("pointerout", () => btnBack.clearTint())
      .on("pointerdown", backAction);

    // ESC para volver
    this.input.keyboard.once("keydown-ESC", () => {
      backAction();
    });

    // --- Código Konami ---
    const konamiSequence = [
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
    ];
    this.input.keyboard.createCombo(konamiSequence, { resetOnMatch: true });

    this.input.keyboard.on('keycombomatch', () => {
      this.triggerEasterEgg();
    });
  }

  /**
   * Activa la secuencia del easter egg.
   */
  triggerEasterEgg() {
    // Detener la música de fondo del menú
    this.sound.stopByKey('music_menu');

    // Reproducir la música del easter egg desde el segundo 2
    const music = this.sound.add('easter_egg', { volume: 0.8 });
    music.play({ seek: 2 });

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    const image = this.add.image(centerX, centerY - 50, 'easter_egg')
      .setOrigin(0.5)
      .setScale(0.4)
      .setAlpha(1)
      .setDepth(100);

    const secretText = "Orden 66 activada.\n¡Que la fuerza te acompañe!";
    const text = this.add.text(centerX, centerY + 250, secretText, {
      fontSize: "36px",
      fill: "#db0000ff",
      fontFamily: "CartoonFont",
      stroke: "#ffffff",
      strokeThickness: 6,
      align: "center"
    }).setOrigin(0.5).setDepth(101);

    this.tweens.add({
      targets: [image, text],
      alpha: 0,
      duration: 1000,
      delay: 3000,
      ease: 'Power2',
      onComplete: () => {
        image?.destroy();
        text?.destroy();
        music?.stop();

        let menuMusic = this.sound.get('music_menu');
        if (!menuMusic) {
          menuMusic = this.sound.add('music_menu', { loop: true, volume: 0.5 });
        }
        if (menuMusic && !menuMusic.isPlaying) {
          menuMusic.play();
        }
      }
    });

    this.tweens.add({
      targets: music,
      volume: 0,
      duration: 1000,
      delay: 3000,
      ease: 'Power2'
    });
  }
}
