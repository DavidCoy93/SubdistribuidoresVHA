import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Articulo } from 'src/app/Models/Articulo';
import { SaldoU } from 'src/app/Models/SaldoU';
import { Usuario } from 'src/app/Models/Usuario';
import { GlobalsService } from 'src/app/Services/globals.service';
import { SolicitudService } from 'src/app/Services/solicitud.service';
import { DialogView } from '../notificacion/dialogView';

@Component({
  selector: 'app-modal-disponibles-almacen',
  templateUrl: './modal-disponibles-almacen.component.html',
  styleUrls: ['./modal-disponibles-almacen.component.css']
})
export class ModalDisponiblesAlmacenComponent implements OnInit {

  @Input() articulo: string = '';
  usuarioLogueado: Usuario = {};
  disponiblesAlmacen: Array<SaldoU> = [];
  almacenSeleccionado: SaldoU = {
    cuenta: '', 
    empresa: 'VHA',
    grupo: '',
    moneda: 'Pesos',
    porConciliar: 0,
    porConciliarU: 0,
    rama: '',
    saldo: 0,
    saldoUU: 0,
    subCuenta: '',
    subGrupo: '',
    sucursal: 0,
    ultimoCambio: new Date()
  };
  sucursalCliente: number = 0;
  almacenCliente: string = '';
  condicionCliente: string = '';
  tipoFormaPago: string = '';
  listaPrecios: string = ''; 


  @ViewChild('tbodyArticulos') tbody!: ElementRef

  constructor(
    private modal: NzModalRef, 
    private http: HttpClient, 
    private globalService: GlobalsService,
    private dialog: MatDialog,
    private solicitudSevice: SolicitudService) 
  {
    this.usuarioLogueado = this.globalService.UsuarioLogueado;
    if (this.usuarioLogueado.esAdmin) {

      if (typeof this.usuarioLogueado.cliente?.condicion === 'string') {
        this.condicionCliente = this.usuarioLogueado.cliente?.condicion;
        
        this.tipoFormaPago = (this.usuarioLogueado.cliente.condicion !== 'CONTADO') ? 'Credito' : 'Contado';
      }

      if (this.usuarioLogueado.cliente?.listaPreciosESP !== null)  {
        if (typeof this.usuarioLogueado.cliente?.listaPreciosESP === 'string') {
          this.listaPrecios = this.usuarioLogueado.cliente?.listaPreciosESP;
        }
      } else {
        this.listaPrecios = '(Precio Lista)';
      }

      if(this.usuarioLogueado.cliente?.familia === 'SD AGS' || this.usuarioLogueado.cliente?.familia === 'SD BAJ' || this.usuarioLogueado.cliente?.familia === 'SD BAJ 2' || this.usuarioLogueado.cliente?.familia === 'SD ZAC') {
        this.sucursalCliente = 1001;
        if (this.usuarioLogueado.cliente?.familia === 'SD ZAC') {
          this.almacenCliente = 'ZAC-100';
        } else {
          this.almacenCliente = 'CDG-100';
        }
      }
      
      if (this.usuarioLogueado.cliente?.familia === 'SD GDL F' || this.usuarioLogueado.cliente?.familia === 'SD GDL F2') {
        this.sucursalCliente = 2001;
        this.almacenCliente = 'JUP-100';
      }
      
      if (this.usuarioLogueado.cliente?.familia === 'SD GDL M' || this.usuarioLogueado.cliente?.familia === 'SD GDL M2') {
        this.sucursalCliente = 2002;
        this.almacenCliente = 'NHE-100';
      }

    } else {

      if (typeof this.usuarioLogueado.agente?.rAgenteCte.rCte.condicion === 'string') {
        this.condicionCliente = this.usuarioLogueado.agente?.rAgenteCte.rCte.condicion;
        
        this.tipoFormaPago = (this.usuarioLogueado.agente?.rAgenteCte.rCte.condicion !== 'CONTADO') ? 'Credito' : 'Contado';
      }

      if (this.usuarioLogueado.agente?.rAgenteCte.rCte.listaPreciosESP !== null)  {
        if (typeof this.usuarioLogueado.agente?.rAgenteCte.rCte.listaPreciosESP === 'string') {
          this.listaPrecios = this.usuarioLogueado.agente?.rAgenteCte.rCte.listaPreciosESP;
        }
      } else {
        this.listaPrecios = '(Precio Lista)';
      }
  
      if(this.usuarioLogueado.agente?.rAgenteCte.rCte.familia === 'SD AGS' || this.usuarioLogueado.agente?.rAgenteCte.rCte.familia === 'SD BAJ' || this.usuarioLogueado.agente?.rAgenteCte.rCte.familia === 'SD BAJ 2' || this.usuarioLogueado.agente?.rAgenteCte.rCte.familia === 'SD ZAC') {
        this.sucursalCliente = 1001;
        if (this.usuarioLogueado.agente?.rAgenteCte.rCte.familia === 'SD ZAC') {
          this.almacenCliente = 'ZAC-100';
        } else {
          this.almacenCliente = 'CDG-100';
        }
      }
      
      if (this.usuarioLogueado.agente?.rAgenteCte.rCte.familia === 'SD GDL F' || this.usuarioLogueado.agente?.rAgenteCte.rCte.familia === 'SD GDL F2') {
        this.sucursalCliente = 2001;
        this.almacenCliente = 'JUP-100';
      }
      
      if (this.usuarioLogueado.agente?.rAgenteCte.rCte.familia === 'SD GDL M' || this.usuarioLogueado.agente?.rAgenteCte.rCte.familia === 'SD GDL M2') {
        this.sucursalCliente = 2002;
        this.almacenCliente = 'NHE-100';
      }
    }
  }

  ngOnInit(): void {
    const ClienteParam = (this.usuarioLogueado.esAdmin) ? this.usuarioLogueado.cliente?.cliente : this.usuarioLogueado.agente?.rAgenteCte.cliente;
    this.http.get<Articulo>(this.globalService.urlAPI + `Articulos/ArticuloCliente?Articulo=${this.articulo}&Sucursal=${this.sucursalCliente}&Almacen=${this.almacenCliente}&Cliente=${ClienteParam}&Condicion=${this.condicionCliente}&TipoFormaPago=${this.tipoFormaPago}&ListaPrecios=${this.listaPrecios}`, 
      { 
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + this.usuarioLogueado.token
        })
      }
    ).subscribe({
      next: data => {
        this.disponiblesAlmacen = data.rSaldoU;
        if(this.disponiblesAlmacen.length === 0) {
          this.dialog.open(DialogView, {
            width: '300px',
            data: {titulo: 'Error', mensaje: 'Por el momento no hay disponibilidad de este articulo'}
          }).afterClosed().subscribe(() => {
            this.modal.close();
          })
        }
      },
      error: err => {
        this.dialog.open(DialogView, {
          width: '300px',
          data: {titulo: 'Error', mensaje: 'Ocurrio un error al obtener la disponibilidad de los almacenes'}
        }).afterClosed().subscribe(() => {
          this.modal.close();
        })
      }
    })
  }

  cerrarModal(indice: number): void {
    if(this.almacenSeleccionado.grupo === '' && this.almacenSeleccionado.saldoUU === 0) {
      this.dialog.open(DialogView, {
        width: '300px',
        data: {titulo: 'Alerta'  ,mensaje: 'Por favor seleccione un almacén'}
      })
    } else {
      const detalleAnterior = this.solicitudSevice.solicitudOC.detalle[indice];
      this.solicitudSevice.solicitudOC.detalle[indice].disponible = this.almacenSeleccionado.saldoUU;
      this.solicitudSevice.solicitudOC.detalle[indice].almacen = this.almacenSeleccionado.grupo;
      this.solicitudSevice.ActualizarAlmacenDetalle(indice, detalleAnterior);
      this.modal.close();
    }
  }

  seleccionar(indice: number, almacen: SaldoU): void {
    for (let i = 0; i < this.tbody.nativeElement.rows.length; i++) {
      this.tbody.nativeElement.rows[i].classList.remove('seleccionado');
    }
    this.tbody.nativeElement.rows[indice].classList.add('seleccionado');
    this.almacenSeleccionado.grupo = almacen.grupo;
    this.almacenSeleccionado.saldoUU = almacen.saldoUU;
  }

}
