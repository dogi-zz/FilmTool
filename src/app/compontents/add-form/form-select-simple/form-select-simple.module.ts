import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';
import {FormSelectSimpleComponent} from './form-select-simple.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    DropdownModule,
  ],
  declarations: [FormSelectSimpleComponent],
  exports: [FormSelectSimpleComponent],
})
export class FormSelectSimpleModule {}
