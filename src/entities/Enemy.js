// Este es el ENEMIGO que ataca (gatos)
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, track, size) {
    const textureKey = size === "Small" ? "snowman-small-idle0" : "snowman-big-throw";
    const posX = size === "Small" ? 80 : -100;

    super(scene, posX, track.y, textureKey);

    this.setOrigin(0.5, 1);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Inicialmente oculto/inactivo
    this.setActive(false);
    this.setVisible(false);
    if (this.body) {
      this.body.enable = false;
    }

    this.isAlive = false;

    this.scene = scene;
    this.time = scene.time;
    this.sound = scene.sound;

    this.isThrowing = false;
    this.size = size;
    this.speed = 80;
    this.isBoss = false;

    this.maxHealth = (this.size === 'Big') ? 2 : 1;
    this.health = this.maxHealth;

    this.previousAction = 0;
    this.currentTrack = track;

    // ID único para debugging
    this.enemyId = `${size}_T${track.id}_${Date.now()}`;

    // Configurar hitbox
    this.scene.time.delayedCall(0, () => {
      if (this.body) {
        if (size === "Small") {
          this.setScale(0.15);
          this.body.setSize(900, 900);
          this.body.setOffset(0, 10);
        } else {
          this.setScale(0.18);
          this.body.setSize(980, 980);
          this.body.setOffset(90, 10);
        }
      }
    });
  }

  start() {
    // Limpiar timers anteriores
    this.clearTimers();

    // Resetear estado completamente
    this.isAlive = true;
    this.isThrowing = false;
    this.previousAction = 0;
    this.health = this.maxHealth;
    this.alpha = 1;
    this.clearTint();

    // Activar visualmente
    this.setActive(true);
    this.setVisible(true);

    if (this.body) {
      this.body.enable = true;

      const startX = this.size === "Small" ? 80 : -100;
      const startY = this.currentTrack.y;
      
      this.setPosition(startX, startY);
      
      if (this.body) {
        this.body.reset(startX, startY);
        this.body.setAllowGravity(false);
      }

      if (this.scene.allEnemies && !this.scene.allEnemies.contains(this)) {
        this.scene.allEnemies.add(this);
      }
    }

    this.setVelocityX(this.speed);

    if (this.scene && typeof this.scene.onEnemySpawn === 'function') {
      this.scene.onEnemySpawn(this);
    }

    const firstActionDelay = this.size === "Small" ? 2500 : 3500;
    
    this.chooseEvent = this.time.delayedCall(
      Phaser.Math.Between(firstActionDelay, firstActionDelay + 1500),
      this.chooseAction,
      [],
      this
    );
  }

  // ✅ NUEVO: Método centralizado para limpiar timers
  clearTimers() {
    if (this.chooseEvent) {
      this.chooseEvent.remove();
      this.chooseEvent = null;
    }
    if (this.throwTimer) {
      this.throwTimer.remove();
      this.throwTimer = null;
    }
    if (this.throwCompleteTimer) {
      this.throwCompleteTimer.remove();
      this.throwCompleteTimer = null;
    }
  }

  chooseAction() {
    if (!this.isAlive) return;

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
    if (!this.isAlive || this.x < 0) {
      return this.walk();
    }
    
    this.previousAction = 2;
    this.isThrowing = true;

    this.throwTimer = this.scene.time.delayedCall(200, () => {
      this.releaseSnowball();
    });
  }

  releaseSnowball() {
    if (!this.isAlive || !this.active || !this.visible || !this.body?.enable) {
      if (this.throwCompleteTimer) {
        this.throwCompleteTimer.remove();
        this.throwCompleteTimer = null;
      }
      return;
    }

    this.currentTrack.throwEnemySnowball(this.x);

    this.throwCompleteTimer = this.scene.time.delayedCall(200, () => {
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

  hit() {
    if (!this.isAlive) return;

    this.health--;
    
    if (this.sound.get('hit')) this.sound.play('hit');

    if (this.health <= 0) {
      // ✅ CRÍTICO: Marcar como muerto y desactivar INMEDIATAMENTE
      this.isAlive = false;
      this.previousAction = -1;
      this.setActive(false);

      // Limpiar timers
      this.clearTimers();

      // Desactivar física
      this.setVelocityX(0);
      this.setVelocityY(0);
      
      if (this.body) {
        this.body.enable = false;
        if (this.scene.allEnemies) {
          this.scene.allEnemies.remove(this, false, false);
        }
      }
      
      if (this.sound.get('pop')) this.sound.play('pop');

      // Explosión
      if (this.scene.anims.exists('snow_explode')) {
        const explosion = this.scene.add.sprite(this.x, this.y - 30, 'snow_explosion');
        explosion.setScale(0.5);
        explosion.play('snow_explode');
        explosion.on('animationcomplete', () => explosion.destroy());
      }

      // ✅ Animación de muerte más corta
      this.scene.tweens.add({
        targets: this,
        y: this.y - 40,
        alpha: 0,
        duration: 300,
        ease: 'Power1',
        onComplete: () => {
          this.cleanupEnemy();
        }
      });

      // ✅ Backup timer de seguridad
      this.scene.time.delayedCall(350, () => {
        if (!this.isAlive && this.visible) {
          this.cleanupEnemy();
        }
      });

    } else {
      // Parpadeo al recibir daño
      this.scene.tweens.add({
        targets: this,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
        repeat: 2,
        onStart: () => {
          this.setTint(0xff0000);
        },
        onComplete: () => {
          this.clearTint();
          this.alpha = 1;
        }
      });
    }
  }

  // ✅ Método centralizado de limpieza
  cleanupEnemy() {
    // Matar tweens
    this.scene.tweens.killTweensOf(this);
    
    // Reset visual completo
    this.setVisible(false);
    this.setActive(false);
    this.alpha = 1;
    this.clearTint();
    
    // Mover fuera de pantalla
    this.x = -500;
    this.y = -500;
    
    if (this.body) {
      this.body.reset(-500, -500);
      this.body.enable = false;
    }
    
    this.isAlive = false;
  }

  stop() {
    this.clearTimers();
    this.isAlive = false;

    if (this.body) {
      this.setVelocityX(0);
      this.setVelocityY(0);
      this.body.enable = false;
      
      if (this.scene.allEnemies) {
        this.scene.allEnemies.remove(this, false, false);
      }
    }

    this.cleanupEnemy();
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.x >= 880 && this.isAlive && this.active && this.visible && !this.isBoss) {
      this.stop();

      if (this.scene.gameOver) {
        this.scene.gameOver(`ENEMIGO_EN_BASE_${this.size}`);
      }
    }
  }
}