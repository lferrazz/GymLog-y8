def test_cadastro_devolve_201_sem_a_senha(cliente):
    resposta = cliente.post(
        "/usuarios/", json={"nome": "Ana", "email": "ana@ifg.edu.br", "senha": "segredo1"}
    )
    assert resposta.status_code == 201
    assert "senha" not in resposta.text
    assert resposta.json()["email"] == "ana@ifg.edu.br"


def test_email_repetido_e_recusado_com_409(cliente):
    dados = {"nome": "Ana", "email": "ana@ifg.edu.br", "senha": "segredo1"}
    cliente.post("/usuarios/", json=dados)
    resposta = cliente.post("/usuarios/", json=dados)
    assert resposta.status_code == 409


def test_senha_curta_e_recusada_com_422(cliente):
    resposta = cliente.post(
        "/usuarios/", json={"nome": "Ana", "email": "ana@ifg.edu.br", "senha": "123"}
    )
    assert resposta.status_code == 422


def test_login_errado_e_email_inexistente_dao_o_mesmo_401(cliente):
    cliente.post("/usuarios/", json={"nome": "Ana", "email": "ana@ifg.edu.br", "senha": "segredo1"})
    senha_errada = cliente.post(
        "/usuarios/login", data={"username": "ana@ifg.edu.br", "password": "errada"}
    )
    email_inexistente = cliente.post(
        "/usuarios/login", data={"username": "zz@ifg.edu.br", "password": "segredo1"}
    )
    assert senha_errada.status_code == email_inexistente.status_code == 401
    assert senha_errada.json() == email_inexistente.json()


def test_eu_com_token_devolve_quem_entrou(cliente, ana):
    resposta = cliente.get("/usuarios/eu", headers=ana)
    assert resposta.status_code == 200
    assert resposta.json()["nome"] == "Ana"


def test_rota_protegida_sem_token_ou_com_token_adulterado_da_401(cliente, ana):
    assert cliente.get("/treinos/").status_code == 401
    adulterado = {"Authorization": ana["Authorization"][:-2] + "xx"}
    assert cliente.get("/treinos/", headers=adulterado).status_code == 401
