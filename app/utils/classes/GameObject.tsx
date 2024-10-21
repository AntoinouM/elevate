interface Position {
  x: number;
  y: number;
}

class GameObject {
  width: number = 0;
  height: number = 0;
  position: Position = { x: 0, y: 0 };

  constructor(width: number, height: number, x: number, y: number) {
    this.width = width;
    this.height = height;
    this.position.x = x;
    this.position.y = y;
  }

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
