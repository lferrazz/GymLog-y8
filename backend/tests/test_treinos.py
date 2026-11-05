from datetime import datetime, timedelta

ONTEM = (datetime.now() - timedelta(days=1)).replace(hour=8, minute=0, second=0, microsecond=0)


def treino(nome="Peito e triceps", tipo="Musculação", hora=8, duracao=60):
    return {
        "nome": nome,
        "tipo_treino": tipo,
        "data_treino": ONTEM.replace(hour=hora).isoformat(),
        "duracao_min": duracao,
    }


def test_crud_completo(cliente, ana):
    criado = cliente.post("/treinos/", json=treino(), headers=ana)
    assert criado.status_code == 201
    treino_id = criado.json()["id"]

    assert [t["id"] for t in cliente.get("/treinos/", headers=ana).json()] == [treino_id]
    assert cliente.get(f"/treinos/{treino_id}", headers=ana).json()["nome"] == "Peito e triceps"

    editado = cliente.patch(f"/treinos/{treino_id}", json={"duracao_min": 45}, headers=ana)
    assert editado.status_code == 200
    assert editado.json()["duracao_min"] == 45

    assert cliente.delete(f"/treinos/{treino_id}", headers=ana).status_code == 204
    assert cliente.get(f"/treinos/{treino_id}", headers=ana).status_code == 404


def test_o_dono_vem_do_token_e_nao_do_corpo(cliente, ana):
    eu = cliente.get("/usuarios/eu", headers=ana).json()
    criado = cliente.post("/treinos/", json={**treino(), "dono_id": "outro"}, headers=ana)
    assert criado.json()["dono_id"] == eu["id"]


def test_cada_um_ve_so_os_seus_treinos(cliente, ana, bia):
    treino_id = cliente.post("/treinos/", json=treino(), headers=ana).json()["id"]
    assert cliente.get("/treinos/", headers=bia).json() == []
    assert cliente.get(f"/treinos/{treino_id}", headers=bia).status_code == 404
    assert cliente.patch(f"/treinos/{treino_id}", json={"duracao_min": 10}, headers=bia).status_code == 404
    assert cliente.delete(f"/treinos/{treino_id}", headers=bia).status_code == 404


def test_rn01_mesmo_nome_no_mesmo_dia(cliente, ana):
    cliente.post("/treinos/", json=treino(), headers=ana)
    resposta = cliente.post("/treinos/", json=treino(nome="PEITO E TRICEPS", hora=18), headers=ana)
    assert resposta.status_code == 409


def test_rn02_data_no_futuro(cliente, ana):
    amanha = (datetime.now() + timedelta(days=1)).isoformat()
    resposta = cliente.post("/treinos/", json={**treino(), "data_treino": amanha}, headers=ana)
    assert resposta.status_code == 409


def test_rn03_mais_de_600_minutos_no_dia(cliente, ana):
    cliente.post("/treinos/", json=treino(nome="Longao", duracao=560), headers=ana)
    resposta = cliente.post("/treinos/", json=treino(nome="Extra", hora=18, duracao=41), headers=ana)
    assert resposta.status_code == 409


def test_editar_nao_colide_consigo_mesmo(cliente, ana):
    treino_id = cliente.post("/treinos/", json=treino(), headers=ana).json()["id"]
    resposta = cliente.patch(f"/treinos/{treino_id}", json={"observacoes": "bom"}, headers=ana)
    assert resposta.status_code == 200


def test_validacao_da_forma_responde_422_em_portugues(cliente, ana):
    resposta = cliente.post("/treinos/", json=treino(nome="P"), headers=ana)
    assert resposta.status_code == 422
    assert "o nome precisa ter pelo menos 3 caracteres" in resposta.text


def test_busca_por_nome_e_filtro_por_tipo(cliente, ana):
    cliente.post("/treinos/", json=treino(nome="Peito e triceps"), headers=ana)
    cliente.post("/treinos/", json=treino(nome="Corrida no parque", tipo="Corrida", hora=6), headers=ana)

    def nomes(consulta):
        return [t["nome"] for t in cliente.get(f"/treinos/{consulta}", headers=ana).json()]

    assert nomes("?nome=PARQUE") == ["Corrida no parque"]
    assert nomes("?nome=xyz") == []
    assert nomes("?tipo_treino=Musculação") == ["Peito e triceps"]
    assert nomes("") == ["Corrida no parque", "Peito e triceps"]
