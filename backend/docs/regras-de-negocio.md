# Regras de negocio

## Treinos

RN01 - A mesma pessoa nao registra dois treinos com o mesmo nome no mesmo dia.

RN02 - Nao se registra treino que ainda nao aconteceu: a data do treino nao
       pode estar no futuro.

RN03 - Ninguem treina mais de 10 horas (600 minutos) somadas no mesmo dia.

RN04 - Cada pessoa so ve, altera e apaga os proprios treinos. Para quem nao e
       dono, o treino simplesmente nao existe.

## Usuarios

RN05 - Um e-mail pertence a uma conta so.

## O que NAO esta aqui, e por que

- Nome com 3 a 100 caracteres e duracao de 1 a 600 minutos por treino sao
  forma: da para conferir olhando so o que chegou. Quem confere e o schema
  (`schemas.py`), e a resposta e 422.
- Treino inexistente responde 404: isso e o protocolo HTTP, nao a academia.
