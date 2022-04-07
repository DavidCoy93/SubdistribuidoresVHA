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
    impuesto?: number|null,
    descuento?: number|null,//valor calculado
    porcentajeDescuento?: number|null, //porcentaje
    observaciones?: string|null,
    linea?: string,
    disponible?: number
}