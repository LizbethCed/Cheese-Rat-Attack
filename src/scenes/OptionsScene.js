export default class OptionsScene extends Phaser.Scene {
    constructor() {
        super({ key: "OptionsScene" });
    }

    create() {
        this.add.text(400, 200, "⚙️ Opciones", { fontSize: "32px", fill: "#ffffff" }).setOrigin(0.5);

        this.add.text(400, 400, "⬅ Volver", { fontSize: "24px", fill: "#f39c12" })
            .setOrigin(0.5)
            .setInteractive()
            .on("pointerdown", () => this.scene.start("MenuScene"));
    }
}
