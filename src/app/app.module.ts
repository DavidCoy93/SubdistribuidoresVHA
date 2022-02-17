import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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
import { MatDialogModule } from '@angular/material/dialog';
import { LoginComponent } from './Components/login/login.component';
import { HomeComponent } from './Components/home/home.component';
import { ArticulosComponent } from './Components/articulos/articulos.component';
import { MatPaginatorIntlSpanish } from './Utilidades/spanish-paginator';
import { CarritoComponent } from './Components/carrito/carrito.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { DialogView } from './Components/notificacion/dialogView';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { HttpClientModule } from '@angular/common/http';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    ArticulosComponent,
    CarritoComponent,
    DialogView
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
    NgbModule,
    FlexLayoutModule,
    ZXingScannerModule,
    HttpClientModule
  ],
  providers: [
    Title,
    {provide: MatPaginatorIntl, useClass: MatPaginatorIntlSpanish},
    { provide: NZ_I18N, useValue: en_US }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
