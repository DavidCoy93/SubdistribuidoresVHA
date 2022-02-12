import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Articulo } from 'src/app/Models/Articulo';
import { Usuario } from 'src/app/Models/Usuario';
import { CarritoComponent } from '../carrito/carrito.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  UsuarioObj: Usuario = {};
  carritoArticulos: Articulo[] = [];
  numeroArticulos: number = 0;
  verArticulos: boolean = true;
  verCarrito: boolean = false;

  @ViewChild(CarritoComponent) carritoChild!: CarritoComponent;

  public constructor(private titleService: Title, private route: ActivatedRoute, private router: Router) { 
    this.titleService.setTitle('Inicio');
    // @ts-ignore
    this.UsuarioObj = JSON.parse(localStorage.getItem('usuario'));
  }

  ngOnInit(): void {
    
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login'])
  }

  agregarArticuloCarrito(art: Articulo): void {
    
    let ArticuloExistente = this.carritoArticulos.filter(articulo => articulo === art)[0];
    if (ArticuloExistente === null || ArticuloExistente === undefined) {
      this.carritoArticulos.push(art)
    } else {
      this.carritoArticulos.forEach((articulo, indice) => {
        if (articulo.Nombre === art.Nombre) {
          articulo.Cantidad += 1;
        }
      });
    }
    this.numeroArticulos = this.carritoArticulos.length;
  }

  quitarArticuloCarrito(art: Articulo): void {
    for (let i = 0; i < this.carritoArticulos.length; i++) {
      if(this.carritoArticulos[i].Nombre === art.Nombre) {
        this.carritoArticulos.splice(i, 1);
        break;
      }
    }
    this.numeroArticulos = this.carritoArticulos.length;
    this.carritoChild.calcularTotalCarrito();
  }

}
