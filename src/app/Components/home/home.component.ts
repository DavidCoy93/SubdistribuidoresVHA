import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Articulo } from 'src/app/Models/Articulo';
import { Usuario } from 'src/app/Models/Usuario';
import { CarritoComponent } from '../carrito/carrito.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog } from '@angular/material/dialog';
import { DialogView } from '../notificacion/dialogView';
import { HttpClient } from '@angular/common/http';
import { ViewsService } from 'src/app/Services/views.service';

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
      private http: HttpClient,
      private viewService: ViewsService) 
    { 
      this.titleService.setTitle('Inicio');
      // @ts-ignore
      this.UsuarioObj = JSON.parse(localStorage.getItem('usuario'));
      this.anio = new Date().getFullYear().toString();

      this.viewService.verArticulos.subscribe(mostrarArticulos => {
        this.verArticulos = mostrarArticulos;
      });

      this.viewService.verCarrito.subscribe(mostrarCarrito => {
        this.verCarrito = mostrarCarrito;
      });
    }

  ngOnInit(): void {
    
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login'])
  }

  mostrarArticulos(): void {
    this.viewService.verArticulos.next(true);
    this.viewService.verCarrito.next(false);
  }

  mostrarCarrito(): void {
    this.viewService.verArticulos.next(false);
    this.viewService.verCarrito.next(true);
  }

  agregarArticuloCarrito(art: Articulo): void {
    
    let ArticuloExistente = this.carritoArticulos.filter(articulo => articulo.Nombre === art.Nombre)[0];
    if (ArticuloExistente === null || ArticuloExistente === undefined) {
      this.carritoArticulos.push(art)
    } else {
      this.carritoArticulos.forEach((articulo, indice) => {
        if (articulo.Nombre === art.Nombre) {
          articulo.Cantidad += 1;
        }
      });
    }

    this.http.get("http://ip-api.com/json/24.48.0.1").subscribe(resp => {
      console.log(resp);
    })
  }

  quitarArticuloCarrito(art: Articulo): void {
    for (let i = 0; i < this.carritoArticulos.length; i++) {
      if(this.carritoArticulos[i].Nombre === art.Nombre) {
        this.carritoArticulos.splice(i, 1);
        break;
      }
    }
    this.carritoChild.calcularTotalCarrito();
  }

  deshacerCambiosCarrito(): void {
    this.carritoArticulos.splice(this.carritoArticulos.length -1, 1)
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
      let dialogRef = this.dialog.open(DialogView, {
        width: '400px',
        data: {titulo: 'Advertencia', mensaje: 'No perimitio el uso de la camara, por favor permita usar la camara'}
      })
    }
  }

  camarasEncotradas(camaras: MediaDeviceInfo[]): void {
    this.tieneCamaras = (camaras.length > 0) ? true : false;
    if(!this.tieneCamaras) {
      this.modalService.dismissAll();
      let dialogRef = this.dialog.open(DialogView, {
        width: '250px',
        data: {titulo: 'Error', mensaje: 'No se encontraron camaras en este dispositivo'}
      })
    } else {
      this.camarasDisponibles = camaras;
      this.camaraSeleccionada = camaras[0];
    }
  }

}
