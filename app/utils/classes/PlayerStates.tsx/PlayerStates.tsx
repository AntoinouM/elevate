import Player from '../Player';

class Idle extends Player {
  start() {}
  update(timeStamp: number) {
    super.update(timeStamp);
  }
}

class Walk extends Player {
  start() {}
  update(timeStamp: number) {
    super.update(timeStamp);
  }
}

class Rise extends Player {
  start() {}
  update(timeStamp: number) {
    super.update(timeStamp);
  }
}

class Fly extends Player {
  start() {}
  update(timeStamp: number) {
    super.update(timeStamp);
  }
}

export { Idle, Walk, Rise, Fly };
