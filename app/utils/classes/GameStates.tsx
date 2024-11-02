import { poolFunctions, randomNumberBetween } from '../utils';
import Explosion from './Explosion';
import Game from './Game';
import { GameObject } from './GameObject';
import ParticlesContainer from './ParticlesContainer';
import { Dust } from './Particule';
import Planet from './Planet';
import Player from './Player';

interface Freeable {
  free: boolean;
}

const states = {
  BEFORE: 0,
  ONGOING: 1,
  ENDED: 2,
};

class GameStates {
  _state: string;
  _game: Game;

  constructor(state: string, game: Game) {
    this._state = state;
    this._game = game;
  }

  // GETTERS
  get state() {
    return this._state;
  }
  get game() {
    return this._game;
  }

  // SETTERS
  set state(state: string) {
    this._state = state;
  }

  update(timeStamp: number): void {}

  render(): void {}
}

class GameBefore extends GameStates {
  constructor(game: Game) {
    super('BEFORE', game);
  }

  start() {}
}

class GameOnGoing extends GameStates {
  _collectiblesPool: Planet[];
  _explosionsPool: Explosion[];
  _particles: Dust[];
  _cloudContainer1: ParticlesContainer;
  #gameObjects = new Map<string, GameObject>();

  constructor(game: Game) {
    super('ONGOING', game);

    this._collectiblesPool = [];
    this._explosionsPool = [];
    this._particles = [];
    this._cloudContainer1 = this.createCloud();

    this.init();
  }

  get collectiblesPool() {
    return this._collectiblesPool;
  }
  get explosionsPool() {
    return this._explosionsPool;
  }
  get particles() {
    return this._particles;
  }
  private get gameObjects() {
    return this.#gameObjects;
  }

  start() {}

  init() {
    this.gameObjects.set(this.game.player.id, this.game.player);
    this.gameObjects.set(this._cloudContainer1.id, this._cloudContainer1);
    this.createPools();
  }

  update(timeStamp: number) {
    // update game objects
    this.updateGameObjects(this.gameObjects, timeStamp);

    // update particles
    this.game.player.particles.forEach((dust) => {
      dust.update(timeStamp);
    });

    // check for collision
    this.collectiblesPool.forEach((planet) => {
      if (planet.free || !this.objectAreColliding(this.game.player, planet))
        return;
      const explosion = poolFunctions.getFirstFreeElementFromPool<Explosion>(
        this.explosionsPool
      );
      if (explosion) {
        explosion.activate(planet.position.x, planet.position.y);
        this.#gameObjects.set(explosion.id, explosion);
      }
      this.game.player.verticalForce = -this.game.config.impulseForce;
      planet.reset();
    });

    // create periodically planets
    this.createPlanetObjects(timeStamp);
  }

  render() {
    // render particles
    this.game.player.particles.forEach((dust) => {
      dust.draw(this.game.context);
    });

    this.gameObjects.forEach((obj) => {
      if (obj instanceof Planet || obj instanceof Explosion) {
        if (obj.free) {
          return;
        } else {
          obj.render();
        }
      } else {
        obj.render();
      }
    });
  }

  checkForCollisions(player: Player, objectPool: Planet[]) {
    objectPool.forEach((planet) => {
      if (planet.free || !this.objectAreColliding(player, planet)) return;
      this.generateExplosion(planet);
      this.addVerticalForceToPlayer(player);
      planet.reset();
    });
  }

  addVerticalForceToPlayer(player: Player) {
    player.verticalForce = -this.game.config.impulseForce;
  }

  generateExplosion(planet: Planet) {
    const explosion = poolFunctions.getFirstFreeElementFromPool<Explosion>(
      this.explosionsPool
    );
    if (explosion) {
      explosion.activate(planet.position.x, planet.position.y);
      this.#gameObjects.set(explosion.id, explosion);
    }
  }

  updateGameObjects(
    gameObjectsMap: Map<string, GameObject>,
    timeStamp: number
  ) {
    gameObjectsMap.forEach((obj) => {
      if (obj instanceof Planet || obj instanceof Explosion) {
        if (obj.free) {
          return;
        } else {
          obj.update(timeStamp);
        }
      } else {
        obj.update(timeStamp);
      }
    });

    const handleObjectFromPool = (object: Planet | Explosion): void => {};

    const isObjectFromPool = (object: GameObject): boolean => {
      if (Object.hasOwn(object, '_free')) {
        return true;
      } else {
        return false;
      }
    };
  }

  objectAreColliding(object1: GameObject, object2: GameObject): boolean {
    const bbA = object1.getBoundingBox();
    const bbB = object2.getBoundingBox();

    if (
      bbA.x < bbB.x + bbB.width &&
      bbA.x + bbA.width > bbB.x &&
      bbA.y < bbB.y + bbB.height &&
      bbA.y + bbA.height > bbB.y
    ) {
      // collision happened
      return true;
    } else return false;
  }

  createPlanetObjects(timeStamp: number) {
    if (
      this.game.config.PLANET.planetTimer >
      this.game.config.PLANET.planetMaxInterval
    ) {
      const planet = poolFunctions.getFirstFreeElementFromPool<Planet>(
        this.collectiblesPool
      );
      planet?.activate();
      this.game.config.PLANET.planetTimer = 0;
    } else {
      this.game.config.PLANET.planetTimer += timeStamp;
    }
  }

  createCloud() {
    const width = this.game.backgroundCanvas.clientWidth * 0.3;
    const height = this.game.backgroundCanvas.clientHeight * 0.3;
    const minX = 0 + width * 0.5;
    const maxX = this.game.backgroundCanvas.clientWidth - width;
    const minY = 0 + height * 0.5;
    const maxY = this.game.backgroundCanvas.clientHeight - height;

    return new ParticlesContainer(
      width,
      height,
      randomNumberBetween(minX, maxX),
      randomNumberBetween(minY, maxY),
      75,
      this.game
    );
  }

  createPools() {
    poolFunctions.createPool(
      this.game.config.PLANET.maximum,
      Planet,
      this.collectiblesPool,
      this.gameObjects,
      this.game.config.PLANET.diameter,
      this.game.config.PLANET.diameter,
      this.game
    );
    poolFunctions.createPool(
      this.game.config.PLANET.maximum,
      Explosion,
      this.explosionsPool,
      this.gameObjects,
      this.game.config.PLANET.diameter,
      this.game.config.PLANET.diameter,
      this.game
    );
  }
}

class GameEnded extends GameStates {
  constructor(game: Game) {
    super('ENDED', game);
  }

  start() {}
}

export { GameBefore, GameEnded, GameOnGoing };
