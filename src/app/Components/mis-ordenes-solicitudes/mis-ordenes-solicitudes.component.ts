import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Agente } from 'src/app/Models/Agente';
import { Subdistribuidor } from 'src/app/Models/Subdistribuidor';
import { Usuario } from 'src/app/Models/Usuario';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ModalEmbarqueComponent } from '../modal-embarque/modal-embarque.component';
import { DialogView } from '../notificacion/dialogView';


@Component({
  selector: 'app-mis-ordenes-solicitudes',
  templateUrl: './mis-ordenes-solicitudes.component.html',
  styleUrls: ['./mis-ordenes-solicitudes.component.css']
})
export class MisOrdenesSolicitudesComponent implements OnInit {

  titulo: string = '';
  usuarioSD: Usuario = {};
  cliente?: string;
  agente?: string;
  estatus: string = '';
  tipoDocumento: string = '';
  solicitudesOrdenes: Array<Subdistribuidor> = [];
  fecha = new FormControl();
  agentes: Array<Agente> = [];

  constructor(
    private globalService: GlobalsService,
    private http: HttpClient, 
    private titleService: Title,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NzModalService,
    private viewContainerRef: ViewContainerRef) 
  { 
    this.usuarioSD = this.globalService.UsuarioLogueado;
    this.titulo += (this.usuarioSD.esAdmin) ? 'Mis solicitudes/ordenes' : 'Mis solicitudes';
    this.titleService.setTitle(this.titulo);
    this.cliente = (this.usuarioSD.esAdmin) ? this.usuarioSD.cliente?.cliente : this.usuarioSD.agente?.rAgenteCte.cliente;
    this.agente = (!this.usuarioSD.esAdmin) ? this.usuarioSD.agente?.rAgenteCte.agente : '';
    this.tipoDocumento = (!this.usuarioSD.esAdmin) ? 'Solicitud Orden Compra' : '';
    this.obtenerAgentesCliente();
  }

  ngOnInit(): void {
  }


  buscarOrdenesSolicitudes(): void {
    const fechaParametro: string = (this.fecha.value !== null) ? new Date(this.fecha.value).toJSON() : ''; 
    this.http.get<Array<Subdistribuidor>>(this.globalService.urlAPI + `Subdistribuidor/SubdistribuidorClienteAgenteEstatus?Cliente=${this.cliente}&Agente=${this.agente}&Estatus=${this.estatus}&Documento=${this.tipoDocumento}&Fecha=${fechaParametro}`, { 
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuarioSD.token
      })
    }).subscribe({
      next: data => {
        if (data !== null) {
          if(this.usuarioSD.esAdmin) {
            this.solicitudesOrdenes = data.filter(solicitud =>  solicitud.estatus !== 'PENDIENTE');
            this.solicitudesOrdenes.forEach((solicitud, indice) => {
              if (solicitud.agente !== null) {
                this.agentes.forEach((agente, index) => {
                  if (solicitud.agente === agente.agenteID) {
                    solicitud.nombreAgente = agente.nombre;
                  }
                })
              }
            })
          } else {
            this.solicitudesOrdenes = data.filter(solicitud =>  solicitud.agente !== null && solicitud.estatus !== 'PENDIENTE');
          }
        }
        
      },
      error: err => {
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al obtener las solicitudes'}
        })
      }
    })
  }

  verDetalleOrdenSolicitud(Id?: number|null): void {
    if(typeof Id === 'number') {
      this.router.navigate([`../carrito/${Id}`], {relativeTo: this.route})
    }
  }

  AsignarFechaEnvioOrdenCompra(orden: Subdistribuidor): void {
    this.modalService.create({
      nzTitle: 'Fecha de entrega de la orden de compra',
      nzContent: ModalEmbarqueComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzMaskClosable: false,
      nzClosable: false,
      nzComponentParams: {
        ordenCompra: orden
      },
      nzFooter: [
        {
          label: 'Cancelar',
          type: 'default',
          onClick: (modalInstancia) => {
            modalInstancia?.cerrarModal();
          }
        },
        {
          label: 'Aceptar',
          type: 'primary',
          danger: true,
          onClick: (instancia) => {
            instancia?.enviarFechaEnvio();
          }
        }
      ]
    })
  }

  obtenerAgentesCliente(): void {
    const clienteParam = (this.usuarioSD.esAdmin)? this.usuarioSD.cliente?.cliente : this.usuarioSD.agente?.rAgenteCte.cliente;
    this.http.get<Array<Agente>>(this.globalService.urlAPI + `Agentes/AgentePorCliente/${clienteParam}`, { 
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuarioSD.token
      })
    }).subscribe({
      next: response => {
        if (response !== null) {
          this.agentes = response;
          this.buscarOrdenesSolicitudes();
        } else {
          this.agentes = [];
          this.buscarOrdenesSolicitudes();
        }
      },
      error: err => {
        this.buscarOrdenesSolicitudes();
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al obtener los agentes del cliente'}
        })
      }
    })
  }

}
