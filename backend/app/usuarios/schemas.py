from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UsuarioCriar(BaseModel):
    nome: str = Field(min_length=2, max_length=100)
    email: EmailStr
    senha: str = Field(min_length=6)


class UsuarioPublico(BaseModel):

    model_config = ConfigDict(from_attributes=True)
    id: str
    nome: str
    email: EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
