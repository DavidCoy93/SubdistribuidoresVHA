import { Sucursal } from "./Sucursal";

export interface UsuarioVHA {
    id: string,
    nombre: string,
    sucursal: number,
    defAgente: string,
    defAlmacen: string,
    defCliente: string|null,
    defFormapago: string|null,
    DefContUso: string,
    defListaPreciosEsp: string,
    estatus: string,
    uen: number,
    eMail: string,
    ultimoAcceso: Date,
    contrasenaWebApp: string,
    rSucursal: Sucursal,
    accesarOtrasSucursalesEnLinea: boolean,
    consultarOtrosMovs: boolean,
    bloquearAgente: boolean,
    rUsuarioSucursalAcceso: null,
    rUsuarioAcceso: null
}