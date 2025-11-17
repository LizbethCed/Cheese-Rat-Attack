export default class CreditsScene extends Phaser.Scene {
    constructor() {
    super({ key: "CreditsScene" });
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.add.text(centerX, 100, "CRÉDITOS", {
      fontSize: "54px",
      fill: "#ffffff",
      fontFamily: "CartoonFont",
      stroke: "#000000",
      strokeThickness: 6
    }).setOrigin(0.5);

    const credits = [
      "Desarrollado con Phaser 3",
      "",
      "Inspirado en Snowmen Attack",
      "",
      "Programación:",
      "Nova Games Studio",
      "",
      "Gráficos:",
      "Recursos Propios",
      "",
      "Audio:",
      "Efectos de Sonido Gratuitos",
      "",
      "¡Gracias por jugar!"
    ];

    credits.forEach((line, index) => {
      this.add.text(centerX, 200 + index * 30, line, {
        fontSize: line === "" ? "20px" : "24px",
        fill: "#ffffff",
        fontFamily: "CartoonFont",
        align: "center"
      }).setOrigin(0.5);
    });

    // Botón volver
    const btnBack = this.add.text(centerX, 650, "VOLVER", {
      fontSize: "42px",
      fill: "#00aaff",
      fontFamily: "CartoonFont",
      stroke: "#000000",
      strokeThickness: 4
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    btnBack.on("pointerover", () => btnBack.setTint(0xaaddff));
    btnBack.on("pointerout", () => btnBack.clearTint());
    btnBack.on("pointerdown", () => {
      this.sound.play("click");
      this.scene.start("MenuScene");
    });

    // ESC para volver
    this.input.keyboard.once("keydown-ESC", () => {
      this.scene.start("MenuScene");
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

    this.input.keyboard.on('keycombomatch', (comboName, event) => {
      // Detener la música de fondo del menú
      this.sound.stopByKey('music_menu');

      // Reproducir la música del easter egg desde el segundo 2
      const music = this.sound.add('easter_egg', { volume: 0.8 });
      music.play({ seek: 2 });

      const image = this.add.image(centerX, centerY - 50, 'easter_egg')
        .setOrigin(0.5)
        .setScale(0.4) // Ajusta la escala si es necesario
        .setAlpha(1);

      const secretText = "Orden 66 activada.\n¡Que la fuerza te acompañe!";
      const text = this.add.text(centerX, centerY + 250, secretText, {
        fontSize: "36px",
        fill: "#db0000ff",
        fontFamily: "CartoonFont",
        stroke: "#ffffff",
        strokeThickness: 6,
        align: "center"
      }).setOrigin(0.5);

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

          // Volver a poner la música del menú
          let menuMusic = this.sound.get('music_menu');
          if (!menuMusic) {
            menuMusic = this.sound.add('music_menu', { loop: true, volume: 0.5 });
          }
          if (menuMusic && !menuMusic.isPlaying) {
            menuMusic.play();
          }
        }
      });

      // Tween para desvanecer la música
      this.tweens.add({
        targets: music,
        volume: 0,
        duration: 1000, // Misma duración que el desvanecimiento visual
        delay: 3000,   // Mismo retraso
        ease: 'Power2'
      });
    });
  }
}
