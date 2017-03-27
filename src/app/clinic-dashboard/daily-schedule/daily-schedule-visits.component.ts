import { Component, OnInit, OnChanges, Input, SimpleChange, EventEmitter } from '@angular/core';
import { ClinicDashboardCacheService } from '../services/clinic-dashboard-cache.service';
import {
  DailyScheduleResourceService
} from
  '../../etl-api/daily-scheduled-resource.service';
import { BehaviorSubject, Subscription } from 'rxjs/Rx';
import * as Moment from 'moment';
@Component({
  selector: 'daily-schedule-visits',
  templateUrl: './daily-schedule-visits.component.html',
  styleUrls: ['./daily-schedule.component.css']
})
export class DailyScheduleVisitsComponent implements OnInit, OnChanges {

  @Input() selectedDate: any;
  errors: any[] = [];
  dailyVisitsPatientList: any[] = [];
  loadingDailyVisits: boolean = false;
  dataLoaded: boolean = false;
  currentTabLoaded: boolean = false;
  selectedVisitTab: any;
  nextStartIndex: number = 0;
  @Input() tab: any;
  @Input() newList: any;

  @Input()
  set options(value) {
    this._data.next(value);
  }
  get options() {
    return this._data.getValue();
  }
  private _data = new BehaviorSubject<any>([]);
  private selectedClinic: any;
  private currentClinicSubscription: Subscription;
  private selectedDateSubscription: Subscription;
  private visitsSubscription: Subscription;
  constructor(private clinicDashboardCacheService: ClinicDashboardCacheService,
    private dailyScheduleResource: DailyScheduleResourceService) {
  }

  ngOnInit() {
    this.selectedDate = Moment().format('YYYY-MM-DD');
    this.currentClinicSubscription = this.clinicDashboardCacheService.getCurrentClinic()
      .subscribe((location) => {
        this.selectedClinic = location;
        let params = this.getQueryParams(this.selectedDate, this.selectedClinic);
        if (this.selectedClinic) {
          this.selectedDateSubscription = this.clinicDashboardCacheService.
            getDailyTabCurrentDate().subscribe((date) => {
              this.selectedDate = date;
              this.initParams();
              this.getDailyVisits(params);
            });

        }
      });
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (let propName in changes) {
      if (propName !== 'selectedDate') {
        continue;
      }
      let changedProp = changes[propName];
      let newDate = changedProp.currentValue;
      if (!changedProp.isFirstChange()) {
        let params = this.getQueryParams(newDate, this.selectedClinic);
        if (newDate && this.selectedClinic && this.selectedVisitTab === 1) {
          this.initParams();
          this.getDailyVisits(params);
        }

      }
    }
  }

  loadMoreVisits() {
    this.loadingDailyVisits = true;
    let params = this.getQueryParams(this.selectedDate, this.selectedClinic);
    this.getDailyVisits(params);
  }

  private initParams() {
    this.loadingDailyVisits = true;
    this.dataLoaded = false;
    this.errors = [];
    this.dailyVisitsPatientList = [];
  }


  private getQueryParams(selectedDate, selectedLocation) {
    return {
      startDate: selectedDate,
      startIndex: this.nextStartIndex,
      locationUuids: selectedLocation,
      limit: undefined
    };

  }

  private getDailyVisits(params) {
    this.loadingDailyVisits = true;
    let result = this.dailyScheduleResource.
      getDailyVisits(params);

    if (result === null) {
      throw 'Null daily appointments observable';
    } else {
      this.visitsSubscription = result.subscribe(
        (patientList) => {
          console.log('Visits', patientList);
          if (patientList.length > 0) {
            this.dailyVisitsPatientList = this.dailyVisitsPatientList.concat(
              patientList);
            let size: number = patientList.length;
            this.nextStartIndex = this.nextStartIndex + size;
            this.currentTabLoaded = true;
          } else {
            this.dataLoaded = true;
          }
          this.loadingDailyVisits = false;
        }
        ,
        (error) => {
          this.loadingDailyVisits = false;
          this.dataLoaded = true;
          this.errors.push({
            id: 'Daily Visits',
            message: 'error fetching daily visits'
          });
        }
      );
    }
  }

}
