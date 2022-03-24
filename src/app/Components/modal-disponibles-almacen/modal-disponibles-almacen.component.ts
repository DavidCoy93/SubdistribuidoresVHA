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

  @ViewChild('tbodyArticulos') tbody!: ElementRef

  constructor(
    private modal: NzModalRef, 
    private http: HttpClient, 
    private globalService: GlobalsService,
    private dialog: MatDialog,
    private solicitudSevice: SolicitudService) 
  {
    this.usuarioLogueado = this.globalService.UsuarioLogueado;
  }

  ngOnInit(): void {

    // this.http.get<Articulo>(this.globalService.urlAPI + `Articulos/ArticuloCliente?Articulo=${this.articulo}&Cliente=${this.usuarioLogueado.cliente?.cliente}`, 
    //   { 
    //     headers: new HttpHeaders({
    //       Authorization: 'Bearer ' + this.usuarioLogueado.token
    //     })
    //   }
    // ).subscribe({
    //   next: data => {
    //     this.disponiblesAlmacen = data.rSaldoU;
    //     if(this.disponiblesAlmacen.length === 0) {
    //       this.dialog.open(DialogView, {
    //         width: '300px',
    //         data: {titulo: 'Error', mensaje: 'Por el momento no hay disponibilidad de este articulo'}
    //       }).afterClosed().subscribe(() => {
    //         this.modal.close();
    //       })
    //     }
    //   },
    //   error: err => {
    //     this.dialog.open(DialogView, {
    //       width: '300px',
    //       data: {titulo: 'Error', mensaje: 'Ocurrio un error al obtener la disponibilidad de los almacenes'}
    //     }).afterClosed().subscribe(() => {
    //       this.modal.close();
    //     })
    //   }
    // })
  }

  cerrarModal(indice: number): void {
    if(this.almacenSeleccionado.grupo === '' && this.almacenSeleccionado.saldoUU === 0) {
      this.dialog.open(DialogView, {
        width: '300px',
        data: {titulo: 'Alerta'  ,mensaje: 'Por favor seleccione un almacén'}
      })
    } else {
      this.solicitudSevice.solicitudOC.detalle[indice].disponible = this.almacenSeleccionado.saldoUU;
      this.solicitudSevice.solicitudOC.detalle[indice].almacen = this.almacenSeleccionado.grupo;
      this.modal.close();
    }
  }

  seleccionar(indice: number): void {
    for (let i = 0; i < this.tbody.nativeElement.rows.length; i++) {
      this.tbody.nativeElement.rows[i].classList.remove('seleccionado');
    }
    this.tbody.nativeElement.rows[indice].classList.add('seleccionado');
    this.almacenSeleccionado.grupo = 'CDG-100';
    this.almacenSeleccionado.saldoUU = 2;
  }

}
