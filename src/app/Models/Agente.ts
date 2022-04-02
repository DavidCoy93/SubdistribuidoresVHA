import { AgenteCte } from "./AgenteCte";

export interface Agente {
    agenteID: string,
    nombre: string,
    tipo: string,
    telefonos: null|string,
    categoria: null|string,
    zona: null|string,
    grupo: null|string,
    estatus: string,
    ultimoCambio: Date,
    alta: Date,
    baja: Date,
    eMail: string,
    rAgenteCte: AgenteCte
}