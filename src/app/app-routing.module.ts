import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArticulosComponent } from './Components/articulos/articulos.component';
import { CarritoComponent } from './Components/carrito/carrito.component';
import { DescuentosSolicitudesComponent } from './Components/descuentos-solicitudes/descuentos-solicitudes.component';
import { DetalleArticuloComponent } from './Components/detalle-articulo/detalle-articulo.component';
import { HomeComponent } from './Components/home/home.component';
import { LoginComponent } from './Components/login/login.component';
import { MisOrdenesSolicitudesComponent } from './Components/mis-ordenes-solicitudes/mis-ordenes-solicitudes.component';
import { SolicitudesAgenteComponent } from './Components/solicitudes-agente/solicitudes-agente.component';
import { AuthGuard } from './Guards/auth.guard';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'home', redirectTo: '/home/articulos', pathMatch: 'full'},
  {path: 'home', canActivate: [AuthGuard], canActivateChild: [AuthGuard], component: HomeComponent,
    children: [
      {path: 'articulos', component: ArticulosComponent},
      {path: 'articulo/:id', component: DetalleArticuloComponent},
      {path: 'carrito', component: CarritoComponent},
      {path: 'solicitudes_agentes', component: SolicitudesAgenteComponent},
      {path: 'ordenes_solicitudes', component: MisOrdenesSolicitudesComponent},
      {path: 'carrito/:idSolicitud', component: CarritoComponent}
    ]
  },
  {path: 'descuentos_solicitudes', component: DescuentosSolicitudesComponent},
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: '**', redirectTo: '/login', pathMatch: 'full'}
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
