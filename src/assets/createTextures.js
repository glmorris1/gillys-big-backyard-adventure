export function createTextures(scene) {
  if (scene.textures.exists('gilly-run-0')) return;
  createGilly(scene, 'gilly-run-0', 0);
  createGilly(scene, 'gilly-run-1', 1);
  createGilly(scene, 'gilly-jump', 2);
  createGilly(scene, 'gilly-crash', 3);
  makeRect(scene, 'ground-tile', 96, 48, 0x56c667, 0x224b2a);
  makeRect(scene, 'platform', 128, 24, 0xfff5a8, 0x453821);
  makeCircle(scene, 'soccer', 28, 0xffffff, 0x161616);
  makeCircle(scene, 'rock', 30, 0x8d8a83, 0x353535);
  makeCircle(scene, 'cupcake', 34, 0xff9ecb, 0x7a374c);
  makeRect(scene, 'mud', 120, 28, 0x8a5a36, 0x3b281a, 14);
  makeRect(scene, 'bounce-pad', 82, 18, 0x39f6ff, 0x16646a, 9);
  makeRect(scene, 'speed-pad', 92, 18, 0xffd43b, 0x876800, 9);
  makeRect(scene, 'gravity-orb', 50, 50, 0x9a66ff, 0x3e206e, 25);
  makeRect(scene, 'obstacle-box', 70, 70, 0xff6859, 0x61201d, 8);
  makeRect(scene, 'wave', 38, 150, 0x68fff3, 0x196b7a, 18);
  makeRect(scene, 'rocket', 52, 128, 0xff7043, 0x672915, 20);
  makeRect(scene, 'laser', 36, 180, 0xff45f6, 0x63135f, 18);
  makeBird(scene);
  makeBosses(scene);
  makeParticles(scene);
}

function makeRect(scene, key, width, height, fill, stroke, radius = 4) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(fill, 1);
  g.lineStyle(5, stroke, 1);
  g.fillRoundedRect(3, 3, width - 6, height - 6, radius);
  g.strokeRoundedRect(3, 3, width - 6, height - 6, radius);
  g.generateTexture(key, width, height);
  g.destroy();
}

function makeCircle(scene, key, radius, fill, stroke) {
  const size = radius * 2 + 8;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(fill, 1);
  g.lineStyle(5, stroke, 1);
  g.fillCircle(size / 2, size / 2, radius);
  g.strokeCircle(size / 2, size / 2, radius);
  if (key === 'soccer') {
    g.fillStyle(0x161616, 1);
    g.fillCircle(size / 2, size / 2, 8);
    g.fillTriangle(18, 20, 28, 10, 34, 26);
    g.fillTriangle(44, 42, 54, 32, 58, 50);
  }
  g.generateTexture(key, size, size);
  g.destroy();
}

function createGilly(scene, key, pose) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.lineStyle(5, 0x1e1b19, 1);
  g.fillStyle(0xffffff, 1);
  g.fillRoundedRect(18, 26, 58, 40, 18);
  g.strokeRoundedRect(18, 26, 58, 40, 18);
  g.fillStyle(0x1e1b19, 1);
  g.fillRoundedRect(18, 28, 30, 36, 15);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(70, 28, 23);
  g.strokeCircle(70, 28, 23);
  g.fillStyle(0x1e1b19, 1);
  g.fillCircle(62, 22, 5);
  g.fillCircle(80, 22, 5);
  g.fillRoundedRect(70, 30, 14, 9, 5);
  g.fillStyle(0xff7e8f, 1);
  g.fillRoundedRect(76, 40, 12, pose === 3 ? 18 : 11, 6);
  g.fillStyle(0x1e1b19, 1);
  g.fillTriangle(50, 8, 38, 30, 60, 28);
  g.fillTriangle(86, 8, 78, 30, 98, 28);
  g.lineStyle(6, 0x1e1b19, 1);
  g.lineBetween(21, 37, 7, 24 + pose * 2);
  g.lineBetween(7, 24 + pose * 2, 14, 8);
  g.lineStyle(5, 0x1e1b19, 1);
  const legY = pose === 1 ? 64 : 68;
  g.lineBetween(30, 64, 24 + pose * 4, legY + 10);
  g.lineBetween(55, 64, 60 - pose * 5, legY + 10);
  if (pose === 2) {
    g.strokeCircle(50, 48, 36);
  }
  if (pose === 3) {
    g.lineStyle(4, 0xffd43b, 1);
    g.strokeCircle(46, 12, 8);
    g.strokeCircle(88, 12, 8);
  }
  g.generateTexture(key, 112, 86);
  g.destroy();
}

function makeBird(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.lineStyle(5, 0x57341f, 1);
  g.fillStyle(0xffcc5a, 1);
  g.fillEllipse(80, 48, 130, 64);
  g.strokeEllipse(80, 48, 130, 64);
  g.fillStyle(0xff8b47, 1);
  g.fillTriangle(140, 44, 178, 56, 140, 68);
  g.fillStyle(0x57341f, 1);
  g.fillCircle(110, 35, 6);
  g.fillStyle(0xfff2c7, 1);
  g.fillEllipse(50, 20, 86, 30);
  g.fillEllipse(52, 78, 86, 30);
  g.generateTexture('mother-bird', 190, 104);
  g.destroy();
}

function makeBosses(scene) {
  const bosses = [
    ['debbie-boss', 0xf3c38d, 0x36221c, 0xff78b7],
    ['clint-boss', 0xf0c09a, 0x543a2d, 0x47e7ff],
    ['karate-boss', 0xf8c990, 0x141414, 0xffffff],
    ['guitar-solo', 0x7b44ff, 0x17102c, 0xffe45c],
  ];
  bosses.forEach(([key, skin, outline, accent]) => {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.lineStyle(6, outline, 1);
    g.fillStyle(accent, 1);
    g.fillRoundedRect(35, 70, 110, 92, 24);
    g.strokeRoundedRect(35, 70, 110, 92, 24);
    g.fillStyle(skin, 1);
    g.fillCircle(90, 48, 38);
    g.strokeCircle(90, 48, 38);
    g.fillStyle(outline, 1);
    g.fillCircle(76, 42, 5);
    g.fillCircle(104, 42, 5);
    g.fillRoundedRect(80, 58, 24, 7, 4);
    if (key === 'debbie-boss') {
      g.fillStyle(0x2d1810, 1);
      g.fillEllipse(90, 47, 108, 82);
      g.fillStyle(skin, 1);
      g.fillCircle(90, 48, 35);
      g.fillStyle(0xffeb6b, 1);
      g.fillCircle(126, 24, 12);
    }
    if (key === 'clint-boss') {
      g.lineStyle(5, outline, 1);
      g.lineBetween(72, 76, 108, 76);
      g.fillRoundedRect(76, 68, 28, 13, 7);
    }
    if (key === 'guitar-solo') {
      g.fillStyle(0xffe45c, 1);
      g.fillRoundedRect(128, 42, 30, 130, 12);
      g.fillCircle(142, 56, 26);
    }
    g.generateTexture(key, 190, 190);
    g.destroy();
  });
}

function makeParticles(scene) {
  makeCircle(scene, 'spark', 6, 0xfff06b, 0xffffff);
  makeCircle(scene, 'dust', 8, 0xffdf9a, 0x9d6d35);
  makeCircle(scene, 'confetti', 5, 0xff5ac8, 0xffffff);
}
