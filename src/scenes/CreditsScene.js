export default class CreditsScene extends Phaser.Scene {
    constructor() {
        super({ key: "CreditsScene" });
    }

    create() {
        this.add.text(400, 200, "👨‍💻 Créditos", { fontSize: "32px", fill: "#ffffff" }).setOrigin(0.5);

        this.add.text(400, 300, "Desarrollado por: NOVA GAMES", { fontSize: "20px", fill: "#f00000ff" }).setOrigin(0.5);

        this.add.text(400, 500, "↩️ Volver", { fontSize: "24px", fill: "#f39c12" })
            .setOrigin(0.5)
            .setInteractive()
            .on("pointerdown", () => this.scene.start("MenuScene"));
    }
}
