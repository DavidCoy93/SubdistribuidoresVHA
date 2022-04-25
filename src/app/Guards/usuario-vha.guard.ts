import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Usuario } from '../Models/Usuario';
import { GlobalsService } from '../Services/globals.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioVHAGuard implements CanActivate {

  usuarioLogueado: Usuario = {};

  constructor(private globlaService: GlobalsService, private router: Router) {
    this.usuarioLogueado = this.globlaService.UsuarioLogueado;
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(!this.usuarioLogueado.esUsuarioVHA) {
      return this.router.navigate(['/login']).then(() => false);
    } else {
      return true
    }
  }
  
}
