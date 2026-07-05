import { Application, Container } from 'pixi.js';
import { loadAssets } from './assets';
import { config } from './config';
import { ScreenManager } from '../renderer/ScreenManager';
import { GameScreen } from '../renderer/screens/GameScreen';
import { HomeScreen } from '../renderer/screens/HomeScreen';
import { ResultScreen } from '../renderer/screens/ResultScreen';
import { SettingsScreen } from '../renderer/screens/SettingsScreen';
import { AudioManager } from '../audio/AudioManager';
import { saveLevel, loadLevel } from './persistence';
import { isLowEndDevice } from './performance';

let currentLevel = loadLevel();
const lowEndDevice = isLowEndDevice();

export async function createApp(): Promise<Application> {
  const container = document.getElementById('game');
  if (!container) {
    throw new Error('Missing #game container');
  }

  const app = new Application();
  await app.init({
    resizeTo: container,
    backgroundColor: config.colors.homeBg,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio, 2),
    autoDensity: true,
  });

  container.appendChild(app.canvas);

  await loadAssets(['home', 'result', 'fonts']);

  const screenManager = new ScreenManager(app);
  const homeScreen = new HomeScreen({ ticker: app.ticker });
  const gameScreen = await GameScreen.create({
    ticker: app.ticker,
    isLowEndDevice: lowEndDevice,
    onBack: () => {
      AudioManager.getInstance().stopBgm();
      void screenManager.show('home', { immediate: true, backgroundColor: config.colors.homeBg });
    },
  });
  const resultScreen = new ResultScreen();
  const settingsScreen = new SettingsScreen(() => {
    void screenManager.show('home', { backgroundColor: config.colors.homeBg });
  });

  screenManager.setContent('home', homeScreen);
  screenManager.setContent('game', gameScreen);
  screenManager.setContent('result', resultScreen);
  screenManager.setContent('settings', settingsScreen);

  // Wire reset-progress event: clear currentLevel → 1, persist, update UI
  settingsScreen.on('reset-progress', () => {
    currentLevel = 1;
    saveLevel(1);
    updateHomeLevelLabel();
  });

  function updateHomeLevelLabel(): void {
    homeScreen.setLevel(currentLevel);
  }

  homeScreen.on(HomeScreen.START_LEVEL, () => {
    const selectedLevel = currentLevel;
    void startLevelFromHome(selectedLevel);
  });

  homeScreen.on(HomeScreen.OPEN_SETTINGS, () => {
    void screenManager.show('settings', { backgroundColor: config.colors.gameBg });
  });

  resultScreen.on(ResultScreen.NEXT_LEVEL, () => {
    void startLevel(currentLevel);
  });

  gameScreen.on(GameScreen.WIN, (stats) => {
    AudioManager.getInstance().stopBgm();
    AudioManager.getInstance().playSfx('win');
    resultScreen.setStats(stats);
    currentLevel = stats.nextLevel;
    saveLevel(currentLevel);
    updateHomeLevelLabel();
    void screenManager.show('result', { backgroundColor: config.colors.resultBg });
  });

  updateHomeLevelLabel();

  await screenManager.show('home', {
    immediate: true,
    backgroundColor: config.colors.homeBg,
  });

  return app;

  async function startLevelFromHome(level: number): Promise<void> {
    try {
      if (level === 3) {
        await homeScreen.playDoorOpen();
      }
      await startLevel(level);
    } finally {
      homeScreen.resetDoor();
    }
  }

  async function startLevel(level: number): Promise<void> {
    // Initialize audio on first user gesture (autoplay policy)
    await AudioManager.getInstance().init();
    await gameScreen.startLevel(level);
    await screenManager.show('game', { backgroundColor: config.colors.gameBg });
    AudioManager.getInstance().startBgm();
  }
}
