export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameOverScene" });
    }

    init(data) {
        this.finalScore = data.score;
    }

    create() {
        const w = this.scale.width, h = this.scale.height;

        this.add.text(w/2, h/2 - 50, "Game Over", {
            fontSize: "48px", fill: "#ff0000"
        }).setOrigin(0.5);

        this.add.text(w/2, h/2, `Tu puntuación: ${this.finalScore}`, {
            fontSize: "24px", fill: "#ffffff"
        }).setOrigin(0.5);

        this.add.text(w/2, h/2 + 80, "Presiona para volver al menú", {
            fontSize: "20px", fill: "#ffff00"
        }).setOrigin(0.5);

        this.input.once("pointerdown", () => {
            this.scene.start("MenuScene");
        });

        this.input.keyboard.once("keydown-SPACE", () => {
            this.scene.start("MenuScene");
        });
    }
}
