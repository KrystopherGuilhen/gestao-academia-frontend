import { Injectable, effect, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface AppConfig {
    inputStyle: string;
    colorScheme: string;
    theme: string;
    ripple: boolean;
    menuMode: string;
    scale: number;
}

interface LayoutState {
    staticMenuDesktopInactive: boolean;
    overlayMenuActive: boolean;
    profileSidebarVisible: boolean;
    configSidebarVisible: boolean;
    staticMenuMobileActive: boolean;
    menuHoverActive: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class LayoutService {
    _config: AppConfig = {
        ripple: false,
        inputStyle: 'outlined',
        menuMode: 'static',
        colorScheme: 'light',
        theme: 'lara-light-indigo',
        scale: 14,
    };

    config = signal<AppConfig>(this._config);

    state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        profileSidebarVisible: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false,
    };

    private configUpdate = new Subject<AppConfig>();

    private overlayOpen = new Subject<any>();

    configUpdate$ = this.configUpdate.asObservable();

    overlayOpen$ = this.overlayOpen.asObservable();

    private static readonly DARK_THEME = 'lara-dark-indigo';
    private static readonly LIGHT_THEME = 'lara-light-indigo';
    private static readonly STORAGE_KEY = 'colorScheme';

    constructor() {
        this.loadPersistedTheme();

        effect(() => {
            const config = this.config();
            this.changeTheme();
            this.changeScale(config.scale);
            this.onConfigUpdate();
        });
    }

    onMenuToggle() {
        if (this.isOverlay()) {
            this.state.overlayMenuActive = !this.state.overlayMenuActive;
            if (this.state.overlayMenuActive) {
                this.overlayOpen.next(null);
            }
        }

        if (this.isDesktop()) {
            this.state.staticMenuDesktopInactive =
                !this.state.staticMenuDesktopInactive;
        } else {
            this.state.staticMenuMobileActive =
                !this.state.staticMenuMobileActive;

            if (this.state.staticMenuMobileActive) {
                this.overlayOpen.next(null);
            }
        }
    }

    showProfileSidebar() {
        this.state.profileSidebarVisible = !this.state.profileSidebarVisible;
        if (this.state.profileSidebarVisible) {
            this.overlayOpen.next(null);
        }
    }

    showConfigSidebar() {
        this.state.configSidebarVisible = true;
    }

    isOverlay() {
        return this.config().menuMode === 'overlay';
    }

    isDesktop() {
        return window.innerWidth > 991;
    }

    isMobile() {
        return !this.isDesktop();
    }

    onConfigUpdate() {
        this._config = { ...this.config() };
        this.configUpdate.next(this.config());
    }

    /**
     * Alterna entre o tema claro e escuro (Lara Indigo, claro/escuro), e
     * lembra a escolha do usuario para as proximas visitas.
     */
    toggleDarkMode(): void {
        const escuro = !this.isDarkMode;
        const novoEsquema = escuro ? 'dark' : 'light';
        const novoTema = escuro ? LayoutService.DARK_THEME : LayoutService.LIGHT_THEME;

        localStorage.setItem(LayoutService.STORAGE_KEY, novoEsquema);

        this.config.update((config) => ({
            ...config,
            theme: novoTema,
            colorScheme: novoEsquema,
        }));
    }

    get isDarkMode(): boolean {
        return this.config().colorScheme === 'dark';
    }

    private loadPersistedTheme(): void {
        const preferencia = localStorage.getItem(LayoutService.STORAGE_KEY);
        if (preferencia === 'dark') {
            this.config.set({
                ...this._config,
                theme: LayoutService.DARK_THEME,
                colorScheme: 'dark',
            });
        }
    }

    /**
     * Monta o href do tema a partir do bundle gerado pelo proprio Angular CLI
     * (registrado em angular.json > styles, com "inject": false e um
     * "bundleName" igual ao nome do tema). Isso evita depender de um caminho
     * cru dentro de assets/, que se mostrou fragil (a copia estatica de
     * assets podia nao coincidir com o que o dev-server/build realmente
     * serve em certas configuracoes).
     */
    changeTheme() {
        const config = this.config();
        const newHref = `${config.theme}.css`;
        this.replaceThemeLink(newHref);
    }

    replaceThemeLink(href: string) {
        const id = 'theme-css';
        const themeLink = <HTMLLinkElement>document.getElementById(id);

        if (!themeLink) {
            console.warn(`[LayoutService] Elemento <link id="${id}"> nao encontrado no index.html; nao foi possivel trocar o tema.`);
            return;
        }

        if (themeLink.getAttribute('href') === href) {
            return; // ja esta no tema correto, nada a fazer
        }

        themeLink.setAttribute('href', href);
    }

    changeScale(value: number) {
        document.documentElement.style.fontSize = `${value}px`;
    }
}
