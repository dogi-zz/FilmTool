import { OnInit, OnDestroy, Component } from '@angular/core';

import {Observable, Subscription} from 'rxjs';

@Component({
    template: ''
})
export abstract class BaseComponent implements OnInit, OnDestroy {

    private subscriptions: Subscription[] = [];

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    protected subscribe<T>(observable: Observable<T>, subscribe: (data: T) => void): void {
        this.subscriptions.push(observable.subscribe(subscribe));
    }

}