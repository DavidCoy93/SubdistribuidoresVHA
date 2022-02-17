import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Articulo } from 'src/app/Models/Articulo';
import { Usuario } from 'src/app/Models/Usuario';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-articulos',
  templateUrl: './articulos.component.html',
  styleUrls: ['./articulos.component.css']
})
export class ArticulosComponent implements AfterViewInit {

  @Input() subdistribuidor: Usuario = {};
  @Output() agregar: EventEmitter<Articulo> = new EventEmitter();
  @Output() deshacer: EventEmitter<any> = new EventEmitter();

  listaArticulos: Articulo[] = [];
  columnasTabla: string[] = ['Articulo', 'Imagen', 'Descripción', 'Opciones'];
  dataSource = new MatTableDataSource<Articulo>(this.listaArticulos);
  textoBusqueda: string = '';
  urlImages: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private _snackBar: MatSnackBar, private _globalService: GlobalsService) {

    for (let i = 0; i < 1000; i++) {
      const art: Articulo = {
        Nombre: 'art ' + i,
        Descripcion: 'Es el articulo No ' + i,
        Precio: 10 + i,
        Cantidad: 1
      }
      this.listaArticulos.push(art);
    }

    if (this.subdistribuidor.esAsesor){
      this.columnasTabla.splice(3,0,'Precio');
    }

    this.urlImages = _globalService.urlImagenes;
  }

  ngAfterViewInit(): void {
      this.dataSource.paginator = this.paginator;
  }

  MostrarSnackBar(mensaje: string, articulo: Articulo): void {
    let snackBarRef = this._snackBar.open(mensaje, 'Deshacer', { duration: 5000 });
    this.agregar.emit(articulo);
    snackBarRef.onAction().subscribe(() => {
      this.deshacer.emit();
    })
  }

  filtrarArticulos(): void {
    this.dataSource.filter = this.textoBusqueda;
    if(this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
