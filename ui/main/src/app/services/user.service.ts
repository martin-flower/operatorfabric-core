/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from "@angular/core";
import { environment } from '@env/environment';
import { Observable, of, throwError } from 'rxjs';
import { User } from '@ofModel/user.model';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import { selectAuthenticationState } from '@ofStore/selectors/authentication.selectors';
import { AuthenticationService } from './authentication/authentication.service';
import { buildConfigSelector } from '@ofStore/selectors/config.selectors';
import { switchMap } from 'rxjs/operators';



@Injectable()
export class UserService {

    readonly userUrl : string;

    /**
     * @constructor
     * @param httpClient - Angular build-in
     */
    constructor(private httpClient : HttpClient, private store: Store<AppState>, private authService: AuthenticationService) {
        this.userUrl = `${environment.urls.users}`;
    }

    askUserApplicationRegistered(user : string) : Observable<User> {
        console.log("user in askUserApplicationRegistered service : " + user);
        return this.httpClient.get<User>(`${this.userUrl}/users/${user}`);
    }

    askCreateUser(userData : User) : Observable<User> {
        console.log("user in askCreateUser service : " + userData.login);
        return this.httpClient.put<User>(`${this.userUrl}/users/${userData.login}`, userData);
    }

    // -------- [OC-932] In the Archives filters, make a filter field visible or not based on the user group(s) -------- //
    getUserGroups(): Observable<Array<Array<string>>> {
        
        let token = '';
        let jwt = null;
        
        return this.store.select(selectAuthenticationState)
            .pipe(
                switchMap(authState => {
                    token = authState.token;
                    jwt = this.authService.decodeToken(token);
                    return this.store.select(buildConfigSelector('security'));
                }),
                switchMap(oauth2Conf => {

                    if (oauth2Conf.jwt.groups.mode == 'JWT') {
                        let rolesClaim = oauth2Conf.jwt.groups.rolesClaim;
                        let rolesClaimStandard = this.getGroupsFromJwtByKey(jwt, 'rolesClaimStandard', rolesClaim);
                        let rolesClaimStandardArray = this.getGroupsFromJwtByKey(jwt, 'rolesClaimStandardArray', rolesClaim);
                        
                        return of([].concat([rolesClaimStandard], rolesClaimStandardArray));
                    } else {
                        return throwError("Only JWT mode handled");
                    }
                })
            )
    }

    private getGroupsFromJwtByKey(jwt, key, rolesClaim) {
        
        let groups = [];
        for (let claim of rolesClaim[key]) {
            groups = jwt;
            for (let key of claim.path.split('/')) {
                groups = groups[key];
            }
        }

        return groups;
    }
    // ------------------------------------------------------------------------------------------------------------------ //
}