from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

DURACAO_MINIMA = 1
DURACAO_MAXIMA = 600


class ValidacoesDeTreino:
    """Validadores compartilhados por TreinoCriar e TreinoAtualizar.

    Trocamos Field() por field_validator para poder escrever a mensagem em
    portugues: o Field gera texto em ingles ("String should have at least 3
    characters"), que aparece cru no 422 para quem usa a API.

    check_fields=False permite declarar o validador aqui, num lugar so, mesmo
    que o campo seja declarado nas subclasses.
    """

    @field_validator("nome", check_fields=False)
    @classmethod
    def validar_nome(cls, valor: str | None) -> str | None:
        # None e caso legitimo no TreinoAtualizar (campo nao enviado), entao
        # passa direto sem validar.
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
    # So sai na resposta: o cliente nunca envia dono_id, quem preenche e o
    # service a partir do token.
    dono_id: str | None = None


class TreinoAtualizar(ValidacoesDeTreino, BaseModel):
    nome: str | None = None
    tipo_treino: str | None = None
    data_treino: datetime | None = None
    duracao_min: int | None = None
    observacoes: str | None = None
