import { Application } from 'pixi.js';
import { loadAssets } from './assets';
import { config } from './config';
import { ScreenManager } from '../renderer/ScreenManager';
import { HomeScreen } from '../renderer/screens/HomeScreen';
import { ResultScreen } from '../renderer/screens/ResultScreen';

export async function createApp(): Promise<Application> {
  const app = new Application();
  await app.init({
    resizeTo: window,
    backgroundColor: config.colors.homeBg,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio, 2),
    autoDensity: true,
  });

  const container = document.getElementById('game');
  if (container) {
    container.appendChild(app.canvas);
  } else {
    document.body.appendChild(app.canvas);
  }

  await loadAssets(['home', 'result', 'fonts']);

  const screenManager = new ScreenManager(app);
  const homeScreen = new HomeScreen();
  const resultScreen = new ResultScreen();

  screenManager.setContent('home', homeScreen);
  screenManager.setContent('result', resultScreen);

  homeScreen.on(HomeScreen.START_LEVEL, () => {
    void screenManager.show('game', { backgroundColor: config.colors.gameBg });
  });

  resultScreen.on(ResultScreen.NEXT_LEVEL, () => {
    void screenManager.show('game', { backgroundColor: config.colors.gameBg });
  });

  await screenManager.show('home', {
    immediate: true,
    backgroundColor: config.colors.homeBg,
  });

  return app;
}
