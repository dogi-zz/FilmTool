import {ItemInfoModule} from './../../compontents/item-info/item-info.module';
import {AddFormModule} from './../../compontents/add-form/add-form.module';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableComponent} from './table.component';

import {NzTableModule} from 'ng-zorro-antd/table';

import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {InputTextModule} from 'primeng/inputtext';
import {CardModule} from 'primeng/card';


@NgModule({
  imports: [
    CommonModule,

    AddFormModule,

    TableModule,
    ButtonModule,
    PanelModule,
    InputTextModule,
    CardModule,

    NzTableModule,

    ItemInfoModule,
  ],
  declarations: [TableComponent],
  exports: [TableComponent],
})
export class TableViewModule {}
