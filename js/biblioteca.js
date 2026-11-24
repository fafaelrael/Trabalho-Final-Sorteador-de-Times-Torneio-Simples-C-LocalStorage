// = Biblioteca de funções compartilhadas entre os .js =

// = TEXTO =

// Função para normalizar o texto: deixa tudo em minúsculo e troca cada letra acentuada pela letra sem acento.
function normalizarTexto(texto) {
    let minusculo = texto.toLowerCase();
    let comAcento = "áàâãéèêíìîóòôõúùûçñ";
    let semAcento = "aaaaeeeiiioooouuucn";
    let resultado = "";

    for (let i = 0; i < minusculo.length; i++) {
        let letra = minusculo[i];

        for (let j = 0; j < comAcento.length; j++) {
            if (letra == comAcento[j]) {
                letra = semAcento[j];
            }
        }

        resultado += letra;
    }

    return resultado;
}

// = LISTAS =

// Coloca um item na última posição da lista (faz o papel do .push())
function adicionarNoFim(lista, item) {
    lista[lista.length] = item;
}

// Coloca um valor no fim de uma matriz (lista de linhas).
// Se criarNovaLinha for true (ou a matriz ainda estiver vazia), cria uma linha nova e coloca o valor nela.
// Se for false, coloca o valor no fim da última linha.
function adicionarNoFimMatriz(matriz, valor, criarNovaLinha) {
    if (criarNovaLinha || matriz.length == 0) {
        adicionarNoFim(matriz, []);
    }

    adicionarNoFim(matriz[matriz.length - 1], valor);
}

// Devolve uma nova lista sem o item que está na posição indicada (faz o papel do .splice())
function removerPorPosicao(lista, posicao) {
    let novaLista = [];

    for (let i = 0; i < lista.length; i++) {
        if (i !== posicao) {
            adicionarNoFim(novaLista, lista[i]);
        }
    }

    return novaLista;
}





// Faz uma cópia da lista para não mexer na original
function copiarLista(lista) {
    let copia = [];

    for (let i = 0; i < lista.length; i++) {
        adicionarNoFim(copia, lista[i]);
    }

    return copia;
}

// Embaralhamento de Fisher-Yates do Roanald Fisher (Peixe Ronaldo). Embaralha a própria lista.
function embaralhar(lista) {
    for (let i = lista.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));

        let temporario = lista[i];
        lista[i] = lista[j];
        lista[j] = temporario;
    }
}

// = ARQUIVO =

// Lê todos os torneios salvos. Se não houver nenhum, devolve uma lista vazia.
function carregarTorneios() {
    let dados = localStorage.getItem("torneios");
    let torneios = [];

    if (dados) {
        torneios = JSON.parse(dados);
    }

    return torneios;
}

// Salva a lista de torneios inteira no localStorage
function salvarTorneios(torneios) {
    localStorage.setItem("torneios", JSON.stringify(torneios));
}

// Seleções (torneioSelecionado, jogadorSelecionado, equipeSelecionada) guardam só o código escolhido.
// Devolve null se não houver nada guardado.
function lerSelecao(chave) {
    return localStorage.getItem(chave);
}

function guardarSelecao(chave, codigo) {
    localStorage.setItem(chave, codigo);
}

function limparSelecao(chave) {
    localStorage.removeItem(chave);
}

// Devolve o torneio selecionado (ou null). Recebe a lista já carregada para que alterações nele possam ser salvas depois.
function obterTorneioSelecionado(torneios) {
    let codigo = lerSelecao("torneioSelecionado");
    let torneio = null;

    if (codigo !== null) {
        torneio = buscarPorCodigo(torneios, codigo);
    }

    return torneio;
}


// = CÓDIGOS =

// Posição do item cujo código bate com o digitado (ignora maiúsculas, acentos e espaços nas pontas). -1 se não existir.
function posicaoPorCodigo(lista, codigo) {
    let alvo = normalizarTexto(String(codigo).trim());
    let posicao = -1;

    for (let i = 0; i < lista.length; i++) {
        if (normalizarTexto(String(lista[i].codigo)) == alvo) {
            posicao = i;
        }
    }

    return posicao;
}

// O item inteiro (torneio, time ou jogador) que tem o código, ou null
function buscarPorCodigo(lista, codigo) {
    let posicao = posicaoPorCodigo(lista, codigo);
    let encontrado = null;

    if (posicao !== -1) {
        encontrado = lista[posicao];
    }

    return encontrado;
}

// Lista só os códigos de uma lista de torneios/times/jogadores
function listarCodigos(lista) {
    let codigos = [];

    for (let i = 0; i < lista.length; i++) {
        adicionarNoFim(codigos, lista[i].codigo);
    }

    return codigos;
}

// Confere se um código serve. Devolve "" se estiver tudo certo ou o texto do erro.
function validarCodigo(codigo, codigosUsados) {
    let limpo = codigo.trim();
    let erro = "";

    if (limpo == "") {
        erro = "O código não pode ficar vazio.";
    } else if (posicaoPorCodigo(montarListaDeCodigos(codigosUsados), limpo) !== -1) {
        erro = "O código '" + limpo + "' já está em uso. Escolha outro.";
    }

    return erro;
}

// Transforma uma lista de textos em uma lista de objetos { codigo } para reaproveitar posicaoPorCodigo
function montarListaDeCodigos(codigos) {
    let lista = [];

    for (let i = 0; i < codigos.length; i++) {
        adicionarNoFim(lista, { codigo: codigos[i] });
    }

    return lista;
}

// Cria um código como "T1", "T2"... que ainda não esteja na lista (usado só para atualizar dados antigos)
function gerarCodigoLivre(prefixo, codigosUsados) {
    let numero = 1;

    while (validarCodigo(prefixo + numero, codigosUsados) !== "") {
        numero++;
    }

    return prefixo + numero;
}

// = TABELAS =

// Apaga todas as linhas de um <tbody>
function limparTabela(tabela) {
    while (tabela.rows.length > 0) {
        tabela.deleteRow(0);
    }
}

// Coloca uma linha com uma única célula ocupando a tabela inteira (mensagens como "Nenhum jogador cadastrado.")
function adicionarLinhaUnica(tabela, colunas, texto) {
    let linha = tabela.insertRow();
    let celula = linha.insertCell(0);

    celula.colSpan = colunas;
    celula.innerText = texto;
}

// Pontuação só aparece se o torneio usa pontuação
function textoPontuacao(jogador, usarPontuacao) {
    let texto = "-";

    if (usarPontuacao) {
        texto = jogador.pontuacao;
    }

    return texto;
}