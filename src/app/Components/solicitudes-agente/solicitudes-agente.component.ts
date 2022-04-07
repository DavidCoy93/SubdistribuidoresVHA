import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Agente } from 'src/app/Models/Agente';
import { ResultadoAfectar } from 'src/app/Models/ResultadoAfectar';
import { Subdistribuidor } from 'src/app/Models/Subdistribuidor';
import { Usuario } from 'src/app/Models/Usuario';
import { GlobalsService } from 'src/app/Services/globals.service';
import { DialogView } from '../notificacion/dialogView';

@Component({
  selector: 'app-solicitudes-agente',
  templateUrl: './solicitudes-agente.component.html',
  styleUrls: ['./solicitudes-agente.component.css']
})
export class SolicitudesAgenteComponent implements OnInit {

  agente: string = '';
  // solicitudesAgente: Array<Subdistribuidor> = [
  //   {
  //     id: 1011,
  //     folio: 1,
  //     importe: 2015,
  //     impuestos: 322.4,
  //     almacen: 'CDG-100',
  //     cliente: '0000730',
  //     condicion: 'Algo',
  //     documento: 'Solicitud Orden Compra',
  //     empresa: 'VHA',
  //     moneda: 'Pesos',
  //     estatus: 'Por autorizar',
  //     fecha: new Date(),
  //     fechaAlta: new Date(),
  //     rSubdistribuidorD: [
  //       {
  //         cantidad: 1,
  //         pendiente: 1,
  //         precio: 666,
  //         articulo: 'LATU11',
  //         almacen: 'CDG-100',
  //         descripcion: 'Cualquier descripción',
  //         descuento: 0,
  //         id: 1011,
  //         impuesto: ((666 * 1) * 0.16),
  //         renglon: 1
  //       },
  //       {
  //         cantidad: 1,
  //         pendiente: 1,
  //         precio: 1349,
  //         articulo: 'LATU12',
  //         almacen: 'CDG-100',
  //         descripcion: 'Cualquier descripción',
  //         descuento: 0,
  //         id: 1011,
  //         impuesto: ((1349 * 1) * 0.16),
  //         renglon: 2
  //       }
  //     ],
  //   },
  //   {
  //     id: 1012,
  //     folio: 2,
  //     importe: 1349,
  //     impuestos: 215.84,
  //     almacen: 'CDG-100',
  //     cliente: '0000730',
  //     condicion: 'Algo',
  //     documento: 'Solicitud Orden Compra',
  //     empresa: 'VHA',
  //     moneda: 'Pesos',
  //     estatus: 'Por autorizar',
  //     fecha: new Date(),
  //     fechaAlta: new Date(),
  //     rSubdistribuidorD: [
  //       {
  //         cantidad: 1,
  //         pendiente: 1,
  //         precio: 999,
  //         articulo: 'LACA41BE',
  //         almacen: 'CDG-100',
  //         descripcion: 'Cualquier descripción',
  //         descuento: 0,
  //         id: 1011,
  //         impuesto: ((999 * 1) * 0.16),
  //         renglon: 1
  //       },
  //       {
  //         cantidad: 1,
  //         pendiente: 1,
  //         precio: 350,
  //         articulo: 'LACA41BF',
  //         almacen: 'CDG-100',
  //         descripcion: 'Cualquier descripción',
  //         descuento: 0,
  //         id: 1011,
  //         impuesto: ((350 * 1) * 0.16),
  //         renglon: 2
  //       }
  //     ],
  //   },
  // ]
  usuarioSD: Usuario = {};
  solicitudesAgente: Array<Subdistribuidor> = [];
  agentes: Array<Agente> = [];

  constructor(
    private titleService: Title,
    private globalService: GlobalsService,
    private modalService: NzModalService,
    private http: HttpClient,
    private dialog: MatDialog) 
  { 
    this.titleService.setTitle('Solicitudes Agentes');
    this.usuarioSD = this.globalService.UsuarioLogueado;
    this.ObtenerAgentesCliente();
  }

  ngOnInit(): void {
  }

  buscarSolicitudesPorAutorizar(): void {
    const clienteParam = (this.usuarioSD.esAdmin) ? this.usuarioSD.cliente?.cliente : this.usuarioSD.agente?.rAgenteCte.cliente;

    this.http.get<Array<Subdistribuidor>>(this.globalService.urlAPI + `Subdistribuidor/SubdistribuidorClienteAgenteEstatus?Cliente=${clienteParam}&Agente=${this.agente}&Estatus=POR AUTORIZAR`, { 
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuarioSD.token
      })
    }).subscribe({
      next: response => {
        this.solicitudesAgente = response;
      },
      error: err => {
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al consultar las solicitudes'}
        })
      }
    })
  }

  autorizarRechazarSolicitud(solicitud: Subdistribuidor, estatus: string): void {
    const botonOkTexto = (estatus === 'AUTORIZAR') ? 'Autorizar' : 'Rechazar';
    this.modalService.confirm({
      nzTitle: '¿Esta seguro de continuar?',
      nzOkText: botonOkTexto,
      nzCancelText: 'Cancelar',
      nzOnOk: () => {
        console.log('Acepto Autorizar')
        this.http.get<ResultadoAfectar>(this.globalService.urlAPI + `Subdistribuidor/Afectar/${solicitud.id}/${estatus}`, {
          headers: new HttpHeaders({
           Authorization: 'Bearer ' + this.usuarioSD.token
          })
        }).subscribe({
          next: data => {
            if (data !== null) {
              if (data.ok === 1) {
                this.modalService.success({
                  nzTitle: 'Se autorizo la solicitud con folio ' + solicitud.folio,
                  nzOkText: 'Aceptar'
                })
              } else {
                this.dialog.open(DialogView, {
                  width: '300px',
                  data: {titulo: 'Error', mensaje: `Ocurrio un error al ${botonOkTexto.toLowerCase()} la solicitud`}
                })
              }
            }
          },
          error: err => {
            this.dialog.open(DialogView, {
              width: '300px',
              data: {titulo: 'Error', mensaje: `Ocurrio un error al ${botonOkTexto.toLowerCase()} la solicitud`}
            })
          }
        })
      },
      nzOnCancel: () => {
        console.log('CANCELO');
      }
    })
  }

  ObtenerAgentesCliente(): void {
    const clienteParam = (this.usuarioSD.esAdmin)? this.usuarioSD.cliente?.cliente : this.usuarioSD.agente?.rAgenteCte.cliente;
    this.http.get<Array<Agente>>(this.globalService.urlAPI + `Agentes/AgentePorCliente/${clienteParam}`, { 
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuarioSD.token
      })
    }).subscribe({
      next: response => {
        this.agentes = response;
        this.buscarSolicitudesPorAutorizar();
      },
      error: err => {
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al obtener los agentes del cliente'}
        })
      }
    })
  }

  seleccionarAgente(agente: any): void {
    this.buscarSolicitudesPorAutorizar();
  }


}
