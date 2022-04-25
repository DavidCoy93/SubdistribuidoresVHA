import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { map, Observable, startWith } from 'rxjs';
import { Cliente } from 'src/app/Models/Cliente';
import { ClienteSolicitedes } from 'src/app/Models/ClienteSolicitedes';
import { ResultadoAfectar } from 'src/app/Models/ResultadoAfectar';
import { Subdistribuidor } from 'src/app/Models/Subdistribuidor';
import { SubdistribuidorD } from 'src/app/Models/SubdistribuidorD';
import { Usuario } from 'src/app/Models/Usuario';
import { GlobalsService } from 'src/app/Services/globals.service';
import { DialogView } from '../notificacion/dialogView';

@Component({
  selector: 'app-descuentos-solicitudes',
  templateUrl: './descuentos-solicitudes.component.html',
  styleUrls: ['./descuentos-solicitudes.component.css']
})
export class DescuentosSolicitudesComponent implements OnInit {

  clienteControl = new FormControl();
  Clientes!:  Observable<Array<Cliente>>;
  usuarioVHA: Usuario = {};
  solicitudesRevision: Array<Subdistribuidor> = [];
  clientesPorRevisar: Array<Cliente> = [];
  clienteSolicitudes: Array<ClienteSolicitedes> = [];

  constructor(
    private titleService: Title,
    private http: HttpClient,
    private globalService: GlobalsService,
    private dialog: MatDialog,
    private router: Router,
    private messageService: NzMessageService,
    private modalService: NzModalService) 
  { 
    this.titleService.setTitle('Descuentos VHA');
    this.usuarioVHA = this.globalService.UsuarioLogueado;
    this.ObtenerClientesConSolicitudesPorRevisar();
  }

  ngOnInit(): void {
    this.Clientes = this.clienteControl.valueChanges.pipe(
      startWith(''),
      map(value =>  this.filtarClientes(value))
    )
  }

  filtarClientes(textoBusqueda: string): Array<Cliente> {
    const busqueda = textoBusqueda.toLowerCase();
    return this.clientesPorRevisar.filter(cliente => cliente.cliente?.toLowerCase().includes(busqueda) || cliente.nombre?.toLowerCase().includes(busqueda))
  }

  buscarClientes(): void {
    if (typeof this.clienteControl.value === 'string') {
      if (this.clienteControl.value.length === 0) {
        this.BuscarSolicitudesClienteRevision();
      }
    }
    // if (typeof this.clienteControl.value === 'string') {
    //   if (this.clienteControl.value.length >= 3) {
    //     setTimeout(() => {
    //       this.http.get<Array<Cliente>>(this.globalService.urlAPI + `Cte/ClientesSubdistribuidores?buscar=${this.clienteControl.value}` , {
    //         headers: new HttpHeaders({
    //           Authorization: 'Bearer ' + this.usuarioVHA.token
    //         })
    //       }).subscribe({
    //         next: response => {
    //           this.Clientes = response;
    //         }, 
    //         error: err => {
    //           this.dialog.open(DialogView, {
    //             width: '300px',
    //             data: {titulo: 'Error', mensaje: 'Ocurrio un error al obtener los clientes'}
    //           })
    //         }
    //       })
    //     }, 500);
    //   }
    // }
  }

  ObtenerClientesConSolicitudesPorRevisar(): void {
    this.http.get<Array<Cliente>>(this.globalService.urlAPI + 'Cte/ClientexEstatusSD', {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuarioVHA.token
      })
    }).subscribe({
      next: response => {
        if (response !== null) {
          this.clientesPorRevisar = response;
          this.BuscarSolicitudesClienteRevision();
        } else {
          this.BuscarSolicitudesClienteRevision();
        }
      }, 
      error: err => {
        this.BuscarSolicitudesClienteRevision();
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al obtener las solicitudes del cliente ' + this.clienteControl.value}
        })
      } 
    })
  }

  BuscarSolicitudesClienteRevision(): void {
    this.http.get<Array<Subdistribuidor>>(this.globalService.urlAPI + `Subdistribuidor/SubdistribuidorClienteAgenteEstatus?Cliente=${(this.clienteControl.value === null) ? '' : this.clienteControl.value}&Estatus=POR REVISAR`, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuarioVHA.token
      })
    }).subscribe({
      next: data => {
        if (data !== null) {
          this.solicitudesRevision = data;
          this.clienteSolicitudes = [];
        
          for (let i = 0; i < this.clientesPorRevisar.length; i++) {
            const cliente = this.clientesPorRevisar[i];
            let cteSolicitud: ClienteSolicitedes = {idCliente: cliente.cliente, nombreCliente: cliente.nombre, solicitudes: []}
            if(this.clienteControl.value === null) {
              this.solicitudesRevision.forEach((solicitud, indice) => {
                if (solicitud.cliente === cliente.cliente) {
                  cteSolicitud.solicitudes.push(solicitud);
                }
              })
              this.clienteSolicitudes.push(cteSolicitud);
            }
            else if (typeof this.clienteControl.value === 'string') {
              if (this.clienteControl.value.length === 0) {
                this.solicitudesRevision.forEach((solicitud, indice) => {
                  if (solicitud.cliente === cliente.cliente) {
                    cteSolicitud.solicitudes.push(solicitud);
                  }
                })
                this.clienteSolicitudes.push(cteSolicitud);
              } else {
                if (cliente.cliente === this.clienteControl.value) {
                  this.solicitudesRevision.forEach((solicitud, indice) => {
                    if (solicitud.cliente === cliente.cliente) {
                      cteSolicitud.solicitudes.push(solicitud);
                    }
                  })
                  this.clienteSolicitudes.push(cteSolicitud);
                  break;
                }
              }
            }
          }
        } else {
          this.dialog.open(DialogView, {
            width: '300px',
            data: {titulo: 'Error', mensaje: 'Ocurrio un error al obtener las solicitudes por revisar'}
          })
        }
      }, 
      error: err => {
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al obtener las solicitudes por revisar'}
        })
      }
    })
  }

  calcularSubtotalDetalle(detalle: SubdistribuidorD): number {
    const importe = ((detalle.precio / ((detalle.impuesto/100)+1)) * detalle.cantidad);
    detalle.descuento = (importe * (detalle.porcentajeDescuento / 100));
    
    this.http.put(this.globalService.urlAPI + `SubdistribuidorD/${detalle.id}/${detalle.renglon}`, detalle, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuarioVHA.token
      })
    }).subscribe({
      next: data => {
        this.messageService.success('Se ha aplicado el descuento al articulo ' + detalle.articulo, {nzDuration: 2000});
        this.calcularDescuentoGlobal(detalle);
      },
      error: err => {
        detalle.descuento = 0;
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al aplicar el descuento al articulo ' + detalle.articulo}
        })
      }
    })
    return detalle.descuento;
  }


  calcularDescuentoGlobal(detalle: SubdistribuidorD) : void {
    let encabezadoSolicitud: Subdistribuidor = {descuentoGlobal: 0, importe: 0, impuestos: 0, rSubdistribuidorD: [], sucursalCliente: null};
    for (let i = 0; i < this.solicitudesRevision.length; i++) {
      if(this.solicitudesRevision[i].id === detalle.id) {
        this.solicitudesRevision[i].descuentoGlobal = 0;
        this.solicitudesRevision[i].impuestos = 0;
        this.solicitudesRevision[i].importe = 0;
        this.solicitudesRevision[i].rSubdistribuidorD.forEach((det, indice) => {
          this.solicitudesRevision[i].importe += (((det.precio / ((det.impuesto/100)+1)) * det.cantidad) -  det.descuento);
        });
        this.solicitudesRevision[i].impuestos = (this.solicitudesRevision[i].importe * this.globalService.impuesto); 
        encabezadoSolicitud = this.solicitudesRevision[i];
        break;
      }
    }

    this.http.put<number>(this.globalService.urlAPI + `Subdistribuidor/${encabezadoSolicitud.id}`, encabezadoSolicitud, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuarioVHA.token
      })
    }).subscribe({
      next: resp => {
        if (resp === -1) {
          console.log('Se actualizo la solicitud Id: ' + detalle.id);
        } else {
          this.dialog.open(DialogView, {
            width: '300px',
            data: {titulo: 'Error', mensaje: 'Ocurrio un error al actualizar la solicitud Id ' + detalle.id}
          })
        }
      }, 
      error: err =>  {
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al actualizar la solicitud Id ' + detalle.id}
        })
      }
    })
  }

  revisarSolicitud(solicitud: Subdistribuidor): void {
    this.modalService.confirm({
      nzTitle: '¿Esta seguro de continuar?',
      nzOkText: 'Aceptar',
      nzCancelText: 'Cancelar',
      nzOnOk: () => {
        this.http.get<ResultadoAfectar>(this.globalService.urlAPI + `Subdistribuidor/Afectar/${solicitud.id}/REVISADO`, {
          headers: new HttpHeaders({
            Authorization: 'Bearer ' + this.usuarioVHA.token
          })          
        }).subscribe({
          next: response => {
            if (response !== null) {
              if (response.ok === 1) {
                this.messageService.success('Se ha revisado correctamente la solicitud folio: ' + solicitud.folio);
                this.ObtenerClientesConSolicitudesPorRevisar();
              } else {
                this.dialog.open(DialogView, {
                  width: '300px',
                  data: {titulo: response.titulo, mensaje: response.descripcion}
                })
              }
            } else {
              this.dialog.open(DialogView, {
                width: '300px',
                data: {titulo: 'Error', mensaje: 'Ocurrio un error al revisar la solicitud con folio ' + solicitud.folio + '. Por favor contacte al area de sistemas de vitrohogar'}
              })
            }
          },
          error: err => {
            this.dialog.open(DialogView, {
              width: '300px',
              data: {titulo: 'Error', mensaje: 'Ocurrio un error al revisar la solicitud con folio ' + solicitud.folio + '. Por favor contacte al area de sistemas de vitrohogar'}
            })
          }
        })
      }
    })
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login'])
  }
}
