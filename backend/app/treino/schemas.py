from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TreinoCriar(BaseModel):
    nome: str = Field(min_length=3, max_length=100)
    tipo_treino: str
    data_treino: datetime
    duracao_min: int = Field(gt=0)
    observacoes: str | None = None


class TreinoPublico(TreinoCriar):
    model_config = ConfigDict(from_attributes=True)

    id: str


class TreinoAtualizar(BaseModel):
    nome: str | None = Field(default=None, min_length=3, max_length=100)
    tipo_treino: str | None = None
    data_treino: datetime | None = None
    duracao_min: int | None = Field(default=None, gt=0)
    observacoes: str | None = None