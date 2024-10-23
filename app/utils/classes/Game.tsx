import { time } from 'console';
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
  _collectiblesPool: GameObject[];
  #config;

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this._canvas = canvas;
    this._context = context;
    this._state = 0;
    this._collectiblesPool = [];
    this.#config = {
      HERO: {
        width: 50,
        height: 50,
        velocity: 0.02,
      },
      PLANET: {
        radius: 12,
      },
    };

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
  protected get config() {
    return this.#config;
  }

  // SETTERS
  set lastTickTimestamp(time: number) {
    this._lastTickTimestamp = time;
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
    this.gameObjects.get(id);
  }

  init(): void {
    const player = new Player(
      this.config.HERO.width,
      this.config.HERO.height,
      this.canvas.clientWidth / 2,
      600,
      this
    );
    const planet = new Planet(
      this.config.PLANET.radius,
      this.config.PLANET.radius,
      195,
      40,
      this
    );
    this.addObject(player);
    this.addObject(planet);
    this.start();

    this.gameObjects.forEach((value) => {
      value.init();
    });
  }

  update(timeStamp: number): void {
    this.gameObjects.forEach((value) => {
      value.update(timeStamp);
    });
  }

  render(): void {
    if (this._debug) {
      this.gameObjects.forEach((value) => {
        value.getBoundingBox();
      });
    }
    this.gameObjects.forEach((value) => {
      value.render();
    });
  }

  start(): void {
    // kick off first iteration of render()
    this.lastTickTimestamp = performance.now();
    requestAnimationFrame(this.gameLoop);
  }

  end(): void {}

  gameLoop = (): void => {
    const timePassedSinceLastRender =
      performance.now() - this.lastTickTimestamp;

    this.update(timePassedSinceLastRender);
    this.render();
    this.lastTickTimestamp = performance.now();
    console.log(timePassedSinceLastRender);

    // call next iteration
    requestAnimationFrame(this.gameLoop);
  };

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
}

export default Game;
