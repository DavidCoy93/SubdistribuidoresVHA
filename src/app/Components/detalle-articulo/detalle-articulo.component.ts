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
import { NzModalService } from 'ng-zorro-antd/modal';


@Component({
  selector: 'app-detalle-articulo',
  templateUrl: './detalle-articulo.component.html',
  styleUrls: ['./detalle-articulo.component.css']
})
export class DetalleArticuloComponent implements OnInit {

  idArticulo: string|null;
  usuario: Usuario = {};
  articulo: Articulo = {articulo: '', descripcion1: '', precioLista: 0, Cantidad: 1, rSaldoU: [], imagenBase64: [], linea: ''};
  almacenSeleccionado?: SaldoU = undefined;
  imagenNoDisponible = 'assets/img/Imagen no disponible_B.jpg'

  @ViewChild('tbodyDetalle') detalleBody!: ElementRef;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private globalService: GlobalsService,
    private http: HttpClient,
    private dialog: MatDialog,
    private titleService: Title,
    private solicitudService: SolicitudService,
    private modalService: NzModalService) 
  { 
    this.idArticulo = this.route.snapshot.paramMap.get('id');
    const tituloTab = (typeof this.idArticulo === 'string') ? this.idArticulo : '';
    this.titleService.setTitle(tituloTab);

    this.usuario = globalService.UsuarioLogueado;
    let parametroCliente = (this.usuario.esAdmin) ? this.usuario.cliente?.cliente : this.usuario.agente?.rAgenteCte.cliente; 

    this.http.get<Articulo>(this.globalService.urlAPI + `Articulos/ArticuloCliente?Articulo=${this.idArticulo}&Cliente=${parametroCliente}`, 
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
      if (this.solicitudService.verificarMismaLineaSolicitud(this.articulo)) {
        this.solicitudService.agregarDetalleSolicitud(this.articulo, this.almacenSeleccionado);
      } else {
        this.dialog.open(DialogView, {
          width: '450px',
          data: {titulo: 'Error', mensaje: 'No se pueden combinar articulos de stock con articulos de sobrepedido y viceversa, LINEA ACTUAL: ' + this.solicitudService.lineaSolicitud}
        })
      }
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
