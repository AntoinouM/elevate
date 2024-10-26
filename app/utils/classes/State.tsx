import Game, { GameConfig } from './Game';
import { Dust } from './Particule';

const states = {
  IDLE: 0,
  WALK: 1,
  RISE: 2,
  FLY: 3,
};

interface Position {
  x: number;
  y: number;
}

class State {
  _state: string;
  _game: Game;

  constructor(state: string, game: Game) {
    this._state = state;
    this._game = game;
  }

  // GETTER
  get state() {
    return this._state;
  }
  get game() {
    return this._game;
  }

  // SETTER
  set state(state: string) {
    this._state = state;
  }
}

class Idle extends State {
  constructor(game: Game) {
    super('IDLE', game);
  }

  enter() {
    this.game.player.frameY = 0;
    this.game.player._imageOptions.maxFrame = 4;
    this.game.player._imageOptions.fps = 4;
  }
  handleStateChange(position: Position, config: GameConfig) {
    if (this.game.player.pointerDistance > 2 && position.y === config.ground) {
      this.game.player.setState(states.WALK);
    } else if (this.game.player.verticalForce < 0) {
      this.game.player.setState(states.RISE);
    }
  }
}

class Walk extends State {
  constructor(game: Game) {
    super('WALK', game);
  }

  enter() {
    this.game.player.frameY = 1;
    this.game.player._imageOptions.maxFrame = 6;
    this.game.player._imageOptions.fps = 8;
  }
  handleStateChange(position: Position, config: GameConfig) {
    if (this.game.player.pointerDistance <= 2 && position.y === config.ground) {
      this.game.player.setState(states.IDLE);
    } else if (this.game.player.verticalForce < 0) {
      this.game.player.setState(states.RISE);
    }
  }
}

class Rise extends State {
  constructor(game: Game) {
    super('RISE', game);
  }

  enter() {
    this.game.player.frameY = 2;
    this.game.player._imageOptions.maxFrame = 8;
    this.game.player._imageOptions.fps = 6;
  }
  /* eslint-disable @typescript-eslint/no-unused-vars */
  handleStateChange(position: Position, config: GameConfig) {
    this.game.particles.push(
      new Dust(
        this.game,
        this.game.player.position.x,
        this.game.player.position.y
      )
    );
    if (this.game.player.verticalForce >= 0)
      this.game.player.setState(states.FLY);
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

class Fly extends State {
  constructor(game: Game) {
    super('FLY', game);
  }

  enter() {
    this.game.player.frameY = 3;
    this.game.player._imageOptions.maxFrame = 4;
    this.game.player._imageOptions.fps = 8;
  }
  handleStateChange(position: Position, config: GameConfig) {
    if (position.y < config.ground) {
      console.log(this.game.player.verticalForce);
      if (this.game.player.verticalForce < 0)
        this.game.player.setState(states.RISE);
    } else if (position.y === config.ground) {
      if (this.game.player.pointerDistance > 2) {
        this.game.player.setState(states.WALK);
      } else {
        this.game.player.setState(states.IDLE);
      }
    }
  }
}

export { State, Idle, Walk, Rise, Fly, states };
