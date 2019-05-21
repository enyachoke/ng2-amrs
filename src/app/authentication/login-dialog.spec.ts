import {
  inject,
  TestBed
} from '@angular/core/testing';

// Load the implementations that should be tested
import { LoginDialogComponent } from './login-dialog.component';
import { provideRoutes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PouchdbService } from '../pouchdb-service/pouchdb.service';
import { UserDefaultPropertiesService } from '../user-default-properties/user-default-properties.service';

describe('App', () => {
  // provide our implementations or mocks to the dependency injector
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      PouchdbService,
      UserDefaultPropertiesService,
      LoginDialogComponent,
      provideRoutes([])
    ],
    imports: [
      RouterTestingModule
    ]
  }));

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should have required variables',
    inject([LoginDialogComponent], (loginDialogComponent: LoginDialogComponent) => {
      expect(loginDialogComponent.cssClass).toBeTruthy();
      expect(loginDialogComponent.closeEvent).toBeTruthy();
    }));
});
