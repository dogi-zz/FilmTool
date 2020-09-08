import {ItemInfoModule} from './../../compontents/item-info/item-info.module';
import {AddFormModule} from './../../compontents/add-form/add-form.module';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableComponent} from './table.component';

import {NzTableModule} from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';


@NgModule({
  imports: [
    CommonModule,

    AddFormModule,

    NzTableModule,
    NzButtonModule,
    NzIconModule,

    ItemInfoModule,
  ],
  declarations: [TableComponent],
  exports: [TableComponent],
})
export class TableViewModule {}
