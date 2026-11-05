import os
from datetime import UTC, datetime, timedelta

import jwt
from dotenv import load_dotenv
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .database import get_db
from .usuarios import service as usuarios_service
from .usuarios.erros import CredenciaisInvalidas
from .usuarios.models import Usuario

load_dotenv()

SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITMO = "HS256"
TOKEN_DURA_MINUTOS = 60

esquema_oauth = OAuth2PasswordBearer(tokenUrl="/usuarios/login")


def criar_token(usuario_id: str) -> str:
    expira_em = datetime.now(UTC) + timedelta(minutes=TOKEN_DURA_MINUTOS)
    return jwt.encode({"sub": usuario_id, "exp": expira_em}, SECRET_KEY, algorithm=ALGORITMO)


def get_current_user(
    token: str = Depends(esquema_oauth), db: Session = Depends(get_db)
) -> Usuario:
    # troca o token pelo usuario: assinatura, validade e conta existente, senao 401
    try:
        conteudo = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITMO])
        usuario_id = conteudo["sub"]
    except (jwt.PyJWTError, KeyError):
        raise CredenciaisInvalidas

    return usuarios_service.buscar(db, usuario_id)


def id_do_usuario_logado(usuario: Usuario = Depends(get_current_user)) -> str:
    return usuario.id
