# Media Basket Mini

Media Basket Mini — Telegram Mini App в неоновой эстетике баскетбольной лиги. MVP включает
домашний экран, миссии, профиль и мини-игру «Flick Shot», где зелёный мяч нужно бросать
свайпом по дуге в корзину.

## Стэк

- React + TypeScript + Vite (`client/`)
- Zustand для игрового состояния и локальных рекордов
- CSS Modules для темной UI-темы с неоновыми акцентами
- Telegram WebApp SDK (инициализация, Haptic Feedback, share API)
- Mock API (локально) + заготовка backend Express/PostgreSQL (`server/`)

## Структура

```
.
├── client               # фронтенд на Vite
│   ├── index.html
│   ├── package.json
│   └── src
│       ├── app          # роутер и экраны (Home, Play, Missions, Profile)
│       ├── components   # UI-компоненты (Button, Card, ScoreBadge, Tabs)
│       ├── features
│       │   ├── game     # Canvas-игра, физика, Zustand-store, звуки, эффекты
│       │   ├── missions # списки миссий, заглушки под API
│       │   └── profile  # отображение статистики
│       ├── services     # telegram.ts, storage helpers, mockApi
│       └── styles       # глобальные стили и токены
├── server               # опциональный backend skeleton (Express + PostgreSQL)
└── README.md
```

## Запуск

```bash
npm install
npm run dev
```

Приложение откроется на [http://localhost:5173](http://localhost:5173). При запуске внутри
Telegram Mini App укажите этот URL в настройках BotFather (`/setdomain`).

### Сборка и предпросмотр

```bash
npm run build
npm run preview
```

### Развёртывание

1. Выполните `npm run build` — статические файлы появятся в `client/dist`.
2. Залейте содержимое `client/dist` на любой статический хостинг (Vercel, Netlify, Cloudflare Pages).
3. В BotFather укажите продакшен-домен в разделе **WebApp**.

### Опциональный backend

Файл `server/index.ts` содержит пример Express-приложения с lazy-импортом зависимостей и
заготовками маршрутов для миссий и шаринга. Чтобы активировать сервер:

```bash
npm install express cors pg
node --loader ts-node/esm server/index.ts
```

Здесь можно подключить PostgreSQL, Telegram Bot API и реальные миссии.

## Особенности MVP

- **Игра Flick Shot**: HTML5 Canvas, простая баллистика, свайп-ввод, траектория-призрак,
  комбо-счёт и визуальные эффекты.
- **Запись рекордов**: локальное хранение лучших результатов и последних сессий, кнопка
  «Поделиться рекордом» через Telegram API.
- **Миссии**: мок-данные и имитация получения награды с использованием mock API.
- **Профиль**: данные пользователя из `Telegram.WebApp.initDataUnsafe`, кнопка очистки
  локальных данных.
- **UI**: темный фон, контрастная типографика, неоновый мяч и волнистые акценты в духе
  Media Basket.

Готово к дальнейшему расширению — добавляйте реальные API, платежи и мультиплеерные режимы.
