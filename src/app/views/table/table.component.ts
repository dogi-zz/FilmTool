import {AddItemService} from './../../services/add-item.service';
import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SortEvent} from 'primeng/api';
import {Table, TableCheckbox} from 'primeng/table';
import {DataService} from './../../services/data.service';
import {TableDefinitionService, TableDefinitionItem, TableDefinition} from './../../services/table-definition.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  @ViewChild('dt') table: Table;

  displayName: string;
  tableName: string;
  entries: any[];

  definitions: TableDefinitionItem[] = [];

  subEntitiesById: {[propName: string]: {[id: number]: Promise<string>}} = {};
  detailItem: any;

  itemNamesId: {[id: number]: Promise<string>} = {};

  constructor(
    private route: ActivatedRoute,
    private addItemService: AddItemService,
    private tableDefinitionService: TableDefinitionService,
    private dataService: DataService,

  ) {
    this.route.params.subscribe(params => {
      console.info(params)
      // this.tableDefinitionService.getDefinition(params.tableName).then((definition: TableDefinition) => {
      //   this.tableName = params.tableName;
      //   this.displayName = definition.name;
      //   this.definitions = definition.columns;
      //   this.updateData();
      // });
    });
  }

  ngOnInit(): void {
  }

  updateData(): void {
    this.dataService.fetchData(this.tableName).then(data => {
      this.entries = data;

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

      this.itemNamesId = {};
      this.entries.forEach(entry => {
        this.itemNamesId[entry.id] = this.tableDefinitionService.stringify(this.tableName, entry);
      });

      console.info("UD", data);
      // this.data = {};
      // this.data[]
      // this.dataById = {};
      // Object.entries(data).forEach(([table, entries]) => {
      //   this.dataById[table] = {};
      //   (entries as any[]).forEach(entry => {
      //     this.dataById[table][entry.id] = entry;
      //   })
      // })
      // console.info(data);
      // console.info(this.dataById);
    });
  }



  addNewItem() {
    this.addItemService.addItemForTable(this.tableName).then(() => {
      this.updateData();
    });
  }

  customSort(event: SortEvent) {
    event.data.sort((data1, data2) => {
      const value1 = data1[event.field];
      const value2 = data2[event.field];
      let result = null;

      if (value1 == null && value2 != null)
        result = -1;
      else if (value1 != null && value2 == null)
        result = 1;
      else if (value1 == null && value2 == null)
        result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string')
        result = value1.localeCompare(value2);
      else
        result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;

      return (event.order * result);
    });
  }



  showDetails(item: any) {
    this.detailItem = item;
  }

}
