import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { fantasyService, missionService, userService } from './services/index.js';
import './services/postgres.js';

const app = express();
app.use(cors());
app.use(express.json());

const resolveUserId = (req) => req.header('x-user-id') || 'demo-user';

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'hoopverse' });
});

app.get('/api/users/me', (req, res) => {
  const userId = resolveUserId(req);
  const profile = userService.getProfile(userId);
  res.json(profile);
});

app.post('/api/users/me/coins', (req, res) => {
  const userId = resolveUserId(req);
  const { delta = 0 } = req.body;
  const updated = userService.addCoins(userId, delta);
  res.json(updated);
});

app.get('/api/fantasy', (req, res) => {
  const userId = resolveUserId(req);
  res.json(fantasyService.getSnapshot(userId));
});

app.post('/api/fantasy/lineup', (req, res) => {
  const userId = resolveUserId(req);
  const { playerId } = req.body;
  res.json(fantasyService.addToLineup(userId, playerId));
});

app.get('/api/missions', (req, res) => {
  const userId = resolveUserId(req);
  res.json({ missions: missionService.list(userId) });
});

app.post('/api/missions/:id/complete', (req, res) => {
  const userId = resolveUserId(req);
  const { id } = req.params;
  const result = missionService.complete(userId, id);
  res.json(result);
});

app.get('/api/teams', (_req, res) => {
  res.json({
    teams: [
      {
        id: 'tsquad',
        name: 'T-SQUAD',
        mode: '3x3',
        rating: 982,
        logo: 'https://dummyimage.com/80x80/ff5e00/fff.png&text=T',
      },
      {
        id: 'lit-energy',
        name: 'LitEnergy',
        mode: '5x5',
        rating: 1012,
        logo: 'https://dummyimage.com/80x80/b45eff/fff.png&text=L',
      },
    ],
  });
});

app.get('/api/matches', (_req, res) => {
  res.json({
    matches: [
      {
        id: 'match-101',
        mode: '3x3',
        teams: ['tsquad', 'lit-energy'],
        tipoff: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
      },
    ],
  });
});

app.get('/api/shop', (_req, res) => {
  res.json({
    categories: [
      {
        id: 'merch',
        title: 'Мерч',
        items: [
          { id: 'tee-t-squad', title: 'Футболка T-SQUAD', priceCoins: 650, priceRub: 2490 },
          { id: 'hoodie-urban', title: 'Urban Hoodie', priceCoins: 1200, priceRub: 4790 },
        ],
      },
      {
        id: 'energy',
        title: 'Энергетики',
        items: [
          { id: 'vota-drink', title: 'Vota', priceCoins: 120, priceRub: 199 },
          { id: 'litenergy', title: 'LitEnergy X', priceCoins: 180, priceRub: 249 },
        ],
      },
    ],
  });
});

app.get('/api/ton/config', (_req, res) => {
  res.json({
    enabled: false,
    comment: 'Подключите кошелек TON, чтобы активировать внутриигровые покупки.',
  });
});

const port = process.env.PORT || 8080;
const server = createServer(app);

server.listen(port, () => {
  console.log(`HoopVerse API listening on port ${port}`);
});
