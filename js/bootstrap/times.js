// = Funções da página times =
//Aqui começa o caos.

// Devolve o time selecionado (o código dele fica guardado no localStorage) ou null
function obterEquipeSelecionada(torneio) {
    let codigo = lerSelecao("equipeSelecionada");
    let equipe = null;

    if (torneio !== null && codigo !== null) {
        equipe = buscarPorCodigo(torneio.equipes, codigo);
    }

    return equipe;
}

// Preenche uma tabela com os jogadores de uma lista de códigos
function preencherTabelaJogadores(tabela, torneio, codigos, mensagemVazia) {
    limparTabela(tabela);

    let mostrados = 0;

    for (let i = 0; i < codigos.length; i++) {
        let jogador = buscarPorCodigo(torneio.jogadores, codigos[i]);

        if (jogador) {
            let linha = tabela.insertRow();

            linha.insertCell(0).innerText = jogador.codigo;
            linha.insertCell(1).innerText = jogador.nome;
            linha.insertCell(2).innerText = jogador.numeroCamisa;
            linha.insertCell(3).innerText = textoPontuacao(jogador, torneio.usarPontuacao);

            mostrados++;
        }
    }

    if (mostrados == 0) {
        adicionarLinhaUnica(tabela, 4, mensagemVazia);
    }
}

// Atualiza a página toda: nome do torneio, tabela com os times e o time selecionado
function atualizarInterfaceTimes() {
    let torneios = carregarTorneios();
    let torneio = obterTorneioSelecionado(torneios);
    let tabelaEquipes = document.querySelector("#tabelaEquipes tbody");

    limparTabela(tabelaEquipes);

    if (torneio === null) {
        document.getElementById("torneioTimesAtual").innerText =
            "Nenhum torneio selecionado.";

        adicionarLinhaUnica(tabelaEquipes, 2, "Selecione um torneio primeiro.");
    } else {
        document.getElementById("torneioTimesAtual").innerText =
            "Torneio selecionado: " + torneio.nome + " (código " + torneio.codigo + ")";

        if (torneio.equipes.length == 0) {
            adicionarLinhaUnica(tabelaEquipes, 2, "Nenhum time cadastrado.");
        } else {
            for (let i = 0; i < torneio.equipes.length; i++) {
                let linha = tabelaEquipes.insertRow();

                linha.insertCell(0).innerText = torneio.equipes[i].codigo;
                linha.insertCell(1).innerText = torneio.equipes[i].nome;
            }
        }
    }

    mostrarEquipe();
}

// Mostra o time selecionado: nome, jogadores e reservas. Sem time selecionado, bloqueia os campos de nome e troca.
function mostrarEquipe() {
    let torneios = carregarTorneios();
    let torneio = obterTorneioSelecionado(torneios);
    let equipe = obterEquipeSelecionada(torneio);

    let tabelaEquipe = document.querySelector("#tabelaJogadoresEquipe tbody");
    let tabelaReservas = document.querySelector("#tabelaReservas tbody");
    let campoNome = document.getElementById("nomeEquipe");

    // A troca só faz sentido com um time selecionado e pelo menos outro time para trocar
    let podeTrocar = equipe !== null && torneio.equipes.length >= 2;

    campoNome.disabled = equipe === null;
    document.getElementById("botaoSalvarEquipe").disabled = equipe === null;
    document.getElementById("camposTroca").disabled = !podeTrocar;

    if (equipe === null) {
        campoNome.value = "";

        document.getElementById("equipeSelecionadaMensagem").innerText = "Nenhum time selecionado.";

        limparTabela(tabelaEquipe);
        adicionarLinhaUnica(tabelaEquipe, 4, "Selecione um time para ver os jogadores.");
    } else {
        campoNome.value = equipe.nome;

        document.getElementById("equipeSelecionadaMensagem").innerText =
            "Time selecionado: " + equipe.nome + " (código " + equipe.codigo + ")";

        preencherTabelaJogadores(tabelaEquipe, torneio, equipe.jogadores, "Esta equipe não possui jogadores.");
    }

    if (torneio === null) {
        limparTabela(tabelaReservas);
        adicionarLinhaUnica(tabelaReservas, 4, "Nenhum reserva disponível.");
    } else {
        preencherTabelaJogadores(tabelaReservas, torneio, torneio.reservas, "Nenhum reserva disponível.");
    }
}

// Seleciona o time pelo código digitado
function selecionarEquipe() {
    let torneios = carregarTorneios();
    let torneio = obterTorneioSelecionado(torneios);
    let mensagem = document.getElementById("mensagemTimes");
    let codigo = document.getElementById("codigoEquipe").value.trim();

    mensagem.innerText = "";

    if (torneio === null) {
        mensagem.innerText = "Selecione um torneio primeiro.";
    } else {
        let equipe = buscarPorCodigo(torneio.equipes, codigo);

        if (codigo == "" || equipe === null) {
            mensagem.innerText = "Nenhum time encontrado com o código digitado.";
        } else {
            guardarSelecao("equipeSelecionada", equipe.codigo);
            mostrarEquipe();
        }
    }
}


// = SORTEIO =

// Cada camisa pode aparecer, no máximo, uma vez por time. Devolve quantos jogadores dá para distribuir respeitando isso.
function calcularMaximoDistribuivel(jogadores, quantidadeTimes) {
    // Conta quantos jogadores possuem cada número de camisa
    let contagemCamisas = [];

    for (let i = 0; i < jogadores.length; i++) {
        let encontrou = false;

        for (let j = 0; j < contagemCamisas.length; j++) {
            if (contagemCamisas[j].numeroCamisa == jogadores[i].numeroCamisa) {
                contagemCamisas[j].quantidade++;
                encontrou = true;
            }
        }

        if (!encontrou) {
            adicionarNoFim(contagemCamisas, {
                numeroCamisa: jogadores[i].numeroCamisa,
                quantidade: 1
            });
        }
    }

    let maximoDistribuivel = 0;

    for (let i = 0; i < contagemCamisas.length; i++) {
        // Cada camisa conta no máximo uma vez por time (o menor entre a quantidade de jogadores e a de times)
        let limite = contagemCamisas[i].quantidade;

        if (limite > quantidadeTimes) {
            limite = quantidadeTimes;
        }

        maximoDistribuivel += limite;
    }

    return maximoDistribuivel;
}

// Ordena (na própria lista) da maior para a menor pontuação, com bubble sort
function ordenarPorPontuacao(lista) {
    for (let i = 0; i < lista.length; i++) {
        for (let j = 0; j < lista.length - 1 - i; j++) {
            if (lista[j].pontuacao < lista[j + 1].pontuacao) {
                let temporario = lista[j];

                lista[j] = lista[j + 1];
                lista[j + 1] = temporario;
            }
        }
    }
}

// Distribui os jogadores nas equipes e devolve os códigos dos que sobraram (reservas)
function distribuirJogadores(jogadoresSorteio, equipesNovas, jogadoresPorTime, usarPontuacao) {
    let reservasNovas = [];

    for (let i = 0; i < jogadoresSorteio.length; i++) {
        let jogador = jogadoresSorteio[i];

        let equipesDisponiveis = [];
        let menorQuantidade = jogadoresPorTime + 1;

        // Procura equipes com vaga e sem camisa repetida
        for (let j = 0; j < equipesNovas.length; j++) {
            let equipe = equipesNovas[j];

            if (equipe.jogadores.length < jogadoresPorTime && !contem(equipe.numerosCamisa, jogador.numeroCamisa)) {
                if (equipe.jogadores.length < menorQuantidade) {
                    menorQuantidade = equipe.jogadores.length;
                    equipesDisponiveis = [j];
                } else if (equipe.jogadores.length == menorQuantidade) {
                    adicionarNoFim(equipesDisponiveis, j);
                }
            }
        }

        if (equipesDisponiveis.length > 0) {
            let equipesPreferidas = equipesDisponiveis;

            // Entre equipes igualmente preenchidas, prefere a de menor pontuação acumulada
            if (usarPontuacao) {
                let menorPontuacao = Infinity;
                equipesPreferidas = [];

                for (let j = 0; j < equipesDisponiveis.length; j++) {
                    let indice = equipesDisponiveis[j];
                    let pontuacao = equipesNovas[indice].pontuacaoTotal;

                    if (pontuacao < menorPontuacao) {
                        menorPontuacao = pontuacao;
                        equipesPreferidas = [indice];
                    } else if (pontuacao == menorPontuacao) {
                        adicionarNoFim(equipesPreferidas, indice);
                    }
                }
            }

            // Sorteia entre as equipes igualmente adequadas
            let posicao = Math.floor(Math.random() * equipesPreferidas.length);
            let equipeEscolhida = equipesNovas[equipesPreferidas[posicao]];

            // Guardamos o CÓDIGO do jogador, não uma cópia dele. Isso facilita futuras edições e trocas.
            adicionarNoFim(equipeEscolhida.jogadores, jogador.codigo);
            adicionarNoFim(equipeEscolhida.numerosCamisa, jogador.numeroCamisa);

            if (usarPontuacao) {
                equipeEscolhida.pontuacaoTotal += parseFloat(jogador.pontuacao) || 0;
            }
        } else {
            // Sem vaga compatível: fica como reserva
            adicionarNoFim(reservasNovas, jogador.codigo);
        }
    }

    return reservasNovas;
}

// = CADASTRO E REMOÇÃO DE TIMES =

// Cadastra um time digitando o código dele (e, se quiser, o nome). O código não pode repetir. Cada torneio aceita a quantidade de times definida na criação dele.
function cadastrarEquipe(event) {
    event.preventDefault();

    let torneios = carregarTorneios();
    let torneio = obterTorneioSelecionado(torneios);
    let mensagem = document.getElementById("mensagemTimes");

    let codigo = document.getElementById("codigoNovaEquipe").value.trim();
    let nome = document.getElementById("nomeNovaEquipe").value.trim();

    mensagem.innerText = "";

    if (torneio === null) {
        mensagem.innerText = "Selecione um torneio primeiro.";
    } else if (torneio.equipes.length >= torneio.times) {
        mensagem.innerText = "Todos os " + torneio.times + " times deste torneio já foram cadastrados.";
    } else {
        let erroCodigo = validarCodigo(codigo, listarCodigos(torneio.equipes));

        if (erroCodigo !== "") {
            mensagem.innerText = erroCodigo;
        } else {
            if (nome == "") {
                nome = "Time " + (torneio.equipes.length + 1);
            }

            adicionarNoFim(torneio.equipes, { codigo: codigo, nome: nome, jogadores: [] });

            // Os confrontos guardam a posição dos times, então precisam ser preparados de novo
            torneio.partidas = [];

            salvarTorneios(torneios);

            document.getElementById("formCadastroEquipe").reset();

            atualizarInterfaceTimes();

            mensagem.innerText = "Time cadastrado! " + torneio.equipes.length + " de " + torneio.times + ".";
        }
    }
}

// Remove o time do código digitado (exige a caixa de confirmação marcada). Os jogadores dele viram reservas.
function removerEquipe() {
    let torneios = carregarTorneios();
    let torneio = obterTorneioSelecionado(torneios);
    let mensagem = document.getElementById("mensagemTimes");
    let codigo = document.getElementById("codigoEquipe").value.trim();

    mensagem.innerText = "";

    if (torneio === null) {
        mensagem.innerText = "Selecione um torneio primeiro.";
    } else {
        let posicao = posicaoPorCodigo(torneio.equipes, codigo);

        if (codigo == "" || posicao == -1) {
            mensagem.innerText = "Nenhum time encontrado com o código digitado.";
        } else if (!document.getElementById("confirmoRemocaoEquipe").checked) {
            mensagem.innerText = "Marque a caixa de confirmação para remover o time '" +
                torneio.equipes[posicao].nome + "'. Os jogadores dele viram reservas.";
        } else {
            let equipe = torneio.equipes[posicao];

            for (let i = 0; i < equipe.jogadores.length; i++) {
                adicionarNoFim(torneio.reservas, equipe.jogadores[i]);
            }

            if (lerSelecao("equipeSelecionada") === equipe.codigo) {
                limparSelecao("equipeSelecionada");
            }

            torneio.equipes = removerPorPosicao(torneio.equipes, posicao);
            torneio.partidas = [];

            salvarTorneios(torneios);

            document.getElementById("codigoEquipe").value = "";
            document.getElementById("confirmoRemocaoEquipe").checked = false;

            atualizarInterfaceTimes();

            mensagem.innerText = "Time removido.";
        }
    }
}

// Sorteia os jogadores entre os times já cadastrados e guarda os excedentes como reservas
function sortearTimes() {
    let torneios = carregarTorneios();
    let torneio = obterTorneioSelecionado(torneios);
    let mensagem = document.getElementById("mensagemTimes");

    mensagem.innerText = "";

    if (torneio === null) {
        mensagem.innerText = "Selecione um torneio primeiro.";
    } else {
        let quantidadeTimes = parseInt(torneio.times);
        let jogadoresPorTime = parseInt(torneio.jogadoresPorTime);

        let quantidadeVagas = quantidadeTimes * jogadoresPorTime;
        let jogadores = torneio.jogadores;

        if (!Number.isInteger(quantidadeTimes) || !Number.isInteger(jogadoresPorTime) || quantidadeTimes < 2 || jogadoresPorTime < 1) {
            mensagem.innerText = "A configuração do torneio é inválida.";
        } else if (torneio.equipes.length !== quantidadeTimes) {
            mensagem.innerText = "Cadastre os " + quantidadeTimes + " times (com código) antes de sortear. Hoje há " + torneio.equipes.length + ".";
        } else if (jogadores.length < quantidadeVagas) {
            mensagem.innerText = "Jogadores insuficientes! São necessárias " + quantidadeVagas + " pessoas para preencher todos os times.";
        } else if (calcularMaximoDistribuivel(jogadores, quantidadeTimes) < quantidadeVagas) {
            mensagem.innerText = "Não é possível preencher todos os times respeitando " + "os números de camisa repetidos.";
        } else {

            // Cria uma cópia para não alterar o cadastro original
            let jogadoresSorteio = copiarLista(jogadores);

            embaralhar(jogadoresSorteio);

            // Se a pontuação estiver habilitada, ordena da maior para a menor. Como embaralhamos antes, jogadores empatados também terão sua ordem aleatorizada.
            if (torneio.usarPontuacao) {
                ordenarPorPontuacao(jogadoresSorteio);
            }

            // Monta as equipes temporárias com o código e o nome dos times cadastrados. As equipes atuais só serão substituídas se o novo sorteio for concluído corretamente.
            let equipesNovas = [];

            for (let i = 0; i < quantidadeTimes; i++) {
                adicionarNoFim(equipesNovas, {
                    codigo: torneio.equipes[i].codigo,
                    nome: torneio.equipes[i].nome,
                    jogadores: [],
                    numerosCamisa: [],
                    pontuacaoTotal: 0
                });
            }

            let reservasNovas = distribuirJogadores(jogadoresSorteio, equipesNovas, jogadoresPorTime, torneio.usarPontuacao);

            // Confere se todas as vagas foram preenchidas
            let totalDistribuido = 0;

            for (let i = 0; i < equipesNovas.length; i++) {
                totalDistribuido += equipesNovas[i].jogadores.length;
            }

            if (totalDistribuido !== quantidadeVagas) {
                mensagem.innerText = "Não foi possível completar o sorteio. " + "As equipes anteriores foram preservadas.";
            } else {

                // Remove dados auxiliares usados durante o sorteio
                for (let i = 0; i < equipesNovas.length; i++) {
                    delete equipesNovas[i].numerosCamisa;
                    delete equipesNovas[i].pontuacaoTotal;
                }

                torneio.equipes = equipesNovas;
                torneio.reservas = reservasNovas;

                salvarTorneios(torneios);

                // Seleciona o primeiro time
                guardarSelecao("equipeSelecionada", equipesNovas[0].codigo);

                atualizarInterfaceTimes();

                mensagem.innerText =
                    "Sorteio concluído! " + totalDistribuido +
                    " jogadores distribuídos e " +
                    reservasNovas.length + " reserva(s).";
            }
        }
    }
}


// = NOME DO TIME =

function salvarNomeEquipe(event) {
    event.preventDefault();

    let torneios = carregarTorneios();
    let torneio = obterTorneioSelecionado(torneios);
    let equipe = obterEquipeSelecionada(torneio);
    let mensagem = document.getElementById("mensagemTimes");

    if (equipe !== null) {
        let nome = document.getElementById("nomeEquipe").value.trim();

        if (nome == "") {
            mensagem.innerText = "Digite um nome válido para o time.";
        } else {
            equipe.nome = nome;

            salvarTorneios(torneios);

            atualizarInterfaceTimes();

            mensagem.innerText = "Nome do time atualizado com sucesso!";
        }
    } else {
        mensagem.innerText = "Selecione um torneio com equipes cadastradas.";
    }
}


// = TROCA DE JOGADORES ENTRE TIMES =

// Confere tudo o que foi digitado na troca e, se estiver certo, chama realizarTroca(). Tudo é identificado pelo código.
function trocarJogadores(event) {
    event.preventDefault();

    let mensagem = document.getElementById("mensagemTimes");
    mensagem.innerText = "";

    let torneios = carregarTorneios();
    let torneio = obterTorneioSelecionado(torneios);

    let equipeA = null;
    let equipeB = null;
    let jogadorA = null;
    let jogadorB = null;

    if (torneio !== null) {
        equipeA = obterEquipeSelecionada(torneio);
        equipeB = buscarPorCodigo(torneio.equipes, document.getElementById("codigoEquipeTrocaDestino").value);
        jogadorA = buscarPorCodigo(torneio.jogadores, document.getElementById("codigoJogadorTrocaOrigem").value);
        jogadorB = buscarPorCodigo(torneio.jogadores, document.getElementById("codigoJogadorTrocaDestino").value);
    }

    if (torneio === null) {
        mensagem.innerText = "Selecione um torneio primeiro.";
    } else if (!equipeA) {
        mensagem.innerText = "Selecione um time primeiro.";
    } else if (!equipeB) {
        mensagem.innerText = "Nenhum time encontrado com o código do time de destino.";
    } else if (equipeA === equipeB) {
        mensagem.innerText = "Escolha um time de destino diferente do time selecionado.";
    } else if (!jogadorA || !contem(equipeA.jogadores, jogadorA.codigo)) {
        mensagem.innerText = "O jogador de origem precisa estar no time '" + equipeA.nome + "'.";
    } else if (!jogadorB || !contem(equipeB.jogadores, jogadorB.codigo)) {
        mensagem.innerText = "O jogador de destino precisa estar no time '" + equipeB.nome + "'.";
    } else {
        realizarTroca(torneios, torneio, equipeA, equipeB, jogadorA, jogadorB);
    }
}

// Troca um jogador do time de origem com um jogador do time de destino.
// Se a camisa de alguém já existir no time para onde ele vai, a troca só acontece se o "Novo número" correspondente for preenchido no formulário.
function realizarTroca(torneios, torneio, equipeA, equipeB, jogadorA, jogadorB) {
    let mensagem = document.getElementById("mensagemTimes");

    // Números que continuarão em cada time depois da troca (sem quem está saindo)
    let numerosA = numerosDaEquipeSem(torneio, equipeA, jogadorA.codigo);
    let numerosB = numerosDaEquipeSem(torneio, equipeB, jogadorB.codigo);

    let novoNumeroA = jogadorA.numeroCamisa;
    let novoNumeroB = jogadorB.numeroCamisa;
    let erro = "";

    // O jogador A vai para o time B. Se já houver essa camisa lá, usa o número novo digitado.
    if (contem(numerosB, novoNumeroA)) {
        let digitado = parseInt(document.getElementById("novoNumeroOrigem").value);

        erro = validarNovoNumero(digitado, numerosB);

        if (erro == "") {
            novoNumeroA = digitado;
        } else {
            erro = jogadorA.nome + " usa a camisa " + jogadorA.numeroCamisa + ", que já existe no time '" +
                equipeB.nome + "'. Preencha o campo \"Novo número do jogador de origem\". " + erro;
        }
    }

    // O jogador B vai para o time A. Mesma verificação.
    if (erro == "" && contem(numerosA, novoNumeroB)) {
        let digitado = parseInt(document.getElementById("novoNumeroDestino").value);

        erro = validarNovoNumero(digitado, numerosA);

        if (erro == "") {
            novoNumeroB = digitado;
        } else {
            erro = jogadorB.nome + " usa a camisa " + jogadorB.numeroCamisa + ", que já existe no time '" +
                equipeA.nome + "'. Preencha o campo \"Novo número do jogador de destino\". " + erro;
        }
    }

    if (erro !== "") {
        mensagem.innerText = erro;
    } else {
        // Só altera algo depois que tudo foi confirmado, assim um erro não deixa a troca pela metade
        jogadorA.numeroCamisa = novoNumeroA;
        jogadorB.numeroCamisa = novoNumeroB;

        let posicaoA = posicaoNaLista(equipeA.jogadores, jogadorA.codigo);
        let posicaoB = posicaoNaLista(equipeB.jogadores, jogadorB.codigo);

        equipeA.jogadores[posicaoA] = jogadorB.codigo;
        equipeB.jogadores[posicaoB] = jogadorA.codigo;

        salvarTorneios(torneios);

        document.getElementById("formTroca").reset();

        mostrarEquipe();

        mensagem.innerText = jogadorA.nome + " foi para o time '" + equipeB.nome +
            "' e " + jogadorB.nome + " foi para o time '" + equipeA.nome + "'.";
    }
}

atualizarInterfaceTimes();
