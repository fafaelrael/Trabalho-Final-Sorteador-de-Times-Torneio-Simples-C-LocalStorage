// = Biblioteca de funções compartilhadas entre os .js =


// = TEXTO =

// Função para normalizar o texto, aplicando três configurações
function normalizarTexto(texto) {
    return texto
        .normalize("NFD")// Decompõe o caractere acentuado na letra base e no acento isolado. Na memória do JavaScript (UTF-16 - cada caractere ocupa 2 bytes), a letra base passa a ocupar 2 bytes (1 unidade) e o acento isolado também ocupa 2 bytes (1 unidade). A string cresce de 2 bytes para 4 bytes.
        .replace(/[\u0300-\u036f]/g, "") // Finalmente, remove os acentos gerados pela função de cima. MUUUITO TOP
        .toLowerCase();
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

// Devolve uma nova lista sem nenhuma ocorrência do valor indicado
function removerValor(lista, valor) {
    let novaLista = [];

    for (let i = 0; i < lista.length; i++) {
        if (lista[i] !== valor) {
            adicionarNoFim(novaLista, lista[i]);
        }
    }

    return novaLista;
}

// Diz se o valor está na lista (comparação exata)
function contem(lista, valor) {
    let encontrou = false;

    for (let i = 0; i < lista.length; i++) {
        if (lista[i] === valor) {
            encontrou = true;
        }
    }

    return encontrou;
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

// Devolve uma cópia da lista de jogadores em ordem alfabética (ordenação por inserção, no lugar do .sort())
function ordenarPorNome(lista) {
    let copia = copiarLista(lista);

    for (let i = 1; i < copia.length; i++) {
        let atual = copia[i];
        let j = i - 1;

        while (j >= 0 && copia[j].nome.localeCompare(atual.nome, "pt-BR") > 0) {
            copia[j + 1] = copia[j];
            j--;
        }

        copia[j + 1] = atual;
    }

    return copia;
}


// = ARMAZENAMENTO (ARQUIVO)=

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


// = CÓDIGOS (torneio, time e jogador) =

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

// = TABELAS (sem innerHTML) =

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


// = JOGADORES =

// Pesquisa simples: só aparece o jogador cujo nome é IGUAL ao digitado (ignora maiúsculas e acentos).
// Pesquisa vazia mostra todos. Resultado em ordem alfabética.
function realizarPesquisa(torneio, pesquisa) {
    let resultados = [];
    let alvo = normalizarTexto(pesquisa.trim());

    for (let i = 0; i < torneio.jogadores.length; i++) {
        let jogador = torneio.jogadores[i];

        if (alvo == "" || normalizarTexto(jogador.nome) == alvo) {
            adicionarNoFim(resultados, jogador);
        }
    }

    return ordenarPorNome(resultados);
}

// Devolve os números de camisa de uma equipe, ignorando o jogador que está saindo dela
function numerosDaEquipeSem(torneio, equipe, codigoIgnorado) {
    let numeros = [];

    for (let i = 0; i < equipe.jogadores.length; i++) {
        if (equipe.jogadores[i] !== codigoIgnorado) {
            let jogador = buscarPorCodigo(torneio.jogadores, equipe.jogadores[i]);

            if (jogador) {
                adicionarNoFim(numeros, jogador.numeroCamisa);
            }
        }
    }

    return numeros;
}

// Confere o novo número de camisa digitado no formulário. Devolve "" se servir (inteiro >= 1 e livre no time de destino) ou o texto do erro.
function validarNovoNumero(numero, numerosOcupados) {
    let erro = "";

    if (Number.isNaN(numero) || numero < 1) {
        erro = "Digite um número inteiro maior ou igual a 1.";
    } else if (contem(numerosOcupados, numero)) {
        erro = "A camisa " + numero + " também já está em uso nesse time.";
    }

    return erro;
}

// Posição do valor na lista (comparação exata). -1 se não existir. (No lugar do .indexOf())
function posicaoNaLista(lista, valor) {
    let posicao = -1;

    for (let i = 0; i < lista.length; i++) {
        if (lista[i] === valor) {
            posicao = i;
        }
    }

    return posicao;
}


// = PARTIDAS =

// Gera os confrontos todos contra todos (método do círculo). Retorna uma lista de rodadas.
// Cada rodada tem os jogos e, se a quantidade de times for ímpar, quem folga.
// "jogos" é uma matriz: cada linha é um jogo, a coluna da esquerda (índice 0) é o timeA e a da direita (índice 1) é o timeB. Os times são guardados pelo índice deles.
function gerarConfrontos(quantidadeTimes) {
    let indices = [];

    for (let i = 0; i < quantidadeTimes; i++) {
        adicionarNoFim(indices, i);
    }

    // Embaralha para que gerar de novo possa resultar em uma ordem diferente
    embaralhar(indices);

    // Quantidade ímpar: adiciona um "time fantasma" (null). Quem enfrentá-lo folga na rodada.
    if (indices.length % 2 !== 0) {
        adicionarNoFim(indices, null);
    }

    let totalRodadas = indices.length - 1;
    let metade = indices.length / 2;
    let rodadas = [];

    for (let r = 0; r < totalRodadas; r++) {
        let jogos = [];
        let folga = null;

        for (let i = 0; i < metade; i++) {
            let timeA = indices[i];
            let timeB = indices[indices.length - 1 - i];

            if (timeA == null) {
                folga = timeB;
            } else if (timeB == null) {
                folga = timeA;
            } else {
                adicionarNoFimMatriz(jogos, timeA, true);
                adicionarNoFimMatriz(jogos, timeB, false);
            }
        }

        adicionarNoFim(rodadas, { numero: r + 1, jogos: jogos, folga: folga });

        // Gira os times: o primeiro fica parado e o último passa para a segunda posição
        let girados = [];

        girados[0] = indices[0];
        girados[1] = indices[indices.length - 1];

        for (let i = 1; i < indices.length - 1; i++) {
            girados[i + 1] = indices[i];
        }

        indices = girados;
    }

    return rodadas;
}
