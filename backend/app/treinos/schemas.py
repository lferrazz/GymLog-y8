from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

DURACAO_MINIMA = 1
DURACAO_MAXIMA = 600


class ValidacoesDeTreino:
    @field_validator("nome", check_fields=False)
    @classmethod
    def validar_nome(cls, valor: str | None) -> str | None:
        if valor is None:
            return valor
        valor = valor.strip()
        if len(valor) < 3:
            raise ValueError("o nome precisa ter pelo menos 3 caracteres")
        if len(valor) > 100:
            raise ValueError("o nome pode ter no maximo 100 caracteres")
        return valor

    @field_validator("duracao_min", check_fields=False)
    @classmethod
    def validar_duracao(cls, valor: int | None) -> int | None:
        if valor is None:
            return valor
        if not DURACAO_MINIMA <= valor <= DURACAO_MAXIMA:
            raise ValueError(
                f"a duracao precisa estar entre {DURACAO_MINIMA} e "
                f"{DURACAO_MAXIMA} minutos"
            )
        return valor


class TreinoCriar(ValidacoesDeTreino, BaseModel):
    nome: str
    tipo_treino: str
    data_treino: datetime
    duracao_min: int
    observacoes: str | None = None


class TreinoPublico(TreinoCriar):
    model_config = ConfigDict(from_attributes=True)

    id: str
    dono_id: str | None = None


class TreinoAtualizar(ValidacoesDeTreino, BaseModel):
    nome: str | None = None
    tipo_treino: str | None = None
    data_treino: datetime | None = None
    duracao_min: int | None = None
    observacoes: str | None = None
