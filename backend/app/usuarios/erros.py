class ErroDeUsuario(Exception):
    pass


class EmailJaCadastrado(ErroDeUsuario):
    def __init__(self) -> None:
        super().__init__("E-mail ja cadastrado")


class CredenciaisInvalidas(ErroDeUsuario):
    def __init__(self) -> None:
        super().__init__("Credenciais invalidas")
