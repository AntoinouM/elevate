import GameObject from './GameObject';

interface PointerPosition {
  x: number | undefined;
  y: number | undefined;
}

class Game {
  _state: number = 0 | 1 | 2;
  _canvas;
  _context;
  _gameObjects = new Map<string, GameObject>();
  _pointerPosition: PointerPosition;

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this._canvas = canvas;
    this._context = context;
    this._state = 0;
    this._pointerPosition = {
      x: undefined,
      y: undefined,
    };
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
  get pointerPosition() {
    return this._pointerPosition;
  }

  // SETTERS
  set pointerPosition(position: PointerPosition) {
    this._pointerPosition = position;
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
    // trigger mouse detection
    window.addEventListener('mousemove', this.handlePointer);
    window.addEventListener('touchmove', this.handlePointer);

    this.gameObjects.forEach((value) => {
      value.init(this.context);
    });
  }

  update(): void {}

  render(): void {}

  start(): void {}

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

  handlePointer(event: MouseEvent | TouchEvent) {
    if (event.type.includes('touch')) {
      // TypeScript now knows this is a TouchEvent
      const touchEvent = event as TouchEvent;
      this.pointerPosition = {
        x: touchEvent.touches[0].pageX,
        y: touchEvent.touches[0].pageY,
      };
    } else if (event.type.includes('mouse')) {
      // TypeScript now knows this is a MouseEvent
      const mouseEvent = event as MouseEvent;
      this.pointerPosition = {
        x: mouseEvent.clientX,
        y: mouseEvent.clientY,
      };
    }
  }
}

export default Game;
