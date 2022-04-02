import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subdistribuidor } from 'src/app/Models/Subdistribuidor';
import { SubdistribuidorD } from 'src/app/Models/SubdistribuidorD';

@Component({
  selector: 'app-solicitudes-agente',
  templateUrl: './solicitudes-agente.component.html',
  styleUrls: ['./solicitudes-agente.component.css']
})
export class SolicitudesAgenteComponent implements OnInit {

  agente: string = '';

  solicitudesAgente: Array<Subdistribuidor> = [
    {
      id: 1011,
      folio: 1,
      importe: 2015,
      impuestos: 322.4,
      almacen: 'CDG-100',
      cliente: '0000730',
      condicion: 'Algo',
      documento: 'Solicitud Orden Compra',
      empresa: 'VHA',
      moneda: 'Pesos',
      estatus: 'Por autorizar',
      fecha: new Date(),
      fechaAlta: new Date(),
      rSubdistribuidorD: [
        {
          cantidad: 1,
          pendiente: 1,
          precio: 666,
          articulo: 'LATU11',
          almacen: 'CDG-100',
          descripcion: 'Cualquier descripción',
          descuento: 0,
          id: 1011,
          impuesto: ((666 * 1) * 0.16),
          renglon: 1
        },
        {
          cantidad: 1,
          pendiente: 1,
          precio: 1349,
          articulo: 'LATU12',
          almacen: 'CDG-100',
          descripcion: 'Cualquier descripción',
          descuento: 0,
          id: 1011,
          impuesto: ((1349 * 1) * 0.16),
          renglon: 2
        }
      ],
    },
    {
      id: 1012,
      folio: 2,
      importe: 1349,
      impuestos: 215.84,
      almacen: 'CDG-100',
      cliente: '0000730',
      condicion: 'Algo',
      documento: 'Solicitud Orden Compra',
      empresa: 'VHA',
      moneda: 'Pesos',
      estatus: 'Por autorizar',
      fecha: new Date(),
      fechaAlta: new Date(),
      rSubdistribuidorD: [
        {
          cantidad: 1,
          pendiente: 1,
          precio: 999,
          articulo: 'LACA41BE',
          almacen: 'CDG-100',
          descripcion: 'Cualquier descripción',
          descuento: 0,
          id: 1011,
          impuesto: ((999 * 1) * 0.16),
          renglon: 1
        },
        {
          cantidad: 1,
          pendiente: 1,
          precio: 350,
          articulo: 'LACA41BF',
          almacen: 'CDG-100',
          descripcion: 'Cualquier descripción',
          descuento: 0,
          id: 1011,
          impuesto: ((350 * 1) * 0.16),
          renglon: 2
        }
      ],
    },
  ]

  constructor(private titleService: Title) { 
    this.titleService.setTitle('Solicitudes Agentes');
  }

  ngOnInit(): void {
  }

}
