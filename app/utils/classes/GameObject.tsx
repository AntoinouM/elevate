import { v4 as uuidv4 } from 'uuid';
import Game from './Game';

interface Position {
  x: number;
  y: number;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

class GameObject {
  _width: number;
  _height: number;
  _position: Position;
  _id;
  protected game;

  constructor(width: number, height: number, game: Game) {
    this._width = width;
    this._height = height;
    this._id = uuidv4();
    this.game = game;
    this._position = { x: 0, y: 0 };
  }

  // GETTERS
  public get width() {
    return this._width;
  }
  public get height() {
    return this._height;
  }
  public get position() {
    return this._position;
  }
  public get id() {
    return this._id;
  }

  init(): void {}
  /* eslint-disable @typescript-eslint/no-unused-vars */
  update(timeStamp: number): void {
    /* timeStamp*/
  }
  render(): void {}

  draw(
    context: CanvasRenderingContext2D,
    image: CanvasImageSource,
    sx: number,
    sy: number,
    sWidth: number,
    sHeight: number,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {}
  /* eslint-enable @typescript-eslint/no-unused-vars */

  getBoundingBox(): BoundingBox {
    return {
      x: this.position.x - this.width * 0.5,
      y: this.position.y - this.height * 0.5,
      width: this.width,
      height: this.height,
    };
  }

  drawBoundingBox(context: CanvasRenderingContext2D): void {
    const bb = this.getBoundingBox();
    context.strokeStyle = 'pink';
    context.lineWidth = 1.5;
    context.strokeRect(bb.x, bb.y, bb.width, bb.height);

    context.fillStyle = 'red';
    context.fillRect(bb.x, bb.y, 5, 5);

    context.fillStyle = 'yellow';
    context.fillRect(this.position.x, this.position.y, 5, 5);
  }
}

export { GameObject };
export type { Position, BoundingBox };
