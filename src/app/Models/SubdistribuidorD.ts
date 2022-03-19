export interface SubdistribuidorD {
    id?: number|null,
    renglon?: number|null,
    articulo?: string|null,
    descripcion?: string|null,
    cantidad: number,
    pendiente?: number|null,
    unidad?: string|null,
    almacen?: string|null,
    precio: number,
    impuesto?: number|null,
    descuento?: number|null,//valor calculado
    porcentajeDescuento?: number|null, //porcentaje
    observaciones?: string|null
}