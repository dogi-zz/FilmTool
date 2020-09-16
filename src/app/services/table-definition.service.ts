import {Injectable, isDevMode} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject, BehaviorSubject} from 'rxjs';

export type TableDefinitions = {[table: string]: TableDefinition};

export interface TableDefinition {
    singleName: string;
    listName: string;
    toStringExpression: string;
    showOnHome: boolean;
    columns: TableDefinitionItem[];

    infoQueries: {
        name: string,
        query: {
            select: [string, string][],
        }
    }[];
}

export interface TableDefinitionItem {
    type: 'string' | 'integer' | 'float' | 'boolean' | 'select' | 'oneOf';
    name: string;
    displayName: string;
    table?: string;
    options?: string[];
    stringExpression: string;
}

export interface IndexTables {
    tables: string[];
}

@Injectable({
    providedIn: 'root'
})
export class TableDefinitionService {

    public tableDefinitions$: Subject<TableDefinitions> = new BehaviorSubject({});
    private firstLoad$: Subject<TableDefinitions> = new BehaviorSubject({});


    private $tableDefinitions: TableDefinitions = {};
    private tableDefinitionSrc: {[table: string]: string} = {};

    constructor(
        private http: HttpClient,
    ) {
        const path = isDevMode() ? '/assets' : '/filmtool/assets';
        const loadTable = (tableName: string) => {
            return this.http.get(`${path}/table.${tableName}.json`, {responseType: 'text'}).toPromise()
                .then(defString => {
                    this.tableDefinitionSrc[tableName] = defString;
                    return [tableName, JSON.parse(defString)] as [string, TableDefinition];
                });
        };
        this.http.get<IndexTables>(`${path}/index.tables.json`).toPromise().then(data => {
            Promise.all(data.tables.map(tableName => loadTable(tableName))).then(allDefs => {
                this.$tableDefinitions = {};
                allDefs.forEach(([tableName, definition]) => {
                    this.$tableDefinitions[tableName] = definition;
                });
                this.tableDefinitions$.next(this.$tableDefinitions);
                this.firstLoad$.next(this.$tableDefinitions);
            });
        });
    }

    updateDefinitionSrc(tableName: string, tableDefinitionSrc: string): void {
        this.tableDefinitionSrc[tableName] = tableDefinitionSrc;
        this.$tableDefinitions[tableName] = JSON.parse(tableDefinitionSrc);
        this.tableDefinitions$.next(this.$tableDefinitions);
        this.firstLoad$.next(this.$tableDefinitions);
    }

    getDefinitionSrc(tableName: string): string {
        return this.tableDefinitionSrc[tableName];
    }

    getDefinition(tableName: string): Promise<TableDefinition> {
        if (this.$tableDefinitions[tableName]) {
            return Promise.resolve(this.$tableDefinitions[tableName]);
        }
        return new Promise<TableDefinition>(res => {
            const sub = this.firstLoad$.subscribe(data => {
                sub.unsubscribe();
                res(data[tableName]);
            });
        });
    }

    stringify(tableName: string, item: any): string {
        if (!item) {return null;}
        if (this.$tableDefinitions[tableName]) {
            const def = this.$tableDefinitions[tableName];
            if (def.toStringExpression) {
                let result = def.toStringExpression;
                def.toStringExpression.match(/\{.+?\}/g).forEach(tag => {
                    const match = tag.match(/\{(.+)\}/);
                    result = result.replace(tag, item[match[1]]);
                });
                return result;
            }
            return `${def.singleName} with id ${item.id}`;
        }
        return `Object with id ${item.id}`;
    }

}
