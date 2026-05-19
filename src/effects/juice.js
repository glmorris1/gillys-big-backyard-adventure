import Phaser from 'phaser';

export function emitDust(scene, x, y) {
  for (let i = 0; i < 7; i += 1) {
    const puff = scene.add.image(x, y, 'dust').setDepth(8).setScale(0.7 + Math.random() * 0.7);
    scene.tweens.add({
      targets: puff,
      x: x - 45 + Math.random() * 90,
      y: y - 10 - Math.random() * 40,
      alpha: 0,
      scale: 0.1,
      duration: 420,
      ease: 'Quad.easeOut',
      onComplete: () => puff.destroy(),
    });
  }
}

export function emitSparks(scene, x, y, color = 0xfff06b) {
  for (let i = 0; i < 10; i += 1) {
    const spark = scene.add.image(x, y, 'spark').setTint(color).setDepth(12).setScale(0.6);
    scene.tweens.add({
      targets: spark,
      x: x - 80 + Math.random() * 160,
      y: y - 70 + Math.random() * 120,
      alpha: 0,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => spark.destroy(),
    });
  }
}

export function confetti(scene) {
  const { width } = scene.scale;
  for (let i = 0; i < 70; i += 1) {
    const bit = scene.add
      .rectangle(Math.random() * width, -20 - Math.random() * 220, 8, 14, Phaser.Display.Color.RandomRGB().color)
      .setDepth(40)
      .setRotation(Math.random() * Math.PI);
    scene.tweens.add({
      targets: bit,
      y: scene.scale.height + 80,
      x: bit.x - 120 + Math.random() * 240,
      rotation: bit.rotation + Math.PI * 3,
      duration: 1500 + Math.random() * 900,
      ease: 'Quad.easeIn',
      onComplete: () => bit.destroy(),
    });
  }
}
