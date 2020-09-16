import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormSelectSimpleComponent} from './form-select-simple.component';
import {NzSelectModule} from 'ng-zorro-antd/select';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    NzSelectModule,
  ],
  declarations: [FormSelectSimpleComponent],
  exports: [FormSelectSimpleComponent],
})
export class FormSelectSimpleModule {}
