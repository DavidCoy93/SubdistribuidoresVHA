import { Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
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
  imgNoDisponible = 'assets/img/Imagen no disponible_B.jpg';


  constructor(
    //private _snackBar: MatSnackBar, 
    public _globalService: GlobalsService, 
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private solicitudService: SolicitudService,
    private titleService: Title,
    private modalService: NzModalService) {

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
      },
      error: err => {
        alert("Ocurrio un error al obtener las familias");
      }
    });

    this.ParametrosBusqueda.append("IgnorarPrimeros", this.ignorarLosPrimeros.toString());
    this.ParametrosBusqueda.append("CantidadFilas", this.tamanoPagina.toString());
    this.ParametrosBusqueda.append("Busqueda", "");
    this.ParametrosBusqueda.append("Familia", this._globalService.familiaArticulo);
    //@ts-ignore
    this.ParametrosBusqueda.append("Cliente", this.usuario.cliente?.cliente);

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

  buscarArticulos(): void {
    this.ParametrosBusqueda.set("IgnorarPrimeros", this.ignorarLosPrimeros.toString());
    this.ParametrosBusqueda.set("CantidadFilas", this.tamanoPagina.toString());
    this.ParametrosBusqueda.set("Busqueda", this.textoBusqueda);
    this.ParametrosBusqueda.set("Familia", this.familiaSeleccionada);
    //@ts-ignore
    this.ParametrosBusqueda.set("Cliente", this.usuario.cliente?.cliente);

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

  seleccionarFamilia(fam: string): void {
    this._globalService.familiaArticulo = this.familiaSeleccionada;
    this.buscarArticulos();
  }

  agregarArticulo(articulo: Articulo): void {
    if(this.solicitudService.solicitudOC.encabezado.estatus === 'ENVIADA' || this.solicitudService.solicitudOC.encabezado.estatus === 'POR AUTORIZAR') {
      const tipoMovimiento = (this.usuario.esAdmin) ? 'orden de compra' : 'solicitud de orden de compra';
      this.modalService.confirm({
        nzTitle: `¿Desea crear una nueva ${tipoMovimiento}?`,
        nzOkText: 'Aceptar',
        nzCancelText: 'Cancelar',
        nzOnOk: () => {
          this.solicitudService.valoresPorDefectoOrdenSolicitud();
          this.solicitudService.agregarDetalleSolicitud(articulo);
        },
        nzOnCancel: () => {
          console.log('CANCELO');
        }
      });
    } else {
      this.solicitudService.agregarDetalleSolicitud(articulo);
    }
  }
}
