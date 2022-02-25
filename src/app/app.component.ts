import { Component, OnDestroy } from '@angular/core';
import { LoaderService } from './Services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'subdistribuidores-vha';
  cargando: boolean = false;

  constructor(public _loaderService: LoaderService) {
    this._loaderService.isLoading.subscribe(isLoading => {
      this.cargando = isLoading;
    })
  }
}