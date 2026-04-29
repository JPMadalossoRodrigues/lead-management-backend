# Technical Decisions & Trade-offs

Este documento descreve as principais decisões técnicas tomadas no projeto, com foco nos trade-offs e no contexto em que foram aplicadas.

O objetivo não foi construir um sistema de produção completo, mas sim priorizar clareza arquitetural, simplicidade e foco no pipeline assíncrono.

---

## Uso do Prisma v5 ao invés da v7

**Decisão**  
Utilizar Prisma v5 em vez da versão mais recente.

**Motivo**  
A versão mais recente introduz mudanças de configuração que aumentam a complexidade inicial. Para este projeto, a prioridade foi manter um setup simples e previsível, acelerando o desenvolvimento.

**Trade-off**  
- Perda de acesso a features mais recentes  
- Menor alinhamento com versões atuais do ecossistema  

**Observação**  
Em um ambiente de produção, a escolha dependeria do ganho real das novas funcionalidades versus o custo de migração.

---

## Uso de IDs inteiros (INT) ao invés de UUID

**Decisão**  
Utilizar IDs inteiros com autoincremento como chave primária.

**Motivo**  
Facilitar debugging, leitura de dados e reduzir complexidade desnecessária para um sistema não distribuído.

**Trade-off**  
- IDs previsíveis  
- Menor segurança em exposição pública  
- Limitação em cenários distribuídos  

**Observação**  
Para sistemas expostos externamente ou distribuídos, UUIDs seriam mais adequados.

---

## Uso de 127.0.0.1 ao invés de localhost

**Decisão**  
Utilizar 127.0.0.1 para comunicação com serviços locais.

**Motivo**  
Evitar inconsistências de resolução (IPv4 vs IPv6), especialmente em ambientes Windows.

**Trade-off**  
- Menor portabilidade sem ajustes  

---

## Armazenamento de enrichment como JSON

**Decisão**  
Armazenar o payload completo da API externa em um campo JSON.

**Motivo**  
Evitar acoplamento à estrutura da API externa e reduzir complexidade de modelagem.

**Trade-off**  
- Dificuldade de consultas estruturadas  
- Baixa capacidade de indexação  
- Necessidade de parsing adicional  

**Observação**  
Em sistemas com forte necessidade analítica, seria necessário normalizar os dados.

---

## Normalização de dados (email e CNPJ)

**Decisão**  
Normalizar email (lowercase) e CNPJ (apenas dígitos) antes da persistência.

**Motivo**  
Garantir consistência e evitar duplicidade lógica.

**Trade-off**  
- Pequeno custo de processamento  
- Necessidade de aplicar a mesma lógica em consultas  

---

## Validação de CNPJ no Service

**Decisão**  
Realizar validação no nível de serviço utilizando biblioteca externa.

**Motivo**  
Garantir integridade além da validação estrutural de DTOs.

**Trade-off**  
- Dependência externa  
- Overhead leve de processamento  

---

## Estratégia de filtros na listagem de leads

**Decisão**  
Implementar filtros simples:
- match exato para CNPJ  
- busca parcial para nome  

**Motivo**  
Oferecer flexibilidade básica sem aumentar complexidade.

**Trade-off**  
- Baixa eficiência em grandes volumes  
- Ausência de busca avançada  

**Observação**  
Full-text search seria mais adequado em escala maior.

---

## Uso de fetch nativo ao invés de HttpModule

**Decisão**  
Utilizar fetch nativo para chamadas HTTP.

**Motivo**  
Reduzir abstrações e dependências, mantendo simplicidade.

**Trade-off**  
- Sem interceptors  
- Sem injeção de dependência  
- Maior dificuldade de mock  
- Falta de centralização de config (timeout, retry, logs)

**Observação**  
Para aplicações maiores, um client HTTP estruturado seria mais adequado.

---

## Estratégia de mocks nos testes

**Decisão**  
Utilizar mocks simples com vi.fn().

**Motivo**  
Priorizar velocidade de implementação e foco na regra de negócio.

**Trade-off**  
- Menor segurança de tipagem  
- Necessidade de casting manual  

---

## Considerações finais

As decisões deste projeto priorizam:

- simplicidade  
- clareza de arquitetura  
- foco no fluxo assíncrono  

Em um cenário de produção, diversas dessas escolhas seriam revisitadas para atender requisitos de escala, observabilidade e robustez.
