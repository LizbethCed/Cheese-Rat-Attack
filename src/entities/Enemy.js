// Este es el ENEMIGO que ataca (gatos)
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, track, size) {
    // Determinar imagen según el tamaño
    const textureKey =
      size === "Small" ? "snowman-small-idle0" : "snowman-big-throw";

    // Posición inicial según tamaño (fuera de pantalla izquierda)
    const posX = size === "Small" ? 80 : -100;

    super(scene, posX, track.y, textureKey);

    this.setOrigin(0.5, 1);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.time = scene.time;
    this.sound = scene.sound;

    this.isAlive = true;
    this.isThrowing = false;
    this.size = size;
    this.speed = 50;

    // 0 = walk, 1 = idle, 2 = throw
    this.previousAction = 0;
    this.currentTrack = track;

    // ✅ Usar un callback para configurar el cuerpo de físicas de forma segura
    this.scene.time.delayedCall(0, () => {
      if (this.body) {
        if (size === "Small") {
          this.setScale(0.15);
          // ✅ Hitbox centrada: usar dimensiones del sprite escalado
          this.body.setSize(900, 900);
          this.body.setOffset(0, 10);
        } else {
          this.setScale(0.18);
          // ✅ Para enemigos grandes (0.2 escala = muy pequeños)
          this.body.setSize(980, 980);
          this.body.setOffset(90, 10);
        }
      }
    });
  }

  start() {
    console.log(`🐱 Enemigo ${this.size} INICIANDO en track ${this.currentTrack.id}`);

    this.isAlive = true;
    this.isThrowing = false;
    this.previousAction = 0;

    // Limpiar cualquier estado anterior
    this.alpha = 1;

    this.setActive(true);
    this.setVisible(true);

    if (this.body) {
      this.body.enable = true;


      const startX = this.size === "Small" ? 80 : -100;
      this.body.reset(startX, this.currentTrack.y);

      console.log(`🔄 Enemigo ${this.size} REINICIADO en ${startX}, ${this.currentTrack.y}`);

      // Forzar la reactivación en el grupo de físicas
      if (this.scene.allEnemies) {
        this.scene.allEnemies.world.enable(this);
      }

      this.body.setAllowGravity(false);

      // Debug visual temporal
      this.body.debugShowBody = true;
      this.body.debugBodyColor = 0xff0000;

      console.log(`✅ Enemigo ${this.size} body habilitado`, {
        x: this.x,
        y: this.y,
        bodyEnabled: this.body.enable,
        active: this.active,
        visible: this.visible
      });
    } else {
      console.error(`❌ ERROR: Enemigo ${this.size} no tiene body`);
    }

    // Velocidad hacia la DERECHA (positiva)
    this.setVelocityX(this.speed);

    // Timer para elegir siguiente acción
    this.chooseEvent = this.time.delayedCall(
      Phaser.Math.Between(3000, 6000),
      this.chooseAction,
      [],
      this
    );
  }

  chooseAction() {
    if (!this.isAlive) return;

    this.isAlive = true;
    this.body.enable = true;
    this.setVelocityX(0);

    const t = Phaser.Math.Between(0, 100);

    if (t < 50) {
      if (this.previousAction === 2) {
        this.walk();
      } else {
        this.throw();
      }
    } else if (t > 60) {
      this.walk();
    } else {
      if (this.previousAction === 1) {
        if (t > 55) {
          this.walk();
        } else {
          this.throw();
        }
      } else {
        this.goIdle();
      }
    }
  }

  walk() {
    this.previousAction = 0;
    this.setVelocityX(this.speed);

    this.chooseEvent = this.time.delayedCall(
      Phaser.Math.Between(3000, 6000),
      this.chooseAction,
      [],
      this
    );
  }

  goIdle() {
    this.previousAction = 1;

    this.chooseEvent = this.time.delayedCall(
      Phaser.Math.Between(2000, 4000),
      this.chooseAction,
      [],
      this
    );
  }

  throw() {
    this.previousAction = 2;
    this.isThrowing = true;

    this.scene.time.delayedCall(200, () => {
      this.releaseSnowball();
    });
  }

  releaseSnowball() {
    if (!this.isAlive) return;

    this.currentTrack.throwEnemySnowball(this.x);

    this.scene.time.delayedCall(200, () => {
      this.throwComplete();
    });
  }

  throwComplete() {
    if (!this.isAlive) return;

    this.isThrowing = false;

    this.chooseEvent = this.time.delayedCall(
      Phaser.Math.Between(2000, 4000),
      this.chooseAction,
      [],
      this
    );
  }

  // ✅ MÉTODO HIT CON ANIMACIÓN DE SPRITESHEET
  hit() {
    if (this.chooseEvent) this.chooseEvent.remove();
    if (!this.isAlive) return;

    this.isAlive = false;
    this.previousAction = -1;

    // reproducir sonido
    if (this.sound.get('hit')) this.sound.play('hit');
    if (this.sound.get('pop')) this.sound.play('pop');

    // detener física
    this.setVelocityX(0);
    this.body.setEnable(false); // Deshabilita el cuerpo para nuevas colisiones, pero sigue existiendo

    // ❄️ OPCIÓN 1: Usar el spritesheet animado (más espectacular)
    if (this.scene.anims.exists('snow_explode')) {
      const explosion = this.scene.add.sprite(this.x, this.y - 30, 'snow_explosion');
      explosion.setScale(0.5); // Ajusta el tamaño
      explosion.play('snow_explode');

      explosion.on('animationcomplete', () => {
        explosion.destroy();
      });
    } else {
      // ❄️ OPCIÓN 2: Fallback con partículas tradicionales
      const emitter = this.scene.add.particles(this.x, this.y - 30, 'particle_snow', {
        x: this.x,
        y: this.y - 30,
        speed: { min: -200, max: 200 },
        scale: { start: 0.6, end: 0 },
        lifespan: 600,
        quantity: 12,
        emitting: true
      });

      this.scene.time.delayedCall(600, () => {
        emitter.destroy();
      });
    }

    // animación de "muerte" del enemigo
    this.scene.tweens.add({
      targets: this,
      y: this.y - 40,
      alpha: 0,
      duration: 500,
      ease: 'Power1',
      onComplete: () => {
        this.setActive(false);
        this.setVisible(false);
        this.alpha = 1; // reset
      }
    });

  }

  stop() {
    if (this.chooseEvent) {
      this.chooseEvent.remove();
    }

    this.isAlive = false;
    this.setVelocityX(0);
    this.setActive(false);
    this.setVisible(false);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // Game over si el enemigo llega a x=880
    if (this.x >= 880 && this.isAlive) {
      this.stop();

      if (this.scene.gameOver) {
        this.scene.gameOver();
      }
    }
  }
}
