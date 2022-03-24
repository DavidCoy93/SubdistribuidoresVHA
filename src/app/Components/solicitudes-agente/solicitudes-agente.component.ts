import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SubdistribuidorD } from 'src/app/Models/SubdistribuidorD';

@Component({
  selector: 'app-solicitudes-agente',
  templateUrl: './solicitudes-agente.component.html',
  styleUrls: ['./solicitudes-agente.component.css']
})
export class SolicitudesAgenteComponent implements OnInit {

  agente: string = '';

  detalleSolicitud: Array<SubdistribuidorD> = [
    {articulo: 'latu11', cantidad: 1, precio: 1349, descripcion: 'Descripción 1'},
    {articulo: 'latu12', cantidad: 1, precio: 150, descripcion: 'Descripción 2'},
    {articulo: 'latu13', cantidad: 1, precio: 666, descripcion: 'Descripción 3'},
  ];

  constructor(private titleService: Title) { 
    this.titleService.setTitle('solicitudes');
  }

  ngOnInit(): void {
  }

}
