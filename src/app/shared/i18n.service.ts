import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, zip } from 'rxjs';
import { Language } from '../model/event';
import { LocalizedCountry } from '../model/localized-country';
import { Title } from '@angular/platform-browser';
import { TranslateService, TranslateLoader } from '@ngx-translate/core';
import { Router, NavigationStart } from '@angular/router';
import { map, mergeMap, shareReplay, catchError, share } from 'rxjs/operators';
import { EventService } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class I18nService {


  private applicationLanguages: Observable<Language[]>;

  constructor(
    private http: HttpClient,
    private title: Title,
    private translateService: TranslateService,
    private router: Router,
    private customLoader: CustomLoader,
    private eventService: EventService) { }

  getCountries(locale: string): Observable<LocalizedCountry[]> {
    return this.http.get<LocalizedCountry[]>(`/api/v2/public/i18n/countries/${locale}`);
  }

  getVatCountries(locale: string): Observable<LocalizedCountry[]> {
    return this.http.get<LocalizedCountry[]>(`/api/v2/public/i18n/countries-vat/${locale}`);
  }

  getEUVatCountries(locale: string): Observable<LocalizedCountry[]> {
    return this.http.get<LocalizedCountry[]>(`/api/v2/public/i18n/eu-countries-vat/${locale}`);
  }

  getAvailableLanguages(): Observable<Language[]> {
    if (!this.applicationLanguages) {
      this.applicationLanguages = this.http.get<Language[]>(`/api/v2/public/i18n/languages`).pipe(shareReplay(1));
    }
    return this.applicationLanguages;
  }

  setPageTitle(titleCode: string, eventName: string): void {

    const obs = this.translateService.stream(titleCode, {'0': eventName});

    const titleSub =  obs.subscribe(res => {
      this.title.setTitle(res);
    });

    const routerSub = this.router.events.subscribe(ev => {
      if (ev instanceof NavigationStart) {
        routerSub.unsubscribe();
        titleSub.unsubscribe();
        this.title.setTitle(null);
      }
    });
  }

  persistLanguage(lang: string): void {
    window.sessionStorage['ALFIO_LANG'] = lang;
  }

  getPersistedLanguage(): string {
    return window.sessionStorage['ALFIO_LANG'];
  }

  getCurrentLang(): string {
    return this.translateService.currentLang;
  }

  useTranslation(eventShortName: string, lang: string): Observable<boolean> {
    const overrideBundle = eventShortName ? this.eventService.getEvent(eventShortName).pipe(catchError(e => of({i18nOverride: {}})), map(e => e.i18nOverride[lang] || {})) : of({});
    return zip(this.customLoader.getTranslation(lang), overrideBundle).pipe(mergeMap(([root, override]) => {
      this.translateService.setTranslation(lang, root, false);
      this.translateService.setTranslation(lang, override, true);
      this.translateService.use(lang);
      return of(true);
    }));
  }
}

const translationCache: {[key: string]: Observable<any>} = {};

@Injectable({providedIn: 'root'})
export class CustomLoader implements TranslateLoader {

  constructor(private http: HttpClient) {
  }

  getTranslation(lang: string): Observable<any> {
    if (!translationCache[lang]) {
      const preloadBundle = document.getElementById('preload-bundle')
      if (preloadBundle && preloadBundle.getAttribute('data-param') === lang) {
        translationCache[lang] = of(JSON.parse(preloadBundle.textContent)).pipe(shareReplay(1));
      } else {
        translationCache[lang] = this.http.get(`/api/v2/public/i18n/bundle/${lang}`).pipe(shareReplay(1));
      }
    }
    return translationCache[lang];
  }
}
