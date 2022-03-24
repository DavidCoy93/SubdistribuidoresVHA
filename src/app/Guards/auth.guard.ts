import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanDeactivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Usuario } from '../Models/Usuario';
import { GlobalsService } from '../Services/globals.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  usuarioLogueado: Usuario = {};

  constructor(private router: Router, private globalService: GlobalsService){
    this.usuarioLogueado = this.globalService.UsuarioLogueado;
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if(localStorage.getItem('usuario') === null) {
        return this.router.navigate(['/login']).then(() => false);
      } else {
        return true;
      }
      
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if(!this.usuarioLogueado.esAdmin && childRoute.url[0].path === 'solicitudes') {
      return this.router.navigate(['/home']).then(() => false);
    } else {
      return true;
    }      
  }
}
