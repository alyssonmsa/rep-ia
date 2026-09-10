# Prompter — Documento de handoff

Documento único de contrato para construção do MVP. Tudo aqui já foi decidido em discussão de produto. Onde houver dúvida, siga o que está escrito antes de inventar alternativa.

---

## 1. O que estamos construindo

Um teleprompter web para músicos de palco pequeno. O usuário guarda suas letras, monta o repertório do show, e lê no celular ou tablet enquanto toca.

**Frase de posicionamento:**

> Transforma qualquer celular ou tablet em painel de palco legível e controlável sem as mãos, funcionando offline, sem instalar app de loja.

**Definição de sucesso do MVP:** um cantor sobe no palco na sexta à noite com o repertório dele no celular, toca 3 horas sem tocar na tela com a mão suja de corda, e sem depender de internet.

---

## 2. Quem usa

Cantor solo de voz e violão, tocando em bar. Repertório de 40 a 200 músicas. Já tem tudo num arquivo `.txt` ou `.doc` montado ao longo dos anos.

Características que determinam decisões de projeto:

- Toca segurando o instrumento, com as mãos ocupadas
- Palco escuro ou refletor na cara, aparelho numa estante a cerca de 1 metro
- Sessão contínua de 2 a 4 horas com a tela ligada
- Wi-Fi do bar não existe, 4G cai
- **A ordem do show muda o tempo todo** por pedido do público. A setlist é uma fila sugerida, não um roteiro fechado
- Nem todo usuário tem familiaridade com tecnologia. A interface precisa ser óbvia sem tutorial

---

## 3. Princípios de produto

1. **O modo palco não pode falhar.** Zero requisição de rede enquanto estiver ativo. Um bug em palco destrói a confiança de forma irrecuperável.
2. **Nenhuma ação de palco exige mais de um toque.**
3. **Regra previsível vale mais que algoritmo esperto.** Um parser que acerta 100% dentro de um contrato claro é melhor que um que acerta 85% com mágica que ninguém entende.
4. **O produto nunca descarta dado do usuário em silêncio.**
5. **Sem login, sem servidor, sem custo.** Dados no dispositivo.
6. **O usuário sempre consegue sair.** Exportação disponível desde o primeiro dia.

---

## 4. Stack e restrições

- **PWA estático.** Sem backend, sem autenticação, sem banco remoto.
- Persistência em **IndexedDB**. Use uma camada fina (`idb`) em vez de escrever a API crua.
- **Service worker** com precache do shell. O app abre 100% offline.
- **Manifest** com `display: standalone` e ícones.
- Framework de sua preferência, desde que o bundle final seja leve e o primeiro carregamento rápido em 3G ruim.
- Sem dependência de fonte remota em runtime: **empacote as fontes** no precache, senão o modo palco quebra offline.

### Duas armadilhas de plataforma que precisam ser tratadas

**Wake Lock.** Use a Screen Wake Lock API. Ela é liberada automaticamente quando a aba perde visibilidade, então reative no evento `visibilitychange` ao voltar. Se a API não existir no navegador, avise o usuário para desligar o bloqueio de tela nas configurações do aparelho. Não deixe falhar em silêncio.

**Fullscreen no iOS Safari.** `requestFullscreen` não funciona no Safari do iPhone. A única forma de esconder a barra do navegador é a PWA instalada em modo standalone. Some a isso o fato de o Safari limpar storage de sites não instalados após períodos de inatividade. **Conclusão: a instalação na tela de início é obrigatória para o produto funcionar bem no iPhone.** O onboarding precisa empurrar isso com clareza, e a exportação existe como rede de segurança.

---

## 5. Modelo de dados

Mantenha exatamente estes campos. Nada de tom, BPM, capotraste ou anotação de arranjo no MVP.

```ts
type Musica = {
  id: string
  titulo: string        // primeira linha não vazia do bloco, sem parsing de artista
  letra: string         // corpo bruto, preservado byte a byte após normalização
  cifrada: boolean      // derivado na importação, corrigível pelo usuário
  criadoEm: number
  atualizadoEm: number
}

type ItemSetlist = {
  id: string
  ordem: number
  texto: string             // sempre presente. É o que aparece no palco
  musicaId: string | null   // vínculo opcional com o acervo
  tipo: 'musica' | 'marcador'
}

type Setlist = {
  id: string
  nome: string
  itens: ItemSetlist[]
  criadoEm: number
  atualizadoEm: number
}

type LotesImportacao = {
  id: string
  musicaIds: string[]
  importadoEm: number
}
```

### Regras do modelo

**Título é uma string única.** Não separe artista. `Sozinho - Ao Vivo` é um título inteiro. Separar por hífen quebraria títulos legítimos e criaria dado que teria de ser migrado depois.

**Acervo e setlist são entidades separadas.** `ItemSetlist` sempre tem `texto`. O vínculo com o acervo é opcional, e essa nulidade é o modo normal de operação, não um erro. Um músico monta a setlist correndo antes do show, digitando nomes que talvez não estejam no acervo ainda.

**Excluir música do acervo não cascateia.** Apenas zera o `musicaId` dos itens que apontavam para ela. O item continua na setlist com o texto intacto, só sem letra disponível. Sem diálogo assustador, sem órfão.

**O que aparece no palco é o `texto` do item, sempre**, mesmo quando vinculado. O usuário escreve coisas como `Só Você (abre o show)` ou `Evidências - versão acelerada`, e isso é anotação dele. Nunca substitua pelo título da música. O título só aparece dentro da tela de letra.

**Marcadores são itens sem vínculo** com `tipo: 'marcador'`. É assim que o usuário organiza o show em blocos:

```
BLOCO 1 - ROMÂNTICAS     ← marcador
Só Você                  ← música vinculada
Evidências               ← música vinculada
INTERVALO                ← marcador
BLOCO 2 - AGITADAS       ← marcador
```

**`LotesImportacao`** existe só para viabilizar o desfazer em lote. Pode ser descartado depois de alguns dias, mas mantenha pelo menos o último.

---

## 6. Formato de texto

Contrato único, usado tanto para colar quanto para importar arquivo e exportar.

### Gramática

1. O texto é uma sequência de blocos.
2. Um bloco termina numa linha que contenha **apenas** `/END`, ou no fim do texto.
3. Dentro do bloco, a **primeira linha não vazia** é o título.
4. Todo o restante é a letra.

Não existe mais nenhuma regra. Sem metadados, sem separação de artista, sem detecção de seção.

### Exemplo canônico

```
SÓ VOCÊ

Demorei muito pra te encontrar
Agora eu quero só você
Teu jeito todo especial de ser
Eu fico louco com você

Te abraço e sinto coisas que eu não sei dizer
Só sinto com você

Tava cansado...
/END

Evidências
Quando eu digo que deixei de te amar
É porque eu te amo
/END
```

### Preservação — leia com atenção

**Linhas em branco dentro da letra são dado, não formatação.** Elas separam estrofes, e a estrofe é a unidade de navegação no modo palco. Não colapse múltiplas linhas em branco. Não faça `trim` do corpo. Não normalize espaçamento interno.

A única linha em branco descartada é a que separa o título da primeira estrofe (as linhas vazias entre o título e o início do corpo).

**Espaços à esquerda são preservados**, porque em música cifrada eles alinham o acorde com a sílaba.

### Normalização antes de parsear

Aplique nesta ordem, sobre o texto inteiro:

1. Remover BOM UTF-8 (`\uFEFF`) do início
2. `\r\n` e `\r` → `\n`
3. `\u00A0` (espaço não separável) → espaço comum

O terceiro é crítico e não óbvio: arquivos exportados do Google Docs e do Word contêm nbsp em posições arbitrárias. Uma linha que parece vazia mas contém um nbsp não é vazia para o seu código, e isso quebra tanto a detecção de título quanto a separação de estrofes.

Não converta `…` para `...`. Não mexa em acentuação. Não faça mais nenhuma normalização.

### Tabela de bordas

| Caso | Comportamento esperado |
|---|---|
| `/end`, `/End`, `/END ` (com espaços) | Aceita. Case-insensitive, trim nas pontas |
| `/FIM` sozinho na linha | Aceita na leitura. Exporta sempre `/END` |
| `/END` no meio de uma linha de letra | Não é terminador. Só conta sozinho na linha |
| Último bloco sem `/END` | Aceita. Fim do texto fecha o bloco |
| Texto sem nenhum `/END` | Um bloco só. É o caso de colar uma música |
| Dois `/END` seguidos | Bloco vazio, ignora silenciosamente |
| Bloco só com título, sem letra | Cria a música com letra vazia e sinaliza aviso na revisão |
| Linhas vazias entre título e letra | Descarta |
| Linhas vazias no fim do bloco | Descarta |
| Linhas vazias no meio da letra | **Preserva exatamente** |
| Texto totalmente vazio | Zero músicas, sem erro |

### Assinaturas

```ts
normalizar(texto: string): string
splitBlocks(texto: string): string[]          // sem /END, devolve array de 1
parseBlock(bloco: string): { titulo: string, letra: string }
```

`splitBlocks` é o único lugar do sistema que conhece `/END`. Nada mais na aplicação, nem no editor, nem no modelo de dados, sabe que esse terminador existe.

### Exportação

Gere `.txt` no formato canônico acima, e também um `.json` com o backup fiel (que inclui `cifrada`, setlists e ids). O `.txt` é intercâmbio, o `.json` é backup.

Consequência aceitável e documentada: o flag `cifrada` corrigido manualmente se perde no round-trip de `.txt`, porque será redetectado na reimportação.

### Teste de round-trip

O teste mais valioso do parser: importar um `.txt`, exportar, importar de novo, comparar. Sem metadados no formato, **a igualdade tem que ser exata**. Se não for, tem bug.

---

## 7. Detecção de cifra

O flag `cifrada` é **derivado na importação**, nunca perguntado ao usuário. Ninguém marca 60 músicas uma a uma. O usuário corrige com um toggle no editor se a detecção errar.

### O sinal correto é alinhamento, não maiúscula

Uma linha de cifra tem múltiplos espaços entre os tokens, porque cada acorde foi posicionado acima de uma sílaba:

```
      G              Em
Quando eu digo que deixei de te amar
```

### Critério

Uma linha é **candidata a cifra** se todas as condições valerem:

1. A linha não está vazia
2. Todos os tokens (separados por espaço) casam com o padrão de acorde
3. Tem 2 ou mais tokens **ou** algum token tem sufixo (`m`, `7`, `sus4`, `/G`, etc.)
4. Contém pelo menos uma sequência de 2 ou mais espaços consecutivos

A música recebe `cifrada: true` se tiver **2 ou mais linhas candidatas**.

Padrão de acorde inicial:

```
/^[A-G][#b]?(m|maj|min|dim|aug|sus|add|º|°)?\d*(\/[A-G][#b]?)?$/
```

### Falso positivo em português

Vários acordes são palavras comuns na nossa língua: `Em`, `A`, `E`, `Dó`, `Lá`, `Ré`, `Si`. Uma linha de letra que seja apenas `A` ou `Em` casaria com um padrão ingênuo.

As condições 3 e 4 juntas eliminam quase todos esses casos. O toggle manual cobre o resto. **Prefira errar para o lado de `false`**: uma música cifrada tratada como letra pura fica desalinhada mas legível; uma letra pura tratada como cifra fica com fonte monoespaçada e zoom travado sem motivo.

### O que o flag controla no modo palco

| | `cifrada: false` | `cifrada: true` |
|---|---|---|
| Fonte | Proporcional (Barlow Semi Condensed) | Monoespaçada (IBM Plex Mono) |
| Quebra de linha | Quebra normalmente | **Não pode quebrar** |
| Espaços à esquerda | Irrelevantes | Preservados |
| Zoom | Livre | Limitado pela linha mais longa |

**A quebra de linha é o problema técnico real.** Se uma linha quebrar no celular em retrato, o acorde que estava acima dela fica alinhado com nada e o violonista perde a referência.

Solução para o MVP: em música cifrada, calcular a maior fonte em que a linha mais longa cabe na largura da tela, e usar isso como teto do zoom. Se o teto resultar em algo ilegível, mostrar um aviso discreto sugerindo virar o aparelho. Não é bonito, mas é honesto, e é o que os concorrentes fazem.

---

## 8. Telas

Cinco telas. Nada além disso no MVP.

### 8.1 Acervo

Lista das músicas, ordenada por título. Busca no topo, sempre visível.

A busca precisa ser **sem acento e por trecho no meio da palavra**. Quem digita `evidencia` tem que achar `Evidências`. Normalize com `NFD` e remoção de diacríticos nos dois lados da comparação.

Ações: adicionar letra, importar arquivo, exportar, abrir música para edição.

Estado vazio: convite direto para colar a primeira letra ou importar o arquivo que ele já tem. Nunca uma tela em branco com um ícone triste.

### 8.2 Colar letra

Um campo de texto grande, um botão. Nada mais.

Comportamento:

- `splitBlocks` roda no texto colado
- **1 bloco** → preview do título detectado, salva direto
- **2 ou mais blocos** → vai para a tela de revisão (8.3)

O segundo caso acontece quando o usuário cola um trecho com `/END`. Não trate como erro nem bloqueie: aproveite. Como o `splitBlocks` já existe, custa uma condição.

### 8.3 Revisão de importação

Aparece para importação de arquivo **sempre**, e para colagem com 2 ou mais blocos.

Mostra:

- Contagem: `62 músicas encontradas`
- Lista dos títulos detectados, com as primeiras linhas de cada letra como prévia
- Aviso nos blocos sem letra
- **Duplicatas por título normalizado**, com três escolhas: pular os repetidos, substituir, ou importar mesmo assim. Padrão: **pular**
- Botão de confirmar

Depois de confirmar, mostre um aviso persistente por alguns segundos com **desfazer esta importação**. Isso é o que permite o usuário arriscar o primeiro import sem medo, e é o que salva ele quando o arquivo estava mal formatado.

**Fallback para arquivo legado.** Se o arquivo tem mais de 80 linhas e **zero** ocorrências de `/END`, não parseie. Mostre uma tela explicando que o arquivo não segue o formato, com o texto num editor e um botão para inserir `/END` na posição do cursor. O usuário faz esse trabalho uma vez, exporta no formato novo, e nunca mais.

O texto dessa tela precisa ser instrução, não reclamação. Algo como: *"Este arquivo não tem marcações de fim de música. Coloque `/END` numa linha sozinha ao terminar cada letra, ou use o botão abaixo."*

### 8.4 Setlist

Lista de itens, arrastar e soltar para reordenar.

Adicionar item: campo com **autocomplete sobre o acervo**. Duas regras não negociáveis:

1. Busca sem acento e por trecho no meio da palavra
2. A primeira opção da lista é **sempre** "usar o que digitei". Sem isso, o autocomplete vira obstáculo quando a música não está no acervo

**Vinculação tardia.** O caso mais provável: ele digita 20 itens à mão na terça e importa o acervo na quinta. Trate assim:

- Ao abrir a setlist, tentar casar itens sem vínculo por título normalizado (minúsculas, sem acento, sem pontuação, ignorando o que estiver entre parênteses). Casou, vincula sozinho
- Ao terminar uma importação, avisar: `12 itens das suas setlists agora têm letra disponível`

Duplicar setlist de show anterior é uma ação de um toque.

### 8.5 Modo palco

A tela que define o produto. Duas visões dentro dela, e a transição entre as duas é o fluxo principal.

**Visão de fila.** Os itens da setlist em lista vertical.

- Item com letra disponível: texto em brilho pleno, com um chevron discreto à direita
- Item sem letra: cinza médio
- Marcador: menor, com uma linha divisória acima

A diferença entre disponível e não disponível é **brilho, não símbolo**. Ícone pequeno não sobrevive ao teste de 1 metro em palco escuro, e símbolo novo exige aprendizado.

**Item sem letra não pode parecer erro.** Sem ícone de alerta, sem vermelho, sem borda tracejada. Cinza significa "não tem letra aqui", e isso é legítimo. Tocar nele marca como atual e não faz mais nada.

Altura mínima da linha: 56px. O alvo de toque é a linha inteira. Ele vai tocar com o polegar segurando o violão.

**Visão de letra.** Abre ao tocar num item vinculado, com as preferências de exibição já aplicadas.

- Navegação por estrofe: as linhas em branco da letra são os limites. Avançar mostra a próxima estrofe, ou quantas couberem na tela
- Zonas de toque grandes: metade direita avança, metade esquerda volta. Sem botão visível
- Voltar para a fila: um toque numa área dedicada no topo, ou gesto para baixo
- **Busca rápida sem sair do modo palco.** Essa é a história mais subestimada de todo o backlog, e é o que faz o produto sobreviver ao pedido do público num bar de verdade. Resultado em fonte grande, no máximo 3 letras digitadas, um toque para abrir
- Autoscroll contínuo com velocidade ajustável e salva por música, como alternativa à navegação por estrofe

**Sobre autoscroll:** rolagem em velocidade fixa desalinha na primeira variação de andamento e o músico se perde. Por isso a navegação por estrofe é o padrão e o autoscroll é a opção, invertendo a intuição comum. Construa os dois e deixe o palco decidir.

**Atalhos de teclado.** Seta direita e espaço avançam, seta esquerda volta. Isso não é uma feature de acessibilidade secundária: **pedais Bluetooth de virar página se anunciam como teclado HID**, então tratar `keydown` te dá suporte a pedal quase de graça. É a feature mais vendável do produto entre músicos, e a que gera boca a boca.

---

## 9. Design

### Direção

O produto vive no palco, não no escritório. A referência visual é o painel de equipamento de palco: preto anodizado, brilho âmbar de válvula, marcação clara e nada supérfluo. Não é um aplicativo de produtividade com tema escuro.

**Restrições explícitas do cliente:**

- Interface moderna, mas **sem excesso de ícones**. Prefira rótulo em texto. O único ícone recorrente permitido é o chevron indicando letra disponível
- Usabilidade acima de sofisticação. O usuário pode ter pouca familiaridade com tecnologia
- Nada de linguagem de sistema na interface. O usuário organiza o show, não gerencia entidades

**Evite:** cartões arredondados idênticos para tudo, sombra cinza suave sob cada elemento, rótulo em caixa alta espaçada acima de cada título, seta `→` colada no texto dos botões, gradiente como decoração, animação de entrada em cada seção.

### Três temas

Aplicam-se à tela de setlist e à tela de letra. Preferência global, trocável em dois toques.

**Escuro** — padrão, uso geral e ensaio.

```css
--fundo:            #16181C
--superficie:       #1E2126
--superficie-alta:  #272B31
--texto:            #ECEEF1
--texto-fraco:      #9AA1AB
--borda:            #333840
--acento:           #E0A458   /* âmbar de válvula */
--sucesso:          #5FB48A   /* verde de afinador */
```

**Claro** — luz do dia, montagem de repertório, ensaio de tarde.

```css
--fundo:            #FAF9F7
--superficie:       #FFFFFF
--superficie-alta:  #F1EFEC
--texto:            #1A1C20
--texto-fraco:      #5C636D
--borda:            #E2E1DD
--acento:           #B07430
--sucesso:          #2F7D5C
```

**Teleprompter clássico** — palco escuro, contraste máximo, economia de bateria em tela OLED.

```css
--fundo:            #000000   /* preto real, não grafite */
--superficie:       #000000
--superficie-alta:  #000000
--texto:            #FFFFFF   /* branco real */
--texto-fraco:      #8C8C8C
--borda:            transparent
--acento:           #E0A458
--sucesso:          #8C8C8C
```

O tema clássico é deliberadamente diferente do escuro, e a diferença tem que ser visível: **preto puro e branco puro, sem superfície elevada, sem borda, sem cartão, sem sombra**. Fonte padrão dois passos maior. É a única tela do produto onde não existe hierarquia visual além do brilho do texto.

### Tipografia

Três papéis distintos:

- **Interface:** Archivo. Grotesca de altura de x elevada, formas abertas, legível em tamanho pequeno.
- **Letras:** Barlow Semi Condensed. A condensação é uma escolha de conteúdo, não estética: cabem mais caracteres por linha num celular em retrato sem reduzir o corpo da fonte, que é exatamente o problema do palco.
- **Cifra:** IBM Plex Mono. Monoespaçada é obrigatória para o alinhamento acorde/sílaba.

Empacote as três no precache do service worker. Se elas dependerem de rede, o modo palco quebra offline.

Escala de corpo no modo palco, ajustável pelo usuário e persistida por música:

```
28 · 34 · 40 · 48 · 58 · 70 · 84 px
```

Entrelinha generosa nas letras (cerca de 1.5). Em cifra, entrelinha mais apertada (cerca de 1.25) para que o acorde fique visualmente colado à sua linha de letra.

### Controle de exibição

Um único controle, acessível de dentro do modo palco sem sair da música:

- Tamanho da fonte: dois botões grandes, mais e menos
- Tema: três opções nomeadas
- Orientação: nenhum controle. Respeite o aparelho

Nada de painel de configuração com abas. Se não couber num painel deslizante de uma tela, é feature demais.

### Piso de qualidade

Responsivo até 320px de largura. Foco de teclado visível (o usuário de pedal navega por teclado). `prefers-reduced-motion` respeitado. Contraste mínimo AA em todos os três temas, verificado, não presumido.

---

## 10. Backlog na ordem de construção

Construa por fatia de risco, não por épico. A ordem abaixo existe para que o mais difícil e mais incerto seja provado primeiro.

### Fatia 1 — Prove o difícil

Modo palco com 3 músicas escritas em código. Sem banco, sem tela de edição, sem importação.

- [ ] Tela cheia, tema escuro, fonte grande
- [ ] Navegação por estrofe com zonas de toque
- [ ] Wake Lock com reativação em `visibilitychange`
- [ ] Ajuste de fonte em palco

**Critério de saída:** usar num show real. Se o wake lock falhar no iPhone ou a legibilidade for ruim a 1 metro, você descobre na semana 1 e não na semana 10.

### Fatia 2 — Torne real

- [ ] IndexedDB e camada de persistência
- [ ] Acervo: listar, buscar (sem acento, por trecho)
- [ ] Criar e editar música (campos título e letra, `/END` não aparece)
- [ ] Setlist: criar, adicionar item com autocomplete, reordenar, duplicar
- [ ] Item sem vínculo e marcador

### Fatia 3 — O formato

- [ ] `normalizar`
- [ ] `splitBlocks`
- [ ] `parseBlock`
- [ ] Colar letra: 1 bloco salva direto, 2+ vai para revisão
- [ ] Importar `.txt` com tela de revisão e contagem
- [ ] Detecção de duplicata
- [ ] Desfazer importação em lote
- [ ] Exportar `.txt` e `.json`
- [ ] Fallback para arquivo sem `/END`
- [ ] Teste de round-trip passando

### Fatia 4 — À prova de bar

- [ ] Busca rápida dentro do modo palco
- [ ] Detecção de cifra e renderização monoespaçada
- [ ] Teto de zoom em música cifrada
- [ ] Service worker, precache, manifest, instalável
- [ ] Vinculação tardia de itens de setlist
- [ ] Os três temas

### Fatia 5 — Compartilhável

- [ ] Atalhos de teclado e suporte a pedal
- [ ] Tela de teste de pedal ("pise no pedal para detectarmos")
- [ ] Repertório de exemplo no primeiro acesso
- [ ] Autoscroll contínuo com velocidade por música
- [ ] Onboarding empurrando a instalação na tela de início

---

## 11. Fixtures de teste

Crie estes arquivos antes de escrever o parser. São eles que impedem regressão quando o parser for mexido depois.

| Arquivo | O que exercita |
|---|---|
| `uma-musica.txt` | Bloco único sem `/END` |
| `tres-musicas.txt` | Formato canônico |
| `sem-end-no-ultimo.txt` | Fim de arquivo fechando o bloco |
| `estrofes.txt` | Linhas em branco internas preservadas |
| `com-cifra.txt` | Alinhamento e espaços à esquerda sobrevivem |
| `falso-positivo-cifra.txt` | Letra com versos `A`, `Em`, `E` isolados, detecção tem que dar `false` |
| `baguncado.txt` | CRLF, BOM, nbsp, `/end` minúsculo, `/FIM`, blocos vazios, espaços sobrando |
| `legado.txt` | 200 linhas, zero `/END`, exercita o fallback |
| `google-docs.txt` | Exportado de verdade do Google Docs, com nbsp e `…` |

Teste os dois caminhos de entrada com o mesmo conteúdo, porque produzem texto ligeiramente diferente: download como texto sem formatação, e cópia direta do documento para o campo de colar. Se os dois derem o mesmo resultado, o parser está robusto.

---

## 12. Fora de escopo

Não construa, não deixe gancho, não crie campo "para depois":

Login, conta, nuvem, sincronização entre dispositivos, colaboração de banda, tom e BPM como metadados, transposição, edição de acordes, PDF, partitura, metrônomo, backing track, busca automática de letra na internet, biblioteca pública compartilhada, importação de `.doc` e `.docx`.

**Sobre `.docx`:** fica de fora porque colar cobre o caso na prática. O usuário abre o Word, faz `Ctrl+A`, `Ctrl+C`, e cola. Isso adia a dependência do `mammoth.js` e todo o tratamento de imagem, tabela e formatação bagunçada.

**Sobre transposição:** sem modelo de acorde estruturado, transposição vira retrabalho garantido. Ela só faz sentido depois que existir a ferramenta de cifrar, que é o próximo passo do produto depois do MVP.

---

## 13. Riscos registrados

| Risco | Mitigação adotada |
|---|---|
| Direito autoral sobre letras | O usuário traz o conteúdo dele. Sem biblioteca pública, sem compartilhamento aberto de letras de terceiros, sem busca de letra na internet |
| Perda de dados no Safari iOS | Instalação empurrada no onboarding, exportação disponível desde o dia um |
| Falha em palco | Zero rede no modo palco, tudo em IndexedDB, precache completo |
| Onboarding frio (ninguém digita 40 músicas) | Importação em lote é o caminho principal, não a exceção |
| Virar "mais um app de cifra" | Não competimos por conteúdo. Competimos pelo momento do palco |