import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ArtFam } from 'src/app/Models/ArtFam';
import { Articulo } from 'src/app/Models/Articulo';
import { Usuario } from 'src/app/Models/Usuario';
import { GlobalsService } from 'src/app/Services/globals.service';
import { SolicitudService } from 'src/app/Services/solicitud.service';

@Component({
  selector: 'app-articulos',
  templateUrl: './articulos.component.html',
  styleUrls: ['./articulos.component.css']
})
export class ArticulosComponent {

  listaArticulos: Articulo[] = [];
  familias: ArtFam[] = [];
  textoBusqueda: string = '';
  urlImages: string = '';
  ignorarLosPrimeros: number = 0;
  tamanoPagina: number = 5;
  usuario: Usuario = {}
  familiaSeleccionada: string = 'TODAS';

  ParametrosBusqueda = new FormData();


  constructor(
    //private _snackBar: MatSnackBar, 
    private _globalService: GlobalsService, 
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private solicitudService: SolicitudService,
    private titleService: Title) {

    titleService.setTitle('Inicio');
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
      },
      error: err => {
        alert("Ocurrio un error al obtener las familias");
      }
    });

    this.ParametrosBusqueda.append("IgnorarPrimeros", this.ignorarLosPrimeros.toString());
    this.ParametrosBusqueda.append("CantidadFilas", this.tamanoPagina.toString());
    this.ParametrosBusqueda.append("Busqueda", this.textoBusqueda);
    this.ParametrosBusqueda.append("Familia", "TODAS");
    this.ParametrosBusqueda.append("Cliente", "");

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
        alert("Ocurrio un error al obtener los articulos");
      }
    });
  }

  // MostrarSnackBar(mensaje: string, articulo: Articulo): void {
  //   let snackBarRef = this._snackBar.open(mensaje, 'Deshacer', { duration: 5000 });
  //   this.agregar.emit(articulo);
  //   snackBarRef.onAction().subscribe(() => {
  //     this.deshacer.emit();
  //   })
  // }

  buscarArticulos(): void {
    this.ParametrosBusqueda.set("IgnorarPrimeros", this.ignorarLosPrimeros.toString());
    this.ParametrosBusqueda.set("CantidadFilas", this.tamanoPagina.toString());
    this.ParametrosBusqueda.set("Busqueda", this.textoBusqueda);
    this.ParametrosBusqueda.set("Familia", this.familiaSeleccionada);
    this.ParametrosBusqueda.set("Cliente", "");

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
        alert("Ocurrio un error al obtener los articulos");
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


  seleccionarArticulo(fam: string): void {
    this.buscarArticulos();
  }

  agregarArticulo(articulo: Articulo) {
    this.solicitudService.agregarDetalleSolicitud(articulo);
  }
}
