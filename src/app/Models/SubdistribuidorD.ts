export interface SubdistribuidorD {
    id?: number|null,
    renglon: number,
    articulo?: string,
    descripcion?: string|null,
    cantidad: number,
    pendiente: number,
    unidad?: string|null,
    almacen?: string|null,
    precio: number,
    impuesto: number,
    descuento: number,//valor calculado
    porcentajeDescuento: number, //porcentaje
    observaciones?: string|null,
    linea?: string,
    disponible?: number
}