import Player from './Player';
import Planet from './Planet';
import { GameObject } from './GameObject';
import Explosion from './Explosion';
import { Dust } from './Particule';

interface GameConfig {
  HERO: {
    width: number;
    height: number;
    velocity: number;
  };
  PLANET: {
    diameter: number;
    maximum: number;
    fallingSpeed: number;
    planetTimer: number;
    planetMinInterval: number;
    planetMaxInterval: number;
  };
  fps: number;
  fpsInterval: number;
  ground: number;
  gravity: number;
  impulseForce: number;
  debug: boolean;
}

class Game {
  _state: number = 0 | 1 | 2;
  _canvas;
  _context;
  _backgroundCanvas;
  _backgroundContext;
  _lastTickTimestamp = 0;
  _collectiblesPool: Planet[];
  _explosionsPool: Explosion[];
  _particles: Dust[];
  _config;
  _lastRenderTime: number;
  _player: Player;
  _keys: Set<string>;
  #gameObjects = new Map<string, GameObject>();

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
    this._state = 0;
    this._collectiblesPool = [];
    this._explosionsPool = [];
    this._particles = [];
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
        fallingSpeed: 0.08,
        planetTimer: 0,
        planetMinInterval: 2000,
        planetMaxInterval: 800,
      },
      fps: 60,
      fpsInterval: 1000 / 60,
      ground: this.canvas.clientHeight - 100 / 1.5,
      gravity: -0.001,
      impulseForce: 0.62,
      debug: false,
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
  get backgroundCanvas() {
    return this._backgroundCanvas;
  }
  get backgroundContext() {
    return this._backgroundContext;
  }
  get lastTickTimestamp() {
    return this._lastTickTimestamp;
  }
  get collectiblesPool() {
    return this._collectiblesPool;
  }
  get explosionsPool() {
    return this._explosionsPool;
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
  get particles() {
    return this._particles;
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
    this.createExplosionsPool(this.config.PLANET.maximum);
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

  createExplosionsPool(max: number) {
    for (let i = 0; i < max; i++) {
      const explosion = new Explosion(
        0,
        0,
        this.config.PLANET.diameter,
        this.config.PLANET.diameter,
        this
      );
      this.explosionsPool.push(explosion);
      this.#gameObjects.set(explosion.id, explosion);
    }
  }

  getFirstFreePlanetFromPool() {
    for (let i: number = 0; i < this.collectiblesPool.length; i++) {
      if (this.collectiblesPool[i].free) return this.collectiblesPool[i];
    }
  }

  getFirstFreeExplosionFromPool() {
    for (let i: number = 0; i < this.explosionsPool.length; i++) {
      if (this.explosionsPool[i].free) return this.explosionsPool[i];
    }
  }

  update(timeStamp: number): void {
    this.#gameObjects.forEach((obj) => {
      if (obj instanceof Planet || obj instanceof Explosion) {
        if (obj.free) {
          return;
        } else {
          obj.update(timeStamp);
        }
      } else {
        obj.update(timeStamp);
      }
    });

    // update particules
    this.particles.forEach((dust, index) => {
      dust.update(timeStamp);
      if (!dust.isActive) this.particles.splice(index, 1);
    });

    // create periodically planets
    if (this.config.PLANET.planetTimer > this.config.PLANET.planetMaxInterval) {
      const planet = this.getFirstFreePlanetFromPool();
      planet?.activate();
      this.config.PLANET.planetTimer = 0;
    } else {
      this.config.PLANET.planetTimer += timeStamp;
    }

    // check for collision
    this.collectiblesPool.forEach((planet) => {
      if (planet.free || !this.objectAreColliding(this.player, planet)) return;
      const explosion = this.getFirstFreeExplosionFromPool();
      if (explosion) {
        explosion.activate(planet.position.x, planet.position.y);
        this.#gameObjects.set(explosion.id, explosion);
      }
      this.player.verticalForce = -this.config.impulseForce;
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

    // render background canvas

    // render particules
    this.particles.forEach((dust) => {
      dust.draw(this.context);
    });

    // Ensure you render the collectibles
    this.#gameObjects.forEach((obj) => {
      if (obj instanceof Planet || obj instanceof Explosion) {
        if (obj.free) {
          return;
        } else {
          obj.render();
        }
      } else {
        obj.render();
      }
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
    const bbA = object1.getBoundingBox();
    const bbB = object2.getBoundingBox();

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
export type { GameConfig };
