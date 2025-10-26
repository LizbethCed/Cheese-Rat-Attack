import Track from '../util/Track.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import PlayerShoot from '../entities/PlayerShoot.js';
import EnemyShoot from '../entities/EnemyShoot.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');

    this.player = null;
    this.tracks = null;
    this.score = 0;
    this.highscore = 0;
    this.previousHighscore = 0;
    this.infoPanel = null;
    this.scoreTimer = null;
    this.scoreText = null;
    this.highscoreText = null;
    this.level2Reached = false;
    this.levelMessage = null;
  }

  create() {
    this.score = 0;
    this.highscore = this.registry.get('highscore') || 0;
    this.previousHighscore = this.highscore;
    this.level2Reached = false;
    this.levelMessage = null;

    // Fondo
    this.backgroundImage = this.add.image(512, 384, 'background');
    this.backgroundImage.setDepth(-10);

    // Imagen decorativa del jugador al extremo derecho
    this.playerDisplay = this.add.image(2000, 720, 'player')
      .setOrigin(0.5, 1)
      .setDepth(5);

    this.allEnemies = this.physics.add.group({
      runChildUpdate: true,
      allowGravity: false
    });

    this.allPlayerProjectiles = this.physics.add.group({
      runChildUpdate: true,
      allowGravity: false
    });

    this.allEnemyProjectiles = this.physics.add.group({
      runChildUpdate: true,
      allowGravity: false
    });

    // Crear las 4 pistas (ahora sí pueden usar los grupos)
    this.tracks = [
      new Track(this, 0, 196),
      new Track(this, 1, 376),
      new Track(this, 2, 536),
      new Track(this, 3, 700)
    ];

    // Crear el PLAYER (defensor)
    this.player = new Player(this, this.tracks[0]);
    this.player.start();

    // Panel de información inicial
    this.infoPanel = this.add.image(512, 384, 'controls').setScale(0.3);

    // Texto de puntuación (esquina superior derecha)
    this.add.text(720, 2, 'Puntos:', {
      fontFamily: 'CartoonFont',
      fontSize: 32,
      color: '#ffffff'
    });

    this.scoreText = this.add.text(840, 2, this.score, {
      fontFamily: 'CartoonFont',
      fontSize: 32,
      color: '#ffffff'
    });
    this.scoreText.setDepth(10);

    // Texto de récord (debajo del contador de puntos)
    this.highscoreText = this.add.text(720, 42, `Record: ${this.highscore}`, {
      fontFamily: 'CartoonFont',
      fontSize: 32,
      color: '#ffffff'
    });
    this.highscoreText.setDepth(10);

    
    // Colisión: Proyectiles jugador → Enemigos
    this.physics.add.overlap(
      this.allPlayerProjectiles,
      this.allEnemies,
      this.hitEnemy,
      this.checkCollision, // <--- AÑADIMOS UN PROCESO DE VERIFICACIÓN
      this
    );

    // Colisión: Proyectiles jugador ↔ Proyectiles enemigos
    this.physics.add.overlap(
      this.allPlayerProjectiles,
      this.allEnemyProjectiles,
      this.hitProjectiles,
      null,
      this
    );

    // ✅ COLISIÓN: Proyectiles enemigos → Jugador (¡ESTA FALTABA DE NUEVO!)
    this.physics.add.overlap(
      this.player,
      this.allEnemyProjectiles,
      this.hitPlayer,
      null,
      this
    );


    // ✅ AÑADIR DEBUG VISUAL DE FÍSICAS
    /* this.physics.world.createDebugGraphic();
    this.physics.world.defaults.debugShowBody = true;
    this.physics.world.defaults.debugShowVelocity = false */; 


    // Función de verificación para el overlap
    this.checkCollision = (projectile, enemy) => {
     /* onsole.log('🔎 Verificando colisión...', {
        projActive: projectile.active,
        projBody: projectile.body.enable,
        enemyActive: enemy.active,
        enemyAlive: enemy.isAlive,
        enemyBody: enemy.body.enable,
      });*/
       
      // La colisión solo debe ocurrir si ambos están "vivos" y activos
      return projectile.active && enemy.active && enemy.isAlive;
    };

    // Esperar tecla para iniciar
    this.input.keyboard.once('keydown-SPACE', this.start, this);
    this.input.keyboard.once('keydown-UP', this.start, this);
    this.input.keyboard.once('keydown-DOWN', this.start, this);
  }

  addScore(points = 1) {
    this.score += points;

    if (this.scoreText) {
      this.scoreText.setText(this.score);
    }

    if (this.score > this.highscore) {
      this.highscore = this.score;
      if (this.highscoreText) {
        this.highscoreText.setText(`Record: ${this.highscore}`);
      }
      this.registry.set('highscore', this.highscore);
    }

    if (!this.level2Reached && this.score >= 150) {
      this.reachSecondLevel();
    }
  }

  reachSecondLevel() {
    this.level2Reached = true;

    if (this.backgroundImage) {
      this.backgroundImage.setTexture('esenario2');
    }

    if (this.levelMessage) {
      this.levelMessage.destroy();
      this.levelMessage = null;
    }

    this.levelMessage = this.add.text(512, 100, 'Segundo nivel', {
      fontFamily: 'CartoonFont',
      fontSize: 48,
      color: '#ffeb3b',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    this.levelMessage.setDepth(15);

    this.tweens.add({
      targets: this.levelMessage,
      alpha: 0,
      duration: 800,
      delay: 2200,
      ease: 'Power2',
      onComplete: () => {
        if (this.levelMessage) {
          this.levelMessage.destroy();
          this.levelMessage = null;
        }
      }
    });
  }

  start() {
    // Remover listeners de inicio
    this.input.keyboard.removeAllListeners();

    // Animar panel de información
    this.tweens.add({
      targets: this.infoPanel,
      y: 700,
      alpha: 0,
      duration: 500,
      ease: 'Power2'
    });

    // Iniciar el player (defensor)
    this.player.start();

    // Iniciar las pistas con diferentes delays
    this.tracks[0].start(3000, 5000); // Antes: 4000, 8000
    this.tracks[1].start(2000, 4000); // Antes: 500, 1000 
    this.tracks[2].start(4000, 6000); // Antes: 5000, 9000
    this.tracks[3].start(5000, 7000); // Antes: 6000, 10000

  }

  // 🔍 DEBUG: Verificar colisiones manualmente
  update() {
    // Contar entidades activas
    const activeProjectiles = this.allPlayerProjectiles.getChildren().filter(p => p.active);
    const activeEnemies = this.allEnemies.getChildren().filter(e => e.active && e.isAlive);

    /* if (activeProjectiles.length > 0 && activeEnemies.length > 0) {
      // Hay proyectiles y enemigos activos, verificar overlap manual
      activeProjectiles.forEach(proj => {
        activeEnemies.forEach(enemy => {
          const distance = Phaser.Math.Distance.Between(proj.x, proj.y, enemy.x, enemy.y);
          if (distance < 50) { // Threshold de colisión
            console.log('⚠️ OVERLAP MANUAL DETECTADO', {
              projX: proj.x,
              projY: proj.y,
              enemyX: enemy.x,
              enemyY: enemy.y,
              distance: distance
            });
          }
        });
      });
    } */
  }

  // ===========================================
  // 🎯 COLISIONES GLOBALES
  // ===========================================
  hitEnemy(projectile, enemy) {
    /* console.log('💥 COLISIÓN DETECTADA: Proyectil → Enemigo', {
      projectileX: projectile.x,
      enemyX: enemy.x,
      enemyAlive: enemy.isAlive
    }); */

    if (!enemy.isAlive || !projectile.active) {
      //console.log('❌ Colisión ignorada - condiciones no cumplidas');
      return;
    }


    const points = enemy.size === 'Small' ? 5 : 10;
    this.addScore(points);

    // Destruir el proyectil y golpear al enemigo
    projectile.destroy();
    // Ejecutar reacción de golpe del enemigo
    enemy.hit();

    // Efecto visual
    if (this.anims.exists('snow_explode')) {
      const explosion = this.add.sprite(enemy.x, enemy.y - 30, 'snow_explosion');
      explosion.setScale(0.4);
      explosion.play('snow_explode');
      
      explosion.on('animationcomplete', () => {
        explosion.destroy();
      });
    }
  }

  hitProjectiles(playerProj, enemyProj) {
    
    if (!playerProj?.active || !enemyProj?.active) return;
    
    playerProj.destroy();
    enemyProj.destroy();
  }

  hitPlayer(player, enemyProj) {

    // Evitar que se llame a gameOver múltiples veces si el jugador ya no está vivo
    if (!player.isAlive) {
      return;
    }

    // Destruir el proyectil que impactó
    enemyProj.destroy();

    // Ocultar al jugador y detenerlo
    player.setVisible(false);
    player.stop();

    // Iniciar la secuencia de Game Over
    this.gameOver();
  }

  gameOver() {
    // Cambiar a panel de game over
    this.infoPanel.setTexture('gameover');

    this.tweens.add({
      targets: this.infoPanel,
      y: 384,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });

    // Detener todas las pistas
    this.tracks.forEach((track) => track.stop());

    // Detener audio
    this.sound.stopAll();

    if (this.sound.get('gameover')) {
      this.sound.play('gameover');
    }

    // Detener el player
    this.player.stop();

    // Detener timer de puntuación
    if (this.scoreTimer) {
      this.scoreTimer.destroy();
    }

    // Actualizar highscore si es necesario
    if (this.score > this.previousHighscore) {
      if (this.highscoreText) {
        this.highscoreText.setText('Record: NEW!');
      }
      this.registry.set('highscore', this.score);
    } else if (this.highscoreText) {
      this.highscoreText.setText(`Record: ${this.highscore}`);
    }

    // Esperar tecla o click para volver al menú
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('MenuScene');
    }, this);

    this.input.once('pointerdown', () => {
      this.scene.start('MenuScene');
    }, this);
  }
}
