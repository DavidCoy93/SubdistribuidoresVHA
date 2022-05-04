import { Injectable } from '@angular/core';
import { Usuario } from '../Models/Usuario';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {

  public urlAPI: string = environment.UrlAPI;
  public KeyEncrypt: string = 'VHASD2022';
  public ivEncrypt: string = 'VHASD2022';
  public urlImages: string = 'assets/img/IMAGENES_MODULO_DE_VENTAS/';
  public UsuarioLogueado: Usuario = {};
  public familiaArticulo: string = 'TODAS';
  public lineaArticulo: string = 'TODAS';
  public impuesto: number = environment.impuestoActual;
  public urlRestablecerContrasena: string = environment.urlRestablecerContrasena;
  
  constructor() { 
    const usuarioLocal: any =  localStorage.getItem('usuario');
    this.UsuarioLogueado = JSON.parse(usuarioLocal);
  }
}
