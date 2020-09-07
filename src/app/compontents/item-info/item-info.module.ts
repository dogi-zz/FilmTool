import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemInfoComponent } from './item-info.component';



@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ItemInfoComponent],
  exports: [ItemInfoComponent],
})
export class ItemInfoModule { }
