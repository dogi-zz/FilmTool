import {registerLocaleData} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import de from '@angular/common/locales/de';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CodeEditorModule} from '@ngstack/code-editor';
import {de_DE, NZ_I18N} from 'ng-zorro-antd/i18n';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {DialogService, DynamicDialogModule} from 'primeng/dynamicdialog';
import {MenubarModule} from 'primeng/menubar';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {IconsProviderModule} from './icons-provider.module';
import {EditDialogService} from './services/edit-dialog.service';
import {AdminModule} from './views/admin/admin.module';
import {HomeModule} from './views/home/home.module';
import {TableViewModule} from './views/table/table.module';

registerLocaleData(de);

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,

    HomeModule,
    TableViewModule,
    AdminModule,

    DynamicDialogModule,
    MenubarModule,

    CodeEditorModule.forRoot(),

    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
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
    addItemService: EditDialogService,
  ) {
    //addItemService.modalFormComponentType = AddFormComponent;
  }

}
