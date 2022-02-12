import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Articulo } from 'src/app/Models/Articulo';
import { GlobalsService } from 'src/app/Services/globals.service';


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

  constructor(private _globalService: GlobalsService) {
    this.urlImages = _globalService.urlImagenes;
  }

  calcularTotalCarrito(): void {
    this.Total = 0;
    this.carrito.forEach((articulo, indice) => {
      this.Total += articulo.Cantidad * articulo.Precio;
    })
  }

  QuitarArticulo(selectedArt: Articulo): void {
    this.quitar.emit(selectedArt);
  }

  ngOnInit(): void {
      this.calcularTotalCarrito();
  }

}
