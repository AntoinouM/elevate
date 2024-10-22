import GameObject from './GameObject';

class Game {
  _state: number = 0 | 1 | 2;
  _canvas;
  _context;
  _gameObjects = new Map<string, GameObject>();
  _lastTickTimestamp = 0;

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this._canvas = canvas;
    this._context = context;
    this._state = 0;
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
    this.gameObjects.forEach((value) => {
      value.init(this.context);
    });
  }

  update(timeStamp: number): void {
    this.gameObjects.forEach((value) => {
      value.update(timeStamp);
    });
  }

  render(): void {}

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
    // render();

    this.lastTickTimestamp = performance.now();

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
