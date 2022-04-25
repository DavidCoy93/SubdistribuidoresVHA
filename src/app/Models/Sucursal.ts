export interface Sucursal {
    id: number,
    nombre: string,
    prefijo: string,
    direccion: string,
    direccionNumero: string,
    direccionNumeroInt: string|null,
    delegacion: string,
    colonia: string,
    poblacion: string,
    estado: string,
    pais: string,
    codigoPostal: string,
    telefonos: string|null,
    estatus: string
}