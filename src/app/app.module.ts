import { MenubarModule } from 'primeng/menubar';
import {AddFormComponent} from './compontents/add-form/add-form.component';
import {AddItemService} from './services/add-item.service';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DialogService, DynamicDialogModule} from 'primeng/dynamicdialog';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeModule} from './views/home/home.module';
import {TableViewModule} from './views/table/table.module';
import {CodeEditorModule} from '@ngstack/code-editor';
import { IconsProviderModule } from './icons-provider.module';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { FormsModule } from '@angular/forms';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { de_DE } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import de from '@angular/common/locales/de';

registerLocaleData(de);

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,

    HomeModule,
    TableViewModule,

    DynamicDialogModule,
    MenubarModule,

    CodeEditorModule.forRoot(),

    IconsProviderModule,

    NzLayoutModule,

    NzMenuModule,

    FormsModule,
  ],
  declarations: [
    AppComponent
  ],
  providers: [
    DialogService,
    { provide: NZ_I18N, useValue: de_DE }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    addItemService: AddItemService,
  ) {
    addItemService.modalFormComponentType = AddFormComponent;
  }

}
