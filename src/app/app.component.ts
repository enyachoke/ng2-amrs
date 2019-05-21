import { Component, ViewEncapsulation, OnInit } from '@angular/core';

import { AppState } from './app.service';
import { LicenseManager } from 'ag-grid-enterprise/main';


import { DataCacheService } from './shared/services/data-cache.service';
import { PouchdbService } from './pouchdb-service/pouchdb.service';
import { OfflineSyncMetricsService } from './shared/services/offline-sync-metrics.service';
import { UserDefaultPropertiesService } from './user-default-properties/user-default-properties.service';


export const AgGridLicence: any = undefined;
@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  public title = 'Ampath POC';
  private routes: any[];
  constructor(public appState: AppState,
    public dataCache: DataCacheService,
    private pouchdbservice: PouchdbService, private offlineSyncMetricsService: OfflineSyncMetricsService) {
    this.setUpAgGridLicense();
  }

  public ngOnInit() {
    this.dataCache.setDefaulTime(60 * 5);
    this.dataCache.clearExpired();
    this.setupOfflineSync();


  }

  public setUpAgGridLicense() {
    if (AgGridLicence) {
      // console.error('AG Grid License', AgGridLicence);
      LicenseManager.setLicenseKey(AgGridLicence);
    }
  }

  public setupOfflineSync() {
    this.pouchdbservice.getChanges().subscribe((changes) => {
      this.pouchdbservice.triggerPull();
    });
    this.pouchdbservice.getMetadataChanges().subscribe((changes) => {
      this.pouchdbservice.triggerMetadataPull();
    });
    this.setupScheduledSyncCheck();
    this.networkStatusListener();
    this.setupSyncMetrics();
  }

  public setupSyncMetrics() {
    this.offlineSyncMetricsService.storageUsage().subscribe((storage) => {
      if (storage) {
        this.pouchdbservice.saveMetrics(storage);
      }

    });

    this.offlineSyncMetricsService.messageListener().subscribe((message) => {
      if (message) {
        this.pouchdbservice.saveMetrics(message);
      }
    });

  }

  public networkStatusListener() {
    const that = this;
    window.addEventListener('online', function (e) {
      console.log('Online Trigger sync');
      that.pouchdbservice.triggerSyncAll();
      // Re-sync data with server.
    }, false);
    window.addEventListener('offline', function (e) {
      const message = {
        type: 'offlineState',
        time: new Date()
      };
      that.pouchdbservice.saveMetrics(message);
    }, false);
  }

  setupScheduledSyncCheck() {
    const minutes = 1, the_interval = minutes * 60 * 1000;
    const that = this;
    setInterval(function () {
      console.log('Call SYNC');
      that.pouchdbservice.triggerSyncAll();
    }, the_interval);
  }

}
