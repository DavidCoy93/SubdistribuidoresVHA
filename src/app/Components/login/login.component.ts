import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  title = 'Subdistribuidores VHA';
  email = new FormControl('',[Validators.required, Validators.email]);
  contrasena = new FormControl('', [Validators.required])
  hide = true;

  public constructor(private titleService: Title) { 
    this.titleService.setTitle('Login');
  }

  getEmailError() : string {
    if (this.email.hasError('required')){
      return 'Debe ingresar un correo'
    } 

    return (this.email.hasError('email')) ? 'Ingrese un correo valido' : '';
  }

  
  ngOnInit(): void {
    
  }

}
