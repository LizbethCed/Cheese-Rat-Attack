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
  }

  create() {
    this.score = 0;
    this.highscore = this.registry.get('highscore') || 0;
    this.previousHighscore = this.highscore;

    // Fondo
    this.add.image(512, 384, 'background');

    // ✅ CREAR GRUPOS GLOBALES PRIMERO (antes de los tracks)
    console.log('🔧 Creando grupos globales...');
    
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

    console.log('✅ Grupos creados:', {
      enemies: this.allEnemies,
      playerProj: this.allPlayerProjectiles,
      enemyProj: this.allEnemyProjectiles
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

    // Overlay UI
   

    // Panel de información inicial
    this.infoPanel = this.add.image(512, 384, 'controls');

    // Texto de récord (esquina superior derecha)
    this.highscoreText = this.add.text(820, 2, this.highscore, {
      fontFamily: 'Arial',
      
      fontSize: 32,
      color: '#ffffff'
    });

    // ✅ COLISIONES GLOBALES - DESPUÉS de crear todo
    console.log('🔧 Configurando colisiones globales...');
    console.log('Total enemigos:', this.allEnemies.getLength());
    console.log('Total proyectiles jugador:', this.allPlayerProjectiles.getLength());
    
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

    console.log('✅ Colisiones configuradas');

    // ✅ AÑADIR DEBUG VISUAL DE FÍSICAS
    /* this.physics.world.createDebugGraphic();
  this.physics.world.defaults.debugShowBody = true;
  this.physics.world.defaults.debugShowVelocity = false; */


    // Función de verificación para el overlap
    this.checkCollision = (projectile, enemy) => {
      console.log('🔎 Verificando colisión...', {
        projActive: projectile.active,
        projBody: projectile.body.enable,
        enemyActive: enemy.active,
        enemyAlive: enemy.isAlive,
        enemyBody: enemy.body.enable,
      });

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
        this.highscoreText.setText(this.highscore);
      }
      this.registry.set('highscore', this.highscore);
    }
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
    this.tracks[0].start(4000, 8000);
    this.tracks[1].start(500, 1000);
    this.tracks[2].start(5000, 9000);
    this.tracks[3].start(6000, 10000);

  }

  // 🔍 DEBUG: Verificar colisiones manualmente
  update() {
    // Contar entidades activas
    const activeProjectiles = this.allPlayerProjectiles.getChildren().filter(p => p.active);
    const activeEnemies = this.allEnemies.getChildren().filter(e => e.active && e.isAlive);

    if (activeProjectiles.length > 0 && activeEnemies.length > 0) {
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
    }
  }

  // ===========================================
  // 🎯 COLISIONES GLOBALES
  // ===========================================
  hitEnemy(projectile, enemy) {
    console.log('💥 COLISIÓN DETECTADA: Proyectil → Enemigo', {
      projectileX: projectile.x,
      enemyX: enemy.x,
      enemyAlive: enemy.isAlive
    });

    if (!enemy.isAlive || !projectile.active) {
      console.log('❌ Colisión ignorada - condiciones no cumplidas');
      return;
    }

    console.log('✅ ELIMINANDO ENEMIGO');

    // Destruir el proyectil y golpear al enemigo
    projectile.destroy();
<<<<<<< Updated upstream
    // Ejecutar reacción de golpe del enemigo
=======
    console.log('✅ ELIMINANDO ENEMIGO');

    const points = enemy.size === 'Small' ? 5 : 10;
    this.addScore(points);

    // Destruir el proyectil y golpear al enemigo
    projectile.destroy();
>>>>>>> Stashed changes
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
    console.log('💥 Colisión proyectil vs proyectil');
    
    if (!playerProj?.active || !enemyProj?.active) return;
    
    playerProj.destroy();
    enemyProj.destroy();
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
      this.highscoreText.setText('NEW!');
      this.registry.set('highscore', this.score);
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