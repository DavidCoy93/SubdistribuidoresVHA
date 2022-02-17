import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Usuario } from '../../Models/Usuario'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  title = 'Subdistribuidores';
  
  usuario = new FormControl('',[Validators.required, Validators.email]);
  contrasena = new FormControl('', [Validators.required])
  hide = true;

  public constructor(private titleService: Title, private router: Router) { 
    this.titleService.setTitle('Login');
    if(localStorage.getItem('usuario') !== null) {
      this.router.navigate(['/home']);
    }
  }

  getEmailError() : string {
    if (this.usuario.hasError('required')){
      return 'Debe ingresar un correo';
    } 

    return (this.usuario.hasError('email')) ? 'Ingrese un correo valido' : '';
  }

  login(): void {
    const UsuarioLogin: Usuario = {
      correo: this.usuario.value,
      contrasena: this.contrasena.value,
      esAsesor: true
    };

    localStorage.setItem('usuario', JSON.stringify(UsuarioLogin));
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    
  }

}
