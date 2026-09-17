import os
from datetime import UTC, datetime, timedelta

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .database import get_db
from .usuarios import repository
from .usuarios.erros import CredenciaisInvalidas
from .usuarios.models import Usuario

load_dotenv()

# Sem default de proposito: um valor tipo "troque-me" faria o projeto rodar
# assinando tokens com uma chave que qualquer um que leu o codigo conhece.
SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITMO = "HS256"
TOKEN_DURA_MINUTOS = 60

esquema_oauth = OAuth2PasswordBearer(tokenUrl="/usuarios/login")


def gerar_hash(senha: str) -> str:
    return bcrypt.hashpw(senha.encode(), bcrypt.gensalt()).decode()


def conferir_senha(senha: str, senha_hash: str) -> bool:
    return bcrypt.checkpw(senha.encode(), senha_hash.encode())


def criar_token(usuario_id: str) -> str:
    # O conteudo do JWT e legivel por qualquer um, mas vem assinado: sem o
    # SECRET_KEY ninguem troca o sub e vira outro usuario.
    expira_em = datetime.now(UTC) + timedelta(minutes=TOKEN_DURA_MINUTOS)
    return jwt.encode({"sub": usuario_id, "exp": expira_em}, SECRET_KEY, algorithm=ALGORITMO)


def get_current_user(
    token: str = Depends(esquema_oauth), db: Session = Depends(get_db)
) -> Usuario:
    """Troca um token por um usuario de verdade, ou barra a entrada."""
    try:
        conteudo = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITMO])
        usuario_id = conteudo["sub"]
    except (jwt.PyJWTError, KeyError):
        # Token adulterado, assinado com outra chave, expirado ou sem sub.
        raise CredenciaisInvalidas

    usuario = repository.buscar(db, usuario_id)
    if usuario is None:
        # Assinatura boa, mas a conta nao existe mais.
        raise CredenciaisInvalidas
    return usuario
