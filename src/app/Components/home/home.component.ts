import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Articulo } from 'src/app/Models/Articulo';
import { Usuario } from 'src/app/Models/Usuario';
import { CarritoComponent } from '../carrito/carrito.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog } from '@angular/material/dialog';
import { DialogView } from '../notificacion/dialogView';
import { SolicitudService } from 'src/app/Services/solicitud.service';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  UsuarioObj: Usuario = {};
  carritoArticulos: Articulo[] = [];
  verArticulos: boolean = false;
  verCarrito: boolean = false;
  tieneCamaras: boolean = false;
  anio: string;
  camarasDisponibles: MediaDeviceInfo[] = [];
  camaraSeleccionada?: MediaDeviceInfo;

  @ViewChild(CarritoComponent) carritoChild!: CarritoComponent;

  public constructor( 
      private titleService: Title,
      private router: Router,
      private modalService: NgbModal,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private globalService: GlobalsService,
      public solicitudService: SolicitudService) 
    { 
      this.titleService.setTitle('Inicio');
      this.UsuarioObj = this.globalService.UsuarioLogueado;
      this.anio = new Date().getFullYear().toString();
    }

  ngOnInit(): void {
    
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  mostrarArticulos(): void {
    this.router.navigate(["/home"]);
  }

  abrirModalQR(contentQR: any): void {
    this.modalService.open(contentQR, {backdropClass: 'backDropModal', size: 'md', });
  }

  codigoEscaneado(url: string): void {
    this.modalService.dismissAll();
    this.router.navigate(['./articulo/' + url], {relativeTo: this.route});
  }

  permisosCamara(otorgoPermiso: boolean): void {
    if(!otorgoPermiso) {
      this.modalService.dismissAll();
      this.dialog.open(DialogView, {
        width: '400px',
        data: {titulo: 'Advertencia', mensaje: 'No perimitio el uso de la camara, por favor permita usar la camara'}
      })
    }
  }

  camarasEncotradas(camaras: MediaDeviceInfo[]): void {
    this.tieneCamaras = (camaras.length > 0) ? true : false;
    if(!this.tieneCamaras) {
      this.modalService.dismissAll();
      this.dialog.open(DialogView, {
        width: '250px',
        data: {titulo: 'Error', mensaje: 'No se encontraron camaras en este dispositivo'}
      })
    } else {
      this.camarasDisponibles = camaras;
      this.camaraSeleccionada = camaras[0];
    }
  }

  verSolicitudesAgentes(): void {
    this.router.navigate(['./solicitudes_agentes'], {relativeTo: this.route});
  }

  verMisOrdenesSolicitudes(): void {
    this.router.navigate(['./ordenes_solicitudes'], {relativeTo: this.route});
  }


}
