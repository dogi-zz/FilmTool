import {DynamicDialogRef, DynamicDialogConfig, DialogService} from 'primeng/dynamicdialog';
import {DataService} from './../../services/data.service';
import {TableDefinitionService, TableDefinitionItem} from './../../services/table-definition.service';
import {AddItemService, AddItemComponent} from './../../services/add-item.service';
import {FormGroup, FormBuilder} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {SelectItem} from 'primeng/api';

@Component({
  selector: 'app-add-form',
  templateUrl: './add-form.component.html',
  styleUrls: ['./add-form.component.scss']
})
export class AddFormComponent extends AddItemComponent implements OnInit {

  formGroup: FormGroup;
  definitions: TableDefinitionItem[] = [];

  tableName: string;
  afterAdd: () => void;

  constructor(
    public dialogService: DialogService,
    public config: DynamicDialogConfig,
    private formBuilder: FormBuilder,
    private addItemService: AddItemService,
    private dataService: DataService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.config.data.modalWindowOpen(this);
  }

  public initEdit(tableName: string, definitions: TableDefinitionItem[]): void {
    this.tableName = tableName;
    this.definitions = definitions.filter(def => def.name !== 'id');

    const formDefinitions = {};
    for (const definition of this.definitions) {
      formDefinitions[definition.name] = [undefined];
    }
    this.formGroup = this.formBuilder.group(formDefinitions);

  }

  setValue(value: any): any {
    this.formGroup.setValue(value);
  }

  public closeEdit(): Promise<any> {
    const value = this.formGroup.value;
    this.definitions = [];
    return new Promise(res => {
      setTimeout(() => {
        this.formGroup = this.formBuilder.group({});
        res(value);
      });
    });
  }

  add(): void {
    this.dataService.addItem(this.tableName, this.formGroup.value).then(data => {
      this.addItemService.afterItemAdd(data);
    });
  }

  addSubItem(fieldName: string, tableName: string): void {
    this.addItemService.addSubItem(tableName, fieldName).then(subItem => {
      this.formGroup.controls[fieldName].setValue(subItem.id);
    });
  }

}
