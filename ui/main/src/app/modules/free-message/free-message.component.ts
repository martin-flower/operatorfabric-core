/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {CardService} from "@ofServices/card.service";
import {UserService} from "@ofServices/user.service";
import {selectIdentifier} from "@ofSelectors/authentication.selectors";
import {map, switchMap, takeUntil, withLatestFrom} from "rxjs/operators";
import {Card} from "@ofModel/card.model";
import {I18n} from "@ofModel/i18n.model";
import {Observable, Subject} from "rxjs";
import {selectProcesses} from "@ofSelectors/process.selector";
import {Process, State} from "@ofModel/processes.model";
import {transformToTimestamp} from "../archives/components/archive-filters/archive-filters.component";
import {TimeService} from "@ofServices/time.service";
import {selectAllEntities} from "@ofSelectors/user.selector";
import {Entity, User} from "@ofModel/user.model";
import {Severity} from "@ofModel/light-card.model";
import {getRandomAlphanumericValue} from "@tests/helpers";

@Component({
    selector: 'of-free-message',
    templateUrl: './free-message.component.html'
})
export class FreeMessageComponent {

    messageForm: FormGroup;

    severityOptions = Object.keys(Severity).map(severity =>  {return {
        value : severity,
        label : new I18n("free-message.options.severity."+severity)
    }});
    processOptions$: Observable<any>;
    stateOptions$: Observable<any>;
    entityOptions$: Observable<any>;

    unsubscribe$: Subject<void> = new Subject<void>();

    constructor(private store: Store<AppState>,
                private formBuilder: FormBuilder,
                private cardService: CardService,
                private userService: UserService,
                private timeService: TimeService) {

        this.messageForm = new FormGroup({
                severity: new FormControl(''),
                process: new FormControl(''),
                state: new FormControl(''),
                startDate: new FormControl(''),
                endDate: new FormControl(''),
                comment: new FormControl(''),
                entities: new FormControl('')
            }
        );

        this.processOptions$ = this.store.select(selectProcesses).pipe(
            takeUntil(this.unsubscribe$),
            map((allProcesses: Process[]) => {
                return allProcesses.map((proc: Process) => {
                    let _i18nPrefix = proc.id+"."+proc.version+".";
                    let label = proc.name?(new I18n(_i18nPrefix+proc.name.key, proc.name.parameters)):proc.id;
                    return {
                        value: proc.id,
                        label: label
                    };
                });
            })
        );

        this.stateOptions$ = this.messageForm.get('process').valueChanges.pipe(
            withLatestFrom(this.store.select(selectProcesses)),
            map(([selectedProcessId, allProcesses]: [string, Process[]]) => {
                let selectedProcess = allProcesses.find(process => process.id === selectedProcessId) //TODO What if selectedProcessId is null ? == vs ===
                if(selectedProcess) {
                    return Object.entries(selectedProcess.states).map(([id, state]: [string, State] ) => {
                        let label = state.name?(new I18n(this.getI18nPrefixFromProcess(selectedProcess)+state.name.key, state.name.parameters)):id;
                        return {
                            value: id,
                            label: label
                        };
                    });
                } else {
                    return [];
                }
            })
        );

        this.entityOptions$ = this.store.select(selectAllEntities).pipe(
            takeUntil(this.unsubscribe$),
            map((allEntities: Entity[]) => allEntities.map( (entity: Entity) => {
                    return{value: entity.id, label: entity.name};
                })
            )
        );
    }

    onSubmitForm() {
        const formValue = this.messageForm.value;

        this.store.select(selectIdentifier)
            .pipe(
                switchMap(id => this.userService.askUserApplicationRegistered(id)),
                withLatestFrom(this.store.select(selectProcesses))
            )
            .subscribe(([user,allProcesses]:[User,Process[]])=> {
                let selectedProcess = allProcesses.find(process => process.id === formValue['process']);
                let processVersion = selectedProcess.version;
                let selectedState = selectedProcess.states[formValue['state']];
                let titleKey = selectedState.name?selectedProcess.name:(new I18n(formValue['state']));

                const now = new Date().getTime();

                const card: Card = {
                    uid: null,
                    id: null,
                    publishDate: null,
                    publisher: user.entities[0],
                    processVersion: processVersion,
                    process: formValue['process'],
                    processInstanceId: getRandomAlphanumericValue(6,6), //TODO Handle it properly (see comment in JIRA)
                    state: formValue['state'],
                    startDate: formValue['startDate']?this.createTimestampFromValue(formValue['startDate']):now,
                    endDate: this.createTimestampFromValue(formValue['endDate']),
                    severity: formValue['severity'],
                    hasBeenAcknowledged: false,
                    hasBeenRead: false,
                    entityRecipients: [formValue['entities']],
                    externalRecipients: null,
                    title: titleKey,
                    summary: new I18n("SUMMARY CONTENT TO BE DEFINED"), //TODO
                    data: {
                        comment: formValue['comment']
                    },
                    recipient: null
                };

                this.cardService.postResponseCard(card)
                    .subscribe(
                        rep => {
                            console.log(rep);
                            //TODO
                        },
                        err => {
                            console.error(err);
                            //TODO
                        }
                    )
            });

    }

    createTimestampFromValue = (value: any): number => {
        const {date, time} = value;
        if(date) {
            return this.timeService.toNgBNumberTimestamp(transformToTimestamp(date, time));
            //TODO Why do we need 2 transformations? What is an NgBTimestamp vs a plain Timestamp?
        } else {
            return null;
        }
    }

    getI18nPrefixFromProcess = (process: Process): string => {
        return process.id+"."+process.version+".";
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
