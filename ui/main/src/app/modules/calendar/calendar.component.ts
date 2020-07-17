/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {AppState} from "@ofStore/index";
import {select,Store} from "@ngrx/store";
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as feedSelectors from '@ofSelectors/feed.selectors';
import { Component, ViewChild, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGrigPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; 
import allLocales from '@fullcalendar/core/locales-all';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import listPlugin from '@fullcalendar/list';
import { Router } from '@angular/router';
import {selectCurrentUrl} from '@ofStore/selectors/router.selectors';
import {TranslateService} from '@ngx-translate/core';




@Component({
  selector: 'of-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit,OnDestroy,AfterViewInit {

  @ViewChild('calendar',null) calendarComponent: FullCalendarComponent; // the #calendar in the template

  private unsubscribe$ = new Subject<void>();
  private currentPath : string;
  calendarVisible = true;
  calendarPlugins = [dayGridPlugin, timeGrigPlugin, interactionPlugin,bootstrapPlugin,listPlugin];
  calendarWeekends = true;
  locales = allLocales;
  themeSystem = 'bootstrap';
  calendarEvents: EventInput[] = [
   
  ];

  constructor(private store: Store<AppState>,private router: Router,private translate: TranslateService

    ) { }
  
    ngOnInit() {
      this.initDataPipe();
      this.store.select(selectCurrentUrl).pipe(takeUntil(this.unsubscribe$)).subscribe(url => {
        if (url) {
            const urlParts = url.split('/');
            this.currentPath = urlParts[0];
        }
      });
  
    }  

    ngAfterViewInit()
    {
      console.log("After view init");
      this.calendarComponent.getApi().setOption('locale','fr');
    }
    


  initDataPipe(): void {
    this.store.pipe(select((feedSelectors.selectFilteredFeed)))
    .pipe(takeUntil(this.unsubscribe$),debounceTime(200), distinctUntilChanged())
    .subscribe(cards => this.processCards(cards));
  }

  processCards(cards) {
    console.log("cards=", cards);
    for (const card of cards) {


      let color;
      if (card.severity == 'INFORMATION') color = 'blue';
      if (card.severity == 'COMPLIANT') color = 'green';
      if (card.severity == 'ACTION') color = 'orange';
      if (card.severity == 'ALARM') color = 'red';


      this.translate.get(card.process + '.' + card.processVersion + '.' + card.title.key).subscribe(title => {
        if (card.timeSpans)  for (const timespan of card.timeSpans) {
          let startDate = new Date(timespan.start.valueOf());
          
          let endDate = new Date(timespan.start.valueOf() + 1800000);
          if (timespan.end) endDate = new Date(timespan.start.valueOf())
          console.log("Date start = ", startDate);
          console.log("Date end = ", endDate);
          this.calendarEvents = this.calendarEvents.concat({ // add new event data. must create new array
            id: card.id,
            title: title,
            start: startDate,
            end: endDate,
            backgroundColor: color,
            allDay: false
          })
        }
      }
      );
    }
  }


  handleDateClick(arg) {
    if (confirm('Would you like to add an event to ' + arg.dateStr + ' ?')) {
      this.calendarEvents = this.calendarEvents.concat({ // add new event data. must create new array
        title: 'New Event',
        start: arg.date,
        allDay: arg.allDay
      })
    }
  }

  selectCard(info)
  {
    console.log("select ", info.event.id);
    console.log("this.currentPath = ",this.currentPath);
    this.router.navigate([this.currentPath + '/feed', 'cards', info.event.id]);
    //this.scrollToSelectedCard();

  }

  scrollToSelectedCard()
  {
    // wait for 500ms to be sure the card is selected and scroll to the card with his id (opfab-selected-card)
    setTimeout(() => { document.getElementById("opfab-selected-card").scrollIntoView({behavior: "smooth", block: "center"});},500);
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
}

}