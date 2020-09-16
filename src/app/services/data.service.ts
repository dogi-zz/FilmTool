import {Subject, BehaviorSubject} from 'rxjs';
import {IndexTables, TableDefinitionService} from './table-definition.service';
import {Injectable, isDevMode} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class DataService {


    private $data: {[tableName: string]: any[]} = {};
    private data$: Subject<{[tableName: string]: any[]}> = new BehaviorSubject({});
    private firstLoad$: Subject<{[tableName: string]: any[]}> = new Subject();
    private dataSrc: {[table: string]: string} = {};

    constructor(
        private http: HttpClient,
        private tableDefinitionService: TableDefinitionService,
    ) {
        const path = isDevMode() ? '/assets' : '/filmtool/assets';
        const loadTable = async (tableName: string) => {
            const data = await this.loadData(path, tableName);
            return [tableName, data] as [string, any[]];
        };
        this.http.get<IndexTables>(`${path}/index.tables.json`).toPromise().then(data => {
            Promise.all(data.tables.map(tableName => loadTable(tableName))).then(allData => {
                this.$data = {};
                allData.forEach(([tableName, definition]) => {
                    this.$data[tableName] = definition;
                });
                this.data$.next(this.$data);
                this.firstLoad$.next(this.$data);
            });
        });
    }

    getDataForTable<T>(tableName: string): Promise<T[]> {
        if (this.$data[tableName]) {
            return Promise.resolve(this.$data[tableName]);
        }
        return new Promise<T[]>(res => {
            const sub = this.firstLoad$.subscribe(data => {
                sub.unsubscribe();
                res(data[tableName]);
            });
        });
    }

    getItem<T>(tableName: string, id: number): Promise<T> {
        return this.getDataForTable<T>(tableName).then(data => data.find(item => (item as any).id === id));
    }

    getDataSrc(tableName: string): string {
        return this.dataSrc[tableName];
    }

    updateDataSrc(tableName: string, dataString: string): void {
        this.dataSrc[tableName] = dataString;
        this.parseData(tableName, dataString).then(data => {
            this.$data[tableName] = data;
            this.data$.next(this.$data);
            this.firstLoad$.next(this.$data);
        });
    }

    addItem<T>(tableName: string, value: T): Promise<T> {
        console.info("addItem", tableName, value);
        return this.getDataForTable(tableName).then(allItems => {
            let maxID = 1;
            allItems.forEach((item: any) => maxID = Math.max(maxID, item.id + 1));
            value = {id: maxID, ...value};
            allItems.push(value);
            return value;
        })
    }


    async loadData(path: string, tableName: string): Promise<any[]> {
        const dataString = await this.http.get(`${path}/data.${tableName}.csv`, {responseType: 'text'}).toPromise();
        return await this.parseData(tableName, dataString);
    }

    async parseData(tableName: string, dataString: string): Promise<any[]> {
        const tableDefinition = await this.tableDefinitionService.getDefinition(tableName);
        this.dataSrc[tableName] = dataString;

        const dataRows = dataString.trim().split('\n').map(line => line.trim().split(';').map(col => col.trim()));
        const result: any[] = [];
        const header = dataRows.shift();
        dataRows.forEach(row => {
            const rawData: {[head: string]: string} = {};
            for (let i = 0; i < row.length; i++) {
                rawData[header[i]] = row[i];
            }
            const realData = {};
            tableDefinition.columns.forEach(col => {
                if (rawData[col.name]) {
                    if (col.type === 'integer' || col.type === 'oneOf') {
                        realData[col.name] = parseInt(rawData[col.name], 10);
                    } else if (col.type === 'float') {
                        realData[col.name] = parseFloat(rawData[col.name]);
                    } else if (col.type === 'boolean') {
                        realData[col.name] = (rawData[col.name] && (rawData[col.name]).toLowerCase() === 'true');
                    } else {
                        realData[col.name] = rawData[col.name];
                    }
                }
            });
            result.push(realData);
        });
        return result;
    }
}
