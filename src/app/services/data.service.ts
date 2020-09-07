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

    fetchData<T>(tableName: string): Promise<T[]> {
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

    getDataSrc(tableName: string): string {
        return this.dataSrc[tableName];
    }

    updateDataSrc(tableName: string, dataString: string): void {
        this.dataSrc[tableName] = dataString;
        this.parseData(tableName, dataString).then(data => {
            this.$data[tableName] = data;
            console.info(this.$data);
            this.data$.next(this.$data);
            this.firstLoad$.next(this.$data);
        });
    }

    addItem<T>(tableName: string, value: T): Promise<T> {
        // console.info("addItem", tableName, value);
        // let maxID = 1;
        // this.data[tableName].forEach(item => maxID = Math.max(maxID, item.id + 1));
        // value = {id: maxID, ...value};
        // this.data[tableName].push(value);
        return Promise.resolve(value);
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
            const rawData = {};
            for (let i = 0; i < row.length; i++) {
                rawData[header[i]] = row[i];
            }
            const realData = {};
            tableDefinition.columns.forEach(col => {
                if (rawData[col.name]) {
                    if (col.type === 'number' || col.type === 'relation') {
                        realData[col.name] = parseInt(rawData[col.name], 10);
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
