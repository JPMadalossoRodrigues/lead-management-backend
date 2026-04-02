# Technical Decisions & Trade-offs

---

### Uso do Prisma v5 ao invés da v7

- **Decisão:**  
  Utilizar Prisma v5 em vez da versão mais recente (v7).

- **Motivo:**  
  Evitar a complexidade introduzida na nova configuração (prisma.config.ts) e manter um fluxo mais simples e previsível usando `.env`, acelerando o desenvolvimento.

- **Trade-off:**  
  Não utilizar as melhorias e novas features da versão mais recente do Prisma.

---

### Uso de IDs inteiros (INT) ao invés de UUID

- **Decisão:**  
  Utilizar `Int` com `autoincrement()` como identificador primário em todas as tabelas.

- **Motivo:**  
  Simplificar a implementação, facilitar debugging e acelerar o desenvolvimento, já que não há necessidade de segurança avançada ou distribuição de geração de IDs neste contexto.

- **Trade-off:**  
  IDs previsíveis e menor segurança para exposição pública, além de menor flexibilidade para cenários distribuídos.

---

### Uso de 127.0.0.1 ao invés de localhost para serviços Docker

- **Decisão:**
  Utilizar 127.0.0.1 em vez de localhost para conexões locais com serviços Docker.
- **Motivo:**
  Evitar problemas de resolução de hostname (IPv4 vs IPv6), especialmente em ambientes Windows.
- **Trade-off:**
  Menor portabilidade sem ajustes em ambientes onde localhost resolve corretamente.

---

## Armazenamento de dados de enriquecimento como JSON

**Decisão:**  
Armazenar o retorno completo da API de enriquecimento em um único campo do tipo JSON na tabela de Enrichment.

**Motivo:**  
Evitar complexidade de modelagem, facilitar manutenção diante de mudanças na API externa e manter foco no pipeline assíncrono e no histórico das execuções, que são os principais objetivos do desafio.

**Trade-offs:**

- Dificulta consultas estruturadas nos dados enriquecidos
- Reduz capacidade de indexação e filtragem por campos específicos
- Pode exigir parsing adicional caso esses dados precisem ser utilizados futuramente

---

### Normalização de dados (email e CNPJ)

- **Decisão:**
  Normalizar email (lowercase) e CNPJ (apenas dígitos) antes da persistência.

- **Motivo:**
  Garantir consistência e evitar duplicidade lógica em campos com restrição de unicidade.

- **Trade-off:**
  Pequeno custo adicional de processamento e necessidade de aplicar a mesma lógica em filtros e comparações.

  ***

### Validação de CNPJ no Service

- **Decisão:**
  Validar CNPJ no service utilizando biblioteca externa.

- **Motivo:**
  Garantir integridade de dados além de validações estruturais do DTO.

- **Trade-off:**
  Aumento de dependência externa e pequena sobrecarga de processamento.

  ***

### Estratégia de filtros na listagem de leads

- **Decisão:**
  Implementar filtros simples com:
  - match exato para CNPJ
  - busca parcial (contains, case-insensitive) para nomes

- **Motivo:**
  Oferecer flexibilidade básica de busca sem aumentar complexidade com full-text search.

- **Trade-off:**
  Consultas menos eficientes em grandes volumes de dados e ausência de busca avançada.

  ***

### Uso de fetch nativo para integração com API externa

- **Decisão:**
  Utilizar o fetch nativo do Node.js para realizar chamadas HTTP à API de enriquecimento, em vez de utilizar o HttpModule do NestJS ou bibliotecas externas como Axios.

- **Motivo:**
  Priorizar simplicidade e agilidade na implementação, reduzindo dependências e evitando complexidade adicional em um cenário com baixa necessidade de abstração ou reutilização de client HTTP.

- **Trade-off:**
  Menor integração com o ecossistema do NestJS (sem injeção de dependência ou interceptors)
  Maior dificuldade para mock em testes
  Ausência de centralização de configuração HTTP (timeouts, retries, logs)


---

### Estratégia de mocks nos testes

- **Decisão:**
  Utilizar mocks manuais simples com `vi.fn()` ao invés de mocks completos tipados do Prisma.

- **Motivo:**
  Manter simplicidade e foco na validação de regras de negócio.

- **Trade-off:**
  Menor segurança de tipagem e necessidade de casting manual em alguns pontos.