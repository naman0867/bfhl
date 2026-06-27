# BFHL Node Hierarchy Explorer

## Setup
```bash
npm install
npm start
```

## Deploy to Render
1. Push to GitHub
2. Go to vercel.com → New Projects → connect repo
3. Build: `npm install`, Start: `npm start`
4. Done — API at `https://bfhl-pink.vercel.app`

## Deploy to Vercel
```bash
npm i -g vercel
vercel
```

## ⚠️ Before deploying: update your credentials in index.js
```js
const USER_ID = 'yourname_ddmmyy';
const EMAIL_ID = 'name@collegeid';
const ROLL_NUMBER = 'rollno';
```

## API
POST /bfhl
```json
{ "data": ["A->B", "A->C", "B->D"] }
```
