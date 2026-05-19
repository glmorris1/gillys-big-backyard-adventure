import Phaser from 'phaser';
import { createTextures } from '../assets/createTextures.js';
import { SynthAudio } from '../audio/synthAudio.js';
import { emitDust, emitSparks, confetti } from '../effects/juice.js';
import { LEVELS } from '../levels/levelData.js';
import { Gilly } from '../player/Gilly.js';
import { saveRun } from '../utilities/storage.js';

const groundY = 540;

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.finished = false;
    this.failed = false;
    this.gravityFlipped = false;
    this.speedMultiplier = 1;
  }

  init(data = {}) {
    this.level = data.level ?? LEVELS[0];
    this.settings = data.settings ?? { sound: true, jumpButton: false };
    this.onExit = data.onExit;
  }

  create() {
    createTextures(this);
    this.audio = new SynthAudio(this.settings.sound);
    this.finished = false;
    this.failed = false;
    this.gravityFlipped = false;
    this.speedMultiplier = 1;
    this.physics.world.gravity.y = this.level.gravity;

    this.buildWorld();
    this.gilly = new Gilly(this, 170, groundY - 80);
    this.physics.add.collider(this.gilly.sprite, this.ground);
    this.physics.add.collider(this.gilly.sprite, this.platforms);
    this.physics.add.overlap(this.gilly.sprite, this.pads, this.hitPad, null, this);
    this.physics.add.overlap(this.gilly.sprite, this.switches, this.hitSwitch, null, this);
    this.physics.add.overlap(this.gilly.sprite, this.hazards, this.hitHazard, null, this);
    this.physics.add.overlap(this.gilly.sprite, this.finishLine, this.win, null, this);

    this.camera = this.cameras.main;
    this.camera.setBounds(0, 0, this.level.distance + 900, this.scale.height);
    this.camera.startFollow(this.gilly.sprite, false, 1, 0.12, -220, 80);

    this.makeHud();
    this.makeControls();
    this.audio.startMusic(this.level);
    this.time.delayedCall(450, () => this.showToast(`${this.level.name}: ${this.level.vibe}`));
  }

  buildWorld() {
    const height = this.scale.height;
    this.add.rectangle(0, 0, this.level.distance + 1000, height, Phaser.Display.Color.HexStringToColor(this.level.palette.sky).color)
      .setOrigin(0)
      .setScrollFactor(0);
    this.parallaxFar = this.add.tileSprite(0, height - 350, this.scale.width, 260, 'spark')
      .setOrigin(0)
      .setAlpha(0.12)
      .setTint(Phaser.Display.Color.HexStringToColor(this.level.palette.horizon).color)
      .setScrollFactor(0);
    this.parallaxMid = this.add.group();
    for (let x = 180; x < this.level.distance + 900; x += 310) {
      const mound = this.add.ellipse(x, groundY - 40 - Math.random() * 70, 180, 70, Phaser.Display.Color.HexStringToColor(this.level.palette.soft).color, 0.7)
        .setDepth(1);
      this.parallaxMid.add(mound);
    }

    this.ground = this.physics.add.staticGroup();
    for (let x = 0; x < this.level.distance + 1000; x += 96) {
      const tile = this.ground.create(x + 48, groundY + 24, 'ground-tile');
      tile.setTint(Phaser.Display.Color.HexStringToColor(this.level.palette.ground).color);
      tile.refreshBody();
    }

    this.platforms = this.physics.add.group({ allowGravity: false, immovable: true });
    this.level.platforms?.forEach((platform) => {
      const sprite = this.platforms.create(platform.x, platform.y, 'platform');
      sprite.displayWidth = platform.w;
      sprite.displayHeight = platform.h;
      sprite.refreshBody();
      sprite.baseY = platform.y;
      sprite.move = platform.move ?? 0;
    });

    this.pads = this.physics.add.staticGroup();
    this.level.pads?.forEach((pad) => {
      const sprite = this.pads.create(pad.x, pad.y, 'bounce-pad');
      sprite.power = pad.power;
      sprite.refreshBody();
      this.tweens.add({ targets: sprite, scaleY: 1.22, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });

    this.switches = this.physics.add.staticGroup();
    this.level.switches?.forEach((entry) => {
      const key = entry.kind === 'gravity' ? 'gravity-orb' : entry.kind === 'speed' ? 'speed-pad' : 'wave';
      const y = entry.kind === 'gravity' ? groundY - 132 : groundY - 22;
      const sprite = this.switches.create(entry.x, y, key);
      sprite.entry = entry;
      sprite.refreshBody();
      this.tweens.add({ targets: sprite, angle: entry.kind === 'gravity' ? 360 : 0, scale: 1.12, duration: 700, yoyo: true, repeat: -1 });
    });

    this.hazards = this.physics.add.group({ allowGravity: false, immovable: true });
    this.level.obstacles?.forEach((obstacle) => this.createHazard(obstacle));

    this.finishLine = this.physics.add.staticImage(this.level.distance, groundY - 105, 'speed-pad')
      .setDisplaySize(40, 210)
      .setTint(0xffffff);
    this.finishLine.refreshBody();
    this.add.text(this.level.distance - 70, groundY - 250, 'FINISH', {
      fontFamily: 'Trebuchet MS, Arial',
      fontSize: '30px',
      color: '#ffffff',
      stroke: '#1b1b1b',
      strokeThickness: 6,
    }).setDepth(20);

    this.decorate();
  }

  createHazard(obstacle) {
    const keyMap = {
      soccer: 'soccer',
      flyingSoccer: 'soccer',
      mud: 'mud',
      chicken: 'obstacle-box',
      sprinkler: 'wave',
      nest: 'obstacle-box',
      fallingNest: 'obstacle-box',
      branchNest: 'platform',
      motherBird: 'mother-bird',
      rock: 'rock',
      blockyKid: 'obstacle-box',
      leafStorm: 'wave',
      speaker: 'obstacle-box',
      musicWave: 'wave',
      guitarString: 'laser',
      guitarSolo: 'guitar-solo',
      goKart: 'obstacle-box',
      conveyor: 'speed-pad',
      printerArm: 'laser',
      karateKick: 'obstacle-box',
      fallingPrint: 'obstacle-box',
      karateBoss: 'karate-boss',
      rollingPin: 'obstacle-box',
      cupcake: 'cupcake',
      doughPit: 'mud',
      flourBurst: 'wave',
      cakeCollapse: 'obstacle-box',
      debbieBoss: 'debbie-boss',
      treasureTrap: 'obstacle-box',
      cartoonRocket: 'rocket',
      laser: 'laser',
      fallingMetal: 'obstacle-box',
      satellite: 'obstacle-box',
      clintBoss: 'clint-boss',
    };
    const sprite = this.hazards.create(obstacle.x, obstacle.y, keyMap[obstacle.type] ?? 'obstacle-box');
    sprite.type = obstacle.type;
    sprite.displayWidth = obstacle.w;
    sprite.displayHeight = obstacle.h;
    sprite.setTint(this.tintForType(obstacle.type));
    sprite.refreshBody();
    sprite.body.setSize(obstacle.w * 0.76, obstacle.h * 0.76, true);
    if (obstacle.type.includes('falling') || obstacle.type === 'fallingNest') sprite.dropBase = obstacle.y;
    if (['soccer', 'rock', 'rollingPin', 'goKart'].includes(obstacle.type)) sprite.spinSpeed = 2 + this.level.id * 0.3;
    if (['motherBird', 'guitarSolo', 'karateBoss', 'debbieBoss', 'clintBoss'].includes(obstacle.type)) {
      sprite.isBoss = true;
      this.tweens.add({ targets: sprite, y: obstacle.y - 80, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  tintForType(type) {
    if (type.includes('Bird') || type.includes('nest')) return 0xffce62;
    if (type.includes('music') || type.includes('guitar')) return 0x78fff4;
    if (type.includes('Rocket') || type.includes('laser')) return 0xff58ea;
    if (type.includes('cupcake') || type.includes('cake')) return 0xff98c7;
    if (type.includes('karate') || type.includes('goKart')) return 0xffad42;
    return Phaser.Display.Color.HexStringToColor(this.level.palette.danger).color;
  }

  decorate() {
    const accent = Phaser.Display.Color.HexStringToColor(this.level.palette.accent).color;
    for (let x = 120; x < this.level.distance; x += 240) {
      const label = this.level.decorations[x / 240 % this.level.decorations.length | 0] ?? 'flower';
      const decor = this.add.text(x, groundY - 82 - (x % 3) * 14, this.iconFor(label), {
        fontSize: `${34 + (x % 4) * 3}px`,
      }).setDepth(5).setAlpha(0.95);
      this.tweens.add({
        targets: decor,
        y: decor.y - 8,
        duration: 800 + (x % 5) * 100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      if (x % 480 === 0) {
        this.add.rectangle(x + 80, groundY - 18, 120, 12, accent).setDepth(4);
      }
    }
  }

  iconFor(label) {
    const icons = {
      fence: 'III',
      flowers: '* *',
      sprinkler: ')))',
      nest: '(())',
      trampoline: 'U',
      leaves: '~~~',
      blocks: '[]',
      speakers: ')))',
      tools: '<>',
      cakes: '###',
      gems: '<*>',
      rockets: '^',
    };
    return icons[label] ?? '*';
  }

  makeHud() {
    this.hud = this.add.container(0, 0).setDepth(100).setScrollFactor(0);
    this.progressBar = this.add.rectangle(24, 24, 1, 14, Phaser.Display.Color.HexStringToColor(this.level.palette.accent).color)
      .setOrigin(0, 0.5);
    const track = this.add.rectangle(24, 24, 220, 16, 0x111827, 0.35).setOrigin(0, 0.5);
    this.titleText = this.add.text(24, 46, `${this.level.name} | ${this.level.complete ? 'full run' : 'prototype chaos'}`, {
      fontFamily: 'Trebuchet MS, Arial',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#111111',
      strokeThickness: 4,
    });
    this.pauseButton = this.add.text(this.scale.width - 76, 20, 'II', {
      fontFamily: 'Trebuchet MS, Arial',
      fontSize: '26px',
      color: '#ffffff',
      backgroundColor: '#11182788',
      padding: { x: 14, y: 8 },
    }).setInteractive({ useHandCursor: true });
    this.pauseButton.on('pointerdown', () => this.togglePause());
    this.hud.add([track, this.progressBar, this.titleText, this.pauseButton]);
  }

  makeControls() {
    this.input.keyboard.addKeys('SPACE,UP,ESC');
    this.input.keyboard.on('keydown-SPACE', () => this.tryJump());
    this.input.keyboard.on('keydown-UP', () => this.tryJump());
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
    this.input.on('pointerdown', (pointer) => {
      if (this.failed || this.finished || this.scene.isPaused()) return;
      if (this.settings.jumpButton && pointer.x < this.scale.width - 135) return;
      this.tryJump();
    });
    if (this.settings.jumpButton) {
      this.jumpButton = this.add.text(this.scale.width - 116, this.scale.height - 98, 'JUMP', {
        fontFamily: 'Trebuchet MS, Arial',
        fontSize: '21px',
        color: '#111827',
        backgroundColor: '#ffffffcc',
        padding: { x: 22, y: 18 },
      }).setScrollFactor(0).setDepth(100).setInteractive({ useHandCursor: true });
      this.jumpButton.on('pointerdown', () => this.tryJump());
    }
  }

  tryJump() {
    if (this.gilly.jump()) {
      this.audio.jump();
    }
  }

  update(time, delta) {
    if (!this.gilly || this.finished || this.failed) return;
    const velocity = this.level.speed * this.speedMultiplier;
    this.gilly.sprite.setVelocityX(velocity);
    const onFloor = this.gravityFlipped ? this.gilly.sprite.body.blocked.up || this.gilly.sprite.body.touching.up : this.gilly.sprite.body.blocked.down || this.gilly.sprite.body.touching.down;
    this.gilly.update(time, onFloor, this.gravityFlipped);
    this.updateMovingPieces(time);
    this.updateHud();
    this.parallaxFar.tilePositionX = this.camera.scrollX * 0.2;
    if (this.gilly.sprite.y > this.scale.height + 180 || this.gilly.sprite.y < -220) this.die();
    if (this.level.bossStart && this.gilly.sprite.x > this.level.bossStart && !this.bossStarted) {
      this.bossStarted = true;
      this.camera.shake(350, 0.007);
      this.audio.blip(96, 0.25, 'sawtooth', 0.12);
      this.showToast('Boss nonsense incoming');
    }
  }

  updateMovingPieces(time) {
    this.platforms.children.iterate((sprite) => {
      if (!sprite) return;
      sprite.y = sprite.baseY + Math.sin(time / 480 + sprite.x) * sprite.move;
      sprite.refreshBody();
    });
    this.hazards.children.iterate((sprite) => {
      if (!sprite) return;
      if (sprite.spinSpeed) sprite.rotation += sprite.spinSpeed * 0.025;
      if (sprite.dropBase && Math.abs(sprite.x - this.gilly.sprite.x) < 360) {
        sprite.y = sprite.dropBase + Math.sin(time / 100) * 42 + 54;
        sprite.refreshBody();
      }
      if (sprite.type === 'musicWave' || sprite.type === 'laser') {
        sprite.scaleY = 0.8 + Math.sin(time / 120 + sprite.x) * 0.22;
        sprite.refreshBody();
      }
    });
  }

  updateHud() {
    const pct = Phaser.Math.Clamp(this.gilly.sprite.x / this.level.distance, 0, 1);
    this.progressBar.width = 220 * pct;
    if (this.pauseButton) this.pauseButton.x = this.scale.width - 76;
    if (this.jumpButton) {
      this.jumpButton.x = this.scale.width - 116;
      this.jumpButton.y = this.scale.height - 98;
    }
  }

  hitPad(player, pad) {
    this.gilly.bounce(pad.power);
    this.audio.bounce();
    pad.disableBody(true, false);
    this.time.delayedCall(700, () => pad.enableBody(false, pad.x, pad.y, true, true));
  }

  hitSwitch(player, sprite) {
    const entry = sprite.entry;
    sprite.disableBody(true, false);
    if (entry.kind === 'speed') {
      this.speedMultiplier = entry.amount;
      this.camera.shake(180, 0.004);
      emitSparks(this, sprite.x, sprite.y, 0xffd43b);
      this.time.delayedCall(entry.duration, () => {
        this.speedMultiplier = 1;
      });
    }
    if (entry.kind === 'gravity') {
      this.gravityFlipped = !this.gravityFlipped;
      this.physics.world.gravity.y = this.gravityFlipped ? -this.level.gravity : this.level.gravity;
      this.camera.shake(280, 0.006);
      emitSparks(this, sprite.x, sprite.y, 0x9a66ff);
      this.time.delayedCall(entry.duration, () => {
        this.gravityFlipped = false;
        this.physics.world.gravity.y = this.level.gravity;
      });
    }
    if (entry.kind === 'rhythm') {
      this.showToast('Beat gates!');
      this.camera.flash(180, 255, 255, 255);
      this.speedMultiplier = 1.18;
      this.time.delayedCall(1300, () => {
        this.speedMultiplier = 1;
      });
    }
    this.time.delayedCall(1200, () => sprite.enableBody(false, sprite.x, sprite.y, true, true));
  }

  hitHazard() {
    this.die();
  }

  die() {
    if (this.failed || this.finished) return;
    this.failed = true;
    const pct = Phaser.Math.Clamp((this.gilly.sprite.x / this.level.distance) * 100, 0, 100);
    const saved = saveRun(this.level.id, pct, false);
    this.audio.bonk();
    this.gilly.crash();
    this.camera.shake(420, 0.01);
    emitDust(this, this.gilly.sprite.x, this.gilly.sprite.y + 30);
    this.showEndOverlay('BONK!', `${Math.round(pct)}% complete | ${saved.levels[this.level.id].deaths} total bonks`, false, pct);
  }

  win() {
    if (this.finished || this.failed) return;
    this.finished = true;
    const saved = saveRun(this.level.id, 100, true);
    this.gilly.sprite.setVelocityX(0);
    this.audio.celebrate();
    confetti(this);
    this.camera.shake(300, 0.004);
    this.showEndOverlay('Victory Zoomies!', 'Gilly barked at destiny and destiny backed down.', true, saved.levels[this.level.id].best);
  }

  showEndOverlay(title, message, completed, best) {
    this.physics.pause();
    this.audio.stopMusic();
    const panel = this.add.container(this.camera.scrollX + this.scale.width / 2, this.scale.height / 2).setDepth(200);
    const bg = this.add.rectangle(0, 0, Math.min(520, this.scale.width - 36), 260, 0xffffff, 0.93).setStrokeStyle(6, 0x111827);
    const titleText = this.add.text(0, -82, title, {
      fontFamily: 'Trebuchet MS, Arial',
      fontSize: '42px',
      color: '#111827',
      align: 'center',
    }).setOrigin(0.5);
    const body = this.add.text(0, -24, message, {
      fontFamily: 'Trebuchet MS, Arial',
      fontSize: '19px',
      color: '#2f3b52',
      align: 'center',
      wordWrap: { width: Math.min(430, this.scale.width - 70) },
    }).setOrigin(0.5);
    const action = this.add.text(0, 74, completed ? 'Continue' : 'Try Again', {
      fontFamily: 'Trebuchet MS, Arial',
      fontSize: '23px',
      color: '#ffffff',
      backgroundColor: completed ? '#21a64b' : '#ff5a58',
      padding: { x: 22, y: 14 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    action.on('pointerdown', () => this.onExit?.({ completed, levelId: this.level.id, levelName: this.level.name, best }));
    panel.add([bg, titleText, body, action]);
    panel.setScale(0.7);
    this.tweens.add({ targets: panel, scale: 1, duration: 280, ease: 'Back.easeOut' });
  }

  togglePause() {
    if (this.failed || this.finished) return;
    if (this.pausePanel) {
      this.pausePanel.destroy(true);
      this.pausePanel = null;
      this.audio.startMusic(this.level);
      this.physics.resume();
      this.scene.resume();
      return;
    }
    this.physics.pause();
    this.audio.stopMusic();
    this.pausePanel = this.add.container(this.camera.scrollX + this.scale.width / 2, this.scale.height / 2).setDepth(220);
    const bg = this.add.rectangle(0, 0, 360, 230, 0xffffff, 0.94).setStrokeStyle(6, 0x111827);
    const title = this.add.text(0, -65, 'Paused', { fontFamily: 'Trebuchet MS, Arial', fontSize: '40px', color: '#111827' }).setOrigin(0.5);
    const resume = this.add.text(0, 5, 'Resume', { fontFamily: 'Trebuchet MS, Arial', fontSize: '24px', color: '#ffffff', backgroundColor: '#3977ff', padding: { x: 24, y: 13 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const quit = this.add.text(0, 72, 'Level Select', { fontFamily: 'Trebuchet MS, Arial', fontSize: '21px', color: '#111827', backgroundColor: '#f1f5f9', padding: { x: 21, y: 12 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    resume.on('pointerdown', () => this.togglePause());
    quit.on('pointerdown', () => this.onExit?.({ completed: false, levelId: this.level.id, levelName: this.level.name, best: 0 }));
    this.pausePanel.add([bg, title, resume, quit]);
  }

  showToast(text) {
    const toast = this.add.text(this.camera.scrollX + this.scale.width / 2, 104, text, {
      fontFamily: 'Trebuchet MS, Arial',
      fontSize: '21px',
      color: '#ffffff',
      backgroundColor: '#111827bb',
      padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setDepth(120);
    this.tweens.add({
      targets: toast,
      y: 78,
      alpha: 0,
      delay: 1050,
      duration: 450,
      onComplete: () => toast.destroy(),
    });
  }

  shutdown() {
    this.audio?.stopMusic();
  }
}
