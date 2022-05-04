import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewChecked, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CteEnviarA } from 'src/app/Models/CteEnviarA';
import { Subdistribuidor } from 'src/app/Models/Subdistribuidor';
import { SubdistribuidorD } from 'src/app/Models/SubdistribuidorD';
import { Usuario } from 'src/app/Models/Usuario';
import { GlobalsService } from 'src/app/Services/globals.service';
import { SolicitudService } from 'src/app/Services/solicitud.service';
import { ModalConfirmacionComponent } from '../modal-confirmacion/modal-confirmacion.component';
import { ModalDisponiblesAlmacenComponent } from '../modal-disponibles-almacen/modal-disponibles-almacen.component';
import { ModalSucursalesClienteComponent } from '../modal-sucursales-cliente/modal-sucursales-cliente.component';
import { DialogView } from '../notificacion/dialogView';


@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit, AfterViewChecked, OnDestroy{
  
  usuario: Usuario = {};
  titulo: string = '';
  folioOC: string|undefined = '';
  idSolicitud: string|null;

  constructor(
    private globalService: GlobalsService, 
    private tilteService: Title, 
    public solicitudService: SolicitudService,
    private modalService: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private route: ActivatedRoute,
    private http: HttpClient,
    private dialog: MatDialog) 
  {
    this.tilteService.setTitle('Carrito');
    this.usuario = this.globalService.UsuarioLogueado;
    this.idSolicitud = this.route.snapshot.paramMap.get('idSolicitud');
    if (typeof this.idSolicitud === 'string') {
      this.http.get<Subdistribuidor>(this.globalService.urlAPI + `Subdistribuidor/${this.idSolicitud}`, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + this.usuario.token
        })
      }).subscribe({
        next: data => {
          this.solicitudService.solicitudOC.encabezado = data;
          this.solicitudService.solicitudOC.detalle = data.rSubdistribuidorD;
          if (typeof this.solicitudService.solicitudOC.detalle[0].linea === 'string'){
            this.solicitudService.lineaSolicitud = this.solicitudService.solicitudOC.detalle[0].linea;
          }
        },
        error: err => {
          this.dialog.open(DialogView, {
            width: '300px',
            data: {titulo: 'Error', mensaje: 'Ocurrio un error al obtener la solicitud'}
          })
        }
      })
    } else {
      if(this.solicitudService.solicitudOC.encabezado.estatus !== 'PENDIENTE') {
        this.solicitudService.verificarSolicitudesPendientes();
      }
    } 
  }

  ngOnInit(): void {
    window.scrollTo(0,0);
  }

  ngAfterViewChecked(): void {
    this.titulo = (typeof this.solicitudService.solicitudOC.encabezado.documento === 'string') ? this.solicitudService.solicitudOC.encabezado.documento : '';
    this.folioOC = (this.solicitudService.solicitudOC.encabezado.folio === undefined) ? '' : ' folio: ' +  this.solicitudService.solicitudOC.encabezado.folio?.toString();
    this.titulo += this.folioOC;
  }


  /** 
   * Muestra la disponibilidad de un articulo en los almacenes
   * @param {SubdistribuidorD} art - Detalle del carrito
   * @param {number} indice - indice del detalle del carrito
   * @Uso
   * ```typescript
   * this.verDisponibles(detalleCarrito, 1);
   * ```
   * @returns {void}
  */
  verDisponibles(art: SubdistribuidorD, indice: number): void {
    const modal = this.modalService.create({
      nzTitle: 'Seleccione un almacén',
      nzContent: ModalDisponiblesAlmacenComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        articulo: art.articulo
      },
      nzOkText: 'Seleccionar',
      nzCancelText: 'Cerrar',
      nzMaskClosable: false,
      nzFooter: [
        {
          label: 'Seleccionar',
          type: 'primary',
          onClick: (modalInstance) => {
            modalInstance?.cerrarModal(indice);
          }
        }
      ]
    });
  }

  /** 
   * Metodo que envia la solicitud de orden de compra, para que se covierta en una orden de compra
   * @param {string} estatus - Estatus al que se va a cambiar la solicitud de orden de compra
   * @Uso
   * ```typescript
   * this.enviarOrden('POR REVISAR');
   * ```
   * @returns {void}
  */
  verModalOpcionesEnvio(estatus: string): void {
    if (this.usuario.esAdmin) {
      this.modalService.create({
        nzContent: ModalConfirmacionComponent,
        nzViewContainerRef: this.viewContainerRef,
        nzComponentParams: {
          mensaje: '¿Esta de acuerdo con los precios mostrados hasta ahora?'
        },
        nzClosable: false,
        nzFooter: [
          {
            label: 'No',
            type: 'primary',
            onClick: (modalInstancia) => {
              modalInstancia?.cerrarModal();
            }
          },
          {
            label: 'Si',
            type: 'primary',
            danger: true,
            onClick: () => {
              this.modalService.confirm({
                nzTitle: '¿Esta seguro de continuar?',
                nzClosable: false,
                nzOkText: 'Continuar',
                nzCancelText: 'Cancelar',
                nzOnOk: () => {
                  this.solicitudService.afectarSolicitud(estatus);
                }
              })
            }
          },
        ]
      })
    } else {
      this.modalService.confirm({
        nzTitle: '¿Realmente desea continuar?',
        nzOkText: 'Continuar',
        nzCancelText: 'Cancelar',
        nzOnOk: () => {
          this.solicitudService.afectarSolicitud(estatus);
        },
        nzOnCancel: () => {
          console.log('CANCELO');
        }
      })
    }
  }

  verModalEnvioADomicilio(estatus?: string): void {
    this.modalService.confirm({
      nzTitle: '¿Desea que se envie a domicilio la orden de compra?',
      nzOkText: 'Si enviar',
      nzClosable: false,
      nzCancelText: 'No',
      nzOnOk: () => {
        this.modalService.create({
          nzTitle: 'Seleccione la sucursal de destino',
          nzClosable: false,
          nzContent: ModalSucursalesClienteComponent,
          nzViewContainerRef: this.viewContainerRef,
          nzComponentParams: {
            vieneDeAutorizacion: false
          },
          nzFooter: [
            {
              label: 'Cerrar',
              type: 'primary',
              onClick: (instancia) => {
                instancia?.cerrarModal();
              }
            },
            {
              label: 'Aceptar',
              type: 'primary',
              danger: true,
              onClick: (instancia) => {
                if (this.solicitudService.solicitudOC.encabezado.sucursalCliente !== null) {
                  this.solicitudService.calcularImporte();
                  this.http.put<number>(this.globalService.urlAPI + `Subdistribuidor/${this.solicitudService.solicitudOC.encabezado.id}`, this.solicitudService.solicitudOC.encabezado, {
                    headers: new HttpHeaders({
                      Authorization: 'Bearer ' + this.usuario.token
                    })
                  }).subscribe({
                    next: response => {
                      if (response === -1) {
                        let sucursalSeleccionada: CteEnviarA = {};
                        if (typeof instancia?.sucursales !== 'undefined') {
                          for (let i = 0; i < instancia.sucursales.length; i++) {
                            const sucursal = instancia.sucursales[i];
                            if (this.solicitudService.solicitudOC.encabezado.sucursalCliente === sucursal.id) {
                              sucursalSeleccionada = sucursal;
                              break;
                            }
                          }
                          this.modalService.success({
                            nzTitle: `La orden de compra se enviara a la siguiente sucursal ${sucursalSeleccionada.nombre}-${sucursalSeleccionada.direccion} ${(sucursalSeleccionada.direccionNumero === null) ? 'S/N' : '#'} ${(sucursalSeleccionada.direccionNumero === null) ? '' : sucursalSeleccionada.direccionNumero}`,
                            nzOkText: 'Aceptar',
                            nzOnOk: () => {
                              instancia.cerrarModal();
                              if (typeof estatus === 'string') {
                                this.enviarOrdenRevision();
                              } else {
                                this.verModalOpcionesEnvio('CONCLUIDO');
                              }
                            }
                          });
                        }
                      } else {
                        instancia?.cerrarModal();
                        this.dialog.open(DialogView, {
                          width: '300px',
                          data: {titulo: 'Advertencia', mensaje: 'Ocurrio un error inesperado, Por favor contacte al area de sistemas de vitrohogar'}
                        })
                      }
                    },
                    error: err => {
                      instancia?.cerrarModal();
                      this.dialog.open(DialogView, {
                        width: '300px',
                        data: {titulo: 'Advertencia', mensaje: 'Ocurrio un error inesperado, Por favor intente nuevamente en unos minutos'}
                      })
                    }
                  })
                } else {
                  this.dialog.open(DialogView, {
                    width: '300px',
                    data: {titulo: 'Advertencia', mensaje: 'por favor seleccione una sucursal'}
                  })
                }
              }
            }
          ]
        })
      },
      nzOnCancel: () => {
        if (typeof estatus === 'string') {
          this.enviarOrdenRevision();
        } else {
          this.verModalOpcionesEnvio('CONCLUIDO');
        }
      }
    })
  }

  aceptarDescuento(): void {
    this.modalService.confirm({
      nzTitle: '¿Esta seguro de continuar?',
      nzOkText: 'Continuar',
      nzCancelText: 'Cancelar',
      nzOnOk: () => {
        this.solicitudService.afectarSolicitud('CONCLUIDO');
      }
    })
  }

  enviarOrden(): void {
    if (this.solicitudService.solicitudOC.encabezado.sucursalCliente === null && this.usuario.esAdmin) {
      this.verModalEnvioADomicilio();
    } else {
      this.verModalOpcionesEnvio((this.usuario.esAdmin) ? 'CONCLUIDO' : 'POR AUTORIZAR');
    }
  }

  enviarOrdenRevision(): void {
    this.modalService.confirm({
      nzTitle: '¿Esta seguro de enviar la solicitud a revisión?',
      nzOkText: 'Si',
      nzCancelText: 'No',
      nzOnOk: () => {
        this.solicitudService.afectarSolicitud('POR REVISAR');
      }
    })
  }

  ngOnDestroy(): void {
    if (this.solicitudService.solicitudOC.encabezado.estatus !== 'PENDIENTE') {
      this.solicitudService.verificarSolicitudesPendientes();
    }
  }
}
