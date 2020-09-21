import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzTableModule} from 'ng-zorro-antd/table';
import {EditDialogModule} from './../../compontents/edit-dialog/edit-dialog.module';
import {FieldViewModule} from './../../compontents/field-view/field-view.module';
import {ItemInfoModule} from './../../compontents/item-info/item-info.module';
import {TableComponent} from './table.component';


@NgModule({
  imports: [
    CommonModule,

    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzSpaceModule,

    ItemInfoModule,
    EditDialogModule,
    FieldViewModule,

  ],
  declarations: [TableComponent],
  exports: [TableComponent],
})
export class TableViewModule {}
