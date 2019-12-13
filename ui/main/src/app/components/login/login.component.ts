/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Store} from '@ngrx/store';
import {TryToLogIn} from '@ofActions/authentication.actions';
import {AppState} from '@ofStore/index';
import {buildConfigSelector} from "@ofSelectors/config.selectors";
import {filter, map} from "rxjs/operators";
import {Observable} from "rxjs";
import {AuthenticationService} from "@ofServices/authentication/authentication.service";
import {selectMessage} from "@ofSelectors/authentication.selectors";
import {Message, MessageLevel} from "@ofModel/message.model";
import {OAuthService} from "angular-oauth2-oidc";

@Component({
    selector: 'of-login',
    templateUrl: './login.component.html',
    styles: ['.btn-primary {margin-right: 8px;}']
})
export class LoginComponent implements OnInit {

    hide: boolean;
    userForm: FormGroup;
    codeConf$:Observable<string>;
    useCodeOrImplicitFlow$: Observable<boolean>;
    flowMoving: FlowExecutor;
    loginMessage: Message;
    // codeProvider$: Observable<any>;
    codeProvider: any;
    /* istanbul ignore next */
    constructor( private store: Store<AppState>, private service: AuthenticationService) {}

    ngOnInit() {
        this.codeConf$ = this.store.select(buildConfigSelector('security.oauth2.flow.mode'));
        this.codeConf$.subscribe(flowMod =>{
            if(flowMod === 'CODE'){
                this.flowMoving = new CodeFlowExecutor(this.service);
            }else if (flowMod === 'IMPLICIT'){
                this.flowMoving = new ImplicitFlowExecutor( this.service);
            }
        })
        this.useCodeOrImplicitFlow$ = this.codeConf$.pipe(map(flowMode=>flowMode === 'CODE'|| flowMode === 'IMPLICIT'));
        this.store.select(selectMessage).pipe(filter(m=>m!=null && m.level==MessageLevel.ERROR))
            .subscribe(m=>this.loginMessage=m);
        this.store.select(buildConfigSelector('security.oauth2.flow.provider'))
            .subscribe(provider=>this.codeProvider={name:provider});
        this.hide = true;
        this.userForm = new FormGroup({
                identifier: new FormControl(''),
                password: new FormControl('')
            }
        );
    }



    onSubmit(): void {
        if (this.userForm.valid) {
            const username = this.userForm.get('identifier').value;
            const password = this.userForm.get('password').value;
            this.store.dispatch(new TryToLogIn({username: username, password: password}));
        }
    }

    resetForm(): void {
        this.userForm.reset();
    }

    codeFlow(): void{
        this.flowMoving.move();
    }

}

interface FlowExecutor {
    move():void;
}

class ImplicitFlowExecutor implements FlowExecutor{
    constructor(private oauthService: AuthenticationService){}
    move(){
        this.oauthService.moveToImplicitFlowLoginPage();
    }
}

class CodeFlowExecutor implements FlowExecutor{
    constructor(private oauthService: AuthenticationService){}
    move(){
        this.oauthService.moveToCodeFlowLoginPage()
    }
}