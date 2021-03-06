


import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Observable, Subject } from 'rxjs';
import { HivSummaryIndicatorBaseComponent } from './hiv-summary-report-base.component';
import { ReportFiltersComponent } from '../../shared/report-filters/report-filters.component';
import {
  HivSummaryIndicatorsResourceService
} from '../../etl-api/hiv-summary-indicators-resource.service';
import {
  HivSummaryIndicatorsResourceServiceMock
} from '../../etl-api/hiv-summary-indicators.service.mock';
import {
  DataAnalyticsDashboardService
} from '../../data-analytics-dashboard/services/data-analytics-dashboard.services';
import { domRendererFactory3 } from '@angular/core/src/render3/interfaces/renderer';
import { doesNotThrow } from 'assert';

describe('HivSummaryIndicatorBaseComponent:', () => {
  let fixture: ComponentFixture<HivSummaryIndicatorBaseComponent>;
  let comp: HivSummaryIndicatorBaseComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        HivSummaryIndicatorBaseComponent,
        ReportFiltersComponent
      ],
      providers: [
        {
          provide: HivSummaryIndicatorsResourceService,
          useClass: HivSummaryIndicatorsResourceServiceMock
        },
        DataAnalyticsDashboardService
      ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        FormsModule
      ]
    });
  });

  beforeEach(async(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(HivSummaryIndicatorBaseComponent);
      comp = fixture.componentInstance;
    });
  }));

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be injected', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.hivSummaryIndicatorsResourceService
      instanceof HivSummaryIndicatorsResourceServiceMock)
      .toBe(true);
  });

  it('should generate hiv summary report using paramaters supplied',
    (done) => {
      const fakeReply: any = {
        result: [{
          'location': 'MTRH Module 1',
          'location_uuid': '08feae7c-1352-11df-a1f1-0026b9348838',
          'location_id': 1,
          'encounter_datetime': '2017-04-12T09:35:13.000Z',
          'month': '2017-04-12T09:35:13.000Z',
          'patients': 1084,
          'on_arvs': 1081,
          'on_arvs_first_line': 856,
          'on_arvs_second_line': 225,
          'on_arvs_third_line': 0
        }]
      };

      comp = fixture.componentInstance;
      const service = fixture.componentInstance.hivSummaryIndicatorsResourceService;
      const hivSpy = spyOn(service, 'getHivSummaryIndicatorsReport')
        .and.callFake(({ endDate: endDate, gender: gender, startDate: startDate,
          indicators: indicators, locationUuids: locationUuids,
          startAge: startAge, endAge: endAge }) => {
          const subject = new Subject<any>();

          // check for params conversion accuracy
          expect(endDate).toEqual('2017-02-01T03:00:00+03:00');
          expect(gender).toEqual('M');
          expect(startDate).toEqual('2017-01-01T03:00:00+03:00');
          expect(indicators).toBe('on_arvs,patients');
          // expect(locationUuids).toBe('uuid-1,uuid-2');
          expect(startAge).toEqual(0);
          expect(endAge).toEqual(120);

          // check for state during fetching
          expect(comp.isLoadingReport).toBe(true);
          expect(comp.encounteredError).toBe(false);
          expect(comp.errorMessage).toBe('');
          setTimeout(() => {
            subject.next(fakeReply);

            // check for state after successful loading
            expect(comp.isLoadingReport).toBe(false);
            expect(comp.encounteredError).toBe(false);
            expect(comp.errorMessage).toBe('');
            done();
          });

          return subject.asObservable();
        });

      // simulate user input
      comp.startDate = new Date('2017-01-01');
      comp.endDate = new Date('2017-02-01');
      // comp.locationUuids = ['uuid-1', 'uuid-2'];
      comp.gender = 'M';
      comp.indicators = 'on_arvs,patients';
      comp.startAge = 0;
      comp.endAge = 120;

      // simulate previous erroneous state
      comp.isLoadingReport = false;
      comp.encounteredError = true;
      comp.errorMessage = 'some error';
      fixture.detectChanges();
      comp.generateReport();
      done();

    });

  it('should report errors when generating hiv summary report fails',
    (done) => {
      comp = fixture.componentInstance;
      const service = fixture.componentInstance.hivSummaryIndicatorsResourceService;
      const hivSpy = spyOn(service, 'getHivSummaryIndicatorsReport')
        .and.callFake((locationUuids, startDate, endDate) => {
          const subject = new Subject<any>();

          setTimeout(() => {
            subject.error('some error');

            // check for state after successful loading
            expect(comp.isLoadingReport).toBe(false);
            expect(comp.encounteredError).toBe(true);
            expect(comp.errorMessage).toEqual('some error');

            // results should be set
            expect(comp.sectionsDef).toEqual([]);
            expect(comp.data).toEqual([]);
            done();
          });

          return subject.asObservable();
        });
      comp.generateReport();

      done();
    });

});
