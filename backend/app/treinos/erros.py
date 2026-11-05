class ErroDeTreino(Exception):
    pass


class TreinoNaoEncontrado(ErroDeTreino):
    def __init__(self) -> None:
        super().__init__("Treino nao encontrado")


class TreinoDuplicado(ErroDeTreino):
    def __init__(self, nome: str) -> None:
        super().__init__(f"Ja existe um treino chamado {nome} nesse dia")


class TreinoNoFuturo(ErroDeTreino):
    def __init__(self) -> None:
        super().__init__("A data do treino nao pode estar no futuro")


class LimiteDiarioExcedido(ErroDeTreino):
    def __init__(self, limite: int) -> None:
        super().__init__(f"A soma dos treinos do dia passaria de {limite} minutos")
