/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AfterContentInit, AfterViewInit, Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {InitAuthStatus} from '@ofActions/authentication.actions';
import {AppState} from '@ofStore/index';
import {selectCurrentUrl, selectRouterState} from '@ofSelectors/router.selectors';
import {selectExpirationTime, selectIsImplicitallyAuthenticated} from '@ofSelectors/authentication.selectors';
import {AuthenticationService, isInTheFuture} from "@ofServices/authentication/authentication.service";
import {LoadConfig} from "@ofActions/config.actions";
import {selectConfigLoaded, selectMaxedRetries} from "@ofSelectors/config.selectors";
import {I18nService} from "@ofServices/i18n.service";
import {buildConfigSelector} from '@ofSelectors/config.selectors';

@Component({
    selector: 'of-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    readonly title = 'OperatorFabric';
    getRoutePE: Observable<any>;
    currentPath: any;
    isAuthenticated$: boolean = false;
    configLoaded: boolean = false;
    private maxedRetries: boolean = false;
    private authenticationModeHandler: AuthenticationFlowHandler;

    /**
     * NB: I18nService is injected to trigger its constructor at application startup
     * @param store
     * @param i18nService
     */
    constructor(private store: Store<AppState>,
                private i18nService: I18nService,
                private titleService: Title
        , private authenticationService: AuthenticationService) {
        this.getRoutePE = this.store.pipe(select(selectRouterState));
        if (isSessionAuthFlowSetted2Implicit()) {
            this.authenticationModeHandler = new ImplicitFlowHandler(this.authenticationService,this.store);
        }else{
            this.authenticationModeHandler = new PasswordOrCodeFlowHandler(this.store);
        }
    }


    public setTitle(newTitle: string) {
        this.titleService.setTitle(newTitle);
    }

    /**
     * On Init the app take trace of the current url and of the authentication status
     * Once the subscription done, send an Action to Check the current authentication status.
     */
    ngOnInit() {
        console.log(`location: ${location.href}`)
        this.authenticationModeHandler.initAuth();
        this.store.pipe(select(selectCurrentUrl)).subscribe(url => this.currentPath = url);
        this.authenticationModeHandler.linkAuthenticationStatus(
            (isAuthenticated: boolean) => {
                this.isAuthenticated$ = isAuthenticated;
            });
        this.store
            .select(selectConfigLoaded)
            .subscribe(loaded => this.configLoaded = loaded);
        this.store
            .select(selectMaxedRetries)
            .subscribe((maxedRetries => this.maxedRetries = maxedRetries));
        this.store.dispatch(new LoadConfig());

        const sTitle = this.store.select(buildConfigSelector('title', this.title));
        sTitle.subscribe(data => {
            this.setTitle(data);
        })
    }


}

export function isSessionAuthFlowSetted2Implicit(): boolean {
    const flow = sessionStorage.getItem('flow');
    return flow && flow === 'implicit';
}


export interface AuthenticationFlowHandler {
    initAuth(): void;

    linkAuthenticationStatus(linker: (isAuthenticated: boolean) => void): void;

    iam():string;
}

export class PasswordOrCodeFlowHandler implements AuthenticationFlowHandler {
    constructor(private store: Store<AppState>) {
    }

    initAuth() {
        const searchCodeString = 'code=';
        const foundIndex = window.location.href.indexOf(searchCodeString);
        if (foundIndex !== -1) {
            this.store.dispatch(new InitAuthStatus({code: window.location.href.substring(foundIndex + searchCodeString.length)}));
        }
    }

    linkAuthenticationStatus(linker: (isAuthenticated: boolean) => void): void {
        this.store.pipe(select(selectExpirationTime), map(isInTheFuture))
            .subscribe(linker);
    }
    iam(){return 'PasswordOrCodeFlowHandler'};
}

export class ImplicitFlowHandler implements AuthenticationFlowHandler {

    constructor(private authenticationService: AuthenticationService, private store: Store<AppState>) {
    }

    initAuth(): void {
        if (isSessionAuthFlowSetted2Implicit()) {
            this.authenticationService.initAndLoadAuth();
        }
    }

    linkAuthenticationStatus(linker: (isAuthenticated: boolean) => void): void {
        this.store.pipe(select(selectIsImplicitallyAuthenticated)).subscribe(linker)
    }
    iam(){return 'ImplicitFlowHandler'};
}