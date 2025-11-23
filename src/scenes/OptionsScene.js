export default class OptionsScene extends Phaser.Scene {
  constructor() {
    super({ key: "OptionsScene" });
    this.sfxTestSound = null;
  }

  create() {
    // --- 1. DISEÑO MEJORADO Y CONSISTENTE ---
    // Crear fondo con gradiente, igual que en el menú
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0xF2B90C, 0xF2B90C, 0x1BBFAF, 0x1BBFAF, 1);
    graphics.fillRect(0, 0, width, height);

    const centerX = this.cameras.main.centerX;

    // Título de la escena
    this.add.text(centerX, 100, "OPCIONES", {
      fontSize: "54px",
      fill: "#ffffff",
      fontFamily: "CartoonFont",
      stroke: "#000000",
      strokeThickness: 6
    }).setOrigin(0.5);

    // Sonido de prueba para los sliders
    this.sfxTestSound = this.sound.add('click', { volume: 0.5 });

    // --- 2. SLIDERS DE VOLUMEN SEPARADOS (MÚSICA Y SFX) ---
    // Obtener valores guardados o usar defaults
    const musicVolume = this.registry.get('musicVolume') ?? 0.5;
    const sfxVolume = this.registry.get('sfxVolume') ?? 1.0;

    // Crear slider para la música
    this.createVolumeSlider(centerX, 220, "Música", musicVolume, (newVolume) => {
      this.registry.set('musicVolume', newVolume);
      // Aplicar volumen a las pistas de música que puedan estar sonando
      this.sound.getAll('music_menu').forEach(s => s.setVolume(newVolume));
      // Aquí podrías añadir otras pistas de música si las tienes
    });

    // --- 3. IMAGEN DECORATIVA ---
    this.add.image(centerX, 450, 'options').setScale(0.5);

    // --- 4. BOTÓN DE VOLVER ---
    this.createButton(centerX, 650, "Volver", () => {
      this.sound.play("click");
      this.scene.start("MenuScene");
    });

    // ESC para volver
    this.input.keyboard.once("keydown-ESC", () => {
      this.sound.play("click");
      this.scene.start("MenuScene");
    });
  }

  /**
   * Crea un slider de volumen interactivo.
   * @param {number} x - Posición X central del slider.
   * @param {number} y - Posición Y del slider.
   * @param {string} label - Texto para mostrar sobre el slider.
   * @param {number} initialVolume - Volumen inicial (0 a 1).
   * @param {function} onVolumeChange - Callback que se ejecuta al cambiar el volumen.
   */
  createVolumeSlider(x, y, label, initialVolume, onVolumeChange) {
    const sliderWidth = 280;
    const sliderHeight = 20;
    const handleSize = 24;

    // Etiqueta
    this.add.text(x, y - 30, label, {
      fontSize: "32px", fill: "#ffffff", fontFamily: "CartoonFont"
    }).setOrigin(0.5);

    // Barra de fondo del slider
    const sliderBar = this.add.graphics();
    sliderBar.fillStyle(0x000000, 0.5);
    sliderBar.fillRoundedRect(x - sliderWidth / 2, y - sliderHeight / 2, sliderWidth, sliderHeight, 10);

    // Barra de progreso (la parte coloreada)
    const progressBar = this.add.graphics();

    // Manija/Handle del slider
    const handle = this.add.circle(0, y, handleSize / 2, 0xffffff).setStrokeStyle(2, 0x203c5b);
    handle.setInteractive({ useHandCursor: true });
    this.input.setDraggable(handle);

    // Función para actualizar la posición y el volumen
    const updateSlider = (volume) => {
      const newX = x - sliderWidth / 2 + sliderWidth * Phaser.Math.Clamp(volume, 0, 1);
      handle.x = newX;

      progressBar.clear();
      progressBar.fillStyle(0x42A5F5, 1); // Azul brillante para un buen contraste
      progressBar.fillRoundedRect(x - sliderWidth / 2, y - sliderHeight / 2, newX - (x - sliderWidth / 2), sliderHeight, 10);

      onVolumeChange(volume);
    };

    // Evento de arrastre
    handle.on('drag', (pointer, dragX) => {
      const newVolume = (dragX - (x - sliderWidth / 2)) / sliderWidth;
      updateSlider(newVolume);
    });

    // Establecer el estado inicial
    updateSlider(initialVolume);

    return { handle, updateSlider };
  }

  /**
   * Crea un botón con el estilo visual del menú principal.
   * @param {number} x - Posición X del centro del botón.
   * @param {number} y - Posición Y del centro del botón.
   * @param {string} text - Texto a mostrar en el botón.
   * @param {function} onClick - Callback a ejecutar al hacer clic.
   */
  createButton(x, y, text, onClick) {
    const btnWidth = 320;
    const btnHeight = 64;

    const btn = this.add.image(x, y, "btnBlue")
      .setDisplaySize(btnWidth, btnHeight)
      .setInteractive({ useHandCursor: true });

    const txt = this.add.text(x, y, text, {
      fontSize: "32px",
      fill: "#203c5b",
      fontFamily: "CartoonFont"
    }).setOrigin(0.5);

    btn.on("pointerover", () => btn.setTint(0x99ccff));
    btn.on("pointerout", () => btn.clearTint());
    btn.on("pointerdown", () => {
      this.sound.play("click");
      onClick();
    });

    // Hacer que el texto también reaccione
    txt.setInteractive({ useHandCursor: true })
       .on("pointerover", () => btn.setTint(0x99ccff))
       .on("pointerout", () => btn.clearTint())
       .on("pointerdown", () => {
          this.sound.play("click");
          onClick();
       });

    return { btn, txt };
  }
}