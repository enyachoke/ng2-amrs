import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common'


import { jqxGridComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxgrid';
import { NgamrsSharedModule } from '../shared/ngamrs-shared.module';
import { AgGridModule } from 'ag-grid-angular/main';

import { GroupManagerSearchComponent } from './group-manager-search/group-manager-search.component';
import { CommunityGroupService } from '../openmrs-api/community-group-resource.service';
import { GroupManagerSearchResultsComponent } from './group-manager-search/group-manager-search-results.component';
import { GroupDetailComponent } from './group-detail/group-detail.component';
import { GroupManagerRouting } from './group-manager.routes';
import { GroupDetailSummaryComponent } from './group-detail/group-detail-summary.component';
import { CommunityGroupMemberService } from '../openmrs-api/community-group-member-resource.service';
import { CommunityGroupAttributeService } from '../openmrs-api/community-group-attribute-resource.service';
import { DatePickerModalComponent } from './modals/date-picker-modal.component';
import { SuccessModalComponent } from './modals/success-modal.component';
import { CommunityGroupLeaderService } from '../openmrs-api/community-group-leader-resource.service';

@NgModule({
    declarations: [
        GroupManagerSearchComponent,
        GroupManagerSearchResultsComponent,
        GroupDetailComponent,
        GroupDetailSummaryComponent,
        DatePickerModalComponent,
        SuccessModalComponent,
        jqxGridComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        NgamrsSharedModule,
        GroupManagerRouting,
        AgGridModule
     ],
    exports: [],
    providers: [
        CommunityGroupService,
        CommunityGroupMemberService,
        CommunityGroupAttributeService,
        CommunityGroupLeaderService,
        DatePipe
    ],
    entryComponents: [
        DatePickerModalComponent,
        SuccessModalComponent
    ]
})
export class GroupManagerModule {}
