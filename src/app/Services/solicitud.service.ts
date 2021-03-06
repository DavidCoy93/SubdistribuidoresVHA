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
    encabezado: { estatus: 'PENDIENTE', importe: 0, moneda: 'Pesos', impuestos: 0, almacen: 'CDG-100', empresa: 'VHA', rSubdistribuidorD: [], descuentoGlobal: 0, sucursalCliente: null}, 
    detalle: []
  }
  public lineaSolicitud: string = '';
  public totalCarritoPendiente: number = 0;
  sucursalCliente: number = 0;
  almacenCliente: string = '';
  condicionCliente: string = '';
  tipoFormaPago: string = '';
  listaPrecios: string = ''; 

  constructor(
    private globalService: GlobalsService,
    private messageService: NzMessageService,
    private http: HttpClient,
    private dialog: MatDialog,
    private modalService: NzModalService,
    private router: Router) 
  { 
    this.usuarioSD = this.globalService.UsuarioLogueado;
    this.asignarValoresParametrosBusquedaArticulo();
    this.verificarSolicitudesPendientes();
  }


  asignarValoresParametrosBusquedaArticulo(): void {
    if (this.usuarioSD.esAdmin) {

      if (typeof this.usuarioSD.cliente?.condicion === 'string') {
        this.condicionCliente = this.usuarioSD.cliente?.condicion;
        
        this.tipoFormaPago = (this.usuarioSD.cliente.condicion !== 'CONTADO') ? 'Credito' : 'Contado';
      }

      if (this.usuarioSD.cliente?.listaPreciosESP !== null)  {
        if (typeof this.usuarioSD.cliente?.listaPreciosESP === 'string') {
          this.listaPrecios = this.usuarioSD.cliente?.listaPreciosESP;
        }
      } else {
        this.listaPrecios = '(Precio Lista)';
      }

      if(this.usuarioSD.cliente?.familia === 'SD AGS' || this.usuarioSD.cliente?.familia === 'SD BAJ' || this.usuarioSD.cliente?.familia === 'SD BAJ 2' || this.usuarioSD.cliente?.familia === 'SD ZAC') {
        this.sucursalCliente = 1001;
        if (this.usuarioSD.cliente?.familia === 'SD ZAC') {
          this.almacenCliente = 'ZAC-100';
        } else {
          this.almacenCliente = 'CDG-100';
        }
      }
      
      if (this.usuarioSD.cliente?.familia === 'SD GDL F' || this.usuarioSD.cliente?.familia === 'SD GDL F2') {
        this.sucursalCliente = 2001;
        this.almacenCliente = 'JUP-100';
      }
      
      if (this.usuarioSD.cliente?.familia === 'SD GDL M' || this.usuarioSD.cliente?.familia === 'SD GDL M2') {
        this.sucursalCliente = 2002;
        this.almacenCliente = 'NHE-100';
      }

    } else {

      if (typeof this.usuarioSD.agente?.rAgenteCte.rCte.condicion === 'string') {
        this.condicionCliente = this.usuarioSD.agente?.rAgenteCte.rCte.condicion;
        
        this.tipoFormaPago = (this.usuarioSD.agente?.rAgenteCte.rCte.condicion !== 'CONTADO') ? 'Credito' : 'Contado';
      }

      if (this.usuarioSD.agente?.rAgenteCte.rCte.listaPreciosESP !== null)  {
        if (typeof this.usuarioSD.agente?.rAgenteCte.rCte.listaPreciosESP === 'string') {
          this.listaPrecios = this.usuarioSD.agente?.rAgenteCte.rCte.listaPreciosESP;
        }
      } else {
        this.listaPrecios = '(Precio Lista)';
      }
  
      if(this.usuarioSD.agente?.rAgenteCte.rCte.familia === 'SD AGS' || this.usuarioSD.agente?.rAgenteCte.rCte.familia === 'SD BAJ' || this.usuarioSD.agente?.rAgenteCte.rCte.familia === 'SD BAJ 2' || this.usuarioSD.agente?.rAgenteCte.rCte.familia === 'SD ZAC') {
        this.sucursalCliente = 1001;
        if (this.usuarioSD.agente?.rAgenteCte.rCte.familia === 'SD ZAC') {
          this.almacenCliente = 'ZAC-100';
        } else {
          this.almacenCliente = 'CDG-100';
        }
      }
      
      if (this.usuarioSD.agente?.rAgenteCte.rCte.familia === 'SD GDL F' || this.usuarioSD.agente?.rAgenteCte.rCte.familia === 'SD GDL F2') {
        this.sucursalCliente = 2001;
        this.almacenCliente = 'JUP-100';
      }
      
      if (this.usuarioSD.agente?.rAgenteCte.rCte.familia === 'SD GDL M' || this.usuarioSD.agente?.rAgenteCte.rCte.familia === 'SD GDL M2') {
        this.sucursalCliente = 2002;
        this.almacenCliente = 'NHE-100';
      }
    }
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
        if (err.status === 401) {
          localStorage.removeItem('usuario');
          this.router.navigate(['/login']);
        } else {
          this.dialog.open(DialogView, {
            width: '300px',
            data: {titulo: 'Error', mensaje: 'Ocurrio un error al consultar la ultima orden pendiente'}
          })
        }
        
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
      linea: art.linea,
      impuesto: art.impuesto1
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
        if (typeof this.solicitudOC.encabezado.almacen === 'string') {
          switch (this.solicitudOC.encabezado.almacen) {
            case 'CDG-100':
              detalleSolicitud.almacen = 'CDG-201';
              break;
            case 'ZAC-100': 
              detalleSolicitud.almacen = 'ZAC-201';
              break;
            case 'JUP-100':
              detalleSolicitud.almacen = 'JUP-201';
              break;
            case 'NHE-100': 
              detalleSolicitud.almacen = 'NHE-201';
              break;  
            default:
              break;
          }
        }
      } else {
        if (typeof almacen === 'undefined') {
          let encontroAlmacenPorDefecto: boolean = false;
          art.rSaldoU.forEach((almacen, indice) => {
            if (almacen.grupo === this.solicitudOC.encabezado.almacen) {
              encontroAlmacenPorDefecto = true;
            }
          })

          if (encontroAlmacenPorDefecto) {
            for (let i = 0; i < art.rSaldoU.length; i++) {
              const disponibleAlmacen = art.rSaldoU[i];
              if (disponibleAlmacen.grupo === this.solicitudOC.encabezado.almacen) {
                detalleSolicitud.almacen = disponibleAlmacen.grupo;
                detalleSolicitud.disponible = disponibleAlmacen.saldoUU;
                break;
              } 
            }
          } else {
            if (art.rSaldoU.length === 1) {
              detalleSolicitud.almacen = art.rSaldoU[0].grupo;
              detalleSolicitud.disponible = art.rSaldoU[0].saldoUU;
            } else {
              for (let j = 0; j < art.rSaldoU.length; j++) {
                const almacen = art.rSaldoU[j];
                if (almacen.grupo !== 'CDG-100') {
                  detalleSolicitud.almacen = almacen.grupo;
                  detalleSolicitud.disponible = almacen.saldoUU;
                  break;
                } else {
                  detalleSolicitud.almacen = almacen.grupo;
                  detalleSolicitud.disponible = almacen.saldoUU;
                }
              }
            }
            
          }
        } else {
          detalleSolicitud.almacen = almacen.grupo;
          detalleSolicitud.disponible = almacen.saldoUU;
        }
      }
      
      let detalleLista: Array<SubdistribuidorD> = [];
      detalleLista.push(detalleSolicitud);

      if (this.solicitudOC.encabezado.id === undefined && this.solicitudOC.detalle.length === 0) {
        this.solicitudOC.encabezado.importe = ((detalleSolicitud.precio / ((detalleSolicitud.impuesto/100)+1)) * detalleSolicitud.cantidad);
        this.solicitudOC.encabezado.impuestos = (this.solicitudOC.encabezado.importe * this.globalService.impuesto);
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
              data: {titulo: 'Error', mensaje: 'Ocurrio un error al procesar la petici??n'}
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
        this.solicitudOC.encabezado.importe += ((det.precio / ((det.impuesto/100) + 1)) * det.cantidad);
      });
    }
    this.solicitudOC.encabezado.impuestos = (this.solicitudOC.encabezado.importe * this.globalService.impuesto);
  }

  modificarCantidadArticulo(detalle: SubdistribuidorD): void {
    let cantidadAnterior = detalle.pendiente;
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
            det.pendiente = det.cantidad;
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
        this.messageService.success(`Se ha modificado el almac??n del articulo ${detalleArt.articulo}`, {nzDuration: 2000});
      },
      error: err => {
        this.solicitudOC.detalle[indiceDet].almacen = detalleAnterior.almacen;
        this.solicitudOC.detalle[indiceDet].cantidad = detalleAnterior.cantidad;
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al modificar el almac??n del articulo ' +  detalleArt.articulo}
        })
      }
    });
  }

  actualizarEncabezadoOrdenSolicitud(propiedadActualizada?: string): void {
    this.calcularImporte();
    this.http.put<number>(this.globalService.urlAPI + `Subdistribuidor/${this.solicitudOC.encabezado.id}`, this.solicitudOC.encabezado, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuarioSD.token
      })
    }).subscribe({
      next: data => {
        if (data === -1) {
          if (typeof propiedadActualizada === 'string') {
            if (propiedadActualizada === 'Observaciones') {
              this.messageService.success('Se han guardado las observaciones', {nzDuration: 2000})
            }
          } else {
            console.log('se actualizo la solicitud de orden de compra con ID ' + this.solicitudOC.encabezado.id);
          }
        } else {
          this.dialog.open(DialogView, {
            width: '300px',
            data: {titulo: 'Error', mensaje: 'Ocurrio un error al actualizar la solicitud de orden de compra'}
          })
        }
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
    this.solicitudOC.encabezado.sucursalCliente = null;
    this.solicitudOC.encabezado.pedidoID = undefined;
    this.solicitudOC.encabezado.pedidoMov = undefined;
    this.solicitudOC.encabezado.pedidoMovID = undefined;
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
            this.totalCarritoPendiente = 0;
            const mensajeOk = (estatus === 'POR REVISAR') ? 'a revisi??n correctamente' : (estatus === 'POR AUTORIZAR') ? 'a autorizaci??n correctamente' : 'correctamente';
            this.solicitudOC.encabezado.estatus = estatus;
            this.modalService.success({
              nzTitle: `Se enviado la solicitud ${mensajeOk}`,
              nzOkText: 'Ver',
              nzCancelText: 'Continuar',
              nzOnOk: () => {
                if (response.resultado !== null) {
                  //@ts-ignore
                  this.solicitudOC.encabezado = response.resultado;
                  //@ts-ignore
                  this.solicitudOC.detalle = response.resultado?.rSubdistribuidorD;
                }
                this.modalService.closeAll();
              },
              nzOnCancel: () => {
                this.modalService.closeAll();
                this.valoresPorDefectoOrdenSolicitud();
                this.router.navigate(['/home'])
              }
            })
          }
          else {
            this.dialog.open(DialogView, {
              width: '300px',
              data: {titulo: response.titulo, mensaje: response.descripcion}
            })
          }
        } else {
          this.modalService.closeAll();
          this.dialog.open(DialogView, {
            width: '300px',
            data: {titulo: 'Error', mensaje: 'Ocurrio un error al enviar la solicitud, por favor contacte al area de sistemas de vitrohogar'}
          })
        }
      },
      error: err => {
        this.modalService.closeAll();
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al enviar la solicitud, por favor contacte al area de sistemas de vitrohogar'}
        })
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
    this.http.get<Articulo>(this.globalService.urlAPI + `Articulos/ArticuloCliente?Articulo=${articulo}&Sucursal=${this.sucursalCliente}&Almacen=${this.almacenCliente}&Cliente=${clienteParam}&Condicion=${this.condicionCliente}&TipoFormaPago=${this.tipoFormaPago}&ListaPrecios=${this.listaPrecios}`, 
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
