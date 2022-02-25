import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetalleArticuloComponent } from './Components/detalle-articulo/detalle-articulo.component';
import { HomeComponent } from './Components/home/home.component';
import { LoginComponent } from './Components/login/login.component';
import { AuthGuard } from './Guards/auth.guard';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  { path: 'home', 
    canActivate: [AuthGuard], 
    component: HomeComponent,
    children: [
      {path: 'articulo/:id', component: DetalleArticuloComponent}
    ]
  },
  {path: '', redirectTo: '/login', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
