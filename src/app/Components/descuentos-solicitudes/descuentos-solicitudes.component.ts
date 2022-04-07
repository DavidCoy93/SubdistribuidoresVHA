import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith, switchMap } from 'rxjs';
import { Cliente } from 'src/app/Models/Cliente';

@Component({
  selector: 'app-descuentos-solicitudes',
  templateUrl: './descuentos-solicitudes.component.html',
  styleUrls: ['./descuentos-solicitudes.component.css']
})
export class DescuentosSolicitudesComponent implements OnInit {

  clienteControl = new FormControl();
  opciones: Array<string> = ['uno', 'dos', 'tres'];
  listaClientes?: Observable<Array<string>>;

  constructor() { }

  ngOnInit(): void {
    this.listaClientes = this.clienteControl.valueChanges.pipe(
      startWith(''),
      map(cliente => this.buscarClientes(cliente))
    )
  }

  buscarClientes(cliente: string): Array<string> {
    return this.opciones.filter(cte => cte.includes(cliente)); 
  }

}
