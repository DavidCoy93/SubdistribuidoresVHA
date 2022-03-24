import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Articulo } from 'src/app/Models/Articulo';
import { GlobalsService } from 'src/app/Services/globals.service';
import { Usuario } from 'src/app/Models/Usuario';
import { MatDialog } from '@angular/material/dialog';
import { DialogView } from '../notificacion/dialogView';
import { Title } from '@angular/platform-browser';
import { SolicitudService } from 'src/app/Services/solicitud.service';
import { SaldoU } from 'src/app/Models/SaldoU';


@Component({
  selector: 'app-detalle-articulo',
  templateUrl: './detalle-articulo.component.html',
  styleUrls: ['./detalle-articulo.component.css']
})
export class DetalleArticuloComponent implements OnInit {

  idArticulo: string|null;
  usuario: Usuario = {};
  articulo: Articulo = {articulo: '', descripcion1: '', precioLista: 0, Cantidad: 1, rSaldoU: []};
  urlImagen: string = '\\\\192.168.1.230\\Img-Intelisis$\\IMAGENES_MODULO_DE_VENTAS\\';
  imagenesArticulo: string[] = [];
  almacenSeleccionado?: SaldoU = undefined;

  @ViewChild('tbodyDetalle') detalleBody!: ElementRef;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private globalService: GlobalsService,
    private http: HttpClient,
    private dialog: MatDialog,
    private titleService: Title,
    private solicitudService: SolicitudService) 
  { 
    this.idArticulo = this.route.snapshot.paramMap.get('id');
    //@ts-ignore
    this.titleService.setTitle(this.idArticulo);

    this.usuario = globalService.UsuarioLogueado;

    this.http.get<Articulo>(this.globalService.urlAPI + `Articulos/ArticuloCliente?Articulo=${this.idArticulo}&Cliente=${this.usuario.cliente?.cliente}`, 
      { 
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + this.usuario.token
        })
      }
    ).subscribe({
      next: data => {

        if(data === null || data === undefined) {
          this.dialog.open(DialogView, {
            width: '250px',
            data: {titulo: 'Error', mensaje: 'El articulo ' + this.idArticulo + ' no existe'}
          });
          router.navigate(['..']);
        } else {
          this.articulo = data;
          this.urlImagen += this.articulo.articulo;
          // const Imagen1 = this.globalService.urlImages + this.articulo.articulo + '_01.jpg'
          // const Imagen2 = this.globalService.urlImages + this.articulo.articulo + '_02.jpg'
          // this.imagenesArticulo.push(Imagen1, Imagen2);
        }
      },
      error: err =>{
        this.dialog.open(DialogView, {
          width: '250px',
          data: {titulo: 'Error', mensaje: 'No se pudo obtener la información del articulo ' + this.idArticulo}
        });
        router.navigate(['..']);
      }
    });    
  }

  public ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    window.scrollTo(0,0);
  }

  agregarArticulo(): void {
    if(this.almacenSeleccionado === undefined) {
      this.dialog.open(DialogView, {
        width: '300px',
        data: {titulo: 'Alerta', mensaje: 'Por favor seleccione un almacén de la tabla'}
      })
    } else {
      this.solicitudService.agregarDetalleSolicitud(this.articulo, this.almacenSeleccionado);
    }
    
  }

  seleccionarAlmacen(indice: number, almacen: SaldoU): void { 
    for (let i = 0; i < this.detalleBody.nativeElement.rows.length; i++) {
      this.detalleBody.nativeElement.rows[i].classList.remove('almacenSeleccionado');
    }
    this.detalleBody.nativeElement.rows[indice].classList.add('almacenSeleccionado');
    this.almacenSeleccionado = almacen;
  }

}
