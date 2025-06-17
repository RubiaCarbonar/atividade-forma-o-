let campo = {
  x: 0, // Campo começa na esquerda da tela
  y: 0,
  largura: 400,
  altura: 400,
  corCeu: [135, 206, 235], // Azul claro
  corTerra: [101, 67, 33], // Marrom
  corSol: [255, 255, 0], // Amarelo
  estacaoX: 300, // Posição X da estação no campo
};

let cidade = {
  x: 400, // Cidade começa na metade da tela
  y: 0,
  largura: 400,
  altura: 400,
  corPredios: [192, 192, 192], // Cinza claro
  estacaoX: 50, // Posição X da estação na cidade (relativa ao início da cidade)
};

let produtosNoCampo = []; // Produtos esperando para serem coletados
let produtosNoTrem = []; // Produtos sendo transportados
const MAX_PRODUTOS_TREM = 5; // Capacidade máxima do trem

let trem = {
  x: campo.estacaoX, // Inicia na estação do campo
  y: 350, // Altura da linha do trem
  largura: 60,
  altura: 30,
  velocidade: 0, // Trem parado inicialmente
  estaCarregando: false,
  estaDescarregando: false,
};

let mercado = {
  x: cidade.x + cidade.estacaoX + 80, // Posição do mercado na cidade
  y: 300,
  largura: 80,
  altura: 50,
  nivelEstoque: 10, // Nível inicial de estoque
  maxEstoque: 30,
  demanda: 0.03, // Taxa de consumo do estoque por frame
};

let pontuacao = 0;
let tempoJogo = 0; // Para controle de eventos do jogo (geração de produtos, etc.)

let estadoJogo = 'JOGANDO'; // Estados: 'JOGANDO', 'FIM_DE_JOGO'

// --- Setup do Jogo ---
function setup() {
  createCanvas(800, 400);
  frameRate(60);

  // Gera alguns produtos iniciais no campo
  for (let i = 0; i < 5; i++) {
    gerarProdutoNoCampo();
  }
}

// --- Loop Principal do Jogo ---
function draw() {
  if (estadoJogo === 'JOGANDO') {
    background(220); // Cor de fundo geral

    // Desenha Cenários
    drawCampo();
    drawCidade();
    drawFerrovia();

    // Atualiza e Desenha Produtos no Campo
    for (let i = produtosNoCampo.length - 1; i >= 0; i--) {
      produtosNoCampo[i].display();
    }

    // Atualiza e Desenha o Trem
    updateTrem();
    drawTrem();

    // Atualiza e Desenha o Mercado
    updateMercado();
    drawMercado();

    // Exibe Informações do Jogo (HUD)
    drawHUD();

    // Geração de produtos no campo
    if (frameCount % 180 === 0 && produtosNoCampo.length < 15) { // Gera a cada 3 segundos
      gerarProdutoNoCampo();
    }

    // Aumenta o tempo do jogo
    tempoJogo++;

    // Verifica condição de derrota
    if (mercado.nivelEstoque <= 0) {
      estadoJogo = 'FIM_DE_JOGO';
    }

  } else if (estadoJogo === 'FIM_DE_JOGO') {
    drawTelaFimDeJogo();
  }
}

// --- Funções de Desenho ---

function drawCampo() {
  push(); // Salva as configurações de estilo atuais
  translate(campo.x, campo.y); // Move o sistema de coordenadas para o campo
  fill(campo.corCeu);
  rect(0, 0, campo.largura, campo.altura); // Céu do campo
  fill(campo.corTerra);
  rect(0, campo.altura / 2, campo.largura, campo.altura / 2); // Terra do campo
  fill(campo.corSol);
  ellipse(50, 50, 80, 80); // Sol
  // Estação no campo
  fill(150, 100, 50); // Marrom da estação
  rect(campo.estacaoX - 30, campo.altura - 50, 60, 20); // Plataforma da estação
  pop(); // Restaura as configurações de estilo
}

function drawCidade() {
  push();
  translate(cidade.x, cidade.y); // Move o sistema de coordenadas para a cidade
  fill(cidade.corPredios);
  rect(0, 0, cidade.largura, cidade.altura); // Base da cidade (céu e chão)
  // Alguns prédios simples
  fill(160, 160, 160);
  rect(20, 150, 50, 200); // Prédio 1
  rect(90, 100, 60, 250); // Prédio 2
  rect(180, 180, 40, 170); // Prédio 3
  // Estação na cidade
  fill(150, 100, 50); // Marrom da estação
  rect(cidade.estacaoX - 30, cidade.altura - 50, 60, 20); // Plataforma da estação
  pop();
}

function drawFerrovia() {
  stroke(50, 50, 50); // Cor dos trilhos
  strokeWeight(3);
  line(0, trem.y + 15, width, trem.y + 15); // Linha principal (trilho)
  // Dormentes (linhas transversais)
  for (let x = 0; x < width; x += 20) {
    line(x, trem.y + 5, x, trem.y + 25);
  }
  noStroke();
}

function drawTrem() {
  fill(100, 50, 0); // Cor do trem (laranja escuro)
  rect(trem.x, trem.y, trem.largura, trem.altura);
  // Rodas
  fill(50);
  ellipse(trem.x + trem.largura * 0.25, trem.y + trem.altura, 15, 15);
  ellipse(trem.x + trem.largura * 0.75, trem.y + trem.altura, 15, 15);

  // Desenha os produtos sendo transportados (visualização simples)
  for (let i = 0; i < produtosNoTrem.length; i++) {
    fill(produtosNoTrem[i].cor);
    ellipse(trem.x + 10 + (i * 10), trem.y + 5, 8, 8); // Pequenas bolinhas no trem
  }
}

function drawMercado() {
  fill(200, 100, 0); // Cor do mercado (laranja)
  rect(mercado.x, mercado.y, mercado.largura, mercado.altura);
  fill(0);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("Mercado", mercado.x + mercado.largura / 2, mercado.y + 15);
  textAlign(LEFT, BASELINE); // Resetar para o padrão

  // Nível do estoque no mercado (barra de progresso)
  fill(0, 180, 0); // Verde para o estoque
  let estoqueAltura = map(mercado.nivelEstoque, 0, mercado.maxEstoque, 0, mercado.altura - 20);
  rect(mercado.x + 10, mercado.y + mercado.altura - 10 - estoqueAltura, mercado.largura - 20, estoqueAltura);
  noFill();
  stroke(0);
  rect(mercado.x + 10, mercado.y + 10, mercado.largura - 20, mercado.altura - 20); // Borda do estoque
  noStroke();
}

function drawHUD() {
  fill(0);
  textSize(18);
  text(`Pontuação: ${pontuacao}`, 10, 30);
  text(`Produtos no Trem: ${produtosNoTrem.length} / ${MAX_PRODUTOS_TREM}`, 10, 60);
  text(`Estoque do Mercado: ${floor(mercado.nivelEstoque)} / ${mercado.maxEstoque}`, 10, 90);

  if (mercado.nivelEstoque <= 5 && mercado.nivelEstoque > 0) {
    fill(255, 0, 0);
    textSize(20);
    text("ESTOQUE BAIXO! Entregue rápido!", width / 2 - 150, 30);
  }
}

function drawTelaFimDeJogo() {
  background(0); // Fundo preto
  fill(255); // Texto branco
  textSize(48);
  textAlign(CENTER, CENTER);
  text("FIM DE JOGO!", width / 2, height / 2 - 50);
  textSize(32);
  text(`Sua Pontuação Final: ${pontuacao}`, width / 2, height / 2 + 20);
  textSize(20);
  text("Pressione 'R' para Reiniciar", width / 2, height / 2 + 80);
  textAlign(LEFT, BASELINE); // Resetar
}

// --- Lógica do Jogo ---

function gerarProdutoNoCampo() {
  // Posição aleatória dentro da área da terra do campo
  produtosNoCampo.push(new Produto(
    random(campo.x + 10, campo.x + campo.largura - 10),
    random(campo.altura / 2 + 10, campo.altura - 10)
  ));
}

function updateTrem() {
  trem.x += trem.velocidade;

  // Limita o trem dentro da tela
  trem.x = constrain(trem.x, 0, width - trem.largura);

  // Lógica de Carregamento no Campo
  let tremNoCampoEstacao = dist(trem.x + trem.largura / 2, trem.y, campo.estacaoX + campo.x, trem.y) < 50;
  if (trem.velocidade === 0 && tremNoCampoEstacao && produtosNoTrem.length < MAX_PRODUTOS_TREM) {
    // Se estiver parado na estação do campo e houver produtos para carregar
    trem.estaCarregando = true;
  } else {
    trem.estaCarregando = false;
  }

  if (trem.estaCarregando && produtosNoCampo.length > 0 && frameCount % 15 === 0) { // Carrega um produto a cada 0.25s
    produtosNoTrem.push(produtosNoCampo.pop()); // Move produto do campo para o trem
    pontuacao += 5; // Pontua por coletar
  }

  // Lógica de Descarregamento na Cidade
  let tremNaCidadeEstacao = dist(trem.x + trem.largura / 2, trem.y, cidade.x + cidade.estacaoX, trem.y) < 50;
  if (trem.velocidade === 0 && tremNaCidadeEstacao && produtosNoTrem.length > 0) {
    // Se estiver parado na estação da cidade e houver produtos para descarregar
    trem.estaDescarregando = true;
  } else {
    trem.estaDescarregando = false;
  }

  if (trem.estaDescarregando && mercado.nivelEstoque < mercado.maxEstoque && frameCount % 15 === 0) { // Descarrega um produto a cada 0.25s
    produtosNoTrem.pop(); // Remove produto do trem
    mercado.nivelEstoque += 1; // Adiciona ao estoque do mercado
    pontuacao += 15; // Pontua por entregar
  }
}

function updateMercado() {
  // Mercado consome estoque ao longo do tempo
  mercado.nivelEstoque -= mercado.demanda;
  mercado.nivelEstoque = max(0, mercado.nivelEstoque); // Não deixa o estoque ser negativo
}

// --- Controles (Teclado) ---
function keyPressed() {
  if (estadoJogo === 'JOGANDO') {
    if (keyCode === RIGHT_ARROW) { // Mover para direita
      trem.velocidade = 3;
    } else if (keyCode === LEFT_ARROW) { // Mover para esquerda
      trem.velocidade = -3;
    } else if (key === ' ') { // Parar (barra de espaço)
      trem.velocidade = 0;
    }
  } else if (estadoJogo === 'FIM_DE_JOGO') {
    if (key === 'r' || key === 'R') {
      reiniciarJogo();
    }
  }
}

function reiniciarJogo() {
  pontuacao = 0;
  tempoJogo = 0;
  mercado.nivelEstoque = 10;
  produtosNoCampo = [];
  produtosNoTrem = [];
  trem.x = campo.estacaoX;
  trem.velocidade = 0;
  trem.estaCarregando = false;
  trem.estaDescarregando = false;
  estadoJogo = 'JOGANDO';

  for (let i = 0; i < 5; i++) {
    gerarProdutoNoCampo();
  }
}


// --- Classe Produto ---
class Produto {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tamanho = random(10, 15);
    // Cores de frutas/vegetais: verde, vermelho, laranja, roxo
    let coresProdutos = [
      color(100, 200, 50), // Verde claro
      color(220, 50, 50), // Vermelho tomate
      color(255, 165, 0), // Laranja
      color(150, 50, 200) // Roxo
    ];
    this.cor = random(coresProdutos);
  }

  display() {
    fill(this.cor);
    noStroke();
    ellipse(this.x, this.y, this.tamanho, this.tamanho);
  }
}