import { Subdistribuidor } from "./Subdistribuidor";

export interface ResultadoAfectar {
    ok: number,
    titulo: string,
    nivel: string,
    descripcion: string,
    columna5: string,
    resultado?: Subdistribuidor|null
}