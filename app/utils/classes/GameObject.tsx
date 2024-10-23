import { v4 as uuidv4 } from 'uuid';
import Game from './Game';

interface Position {
  x: number;
  y: number;
}

class GameObject {
  _width: number = 0;
  _height: number = 0;
  _position: Position = { x: 0, y: 0 };
  _id;
  protected game;

  constructor(width: number, height: number, x: number, y: number, game: Game) {
    this._width = width;
    this._height = height;
    this._position.x = x;
    this._position.y = y;
    this._id = uuidv4();
    this.game = game;
  }

  // GETTERS
  protected get width() {
    return this._width;
  }
  protected get height() {
    return this._height;
  }
  protected get position() {
    return this._position;
  }
  public get id() {
    return this._id;
  }

  init(): void {}
  update(timeStamp: number): void {}
  render(): void {}

  draw(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {}

  getBoundingBox(): object {
    return {
      position: {
        x: this.position.x,
        y: this.position.y,
        width: this.width,
        height: this.height,
      },
    };
  }
}

export default GameObject;
