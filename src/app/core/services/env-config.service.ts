import { Injectable } from '@angular/core';
import { environment as buildEnv } from '../../../environments/environment';

/**
 * Permite sobrescrever a baseUrl da API em tempo de execucao (via um
 * pequeno arquivo env.js injetado no container, que define window.__env),
 * sem precisar rebuildar o bundle Angular para cada ambiente. Se nao houver
 * override em runtime, usa o valor definido em build-time (environment.ts).
 */
declare global {
  interface Window {
    __env?: Partial<{
      production: boolean;
      baseUrl: string;
      [key: string]: any;
    }>;
  }
}

@Injectable({ providedIn: 'root' })
export class EnvConfigService {
  private readonly runtime = window.__env ?? {};
  private readonly build = buildEnv;

  get production(): boolean {
    return typeof this.runtime.production === 'boolean'
      ? this.runtime.production
      : this.build.production;
  }

  get baseUrl(): string {
    const rt = this.runtime.baseUrl;
    if (rt && !rt.includes('${')) {
      return rt;
    }
    return this.build.baseUrl;
  }

  get<T = any>(key: string): T | undefined {
    return this.runtime[key] ?? (this.build as any)[key];
  }
}
