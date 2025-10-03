export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: "MenuScene" });
    }

    preload() {
        this.load.image("logo", "assets/images/logo.png");
        this.load.audio("click", "assets/audio/click.mp3");
    }

    create() {
    const centerX = this.cameras.main.centerX;

    this.add.image(centerX, 150, "logo").setScale(0.9);

    // Opciones de menú
    const opciones = [
        { texto: "Jugar", escena: "GameScene" },
        { texto: "Opciones", escena: "OptionsScene" },
        { texto: "Créditos", escena: "CreditsScene" }
    ];

    this.opcionesTexto = [];

    opciones.forEach((op, i) => {
        let txt = this.add.text(centerX, 300 + i * 60, op.texto, {
            fontSize: "32px",
            fill: "#ffffff"
        }).setOrigin(0.5);

        txt.setInteractive({ useHandCursor: true });

        txt.on("pointerover", () => txt.setStyle({ fill: "#f39c12" }));
        txt.on("pointerout", () => txt.setStyle({ fill: "#ffffff" }));
        txt.on("pointerdown", () => {
            this.sound.play("click");
            this.scene.start(op.escena);
        });

        this.opcionesTexto.push(txt);
    });
}
}
