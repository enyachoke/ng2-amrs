import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { v4 as uuid } from 'uuid';

(window as any).global = window;
import * as PouchDB from 'pouchdb/dist/pouchdb';
PouchDB.plugin(require('pouchdb-upsert'));


import { environment } from '../../environments/environment';
import { UserDefaultPropertiesService } from '../user-default-properties/user-default-properties.service';

@Injectable()
export class PouchdbService {
  authKey = 'auth.credentials';

  constructor(private propertyLocationService: UserDefaultPropertiesService) {
  }


  getChanges() {
    const auth = window.sessionStorage.getItem(this.authKey);
    const credentials = this.decodeAuth(auth);
    const changes = new BehaviorSubject<any>({});
    const currentOfflineLocation = JSON.parse(this.propertyLocationService.getUserProperty('offlineLocation'));
    if (currentOfflineLocation) {
      // tslint:disable-next-line:max-line-length
      const db = new PouchDB(`https://${credentials.username}:${credentials.password}@couchdb.ampath.or.ke/db-${currentOfflineLocation.uuid}`);
      db.changes({
        since: 'now',
        live: true
      }).on('change', function (change) {
        // console.log('Change', change);
        // handle change
        changes.next(change);
      }).on('complete', function (info) {
        // changes() was canceled
      }).on('error', function (err) {
        console.log(err);
        changes.error(err);
      });
    }
    return changes;
  }

  decodeAuth(base64Credentials) {
    const credDecoded = atob(base64Credentials);
    // credentials = username:password
    const credArray = credDecoded.split(':', 2);
    const username = credArray[0];
    const password = credArray[1];
    const credentials = {
      username,
      password
    };
    return credentials;
  }

  getMetadataChanges() {
    const auth = window.sessionStorage.getItem(this.authKey);
    const credentials = this.decodeAuth(auth);
    const changes = new BehaviorSubject<any>({});
    const db = new PouchDB(`https://${credentials.username}:${credentials.password}@couchdb.ampath.or.ke/openmrs-metadata`);
    db.changes({
      since: 'now',
      live: true
    }).on('change', function (change) {
      // console.log('Change', change);
      // handle change
      changes.next(change);
    }).on('complete', function (info) {
      // changes() was canceled
    }).on('error', function (err) {
      console.log(err);
      changes.error(err);
    });
    return changes;
  }

  triggerPull() {
    if ('serviceWorker' in navigator && environment.production && navigator.serviceWorker.controller) {
      const currentOfflineLocation = JSON.parse(this.propertyLocationService.getUserProperty('offlineLocation'));
      const offlineSyncActive = JSON.parse(this.propertyLocationService.getUserProperty('offlineSyncActive'));
      if (currentOfflineLocation && offlineSyncActive) {
        const auth = window.sessionStorage.getItem(this.authKey);
        navigator.serviceWorker.controller.postMessage({
          type: 'normalPatientSync',
          auth,
          location: `db-${currentOfflineLocation.uuid}`
        });
      }
    }
  }

  triggerMetadataPull() {
    if ('serviceWorker' in navigator && environment.production && navigator.serviceWorker.controller) {
      // navigator.serviceWorker.ready.then(function (swRegistration) {
      //   return swRegistration.sync.register('normalMetaDataSync');
      // });
      const auth = window.sessionStorage.getItem(this.authKey);
      navigator.serviceWorker.controller.postMessage({
        type: 'normalMetaDataSync',
        auth
      });
    }
  }

  triggerPushMetrics() {
    const auth = window.sessionStorage.getItem(this.authKey);
    if ('serviceWorker' in navigator && environment.production && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'pushMetrics',
        auth
      });
    }
  }

  triggerSyncAll() {
    this.triggerMetadataPull();
    this.triggerPull();
    this.triggerPushMetrics();
  }

  saveMetrics(data) {
    const currentOfflineLocation = JSON.parse(this.propertyLocationService.getUserProperty('offlineLocation'));
    const auth = window.sessionStorage.getItem(this.authKey);
    const credentials = this.decodeAuth(auth);
    data.username = credentials.username;
    data.currentOfflineLocation = currentOfflineLocation;
    const metricsDb = new PouchDB('metrics_db');
    data._id = uuid();
    const that = this;
    metricsDb.put(data).then(function (response) {
      that.triggerPushMetrics();
    }).catch(function (err) {
      console.log(err);
    });
  }

}
