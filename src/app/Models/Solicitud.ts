import { Subdistribuidor } from "./Subdistribuidor";
import { SubdistribuidorD } from "./SubdistribuidorD";

export interface solicitud {
    encabezado: Subdistribuidor,
    detalle: Array<SubdistribuidorD>
}