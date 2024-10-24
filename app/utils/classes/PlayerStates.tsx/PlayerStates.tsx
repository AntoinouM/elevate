import Player from '../Player';

class Idle extends Player {
  start() {}
  update() {}
}

class Walk extends Player {
  start() {}
}

class Rise extends Player {
  start() {}
}

class Fly extends Player {
  start() {}
}

export { Idle, Walk, Rise, Fly };
