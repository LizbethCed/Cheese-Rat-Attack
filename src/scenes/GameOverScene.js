// scenes/GameOverScene.js
export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  init(data) {
    this.finalScore = data.score || 0;
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Fondo semi-transparente
    const bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7);
    bg.setOrigin(0);

    // Título
    this.add.text(centerX, centerY - 150, "GAME OVER", {
      fontSize: "72px",
      fill: "#ff0000",
      fontFamily: "Arial",
      stroke: "#000000",
      strokeThickness: 8
    }).setOrigin(0.5);

    // Puntaje
    this.add.text(centerX, centerY - 50, "Tu puntaje: " + this.finalScore, {
      fontSize: "42px",
      fill: "#ffffff",
      fontFamily: "Arial",
      stroke: "#000000",
      strokeThickness: 4
    }).setOrigin(0.5);

    // Mejor puntaje
    const bestScore = this.registry.get('bestScore') || 0;
    this.add.text(centerX, centerY + 20, "Mejor puntaje: " + bestScore, {
      fontSize: "36px",
      fill: "#ffff00",
      fontFamily: "Arial",
      stroke: "#000000",
      strokeThickness: 4
    }).setOrigin(0.5);

    // Botón Reintentar
    const btnRetry = this.add.text(centerX, centerY + 100, "REINTENTAR", {
      fontSize: "38px",
      fill: "#00ff00",
      fontFamily: "Arial",
      stroke: "#000000",
      strokeThickness: 4
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    btnRetry.on("pointerover", () => btnRetry.setTint(0xaaffaa));
    btnRetry.on("pointerout", () => btnRetry.clearTint());
    btnRetry.on("pointerdown", () => {
      this.scene.start("GameScene");
    });

    // Botón Menú
    const btnMenu = this.add.text(centerX, centerY + 160, "MENÚ PRINCIPAL", {
      fontSize: "32px",
      fill: "#00aaff",
      fontFamily: "Arial",
      stroke: "#000000",
      strokeThickness: 4
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    btnMenu.on("pointerover", () => btnMenu.setTint(0xaaddff));
    btnMenu.on("pointerout", () => btnMenu.clearTint());
    btnMenu.on("pointerdown", () => {
      this.scene.start("MenuScene");
    });

    // Teclas
    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("GameScene");
    });

    this.input.keyboard.once("keydown-ESC", () => {
      this.scene.start("MenuScene");
    });
  }
}