import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewChecked, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subdistribuidor } from 'src/app/Models/Subdistribuidor';
import { SubdistribuidorD } from 'src/app/Models/SubdistribuidorD';
import { Usuario } from 'src/app/Models/Usuario';
import { GlobalsService } from 'src/app/Services/globals.service';
import { SolicitudService } from 'src/app/Services/solicitud.service';
import { ModalDisponiblesAlmacenComponent } from '../modal-disponibles-almacen/modal-disponibles-almacen.component';
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

  enviarOrden(estatus: string): void {
    if (this.usuario.esAdmin) {
      this.modalService.confirm({
        nzTitle: '¿Desea que su solicitud sea revisada por personal de VitroHogar?',
        nzOkText: 'Si, Revisar',
        nzCancelText: 'No, estoy de acuerdo',
        nzOnOk: () => {
          this.solicitudService.afectarSolicitud('REVISION')
        },
        nzOnCancel: () => {
          this.modalService.confirm({
            nzTitle: '¿Esta seguro de continuar?',
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

  ngOnDestroy(): void {
    if (this.solicitudService.solicitudOC.encabezado.estatus === 'ENVIADA' || this.solicitudService.solicitudOC.encabezado.estatus === 'POR AUTORIZAR' || this.solicitudService.solicitudOC.encabezado.estatus === 'CONCLUIDO' || this.solicitudService.solicitudOC.encabezado.estatus === 'REVISION') {
      this.solicitudService.verificarSolicitudesPendientes();
    }
  }
}
