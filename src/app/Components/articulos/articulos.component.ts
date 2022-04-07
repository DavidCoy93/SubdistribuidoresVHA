import { Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ArtFam } from 'src/app/Models/ArtFam';
import { Articulo } from 'src/app/Models/Articulo';
import { ArtLinea } from 'src/app/Models/ArtLinea';
import { Usuario } from 'src/app/Models/Usuario';
import { GlobalsService } from 'src/app/Services/globals.service';
import { SolicitudService } from 'src/app/Services/solicitud.service';
import { DialogView } from '../notificacion/dialogView';

@Component({
  selector: 'app-articulos',
  templateUrl: './articulos.component.html',
  styleUrls: ['./articulos.component.css']
})
export class ArticulosComponent {

  listaArticulos: Articulo[] = [];
  familias:  Array<ArtFam> = [];
  articuloLineas: Array<ArtLinea> = [];
  textoBusqueda: string = '';
  urlImages: string = '';
  ignorarLosPrimeros: number = 0;
  tamanoPagina: number = 5;
  usuario: Usuario = {}
  familiaSeleccionada: string = 'TODAS';
  ParametrosBusqueda = new FormData();
  lineaSeleccionada: string = 'TODAS'; 
  imgNoDisponible = 'assets/img/Imagen no disponible_B.jpg';


  constructor(
    //private _snackBar: MatSnackBar, 
    public _globalService: GlobalsService, 
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private solicitudService: SolicitudService,
    private titleService: Title,
    private dialog: MatDialog) {

    this.titleService.setTitle('Inicio');
    this.usuario = this._globalService.UsuarioLogueado;

    this.http.get<ArtFam[]>(this._globalService.urlAPI + 'ArtsFams', 
      { 
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + this.usuario.token
        })
      }
    ).subscribe({
      next: data => {
        this.familias = data;
        this.familias.unshift({
          clave: '-1',
          familia: 'TODAS',
          familiaMaestra: '',
          icono: 0,
          precios: false,
          rClaveProdServ: undefined
        })
        this.familiaSeleccionada = this._globalService.familiaArticulo;
        this.ObtenerLineasArticulo();
      },
      error: err => {
        this.dialog.open(DialogView, {
          width: '400px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al obtener las familias'}
        })
      }
    });
  }


  ObtenerLineasArticulo(): void {
    this.http.get<Array<ArtLinea>>(this._globalService.urlAPI + 'Articulos/LineaArticulos', {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuario.token
      })
    }).subscribe({
      next: data => {
        this.articuloLineas = data;
        this.articuloLineas.unshift({
          linea: 'TODAS',
          lineaMaestra: null,
          clave: null,
          icono: null
        });
        this.lineaSeleccionada = this._globalService.lineaArticulo;
        this.buscarArticulos();
      }
    })
  }

  buscarArticulos(): void {

    const clienteParam = (this.usuario.esAdmin) ? this.usuario.cliente?.cliente : this.usuario.agente?.rAgenteCte.cliente;

    this.ParametrosBusqueda.set("IgnorarPrimeros", this.ignorarLosPrimeros.toString());
    this.ParametrosBusqueda.set("CantidadFilas", this.tamanoPagina.toString());
    this.ParametrosBusqueda.set("Busqueda", this.textoBusqueda);
    this.ParametrosBusqueda.set("Familia", this.familiaSeleccionada);
    this.ParametrosBusqueda.set("Linea", this.lineaSeleccionada);
    //@ts-ignore
    this.ParametrosBusqueda.set("Cliente", clienteParam);

    this.http.post<Articulo[]>(this._globalService.urlAPI + 'Articulos/ArticulosPorBusquedaFiltrosPaginacion', this.ParametrosBusqueda, 
      { 
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + this.usuario.token
        })
      }
    ).subscribe({
      next: data => {
        this.listaArticulos = data;
        this.listaArticulos.forEach((art, indice) => {
          art.Cantidad = 1;
        })
      },
      error: err => {
        this.dialog.open(DialogView, {
          width: '400px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al obtener los articulos'}
        })
      }
    });
  } 

  verDetalleArticulo(articulo: string): void {
    this.router.navigate([`../articulo/${articulo}`], {relativeTo: this.route});
  }

  cambiarPagina(paginado: PageEvent): void {
    this.tamanoPagina = paginado.pageSize;
    this.ignorarLosPrimeros = (((paginado.pageIndex + 1) * paginado.pageSize) === this.tamanoPagina) ? 0 : (((paginado.pageIndex + 1) * paginado.pageSize) - this.tamanoPagina);
    this.buscarArticulos();
  }

  seleccionarFamilia(fam: string): void {
    this._globalService.familiaArticulo = this.familiaSeleccionada;
    this.buscarArticulos();
  }

  agregarArticulo(articulo: Articulo): void {
    if (this.solicitudService.verificarMismaLineaSolicitud(articulo)) {
      this.solicitudService.agregarDetalleSolicitud(articulo);
    } else {
      this.dialog.open(DialogView, {
        width: '450px',
        data: {titulo: 'Error', mensaje: 'No se pueden combinar articulos de stock con articulos de sobrepedido y viceversa, LINEA ACTUAL: ' + this.solicitudService.lineaSolicitud}
      })
    }
  }

  seleccionarLinea(linea: string): void {
    this._globalService.lineaArticulo = this.lineaSeleccionada;
    this.buscarArticulos();
  }

}
