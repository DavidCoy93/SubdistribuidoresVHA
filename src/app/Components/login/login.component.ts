import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Usuario } from '../../Models/Usuario'
import { DialogView } from '../notificacion/dialogView';

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
    private dialog: MatDialog) 
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
  
      localStorage.setItem('usuario', JSON.stringify(UsuarioLogin));
      this.router.navigate(['/home']);
    } else {
      let dialogRef = this.dialog.open(DialogView, {
        width: '250px',
        data: {titulo: 'Error', mensaje: 'Por favor complete todos los campos'}
      })
    } 
  }

  ngOnInit(): void {
  }

  get usuario() { return this.loginForm.get('usuario'); }
  get contrasena() { return this.loginForm.get('contrasena'); }

}
