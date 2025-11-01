export default class OptionsScene extends Phaser.Scene {
  constructor() {
    super({ key: "OptionsScene" });
  }

  create() {
    const centerX = this.cameras.main.centerX;

    this.add.text(centerX, 100, "OPCIONES", {
      fontSize: "54px",
      fill: "#ffffff",
      fontFamily: "CartoonFont",
      stroke: "#000000",
      strokeThickness: 6
    }).setOrigin(0.5);

    // Volumen
    const volumeLabel = this.add.text(centerX, 250, "Volumen:", {
      fontSize: "32px",
      fill: "#ffffff",
      fontFamily: "CartoonFont"
    }).setOrigin(0.5);

    const volume = this.sound.volume * 100;
    const volumeText = this.add.text(centerX, 300, Math.round(volume) + "%", {
      fontSize: "36px",
      fill: "#ffff00",
      fontFamily: "CartoonFont"
    }).setOrigin(0.5);

    // Botones de volumen
    const btnVolumeDown = this.add.text(centerX - 100, 300, "-", {
      fontSize: "48px",
      fill: "#ff0000",
      fontFamily: "CartoonFont"
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    const btnVolumeUp = this.add.text(centerX + 100, 300, "+", {
      fontSize: "48px",
      fill: "#00ff00",
      fontFamily: "CartoonFont"
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    btnVolumeDown.on("pointerdown", () => {
      this.sound.volume = Math.max(0, this.sound.volume - 0.1);
      volumeText.setText(Math.round(this.sound.volume * 100) + "%");
      this.sound.play("click", { volume: 0.5 });
    });

    btnVolumeUp.on("pointerdown", () => {
      this.sound.volume = Math.min(1, this.sound.volume + 0.1);
      volumeText.setText(Math.round(this.sound.volume * 100) + "%");
      this.sound.play("click", { volume: 0.5 });
    });

    // Botón volver
    const btnBack = this.add.text(centerX, 500, "VOLVER", {
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
  }
}