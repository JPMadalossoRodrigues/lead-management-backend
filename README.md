# Lead Management System

## 📌 Overview

Sistema backend para processamento assíncrono de leads com pipeline de enriquecimento e classificação baseada em IA.

Projetado para simular cenários reais de backend com:
- filas (RabbitMQ)
- workers desacoplados
- integração com APIs externas
- tratamento de falhas e retries

O foco do projeto é demonstrar arquitetura orientada a eventos e processamento resiliente.

---

## 🏗️ Arquitetura

O sistema utiliza um pipeline assíncrono baseado em filas:

1. Criação do lead  
2. Envio para fila de enrichment  
3. Worker processa enrichment  
4. Envio para fila de classificação  
5. Worker processa classificação com IA (Ollama)  

Cada etapa é desacoplada e processada de forma independente.

---

## ⚙️ Fluxo do sistema

Lead criado → PENDING  
↓  
Enrichment solicitado → fila RabbitMQ  
↓  
Worker processa → ENRICHED  
↓  
Classification solicitada → fila RabbitMQ  
↓  
Worker processa → CLASSIFIED  

Em caso de falha:
- retries são aplicados  
- erro é persistido no banco  
- status atualizado para FAILED  

---

## 🛡️ Tratamento de falhas

O sistema implementa:

- Retry em chamadas externas (IA)  
- Validação e normalização de respostas  
- Persistência de erros no banco  
- Controle de estados para evitar reprocessamento indevido  

Essas decisões simulam cenários reais de instabilidade em sistemas distribuídos.

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

## 🔗 Endpoints principais

### Leads
- POST /leads  
- GET /leads  
- GET /leads/:id  
- PATCH /leads/:id  
- DELETE /leads/:id  

### Enrichment
- POST /leads/:id/enrichment  
- GET /leads/:id/enrichments  

### Classification
- POST /leads/:id/classification  
- GET /leads/:id/classifications  

### Export
- GET /leads/export  

---

## 🚀 Como rodar o projeto

1. Clonar o repositório  
    git clone <repo-url>

2. Subir ambiente  
    docker compose up -d

3. Rodar migrations  
    npx prisma migrate dev

4. Rodar aplicação  
    npm run start:dev

---

## 🧪 Testes

    npm run test

---

## 📊 Decisões técnicas

- Uso de JSON para enrichment → flexibilidade vs queryabilidade  
- IDs inteiros → simplicidade vs previsibilidade  
- Fetch nativo → menos abstração vs menor testabilidade  
- Prisma v5 → estabilidade vs features mais recentes  

Mais detalhes em: TECHNICAL_DECISIONS.md

---

## 🚀 Diferenciais do projeto

- Pipeline assíncrono com RabbitMQ  
- Integração com LLM local (Ollama)  
- Validação robusta de respostas de IA  
- Separação clara entre producers e workers  
- Controle de estados ao longo do processamento  
