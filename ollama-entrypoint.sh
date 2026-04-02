#!/bin/sh

echo "Iniciando Ollama..."
ollama serve &

# Espera Ollama responder de verdade (não sleep cego)
echo "Aguardando Ollama ficar disponível..."
until curl -s http://localhost:11434/api/tags > /dev/null; do
  sleep 1
done

echo "Ollama pronto. Verificando modelo..."

MODEL=tinyllama

if ! ollama list | grep -q "$MODEL"; then
  echo "Modelo $MODEL não encontrado. Baixando..."
  ollama pull $MODEL
else
  echo "Modelo $MODEL já existe."
fi

echo "Inicialização concluída."

wait