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
const USER_ID = 'namankumar_25012006';
const EMAIL_ID = 'naman0664.be23@chitkara.edu.in';
const ROLL_NUMBER = '2310990664';
```

## API
POST /bfhl
```json
{ "data": ["A->B", "A->C", "B->D"] }
```
