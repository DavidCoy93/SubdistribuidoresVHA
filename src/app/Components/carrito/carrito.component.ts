import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Articulo } from 'src/app/Models/Articulo';
import { solicitud } from 'src/app/Models/Solicitud';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ViewsService } from 'src/app/Services/views.service';


@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit{

  @Input() carrito: Articulo[] = [];
  @Output() quitar: EventEmitter<Articulo> = new EventEmitter();


  Total: number = 0;
  urlImages: string;
  deleteIcon = faTrash;
  solicitudes: solicitud[] = [];
  fechaHoy: Date = new Date();

  constructor(private _globalService: GlobalsService) {
    this.urlImages = this._globalService.urlImagenes;

    for (let i = 0; i < 5; i++) {
      let solicitud: solicitud = {
        Id: i,
        Agente: 'Agente ' + i,
        Descripcion: 'Solicitud ' + i,
        FechaEmision: new Date(this.fechaHoy.getFullYear(), this.fechaHoy.getMonth(), this.fechaHoy.getDate() + i),
        Articulos: [
          {articulo: 'Articulo ' + i, descripcion1: 'Es el art ' + i, precioLista: 10 + i, Cantidad: 1},
          {articulo: 'Articulo ' + (i+1), descripcion1: 'Es el art ' + (i+1), precioLista: 10 + (i+1), Cantidad: 1}
        ] 
      }
      this.solicitudes.push(solicitud);
    }
  }

  calcularTotalCarrito(): void {
    this.Total = 0;
    this.carrito.forEach((articulo, indice) => {
      this.Total += articulo.Cantidad * articulo.precioLista;
    })
  }

  QuitarArticulo(selectedArt: Articulo): void {
    this.quitar.emit(selectedArt);
  }

  ngOnInit(): void {
      this.calcularTotalCarrito();
  }

}
