# Technical Decisions & Trade-offs

---

### 🧠 Uso do Prisma v5 ao invés da v7

- **Decisão:**  
  Utilizar Prisma v5 em vez da versão mais recente (v7).

- **Motivo:**  
  Evitar a complexidade introduzida na nova configuração (prisma.config.ts) e manter um fluxo mais simples e previsível usando `.env`, acelerando o desenvolvimento.

- **Trade-off:**  
  Não utilizar as melhorias e novas features da versão mais recente do Prisma.

---

### 🧠 Uso de IDs inteiros (INT) ao invés de UUID

- **Decisão:**  
  Utilizar `Int` com `autoincrement()` como identificador primário em todas as tabelas.

- **Motivo:**  
  Simplificar a implementação, facilitar debugging e acelerar o desenvolvimento, já que não há necessidade de segurança avançada ou distribuição de geração de IDs neste contexto.

- **Trade-off:**  
  IDs previsíveis e menor segurança para exposição pública, além de menor flexibilidade para cenários distribuídos.

---

### 🧠 Configuração antecipada do ambiente com Docker

- **Decisão:**  
  Configurar o ambiente completo com Docker (PostgreSQL, RabbitMQ, Mock API, Ollama) logo no início do desenvolvimento.

- **Motivo:**  
  Garantir que todas as integrações funcionem desde o começo, evitando retrabalho e problemas de compatibilidade no meio do desenvolvimento.

- **Trade-off:**  
  Maior esforço inicial de setup e possível aumento de complexidade nas primeiras etapas do projeto.

---
