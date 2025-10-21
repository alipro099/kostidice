/**
 * Optional Express server skeleton for Media Basket Mini.
 *
 * This module is not required for the front-end MVP, but it demonstrates how a
 * Node/Express + PostgreSQL backend can be attached later. Dependencies are
 * loaded dynamically so that the client build does not require them by
 * default. Install `express`, `cors` and `pg` before running this file.
 */
export interface MediaBasketServerOptions {
  connectionString?: string;
}

export async function createMediaBasketServer(options: MediaBasketServerOptions = {}) {
  const [{ default: express }, { default: cors }, { Pool }] = await Promise.all([
    import('express'),
    import('cors'),
    import('pg'),
  ]);

  const app = express();
  app.use(cors());
  app.use(express.json());

  const pool = new Pool({ connectionString: options.connectionString });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'media-basket-mini' });
  });

  app.get('/api/missions', async (_req, res) => {
    // This example fetches missions from PostgreSQL when the table exists.
    // Until a database is connected we respond with static placeholder data.
    try {
      const { rows } = await pool.query('SELECT id, title, progress, goal FROM missions ORDER BY id LIMIT 16');
      if (rows.length) {
        res.json({ missions: rows });
        return;
      }
    } catch (error) {
      console.warn('[mock-missions]', error);
    }

    res.json({
      missions: [
        { id: 'login-streak', title: 'Войти 3 дня подряд', progress: 1, goal: 3 },
        { id: 'score-10', title: 'Набрать 10 очков', progress: 0, goal: 10 },
        { id: 'swish-3', title: 'Сделать 3 swish подряд', progress: 0, goal: 3 },
      ],
    });
  });

  app.post('/api/share', (req, res) => {
    const { username, score } = req.body ?? {};
    if (!username || typeof score !== 'number') {
      res.status(400).json({ error: 'username and score are required' });
      return;
    }

    res.json({
      ok: true,
      message: `Игрок ${username} готов поделиться результатом ${score}. Интегрируйте Telegram Bot API тут.`,
    });
  });

  return app;
}

if (import.meta.url === process.argv[1]) {
  createMediaBasketServer()
    .then((app) => {
      const port = Number(process.env.PORT ?? 8080);
      app.listen(port, () => {
        console.log(`Media Basket Mini API listening on :${port}`);
      });
    })
    .catch((error) => {
      console.error('Failed to start Media Basket Mini API', error);
      process.exit(1);
    });
}
