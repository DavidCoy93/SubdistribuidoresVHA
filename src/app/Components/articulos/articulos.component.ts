import { AfterViewInit, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Articulo } from 'src/app/Models/Articulo';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-articulos',
  templateUrl: './articulos.component.html',
  styleUrls: ['./articulos.component.css']
})
export class ArticulosComponent implements AfterViewInit {

  @Output() agregar: EventEmitter<Articulo> = new EventEmitter();

  listaArticulos: Articulo[] = [];
  columnasTabla: string[] = ['Articulo', 'Imagen', 'Descripción', 'Opciones'];
  dataSource = new MatTableDataSource<Articulo>(this.listaArticulos);
  textoBusqueda: string = '';
  esAsesor: boolean = true;
  urlImages: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private _snackBar: MatSnackBar, private _globalService: GlobalsService) {

    for (let i = 0; i < 5; i++) {
      const art: Articulo = {
        Nombre: 'art ' + i,
        Descripcion: 'Es el articulo No ' + i,
        Precio: 10 + i,
        Cantidad: 1
      }
      this.listaArticulos.push(art);
    }

    if (this.esAsesor){
      this.columnasTabla.splice(3,0,'Precio');
    }

    this.urlImages = _globalService.urlImagenes;
  }

  ngAfterViewInit(): void {
      this.dataSource.paginator = this.paginator;
  }

  MostrarSnackBar(mensaje: string, articulo: Articulo): void {
    this._snackBar.open(mensaje, 'Deshacer', { duration: 5000 });
    this.agregar.emit(articulo);
  }

  filtrarArticulos(): void {
    this.dataSource.filter = this.textoBusqueda;
    if(this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
