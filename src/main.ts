import { createApp } from './app/App';

async function main(): Promise<void> {
  try {
    const app = await createApp();
    console.log('Vita Mahjong booted', app.renderer.width, app.renderer.height);
  } catch (err) {
    console.error('Failed to bootstrap Vita Mahjong:', err);
    throw err;
  }
}

main();
