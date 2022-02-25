import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewsService {

  public verArticulos = new BehaviorSubject(true);
  public verCarrito = new BehaviorSubject(false);

  constructor() { }
}
