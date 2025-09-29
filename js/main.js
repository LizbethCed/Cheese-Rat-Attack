// main.js

// Importar escenas principales
import Boot from './Boot.js';
import Preloader from './Preloader.js';
import MainMenu from './MainMenu.js';
import Game from './Game.js';

// Importar clases necesarias para el juego (si se usan dentro de las escenas)
import Track from './Track.js';
import Player from './Player.js';
import Snowman from './Snowman.js';
import PlayerSnowball from './PlayerSnowball.js';
import EnemySnowball from './EnemySnowball.js';


// Configuración del juego Phaser
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    backgroundColor: '#3366b2',
    parent: 'phaser-example',  // div donde se renderiza el juego
    scene: [ Boot, Preloader, MainMenu, Game ],
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    }
};

// Crear instancia del juego
const game = new Phaser.Game(config);

// Exponer la instancia a la consola para debug
window.game = game;

// Opcional: prevenir errores si el usuario recarga la página
window.addEventListener('unload', () => {
    game.destroy(true);
});
