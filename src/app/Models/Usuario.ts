import { Agente } from "./Agente"
import { Cliente } from "./Cliente"

export interface Usuario {
    token?: string,
    cliente?: Cliente,
    agente?: Agente,
    usuario?: null,
    urlAPI?: string|null,
    success?: boolean|null,
    errors?: Array<string>|null,
    esAdmin?: boolean,
}