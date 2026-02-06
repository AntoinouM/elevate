import Player from './Player';
import { CONFIG } from '../utils';
import { GameBefore, GameEnded, GameOnGoing } from './GameStates';
import ImageCache from '../ImageCache';

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
  _canvasWidth: number = 0;
  _canvasHeight: number = 0;
  _assetsLoaded: boolean = false;

  // Event handler references for cleanup
  private _handleKeyDown: (e: KeyboardEvent) => void;
  private _handleKeyUp: () => void;
  private _handleResize: () => void;

  // state
  _states: GameBefore[] | GameOnGoing[] | GameEnded[];
  _currentState: GameBefore | GameOnGoing | GameEnded;

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    backgroundCanvas: HTMLCanvasElement,
    backgroundContext: CanvasRenderingContext2D,
  ) {
    this._canvas = canvas;
    this._context = context;
    this._backgroundCanvas = backgroundCanvas;
    this._backgroundContext = backgroundContext;
    this._keys = new Set();
    this._config = CONFIG;
    this._canvasWidth = canvas.clientWidth;
    this._canvasHeight = canvas.clientHeight;
    this._config.ground = this._canvasHeight - 100 / 1.5;
    this.config.HERO.height = this.config.HERO.width =
      this._canvasHeight * 0.12;
    this._lastRenderTime = performance.now(); // Initialize the last render timestamp

    // Bind event handlers for proper cleanup
    this._handleKeyDown = (e: KeyboardEvent) => {
      this.keys.add(e.key);
    };
    this._handleKeyUp = () => {
      this.keys.clear();
    };
    this._handleResize = () => {
      this._canvasWidth = this.canvas.clientWidth;
      this._canvasHeight = this.canvas.clientHeight;
      this._config.ground = this._canvasHeight - 100 / 1.5;
      this.config.HERO.height = this.config.HERO.width =
        this._canvasHeight * 0.12;
    };

    this._player = this.createPlayer();

    // states
    this._states = [
      new GameBefore(this),
      new GameOnGoing(this),
      new GameEnded(this),
    ];
    this._currentState = this._states[1];

    // Add event listeners
    window.addEventListener('keydown', this._handleKeyDown);
    window.addEventListener('keyup', this._handleKeyUp);
    window.addEventListener('resize', this._handleResize);

    this.preloadAssets();
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
  get canvasWidth() {
    return this._canvasWidth;
  }
  get canvasHeight() {
    return this._canvasHeight;
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

  preloadAssets(): void {
    const imageCache = ImageCache.getInstance();
    const imagePaths = ['/Astro.png', '/boom.png'];

    imageCache
      .preloadImages(imagePaths)
      .then(() => {
        this._assetsLoaded = true;
        this.start();
      })
      .catch((error) => {
        console.error('Asset loading failed:', error);
      });
  }

  update(timeStamp: number): void {
    this.setDebugMode();

    this.currentState.update(timeStamp);
  }

  render(): void {
    // Clear both canvases using stored contexts
    this._context.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
    this._backgroundContext.clearRect(
      0,
      0,
      this._canvasWidth,
      this._canvasHeight,
    );

    this.currentState.render();

    // debug mode
    if (!this.config.debug) return;
    this.currentState.gameObjects.forEach((object) => {
      object.drawBoundingBox(this.context);
    });
  }

  start(): void {
    this.lastTickTimestamp = performance.now();

    const gameLoop = (currentTime: number): void => {
      // Calculate time passed since last frame
      const elapsed = currentTime - this.lastTickTimestamp;

      // Only proceed if enough time has passed to match target FPS
      // This ensures consistent gameplay speed across all refresh rates
      if (elapsed >= this.config.fpsInterval) {
        // Update and render the game
        this.update(elapsed);
        this.render();

        // Record the last time we rendered
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
      this._canvasWidth * 0.5,
      this.config.ground,
      this,
    );
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

  destroy(): void {
    // Remove event listeners
    window.removeEventListener('keydown', this._handleKeyDown);
    window.removeEventListener('keyup', this._handleKeyUp);
    window.removeEventListener('resize', this._handleResize);

    // Cleanup player
    this.player.destroy();
  }
}

export default Game;
export type { Freeable };
