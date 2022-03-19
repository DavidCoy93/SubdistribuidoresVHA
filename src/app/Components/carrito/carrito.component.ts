import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Usuario } from 'src/app/Models/Usuario';
import { GlobalsService } from 'src/app/Services/globals.service';
import { SolicitudService } from 'src/app/Services/solicitud.service';


@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit{
  
  usuario: Usuario = {};
  almacenSolicitud: string = '';

  constructor(private globalService: GlobalsService, private tilteService: Title, public solicitudService: SolicitudService) {
    this.tilteService.setTitle('Carrito');
    this.usuario = this.globalService.UsuarioLogueado;
  }

  ngOnInit(): void {
    window.scrollTo(0,0);
  }

  seleccionarAlmacen(alm: string) {
    alert("Selecciono el almacen " + this.almacenSolicitud + alm)
  }

}
