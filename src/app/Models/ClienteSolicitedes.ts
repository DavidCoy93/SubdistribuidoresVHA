import { Subdistribuidor } from "./Subdistribuidor";

export interface ClienteSolicitedes {
    idCliente?: string,
    nombreCliente?: string,
    solicitudes: Array<Subdistribuidor>
}