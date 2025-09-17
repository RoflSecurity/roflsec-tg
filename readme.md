
```
npm i -g splitit && node .
# or just use node index.js
# if you don't plan to use mp3 commands
```

```
│  commands
│  │  help
│  │  │  callbacks.js
│  │  │  index.js
│  │  │  inlines.js
│  │  info
│  │  │  callbacks.js
│  │  │  index.js
│  │  │  inlines.js
│  │  mp3
│  │  │  callbacks.js
│  │  │  index.js
│  │  │  inlines.js
│  │  ping
│  │  │  callbacks.js
│  │  │  index.js
│  │  │  inlines.js
│  events
│  │  ready.js
│  │  message.js
│  │  callback_queries.js
│  │  inline_queries.js
│  db
│  │  pooling.js
│  index.js
│  package.json
│  .env
│  .gitignore
│  readme.md
```

```
BOT_TOKEN=urMom
BOT_OWNER_ID=same
BOT_OWNER_USERNAME=urMom
DB_HOST=localhost
DB_USER=urMom
DB_PASSWORD=urMom
DB_DATABASE=urMom
```
```
CREATE DATABASE IF NOT EXISTS urMom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;CREATE USER IF NOT EXISTS 'urMom'@'localhost' IDENTIFIED BY 'urMom';GRANT ALL PRIVILEGES ON urMom.* TO 'urMom'@'localhost';FLUSH PRIVILEGES;
```
