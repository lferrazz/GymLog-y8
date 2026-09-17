import os
from logging.config import fileConfig

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool

from app.database import Base

# Os models precisam ser importados mesmo sem uso direto: e o import que
# registra as tabelas no Base.metadata. Sem eles o autogenerate acha que o
# projeto nao tem tabela nenhuma e gera uma migracao vazia.
from app.treino import models as _treino_models  # noqa: F401
from app.usuarios import models as _usuarios_models  # noqa: F401

load_dotenv()

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# A URL vem do .env, nao do alembic.ini: assim o banco de verdade nunca fica
# escrito em arquivo versionado. O replace escapa o % porque o ConfigParser
# do alembic.ini trata % como marcador de interpolacao e quebraria em senhas
# que tenham esse caractere.
database_url = os.environ["DATABASE_URL"]
config.set_main_option("sqlalchemy.url", database_url.replace("%", "%%"))

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            # O SQLite nao sabe fazer ALTER TABLE para adicionar FK ou mudar
            # coluna. Em modo batch o Alembic contorna isso recriando a tabela
            # nova, copiando os dados e trocando uma pela outra. Em Postgres o
            # ALTER nativo e usado e a opcao nao atrapalha.
            render_as_batch=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
