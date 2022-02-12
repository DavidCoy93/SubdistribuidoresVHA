import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArticulosComponent } from './Components/articulos/articulos.component';
import { CarritoComponent } from './Components/carrito/carrito.component';
import { HomeComponent } from './Components/home/home.component';
import { LoginComponent } from './Components/login/login.component';
import { AuthGuard } from './Guards/auth.guard';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  { path: 'home', 
    canActivate: [AuthGuard], 
    component: HomeComponent
  },
  {path: '', redirectTo: '/login', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
