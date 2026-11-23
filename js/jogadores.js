// = Funções da página jogadores =

// Mostra o torneio atual e bloqueia o campo de pontuação do formulário se o torneio não usa pontuação
function prepararPagina() {
    let torneios = carregarTorneios();
    let torneio = obterTorneioSelecionado(torneios);
    let campo = document.getElementById("pontuacaoJogador");

    if (torneio === null) {
        document.getElementById("torneioAtual").innerText = "Nenhum torneio selecionado.";
        campo.required = true;
        campo.disabled = false;
    } else {
        document.getElementById("torneioAtual").innerText =
            "Torneio selecionado: " + torneio.nome + " (código " + torneio.codigo + ")";

        //Verifica se o torneio tem pontuação e bloqueia no formulário se não
        campo.required = torneio.usarPontuacao;
        campo.disabled = !torneio.usarPontuacao;
    }
}

//Pede por código, nome, pontuação(Se habilitada) e número da camisa(Jogadores com o mesmo número não ficam no mesmo time). Não pede pontuação caso o torneio seja sem.
function cadastrarJogador(event) {
    event.preventDefault();

    let mensagem = document.getElementById("mensagemJogador");
    mensagem.innerText = "";

    let torneios = carregarTorneios();
    let torneio = obterTorneioSelecionado(torneios);

    if (torneio === null) {
        mensagem.innerText = "Selecione um torneio antes de cadastrar jogadores.";
    } else {
        let codigo = document.getElementById("codigoJogador").value.trim();

        let nome = document.getElementById("nomeJogador").value.trim();

        let numeroCamisa = parseInt(document.getElementById("numeroCamisa").value);

        let pontuacao = parseInt(document.getElementById("pontuacaoJogador").value);

        if (!torneio.usarPontuacao) {
            pontuacao = 0;
        }

        let erroCodigo = validarCodigo(codigo, listarCodigos(torneio.jogadores));

        if (erroCodigo !== "") {
            mensagem.innerText = erroCodigo;
        } else if (nome == "" || Number.isNaN(numeroCamisa) || numeroCamisa < 1 || torneio.usarPontuacao && (pontuacao < 1 || Number.isNaN(pontuacao))) {
            mensagem.innerText = "Insira os dados corretamente!";
        } else {
            let jogador = {
                codigo: codigo,
                nome: nome,
                numeroCamisa: numeroCamisa,
                pontuacao: pontuacao
            };

            adicionarNoFim(torneio.jogadores, jogador);

            salvarTorneios(torneios);

            document.getElementById("formJogador").reset();

            document.getElementById("mensagemJogador").innerText =
                "Jogador cadastrado com sucesso!";

            atualizarTabelaJogadores();
        }
    }
}

//Mostra o jogador selecionado (guardado no localStorage pelo código) e preenche cada campo do formulário de edição. Sem jogador, bloqueia a edição.
function mostrarJogadorSelecionado() {
    let torneios = carregarTorneios();
    let torneio = obterTorneioSelecionado(torneios);
    let codigo = lerSelecao("jogadorSelecionado");
    let jogador = null;

    if (torneio !== null && codigo !== null) {
        jogador = buscarPorCodigo(torneio.jogadores, codigo);
    }

    if (jogador === null) {
        document.getElementById("jogadorSelecionadoMensagem").innerText =
            "Nenhum jogador selecionado.";

        document.getElementById("camposEdicaoJogador").disabled = true;
        document.getElementById("formEdicaoJogador").reset();
    } else {
        document.getElementById("jogadorSelecionadoMensagem").innerText =
            "Jogador selecionado: " + jogador.nome + " (código " + jogador.codigo + ")";

        document.getElementById("editarNomeJogador").value = jogador.nome;
        document.getElementById("editarNumeroCamisa").value = jogador.numeroCamisa;
        document.getElementById("editarPontuacaoJogador").value = jogador.pontuacao;

        document.getElementById("camposEdicaoJogador").disabled = false;

        let campoPontuacao = document.getElementById("editarPontuacaoJogador");

        campoPontuacao.disabled = !torneio.usarPontuacao;
        campoPontuacao.required = torneio.usarPontuacao;
    }
}

//Atualiza a tabela mostrando os jogadores que batem com a pesquisa (nome igual ao digitado; pesquisa vazia mostra todos)
function atualizarTabelaJogadores() {
    let torneios = carregarTorneios();
    let torneio = obterTorneioSelecionado(torneios);
    let tabela = document.querySelector("#tabelaJogadores tbody");

    limparTabela(tabela);

    if (torneio !== null) {
        let pesquisa = document.getElementById("pesquisaJogador").value;
        let resultadoPesquisa = realizarPesquisa(torneio, pesquisa);

        for (let i = 0; i < resultadoPesquisa.length; i++) {
            let jogador = resultadoPesquisa[i];
            let novaLinha = tabela.insertRow();

            novaLinha.insertCell(0).innerText = jogador.codigo;
            novaLinha.insertCell(1).innerText = jogador.nome;
            novaLinha.insertCell(2).innerText = jogador.numeroCamisa;
            novaLinha.insertCell(3).innerText = textoPontuacao(jogador, torneio.usarPontuacao);
        }

        if (resultadoPesquisa.length == 0) {
            if (pesquisa.trim() == "") {
                adicionarLinhaUnica(tabela, 4, "Nenhum jogador cadastrado.");
            } else {
                adicionarLinhaUnica(tabela, 4, "Nenhum jogador encontrado.");
            }
        }
    } else {
        adicionarLinhaUnica(tabela, 4, "Selecione um torneio primeiro.");
    }
}

// Seleciona o jogador pelo código digitado
function selecionarJogador() {
    let torneios = carregarTorneios();
    let torneio = obterTorneioSelecionado(torneios);
    let mensagem = document.getElementById("mensagemAcaoJogador");
    let codigo = document.getElementById("codigoAcaoJogador").value.trim();

    mensagem.innerText = "";

    if (torneio === null) {
        mensagem.innerText = "Selecione um torneio primeiro.";
    } else {
        let jogador = buscarPorCodigo(torneio.jogadores, codigo);

        if (codigo == "" || jogador === null) {
            mensagem.innerText = "Nenhum jogador encontrado com o código digitado.";
        } else {
            guardarSelecao("jogadorSelecionado", jogador.codigo);

            document.getElementById("mensagemEdicaoJogador").innerText = "";

            mostrarJogadorSelecionado();
        }
    }
}

function salvarEdicaoJogador(event) {
    event.preventDefault();

    let torneios = carregarTorneios();
    let torneio = obterTorneioSelecionado(torneios);
    let codigo = lerSelecao("jogadorSelecionado");
    let jogador = null;

    if (torneio !== null && codigo !== null) {
        jogador = buscarPorCodigo(torneio.jogadores, codigo);
    }

    if (jogador !== null) {

        let nome = document.getElementById("editarNomeJogador").value.trim();

        let numeroCamisa = parseInt(document.getElementById("editarNumeroCamisa").value);

        let pontuacao = parseInt(document.getElementById("editarPontuacaoJogador").value);

        if (!torneio.usarPontuacao) {
            pontuacao = 0;
        }

        if (nome == "" || Number.isNaN(numeroCamisa) || numeroCamisa < 1 || torneio.usarPontuacao && (pontuacao < 1 || Number.isNaN(pontuacao))) {
            document.getElementById("mensagemEdicaoJogador").innerText =
                "Preencha todos os campos corretamente.";
        } else {

            jogador.nome = nome;
            jogador.numeroCamisa = numeroCamisa;
            jogador.pontuacao = pontuacao;

            salvarTorneios(torneios);

            atualizarTabelaJogadores();
            mostrarJogadorSelecionado();

            document.getElementById("mensagemEdicaoJogador").innerText =
                "Alterações salvas com sucesso!";
        }
    } else {
        document.getElementById("mensagemEdicaoJogador").innerText =
            "Selecione um jogador primeiro.";
    }
}

//Exclui um jogador pelo código, ao mesmo tempo que atualiza a tabela. A confirmação é a caixa "Confirmo a exclusão" marcada. Desabilita o campo de edição se o jogador removido for o mesmo.
//Também tira o jogador dos times e das reservas, para o código dele poder ser usado de novo sem confundir.
function excluirJogador() {
    let torneios = carregarTorneios();
    let torneio = obterTorneioSelecionado(torneios);
    let mensagem = document.getElementById("mensagemAcaoJogador");
    let codigo = document.getElementById("codigoAcaoJogador").value.trim();

    mensagem.innerText = "";

    if (torneio === null) {
        mensagem.innerText = "Selecione um torneio primeiro.";
    } else {
        let posicao = posicaoPorCodigo(torneio.jogadores, codigo);

        if (codigo == "" || posicao == -1) {
            mensagem.innerText = "Nenhum jogador encontrado com o código digitado.";
        } else if (!document.getElementById("confirmoExclusaoJogador").checked) {
            mensagem.innerText = "Marque a caixa de confirmação para excluir o jogador '" +
                torneio.jogadores[posicao].nome + "'. Essa exclusão não pode ser desfeita.";
        } else {
            let jogador = torneio.jogadores[posicao];

            if (lerSelecao("jogadorSelecionado") === jogador.codigo) {
                limparSelecao("jogadorSelecionado");
            }

            for (let i = 0; i < torneio.equipes.length; i++) {
                torneio.equipes[i].jogadores = removerValor(torneio.equipes[i].jogadores, jogador.codigo);
            }

            torneio.reservas = removerValor(torneio.reservas, jogador.codigo);
            torneio.jogadores = removerPorPosicao(torneio.jogadores, posicao);

            document.getElementById("mensagemEdicaoJogador").innerText = "";
            document.getElementById("codigoAcaoJogador").value = "";
            document.getElementById("confirmoExclusaoJogador").checked = false;
            mensagem.innerText = "Jogador excluído.";

            salvarTorneios(torneios);
            atualizarTabelaJogadores();
            mostrarJogadorSelecionado();
        }
    }
}

// Pesquisa: o botão "Pesquisar" (ou Enter) atualiza a tabela
function pesquisarJogadores(event) {
    event.preventDefault();
    atualizarTabelaJogadores();
}


prepararPagina();
atualizarTabelaJogadores();
mostrarJogadorSelecionado();