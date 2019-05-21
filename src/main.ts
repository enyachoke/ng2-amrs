import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
if (environment.production) {
  enableProdMode();
}

// platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.log(err));
platformBrowserDynamic().bootstrapModule(AppModule).then(() => {
  if ('serviceWorker' in navigator && environment.production) {
    navigator.serviceWorker.register('./combined-worker.js');
    navigator.serviceWorker.ready.then(function (swRegistration) {
      return swRegistration.sync.register('firstPatientSync');
    });
    navigator.serviceWorker.ready.then(function (swRegistration) {
      return swRegistration.sync.register('firstMetaDataSync');
    });
  }
}).catch(err => console.log(err));
