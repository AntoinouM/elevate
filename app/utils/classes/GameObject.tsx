import { v4 as uuidv4 } from 'uuid';
import Game from './Game';

interface Position {
  x: number | undefined;
  y: number | undefined;
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
    this._position = { x: undefined, y: undefined };
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
