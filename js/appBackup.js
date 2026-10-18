let torneios = [];
let torneioSelecionado = null;
let jogadorSelecionado = null;

// = TORNEIOS =
function salvarTorneios() {
    localStorage.setItem('torneios', JSON.stringify(torneios));
}
//Função que atualiza a tabela e evita duplicatas excluindo todas as que já estão inseridas, e reinserindo-as.
function atualizarTabelaTorneios() {
    let tabela = document.querySelector("#tabelaTorneios tbody");

    // Limpa as linhas existentes
    tabela.innerHTML = "";

    for (let i = 0; i < torneios.length; i++) {
        let valor = torneios[i];
        let novaLinha = tabela.insertRow();

        novaLinha.insertCell(0).innerText = valor.nome;
        novaLinha.insertCell(1).innerText = valor.times;
        novaLinha.insertCell(2).innerText = valor.jogadoresPorTime;
        novaLinha.insertCell(3).innerText = valor.usarPontuacao ? "✅" : "❎";

        // Cria os botões de selecionar e excluir (Muito doido)
        // Os botões chamam as funções e passam o vetor (${i})
        novaLinha.insertCell(4).innerHTML = `
            <button class="btn btn-primary btn-sm"
                onclick="selecionarTorneio(${i})"> 
                Selecionar
            </button>

            <button class="btn btn-danger btn-sm"
                onclick="excluirTorneio(${i})"> 
                Excluir
            </button>
        `;
    }
}

//Cadastro de torneio - Usa o submit()
function cadastrarTorneio(event) {
    event.preventDefault();
    let Nome = document.getElementById('nomeTorneio').value;
    let Times = parseInt(document.getElementById('quantidadeTimes').value);
    let Jogadores = parseInt(document.getElementById('jogadoresPorTime').value);
    let pontuacao = document.getElementById('usarPontuacao').checked;
    let descricao = document.getElementById('descricao').value;

    if (Nome.trim() && Times >= 2 && Jogadores >= 1) {
        console.log('Formulário enviado!');

        let torneio = {
            nome: Nome,
            times: Times,
            jogadoresPorTime: Jogadores,
            usarPontuacao: pontuacao,
            descricao: descricao,
            jogadores: [],
            equipes: []
        };

        torneios.push(torneio);

        salvarTorneios();

        atualizarTabelaTorneios();
    }
}

//Selecionar o Torneio para fazer as alterações, logo depois abre a guia "Jogadores". Remove o jogador selecionado para evitar edição errada
function selecionarTorneio(indice) {
    torneioSelecionado = torneios[indice];

    //Reseta o campo de edição de jogador
    jogadorSelecionado = null;
    document.getElementById("camposEdicaoJogador").disabled = true;
    document.getElementById("formEdicaoJogador").reset();
    document.getElementById("jogadorSelecionadoMensagem").innerText =
        "Nenhum jogador selecionado.";
    document.getElementById("mensagemEdicaoJogador").innerText = "";


    document.getElementById("torneioAtual").innerText = "Torneio selecionado: " + torneioSelecionado.nome;

    //Muda a aba chamando a função pronta do bootstrap
    bootstrap.Tab.getOrCreateInstance(
        document.querySelector('[data-bs-target="#jogadores"]')
    ).show();

    atualizarTabelaJogadores();

    //Verifica se o tornei tem pontuação e bloqueia no formulário se não
    const input = document.getElementById('pontuacaoJogador')
    input.required = torneios[indice].usarPontuacao
    input.disabled = !torneios[indice].usarPontuacao
}

//Exclui o torneio do localstorage e da tebela, após uma confirmação dupla.
function excluirTorneio(indice) {
    let nome = torneios[indice].nome;

    if (confirm("Deseja excluir o torneio '" + nome + "'?")) {
        if (confirm("Tem certeza? Essa exclusão não pode ser desfeita.")) {
            if (torneioSelecionado == torneios[indice]) {
                torneioSelecionado = null;

                document.getElementById("torneioAtual").innerText =
                    "Nenhum torneio selecionado.";
            }

            torneios.splice(indice, 1);

            salvarTorneios();
            atualizarTabelaTorneios();
            atualizarInterfaceTimes();
        }
    }
}

//Lê os dados do localstorage e depois chama a função que atualiza a tabela
function carregarTorneios() {
    let dados = localStorage.getItem('torneios');

    if (dados) {
        torneios = JSON.parse(dados);
    }

    atualizarTabelaTorneios();
}
// Executa para que quando o usuário entrar já esteja carregado todos os torneios feitos
carregarTorneios();

// = JOGADORES
//Pede por nome, pontuação(Se habilitada) e número da camisa(Jogadores com o mesmo número não ficam no mesmo time). Não pede pontuação caso o torneio seja sem.
function cadastrarJogador(event) {
    event.preventDefault();

    if (torneioSelecionado == null) {
        alert("Selecione um torneio antes de cadastrar jogadores.");
    } else {
        let nome = document.getElementById("nomeJogador").value.trim();

        let numeroCamisa = parseInt(document.getElementById("numeroCamisa").value);

        let pontuacao = parseInt(document.getElementById("pontuacaoJogador").value);

        if (
            nome == "" ||
            Number.isNaN(numeroCamisa) ||
            numeroCamisa < 1 ||
            torneioSelecionado.usarPontuacao &&
            (pontuacao < 1 || Number.isNaN(pontuacao))
        ) {
            alert("Insira os dados corretamente!");
        } else {
            let jogador = {
                id: Date.now(),
                nome: nome,
                numeroCamisa: numeroCamisa,
                pontuacao: pontuacao
            };

            torneioSelecionado.jogadores.push(jogador);

            salvarTorneios();

            document.getElementById("formJogador").reset();

            document.getElementById("mensagemJogador").innerText =
                "Jogador cadastrado com sucesso!";

            atualizarTabelaJogadores();
        }
    }
}

// Função para normalizar o texto, aplicando três configurações
function normalizarTexto(texto) {
    return texto
        .normalize("NFD")// Decompõe o caractere acentuado na letra base e no acento isolado. Na memória do JavaScript (UTF-16 - cada caractere ocupa 2 bytes), a letra base passa a ocupar 2 bytes (1 unidade) e o acento isolado também ocupa 2 bytes (1 unidade). A string cresce de 2 bytes para 4 bytes.
        .replace(/[\u0300-\u036f]/g, "") // Finalmente, remove os acentos gerados pela função de cima. MUUUITO TOP
        .toLowerCase();
}

//Muda os valores da variável do jogador selecionado e o texto exibido ao usuário, assim como cada campo do formul[ario de edição

function selecionarJogador(indice) {
    jogadorSelecionado = torneioSelecionado.jogadores[indice];

    document.getElementById("jogadorSelecionadoMensagem").innerText =
        "Jogador selecionado: " + jogadorSelecionado.nome;

    document.getElementById("editarNomeJogador").value =
        jogadorSelecionado.nome;

    document.getElementById("editarNumeroCamisa").value =
        jogadorSelecionado.numeroCamisa;

    document.getElementById("editarPontuacaoJogador").value =
        jogadorSelecionado.pontuacao;

    document.getElementById("camposEdicaoJogador").disabled = false;

    document.getElementById("mensagemEdicaoJogador").innerText = "";

    let campoPontuacao = document.getElementById("editarPontuacaoJogador");

    campoPontuacao.disabled = !torneioSelecionado.usarPontuacao;
    campoPontuacao.required = torneioSelecionado.usarPontuacao;
}

//Atualiza a tabela ao mesmo tempo que filtra os nomes, esa função em chama com oninput, então ao mesmo tempo que o usuário escreve, essa função é chamada
function atualizarTabelaJogadores() {
    let tabela = document.querySelector("#tabelaJogadores tbody");

    tabela.innerHTML = "";

    let pesquisa = normalizarTexto(
        document.getElementById("pesquisaJogador").value.trim()
    );

    if (torneioSelecionado !== null) {
        let encontrou = false;

        for (let i = 0; i < torneioSelecionado.jogadores.length; i++) {
            let jogador = torneioSelecionado.jogadores[i];
            let nomeNormalizado = normalizarTexto(jogador.nome);

            if (nomeNormalizado.includes(pesquisa)) {
                encontrou = true;

                let novaLinha = tabela.insertRow();

                novaLinha.insertCell(0).innerText = jogador.nome;
                novaLinha.insertCell(1).innerText = jogador.numeroCamisa;
                novaLinha.insertCell(2).innerText = jogador.pontuacao;
                //Semelhante à tabela de seleção de torneios, cada objeto vai ter duas ações
                novaLinha.insertCell(3).innerHTML = `
                    <button
                        class="btn btn-primary btn-sm"
                        onclick="selecionarJogador(${i})">
                        Selecionar
                    </button>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="excluirJogador(${i})">
                        Excluir
                    </button>
                `;
            }
        }

        if (!encontrou) {
            let linha = tabela.insertRow();
            let celula = linha.insertCell(0);

            celula.colSpan = 4;
            celula.innerText = pesquisa == ""
                ? "Nenhum jogador cadastrado."
                : "Nenhum jogador encontrado.";

        }
    } else {
        let linha = tabela.insertRow();
        let celula = linha.insertCell(0);

        celula.colSpan = 4;
        celula.innerText = "Selecione um torneio primeiro.";
    }
}

function salvarEdicaoJogador(event) {
    event.preventDefault();

    if (jogadorSelecionado !== null) {

        let nome = document.getElementById("editarNomeJogador").value.trim();

        let numeroCamisa = parseInt(
            document.getElementById("editarNumeroCamisa").value,
            10
        );

        let pontuacao = parseInt(
            document.getElementById("editarPontuacaoJogador").value,
            10
        );

        if (
            nome == "" ||
            Number.isNaN(numeroCamisa) ||
            numeroCamisa < 1 ||
            torneioSelecionado.usarPontuacao &&
            (pontuacao < 1 || Number.isNaN(pontuacao))
        ) {
            document.getElementById("mensagemEdicaoJogador").innerText =
                "Preencha todos os campos corretamente.";
        } else {

            jogadorSelecionado.nome = nome;
            jogadorSelecionado.numeroCamisa = numeroCamisa;
            jogadorSelecionado.pontuacao = pontuacao;

            salvarTorneios();

            atualizarTabelaJogadores();

            document.getElementById("jogadorSelecionadoMensagem").innerText =
                "Jogador selecionado: " + jogadorSelecionado.nome;

            document.getElementById("mensagemEdicaoJogador").innerText =
                "Alterações salvas com sucesso!";
        }
    } else {
        document.getElementById("mensagemEdicaoJogador").innerText =
            "Selecione um jogador primeiro.";
    }
}


//Exclui um jogador com .splice ao mesmo tempo que atualiza a tabela. Com double-check. Desabilita o campo de edição se o jogador removido for o mesmo
function excluirJogador(indice) {
    let jogador = torneioSelecionado.jogadores[indice];

    if (confirm("Deseja excluir o jogador '" + jogador.nome + "'?")) {
        if (confirm("Tem certeza? Essa exclusão não pode ser desfeita.")) {

            if (jogadorSelecionado == jogador) {
                jogadorSelecionado = null;

                document.getElementById("jogadorSelecionadoMensagem").innerText =
                    "Nenhum jogador selecionado.";

                document.getElementById("camposEdicaoJogador").disabled = true;
                document.getElementById("formEdicaoJogador").reset();
            }

            torneioSelecionado.jogadores.splice(indice, 1);

            document.getElementById("mensagemEdicaoJogador").innerText = "";

            salvarTorneios();
            atualizarTabelaJogadores();
        }
    }
}

// = TIMES =
//Aqui começa o caos. É um caminho sem volta. Prossiga com cuidado.
function atualizarInterfaceTimes() {
    let seletor = document.getElementById("seletorEquipe");
    let campoNome = document.getElementById("nomeEquipe");
    let botaoSalvar = document.getElementById("botaoSalvarEquipe");

    seletor.innerHTML = "";

    seletor.disabled = true;
    campoNome.disabled = true;
    botaoSalvar.disabled = true;

    campoNome.value = "";

    document.getElementById("listaJogadoresEquipe").innerText =
        "Faça um sorteio para visualizar as equipes.";

    document.getElementById("listaReservas").innerText =
        "Nenhum reserva disponível.";

    document.getElementById("mensagemTimes").innerText = "";

    if (torneioSelecionado === null) {
        document.getElementById("torneioTimesAtual").innerText =
            "Nenhum torneio selecionado.";

        let opcao = document.createElement("option");
        opcao.value = "";
        opcao.innerText = "Nenhum torneio selecionado";
        seletor.appendChild(opcao);

    } else {
        document.getElementById("torneioTimesAtual").innerText =
            "Torneio selecionado: " + torneioSelecionado.nome;

        if (torneioSelecionado.equipes.length === 0) {
            let opcao = document.createElement("option");
            opcao.value = "";
            opcao.innerText = "Faça um sorteio primeiro";
            seletor.appendChild(opcao);

        } else {
            for (
                let i = 0;
                i < torneioSelecionado.equipes.length;
                i++
            ) {
                let opcao = document.createElement("option");

                opcao.value = i;
                opcao.innerText = torneioSelecionado.equipes[i].nome;

                seletor.appendChild(opcao);
            }

            seletor.disabled = false;
            campoNome.disabled = false;
            botaoSalvar.disabled = false;

            // Seleciona o primeiro time
            seletor.value = "0";

            mostrarEquipe();
        }
    }
}

// Sorteia os jogadores e guarda os excedentes como reservas
function sortearTimes() {
    if (torneioSelecionado === null) {
        alert("Selecione um torneio primeiro.");
    } else {
        let quantidadeTimes = Number(torneioSelecionado.times);
        let jogadoresPorTime = Number(torneioSelecionado.jogadoresPorTime);

        let quantidadeVagas = quantidadeTimes * jogadoresPorTime;
        let jogadores = torneioSelecionado.jogadores;

        if (
            !Number.isInteger(quantidadeTimes) ||
            !Number.isInteger(jogadoresPorTime) ||
            quantidadeTimes < 2 ||
            jogadoresPorTime < 1
        ) {
            alert("A configuração do torneio é inválida.");
        } else if (jogadores.length < quantidadeVagas) {
            alert(
                "Jogadores insuficientes! São necessárias " +
                quantidadeVagas + " pessoas para preencher todos os times."
            );
        } else {

            // Conta quantos jogadores possuem cada número de camisa
            let contagemCamisas = [];

            for (let i = 0; i < jogadores.length; i++) {
                let encontrou = false;

                for (let j = 0; j < contagemCamisas.length; j++) {
                    if (
                        contagemCamisas[j].numeroCamisa ===
                        jogadores[i].numeroCamisa
                    ) {
                        contagemCamisas[j].quantidade++;
                        encontrou = true;
                    }
                }

                if (!encontrou) {
                    contagemCamisas.push({
                        numeroCamisa: jogadores[i].numeroCamisa,
                        quantidade: 1
                    });
                }
            }

            // Cada camisa pode aparecer, no máximo, uma vez por time
            let maximoDistribuivel = 0;

            for (let i = 0; i < contagemCamisas.length; i++) {
                maximoDistribuivel += Math.min(
                    contagemCamisas[i].quantidade,
                    quantidadeTimes
                );
            }

            if (maximoDistribuivel < quantidadeVagas) {
                alert(
                    "Não é possível preencher todos os times respeitando " +
                    "os números de camisa repetidos."
                );
            } else {

                // Cria uma cópia para não alterar o cadastro original
                let jogadoresSorteio = jogadores.slice();

                // Embaralhamento de Fisher-Yates do Roanald Fisher (Peixe Ronaldo)
                for (let i = jogadoresSorteio.length - 1; i > 0; i--) {
                    let j = Math.floor(Math.random() * (i + 1));

                    let temporario = jogadoresSorteio[i];
                    jogadoresSorteio[i] = jogadoresSorteio[j];
                    jogadoresSorteio[j] = temporario;
                }

                // Se a pontuação estiver habilitada, ordena da maior para a menor. Como embaralhamos antes, jogadores empatados também terão sua ordem aleatorizada.
                if (torneioSelecionado.usarPontuacao) {
                    for (let i = 0; i < jogadoresSorteio.length; i++) {
                        for (
                            let j = 0;
                            j < jogadoresSorteio.length - 1 - i;
                            j++
                        ) {
                            if (
                                jogadoresSorteio[j].pontuacao <
                                jogadoresSorteio[j + 1].pontuacao
                            ) {
                                let temporario = jogadoresSorteio[j];

                                jogadoresSorteio[j] =
                                    jogadoresSorteio[j + 1];

                                jogadoresSorteio[j + 1] = temporario;
                            }
                        }
                    }
                }

                // Monta as equipes temporárias. As equipes atuais só serão substituídas se o novo sorteio for concluído corretamente.
                let equipesNovas = [];

                for (let i = 0; i < quantidadeTimes; i++) {
                    let nome = "Time " + (i + 1);

                    // Preserva os nomes personalizados anteriores
                    if (
                        torneioSelecionado.equipes[i] &&
                        torneioSelecionado.equipes[i].nome
                    ) {
                        nome = torneioSelecionado.equipes[i].nome;
                    }

                    equipesNovas.push({
                        nome: nome,
                        jogadores: [],
                        numerosCamisa: [],
                        pontuacaoTotal: 0
                    });
                }

                let reservasNovas = [];

                // Distribui os jogadores
                for (let i = 0; i < jogadoresSorteio.length; i++) {
                    let jogador = jogadoresSorteio[i];

                    let equipesDisponiveis = [];
                    let menorQuantidade = jogadoresPorTime + 1;

                    // Procura equipes com vaga e sem camisa repetida
                    for (let j = 0; j < equipesNovas.length; j++) {
                        let equipe = equipesNovas[j];

                        if (
                            equipe.jogadores.length < jogadoresPorTime &&
                            !equipe.numerosCamisa.includes(
                                jogador.numeroCamisa
                            )
                        ) {
                            if (
                                equipe.jogadores.length < menorQuantidade
                            ) {
                                menorQuantidade = equipe.jogadores.length;
                                equipesDisponiveis = [j];
                            } else if (
                                equipe.jogadores.length === menorQuantidade
                            ) {
                                equipesDisponiveis.push(j);
                            }
                        }
                    }

                    if (equipesDisponiveis.length > 0) {
                        let equipesPreferidas = equipesDisponiveis;

                        // Entre equipes igualmente preenchidas, prefere a de menor pontuação acumulada
                        if (torneioSelecionado.usarPontuacao) {
                            let menorPontuacao = Infinity;
                            equipesPreferidas = [];

                            for (
                                let j = 0;
                                j < equipesDisponiveis.length;
                                j++
                            ) {
                                let indice = equipesDisponiveis[j];
                                let pontuacao =
                                    equipesNovas[indice].pontuacaoTotal;

                                if (pontuacao < menorPontuacao) {
                                    menorPontuacao = pontuacao;
                                    equipesPreferidas = [indice];
                                } else if (pontuacao === menorPontuacao) {
                                    equipesPreferidas.push(indice);
                                }
                            }
                        }

                        // Sorteia entre as equipes igualmente adequadas
                        let posicao = Math.floor(
                            Math.random() * equipesPreferidas.length
                        );

                        let indiceEscolhido = equipesPreferidas[posicao];
                        let equipeEscolhida = equipesNovas[indiceEscolhido];

                        // Guardamos o ID, não uma cópia do jogador. Isso facilita futuras edições e trocas.
                        equipeEscolhida.jogadores.push(jogador.id);
                        equipeEscolhida.numerosCamisa.push(
                            jogador.numeroCamisa
                        );

                        if (torneioSelecionado.usarPontuacao) {
                            equipeEscolhida.pontuacaoTotal +=
                                Number(jogador.pontuacao) || 0;
                        }
                    } else {
                        // Sem vaga compatível: fica como reserva
                        reservasNovas.push(jogador.id);
                    }
                }

                // Confere se todas as vagas foram preenchidas
                let totalDistribuido = 0;

                for (let i = 0; i < equipesNovas.length; i++) {
                    totalDistribuido += equipesNovas[i].jogadores.length;
                }

                if (totalDistribuido !== quantidadeVagas) {
                    alert(
                        "Não foi possível completar o sorteio. " +
                        "As equipes anteriores foram preservadas."
                    );
                } else {

                    // Remove dados auxiliares usados durante o sorteio
                    for (let i = 0; i < equipesNovas.length; i++) {
                        delete equipesNovas[i].numerosCamisa;
                        delete equipesNovas[i].pontuacaoTotal;
                    }

                    torneioSelecionado.equipes = equipesNovas;
                    torneioSelecionado.reservas = reservasNovas;

                    salvarTorneios();
                    atualizarInterfaceTimes();

                    document.getElementById("mensagemTimes").innerText =
                        "Sorteio concluído! " + totalDistribuido +
                        " jogadores distribuídos e " +
                        reservasNovas.length + " reserva(s).";
                }
            }
        }
    }
}

function mostrarEquipe() {
    let listaEquipe = document.getElementById("listaJogadoresEquipe");
    let listaReservas = document.getElementById("listaReservas");
    let seletor = document.getElementById("seletorEquipe");

    listaEquipe.innerHTML = "";
    listaReservas.innerHTML = "";

    if (
        torneioSelecionado !== null &&
        seletor.value !== "" &&
        torneioSelecionado.equipes.length > 0
    ) {
        let indice = Number(seletor.value);
        let equipe = torneioSelecionado.equipes[indice];

        if (equipe) {
            document.getElementById("nomeEquipe").value = equipe.nome;

            // Monta um mapa para localizar os jogadores pelo ID
            let jogadoresPorId = {};

            for (
                let i = 0;
                i < torneioSelecionado.jogadores.length;
                i++
            ) {
                let jogador = torneioSelecionado.jogadores[i];
                jogadoresPorId[jogador.id] = jogador;
            }

            if (equipe.jogadores.length === 0) {
                listaEquipe.innerText = "Esta equipe não possui jogadores.";

            } else {
                listaEquipe.className = "list-group";

                for (let i = 0; i < equipe.jogadores.length; i++) {
                    let jogador = jogadoresPorId[equipe.jogadores[i]];

                    if (jogador) {
                        let item = document.createElement("div");

                        item.className = "list-group-item";

                        let texto = jogador.nome +
                            " — Camisa " + jogador.numeroCamisa;

                        if (torneioSelecionado.usarPontuacao) {
                            texto += " — Pontuação: " + jogador.pontuacao;
                        }

                        item.innerText = texto;
                        listaEquipe.appendChild(item);
                    }
                }
            }

            // Exibe os reservas
            if (
                Array.isArray(torneioSelecionado.reservas) &&
                torneioSelecionado.reservas.length > 0
            ) {
                listaReservas.className = "list-group";

                for (
                    let i = 0;
                    i < torneioSelecionado.reservas.length;
                    i++
                ) {
                    let jogador =
                        jogadoresPorId[torneioSelecionado.reservas[i]];

                    if (jogador) {
                        let item = document.createElement("div");
                        item.className = "list-group-item";

                        let texto = jogador.nome +
                            " — Camisa " + jogador.numeroCamisa;

                        if (torneioSelecionado.usarPontuacao) {
                            texto += " — Pontuação: " + jogador.pontuacao;
                        }

                        item.innerText = texto;
                        listaReservas.appendChild(item);
                    }
                }
            } else {
                listaReservas.innerText = "Nenhum reserva disponível.";
            }
        }
    } else {
        document.getElementById("nomeEquipe").value = "";

        listaEquipe.innerText = "Selecione um torneio e faça um sorteio.";
        listaReservas.innerText = "Nenhum reserva disponível.";
    }
}

function salvarNomeEquipe(event) {
    event.preventDefault();

    if (
        torneioSelecionado !== null &&
        document.getElementById("seletorEquipe").value !== ""
    ) {
        let indice = Number(
            document.getElementById("seletorEquipe").value
        );

        let nome = document.getElementById("nomeEquipe").value.trim();

        if (nome === "") {
            document.getElementById("mensagemTimes").innerText =
                "Digite um nome válido para o time.";

        } else {
            torneioSelecionado.equipes[indice].nome = nome;

            salvarTorneios();

            document.getElementById("seletorEquipe")
                .options[indice].text = nome;

            document.getElementById("mensagemTimes").innerText =
                "Nome do time atualizado com sucesso!";
        }
    } else {
        document.getElementById("mensagemTimes").innerText =
            "Selecione um torneio com equipes sorteadas.";
    }
}