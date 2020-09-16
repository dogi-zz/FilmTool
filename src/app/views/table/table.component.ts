import {EditDialogService} from '../../services/edit-dialog.service';
import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DataService} from './../../services/data.service';
import {TableDefinitionService, TableDefinitionItem, TableDefinition} from './../../services/table-definition.service';
import {combineLatest} from 'rxjs';
import {BaseComponent} from 'src/app/tools/base-component';
import {NzTableSortOrder, NzTableSortFn, NzTableFilterList, NzTableFilterFn} from 'ng-zorro-antd/table';

interface ColumnItem {
  name: string;
  sortOrder?: NzTableSortOrder;
  sortFn?: NzTableSortFn;
  listOfFilter?: NzTableFilterList;
  filterFn?: NzTableFilterFn;

}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent extends BaseComponent implements OnInit {

  displayName: string;
  tableName: string;
  entries: any[];

  definitions: TableDefinitionItem[] = [];
  extDefinitions: ColumnItem[] = [];

  subEntityNames: {[propName: string]: {[id: number]: string}} = {};
  detailItem: any;

  itemNamesId: {[id: number]: string} = {};

  constructor(
    private route: ActivatedRoute,
    private editDialogService: EditDialogService,
    private tableDefinitionService: TableDefinitionService,
    private dataService: DataService,
  ) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.tableDefinitionService.tableDefinitions$.subscribe(data => {
      console.info("DATA hier", data);
    });
    this.subscribe(
      combineLatest([
        this.route.params,
        this.tableDefinitionService.tableDefinitions$
      ]),
      ([params, definitions]) => {
        if (!params) {return;}
        if (!definitions) {return;}
        const tableName = params.tableName;
        const definition = definitions[tableName];
        this.tableName = params.tableName;
        this.displayName = definition.listName;
        this.definitions = definition.columns;

        this.updateDefinitions();
        this.updateData();
      }
    );
  }

  updateDefinitions(): void {
    this.extDefinitions = this.definitions.map(def => {
      const columnItem: ColumnItem = {
        name: def.displayName,
        sortOrder: null,
        sortFn: (a: any, b: any) => {
          if (def.type === 'integer' || def.type === 'float') {
            return a[def.name] - b[def.name];
          }
          if (def.type === 'oneOf') {
            const [aIdx, bIdx] = [`${a[def.name]}`, `${b[def.name]}`];
            const [aName, bName] = [this.subEntityNames[def.name][aIdx], this.subEntityNames[def.name][bIdx]];
            return (aName || '').localeCompare(bName || '');
          }
          return (a[def.name] || '').localeCompare(b[def.name] || '');
        },
      };
      if (def.type === 'select') {
        columnItem.listOfFilter = def.options.map(option => ({text: option, value: option}));
        columnItem.filterFn = (list: string[], item: any) => list.includes(item[def.name]);
      }
      return columnItem;
    });
  }

  updateData(): void {
    this.dataService.getDataForTable(this.tableName).then(data => {
      this.entries = data.slice();
      console.info("updateData", data);

      // Update Subentity Cache
      this.subEntityNames = {};
      this.definitions.forEach(def => {
        if (def.type === 'oneOf') {
          this.dataService.getDataForTable(def.table).then(subData => {
            this.subEntityNames[def.name] = {};
            subData.forEach(item => {
              this.subEntityNames[def.name][`${(item as any).id}`] =
                this.tableDefinitionService.stringify(def.table, item);
            });
          });
        }
      });

      // Update Item Cache
      this.itemNamesId = {};
      this.entries.forEach(entry => {
        this.itemNamesId[entry.id] = this.tableDefinitionService.stringify(this.tableName, entry);
      });
    });
  }

  resetFilters(): void {
    this.definitions.forEach((def, idx) => {
      if (def.type === 'select') {
        this.extDefinitions[idx].listOfFilter = def.options.map(option => ({text: option, value: option}));
      }
    });
  }

  addNewItem(): void {
    this.editDialogService.addNewItem(this.tableName).then(() => {
      this.updateData();
    });
  }


  showDetails(item: any): void {
    this.detailItem = item;
  }

}
