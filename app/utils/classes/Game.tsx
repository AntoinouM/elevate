import Player from './Player';
import Planet from './Planet';
import { Idle, Rise, Walk, Fly } from './PlayerStates.tsx/PlayerStates';

class Game {
  _state: number = 0 | 1 | 2;
  _canvas;
  _context;
  _lastTickTimestamp = 0;
  _debug = false;
  _collectiblesPool: Planet[];
  _config;
  _lastRenderTime: number;
  _player: Player;
  _keys: Set<string>;

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this._canvas = canvas;
    this._context = context;
    this._state = 0;
    this._collectiblesPool = [];
    this._keys = new Set();
    this._config = {
      HERO: {
        width: 100,
        height: 100,
        velocity: 0.02,
      },
      PLANET: {
        radius: 12,
        maximum: 12,
        fallingSpeed: 0.5,
        planetTimer: 0,
        planetSpawnInterval: 2000 + Math.random() * 2000,
      },
      fps: 60,
      fpsInterval: 1000 / 60,
      ground: this.canvas.clientHeight - 100 / 1.5,
      gravity: -0.001,
      impulseForce: 0.62,
    };
    this._lastRenderTime = performance.now(); // Initialize the last render timestamp
    this._player = new Player(
      this.config.HERO.width,
      this.config.HERO.height,
      this.canvas.clientWidth / 2,
      this.config.ground,
      this
    );
    this.init();

    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key);
    });
    window.addEventListener('keyup', () => {
      this.keys.clear();
    });
  }

  // GETTERS
  get state() {
    return this._state;
  }
  get canvas() {
    return this._canvas;
  }
  get context() {
    return this._context;
  }
  get lastTickTimestamp() {
    return this._lastTickTimestamp;
  }
  get collectiblesPool() {
    return this._collectiblesPool;
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

  // SETTERS
  set lastTickTimestamp(time: number) {
    this._lastTickTimestamp = time;
  }
  set player(player: Player) {
    this._player = player as Player;
  }

  init(): void {
    this.createPlanetPool(this.config.PLANET.maximum);
    this.start();
  }

  createPlanetPool(max: number) {
    for (let i = 0; i < max; i++) {
      const planet = new Planet(
        this.config.PLANET.radius,
        this.config.PLANET.radius,
        this
      );
      this.collectiblesPool.push(planet);
    }
  }

  getFirstFreePlanetFromPool() {
    for (let i: number = 0; i < this.collectiblesPool.length; i++) {
      if (this.collectiblesPool[i].free) return this.collectiblesPool[i];
    }
  }

  update(timeStamp: number): void {
    this.player.update(timeStamp);
    this.collectiblesPool.forEach((col) => {
      if (!col.free) col.update(timeStamp);
    });
    // create periodically planets
    if (
      this.config.PLANET.planetTimer > this.config.PLANET.planetSpawnInterval
    ) {
      const planet = this.getFirstFreePlanetFromPool();
      planet?.activate();
      this.config.PLANET.planetTimer = 0;
    } else {
      this.config.PLANET.planetTimer += timeStamp;
    }
  }

  render(): void {
    this.context.clearRect(
      0,
      0,
      this.canvas.clientWidth,
      this.canvas.clientHeight
    );
    // Ensure you render the collectibles
    this.collectiblesPool.forEach((collectible) => {
      collectible.render(); // Call render for each planet
    });
    this.player.render();
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

  end(): void {}

  randomXInCanvas(width: number, objectWidth: number): number {
    let randomizedX = Math.floor(Math.random() * width);
    if (objectWidth) {
      if (randomizedX <= objectWidth) {
        randomizedX = randomizedX + objectWidth;
      } else if (randomizedX >= width - objectWidth) {
        randomizedX = randomizedX - objectWidth;
      }
    }
    return randomizedX;
  }
}

export default Game;
