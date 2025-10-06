// GameScene.js
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

    // Definir rutas
    const trackYs = [140, 290, 450, 650];
    this.tracks = trackYs.map(y => new Track(y));

    const cheeseX = this.scale.width - 80;
    this.cheeseTargets = this.tracks.map(track =>
      this.add.image(cheeseX, track.y, "cheese").setOrigin(0.5).setScale(0.75)
    );

    // Ratón (jugador visual)
    const mouseX = cheeseX - 140;
    const mouseStartTrack = 1;
    this.mouseSprite = this.add.image(mouseX, this.tracks[mouseStartTrack].y, "mouse")
      .setOrigin(0.5)
      .setScale(0.9);

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();
    this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Jugador invisible (gestiona disparos y colisiones)
    this.player = new Player(this, this.tracks);
    this.player.setVisible(false);
    this.player.body.setAllowGravity(false);
    this.player.setPosition(mouseX, this.mouseSprite.y);

    // Grupo de enemigos
    this.enemies = this.add.group({
      classType: Enemy,
      runChildUpdate: true
    });

    // Colisiones: proyectil del jugador vs enemigo
    this.physics.add.overlap(
      this.player.projectiles,
      this.enemies,
      (proj, enemy) => {
        proj.setActive(false).setVisible(false);
        enemy.setActive(false).setVisible(false);
        this.score += 10;
      }
    );

    // Colisiones: proyectil de enemigo vs jugador
    // (nota: si agregas enemigos después, asegúrate de actualizar este overlap)
    this.physics.add.overlap(
      this.enemies.getChildren().flatMap(e => e.projectiles.getChildren()),
      this.player,
      (proj) => {
        proj.setActive(false).setVisible(false);
        this.gameOver();
      }
    );

    // Crear enemigos periódicamente
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        const track = Phaser.Utils.Array.GetRandom(this.tracks);
        const enemy = this.enemies.get();
        if (enemy) enemy.start(track);
      },
      loop: true
    });

    // Puntaje
    this.score = 0;
    this.scoreText = this.add.text(10, 10, "Score: 0", {
      fontSize: "24px",
      fill: "#ffffff"
    });

    // ⛔️ Eliminado: botones de subir/bajar

    // ESC para menú
    this.input.keyboard.once("keydown-ESC", () => {
      this.scene.start("MenuScene");
    });
  }

  update(time, delta) {
    const speed = 300 * (delta / 1000);

    // Movimiento con flechas
    if (this.cursors.up.isDown) {
      this.mouseSprite.y -= speed;
    } else if (this.cursors.down.isDown) {
      this.mouseSprite.y += speed;
    }

    // Limitar dentro del canvas
    this.mouseSprite.y = Phaser.Math.Clamp(
      this.mouseSprite.y,
      this.mouseSprite.height * 0.5,
      this.scale.height - this.mouseSprite.height * 0.5
    );

    // Sincronizar jugador invisible
    this.player.x = this.mouseSprite.x;
    this.player.y = this.mouseSprite.y;

    // Disparo (derecha → izquierda: velocidad X negativa)
    if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
      this.player.shoot(this.player.x - 20, this.player.y, -300);
    }

    this.scoreText.setText("Score: " + this.score);
  }

  // ⛔️ Eliminados:
  // createControlButtons() { ... }
  // snapMouseToY(...) { ... }

  gameOver() {
    this.scene.start("GameOverScene", { score: this.score });
  }
}
