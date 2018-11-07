/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {AfterContentInit, AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {I18nData, LightCard} from '@state/light-card/light-card.model';

@Component({
    selector: 'app-light-card-details',
    templateUrl: './light-card-details.component.html',
    styleUrls: ['./light-card-details.component.css']
})
export class LightCardDetailsComponent {

   @Input() public lightCard: LightCard;
    constructor() {}

}