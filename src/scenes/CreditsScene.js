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
      const secretText = "15082025 - NOVA GAMES STUDIO";
      const text = this.add.text(centerX, centerY + 250, secretText, {
        fontSize: "36px",
        fill: "#ff00ff",
        fontFamily: "CartoonFont",
        stroke: "#ffffff",
        strokeThickness: 6,
        align: "center"
      }).setOrigin(0.5);

      this.tweens.add({
        targets: text,
        alpha: 0,
        duration: 1000,
        delay: 3000,
        ease: 'Power2'
      });
    });
  }
}
