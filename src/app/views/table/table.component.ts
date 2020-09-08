import {AddItemService} from './../../services/add-item.service';
import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SortEvent} from 'primeng/api';
import {DataService} from './../../services/data.service';
import {TableDefinitionService, TableDefinitionItem, TableDefinition} from './../../services/table-definition.service';
import {combineLatest} from 'rxjs';
import {BaseComponent} from 'src/app/tools/base-component';
import {NzTableSortOrder, NzTableSortFn, NzTableFilterList, NzTableFilterFn, NzTableQueryParams, NzTableComponent} from 'ng-zorro-antd/table';

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
  listEntries: any[];

  definitions: TableDefinitionItem[] = [];
  extDefinitions: ColumnItem[] = [];
  pageSize = 10;
  pageIndex = 1;

  subEntitiesById: {[propName: string]: {[id: number]: string}} = {};
  detailItem: any;

  itemNamesId: {[id: number]: string} = {};

  constructor(
    private route: ActivatedRoute,
    private addItemService: AddItemService,
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
        console.info(params);
        console.info(definitions);
        if (!params) {return;}
        if (!definitions) {return;}
        const tableName = params.tableName;
        const definition = definitions[tableName];
        this.tableName = params.tableName;
        this.displayName = definition.name;
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
          if (def.type === 'number') {
            return a[def.name] - b[def.name];
          }
          if (def.type === 'relation') {
            const aName = this.tableDefinitionService.stringify(def.table, this.subEntitiesById[def.name][a]);
            const bName = this.tableDefinitionService.stringify(def.table, this.subEntitiesById[def.name][b]);
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
    this.dataService.fetchData(this.tableName).then(data => {
      this.entries = data;
      this.listEntries = data.slice();
      console.info("updateData", data);

      // Update Subentity Cache
      this.subEntitiesById = {};
      this.definitions.forEach(def => {
        if (def.type === 'relation') {
          this.dataService.fetchData(def.table).then(subData => {
            this.subEntitiesById[def.name] = {};
            subData.forEach(item => {
              this.subEntitiesById[def.name][(item as any).id] =
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

  onQueryParamsChange(params: NzTableQueryParams): void {
    this.pageIndex = params.pageIndex;
    if (!this.entries) {return;}

    // Apply in List Array
    const filterCols = this.extDefinitions.filter(col => col.filterFn);
    this.listEntries = this.entries.filter(entry => {
      for (let i = 0; i < filterCols.length; i++) {
        if (params.filter[i] && params.filter[i].value && params.filter[i].value.length) {
          if (!filterCols[i].filterFn(params.filter[i].value, entry)) {
            return false;
          }
        }
      }
      return true;
    });
    const sortIndex = params.sort.findIndex(p => p.value);
    if (sortIndex >= 0) {
      this.listEntries.sort((a, b) => {
        const order = this.extDefinitions[sortIndex].sortFn(a, b);
        return params.sort[sortIndex].value === 'ascend' ? order : (order * -1);
      });
    }
  }

  onListParamsChange(params: NzTableQueryParams): void {
    console.log(params);
    this.pageIndex = params.pageIndex;
  }




  addNewItem() {
    this.addItemService.addItemForTable(this.tableName).then(() => {
      this.updateData();
    });
  }


  showDetails(item: any): void {
    this.detailItem = item;
  }

}
