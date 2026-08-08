import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvConfigService } from 'src/app/core/services/env-config.service';


export interface Paginado<T> {
  data: T[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class ControleService {
  private get baseUrl(): string {
    return this.config.baseUrl;
  }

  constructor(
    private http: HttpClient,
    private config: EnvConfigService
  ) { }

  public getDados(path: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${path}`);
  }

  public postDados(path: string, body: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}${path}`, body);
  }

  public uploadArquivo(path: string, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}${path}/upload`, formData);
  }

  public putDados(path: string, id: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}${path}/${id}`, body);
  }

  /**
   * PUT para uma sub-rota de acao que nao segue o padrao {path}/{id}
   * (ex: 'api/matriculas/5/confirmar'). Usado para acoes de negocio
   * pontuais como confirmar/cancelar matricula.
   */
  public putAcao(path: string, body: any = {}): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}${path}`, body);
  }

  public deleteDados(path: string, id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}${path}/${id}`);
  }

  public deleteMultiploDados(path: string, ids: number[]): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}${path}`, {
      body: ids,
    });
  }

  /**
   * GET paginado: page (0-based), size, sortField, sortOrder e filter
   */
  public getPaginado<T>(
    path: string,
    page: number,
    size: number,
    sortField?: string,
    sortOrder?: number,
    filter?: string
  ): Observable<Paginado<T>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (sortField) params = params.set('sortField', sortField);
    if (sortOrder != null) params = params.set('sortOrder', sortOrder.toString());
    if (filter) params = params.set('filter', filter);

    return this.http.get<Paginado<T>>(
      `${this.baseUrl}${path}`,
      { params }
    );
  }
}
