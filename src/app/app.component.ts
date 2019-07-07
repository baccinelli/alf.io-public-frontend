import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { I18nService } from './shared/i18n.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnDestroy {

  private langChangeSub : Subscription;

  constructor(translate: TranslateService, i18nService: I18nService, private router: Router) {
    translate.setDefaultLang('en');

    this.langChangeSub = translate.onLangChange.subscribe(langChange => {
      document.getElementsByTagName("html")[0].setAttribute('lang', langChange.lang);
      i18nService.persistLanguage(langChange.lang);
    });
  }

  public ngOnDestroy(): void {
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
  }
}
