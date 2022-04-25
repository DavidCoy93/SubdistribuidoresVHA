import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { CteEnviarA } from 'src/app/Models/CteEnviarA';
import { Usuario } from 'src/app/Models/Usuario';
import { GlobalsService } from 'src/app/Services/globals.service';
import { SolicitudService } from 'src/app/Services/solicitud.service';
import { DialogView } from '../notificacion/dialogView';

@Component({
  selector: 'app-modal-sucursales-cliente',
  templateUrl: './modal-sucursales-cliente.component.html',
  styleUrls: ['./modal-sucursales-cliente.component.css']
})
export class ModalSucursalesClienteComponent implements OnInit, OnDestroy {

  @Input() vieneDeAutorizacion: boolean = false;

  sucursales: Array<CteEnviarA> = [];
  usuarioSD: Usuario = {};
  sucursalSeleccionada: number = 0;

  constructor(
    private globalService: GlobalsService,
    private http: HttpClient,
    private dialog: MatDialog,
    private modal: NzModalRef,
    public solicitudService: SolicitudService,
    private modalService: NzModalService) 
  { 
    this.usuarioSD = globalService.UsuarioLogueado;
    this.ObtenerSucursalesCliente();
  }

  ngOnInit(): void {
  }

  ObtenerSucursalesCliente(): void {
    this.http.get<Array<CteEnviarA>>(this.globalService.urlAPI + `CteEnviarA/cteEnviarA?cliente=${this.usuarioSD.cliente?.cliente}`, {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuarioSD.token
      })
    }).subscribe({
      next: data => {
        if (data !== null) {
          this.sucursales = data;
        } 
      }, 
      error: err => {
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al obtener las sucursales del cliente'}
        })
      }
    })
  }

  cerrarModal(): void {
    this.modal.close();
  }

  seleccionarSucursal(sucursal: number): void {
    if (!this.vieneDeAutorizacion) {
      this.solicitudService.solicitudOC.encabezado.sucursalCliente = sucursal;
    }
  }

  ngOnDestroy(): void {
    this.vieneDeAutorizacion = false;
  }



}
