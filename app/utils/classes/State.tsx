import Game from './Game';
import { GameConfig } from '../utils';
import { Dust } from './Particule';
import { PlayerState } from '../../models/player.model';

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
  _state: PlayerState;
  _game: Game;

  constructor(state: PlayerState, game: Game) {
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
  set state(state: PlayerState) {
    this._state = state;
  }
}

class Idle extends State {
  constructor(game: Game) {
    super(PlayerState.IDLE, game);
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
    super(PlayerState.WALK, game);
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
    super(PlayerState.RISE, game);
  }

  enter() {
    this.game.player.frameY = 2;
    this.game.player._imageOptions.maxFrame = 8;
    this.game.player._imageOptions.fps = 6;
  }
  /* eslint-disable @typescript-eslint/no-unused-vars */
  handleStateChange(position: Position, config: GameConfig) {
    this.game.player.particles.push(
      new Dust(
        this.game,
        this.game.player.position.x,
        this.game.player.position.y,
        'rgba(255,255,255,0.5)',
      ),
    );
    if (this.game.player.verticalForce >= 0)
      this.game.player.setState(states.FLY);
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

class Fly extends State {
  constructor(game: Game) {
    super(PlayerState.FLY, game);
  }

  enter() {
    this.game.player.frameY = 3;
    this.game.player._imageOptions.maxFrame = 4;
    this.game.player._imageOptions.fps = 8;
  }
  handleStateChange(position: Position, config: GameConfig) {
    // Add a small threshold to prevent flickering at apex of jump
    const isRising = this.game.player.verticalForce < -0.01;
    const isFalling = this.game.player.verticalForce > 0.01;

    // Only transition to ground states if definitely on ground AND falling/stable
    if (position.y === config.ground && !isRising) {
      if (this.game.player.pointerDistance > 2) {
        this.game.player.setState(states.WALK);
      } else {
        this.game.player.setState(states.IDLE);
      }
    } else if (position.y < config.ground && isRising) {
      // Only switch to RISE if definitely going up
      this.game.player.setState(states.RISE);
    }
    // If at apex (verticalForce near 0), stay in FLY state
  }
}

export { State, Idle, Walk, Rise, Fly, states };
