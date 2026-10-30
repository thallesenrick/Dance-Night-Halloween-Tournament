# Crossover · Halloween Ball

Aplicativo React + Vite + Tailwind CSS com animações Framer Motion e ícones Lucide. Usa a imagem fornecida como cenário original do torneio.

## Rodar

```sh
npm install
npm run dev
```

Abra o endereço localhost informado pelo Vite. A câmera precisa de localhost ou HTTPS e autorização do navegador. Também é possível enviar uma foto. `npm run build` gera `dist`; `npm test` verifica a classificação.

## Torneio

Cadastre oito participantes, sorteie ou altere as chaves na aba Participantes, mantendo quatro em cada uma. Registre os pontos da rodada. Dois avançam por chave: 1º A × 2º B e 1º B × 2º A. Empates relevantes bloqueiam o avanço até uma rodada de desempate. Selecione os vencedores das semifinais e da final manualmente, de acordo com o Just Dance.

Dados e fotos ficam no localStorage deste navegador; não há sincronização, servidor de resultados ou integração automática com o jogo. Exporte o JSON como registro. Novo torneio apaga os dados locais após confirmação.
