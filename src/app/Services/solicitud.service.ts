import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DialogView } from '../Components/notificacion/dialogView';
import { Articulo } from '../Models/Articulo';
import { SaldoU } from '../Models/SaldoU';
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
    encabezado: { estatus: 'PENDIENTE', importe: 0, moneda: 'Pesos', impuestos: 0, almacen: 'CDG-100', empresa: 'VHA'}, 
    detalle: []
  }

  constructor(
    private globalService: GlobalsService,
    private messageService: NzMessageService,
    private http: HttpClient,
    private dialog: MatDialog) 
  { 
    this.usuarioSD = this.globalService.UsuarioLogueado;
    this.solicitudOC.encabezado.cliente = this.usuarioSD.cliente?.cliente;
    this.solicitudOC.encabezado.documento = 'Solicitud Orden Compra';
    this.solicitudOC.encabezado.tipoCambio = 1;
    this.solicitudOC.encabezado.condicion = this.usuarioSD.cliente?.condicion;
    this.solicitudOC.encabezado.vencimiento = new Date();
    this.solicitudOC.encabezado.vigencia = new Date();
    this.solicitudOC.encabezado.observaciones = 'PRUEBA';
  }

  agregarDetalleSolicitud(art: Articulo, almacen?: SaldoU,) {
    let detalleSolicitud: SubdistribuidorD = {
      articulo: art.articulo, 
      unidad: art.unidad, 
      precio: art.precioLista, 
      descripcion: art.descripcion1,
      cantidad: (almacen !== undefined) ? 1 : 0
    };

    const detalleExistente = this.solicitudOC.detalle.find(det => det.articulo === detalleSolicitud.articulo);
    if(detalleExistente === undefined) {
      detalleSolicitud.almacen = (almacen !== undefined) ? almacen.grupo : undefined;
      detalleSolicitud.disponible = (almacen !== undefined) ? almacen.saldoUU : detalleSolicitud.disponible;
      this.solicitudOC.detalle.push(detalleSolicitud)
    } else {
      this.solicitudOC.detalle.forEach((detalleArt, indice) => {
        if (detalleArt.articulo === detalleSolicitud.articulo) {
          detalleArt.cantidad = (almacen !== undefined) ? detalleArt.cantidad += 1 : 0;
          detalleArt.almacen = (almacen !== undefined) ? almacen.grupo : detalleArt.almacen;
          detalleArt.disponible = (almacen !== undefined) ? almacen.saldoUU : detalleArt.disponible;
        }
      })
    }
    this.messageService.success(`Se ha agregado el articulo ${detalleSolicitud.articulo} a la solicitud`, {nzDuration: 2000});
    this.calcularImporte();
    // this.http.get<Articulo>(this.globalService.urlAPI + `Articulos/ArticuloCliente?Articulo=${art.articulo}&Cliente=${this.usuarioSD.cliente?.cliente}`, 
    //   { 
    //     headers: new HttpHeaders({
    //       Authorization: 'Bearer ' + this.usuarioSD.token
    //     })
    //   }
    // ).subscribe({
    //   next: data => {
    //     if(data.rSaldoU.length > 0) {
    //       let detalleSolicitud: SubdistribuidorD = {
    //         articulo: art.articulo, 
    //         unidad: art.unidad, 
    //         precio: art.precioLista, 
    //         descripcion: art.descripcion1,
    //         cantidad: (almacen !== undefined) ? 1 : 0
    //       };
      
    //       const detalleExistente = this.solicitudOC.detalle.find(det => det.articulo === detalleSolicitud.articulo);
    //       if(detalleExistente === undefined) {
    //         detalleSolicitud.almacen = (almacen !== undefined) ? almacen.grupo : undefined;
    //         detalleSolicitud.disponible = (almacen !== undefined) ? almacen.saldoUU : detalleSolicitud.disponible;
    //         this.solicitudOC.detalle.push(detalleSolicitud)
    //       } else {
    //         this.solicitudOC.detalle.forEach((detalleArt, indice) => {
    //           if (detalleArt.articulo === detalleSolicitud.articulo) {
    //             detalleArt.cantidad = (almacen !== undefined) ? detalleArt.cantidad += 1 : 0;
    //             detalleArt.almacen = (almacen !== undefined) ? almacen.grupo : detalleArt.almacen;
    //             detalleArt.disponible = (almacen !== undefined) ? almacen.saldoUU : detalleArt.disponible;
    //           }
    //         })
    //       }
    //       this.messageService.success(`Se ha agregado el articulo ${detalleSolicitud.articulo} a la solicitud`, {nzDuration: 2000});
    //       this.calcularImporte();
    //     } else {
    //       this.messageService.error('Por el momento no hay unidades disponibles');
    //     }
    //   },
    //   error: err => {
    //     this.dialog.open(DialogView, {
    //       width: '300px',
    //       data: {titulo: 'Error', mensaje: 'Ocurrio un error al verificar la disponibilidad del articulo'}
    //     })
    //   }
    // })
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

    if(this.solicitudOC.encabezado.fecha === null || this.solicitudOC.encabezado.fecha) {
      this.solicitudOC.encabezado.fecha = new Date();
    }

    this.solicitudOC.encabezado.impuestos = (this.solicitudOC.encabezado.importe * 0.16);
  }

  enviarOrdenCompra(): void {
    this.solicitudOC.detalle.forEach((det, indice) => {
      det.renglon = indice + 1;
      det.pendiente = det.cantidad;
      det.almacen = 'CDG-100';
      det.impuesto = ((det.precio * 0.16) * det.cantidad);
      det.descuento = 0;
      det.porcentajeDescuento = 0;
      det.observaciones = 'PRUEBA'
    });

    this.http.post(this.globalService.urlAPI + 'Subdistribuidor', this.solicitudOC, { 
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuarioSD.token
      })
    }).subscribe({
      next: response => {
        let orden = response;
      },
      error: err => {
        alert("Ocurrio un error");
      }
    })
  }

}
