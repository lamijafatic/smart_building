import 'dotenv/config';
import { createApp } from './app';
import { startSimulator } from './simulator/run';

const port = Number(process.env.PORT || 4000);
const app = createApp();

app.listen(port, () => {
  console.log(`[server] Smart Building API running on http://localhost:${port}`);
  startSimulator().catch((e) => console.error('[simulator] failed to start:', e));
});
