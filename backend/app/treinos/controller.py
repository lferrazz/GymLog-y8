from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..seguranca import get_current_user, id_do_usuario_logado
from . import service
from .schemas import TreinoAtualizar, TreinoCriar, TreinoPublico

router = APIRouter(
    prefix="/treinos", tags=["treinos"], dependencies=[Depends(get_current_user)]
)


@router.post("/", response_model=TreinoPublico, status_code=status.HTTP_201_CREATED)
def criar(
    dados: TreinoCriar,
    db: Session = Depends(get_db),
    dono_id: str = Depends(id_do_usuario_logado),
):
    return service.criar(db, dados.model_dump(), dono_id)


@router.get("/", response_model=list[TreinoPublico])
def listar(
    nome: str | None = None,
    tipo_treino: str | None = None,
    db: Session = Depends(get_db),
    dono_id: str = Depends(id_do_usuario_logado),
):
    return service.listar(db, dono_id, nome=nome, tipo_treino=tipo_treino)


@router.get("/{treino_id}", response_model=TreinoPublico)
def buscar(
    treino_id: str,
    db: Session = Depends(get_db),
    dono_id: str = Depends(id_do_usuario_logado),
):
    return service.buscar(db, treino_id, dono_id)


@router.patch("/{treino_id}", response_model=TreinoPublico)
def atualizar(
    treino_id: str,
    dados: TreinoAtualizar,
    db: Session = Depends(get_db),
    dono_id: str = Depends(id_do_usuario_logado),
):
    return service.atualizar(
        db, treino_id, dados.model_dump(exclude_unset=True), dono_id
    )


@router.delete("/{treino_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir(
    treino_id: str,
    db: Session = Depends(get_db),
    dono_id: str = Depends(id_do_usuario_logado),
) -> Response:
    service.excluir(db, treino_id, dono_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
