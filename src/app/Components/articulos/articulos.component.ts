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
import { ArtsRequest } from 'src/app/Models/ArtsRequest';
import { ResultadoError } from 'src/app/Models/ResultadoError';
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

  listaArticulos: Array<Articulo> = [];
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
  totalPaginado: number = 0;
  paginaIndice: number = 0;
  almacen: string = '';
  sucursal: number = 0;
  condicion: string = '';
  tipoFormaPago: string = '';
  listaPrecios: string = '';


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

    if (this.usuario.esAdmin) {

      if (typeof this.usuario.cliente?.condicion === 'string') {
        this.condicion = this.usuario.cliente?.condicion;
        
        this.tipoFormaPago = (this.usuario.cliente.condicion !== 'CONTADO') ? 'Credito' : 'Contado';
      }

      
      if (this.usuario.cliente?.listaPreciosESP !== null)  {
        if (typeof this.usuario.cliente?.listaPreciosESP === 'string') {
          this.listaPrecios = this.usuario.cliente?.listaPreciosESP;
        }
      } else {
        this.listaPrecios = '(Precio Lista)';
      }
        

      if(this.usuario.cliente?.familia === 'SD AGS' || this.usuario.cliente?.familia === 'SD BAJ' || this.usuario.cliente?.familia === 'SD BAJ 2' || this.usuario.cliente?.familia === 'SD ZAC') {
        this.sucursal = 1001;
        if (this.usuario.cliente?.familia === 'SD ZAC') {
          this.almacen = 'ZAC-100';
        } else {
          this.almacen = 'CDG-100';
        }
      }
      
      if (this.usuario.cliente?.familia === 'SD GDL F' || this.usuario.cliente?.familia === 'SD GDL F2') {
        this.sucursal = 2001;
        this.almacen = 'JUP-100';
      }
      
      if (this.usuario.cliente?.familia === 'SD GDL M' || this.usuario.cliente?.familia === 'SD GDL M2') {
        this.sucursal = 2002;
        this.almacen = 'NHE-100';
      }

    } else {

      if (typeof this.usuario.agente?.rAgenteCte.rCte.condicion === 'string') {
        this.condicion = this.usuario.agente?.rAgenteCte.rCte.condicion;
        
        this.tipoFormaPago = (this.usuario.agente?.rAgenteCte.rCte.condicion !== 'CONTADO') ? 'Credito' : 'Contado';
      }

      if (this.usuario.agente?.rAgenteCte.rCte.listaPreciosESP !== null)  {
        if (typeof this.usuario.agente?.rAgenteCte.rCte.listaPreciosESP === 'string') {
          this.listaPrecios = this.usuario.agente?.rAgenteCte.rCte.listaPreciosESP;
        }
      } else {
        this.listaPrecios = '(Precio Lista)';
      }
  
      if(this.usuario.agente?.rAgenteCte.rCte.familia === 'SD AGS' || this.usuario.agente?.rAgenteCte.rCte.familia === 'SD BAJ' || this.usuario.agente?.rAgenteCte.rCte.familia === 'SD BAJ 2' || this.usuario.agente?.rAgenteCte.rCte.familia === 'SD ZAC') {
        this.sucursal = 1001;
        if (this.usuario.agente?.rAgenteCte.rCte.familia === 'SD ZAC') {
          this.almacen = 'ZAC-100';
        } else {
          this.almacen = 'CDG-100';
        }
      }
      
      if (this.usuario.agente?.rAgenteCte.rCte.familia === 'SD GDL F' || this.usuario.agente?.rAgenteCte.rCte.familia === 'SD GDL F2') {
        this.sucursal = 2001;
        this.almacen = 'JUP-100';
      }
      
      if (this.usuario.agente?.rAgenteCte.rCte.familia === 'SD GDL M' || this.usuario.agente?.rAgenteCte.rCte.familia === 'SD GDL M2') {
        this.sucursal = 2002;
        this.almacen = 'NHE-100';
      }
    }

    this.http.get<ArtFam[]>(this._globalService.urlAPI + 'ArtsFams', 
      { 
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + this.usuario.token
        })
      }
    ).subscribe({
      next: data => {
        if (data !== null || data !== undefined) {
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
        } else {
          this.familias = [];
        }
      },
      error: err => {
        if (err.status === 401) {
          localStorage.removeItem('usuario');
          this.router.navigate(['/login']);
        } else {
          this.dialog.open(DialogView, {
            width: '400px',
            data: {titulo: 'Error', mensaje: 'Ocurrio un error al obtener las familias'}
          })
        }
      }
    });
  }


  ObtenerLineasArticulo(): void {
    this.http.get<Array<ArtLinea>>(this._globalService.urlAPI + 'ArtLineas/LineaArticulos', {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuario.token
      })
    }).subscribe({
      next: data => {
        if (data !== null || data !== undefined) {
          this.articuloLineas = data;
          this.articuloLineas.unshift({
            linea: 'TODAS',
            lineaMaestra: null,
            clave: null,
            icono: null
          });
          this.lineaSeleccionada = this._globalService.lineaArticulo;
          this.buscarArticulos();
        } else {
          this.articuloLineas = [];
        }
      },
      error: err => {
        if (err.status === 401) {
          localStorage.removeItem('usuario');
          this.router.navigate(['/login']);
        } else {
          this.dialog.open(DialogView, {
            width: '400px',
            data: {titulo: 'Error', mensaje: 'Ocurrio un error al obtener las linea de los articulos'}
          })
        }
      }
    })
  }

  esTipoArticuloRequest(artRequest: any): artRequest is ArtsRequest {
    return 'arts' in artRequest && 'totalPaginado' in artRequest;
  }

  esTipoResultadoError(resultadoError: any): resultadoError is ResultadoError {
    return 'error' in resultadoError && 'titulo' in resultadoError && 'nivel' in resultadoError && 'descripcion' in resultadoError;
  }

  buscarArticulos(): void {


    const clienteParam = (this.usuario.esAdmin) ? this.usuario.cliente?.cliente : this.usuario.agente?.rAgenteCte.cliente;

    this.ParametrosBusqueda.set("IgnorarPrimeros", this.ignorarLosPrimeros.toString());
    this.ParametrosBusqueda.set("CantidadFilas", this.tamanoPagina.toString());
    this.ParametrosBusqueda.set("Busqueda", this.textoBusqueda);
    this.ParametrosBusqueda.set("Sucursal", this.sucursal.toString());
    this.ParametrosBusqueda.set("Almacen", this.almacen);
    this.ParametrosBusqueda.set("Familia", this.familiaSeleccionada);
    //@ts-ignore
    this.ParametrosBusqueda.set("Cliente", clienteParam);
    this.ParametrosBusqueda.set("Condicion", this.condicion);
    this.ParametrosBusqueda.set("TipoFormaPago", this.tipoFormaPago);
    this.ParametrosBusqueda.set("ListaPrecios", this.listaPrecios);
    this.ParametrosBusqueda.set("Linea", this.lineaSeleccionada);

    

    this.http.post<ResultadoError|ArtsRequest>(this._globalService.urlAPI + 'Articulos/ArticulosPorBusquedaFiltrosPaginacion', this.ParametrosBusqueda, 
      { 
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + this.usuario.token
        })
      }
    ).subscribe({
      next: data => {
        if (data !== null) {
          if (this.esTipoArticuloRequest(data)) {
            if (data.arts !== null) {
              this.listaArticulos = data.arts;
              this.listaArticulos.forEach((articulo, indice) => {
                if (articulo.rArtUnidad !== null) {
                  if (typeof articulo.rArtUnidad?.factor === 'number' ) {
                    articulo.precioM2 = articulo.precioLista * articulo.rArtUnidad?.factor;
                  }
                }
              })
              if (typeof data.totalPaginado === 'number') {
                this.totalPaginado = data.totalPaginado;
              }
            }
          } else if (this.esTipoResultadoError(data)) {
            this.dialog.open(DialogView, {
              width: '400px',
              data: {titulo: data.titulo, mensaje: data.descripcion}
            })
          }
        } else {
          this.listaArticulos = [];
          this.totalPaginado = 0;
        }
      },
      error: err => {
        if (err.status === 401) {
          localStorage.removeItem('usuario');
          this.router.navigate(['/login']);
        } else {
          this.dialog.open(DialogView, {
            width: '400px',
            data: {titulo: 'Error', mensaje: 'Ocurrio un error al obtener los articulos'}
          })
        }
      }
    });
  } 

  verDetalleArticulo(articulo: string): void {
    this.router.navigate([`../articulo/${articulo}`], {relativeTo: this.route});
  }

  cambiarPagina(paginado: PageEvent): void {
    this.tamanoPagina = paginado.pageSize;
    this.ignorarLosPrimeros = (((paginado.pageIndex + 1) * paginado.pageSize) === this.tamanoPagina) ? 0 : (((paginado.pageIndex + 1) * paginado.pageSize) - this.tamanoPagina);
    this.paginaIndice = paginado.pageIndex;
    this.buscarArticulos();
  }

  seleccionarFamilia(fam: string): void {
    this._globalService.familiaArticulo = this.familiaSeleccionada;
    this.ignorarLosPrimeros = 0;
    this.paginaIndice = 0;
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
    this.ignorarLosPrimeros = 0;
    this.paginaIndice = 0;
    this.buscarArticulos();
  }

  BusquedaTexto(): void {
    this.ignorarLosPrimeros = 0;
    this.paginaIndice = 0;
    this.buscarArticulos();
  }

}
