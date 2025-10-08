export default class CreditsScene extends Phaser.Scene {
    constructor() {
    super({ key: "CreditsScene" });
  }

  create() {
    const centerX = this.cameras.main.centerX;

    this.add.text(centerX, 100, "CRÉDITOS", {
      fontSize: "54px",
      fill: "#ffffff",
      fontFamily: "Arial",
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
        fontFamily: "Arial",
        align: "center"
      }).setOrigin(0.5);
    });

    // Botón volver
    const btnBack = this.add.text(centerX, 650, "VOLVER", {
      fontSize: "42px",
      fill: "#00aaff",
      fontFamily: "Arial",
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
  }
}
