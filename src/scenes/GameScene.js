import Track from "../util/Track.js";
import Player from "../entities/Player.js";
import Enemy from "../entities/Enemy.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
    }

    create() {
        // Fondo
        this.add.image(0, 0, "background").setOrigin(0);

        // Definir rutas (coordenadas Y)
        const trackYs = [150, 250, 350, 450];
        this.tracks = trackYs.map(y => new Track(y));

        // Crear jugador
        this.player = new Player(this, this.tracks);

        // Grupo de enemigos
        this.enemies = this.add.group({
            classType: Enemy,
            runChildUpdate: true
        });

        // Colisiones entre proyectiles del jugador y enemigos
        this.physics.add.overlap(
            this.player.projectiles,
            this.enemies,
            (proj, enemy) => {
                proj.setActive(false).setVisible(false);
                enemy.setActive(false).setVisible(false);
                // puedes sumar puntaje, reproducir sonido de golpe, etc.
            }
        );

        // Colisiones entre proyectiles de enemigos y jugador
        this.physics.add.overlap(
            this.enemies.getChildren().flatMap(e => e.projectiles.getChildren()),
            this.player,
            (proj, playerSprite) => {
                proj.setActive(false).setVisible(false);
                // termina el juego
                this.gameOver();
            }
        );

        // Crear enemigos periódicamente
        this.time.addEvent({
            delay: 2000,  // cada 2 segundos
            callback: () => {
                let track = Phaser.Utils.Array.GetRandom(this.tracks);
                let enemy = this.enemies.get();
                if (enemy) {
                    enemy.start();
                }
            },
            loop: true
        });

        // Puntaje
        this.score = 0;
        this.scoreText = this.add.text(10, 10, "Score: 0", { fontSize: "24px", fill: "#ffffff" });

        
        this.input.keyboard.once("keydown-ESC", () => {
            this.scene.start("MenuScene");
        });
    }

    update(time, delta) {
        // actualizar puntaje
        this.scoreText.setText("Score: " + this.score);
    }

    gameOver() {
        this.scene.start("GameOverScene", { score: this.score });
    }
}
