import { SubdistribuidorD } from "./SubdistribuidorD"

export interface Subdistribuidor {
    id?: number|null,
    documento?: string|null,//Required
    serie?: string|null,
    folio?: number|null,
    fecha?: Date|null,//R
    moneda?: string|null,//R
    tipoCambio?: number|null,//R
    referencia?: string|null,//R
    observaciones?: string|null,//R
    estatus?: string|null,//R
    almacen?: string|null,
    cliente?: string|null,//R
    agente?: string|null,
    formaPago?: string|null,
    condicion?: string|null,//R
    vencimiento?: Date|null,//R
    vigencia?: Date|null,//R dias primeros
    descuentoGlobal: number,//R
    importe: number,//R
    impuestos: number,//R
    origenModulo?: string|null, //SUBD CUANDO SE CONVIERTE A ORDEN 
    origenID?: number|null,
    origenDocumento?: string|null,// SOLICITUD OC
    origenSerie?: string|null,// SOLICITUD OC
    origenFolio?: number|null, // SOLICITUD OC
    pedidoID?: number|null,
    pedidoMov?: string|null,
    pedidoMovID?: string|null,
    fechaEmbarque?: Date|null,
    turnoEmbarque?: string|null, 
    empresa?: string|null, //VHA
    sucursal?: number|null,//NULO
    usuarioAlta?: string|null,//NULO
    fechaAlta?: Date|null,//NULO
    rSubdistribuidorD: Array<SubdistribuidorD>,
    nombreAgente?: string,
    sucursalCliente: number|null,
    nombreCliente?: string
}