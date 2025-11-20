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


     // Inicialmente oculto/inactivo y sin cuerpo para evitar colisiones
    this.setActive(false);
    this.setVisible(false);
    if (this.body) {
      this.body.enable = false;
    }

   // No está "vivo" hasta que se llame a start()
   this.isAlive = false;

    this.scene = scene;
    this.time = scene.time;
    this.sound = scene.sound;

    this.isThrowing = false;
    this.size = size;
    this.speed = 70; // Aumenta este valor para que avancen más rápido (ej: 80)
    this.isBoss = false;

    // ✅ AÑADIR SISTEMA DE VIDA
    this.maxHealth = (this.size === 'Big') ? 2 : 1;
    this.health = this.maxHealth;

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

  // 🔥 Reaplicar escala y hitbox correctamente al revivir
  if (this.size === "Small") {
    this.setScale(0.15);
    this.body.setSize(900, 900);
    this.body.setOffset(0, 10);
  } else {
    this.setScale(0.18);
    this.body.setSize(980, 980);
    this.body.setOffset(90, 10);
  }

  // ============ TUS LÍNEAS ORIGINALES ===================
  // ✅ LIMPIAR TIMERS ANTERIORES antes de crear nuevos
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

  this.isAlive = true;
  this.isThrowing = false;
  this.previousAction = 0;

  // ✅ RESTAURAR LA VIDA AL REAPARECER
  this.health = this.maxHealth;

  // Limpiar cualquier estado anterior
  this.alpha = 1;
  this.clearTint();

  this.setActive(true);
  this.setVisible(true);

  if (this.body) {
    this.body.enable = true;

    const startX = this.size === "Small" ? 80 : -100;
    this.body.reset(startX, this.currentTrack.y);

    if (this.scene.allEnemies && !this.scene.allEnemies.contains(this)) {
      this.scene.allEnemies.add(this);
    }

    this.body.setAllowGravity(false);
  }

  // Velocidad hacia la derecha
  this.setVelocityX(this.speed);

  if (this.scene && typeof this.scene.onEnemySpawn === 'function') {
    this.scene.onEnemySpawn(this);
  }

  const firstActionDelay = this.size === "Small" ? 2000 : 3000;

  this.chooseEvent = this.time.delayedCall(
    Phaser.Math.Between(firstActionDelay, firstActionDelay + 2000),
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
    // ✅ Verificar que esté vivo ANTES de disparar
    if (!this.isAlive) return;

    // ✅ NUEVA VERIFICACIÓN: No disparar si está fuera de la pantalla.
    // Esto evita que los enemigos disparen justo al aparecer.
    if (this.x < 0) {
      return this.walk(); // Si no puede disparar, que siga caminando.
    }
    
    this.previousAction = 2;
    this.isThrowing = true;

    // ✅ Guardar referencia al timer para poder cancelarlo
    this.throwTimer = this.scene.time.delayedCall(200, () => {
      this.releaseSnowball();
    });
  }

  releaseSnowball() {
    if (!this.isAlive || !this.active || !this.visible || !this.body?.enable) {
       // Cancelar el timer de throwComplete si existe
       if (this.throwCompleteTimer) {
           this.throwCompleteTimer.remove();
           this.throwCompleteTimer = null;
       }
       return;
    }

    this.currentTrack.throwEnemySnowball(this.x);

    // ✅ Guardar referencia al timer
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

  // Reducir vida y reproducir sonido de impacto
  this.health--;
  if (this.sound.get('hit')) this.sound.play('hit');

  // Si la vida es 0 o menos, el enemigo muere.
  if (this.health <= 0) {
    // ✅ MARCAR COMO MUERTO INMEDIATAMENTE
    this.isAlive = false;
    this.previousAction = -1;

    // ✅ CANCELAR TODOS LOS TIMERS
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

    // ✅ DESACTIVAR FÍSICA INMEDIATAMENTE
    this.setVelocityX(0);
    this.setVelocityY(0);
    
    if (this.body) {
      this.body.enable = false; // ✅ Sintaxis correcta
      // ✅ Remover del grupo de físicas
      if (this.scene.allEnemies) {
        this.scene.allEnemies.remove(this, false, false);
      }
    }

    // ✅ DESACTIVAR COLISIONES INMEDIATAMENTE
    this.setActive(false);
    
    // Sonido de muerte
    if (this.sound.get('pop')) this.sound.play('pop');

    // Efecto de explosión
    if (this.scene.anims.exists('snow_explode')) {
      const explosion = this.scene.add.sprite(this.x, this.y - 30, 'snow_explosion');
      explosion.setScale(0.5);
      explosion.play('snow_explode');
      explosion.on('animationcomplete', () => explosion.destroy());
    }

    // Animación de "muerte" del enemigo
    this.scene.tweens.add({
      targets: this,
      y: this.y - 40,
      alpha: 0,
      duration: 500,
      ease: 'Power1',
      onComplete: () => {
        // ✅ LIMPIEZA FINAL
        this.setVisible(false);
        this.alpha = 1; // reset para reutilización
        this.x = -200; // Mover fuera de pantalla
        
        // ✅ Asegurar que está completamente desactivado
        if (this.body) {
          this.body.reset(-200, -200);
        }
      }
    });
  } else {
    // Si todavía tiene vida, solo parpadea para indicar el golpe.
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

// ✅ MÉTODO STOP CORREGIDO
stop() {
  // ✅ CANCELAR TODOS LOS TIMERS
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

  this.isAlive = false;

  if (this.body) {
    this.setVelocityX(0);
    this.setVelocityY(0);
    this.body.enable = false; // ✅ Sintaxis correcta
    
    // ✅ Remover del grupo de físicas
    if (this.scene.allEnemies) {
      this.scene.allEnemies.remove(this, false, false);
    }
  }

  this.setActive(false);
  this.setVisible(false);
  
  // ✅ Mover fuera de pantalla
  this.x = -200;
  this.y = -200;
}

 preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // ✅ VERIFICACIONES ADICIONALES antes de llamar gameOver
    if (this.x >= 880 && this.isAlive && this.active && this.visible && !this.isBoss) {
      // 🔍 LOG antes de llamar gameOver
      console.warn('⚠️ Enemigo llegó a la base:', {
        size: this.size,
        x: Math.round(this.x),
        y: Math.round(this.y),
        isAlive: this.isAlive,
        active: this.active
      });
      
      this.stop();

      if (this.scene.gameOver) {
        this.scene.gameOver(`ENEMIGO_EN_BASE_${this.size}`);
      }
    }
}
}
