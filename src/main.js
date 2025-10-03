import MenuScene from "./scenes/MenuScene.js";
import GameScene from "./scenes/GameScene.js";
import OptionsScene from "./scenes/OptionsScene.js";
import CreditsScene from "./scenes/CreditsScene.js";

const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 720,
    backgroundColor: "#3BACD9",
    physics: { default: "arcade" },
    scene: [MenuScene, GameScene, OptionsScene, CreditsScene]
};

const game = new Phaser.Game(config);

window.addEventListener("resize", () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});