import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene.js';

export function PhaserGame({ level, settings, onExit }) {
  const hostRef = useRef(null);
  const gameRef = useRef(null);
  const onExitRef = useRef(onExit);

  useEffect(() => {
    onExitRef.current = onExit;
  }, [onExit]);

  useEffect(() => {
    if (!hostRef.current) return undefined;
    const config = {
      type: Phaser.AUTO,
      parent: hostRef.current,
      backgroundColor: level.palette.sky,
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: hostRef.current.clientWidth,
        height: hostRef.current.clientHeight,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: level.gravity },
          debug: false,
          fps: 60,
        },
      },
      scene: [],
      callbacks: {
        postBoot: (game) => {
          game.scene.add('GameScene', GameScene, true, {
            level,
            settings,
            onExit: (result) => onExitRef.current?.(result),
          });
        },
      },
    };
    gameRef.current = new Phaser.Game(config);
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [level, settings]);

  return <div ref={hostRef} className="phaser-host" />;
}
