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
    formaPago?: string|null,
    condicion?: string|null,//R
    vencimiento?: Date|null,//R
    vigencia?: Date|null,//R dias primeros
    descuentoGlobal?: number|null,//R
    importe: number,//R
    impuestos: number,//R
    origenModulo?: string|null, //SUBD CUANDO SE CONVIERTE A ORDEN 
    origenDocumento?: string|null,// SOLICITUD OC
    origenSerie?: string|null,// SOLICITUD OC
    origenFolio?: number|null, // SOLICITUD OC
    empresa?: string|null, //VHA
    sucursal?: number|null,//NULO
    usuarioAlta?: string|null,//NULO
    fechaAlta?: Date|null//NULO
}