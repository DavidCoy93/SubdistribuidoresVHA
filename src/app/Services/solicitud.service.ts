import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DialogView } from '../Components/notificacion/dialogView';
import { Articulo } from '../Models/Articulo';
import { SaldoU } from '../Models/SaldoU';
import { solicitud } from '../Models/Solicitud';
import { Subdistribuidor } from '../Models/Subdistribuidor';
import { SubdistribuidorD } from '../Models/SubdistribuidorD';
import { Usuario } from '../Models/Usuario';
import { GlobalsService } from './globals.service';
import { ResultadoAfectar } from '../Models/ResultadoAfectar';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  usuarioSD: Usuario = {};
  fechaActual: Date = new Date();
  public solicitudOC: solicitud = {
    encabezado: { estatus: 'PENDIENTE', importe: 0, moneda: 'Pesos', impuestos: 0, almacen: 'CDG-100', empresa: 'VHA', rSubdistribuidorD: []}, 
    detalle: []
  }
  public lineaSolicitud: string = '';
  public totalCarritoPendiente: number = 0;

  constructor(
    private globalService: GlobalsService,
    private messageService: NzMessageService,
    private http: HttpClient,
    private dialog: MatDialog,
    private modalService: NzModalService,
    private router: Router) 
  { 
    this.usuarioSD = this.globalService.UsuarioLogueado;
    this.verificarSolicitudesPendientes();
  }


  verificarSolicitudesPendientes(): void {
    const clienteParam = (this.usuarioSD.esAdmin) ? this.usuarioSD.cliente?.cliente : this.usuarioSD.agente?.rAgenteCte.cliente;
    const agenteParam = (this.usuarioSD.esAdmin) ? '' : this.usuarioSD.agente?.rAgenteCte.agente;

    this.http.get<Array<Subdistribuidor>>(this.globalService.urlAPI + `Subdistribuidor/SubdistribuidorClienteAgenteEstatus?Cliente=${clienteParam}&Agente=${agenteParam}&Estatus=PENDIENTE`, { 
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuarioSD.token
      })
    }).subscribe({
      next: data => {
        if (data.length > 0) {
          this.solicitudOC.encabezado = data[0];
          this.solicitudOC.detalle = data[0].rSubdistribuidorD;
          this.totalCarritoPendiente = this.solicitudOC.detalle.length;
          if (this.solicitudOC.detalle.length > 0) {
            if (typeof this.solicitudOC.detalle[0].linea === 'string') {
              this.lineaSolicitud = this.solicitudOC.detalle[0].linea;
            }

            if (this.lineaSolicitud === 'STOCK') {
              this.verificarExistenciasDetalleSolicitud();
            }
          }
        } else {
          this.valoresPorDefectoOrdenSolicitud();
        }
      },
      error: err => {
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al consultar la ultima orden pendiente'}
        })
      }
    })
  }

  agregarDetalleSolicitud(art: Articulo, almacen?: SaldoU): void {

    let detalleSolicitud: SubdistribuidorD = {
      articulo: art.articulo, 
      unidad: art.unidad, 
      precio: art.precioLista, 
      descripcion: art.descripcion1,
      cantidad: 1,
      descuento: 0,
      porcentajeDescuento: 0,
      pendiente: 1,
      renglon: 0,
      linea: art.linea
    };

    const detalleExistente = this.solicitudOC.detalle.find(det => det.articulo === detalleSolicitud.articulo);
    if(detalleExistente === undefined) {

      if (this.solicitudOC.detalle.length === 0) {
        detalleSolicitud.renglon = this.solicitudOC.detalle.length + 1;
      } else {
        detalleSolicitud.renglon = this.solicitudOC.detalle[this.solicitudOC.detalle.length - 1].renglon + 1;
      }


      if (detalleSolicitud.linea === 'SOBREPEDIDO') {
        detalleSolicitud.almacen = this.solicitudOC.encabezado.almacen;
      } else {
        if (typeof almacen === 'undefined') {
          for (let i = 0; i < art.rSaldoU.length; i++) {
            const disponibleAlmacen = art.rSaldoU[i];
            if (disponibleAlmacen.grupo === this.solicitudOC.encabezado.almacen) {
              detalleSolicitud.almacen = disponibleAlmacen.grupo;
              detalleSolicitud.disponible = disponibleAlmacen.saldoUU;
              break;
            } else {
              detalleSolicitud.almacen = disponibleAlmacen.grupo;
              detalleSolicitud.disponible = disponibleAlmacen.saldoUU;
              break;
            }
          }
        } else {
          detalleSolicitud.almacen = almacen.grupo;
          detalleSolicitud.disponible = almacen.saldoUU;
        }
      }
      
      detalleSolicitud.impuesto = ((detalleSolicitud.precio * 0.16) * detalleSolicitud.cantidad);

      let detalleLista: Array<SubdistribuidorD> = [];
      detalleLista.push(detalleSolicitud);

      if (this.solicitudOC.encabezado.id === undefined && this.solicitudOC.detalle.length === 0) {
        this.solicitudOC.encabezado.importe = detalleSolicitud.precio;
        this.solicitudOC.encabezado.impuestos = detalleSolicitud.impuesto;
        this.http.post<Subdistribuidor>(this.globalService.urlAPI + 'Subdistribuidor', {encabezado: this.solicitudOC.encabezado, detalle: detalleLista}, { 
          headers: new HttpHeaders({
            Authorization: 'Bearer ' + this.usuarioSD.token
          })
        }).subscribe({
          next: response => {
            if (response !== null) {
              this.solicitudOC.encabezado = response;
              detalleSolicitud.id = this.solicitudOC.encabezado.id;
              this.totalCarritoPendiente = this.solicitudOC.detalle.push(detalleSolicitud);
              if (typeof detalleSolicitud.linea === 'string') {
                this.lineaSolicitud =   detalleSolicitud.linea;
              }
              this.messageService.success(`Se ha agregado el articulo ${detalleSolicitud.articulo} a la solicitud`, {nzDuration: 2000});
              this.actualizarEncabezadoOrdenSolicitud();
            } else {
              this.dialog.open(DialogView, {
                width: '300px',
                data: {titulo: 'Error', mensaje: 'Ocurrio un error al agregar el articulo'}
              })
            }
          },
          error: err => {
            this.dialog.open(DialogView, {
              width: '300px',
              data: {titulo: 'Error', mensaje: 'Ocurrio un error al agregar el articulo'}
            })
          }
        })
      } else {
        detalleSolicitud.id = this.solicitudOC.encabezado.id;
        this.http.post<number>(this.globalService.urlAPI + 'SubdistribuidorD', detalleSolicitud, { 
          headers: new HttpHeaders(
          {
            Authorization: 'Bearer ' + this.usuarioSD.token
          })
        }).subscribe({
          next: resp => {
            if (resp === -1) {
              this.totalCarritoPendiente = this.solicitudOC.detalle.push(detalleSolicitud);
              if (this.solicitudOC.detalle.length === 1) {
                if (typeof detalleSolicitud.linea === 'string') {
                  this.lineaSolicitud = detalleSolicitud.linea;
                }
              }
              this.messageService.success(`Se ha agregado el articulo ${detalleSolicitud.articulo} a la ${(this.usuarioSD.esAdmin) ? 'orden' : 'solicitud' }`, {nzDuration: 2000});
              this.actualizarEncabezadoOrdenSolicitud();
            } else {
              this.dialog.open(DialogView, {
                width: '300px',
                data: {titulo: 'Error', mensaje: 'Ocurrio un error al agregar el articulo'}
              })
            }
          },
          error: err => {
            this.dialog.open(DialogView, {
              width: '300px',
              data: {titulo: 'Error', mensaje: 'Ocurrio un error al procesar la petición'}
            })
          }
        })
      }
    } else {
      this.solicitudOC.detalle.forEach((detalleArt, indice) => {
        if (detalleArt.articulo === detalleSolicitud.articulo) {
          detalleArt.cantidad += 1;
          detalleArt.pendiente = detalleArt.cantidad;
          detalleArt.almacen = (almacen !== undefined) ? almacen.grupo : detalleArt.almacen;
          detalleArt.disponible = (almacen !== undefined) ? almacen.saldoUU : detalleArt.disponible;
          detalleArt.impuesto = ((detalleArt.precio * 0.16) * detalleArt.cantidad);
          detalleSolicitud = detalleArt;
        }
      });
      this.http.put<any>(this.globalService.urlAPI + `SubdistribuidorD/${detalleSolicitud.id}/${detalleSolicitud.renglon}`, detalleSolicitud, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + this.usuarioSD.token
        })
      }).subscribe({
        next: data => {
          this.messageService.success(`Se ha agregado el articulo ${detalleSolicitud.articulo} a la solicitud`, {nzDuration: 2000});
          this.actualizarEncabezadoOrdenSolicitud();
        },
        error: err => {
          this.solicitudOC.detalle.forEach((detalleArt, indice) => {
            if (detalleArt.articulo === detalleSolicitud.articulo) {
              detalleArt.cantidad--;
              detalleArt.pendiente = detalleArt.cantidad;
            }
          });
          if (this.solicitudOC.detalle.length === 0) {
            this.lineaSolicitud = '';
          }
          this.calcularImporte();
          this.dialog.open(DialogView, {
            width: '300px',
            data: {titulo: 'Error', mensaje: 'Ocurrio un error al agregar el articulo'}
          })
        }
      })
    }
  }

  quitarDetalleSolicitud(detalle: SubdistribuidorD): void {
    this.http.delete<any>(this.globalService.urlAPI + `SubdistribuidorD/${detalle.id}/${detalle.renglon}`, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuarioSD.token
      })
    }).subscribe({
      next: data => {
        this.solicitudOC.detalle.forEach((det, indice) => {
          if(det.articulo === detalle.articulo) {
            this.solicitudOC.detalle.splice(indice, 1);
            this.totalCarritoPendiente = this.solicitudOC.detalle.length;
          }
        });
        if(this.solicitudOC.detalle.length === 0) {
          this.lineaSolicitud = '';
        }
        this.messageService.success(`Se ha quitado el articulo ${detalle.articulo}`, {nzDuration: 2000});
        this.actualizarEncabezadoOrdenSolicitud();
      },
      error: err => {
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al quitar el articulo ' + detalle.articulo}
        })
      }
    })
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

  modificarCantidadArticulo(detalle: SubdistribuidorD): void {
    let cantidadAnterior = detalle.pendiente;
    detalle.impuesto = ((detalle.precio * 0.16) * detalle.cantidad)
    detalle.pendiente = detalle.cantidad;
    this.http.put<any>(this.globalService.urlAPI + `SubdistribuidorD/${detalle.id}/${detalle.renglon}`, detalle, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuarioSD.token
      })
    }).subscribe({
      next: data => {
        this.messageService.success(`Se ha agregado el articulo ${detalle.articulo} a la ${(this.usuarioSD.esAdmin) ? 'orden' : 'solicitud' }`, {nzDuration: 2000});
        this.actualizarEncabezadoOrdenSolicitud();
      },
      error: err => {
        this.solicitudOC.detalle.forEach((det, indice) => {
          if(det.articulo === detalle.articulo) {
            det.cantidad = cantidadAnterior;
          }
        });
        this.calcularImporte();
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al modificar la cantidad del articulo ' + detalle.articulo}
        })
      }
    })
  }

  ActualizarAlmacenDetalle(indiceDet: number, detalleAnterior: SubdistribuidorD): void {
    const detalleArt = this.solicitudOC.detalle[indiceDet];
    this.http.put<any>(this.globalService.urlAPI + `SubdistribuidorD/${detalleArt.id}/${detalleArt.renglon}`, detalleArt, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuarioSD.token
      })
    }).subscribe({
      next: resp => {
        this.messageService.success(`Se ha modificado el almacén del articulo ${detalleArt.articulo}`, {nzDuration: 2000});
      },
      error: err => {
        this.solicitudOC.detalle[indiceDet].almacen = detalleAnterior.almacen;
        this.solicitudOC.detalle[indiceDet].cantidad = detalleAnterior.cantidad;
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al modificar el almacén del articulo ' +  detalleArt.articulo}
        })
      }
    });
  }

  actualizarEncabezadoOrdenSolicitud(): void {
    this.calcularImporte();
    this.http.put(this.globalService.urlAPI + `Subdistribuidor/${this.solicitudOC.encabezado.id}`, this.solicitudOC.encabezado, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuarioSD.token
      })
    }).subscribe({
      next: data => {
        console.log('se actualizo la solicitud de orden de compra con ID ' + this.solicitudOC.encabezado.id);
      },
      error: err => {
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al actualizar la solicitud de orden de compra'}
        })
      }
    })
  }

  valoresPorDefectoOrdenSolicitud(): void {
    if (this.usuarioSD.esAdmin) {

      if(this.usuarioSD.cliente?.familia === 'SD AGS' || this.usuarioSD.cliente?.familia === 'SD BAJ' || this.usuarioSD.cliente?.familia === 'SD BAJ 2' || this.usuarioSD.cliente?.familia === 'SD ZAC') {
        this.solicitudOC.encabezado.sucursal = 1001;
        if (this.usuarioSD.cliente?.familia === 'SD ZAC') {
          this.solicitudOC.encabezado.almacen = 'ZAC-100';
        } else {
          this.solicitudOC.encabezado.almacen = 'CDG-100';
        }
      }
      
      if (this.usuarioSD.cliente?.familia === 'SD GDL F' || this.usuarioSD.cliente?.familia === 'SD GDL F2') {
        this.solicitudOC.encabezado.sucursal = 2001;
        this.solicitudOC.encabezado.almacen = 'JUP-100';
      }
      
      if (this.usuarioSD.cliente?.familia === 'SD GDL M' || this.usuarioSD.cliente?.familia === 'SD GDL M2') {
        this.solicitudOC.encabezado.sucursal = 2002;
        this.solicitudOC.encabezado.almacen = 'NHE-100';
      }

    } else {
  
      if(this.usuarioSD.agente?.rAgenteCte.rCte.familia === 'SD AGS' || this.usuarioSD.agente?.rAgenteCte.rCte.familia === 'SD BAJ' || this.usuarioSD.agente?.rAgenteCte.rCte.familia === 'SD BAJ 2' || this.usuarioSD.agente?.rAgenteCte.rCte.familia === 'SD ZAC') {
        this.solicitudOC.encabezado.sucursal = 1001;
        if (this.usuarioSD.agente?.rAgenteCte.rCte.familia === 'SD ZAC') {
          this.solicitudOC.encabezado.almacen = 'ZAC-100';
        } else {
          this.solicitudOC.encabezado.almacen = 'CDG-100';
        }
      }
      
      if (this.usuarioSD.agente?.rAgenteCte.rCte.familia === 'SD GDL F' || this.usuarioSD.agente?.rAgenteCte.rCte.familia === 'SD GDL F2') {
        this.solicitudOC.encabezado.sucursal = 2001;
        this.solicitudOC.encabezado.almacen = 'JUP-100';
      }
      
      if (this.usuarioSD.agente?.rAgenteCte.rCte.familia === 'SD GDL M' || this.usuarioSD.agente?.rAgenteCte.rCte.familia === 'SD GDL M2') {
        this.solicitudOC.encabezado.sucursal = 2002;
        this.solicitudOC.encabezado.almacen = 'NHE-100';
      }
    }

    this.solicitudOC.encabezado.id = undefined;
    this.solicitudOC.encabezado.estatus = 'PENDIENTE';
    this.solicitudOC.encabezado.importe = 0;
    this.solicitudOC.encabezado.impuestos = 0;
    this.solicitudOC.encabezado.empresa = 'VHA';
    this.solicitudOC.encabezado.rSubdistribuidorD = [];
    this.solicitudOC.encabezado.cliente = (this.usuarioSD.esAdmin) ? this.usuarioSD.cliente?.cliente : this.usuarioSD.agente?.rAgenteCte.cliente;
    this.solicitudOC.encabezado.documento = 'Solicitud Orden Compra';
    this.solicitudOC.encabezado.tipoCambio = 1;
    this.solicitudOC.encabezado.fecha = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), this.fechaActual.getDate());
    this.solicitudOC.encabezado.condicion = (this.usuarioSD.esAdmin) ? this.usuarioSD.cliente?.condicion : this.usuarioSD.agente?.rAgenteCte.rCte.condicion;
    this.solicitudOC.encabezado.vencimiento = new Date();
    this.solicitudOC.encabezado.vigencia = new Date();
    this.solicitudOC.encabezado.observaciones = '';
    this.solicitudOC.encabezado.agente = (this.usuarioSD.esAdmin) ? '' : this.usuarioSD.agente?.rAgenteCte.agente;
    this.solicitudOC.detalle = [];
    this.lineaSolicitud = '';
    this.totalCarritoPendiente = 0;
  }

  afectarSolicitud(estatus: string): void {
    this.http.get<ResultadoAfectar>(this.globalService.urlAPI + `Subdistribuidor/Afectar/${this.solicitudOC.encabezado.id}/${estatus}`, {
         headers: new HttpHeaders({
          Authorization: 'Bearer ' + this.usuarioSD.token
         })
    }).subscribe({
      next: response => {
        if (response !== null) {
          if (response.ok === 1) {
            const mensajeOk = (estatus === 'REVISION') ? 'a revisión correctamente' : (estatus === 'POR AUTORIZAR') ? 'a autorización correctamente' : 'correctamente';
            this.solicitudOC.encabezado.estatus = estatus;
            this.modalService.success({
              nzTitle: `Se enviado la solicitud ${mensajeOk}`,
              nzOkText: 'Ver',
              nzCancelText: 'Continuar',
              nzOnCancel: () => {
                this.valoresPorDefectoOrdenSolicitud();
                this.router.navigate(['/home'])
              }
            })
          }
          else {
            this.dialog.open(DialogView, {
              width: '300px',
              data: {titulo: 'Error', mensaje: 'Ocurrio un error al enviar la solicitud, por favor verifique que su solicitud sea correcta'}
            })
          }
        }
      }
    })
  }


  verificarMismaLineaSolicitud(articulo?: Articulo): boolean {
    let resultado: boolean = true;
    for (let i = 0; i < this.solicitudOC.detalle.length; i++) {
      const detalle = this.solicitudOC.detalle[i];
      if(detalle.linea !== articulo?.linea) {
        resultado = false;
        break;
      }
    }
    return resultado;
  } 


  verificarExistenciasDetalleSolicitud(): void {
    let detalleArticulo: string|undefined = undefined;
    for (let i = 0; i < this.solicitudOC.detalle.length; i++) {
      const detalle = this.solicitudOC.detalle[i];
      if(typeof detalle.disponible === 'undefined') {
          detalleArticulo = detalle.articulo;
          break;
      }
    }

    if(typeof detalleArticulo === 'string') {
      this.obtenerDisponibleArticulo(detalleArticulo);
    }
  }

  obtenerDisponibleArticulo(articulo?: string) {
    const clienteParam = (this.usuarioSD.esAdmin) ? this.usuarioSD.cliente?.cliente : this.usuarioSD.agente?.rAgenteCte.cliente;
    this.http.get<Articulo>(this.globalService.urlAPI + `Articulos/ArticuloCliente?Articulo=${articulo}&Cliente=${clienteParam}`, 
      { 
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + this.usuarioSD.token
        })
      }
    ).subscribe({
      next: response => {
        this.solicitudOC.detalle.forEach((detalle, indice) => {
          if (detalle.articulo === response.articulo) {
            response.rSaldoU.forEach((disponible, indice) => {
              if (disponible.grupo === detalle.almacen) {
                detalle.disponible = disponible.saldoUU;
              }
            })
          }
        })
        this.verificarExistenciasDetalleSolicitud();
      },
      error: err => {
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al obtener la disponibilidad del articulo ' + articulo}
        })
      }
    })
  }


}
