import Player from './Player';
import Planet from './Planet';
import { Idle, Rise, Walk, Fly } from './PlayerStates.tsx/PlayerStates';
import { GameObject } from './GameObject';
import Explosion from './Explosion';

class Game {
  _state: number = 0 | 1 | 2;
  _canvas;
  _context;
  _lastTickTimestamp = 0;
  _collectiblesPool: Planet[];
  _activeExplosions = new Map<string, Explosion>();
  _config;
  _lastRenderTime: number;
  _player: Player;
  _keys: Set<string>;
  #gameObjects = new Map<string, GameObject>();

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
        diameter: 24,
        maximum: 12,
        fallingSpeed: 3,
        planetTimer: 0,
        planetSpawnInterval: Math.random() * 2000 + 2000,
      },
      fps: 60,
      fpsInterval: 1000 / 60,
      ground: this.canvas.clientHeight - 100 / 1.5,
      gravity: -0.001,
      impulseForce: 0.62,
      debug: true,
    };
    this._lastRenderTime = performance.now(); // Initialize the last render timestamp
    this._player = new Player(
      this.config.HERO.width,
      this.config.HERO.height,
      this.canvas.clientWidth * 0.5,
      this.config.ground,
      this
    );
    this.#gameObjects.set(this._player.id, this._player);
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
  get activeExplosions() {
    return this._activeExplosions;
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
        this.config.PLANET.diameter,
        this.config.PLANET.diameter,
        this
      );
      this.collectiblesPool.push(planet);
      this.#gameObjects.set(planet.id, planet);
    }
  }

  getFirstFreePlanetFromPool() {
    for (let i: number = 0; i < this.collectiblesPool.length; i++) {
      if (this.collectiblesPool[i].free) return this.collectiblesPool[i];
    }
  }

  update(timeStamp: number): void {
    this.#gameObjects.forEach((obj) => {
      obj.update(timeStamp);
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

    // check for collision
    this.collectiblesPool.forEach((planet) => {
      if (planet.free || !this.objectAreColliding(this.player, planet)) return;
      let explosion = new Explosion(
        planet.position.x,
        planet.position.y,
        planet.width,
        planet.height,
        this
      );
      this.#gameObjects.set(explosion.id, explosion);
      planet.reset();
    });
  }

  render(): void {
    this.context.clearRect(
      0,
      0,
      this.canvas.clientWidth,
      this.canvas.clientHeight
    );
    // Ensure you render the collectibles
    this.#gameObjects.forEach((obj) => {
      obj.render();
    });

    // debug mode
    if (!this.config.debug) return;
    this.#gameObjects.forEach((object) => {
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

  end(): void {}

  objectAreColliding(object1: GameObject, object2: GameObject): boolean {
    let bbA = object1.getBoundingBox();
    let bbB = object2.getBoundingBox();

    if (
      bbA.x < bbB.x + bbB.width &&
      bbA.x + bbA.width > bbB.x &&
      bbA.y < bbB.y + bbB.height &&
      bbA.y + bbA.height > bbB.y
    ) {
      // collision happened
      return true;
    } else return false;
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
