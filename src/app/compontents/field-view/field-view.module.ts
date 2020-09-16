import {NzIconModule} from 'ng-zorro-antd/icon';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FieldViewComponent} from './field-view.component';


@NgModule({
  imports: [
    CommonModule,
    NzIconModule,
  ],
  declarations: [FieldViewComponent],
  exports: [FieldViewComponent],
})
export class FieldViewModule {}
