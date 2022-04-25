import { Articulo } from "./Articulo";

export interface ArtsRequest {
    arts: Array<Articulo>,
    totalPaginado: number
}