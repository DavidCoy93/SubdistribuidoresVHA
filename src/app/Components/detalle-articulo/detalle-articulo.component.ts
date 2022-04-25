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
import { ResultadoError } from 'src/app/Models/ResultadoError';


@Component({
  selector: 'app-detalle-articulo',
  templateUrl: './detalle-articulo.component.html',
  styleUrls: ['./detalle-articulo.component.css']
})
export class DetalleArticuloComponent implements OnInit {

  idArticulo: string|null;
  usuario: Usuario = {};
  articulo: Articulo = {articulo: '', descripcion1: '', precioLista: 0, Cantidad: 1, rSaldoU: [], imagenBase64: [], linea: '', impuesto1: 0};
  almacenSeleccionado?: SaldoU = undefined;
  imagenNoDisponible = 'assets/img/Imagen no disponible_B.jpg'
  almacen: string = '';
  sucursal: number = 0;
  condicion: string = '';
  tipoFormaPago: string = '';
  listaPrecios: string = '';

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

    this.http.get<Articulo>(this.globalService.urlAPI + `Articulos/ArticuloCliente?Articulo=${this.idArticulo}&Sucursal=${this.sucursal}&Almacen=${this.almacen}&Cliente=${parametroCliente}&Condicion=${this.condicion}&TipoFormaPago=${this.tipoFormaPago}&ListaPrecios=${this.listaPrecios}`, 
      { 
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + this.usuario.token
        })
      }
    ).subscribe({
      next: data => {
        // if (data !== null) {
        //   if (this.esTipoArticulo(data)) {
        //     this.articulo = data;
        //     if (this.articulo.rArtUnidad !== null) {
        //       if (typeof this.articulo.rArtUnidad?.factor === 'number') {
        //         this.articulo.precioM2 = this.articulo.precioLista * this.articulo.rArtUnidad?.factor;
        //       }
        //     }
        //   } else if (this.esTipoResultadoError(data)) {
        //     this.dialog.open(DialogView, {
        //       width: '450px',
        //       data: {titulo: data.titulo, mensaje: data.descripcion}
        //     });
        //     router.navigate(['..']);
        //   }
        // } else {
        //   this.dialog.open(DialogView, {
        //     width: '450px',
        //     data: {titulo: 'Error', mensaje: 'El articulo ' + this.idArticulo + ' no existe'}
        //   });
        //   router.navigate(['..']);
        // }
        if(data === null) {
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

  // esTipoArticulo(articulo: any): articulo is Articulo {
  //   return 'articulo' in articulo && 
  //           'rama' in articulo && 
  //           'descripcion1' in articulo && 
  //           'descripcion2' in articulo && 
  //           'nombreCorto' in articulo && 
  //           'grupo' in articulo && 
  //           'categoria' in articulo &&
  //           'familia' in articulo &&
  //           'fabricante' in articulo &&
  //           'claveFabricante' in articulo &&
  //           'impuesto1' in articulo &&
  //           'unidad' in articulo &&
  //           'UnidadCompra' in articulo &&
  //           'peso' in articulo &&
  //           'tipo' in articulo &&
  //           'estatus' in articulo &&
  //           'registro1' in articulo &&
  //           'codigoAlterno' in articulo &&
  //           'tipoEmpaque' in articulo &&
  //           'precioLista' in articulo &&
  //           'rArtUnidad' in articulo &&
  //           'rArtCosto' in articulo &&
  //           'rSaldoU' in articulo &&
  //           'rOferta' in articulo &&
  //           'precioPromocion' in articulo &&
  //           'labelCount' in articulo &&
  //           'rArticuloImagen' in articulo &&
  //           'imagenBase64' in articulo &&
  //           'linea' in articulo &&
  //           'Cantidad' in articulo &&
  //           'precioM2' in articulo
  // }

  // esTipoResultadoError(resultadoError: any): resultadoError is ResultadoError {
  //   return 'error' in resultadoError && 'titulo' in resultadoError && 'nivel' in resultadoError && 'descripcion' in resultadoError;
  // }

  agregarArticulo(): void {
    if(this.almacenSeleccionado === undefined && this.articulo.linea === 'STOCK') {
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
