import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './Components/login/login.component';
import { HomeComponent } from './Components/home/home.component';
import { DetalleArticuloComponent } from './Components/detalle-articulo/detalle-articulo.component';
import { ArticulosComponent } from './Components/articulos/articulos.component';
import { CarritoComponent } from './Components/carrito/carrito.component';
import { DialogView } from './Components/notificacion/dialogView';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorIntlSpanish } from './Utilidades/spanish-paginator';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es-US';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ngxLoadingAnimationTypes, NgxLoadingModule } from 'ngx-loading';
import { InterceptorService } from './Services/interceptor.service';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { MatRadioModule, MAT_RADIO_DEFAULT_OPTIONS } from '@angular/material/radio';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzTagModule }  from 'ng-zorro-antd/tag';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { SolicitudesAgenteComponent } from './Components/solicitudes-agente/solicitudes-agente.component';
import { ModalDisponiblesAlmacenComponent } from './Components/modal-disponibles-almacen/modal-disponibles-almacen.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NzImageModule } from 'ng-zorro-antd/image';
import { TotalSolicitudOrdenComponent } from './Components/total-solicitud-orden/total-solicitud-orden.component';
import { MisOrdenesSolicitudesComponent } from './Components/mis-ordenes-solicitudes/mis-ordenes-solicitudes.component';
import { NzListModule } from 'ng-zorro-antd/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DescuentosSolicitudesComponent } from './Components/descuentos-solicitudes/descuentos-solicitudes.component';
import { MatAutocompleteModule  } from '@angular/material/autocomplete';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { ModalEmbarqueComponent } from './Components/modal-embarque/modal-embarque.component';
import { ModalConfirmacionComponent } from './Components/modal-confirmacion/modal-confirmacion.component';
import { ModalSucursalesClienteComponent } from './Components/modal-sucursales-cliente/modal-sucursales-cliente.component';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NgSelectModule } from '@ng-select/ng-select';

registerLocaleData(es, 'es');

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    ArticulosComponent,
    CarritoComponent,
    DialogView,
    DetalleArticuloComponent,
    SolicitudesAgenteComponent,
    ModalDisponiblesAlmacenComponent,
    TotalSolicitudOrdenComponent,
    MisOrdenesSolicitudesComponent,
    DescuentosSolicitudesComponent,
    ModalEmbarqueComponent,
    ModalConfirmacionComponent,
    ModalSucursalesClienteComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCardModule,
    FontAwesomeModule,
    MatIconModule,
    MatBadgeModule,
    FormsModule,
    MatToolbarModule,
    MatInputModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatMenuModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSelectModule,
    NgbModule,
    FlexLayoutModule,
    ZXingScannerModule,
    HttpClientModule,
    NgxLoadingModule.forRoot({animationType: ngxLoadingAnimationTypes.circleSwish, primaryColour: 'red'}),
    MatExpansionModule,
    NzBackTopModule,
    NzPageHeaderModule,
    NzDescriptionsModule,
    NzAlertModule,
    NzCarouselModule,
    MatRadioModule,
    NzResultModule,
    NzButtonModule,
    NzCardModule,
    NzIconModule,
    NzMessageModule,
    NzTagModule,
    NzSelectModule,
    NzModalModule,
    MatCheckboxModule,
    NzImageModule,
    NzListModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NzToolTipModule,
    MatAutocompleteModule,
    NzInputNumberModule,
    NzDrawerModule,
    NgSelectModule
  ],
  providers: [
    Title,
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlSpanish },
    { provide: NZ_I18N, useValue: en_US },
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
    { provide: MAT_RADIO_DEFAULT_OPTIONS, useValue: { color: 'warn' }},
    { provide: LOCALE_ID, useValue: 'es'}

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
