import { Agente } from "./Agente"
import { Cliente } from "./Cliente"

export interface AgenteCte {
    agente: string,
    cliente: string,
    comision: number,
    empresa: null|string,
    fueralinea: boolean,
    contrasenaWebAppSD: string,
    rAgente: Agente,
    rCte: Cliente
}