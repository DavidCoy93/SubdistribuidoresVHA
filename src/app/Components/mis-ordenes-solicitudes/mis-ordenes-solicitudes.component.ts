import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subdistribuidor } from 'src/app/Models/Subdistribuidor';
import { Usuario } from 'src/app/Models/Usuario';
import { GlobalsService } from 'src/app/Services/globals.service';

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

  constructor(private globalService: GlobalsService, private http: HttpClient, private titleService: Title) { 
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
      },
      error: err => {
        console.log(err);
      }
    })
  }

  ngOnInit(): void {
  }

}
