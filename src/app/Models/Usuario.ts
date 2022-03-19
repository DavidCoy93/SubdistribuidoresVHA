import { Cliente } from "./Cliente"

export interface Usuario {
    token?: string,
    esAdmin?: boolean
    cliente?: Cliente
}