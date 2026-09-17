from sqlalchemy.orm import Session

from ..seguranca import conferir_senha, gerar_hash
from . import repository
from .erros import CredenciaisInvalidas, EmailJaCadastrado
from .models import Usuario
from .schemas import UsuarioCriar


def cadastrar(db: Session, dados: UsuarioCriar) -> Usuario:
    if repository.buscar_por_email(db, dados.email) is not None:
        raise EmailJaCadastrado

    valores = dados.model_dump()

    # Depois do pop a senha em texto puro nao existe mais no fluxo.
    senha = valores.pop("senha")
    valores["senha_hash"] = gerar_hash(senha)

    usuario = repository.criar(db, valores)
    db.commit()
    return usuario


def autenticar(db: Session, email: str, senha: str) -> Usuario:
    usuario = repository.buscar_por_email(db, email)
    if usuario is None:
        raise CredenciaisInvalidas
    if not conferir_senha(senha, usuario.senha_hash):
        raise CredenciaisInvalidas
    return usuario
