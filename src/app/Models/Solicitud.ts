import { Articulo } from 'src/app/Models/Articulo'

export interface solicitud {
    Id: number,
    Agente: string,
    Descripcion: string,
    FechaEmision: Date,
    Articulos: Articulo[]
}