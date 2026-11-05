export const AppRoutes = {
  login: "/login",
  cadastro: "/cadastro",
  treinos: "/treinos",
  novoTreino: "/treinos/novo",
  perfil: "/perfil",
  treino: (id: string) => `/treinos/${id}`,
  editarTreino: (id: string) => `/treinos/${id}/editar`,
} as const
