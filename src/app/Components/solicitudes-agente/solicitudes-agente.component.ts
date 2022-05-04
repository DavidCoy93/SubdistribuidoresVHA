import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Agente } from 'src/app/Models/Agente';
import { ResultadoAfectar } from 'src/app/Models/ResultadoAfectar';
import { Subdistribuidor } from 'src/app/Models/Subdistribuidor';
import { Usuario } from 'src/app/Models/Usuario';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ModalConfirmacionComponent } from '../modal-confirmacion/modal-confirmacion.component';
import { DialogView } from '../notificacion/dialogView';

@Component({
  selector: 'app-solicitudes-agente',
  templateUrl: './solicitudes-agente.component.html',
  styleUrls: ['./solicitudes-agente.component.css']
})
export class SolicitudesAgenteComponent implements OnInit {

  agente: string = '';
  usuarioSD: Usuario = {};
  solicitudesAgente: Array<Subdistribuidor> = [];
  agentes: Array<Agente> = [];

  constructor(
    private titleService: Title,
    private globalService: GlobalsService,
    private modalService: NzModalService,
    private http: HttpClient,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef) 
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
        if (response !== null) {
          this.solicitudesAgente = response;
          this.solicitudesAgente.forEach((solicitud, indice) => {
            this.agentes.forEach((agente, index) => {
              if (solicitud.agente === agente.agenteID) {
                solicitud.nombreAgente = agente.nombre;
              }
            })
          })
        } else {
          this.solicitudesAgente = [];
        }
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
    if (estatus === 'CONCLUIDO') {
      this.modalService.create({
        nzContent: ModalConfirmacionComponent,
        nzViewContainerRef: this.viewContainerRef,
        nzComponentParams: {
            mensaje: '¿Esta de acuerdo con los precios mostrados hasta ahora ó desea que sea revisada por personal de vitrohogar?'
          },
          nzClosable: false,
          nzFooter: [
            {
              label: 'Cerrar',
              type: 'primary',
              onClick: (modalInstancia) => {
                modalInstancia?.cerrarModal();
              }
            },
            {
              label: 'Solicitar revisión',
              type:  'primary',
              onClick: () => {
                this.afectarSolicitudOrden(solicitud, 'POR REVISAR')
              }
            },
            {
              label: 'De acuerdo',
              type: 'primary',
              danger: true,
              onClick: () => {
                this.modalService.confirm({
                  nzTitle: '¿Esta seguro de continuar?',
                  nzClosable: false,
                  nzOkText: 'Continuar',
                  nzCancelText: 'Cancelar',
                  nzOnOk: () => {
                    this.afectarSolicitudOrden(solicitud, 'CONCLUIDO');
                  }
                })
              }
            },
          ]
      })
    } else {
      this.modalService.confirm({
        nzTitle: `¿Esta seguro de rechazar la solicitud con folio ${solicitud.folio}?`,
        nzOkText: 'Rechazar',
        nzOkDanger: true,
        nzCancelText: 'Cancelar',
        nzOnOk: () => {
          this.afectarSolicitudOrden(solicitud, 'RECHAZADO');
        }
      })
    }
  }


  afectarSolicitudOrden(solicitud: Subdistribuidor, estatus?: string): void {
    const botonOkTexto = (estatus === 'CONCLUIDO') ? 'Autorizar' : 'Rechazar';
    this.http.get<ResultadoAfectar>(this.globalService.urlAPI + `Subdistribuidor/Afectar/${solicitud.id}/${estatus}`, {
      headers: new HttpHeaders({
       Authorization: 'Bearer ' + this.usuarioSD.token
      })
    }).subscribe({
      next: data => {
        if (data !== null) {
          if (data.ok === 1) {
            this.modalService.success({
              nzTitle: `Se ${(estatus === 'CONCLUIDO') ? 'autorizo' : 'rechazo'} la solicitud con folio ${solicitud.folio}`,
              nzOkText: 'Aceptar',
              nzOnOk: () => {
                this.modalService.closeAll();
                this.buscarSolicitudesPorAutorizar();
              }
            })
          } else {
            this.modalService.closeAll();
            this.dialog.open(DialogView, {
              width: '300px',
              data: {titulo: data.titulo, mensaje: data.descripcion}
            })
          }
        } else {
          this.modalService.closeAll();
          this.dialog.open(DialogView, {
            width: '300px',
            data: {titulo: 'Error', mensaje: `Ocurrio un error al ${botonOkTexto.toLowerCase()} la solicitud, pór favor contacte al area de sistemas de vitrohogar`}
          })
        }
      },
      error: err => {
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: `Ocurrio un error al ${botonOkTexto.toLowerCase()} la solicitud, pór favor contacte al area de sistemas de vitrohogar`}
        })
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
