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

    // Logo
    this.add.image(centerX, 150, "logo").setScale(0.9);

    // Opciones de menú
    const opciones = [
        { texto: "Jugar", escena: "GameScene" },
        { texto: "Opciones", escena: "OptionsScene" },
        { texto: "Créditos", escena: "CreditsScene" }
    ];

    const btnWidth = 320;
    const btnHeight = 64;
    const btnSpacing = 80;
    const startY = 320;

    opciones.forEach((op, i) => {
        // Botón
        const btn = this.add.image(centerX, startY + i * btnSpacing, "btnBlue")
            .setDisplaySize(btnWidth, btnHeight)
            .setInteractive({ useHandCursor: true });

        // Texto sobre el botón
        const txt = this.add.text(centerX, startY + i * btnSpacing, op.texto, {
            fontSize: "32px",
            fill: "#203c5b",
            fontFamily: "Arial"
        }).setOrigin(0.5);

        // Interactividad
        btn.on("pointerover", () => btn.setTint(0x99ccff));
        btn.on("pointerout", () => btn.clearTint());
        btn.on("pointerdown", () => {
            this.sound.play("click");
            this.scene.start(op.escena);
        });

        // También puedes hacer el texto interactivo si lo prefieres:
        txt.setInteractive({ useHandCursor: true });
        txt.on("pointerover", () => btn.setTint(0x99ccff));
        txt.on("pointerout", () => btn.clearTint());
        txt.on("pointerdown", () => {
            this.sound.play("click");
            this.scene.start(op.escena);
        });
    });
    }
}
