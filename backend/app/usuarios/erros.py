class ErroDeUsuario(Exception):
    pass


class EmailJaCadastrado(ErroDeUsuario):
    def __init__(self) -> None:
        super().__init__("E-mail ja cadastrado")


class CredenciaisInvalidas(ErroDeUsuario):
    def __init__(self) -> None:
        # Mensagem generica: dizer "e-mail nao existe" ou "senha errada"
        # entregaria ao atacante quais e-mails estao cadastrados.
        super().__init__("Credenciais invalidas")
