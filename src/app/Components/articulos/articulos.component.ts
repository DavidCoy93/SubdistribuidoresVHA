import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Articulo } from 'src/app/Models/Articulo';
import { Usuario } from 'src/app/Models/Usuario';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-articulos',
  templateUrl: './articulos.component.html',
  styleUrls: ['./articulos.component.css']
})
export class ArticulosComponent {

  @Input() subdistribuidor: Usuario = {};
  @Output() agregar: EventEmitter<Articulo> = new EventEmitter();
  @Output() deshacer: EventEmitter<any> = new EventEmitter();

  listaArticulos: Articulo[] = [];
  listaArticulosPaginado: Articulo[] = [];
  textoBusqueda: string = '';
  urlImages: string = '';
  numeroPagina: number = 0;
  tamanoPagina: number = 5;

  constructor(
    private _snackBar: MatSnackBar, 
    private _globalService: GlobalsService, 
    private router: Router,
    private route: ActivatedRoute) {

    for (let i = 0; i < 16; i++) {
      const art: Articulo = {
        articulo: 'art ' + i,
        descripcion1: 'Es el articulo No ' + i,
        precioLista: 10 + i,
        Cantidad: 1
      }
      this.listaArticulos.push(art);
    }

    this.urlImages = this._globalService.urlImagenes;
    this.listaArticulosPaginado = this.listaArticulos.slice(this.numeroPagina, this.tamanoPagina);
  }

  MostrarSnackBar(mensaje: string, articulo: Articulo): void {
    let snackBarRef = this._snackBar.open(mensaje, 'Deshacer', { duration: 5000 });
    this.agregar.emit(articulo);
    snackBarRef.onAction().subscribe(() => {
      this.deshacer.emit();
    })
  }

  verDetalleArticulo(articulo: string): void {
    this.router.navigate([`./articulo/${articulo}`], {relativeTo: this.route});
  }

  cambiarPagina(paginado: PageEvent) {
    this.numeroPagina = paginado.pageIndex;
    this.tamanoPagina = paginado.pageSize;
    let inicio = this.numeroPagina * this.tamanoPagina;
    let fin = (this.numeroPagina + 1) * this.tamanoPagina;
    this.listaArticulosPaginado = this.listaArticulos.slice(inicio, fin);
  }

}
