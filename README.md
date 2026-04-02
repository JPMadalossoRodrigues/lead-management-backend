# Lead Management System

## 📌 Overview

Sistema backend para gestão de leads com enriquecimento e classificação usando IA, com processamento assíncrono.

---

## 🛠️ Tech Stack

- Node.js
- NestJS
- TypeScript
- PostgreSQL
- Prisma
- RabbitMQ
- Docker
- Ollama

---

## 🚀 Como rodar o projeto

### 1. Clonar

git clone ...

### 2. Subir ambiente

docker compose up -d

### 3. Rodar migrations

npx prisma migrate dev

### 4. Rodar aplicação

npm run start:dev

---

## 🔗 Endpoints principais

### Leads

POST /leads  
GET /leads  
GET /leads/:id  
PATCH /leads/:id  
DELETE /leads/:id

### Enrichment

POST /leads/:id/enrichment  
GET /leads/:id/enrichments

### Classification

POST /leads/:id/classification  
GET /leads/:id/classifications

### Export

GET /leads/export

---

## ⚙️ Fluxo do sistema

1. Lead criado → status PENDING
2. Enrichment solicitado → fila
3. Worker processa → ENRICHED
4. Classification → fila
5. Worker processa → CLASSIFIED

---

## 🧪 Testes

Rodar testes:

npm run test

---

## 📊 Decisões técnicas

Veja `TECHNICAL_DECISIONS.md`
