import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { LoaderService } from './loader.service';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  private requests: HttpRequest<any>[] = [];

  constructor(private loaderService: LoaderService) { }

  removeRequest(req: HttpRequest<any>): void {
    const i = this.requests.indexOf(req);
    
    if (i >= 0) {
      this.requests.splice(i, 1);
    }
    this.loaderService.isLoading.next(this.requests.length > 0);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    this.requests.push(req);

    this.loaderService.isLoading.next(true);

    return next.handle(req).pipe(
      tap(evt =>{
        if (evt instanceof HttpResponse) {
          if (evt.ok) {
            this.removeRequest(req);
          }
        }
      }),
      catchError((err: HttpErrorResponse) => {
        this.removeRequest(req);
        return throwError(() => err);
      }),
    );
  }
}
