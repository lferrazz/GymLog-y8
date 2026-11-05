from ..senhas import conferir_senha, gerar_hash
from . import repository
from .erros import CredenciaisInvalidas, EmailJaCadastrado


def cadastrar(db, dados: dict):
    # rn05: um e-mail pertence a uma conta so
    if repository.buscar_por_email(db, dados["email"]) is not None:
        raise EmailJaCadastrado

    valores = dict(dados)
    senha = valores.pop("senha")
    valores["senha_hash"] = gerar_hash(senha)

    return repository.criar(db, valores)


def autenticar(db, email: str, senha: str):
    usuario = repository.buscar_por_email(db, email)
    if usuario is None:
        raise CredenciaisInvalidas
    if not conferir_senha(senha, usuario.senha_hash):
        raise CredenciaisInvalidas
    return usuario


def buscar(db, usuario_id: str):
    usuario = repository.buscar(db, usuario_id)
    if usuario is None:
        raise CredenciaisInvalidas
    return usuario
