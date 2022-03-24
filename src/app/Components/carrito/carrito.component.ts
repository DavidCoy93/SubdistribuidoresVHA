import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Articulo } from 'src/app/Models/Articulo';
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
export class CarritoComponent implements OnInit{
  
  usuario: Usuario = {};

  constructor(
    private globalService: GlobalsService, 
    private tilteService: Title, 
    public solicitudService: SolicitudService,
    private modalService: NzModalService,
    private viewContainerRef: ViewContainerRef) 
  {
    this.tilteService.setTitle('Carrito');
    this.usuario = this.globalService.UsuarioLogueado;
  }

  ngOnInit(): void {
    window.scrollTo(0,0);
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


}
