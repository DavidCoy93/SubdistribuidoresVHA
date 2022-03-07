import { HttpClient, HttpEvent } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ViewsService } from 'src/app/Services/views.service';
import { Usuario } from '../../Models/Usuario'
import { DialogView } from '../notificacion/dialogView';
import * as CryptoJS from 'crypto-js';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  title = 'Subdistribuidores';

  loginForm = new FormGroup({
    usuario: new FormControl('',[Validators.required]),
    contrasena: new FormControl('', [Validators.required])
  })
  
  
  hide = true;

  public constructor(
    private titleService: Title, 
    private router: Router, 
    private http: HttpClient,
    private dialog: MatDialog,
    private viewService: ViewsService,
    private globalService: GlobalsService) 
  { 
    this.titleService.setTitle('Login');
    if(localStorage.getItem('usuario') !== null) {
      this.router.navigate(['/home']);
    }
  }

  

  login(): void {
    if (this.loginForm.valid) {
      const UsuarioLogin: Usuario = {
        correo: this.usuario?.value,
        contrasena: this.contrasena?.value,
        esAdmin: true
      };

      this.http.post<any>('https://localhost:44338/api/Usuarios/LoginSD', {email: UsuarioLogin.correo, password: UsuarioLogin.contrasena}).subscribe({
        next: data => {
          UsuarioLogin.token = data.token
          this.viewService.verArticulos.next(true);
          this.viewService.verCarrito.next(false);
          this.router.navigate(['/home']);
          localStorage.setItem('usuario', JSON.stringify(UsuarioLogin));
        },
        error: err => {
          let dialogError = this.dialog.open(DialogView, {
            width: '250px',
            data: {titulo: 'Error', mensaje: 'El número de empleado o correo electrónico es incorrecto. Favor de validar su información'}
          });
        }
      })
      
    } else {
      let dialogRef = this.dialog.open(DialogView, {
        width: '250px',
        data: {titulo: 'Error', mensaje: 'Por favor complete todos los campos'}
      })
    }
  }

  ngOnInit(): void {
  }

  restablecerContrasena(): void {
    let key = CryptoJS.enc.Utf8.parse(this.globalService.KeyEncrypt);
    let iv = CryptoJS.enc.Utf8.parse(this.globalService.ivEncrypt);

    const fechaActual: Date = new Date();
    let fechaExpiracion = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), fechaActual.getHours() + 1, fechaActual.getMinutes(), fechaActual.getSeconds());

    let encryptedDate = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(fechaExpiracion.toJSON()), key,
      {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    )

    alert(encryptedDate.toString());
  }

  get usuario() { return this.loginForm.get('usuario'); }
  get contrasena() { return this.loginForm.get('contrasena'); }

}
