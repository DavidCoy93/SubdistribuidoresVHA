import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-total-solicitud-orden',
  templateUrl: './total-solicitud-orden.component.html',
  styleUrls: ['./total-solicitud-orden.component.css']
})
export class TotalSolicitudOrdenComponent implements OnInit {

  @Input() Importe: number = 0;
  @Input() Impuestos: number = 0;
  @Input() Observaciones?: string|null = ''

  constructor() { }

  ngOnInit(): void {
  }

}
