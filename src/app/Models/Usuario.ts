import { Agente } from "./Agente"
import { Cliente } from "./Cliente"
import { UsuarioVHA } from "./UsuarioVHA"

export interface Usuario {
    token?: string,
    cliente?: Cliente,
    agente?: Agente,
    usuario?: UsuarioVHA,
    urlAPI?: string|null,
    success?: boolean|null,
    errors?: Array<string>|null,
    esAdmin?: boolean,
    esUsuarioVHA?: boolean,
    contrasenaLogin?: string 
}