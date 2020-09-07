import {Injectable, isDevMode} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class DataService {

    private data: {[tableName: string]: any[]} = {};

    constructor(
        private http: HttpClient,
    ) {}

    fetchData<T>(tableName: string): Promise<T[]> {
        const path = isDevMode() ? '/assets' : '/filmtool/assets';
        if (!this.data[tableName]) {
            return this.http.get(`${path}/data.${tableName}.json`).toPromise().then(data => {
                this.data[tableName] = data as T[];
                return data as T[];
            });
        } else {
            return Promise.resolve(this.data[tableName]);
        }
    }

    addItem<T>(tableName: string, value: T): Promise<T> {
        console.info("addItem", tableName, value);
        let maxID = 1;
        this.data[tableName].forEach(item => maxID = Math.max(maxID, item.id + 1));
        value = {id: maxID, ...value};
        this.data[tableName].push(value);
        return Promise.resolve(value);
    }


}
