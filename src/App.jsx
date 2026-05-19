import { useMemo, useState } from 'react';
import { ArrowLeft, Gamepad2, Play, RotateCcw, Settings, Trophy, Volume2, VolumeX } from 'lucide-react';
import { PhaserGame } from './components/PhaserGame.jsx';
import { LEVELS } from './levels/levelData.js';
import { loadProgress, resetProgress, saveSettings } from './utilities/storage.js';

const screens = {
  title: 'title',
  levels: 'levels',
  settings: 'settings',
  game: 'game',
  victory: 'victory',
};

export function App() {
  const [screen, setScreen] = useState(screens.title);
  const [selectedLevelId, setSelectedLevelId] = useState(1);
  const [progress, setProgress] = useState(() => loadProgress());
  const [lastResult, setLastResult] = useState(null);
  const [settings, setSettings] = useState(progress.settings);

  const selectedLevel = useMemo(
    () => LEVELS.find((level) => level.id === selectedLevelId) ?? LEVELS[0],
    [selectedLevelId],
  );

  const updateSettings = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    const saved = saveSettings(next);
    setProgress(saved);
  };

  const startLevel = (levelId) => {
    setSelectedLevelId(levelId);
    setScreen(screens.game);
  };

  const handleGameExit = (result) => {
    const latest = loadProgress();
    setProgress(latest);
    setLastResult(result);
    setScreen(result?.completed ? screens.victory : screens.levels);
  };

  const wipeSave = () => {
    const fresh = resetProgress();
    setProgress(fresh);
    setSettings(fresh.settings);
  };

  return (
    <main className={`app-shell screen-${screen}`}>
      <div className="background-sky" aria-hidden="true">
        <span className="cloud cloud-a" />
        <span className="cloud cloud-b" />
        <span className="spark spark-a" />
        <span className="spark spark-b" />
      </div>

      {screen === screens.title && (
        <section className="title-screen">
          <div className="title-copy">
            <p className="kicker">Cartoon rhythm platform puppy mayhem</p>
            <h1>Gilly's Big Backyard Adventure</h1>
            <p className="subtitle">
              Run, bounce, flip, bark, and survive a backyard that gets less reasonable every level.
            </p>
          </div>
          <div className="hero-dog" aria-hidden="true">
            <div className="dog-ear left" />
            <div className="dog-ear right" />
            <div className="dog-face">
              <span className="dog-patch" />
              <span className="dog-eye left" />
              <span className="dog-eye right" />
              <span className="dog-nose" />
              <span className="dog-tongue" />
            </div>
            <div className="dog-tail" />
          </div>
          <nav className="menu-row" aria-label="Main menu">
            <button className="primary" onClick={() => setScreen(screens.levels)}>
              <Play size={22} /> Play
            </button>
            <button onClick={() => setScreen(screens.settings)}>
              <Settings size={22} /> Settings
            </button>
          </nav>
        </section>
      )}

      {screen === screens.levels && (
        <section className="panel level-select">
          <header className="panel-header">
            <button className="icon-button" aria-label="Back to title" onClick={() => setScreen(screens.title)}>
              <ArrowLeft size={22} />
            </button>
            <div>
              <p className="kicker">Choose the chaos</p>
              <h2>Level Select</h2>
            </div>
            <button className="icon-button" aria-label="Settings" onClick={() => setScreen(screens.settings)}>
              <Settings size={22} />
            </button>
          </header>
          <div className="levels-grid">
            {LEVELS.map((level) => {
              const unlocked = level.id <= progress.unlockedLevel;
              const stats = progress.levels[level.id] ?? { best: 0, deaths: 0 };
              return (
                <button
                  key={level.id}
                  className="level-card"
                  disabled={!unlocked}
                  onClick={() => startLevel(level.id)}
                  style={{
                    '--accent': level.palette.accent,
                    '--soft': level.palette.soft,
                  }}
                >
                  <span className="level-number">{level.id}</span>
                  <span className="level-name">{level.name}</span>
                  <span className="level-theme">{level.theme}</span>
                  <span className="level-stats">
                    {unlocked ? `${Math.round(stats.best)}% best | ${stats.deaths} bonks` : 'Locked'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {screen === screens.settings && (
        <section className="panel settings-panel">
          <header className="panel-header">
            <button className="icon-button" aria-label="Back" onClick={() => setScreen(screens.title)}>
              <ArrowLeft size={22} />
            </button>
            <div>
              <p className="kicker">Tweak the puppy machine</p>
              <h2>Settings</h2>
            </div>
            <Gamepad2 size={28} aria-hidden="true" />
          </header>
          <label className="setting-line">
            <span>Sound</span>
            <button onClick={() => updateSettings({ sound: !settings.sound })}>
              {settings.sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
              {settings.sound ? 'On' : 'Off'}
            </button>
          </label>
          <label className="setting-line">
            <span>Mobile Jump Button</span>
            <button onClick={() => updateSettings({ jumpButton: !settings.jumpButton })}>
              {settings.jumpButton ? 'Button Mode' : 'Tap Anywhere'}
            </button>
          </label>
          <button className="danger" onClick={wipeSave}>
            <RotateCcw size={20} /> Reset Progress
          </button>
        </section>
      )}

      {screen === screens.game && (
        <section className="game-screen">
          <PhaserGame level={selectedLevel} settings={settings} onExit={handleGameExit} />
        </section>
      )}

      {screen === screens.victory && (
        <section className="panel victory-panel">
          <Trophy size={46} />
          <p className="kicker">{lastResult?.levelName} cleared</p>
          <h2>Gilly Did The Thing</h2>
          <p>
            Best run: {Math.round(lastResult?.best ?? 0)}%. New chaos unlocked if Gilly earned it.
          </p>
          <div className="menu-row">
            <button className="primary" onClick={() => setScreen(screens.levels)}>
              <Play size={22} /> Next Level
            </button>
            <button onClick={() => startLevel(selectedLevelId)}>
              <RotateCcw size={22} /> Again
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
