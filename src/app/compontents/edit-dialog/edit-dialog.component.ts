import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {TableDefinition} from 'src/app/services/table-definition.service';
import {DataService} from './../../services/data.service';
import {EditComponent, EditDialogService} from './../../services/edit-dialog.service';
import {TableDefinitionItem, TableDefinitionService} from './../../services/table-definition.service';

const getSearchString = (str: string) => {
  if (!str) {return null;}
  str = str.trim();
  str = str.replace(/[^a-zA-Z0-9]+/g, ' ');
  str = str.toLowerCase();
  return str;
}

@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss']
})
export class EditDialogComponent extends EditComponent implements OnInit {

  tableName: string;
  displayName: string;

  formGroup: FormGroup;
  definitions: TableDefinitionItem[] = [];
  done: (data: any) => void;
  cancel: () => void;
  isMainItem: boolean;

  isVisible = false;
  isOkLoading = false;

  oneOfOptions: {[name: string]: {value: number; text: string}[]};
  oneOfSearches: {[name: string]: (value: string, definition: TableDefinitionItem) => void};

  initPromise: Promise<void>;

  constructor(
    public editDialogService: EditDialogService,
    private formBuilder: FormBuilder,
    private tableDefinitionService: TableDefinitionService,
    private dataService: DataService,
  ) {
    super();
    this.editDialogService.component = this;
  }

  ngOnInit(): void {
  }


  open(): void {
    this.isVisible = true;
  }

  close(): void {
    this.isVisible = false;
    this.definitions = [];
    this.oneOfOptions = {};
    this.oneOfSearches = {};
  }

  public edit(tableName: string, tableDefinition: TableDefinition, item: any, isMainItem: boolean, done: (data: any) => void, cancel: () => void): void {
    console.info("edit", tableDefinition);

    this.tableName = tableName;
    this.displayName = tableDefinition.singleName;
    this.definitions = tableDefinition.columns.filter(def => def.name !== 'id');
    this.done = done;
    this.cancel = cancel;
    this.isMainItem = isMainItem;

    this.oneOfOptions = {};
    this.oneOfSearches = {};

    const formDefinitions = {};
    for (const definition of this.definitions) {
      formDefinitions[definition.name] = [undefined];
    }
    this.formGroup = this.formBuilder.group(formDefinitions);

    const initPromises: Promise<void>[] = [];
    for (const definition of this.definitions) {
      if (definition.type === 'oneOf') {
        initPromises.push(this.initOneOf(definition));
      }
    }
    this.initPromise = Promise.all(initPromises).then(() => {
      this.formGroup.patchValue(item);
    });

  }

  getValue(): any {
    return this.formGroup.value;
  }

  handleOk(): void {
    this.isOkLoading = true;
    this.addItem().then(() => {
      this.isOkLoading = false;
    });
  }

  handleCancel(): void {
    this.close();
    this.cancel();
  }



  addItem(): Promise<void> {
    return this.dataService.addItem(this.tableName, this.formGroup.value).then(addedItem => {
      this.done(addedItem);
    });
  }
  cancelItem(): void {
    this.done(null);
  }


  private initOneOf(definition: TableDefinitionItem): Promise<void> {
    this.oneOfOptions[definition.name] = [];
    this.oneOfSearches[definition.name] = (value: string) => {
      const searchString = getSearchString(value);
      this.oneOfOptions[definition.name] = [];
      this.dataService.getDataForTable(definition.table).then(itemsOfTable => {
        itemsOfTable.forEach((item: any) => {
          const itemString = this.tableDefinitionService.stringify(definition.table, item);
          if (!searchString || getSearchString(itemString).includes(searchString)) {
            this.oneOfOptions[definition.name].push({value: item.id, text: itemString});
          }
        });
      });
    };
    return this.loadOneOfData(definition);
  }
  private loadOneOfData(definition: TableDefinitionItem): Promise<void> {
    return this.dataService.getDataForTable(definition.table).then(itemsOfTable => {
      itemsOfTable.forEach((item: any) => {
        const itemString = this.tableDefinitionService.stringify(definition.table, item);
        this.oneOfOptions[definition.name].push({value: item.id, text: itemString});
      });
    });
  }

  addNewOneOf(definition: TableDefinitionItem): void {
    setTimeout(() => {
      this.editDialogService.addNewItem(definition.table).then(data => {
        if (data) {
          this.initPromise.then(() => {
            this.formGroup.controls[definition.name].setValue(data.id);
          });
        }
      });
    });
  }

}

