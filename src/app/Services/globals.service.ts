import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {

  public urlImagenes: string = 'assets/img/piso-vitromex-napa-04352041320.jpg';
  public urlAPI: string = 'https://pruebas2.vitrohogar.com.mx:4434';
  public KeyEncrypt: string = 'VHASD2022';
  public ivEncrypt: string = 'VHASD2022';

  
  constructor() { }
}
