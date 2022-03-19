import { ArtCosto } from "./ArtCosto";
import { ArticuloImagen } from "./ArticuloImagen";
import { ArtUnidad } from "./ArtUnidad";
import { Oferta } from "./Oferta";
import { SaldoU } from "./SaldoU";

export interface Articulo {
    articulo: string,
    rama?: string,
    descripcion1: string,
    descripcion2?: string,
    nombreCorto?: string,
    grupo?: string,
    categoria?: string,
    familia?: string,
    fabricante?: string,
    claveFabricante?: string,
    impuesto1?: number,
    unidad?: string,
    UnidadCompra?: string,
    peso?: number,
    tipo?: string,
    estatus?: string,
    registro1?: string,
    codigoAlterno?: string,
    tipoEmpaque?: string,
    precioLista: number,
    rArtUnidad?: ArtUnidad,
    rArtCosto?: ArtCosto
    rSaldoU: Array<SaldoU>,
    rOferta?: Oferta,
    precioPromocion?: number,
    labelCount?: number,
    rArticuloImagen?: ArticuloImagen
    Cantidad: number,

}