const SAVE_KEY = 'gillys-big-backyard-save-v1';

const defaultProgress = {
  unlockedLevel: 1,
  levels: {
    1: { best: 0, deaths: 0 },
    2: { best: 0, deaths: 0 },
    3: { best: 0, deaths: 0 },
    4: { best: 0, deaths: 0 },
    5: { best: 0, deaths: 0 },
    6: { best: 0, deaths: 0 },
  },
  settings: {
    sound: true,
    jumpButton: false,
  },
};

export function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return structuredClone(defaultProgress);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultProgress),
      ...parsed,
      levels: { ...defaultProgress.levels, ...parsed.levels },
      settings: { ...defaultProgress.settings, ...parsed.settings },
    };
  } catch {
    return structuredClone(defaultProgress);
  }
}

export function saveRun(levelId, percentage, completed) {
  const progress = loadProgress();
  const previous = progress.levels[levelId] ?? { best: 0, deaths: 0 };
  progress.levels[levelId] = {
    best: Math.max(previous.best, percentage),
    deaths: previous.deaths + (completed ? 0 : 1),
  };
  if (completed) {
    progress.unlockedLevel = Math.min(6, Math.max(progress.unlockedLevel, levelId + 1));
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
  return progress;
}

export function saveSettings(settings) {
  const progress = loadProgress();
  progress.settings = { ...progress.settings, ...settings };
  localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
  return progress;
}

export function resetProgress() {
  const fresh = structuredClone(defaultProgress);
  localStorage.setItem(SAVE_KEY, JSON.stringify(fresh));
  return fresh;
}
