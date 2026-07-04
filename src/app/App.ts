import { Application } from 'pixi.js';
import { config } from './config';

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

  return app;
}
