import Player from './Player';
import Planet from './Planet';
import { GameObject } from './GameObject';
import Explosion from './Explosion';
import { Dust } from './Particule';
import ParticlesContainer from './ParticlesContainer';
import { CONFIG, poolFunctions, randomNumberBetween } from '../utils';
import { GameBefore, GameEnded, GameOnGoing } from './GameStates';

interface Freeable {
  free: boolean;
}

class Game {
  _canvas;
  _context;
  _backgroundCanvas;
  _backgroundContext;
  _lastTickTimestamp = 0;
  _config;
  _lastRenderTime: number;
  _player: Player;
  _keys: Set<string>;
  #gameObjects = new Map<string, GameObject>();

  // state
  _states: GameBefore[] | GameOnGoing[] | GameEnded[];
  _currentState: GameBefore | GameOnGoing | GameEnded;

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    backgroundCanvas: HTMLCanvasElement,
    backgroundContext: CanvasRenderingContext2D
  ) {
    this._canvas = canvas;
    this._context = context;
    this._backgroundCanvas = backgroundCanvas;
    this._backgroundContext = backgroundContext;
    this._keys = new Set();
    this._config = CONFIG;
    this._config.ground = this.canvas.clientHeight - 100 / 1.5;
    this.config.HERO.height = this.config.HERO.width =
      this.canvas.clientHeight * 0.12;
    this._lastRenderTime = performance.now(); // Initialize the last render timestamp
    this._player = this.createPlayer();

    // states
    this._states = [
      new GameBefore(this),
      new GameOnGoing(this),
      new GameEnded(this),
    ];
    this._currentState = this._states[1];

    this.init();

    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key);
    });
    window.addEventListener('keyup', () => {
      this.keys.clear();
    });
  }

  // GETTERS
  get canvas() {
    return this._canvas;
  }
  get context() {
    return this._context;
  }
  get backgroundCanvas() {
    return this._backgroundCanvas;
  }
  get backgroundContext() {
    return this._backgroundContext;
  }
  get lastTickTimestamp() {
    return this._lastTickTimestamp;
  }
  get config() {
    return this._config;
  }
  get player(): Player {
    return this._player as Player;
  }
  get keys() {
    return this._keys;
  }
  get states() {
    return this._states;
  }
  get currentState() {
    return this._currentState;
  }

  // SETTERS
  set lastTickTimestamp(time: number) {
    this._lastTickTimestamp = time;
  }
  set player(player: Player) {
    this._player = player as Player;
  }
  set currentState(state: GameBefore | GameEnded | GameOnGoing) {
    this._currentState = state;
  }

  init(): void {
    this.start();
  }

  update(timeStamp: number): void {
    this.setDebugMode();

    this.currentState.update(timeStamp);
  }

  render(): void {
    this.clearCanvases([this.canvas, this.backgroundCanvas]);

    this.currentState.render();

    // debug mode
    if (!this.config.debug) return;
    this.currentState.gameObjects.forEach((object) => {
      object.drawBoundingBox(this.context);
    });
  }

  start(): void {
    this.lastTickTimestamp = performance.now();
    let previousTime = performance.now();

    const gameLoop = (currentTime: number): void => {
      // Calculate time passed since last frame
      const elapsed = currentTime - previousTime;

      // Only proceed if enough time has passed to match target FPS
      if (elapsed >= this.config.fpsInterval) {
        const timePassedSinceLastRender = currentTime - this.lastTickTimestamp;

        // Update and render the game
        this.update(timePassedSinceLastRender);
        this.render();

        // Record the last time we rendered
        previousTime = currentTime - (elapsed % this.config.fpsInterval);
        this.lastTickTimestamp = currentTime;
      }

      // Request the next frame
      requestAnimationFrame(gameLoop);
    };

    // Start the loop
    requestAnimationFrame(gameLoop);
  }

  createPlayer() {
    return new Player(
      this.config.HERO.width,
      this.config.HERO.height,
      this.canvas.clientWidth * 0.5,
      this.config.ground,
      this
    );
  }

  clearCanvases(canvases: HTMLCanvasElement[]) {
    canvases.forEach((canvas) => {
      const context = canvas.getContext('2d');
      context!.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    });
  }

  setDebugMode() {
    if (this.keys.has('d')) {
      this.config.debug = true;
    } else {
      this.config.debug = false;
    }
  }

  setState(int: number) {
    this.currentState = this.states[int];
    this.currentState.start();
  }
}

export default Game;
export type { Freeable };
