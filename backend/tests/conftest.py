import os
import tempfile
from pathlib import Path

import pytest

BANCO_DE_TESTE = Path(tempfile.gettempdir()) / "gymlog_testes.db"
os.environ["DATABASE_URL"] = f"sqlite:///{BANCO_DE_TESTE.as_posix()}"
os.environ["SECRET_KEY"] = "chave-so-para-os-testes-0123456789abcdef"

from fastapi.testclient import TestClient

from app.database import Base, engine
from app.main import app
from app.treinos import models as _treinos_models
from app.usuarios import models as _usuarios_models


@pytest.fixture
def cliente():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with TestClient(app) as c:
        yield c


def entrar(cliente, email="ana@ifg.edu.br", senha="segredo1", nome="Ana"):
    cliente.post("/usuarios/", json={"nome": nome, "email": email, "senha": senha})
    resposta = cliente.post("/usuarios/login", data={"username": email, "password": senha})
    return {"Authorization": f"Bearer {resposta.json()['access_token']}"}


@pytest.fixture
def ana(cliente):
    return entrar(cliente)


@pytest.fixture
def bia(cliente):
    return entrar(cliente, email="bia@ifg.edu.br", nome="Bia")
