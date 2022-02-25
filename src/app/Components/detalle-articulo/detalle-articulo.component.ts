import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewsService } from 'src/app/Services/views.service';

@Component({
  selector: 'app-detalle-articulo',
  templateUrl: './detalle-articulo.component.html',
  styleUrls: ['./detalle-articulo.component.css']
})
export class DetalleArticuloComponent implements OnInit {

  idArticulo: string|null;

  constructor(private route: ActivatedRoute, private router: Router, private viewsService: ViewsService) { 
    this.idArticulo = this.route.snapshot.paramMap.get('id');
    this.viewsService.verArticulos.next(false);
    this.viewsService.verCarrito.next(false);
  }


  public ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

}
