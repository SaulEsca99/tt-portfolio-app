"""Base de los modelos de RESPUESTA: serializa en camelCase.

El frontend (Next.js) tipa las respuestas en camelCase (`expectedReturn`, `sharpeRatio`…).
Solo se convierten los NOMBRES DE CAMPO; las claves de datos (tickers en `weights`,
`excluded`, etc.) no se tocan.
"""
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
