import {Injectable, isDevMode} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject, BehaviorSubject} from 'rxjs';


export type TableDefinitions = {[table: string]: TableDefinition};

export interface TableDefinition {
    name: string;
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
    type: 'string' | 'number' | 'relation' | 'select';
    name: string;
    displayName: string;
    table?: string;
    options?: string[];
    stringExpression: string;
}

export interface IndexTables {
    tables: string[];
}


// "infoQueries": [
//     {
//       "name": "Alle Filme mit der Person",
//       "query": {
//         "select": [["f.name", "Film"], ["r.rolle", "Rolle"]],
//         "from": "person p JOIN rolle r on p.rolle = r.id JOIN film.f on r.film = f.id",
//         "where": ["p.id = {id}"]
//       }
//     },
//     {
//       "name": "Alle Freunde Person",
//       "query": {
//         "select": [["p.name", "Freund"]],
//         "from": "person p1 JOIN person p2 on p2.id = p1.freund",
//         "where": ["p1.id = {id}"]
//       }
//     }

//   ]

@Injectable({
    providedIn: 'root'
})
export class TableDefinitionService {

    public tableDefinitions: Subject<TableDefinitions> = new BehaviorSubject({});
    private $tableDefinitions: TableDefinitions;

    constructor(
        private http: HttpClient,
    ) {
        const path = isDevMode() ? '/assets' : '/filmtool/assets';
        const loadTable = (tableName: string) => {
            return this.http.get<TableDefinition>(`${path}/table.${tableName}.json`).toPromise()
                .then(def => [tableName, def] as [string, TableDefinition]);
        };
        this.http.get<IndexTables>(`${path}/index.tables.json`).toPromise().then(data => {
            Promise.all(data.tables.map(tableName => loadTable(tableName))).then(allDefs => {
                this.$tableDefinitions = {};
                allDefs.forEach(([tableName, definition]) => {
                    this.$tableDefinitions[tableName] = definition;
                });
                this.tableDefinitions.next(this.$tableDefinitions);
            });
        });
    }

    // getAllTables(): Promise<string[]> {
    //     const path = isDevMode() ? '/assets' : '/filmtool/assets';
    //     return this.http.get<any>(`${path}/index.tables.json`).toPromise().then(data => {
    //         return data.tables;
    //     });
    // }

    // getDefinition(tableName: string): Promise<TableDefinition> {
    //     const path = isDevMode() ? '/assets' : '/filmtool/assets';
    //     if (!this.definitions[tableName]) {
    //         this.definitions[tableName] = this.http.get<TableDefinition>(`${path}/table.${tableName}.json`).toPromise();
    //     }
    //     return this.definitions[tableName];
    // }

    // getDefinitionItems(tableName: string): Promise<TableDefinitionItem[]> {
    //     return this.getDefinition(tableName).then(data => {
    //         console.info("got table definition", tableName, data)
    //         return data.columns;
    //     });
    // }

    stringify(tableName: string, item: any): Promise<string> {
        return Promise.resolve("NIX");
        // return this.getDefinition(tableName).then(def => {
        //     if (def.toStringExpression) {
        //         let result = def.toStringExpression;
        //         def.toStringExpression.match(/\{.+?\}/g).forEach(tag => {
        //             const match = tag.match(/\{(.+)\}/);
        //             result = result.replace(tag, item[match[1]]);
        //         });
        //         return result;
        //     }
        //     return `${def.name} with id ${item.id}`;
        // });
    }



}
