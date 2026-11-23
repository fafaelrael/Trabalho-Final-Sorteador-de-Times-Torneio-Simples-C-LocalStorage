// = Funções da página torneios =

//Função que atualiza a tabela e evita duplicatas excluindo todas as linhas que já estão inseridas, e reinserindo-as.
function atualizarTabelaTorneios() {
    let torneios = carregarTorneios();
    let tabela = document.querySelector("#tabelaTorneios tbody");

    // Limpa as linhas existentes
    limparTabela(tabela);

    if (torneios.length == 0) {
        adicionarLinhaUnica(tabela, 5, "Nenhum torneio criado.");
    }

    for (let i = 0; i < torneios.length; i++) {
        let valor = torneios[i];
        let novaLinha = tabela.insertRow();
        let simbolo = "Não";

        if (valor.usarPontuacao) {
            simbolo = "Sim";
        }

        novaLinha.insertCell(0).innerText = valor.codigo;
        novaLinha.insertCell(1).innerText = valor.nome;
        novaLinha.insertCell(2).innerText = valor.times;
        novaLinha.insertCell(3).innerText = valor.jogadoresPorTime;
        novaLinha.insertCell(4).innerText = simbolo;
    }
}

// Mostra qual torneio está selecionado agora (a seleção fica guardada no localStorage)
function atualizarTorneioSelecionado() {
    let torneios = carregarTorneios();
    let torneio = obterTorneioSelecionado(torneios);
    let texto = "Nenhum torneio selecionado.";

    if (torneio !== null) {
        texto = "Torneio selecionado: " + torneio.nome + " (código " + torneio.codigo + ")";
    }

    document.getElementById("torneioSelecionadoAtual").innerText = texto;
}

//Cadastro de torneio - Usa o submit(). O código é digitado pelo usuário e não pode repetir.
function cadastrarTorneio(event) {
    event.preventDefault();

    let torneios = carregarTorneios();
    let mensagem = document.getElementById("mensagemTorneio");

    let codigo = document.getElementById('codigoTorneio').value.trim();
    let Nome = document.getElementById('nomeTorneio').value.trim();
    let Times = parseInt(document.getElementById('quantidadeTimes').value);
    let Jogadores = parseInt(document.getElementById('jogadoresPorTime').value);
    let pontuacao = document.getElementById('usarPontuacao').checked;
    let descricao = document.getElementById('descricao').value;

    let erroCodigo = validarCodigo(codigo, listarCodigos(torneios));

    if (erroCodigo !== "") {
        mensagem.innerText = erroCodigo;
    } else if (Nome == "" || !(Times >= 2) || !(Jogadores >= 1)) {
        mensagem.innerText = "Insira os dados corretamente!";
    } else {
        let torneio = {
            codigo: codigo,
            nome: Nome,
            times: Times,
            jogadoresPorTime: Jogadores,
            usarPontuacao: pontuacao,
            descricao: descricao,
            jogadores: [],
            equipes: [],
            reservas: [],
            partidas: []
        };

        adicionarNoFim(torneios, torneio);

        salvarTorneios(torneios);

        document.getElementById("formTorneio").reset();
        mensagem.innerText = "Torneio criado com sucesso!";

        atualizarTabelaTorneios();
    }
}

//Selecionar o Torneio pelo código para fazer as alterações, logo depois abre a página "Jogadores". Limpa o jogador e o time selecionados para evitar edição errada
function selecionarTorneio() {
    let torneios = carregarTorneios();
    let mensagem = document.getElementById("mensagemTorneio");
    let codigo = document.getElementById("codigoAcaoTorneio").value.trim();
    let posicao = posicaoPorCodigo(torneios, codigo);

    if (codigo == "" || posicao == -1) {
        mensagem.innerText = "Nenhum torneio encontrado com o código digitado.";
    } else {
        guardarSelecao("torneioSelecionado", torneios[posicao].codigo);
        limparSelecao("jogadorSelecionado");
        limparSelecao("equipeSelecionada");

        window.location.href = "jogadores.html";
    }
}

//Exclui o torneio do localstorage e da tabela. A confirmação é a caixa "Confirmo a exclusão" marcada (sem janelas de confirm).
function excluirTorneio() {
    let torneios = carregarTorneios();
    let mensagem = document.getElementById("mensagemTorneio");
    let codigo = document.getElementById("codigoAcaoTorneio").value.trim();
    let posicao = posicaoPorCodigo(torneios, codigo);

    if (codigo == "" || posicao == -1) {
        mensagem.innerText = "Nenhum torneio encontrado com o código digitado.";
    } else if (!document.getElementById("confirmoExclusaoTorneio").checked) {
        mensagem.innerText = "Marque a caixa de confirmação para excluir o torneio '" +
            torneios[posicao].nome + "'. Essa exclusão não pode ser desfeita.";
    } else {
        let torneio = torneios[posicao];
        let selecionado = obterTorneioSelecionado(torneios);

        if (selecionado === torneio) {
            limparSelecao("torneioSelecionado");
            limparSelecao("jogadorSelecionado");
            limparSelecao("equipeSelecionada");
        }

        torneios = removerPorPosicao(torneios, posicao);

        salvarTorneios(torneios);

        document.getElementById("codigoAcaoTorneio").value = "";
        document.getElementById("confirmoExclusaoTorneio").checked = false;
        mensagem.innerText = "Torneio excluído.";

        atualizarTabelaTorneios();
        atualizarTorneioSelecionado();
    }
}

// Executa para que quando o usuário entrar já esteja carregado todos os torneios feitos
atualizarTabelaTorneios();
atualizarTorneioSelecionado();
