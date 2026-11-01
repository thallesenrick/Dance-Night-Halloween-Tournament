# Halloween Ball Night

Aplicação React e Vite para montar torneios de dança, cadastrar participantes e sortear músicas. A interface usa a estética scrapbook, com colagens, papel rasgado, fitas e uma roleta em forma de vitrola, nos modos claro e escuro.

## Executar

Com Node.js e npm instalados:

```sh
npm install
npm run dev
```

Abra o endereço informado pelo Vite no navegador.

## Usar o torneio

1. Clique em **Começar o torneio**. Na barra de ferramentas, **Selecionar** move os cards; **Adicionar slot** cria espaços ao clicar no mapa ou arrastar o botão; **Conectar** liga as fases. **Criar torneio** gera oito vagas iniciais, duas chaves, final e campeão.
2. Ligue a saída à direita de um card à entrada à esquerda de outro, por clique ou arraste. A conexão facilita a seleção por proximidade. Arraste o fundo para navegar e use o zoom ou **Ajustar à tela**.
3. Na barra lateral, adicione participantes com nome, emojis e foto pela câmera ou por upload. A câmera oferece acessórios 3D animados. Ao recolher a lista, as ferramentas de cima também são escondidas e fica apenas o atalho de início; o botão lateral expande os dois novamente.
4. Clique em **Sortear participantes** para acompanhar a animação dos papéis no saco. Cada pessoa ocupa uma vaga inicial, sem repetição; são necessárias vagas suficientes. Um novo sorteio pede confirmação antes de substituir a distribuição.
5. Clique nas fotos para marcar ou desmarcar vencedores. As conexões encaminham quem avança; corrigir um resultado atualiza as fases seguintes. A comemoração do campeão, com foto e confetes, permanece até ser fechada.

## Roleta de músicas

Abra **Selecionar próxima música** e escolha o filtro de **1, 2, 3 ou 4 pessoas**. O disco gira com som de catraca que desacelera junto com a animação, destaca a faixa escolhida duas vezes e abre o resultado por quatro segundos.

O ícone de lápis abre o editor, com abas por quantidade de participantes, busca, adição, edição, exclusão e reordenação. Exclusões e mudanças de ordem são salvas automaticamente. Para adicionar ou editar uma faixa, preencha o formulário e clique em salvar.

## Tablet Android

### Mesmo Wi-Fi

```sh
npm run dev:tablet
```

O servidor usa a porta **5175**. No tablet, abra no Chrome o endereço exibido pelo Vite em **Network**, com o IP atual do computador. O IP pode mudar ao reconectar a rede. Os aparelhos precisam estar no mesmo Wi-Fi, e o computador deve permanecer ligado com o servidor em execução. No tablet, `localhost` aponta para o próprio tablet.

A câmera exige localhost ou HTTPS e permissão do navegador. No acesso por HTTP pelo IP, use o upload de foto.

### HTML único offline

```sh
npm run export:tablet
```

Copie `exports/Halloween-Ball-Tablet.html` para o tablet e abra em um navegador com JavaScript. O arquivo incorpora código, estilos, imagens, fonte e recursos dos efeitos, funcionando sem internet ou servidor. As instruções ficam em `exports/COMO-USAR-NO-TABLET.txt`. A câmera depende do suporte e das permissões do navegador para arquivos locais; o upload continua disponível.

Gere o HTML novamente após alterar o projeto. A exportação inclui as músicas originais e não copia os dados de outra instalação.

## Dados e câmera

Progresso, nomes, fotos, mapa e biblioteca de músicas ficam em `localStorage`, por navegador e endereço de acesso. Computador e tablet não sincronizam esses dados. Limpar os dados do navegador remove o conteúdo salvo.

Three.js renderiza os acessórios 3D, e MediaPipe Face Landmarker acompanha o rosto localmente no navegador. O modelo está em `public/face-effects/face_landmarker.task`; os arquivos WASM ficam em `public/face-effects/wasm`. Ao atualizar `@mediapipe/tasks-vision`, mantenha os arquivos WASM sincronizados com a versão instalada. Escolha **Sem efeito** quando o rastreamento não estiver disponível.

## Verificação e build

```sh
npm test
npm run build
```

A suíte atual contém 23 testes de conexões, ciclos, sorteio, avanço de vencedores, biblioteca de músicas e identificadores. O build gera `dist/`. Se o carregador de configuração apresentar erro de permissão no Windows, use `npm run build -- --configLoader runner`.
