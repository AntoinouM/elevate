import GameObject from './GameObject';
import Player from './Player';
import Planet from './Planet';

class Game {
  _state: number = 0 | 1 | 2;
  _canvas;
  _context;
  _gameObjects = new Map<string, GameObject>();
  _lastTickTimestamp = 0;
  _debug = false;
  _collectiblesPool: Planet[];
  _config;
  _lastRenderTime: number;
  _player: Player | undefined;

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this._canvas = canvas;
    this._context = context;
    this._state = 0;
    this._collectiblesPool = [];
    this._config = {
      HERO: {
        width: 50,
        height: 50,
        velocity: 0.02,
      },
      PLANET: {
        radius: 12,
        maximum: 12,
        fallingSpeed: 0.5,
        planetTimer: 0,
        planetSpawnInterval: 1000,
      },
      fps: 60,
      fpsInterval: 1000 / 60,
      ground: this.canvas.clientHeight - 50 / 1.5,
      gravity: -0.001,
      impulseForce: 0.62,
    };

    this._lastRenderTime = performance.now(); // Initialize the last render timestamp
    this._player = undefined;

    this.init();
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
  get gameObjects() {
    return this._gameObjects;
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
  get player(): Player | undefined {
    return this._player;
  }

  // SETTERS
  set lastTickTimestamp(time: number) {
    this._lastTickTimestamp = time;
  }
  set player(player: Player | undefined) {
    this._player = player;
  }

  addObject(gameObject: GameObject) {
    this.gameObjects.set(gameObject.id, gameObject);
  }

  removeObject(id: string) {
    if (!this.gameObjects.has(id)) return;
    this.gameObjects.delete(id);
  }

  getObject(id: string) {
    if (!this.gameObjects.has(id)) return;
    return this.gameObjects.get(id);
  }

  init(): void {
    this.player = new Player(
      this.config.HERO.width,
      this.config.HERO.height,
      this.canvas.clientWidth / 2,
      this.config.ground,
      this
    );
    this.addObject(this.player);
    this.createPlanetPool(this.config.PLANET.maximum);
    this.start();

    this.gameObjects.forEach((value) => {
      value.init();
    });
  }

  createPlanetPool(max: number) {
    for (let i = 0; i < max; i++) {
      const planet = new Planet(
        this.config.PLANET.radius,
        this.config.PLANET.radius,
        0,
        0,
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
    this.gameObjects.forEach((value) => {
      value.update(timeStamp);
    });
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
    if (this._debug) {
      this.gameObjects.forEach((value) => {
        value.getBoundingBox();
      });
    }
    // Ensure you render the collectibles
    this.collectiblesPool.forEach((collectible) => {
      collectible.render(); // Call render for each planet
    });
    this.gameObjects.forEach((value) => {
      value.render();
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

  end(): void {}

  switchState(state: number) {
    this._state = state;
    switch (this._state) {
      case 1:
        this.start();
        break;
      case 2:
        this.end();
        break;
      default:
        this.init();
        break;
    }
  }

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
