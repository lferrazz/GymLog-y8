from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..database import get_db
from ..seguranca import criar_token, get_current_user
from . import service
from .models import Usuario
from .schemas import Token, UsuarioCriar, UsuarioPublico

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.post("/", response_model=UsuarioPublico, status_code=status.HTTP_201_CREATED)
def cadastrar(dados: UsuarioCriar, db: Session = Depends(get_db)):
    return service.cadastrar(db, dados)


@router.post("/login", response_model=Token)
def login(
    form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    # O padrao OAuth2 manda form-data (nao JSON) e fixa o nome do campo como
    # "username", mesmo quando o que pedimos e um e-mail.
    usuario = service.autenticar(db, form.username, form.password)
    return Token(access_token=criar_token(usuario.id))


@router.get("/eu", response_model=UsuarioPublico)
def eu(usuario: Usuario = Depends(get_current_user)):
    return usuario
