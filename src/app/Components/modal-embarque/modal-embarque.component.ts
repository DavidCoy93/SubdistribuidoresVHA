import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Subdistribuidor } from 'src/app/Models/Subdistribuidor';
import { Usuario } from 'src/app/Models/Usuario';
import { GlobalsService } from 'src/app/Services/globals.service';
import { DialogView } from '../notificacion/dialogView';

@Component({
  selector: 'app-modal-embarque',
  templateUrl: './modal-embarque.component.html',
  styleUrls: ['./modal-embarque.component.css']
})
export class ModalEmbarqueComponent implements OnInit {

  @Input() ordenCompra: Subdistribuidor = {descuentoGlobal: 0, importe: 0, impuestos: 0, rSubdistribuidorD: [], sucursalCliente: null};

  turno: string = '';
  parametrosEmbarque = new FormData();
  usuario: Usuario = {};
  fecha = new FormControl();

  constructor(private modal: NzModalRef, private http: HttpClient, private globalService: GlobalsService, private dialog: MatDialog) { 
    this.usuario = globalService.UsuarioLogueado;
  }

  ngOnInit(): void {
  }

  cerrarModal(): void {
    this.modal.close();
  }

  enviarFechaEnvio(): void {
    if (this.fecha.value !== null && this.turno !== '') {
      this.crearParametrosEmbarque();
      this.http.post<Array<string>>(this.globalService.urlAPI + 'Ventas/AsignarEmbarque', this.parametrosEmbarque, {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + this.usuario.token
        })
      }).subscribe({
        next: response => {
          console.log(response);
        },
        error: err => {
          this.dialog.open(DialogView, {
            width: '350px',
            data: {titulo: 'Error', mensaje:'Ocurrio un error al asignar la fecha de envio'}
          })
        }
      })
    } else {
      if (this.fecha.value === null) {
        this.dialog.open(DialogView, {
          width: '350px',
          data: {titulo: 'Error', mensaje:'Por favor seleccione una fecha'}
        })
      } else if (this.turno === '') {
        this.dialog.open(DialogView, {
          width: '350px',
          data: {titulo: 'Error', mensaje:'Por favor seleccione un turno'}
        })
      }
    }
  }

  sugerirFecha(): void {
    this.crearParametrosEmbarque();
    this.http.post<Array<string>>(this.globalService.urlAPI + 'Ventas/SugerirEmbarque', this.parametrosEmbarque, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuario.token
      })
    }).subscribe({
      next: response => {
        console.log(response);
      },
      error: err => {
        this.dialog.open(DialogView, {
          width: '350px',
          data: {titulo: 'Error', mensaje:'Ocurrio un error al asignar la fecha de envio'}
        })
      }
    })
  }

  crearParametrosEmbarque(): void {
    if (typeof this.ordenCompra.pedidoID === 'number') {
      this.parametrosEmbarque.set('ID', this.ordenCompra.pedidoID.toString());
    }

    if (this.fecha.value !== null) {
      const fechaParametro = (this.fecha.value !== null) ? new Date(this.fecha.value).toJSON() : '';
      this.parametrosEmbarque.set('Fecha', fechaParametro);
    }

    if (this.turno !== '') {
      this.parametrosEmbarque.set('Turno', this.turno);
    }

    if (typeof this.ordenCompra.pedidoMov === 'string') {
      this.parametrosEmbarque.set('Mov', this.ordenCompra.pedidoMov);
    }

    if (typeof this.ordenCompra.pedidoMovID === 'string') {
      this.parametrosEmbarque.set('MovID', this.ordenCompra.pedidoMovID);
    }

    if (typeof this.usuario.cliente !== undefined) {
      if (typeof this.usuario.cliente?.cliente === 'string') {
        this.parametrosEmbarque.set('Cliente', this.usuario.cliente.cliente);
      }
    }
  }

}
