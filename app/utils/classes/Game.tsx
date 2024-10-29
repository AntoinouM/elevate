import Player from './Player';
import Planet from './Planet';
import { GameObject } from './GameObject';
import Explosion from './Explosion';
import { Dust } from './Particule';
import ParticlesContainer from './ParticlesContainer';
import { CONFIG, poolFunctions, randomNumberBetween } from '../utils';

interface Freeable {
  free: boolean;
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
  _cloudContainer1: ParticlesContainer;
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
    this._config = CONFIG;
    this._config.ground = this.canvas.clientHeight - 100 / 1.5;
    this._lastRenderTime = performance.now(); // Initialize the last render timestamp
    this._player = this.createPlayer();
    this._cloudContainer1 = this.createCloud();
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
    this.#gameObjects.set(this._player.id, this._player);
    this.#gameObjects.set(this._cloudContainer1.id, this._cloudContainer1);
    this.createPools();
    this.start();
  }

  update(timeStamp: number): void {
    this.setDebugMode();

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
    this.createPlanetObjects(timeStamp);

    // check for collision
    this.collectiblesPool.forEach((planet) => {
      if (planet.free || !this.objectAreColliding(this.player, planet)) return;
      const explosion = poolFunctions.getFirstFreeElementFromPool<Explosion>(
        this.explosionsPool
      );
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
    this.backgroundContext.clearRect(
      0,
      0,
      this.canvas.clientWidth,
      this.canvas.clientHeight
    );

    // render particules
    this.particles.forEach((dust) => {
      dust.draw(this.context);
    });

    // draw ground
    this.context.fillStyle = '#252839';
    this.context.fillRect(
      0,
      this.config.ground,
      this.canvas.clientWidth,
      this.canvas.clientHeight - this.config.ground
    );
    this.context.strokeStyle = '#f5f5f5';
    this.context.beginPath();
    this.context.moveTo(0, this.config.ground);
    this.context.lineTo(this.canvas.clientWidth, this.config.ground);
    this.context.stroke();

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

  createPlanetObjects(timeStamp: number) {
    if (this.config.PLANET.planetTimer > this.config.PLANET.planetMaxInterval) {
      const planet = poolFunctions.getFirstFreeElementFromPool<Planet>(
        this.collectiblesPool
      );
      planet?.activate();
      this.config.PLANET.planetTimer = 0;
    } else {
      this.config.PLANET.planetTimer += timeStamp;
    }
  }

  createPools() {
    poolFunctions.createPool(
      this.config.PLANET.maximum,
      Planet,
      this.collectiblesPool,
      this.#gameObjects,
      this.config.PLANET.diameter,
      this.config.PLANET.diameter,
      this
    );
    poolFunctions.createPool(
      this.config.PLANET.maximum,
      Explosion,
      this.explosionsPool,
      this.#gameObjects,
      this.config.PLANET.diameter,
      this.config.PLANET.diameter,
      this
    );
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

  createCloud() {
    const width = this._backgroundCanvas.clientWidth * 0.3;
    const height = this._backgroundCanvas.clientHeight * 0.3;
    const minX = 0 + width * 0.5;
    const maxX = this._backgroundCanvas.clientWidth - width;
    const minY = 0 + height * 0.5;
    const maxY = this._backgroundCanvas.clientHeight - height;

    return new ParticlesContainer(
      width,
      height,
      randomNumberBetween(minX, maxX),
      randomNumberBetween(minY, maxY),
      75,
      this
    );
  }

  setDebugMode() {
    if (this.keys.has('d')) {
      this.config.debug = true;
    } else {
      this.config.debug = false;
    }
  }
}

export default Game;
export type { Freeable };
