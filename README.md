# Halloween Ball Night · Tournament Lab

Execute `npm install` e `npm run dev`, depois abra o endereço do Vite.

## Fluxo

1. Na tela inicial, clique em Começar o torneio para abrir um canvas vazio. O mapa anterior é guardado em `halloween-backup` no navegador antes de iniciar outro.
2. Selecione Quadrado e clique no canvas para criar vagas, ou arraste o botão Quadrado para o canvas. Mova os espaços pela barra superior e edite seus nomes.
3. Conecte a bolinha de saída, à direita, à entrada de outro espaço, à esquerda. Pode clicar nas duas bolinhas ou arrastar entre elas. A ferramenta Conectar também permite selecionar o espaço de origem e o de destino. Desenhe as próximas fases antes de cadastrar as pessoas. Clique numa linha para removê-la.
4. Na lista lateral, clique em Adicionar participante. O modal pede apenas nome e foto opcional, por câmera ou arquivo.
5. Colocar no torneio sorteia uma pessoa por espaço inicial, sem repetir nomes. Espaços com conexões de entrada são reservados para quem avançar. É preciso haver pelo menos uma vaga inicial por pessoa. Vagas extras podem ficar vazias.
6. Clique nas fotos para marcar ou desmarcar vencedores. As conexões encaminham os vencedores aos próximos espaços. Pode haver mais de um vencedor; corrigir resultados atualiza o caminho seguinte e limpa vitórias dependentes.

O visual usa colagens em papel, fotos tipo polaroid, fitas, estrelas e disco ball. Fotos, nomes e mapa ficam somente no navegador. A câmera exige localhost/HTTPS e autorização do navegador.

`npm test` verifica a lógica de conexões, ciclos, sorteio e propagação. `npm run build` gera dist.

Os acessórios da câmera usam Three.js para renderização 3D e MediaPipe Face Landmarker para acompanhamento local de um rosto. O modelo oficial fica em `public/face-effects/face_landmarker.task`; os arquivos WASM em `public/face-effects/wasm` foram copiados da versão instalada de `@mediapipe/tasks-vision`. Ao atualizar essa dependência, atualize também esses arquivos WASM. O vídeo é processado no navegador. Escolha Sem efeito para fotografar caso o rastreamento não esteja disponível.
