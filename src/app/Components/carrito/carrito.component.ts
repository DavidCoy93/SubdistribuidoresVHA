import { AfterViewChecked, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SubdistribuidorD } from 'src/app/Models/SubdistribuidorD';
import { Usuario } from 'src/app/Models/Usuario';
import { GlobalsService } from 'src/app/Services/globals.service';
import { SolicitudService } from 'src/app/Services/solicitud.service';
import { ModalDisponiblesAlmacenComponent } from '../modal-disponibles-almacen/modal-disponibles-almacen.component';


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
    private route: ActivatedRoute) 
  {
    this.tilteService.setTitle('Carrito');
    this.usuario = this.globalService.UsuarioLogueado;
    this.idSolicitud = this.route.snapshot.paramMap.get('idSolicitud');
    if (typeof this.idSolicitud === 'string') {
      console.log('CONSUMIR METODO PARA TRAER UNA SOLICITUD POR ID');
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

  crearNuevaSolicitudOrden(): void {
    const tipoDocumento = (this.usuario.esAdmin) ? 'orden de compra': 'solicitud orden de compra';
    this.modalService.confirm({
      nzTitle: '¿Desea crear una nueva ' + tipoDocumento + '?',
      nzOkText: 'Aceptar',
      nzCancelText: 'Cancelar',
      nzOnOk: () => {
        this.solicitudService.valoresPorDefectoOrdenSolicitud();
      },
      nzOnCancel: () => {
        console.log('CANCELO');
      }
    })
  }

  enviarOrden(): void {
    this.modalService.confirm({
      nzTitle: '¿Esta seguro de continuar?',
      nzOkText: 'Continuar',
      nzCancelText:'Cancelar',
      nzOnOk: () => {
        this.solicitudService.afectarSolicitud();
      }
    })
  }

  ngOnDestroy(): void {
    if (this.solicitudService.solicitudOC.encabezado.estatus === 'ENVIADA' || this.solicitudService.solicitudOC.encabezado.estatus === 'POR AUTORIZAR') {
      this.solicitudService.valoresPorDefectoOrdenSolicitud();
    }
  }
}
