import { Component, Input, OnInit } from '@angular/core';
import { Usuario } from 'src/app/Models/Usuario';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-total-solicitud-orden',
  templateUrl: './total-solicitud-orden.component.html',
  styleUrls: ['./total-solicitud-orden.component.css']
})
export class TotalSolicitudOrdenComponent implements OnInit {

  @Input() Importe: number = 0;
  @Input() Impuestos: number = 0;
  @Input() Observaciones?: string|null = ''
  @Input() Descuento: number = 0;

  usuario: Usuario = {};

  constructor(private globalService: GlobalsService) { 
    this.usuario = this.globalService.UsuarioLogueado;
  }

  ngOnInit(): void {
  }

}
