// = Funções da página partidas =

// Botão "Preparar confrontos". Se já existirem confrontos, só gera de novo com a caixa "Substituir" marcada.
function prepararConfrontos() {
    let torneios = carregarTorneios();
    let torneio = obterTorneioSelecionado(torneios);
    let mensagem = document.getElementById("mensagemPartidas");
    mensagem.innerText = "";

    if (torneio === null) {
        mensagem.innerText = "Selecione um torneio primeiro.";
    } else if (torneio.equipes.length < 2) {
        mensagem.innerText = "Cadastre e sorteie os times antes de preparar os confrontos.";
    } else {
        let jaExistem = torneio.partidas !== undefined && torneio.partidas.length > 0;
        let substituir = document.getElementById("confirmoNovosConfrontos").checked;

        if (jaExistem && !substituir) {
            mensagem.innerText = "Já existem confrontos preparados. Marque a caixa \"Substituir os confrontos atuais\" para gerá-los novamente.";
        } else {
            torneio.partidas = gerarConfrontos(torneio.equipes.length);

            salvarTorneios(torneios);

            document.getElementById("confirmoNovosConfrontos").checked = false;

            atualizarTabelaPartidas();

            mensagem.innerText = "Confrontos preparados com sucesso!";
        }
    }
}

// Mostra a tabela de confrontos do torneio selecionado. Guarda só o índice dos times, então renomear um time já reflete aqui.
function atualizarTabelaPartidas() {
    let torneios = carregarTorneios();
    let torneio = obterTorneioSelecionado(torneios);
    let tabela = document.querySelector("#tabelaPartidas tbody");

    limparTabela(tabela);

    if (torneio === null) {
        document.getElementById("torneioPartidasAtual").innerText =
            "Nenhum torneio selecionado.";

        adicionarLinhaUnica(tabela, 3, "Selecione um torneio primeiro.");
    } else {
        document.getElementById("torneioPartidasAtual").innerText =
            "Torneio selecionado: " + torneio.nome + " (código " + torneio.codigo + ")";

        let rodadas = torneio.partidas;

        if (rodadas === undefined || rodadas.length == 0) {
            adicionarLinhaUnica(tabela, 3, "Nenhum confronto preparado.");
        } else {
            for (let i = 0; i < rodadas.length; i++) {
                let rodada = rodadas[i];

                for (let j = 0; j < rodada.jogos.length; j++) {
                    let jogo = rodada.jogos[j]; // jogo[0] = timeA (esquerda), jogo[1] = timeB (direita)
                    let linha = tabela.insertRow();

                    linha.insertCell(0).innerText = rodada.numero;
                    linha.insertCell(1).innerText = torneio.equipes[jogo[0]].nome;
                    linha.insertCell(2).innerText = torneio.equipes[jogo[1]].nome;
                }

                if (rodada.folga !== null) {
                    let linha = tabela.insertRow();

                    linha.className = "table-secondary";
                    linha.insertCell(0).innerText = rodada.numero;

                    let celula = linha.insertCell(1);

                    celula.colSpan = 2;
                    celula.innerText = "Folga: " + torneio.equipes[rodada.folga].nome;
                }
            }
        }
    }
}


atualizarTabelaPartidas();
