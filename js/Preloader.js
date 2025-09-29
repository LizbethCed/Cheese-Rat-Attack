import snowShader from '../assets/imagenes/snow.glsl.js';

export default class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
        this.loadText;
    }

    preload() {
        // Texto de carga
        this.loadText = this.add.text(512, 360, 'Loading ...', { 
            fontFamily: 'Arial', fontSize: 74, color: '#e3f2ed' 
        });
        this.loadText.setOrigin(0.5);
        this.loadText.setStroke('#203c5b', 6);
        this.loadText.setShadow(2, 2, '#2d2d2d', 4, true, false);

        // Cargar imágenes
        this.load.setPath('assets/imagenes/');
        this.load.image(['background', 'overlay', 'gameover', 'title']);
        this.load.atlas('sprites', 'sprites.png', 'sprites.json');

        // Shader de nieve
        this.load.glsl('snow', snowShader);

        // Cargar audios
        this.load.setPath('assets/musica/');
        this.load.audio('music', ['music.ogg', 'music.m4a', 'music.mp3']);
        this.load.audio('throw', ['throw.ogg', 'throw.m4a', 'throw.mp3']);
        this.load.audio('move', ['move.ogg', 'move.m4a', 'move.mp3']);
        this.load.audio('hit-snowman', ['hit-snowman.ogg', 'hit-snowman.m4a', 'hit-snowman.mp3']);
        this.load.audio('gameover', ['gameover.ogg', 'gameover.m4a', 'gameover.mp3']);
    }

    create() {
        // Crear animaciones globales
        const anims = this.anims;

        anims.create({
            key: 'die',
            frames: anims.generateFrameNames('sprites', { prefix: 'die', start: 0, end: 0, zeroPad: 3 })
        });

        anims.create({
            key: 'idle',
            frames: anims.generateFrameNames('sprites', { prefix: 'idle', start: 0, end: 3, zeroPad: 3 }),
            yoyo: true,
            frameRate: 8,
            repeat: -1
        });

        anims.create({
            key: 'throwStart',
            frames: anims.generateFrameNames('sprites', { prefix: 'throw', start: 0, end: 8, zeroPad: 3 }),
            frameRate: 26
        });

        anims.create({
            key: 'throwEnd',
            frames: anims.generateFrameNames('sprites', { prefix: 'throw', start: 9, end: 11, zeroPad: 3 }),
            frameRate: 26
        });

        anims.create({
            key: 'snowmanIdleBig',
            frames: anims.generateFrameNames('sprites', { prefix: 'snowman-big-idle', start: 0, end: 3 }),
            yoyo: true,
            frameRate: 8,
            repeat: -1
        });

        anims.create({
            key: 'snowmanWalkBig',
            frames: anims.generateFrameNames('sprites', { prefix: 'snowman-big-walk', start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        anims.create({
            key: 'snowmanThrowStartBig',
            frames: anims.generateFrameNames('sprites', { prefix: 'snowman-big-throw', start: 0, end: 5 }),
            frameRate: 20
        });

        anims.create({
            key: 'snowmanThrowEndBig',
            frames: anims.generateFrameNames('sprites', { prefix: 'snowman-big-throw', start: 6, end: 8 }),
            frameRate: 20
        });

        anims.create({
            key: 'snowmanDieBig',
            frames: anims.generateFrameNames('sprites', { prefix: 'snowman-big-die', start: 0, end: 4 }),
            frameRate: 14
        });

        anims.create({
            key: 'snowmanIdleSmall',
            frames: anims.generateFrameNames('sprites', { prefix: 'snowman-small-idle', start: 0, end: 3 }),
            yoyo: true,
            frameRate: 8,
            repeat: -1
        });

        anims.create({
            key: 'snowmanWalkSmall',
            frames: anims.generateFrameNames('sprites', { prefix: 'snowman-small-walk', start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        anims.create({
            key: 'snowmanThrowStartSmall',
            frames: anims.generateFrameNames('sprites', { prefix: 'snowman-small-throw', start: 0, end: 5 }),
            frameRate: 20
        });

        anims.create({
            key: 'snowmanThrowEndSmall',
            frames: anims.generateFrameNames('sprites', { prefix: 'snowman-small-throw', start: 6, end: 8 }),
            frameRate: 20
        });

        anims.create({
            key: 'snowmanDieSmall',
            frames: anims.generateFrameNames('sprites', { prefix: 'snowman-small-die', start: 0, end: 4 }),
            frameRate: 14
        });

        // Si el audio está bloqueado, esperar click para iniciar
        if (this.sound.locked) {
            this.loadText.setText('Click to Start');
            this.input.once('pointerdown', () => {
                this.scene.start('MainMenu');
            });
        } else {
            this.scene.start('MainMenu');
        }
    }
}
