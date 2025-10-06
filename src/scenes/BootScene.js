export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: "BootScene" });
    }

    create() {
        // Si quieres inicializar algo global (por ejemplo best score)
        this.registry.set('bestScore', 0);
        this.scene.start("PreloadScene");
    }
}