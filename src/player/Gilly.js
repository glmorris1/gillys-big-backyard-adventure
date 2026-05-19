import { emitDust, emitSparks } from '../effects/juice.js';

export class Gilly {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'gilly-run-0');
    this.sprite.setSize(62, 54).setOffset(20, 24).setDepth(15);
    this.sprite.setCollideWorldBounds(false);
    this.jumps = 0;
    this.maxJumps = 2;
    this.flipped = false;
    this.runTimer = 0;
  }

  update(time, grounded, isGravityFlipped) {
    this.flipped = isGravityFlipped;
    this.sprite.setFlipY(isGravityFlipped);
    if (grounded) this.jumps = 0;
    if (!grounded) {
      this.sprite.setTexture('gilly-jump');
      this.sprite.rotation += 0.16 * (isGravityFlipped ? -1 : 1);
      return;
    }
    this.sprite.rotation *= 0.8;
    if (time - this.runTimer > 90) {
      this.runTimer = time;
      this.sprite.setTexture(this.sprite.texture.key === 'gilly-run-0' ? 'gilly-run-1' : 'gilly-run-0');
    }
  }

  jump(power = 600) {
    if (this.jumps >= this.maxJumps) return false;
    this.sprite.setVelocityY(this.flipped ? power : -power);
    this.jumps += 1;
    emitDust(this.scene, this.sprite.x - 16, this.flipped ? this.sprite.y - 30 : this.sprite.y + 32);
    return true;
  }

  bounce(power = 850) {
    this.sprite.setVelocityY(this.flipped ? power : -power);
    this.jumps = 1;
    emitSparks(this.scene, this.sprite.x, this.sprite.y, 0x39f6ff);
  }

  crash() {
    this.sprite.setTexture('gilly-crash');
    this.sprite.setAngularVelocity(360);
  }
}
