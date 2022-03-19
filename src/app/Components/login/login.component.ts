import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Usuario } from '../../Models/Usuario'
import { DialogView } from '../notificacion/dialogView';
import { GlobalsService } from 'src/app/Services/globals.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  title = 'Subdistribuidores';

  loginForm = new FormGroup({
    usuario: new FormControl('',[Validators.required]),
    contrasena: new FormControl('', [Validators.required])
  });

  public constructor(
    private titleService: Title, 
    private router: Router, 
    private http: HttpClient,
    private dialog: MatDialog,
    private globalService: GlobalsService) 
  { 
    this.titleService.setTitle('Login');
    if(localStorage.getItem('usuario') !== null) {
      this.router.navigate(['/home/articulos']);
    }
  }

  login(): void {
    if (this.loginForm.valid) {
      const UsuarioLogin: Usuario = {
        esAdmin: true
      };

      this.http.post<any>(this.globalService.urlAPI +  'Usuarios/LoginSD', {email: this.usuario?.value, password: this.contrasena?.value}).subscribe({
        next: data => {
          UsuarioLogin.token = data.token;
          UsuarioLogin.cliente = data.cliente;
          localStorage.setItem('usuario', JSON.stringify(UsuarioLogin));
          location.reload();
        },
        error: err => {
          if(err.status === 0) {
            this.dialog.open(DialogView, {
              width: '250px',
              data: {titulo: 'Error', mensaje: 'Ocurrio un error al conectarse con el servidor'}
            })
          } else if (err.status === 400) {
            this.dialog.open(DialogView, {
              width: '250px',
              data: {titulo: 'Acceso denegado', mensaje: 'Por favor verifique que sus datos sean correctos'}
            })
          }
        }
      })
      
    } else {
      let dialogRef = this.dialog.open(DialogView, {
        width: '250px',
        data: {titulo: 'Error', mensaje: 'Por favor complete todos los campos'}
      })
    }
  }

  restablecerContrasena(): void {
  }

  get usuario() { return this.loginForm.get('usuario'); }
  get contrasena() { return this.loginForm.get('contrasena'); }

}
