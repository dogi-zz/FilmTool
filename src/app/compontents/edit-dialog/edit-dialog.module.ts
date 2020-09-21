import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzDatePickerModule} from 'ng-zorro-antd/date-picker';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {SharedModule} from 'primeng/api';
import {FormSelectSimpleModule} from './../form-select-simple/form-select-simple.module';
import {EditDialogComponent} from './edit-dialog.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,

    FormSelectSimpleModule,

    NzModalModule,
    NzInputModule,
    NzButtonModule,
    NzInputNumberModule,
    NzCheckboxModule,
    NzSelectModule,
    NzDatePickerModule,
  ],
  declarations: [EditDialogComponent],
  exports: [EditDialogComponent],
})
export class EditDialogModule {}
