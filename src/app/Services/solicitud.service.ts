import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Articulo } from '../Models/Articulo';
import { solicitud } from '../Models/Solicitud';
import { SubdistribuidorD } from '../Models/SubdistribuidorD';
import { Usuario } from '../Models/Usuario';
import { GlobalsService } from './globals.service';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  usuarioSD: Usuario = {};
  public solicitudOC: solicitud = {
    encabezado: { estatus: 'PENDIENTE', importe: 0, moneda: 'Pesos', impuestos: 0}, 
    detalle: []
  }

  constructor(
    private globalService: GlobalsService,
    private messageService: NzMessageService) { 
    this.usuarioSD = this.globalService.UsuarioLogueado;
  }

  agregarDetalleSolicitud(art: Articulo) {
    let detalleSolicitud: SubdistribuidorD = {articulo: art.articulo, unidad: art.unidad, precio: art.precioLista, cantidad: 1, descripcion: art.descripcion1 }
    const detalleExistente = this.solicitudOC.detalle.find(det => det.articulo === detalleSolicitud.articulo);
    if(detalleExistente === undefined) {
      this.solicitudOC.detalle.push(detalleSolicitud)
    } else {
      this.solicitudOC.detalle.forEach((detalleArt, indice) => {
        if (detalleArt.articulo === detalleSolicitud.articulo) {
          detalleArt.cantidad += 1
        }
      })
    }
    this.messageService.success(`Se ha agregado el articulo ${detalleSolicitud.articulo} a la solicitud`, {nzDuration: 2000});
    this.calcularImporte();
    console.log(this.solicitudOC);
  }

  quitarDetalleSolicitud(detalle: SubdistribuidorD) {
    this.solicitudOC.detalle.forEach((det, indice) => {
      if(det.articulo === detalle.articulo) {
        this.solicitudOC.detalle.splice(indice, 1);
      }
    });
    this.messageService.success(`Se ha quitado el articulo ${detalle.articulo} de la solicitud`, {nzDuration: 2000});
    this.calcularImporte();
  } 

  calcularImporte(): void {
    if(this.solicitudOC.detalle.length === 0) {
      this.solicitudOC.encabezado.importe = 0;
    } else {
      this.solicitudOC.encabezado.importe = 0;
      this.solicitudOC.detalle.forEach((det, indice) => {
        this.solicitudOC.encabezado.importe += det.precio*det.cantidad;
      });
    }
    this.solicitudOC.encabezado.impuestos = (this.solicitudOC.encabezado.importe * 0.16);
  }

}
