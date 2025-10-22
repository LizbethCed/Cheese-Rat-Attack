import MenuScene from "./scenes/MenuScene.js";
import GameScene from "./scenes/GameScene.js";
import OptionsScene from "./scenes/OptionsScene.js";
import CreditsScene from "./scenes/CreditsScene.js";
import PreloadScene from "./scenes/PreloadScene.js";
import BootScene from "./scenes/BootScene.js";
import GameOverScene from "./scenes/GameOverScene.js";

const config = {
    type: Phaser.AUTO,
    width: 2000,
    height: 820,
    backgroundColor: "#3BACD9",
    physics: { default: "arcade" },
    scene: [BootScene, PreloadScene, OptionsScene, CreditsScene, MenuScene, GameScene, GameOverScene]
};

const game = new Phaser.Game(config);

window.addEventListener("resize", () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});