import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-modal-confirmacion',
  templateUrl: './modal-confirmacion.component.html',
  styleUrls: ['./modal-confirmacion.component.css']
})
export class ModalConfirmacionComponent implements OnInit {

  @Input() mensaje: string = '';

  constructor(private modal: NzModalRef) { }

  ngOnInit(): void {
  }

  cerrarModal(): void {
    this.modal.close();
  }

}
