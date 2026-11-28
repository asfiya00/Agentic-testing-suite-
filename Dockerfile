FROM node:22-bookworm

WORKDIR /app
COPY package.json ./
COPY shared ./shared
COPY agents ./agents
COPY orchestrator ./orchestrator
COPY backend ./backend

RUN cd shared && npm install --omit=dev
RUN cd orchestrator && npm install --omit=dev
RUN cd agents/explorer && npm install --omit=dev && npx playwright install chromium --with-deps
RUN cd backend && npm install --omit=dev

EXPOSE 5000
CMD ["node", "backend/server.js"]
