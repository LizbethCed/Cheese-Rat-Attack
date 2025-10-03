export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
    }

    create() {
        this.add.text(400, 300, "🎮 ¡El juego inicia aquí!", {
            fontSize: "28px",
            fill: "#F2CF63"
        }).setOrigin(0.5);

        this.input.keyboard.once("keydown-ESC", () => {
            this.scene.start("MenuScene");
        });
    }
}
