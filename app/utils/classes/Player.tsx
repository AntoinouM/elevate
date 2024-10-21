import GameObject from './GameObject';

class Player extends GameObject {
  constructor(width: number, height: number, x: number, y: number) {
    super(width, height, x, y);
  }
}

export default Player;
