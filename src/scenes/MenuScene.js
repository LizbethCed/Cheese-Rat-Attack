export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: "MenuScene" });
    }

    preload() {
        // CARGAR MUSICA Y LOGO

        this.load.image("logo", "assets/images/logo.png");
        this.load.audio("click", "assets/audio/click.mp3");
    }

    create() {
  // Crear fondo con gradiente
  const width = this.sys.game.config.width;
  const height = this.sys.game.config.height;
  
  const graphics = this.add.graphics();
  graphics.fillGradientStyle(0xF2B90C, 0xF2B90C, 0x1BBFAF, 0x1BBFAF, 1);
  graphics.fillRect(0, 0, width, height);

  // Detener otras músicas antes de reproducir la del menú
  this.sound.stopAll();

  // --- LÓGICA DE MÚSICA MEJORADA ---
  const musicVolume = this.registry.get('musicVolume') ?? 0.5;

  // Obtener o crear la música del menú
  let music = this.sound.get('music_menu');
  if (!music) {
    music = this.sound.add('music_menu', { loop: true, volume: musicVolume });
  }

  // Actualizar volumen
  music.setVolume(musicVolume);

  // ✅ CRÍTICO: Intentar reproducir, y si falla, esperar al evento UNLOCKED
  const tryPlayMusic = () => {
    if (music && !music.isPlaying) {
      try {
        music.play();
        console.log('✅ Música del menú reproducida');
      } catch (e) {
        console.warn('⚠️ Audio bloqueado por navegador, esperando interacción del usuario');
      }
    }
  };

  // Intentar reproducir inmediatamente
  tryPlayMusic();

  // ✅ Si el audio está bloqueado, reproducir al primer click/teclado
  this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
    console.log('🔓 Audio desbloqueado por navegador');
    tryPlayMusic();
  });

  // ✅ TAMBIÉN: Escuchar cualquier input del usuario como fallback
  this.input.keyboard.once('keydown', () => tryPlayMusic());
  this.input.once('pointerdown', () => tryPlayMusic());

  const centerX = this.cameras.main.centerX;

  // Logo
  this.add.image(centerX, 160, "logo").setScale(0.4);

  // Opciones de menú
  const opciones = [
    { texto: "Jugar", escena: "GameScene" },
    { texto: "Opciones", escena: "OptionsScene" },
    { texto: "Créditos", escena: "CreditsScene" }
  ];

  const btnWidth = 320;
  const btnHeight = 64;
  const btnSpacing = 80;
  const startY = 360;

  opciones.forEach((op, i) => {
    // Botón
    const btn = this.add.image(centerX, startY + i * btnSpacing, "btnBlue")
      .setDisplaySize(btnWidth, btnHeight)
      .setInteractive({ useHandCursor: true });

    // Texto sobre el botón
    const txt = this.add.text(centerX, startY + i * btnSpacing, op.texto, {
      fontSize: "32px",
      fill: "#203c5b",
      fontFamily: "CartoonFont"
    }).setOrigin(0.5);

    // Interactividad
    btn.on("pointerover", () => btn.setTint(0x99ccff));
    btn.on("pointerout", () => btn.clearTint());
    btn.on("pointerdown", () => {
      this.sound.play("click");
      if (op.escena === 'GameScene') this.sound.stopAll();
      this.scene.start(op.escena);
    });

    txt.setInteractive({ useHandCursor: true });
    txt.on("pointerover", () => btn.setTint(0x99ccff));
    txt.on("pointerout", () => btn.clearTint());
    txt.on("pointerdown", () => {
      this.sound.play("click");
      if (op.escena === 'GameScene') this.sound.stopAll();
      this.scene.start(op.escena);
    });
  });
}
    
}
