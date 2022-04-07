import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subdistribuidor } from 'src/app/Models/Subdistribuidor';
import { Usuario } from 'src/app/Models/Usuario';
import { GlobalsService } from 'src/app/Services/globals.service';
import { DialogView } from '../notificacion/dialogView';

@Component({
  selector: 'app-mis-ordenes-solicitudes',
  templateUrl: './mis-ordenes-solicitudes.component.html',
  styleUrls: ['./mis-ordenes-solicitudes.component.css']
})
export class MisOrdenesSolicitudesComponent implements OnInit {

  titulo: string = 'Mis ';
  usuarioSD: Usuario = {};
  cliente?: string;
  agente?: string;
  estatus: string = '';
  tipoDocumento: string = '';
  solicitudesOrdenes: Array<Subdistribuidor> = [];
  fecha: string = '';

  constructor(
    private globalService: GlobalsService,
    private http: HttpClient, 
    private titleService: Title,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute) 
  { 
    this.usuarioSD = this.globalService.UsuarioLogueado;
    this.titulo += (this.usuarioSD.esAdmin) ? 'ordenes' : 'solicitudes';
    this.titleService.setTitle(this.titulo);
    this.cliente = (this.usuarioSD.esAdmin) ? this.usuarioSD.cliente?.cliente : this.usuarioSD.agente?.rAgenteCte.cliente;
    this.agente = (!this.usuarioSD.esAdmin) ? this.usuarioSD.agente?.rAgenteCte.agente : '';

    this.http.get<Array<Subdistribuidor>>(this.globalService.urlAPI + `Subdistribuidor/SubdistribuidorClienteAgenteEstatus?Cliente=${this.cliente}&Agente=${this.agente}&Estatus=${this.estatus}`, { 
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.usuarioSD.token
      })
    }).subscribe({
      next: data => {
        console.log(data);
        if (this.usuarioSD.esAdmin) {
          this.solicitudesOrdenes = data.filter(solicitud => solicitud.agente === null && solicitud.estatus !== 'PENDIENTE');
        } else {
          this.solicitudesOrdenes = data.filter(solicitud => solicitud.agente !== null && solicitud.documento === 'Solicitud Orden Compra');
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

  ngOnInit(): void {
  }

  verDetalleOrdenSolicitud(Id?: number|null): void {
    if(typeof Id === 'number') {
      this.router.navigate([`../carrito/${Id}`], {relativeTo: this.route})
    }
  }

}
