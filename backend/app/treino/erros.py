class ErroDeTreino(Exception):
    pass


class TreinoNaoEncontradoError(ErroDeTreino):
    def __init__(self) -> None:
        super().__init__("Treino nao encontrado")