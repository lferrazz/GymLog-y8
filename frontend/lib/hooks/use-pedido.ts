"use client"

import { useCallback, useEffect, useState } from "react"

export type Pedido<T> =
  | { fase: "carregando" }
  | { fase: "erro"; erro: string }
  | { fase: "pronto"; dados: T }

// pede quando a tela abre ou as dependencias mudam, e ignora a resposta que chega atrasada
export function usePedido<T>(
  pedir: () => Promise<T>,
  dependencias: React.DependencyList,
): Pedido<T> & { tentarDeNovo: () => void } {
  const [pedido, setPedido] = useState<Pedido<T>>({ fase: "carregando" })
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let valendo = true
    setPedido({ fase: "carregando" })
    pedir().then(
      (dados) => valendo && setPedido({ fase: "pronto", dados }),
      (falha) =>
        valendo && setPedido({ fase: "erro", erro: falha instanceof Error ? falha.message : String(falha) }),
    )
    return () => {
      valendo = false
    }
  }, [...dependencias, tentativa])

  const tentarDeNovo = useCallback(() => setTentativa((t) => t + 1), [])
  return { ...pedido, tentarDeNovo }
}
