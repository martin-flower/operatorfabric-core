/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {getTestBed, TestBed} from '@angular/core/testing';

import {ThirdsI18nLoaderFactory, ThirdsService} from './thirds.service';
import {HttpClientTestingModule, HttpTestingController, TestRequest} from '@angular/common/http/testing';
import {environment} from '../../environments/environment';
import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";
import {RouterTestingModule} from "@angular/router/testing";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState} from "../store/index";
import {getOneRandomLigthCard, getRandomMenu} from "../../tests/helpers";
import * as _ from 'lodash';
import {LoadLightCardsSuccess} from "../store/actions/light-card.actions";
import {LightCard} from "../model/light-card.model";
import {AuthenticationService} from "@ofServices/authentication.service";
import {GuidService} from "@ofServices/guid.service";
import {Third, ThirdMenu, ThirdMenuEntry} from "@ofModel/thirds.model";
import {EffectsModule} from "@ngrx/effects";
import {LightCardEffects} from "@ofEffects/light-card.effects";
import {MenuEffects} from "@ofEffects/menu.effects";
import {empty, from, merge, Observable, of, zip} from "rxjs";
import {map, switchMap} from "rxjs/operators";
import clock = jasmine.clock;

describe('Thirds Services', () => {
    let injector: TestBed;
    let thirdsService: ThirdsService;
    let translateService: TranslateService;
    let httpMock: HttpTestingController;
    let store: Store<AppState>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appReducer),
                EffectsModule.forRoot([LightCardEffects, MenuEffects]),
                HttpClientTestingModule,
                RouterTestingModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: ThirdsI18nLoaderFactory,
                        deps: [ThirdsService]
                    },
                    useDefaultLang: false
                })],
            providers: [
                {provide: store, useClass: Store},
                ThirdsService,
                AuthenticationService,
                GuidService
            ]
        });
        injector = getTestBed();
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        // avoid exceptions during construction and init of the component
        // spyOn(store, 'select').and.callFake(() => of('/test/url'));
        httpMock = injector.get(HttpTestingController);
        thirdsService = TestBed.get(ThirdsService);
        translateService = injector.get(TranslateService);
        translateService.addLangs(["en", "fr"]);
        translateService.setDefaultLang("en");
        translateService.use("en");
    });
    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        console.log('should be created')

        expect(thirdsService).toBeTruthy();
    });
    describe('#computeThirdsMenu', () => {
        it('should return error on network problem', () => {
            console.log('should return error on network problem')

            thirdsService.computeThirdsMenu().subscribe(
                result => fail('expected error not raised'),
                error => expect(error.status).toBe(0));
            let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/`);
            expect(calls.length).toEqual(1);
            calls[0].error(new ErrorEvent('Network error'))
        });
        it('should compute menu from thirds data', () => {
            console.log('should return error on network problem')

            thirdsService.computeThirdsMenu().subscribe(
                result => {
                    expect(result.length).toBe(2);
                    expect(result[0].label).toBe('tLabel1');
                    expect(result[0].id).toBe('t1');
                    expect(result[1].label).toBe('tLabel2');
                    expect(result[1].id).toBe('t2');
                    expect(result[0].entries.length).toBe(2);
                    expect(result[1].entries.length).toBe(1);
                    expect(result[0].entries[0].label).toBe('label1');
                    expect(result[0].entries[0].id).toBe('id1');
                    expect(result[0].entries[0].url).toBe('link1');
                    expect(result[0].entries[1].label).toBe('label2');
                    expect(result[0].entries[1].id).toBe('id2');
                    expect(result[0].entries[1].url).toBe('link2');
                    expect(result[1].entries[0].label).toBe('label3');
                    expect(result[1].entries[0].id).toBe('id3');
                    expect(result[1].entries[0].url).toBe('link3');
                });
            let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/`);
            expect(calls.length).toEqual(1);
            calls[0].flush([
                new Third(
                    't1', '', 'tLabel1', [], [], [],
                    [new ThirdMenuEntry('id1', 'label1', 'link1'),
                        new ThirdMenuEntry('id2', 'label2', 'link2')]
                ),
                new Third(
                    't2', '', 'tLabel2', [], [], [],
                    [new ThirdMenuEntry('id3', 'label3', 'link3')]
                )
            ])
        });

    });
    describe('#fetchHbsTemplate', () => {
        const templates = {
            en: 'English template {{card.data.name}}',
            fr: 'Template Français {{card.data.name}}'
        };
        it('should return different files for each language', () => {
            console.log('should return different files for each language')

            thirdsService.fetchHbsTemplate('testPublisher', '0', 'testTemplate', 'en')
                .subscribe((result) => expect(result).toEqual('English template {{card.data.name}}'))
            thirdsService.fetchHbsTemplate('testPublisher', '0', 'testTemplate', 'fr')
                .subscribe((result) => expect(result).toEqual('Template Français {{card.data.name}}'))
            let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/testPublisher/templates/testTemplate`)
            expect(calls.length).toEqual(2);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush(templates[call.request.params.get('locale')]);
            })
        })
    });
    describe('#fetchI18nJson', () => {
        it('should return json object with single en language', () => {
            console.log('should return json object with single en language')

            thirdsService.fetchI18nJson('testPublisher', '0', ['en'])
                .subscribe(result => {
                    expect(result.en.testPublisher['0'].menu.feed).toEqual('Feed')
                    expect(result.en.testPublisher['0'].menu.archives).toEqual('Archives')
                });

            let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/testPublisher/i18n`)
            expect(calls.length).toEqual(1);
            expect(calls[0].request.method).toBe('GET');
            calls[0].flush({
                menu: {
                    feed: 'Feed',
                    archives: 'Archives'
                }
            });
        });
        it('should return json object with multiple languages', () => {
            console.log('should return json object with multiple languages')

            thirdsService.fetchI18nJson('testPublisher', '0', ['en', 'fr'])
                .subscribe(result => {
                    expect(result.en.testPublisher['0'].menu.feed).toEqual('Feed')
                    expect(result.en.testPublisher['0'].menu.archives).toEqual('Archives')
                    expect(result.fr.testPublisher['0'].menu.feed).toEqual('Flux de Cartes')
                    expect(result.fr.testPublisher['0'].menu.archives).toEqual('Archives')
                });

            let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/testPublisher/i18n`)
            expect(calls.length).toEqual(2);

            expect(calls[0].request.method).toBe('GET');
            expect(calls[0].request.params.get('locale')).toEqual('en');
            calls[0].flush({
                menu: {
                    feed: 'Feed',
                    archives: 'Archives'
                }
            });
            // req = httpMock.expectOne(`${environment.urls.thirds}/thirds/testPublisher/i18n`)
            expect(calls[1].request.method).toBe('GET');
            expect(calls[1].request.params.get('locale')).toEqual('fr');
            calls[1].flush({
                menu: {
                    feed: 'Flux de Cartes',
                    archives: 'Archives'
                }
            });
        });
    });
    if(false)
    it('should update translate service upon menu update', (done) => {
        console.log('should update translate service upon new menu update')

        clock().install()

        let exp = new RegExp(`${environment.urls.thirds}/([0-9a-zA-Z]+)/i18n`);

        let menu: ThirdMenu[] = getRandomMenu();

        let i18n = {}
        for (let i in menu) {
            _.set(i18n, `en.${menu[i].id}.${menu[i].version}.${menu[i].label}`, `${i} Third`);
            _.set(i18n, `fr.${menu[i].id}.${menu[i].version}.${menu[i].label}`, `Tier ${i}`);
            for (let j in menu[i].entries) {
                _.set(i18n, `en.${menu[i].id}.${menu[i].version}.${menu[i].entries[j].label}`, `${i} Third, ${j} menu`);
                _.set(i18n, `fr.${menu[i].id}.${menu[i].version}.${menu[i].entries[j].label}`, `Tier ${i}, menu ${j}`);
            }
        }
        const setTranslationSpy = spyOn(translateService, "setTranslation").and.callThrough();
        const getLangsSpy = spyOn(translateService, "getLangs").and.callThrough();

        thirdsService.loadI18nForMenuEntries(menu).subscribe(()=>{
            function extractAllKeys(t: ThirdMenu) {
                let keys = [`${thirdPrefix(t)}${t.label}`];
                for (let e of t.entries)
                    keys.push(`${thirdPrefix(t)}${e.label}`);
                return keys;
            }

            for (let m of menu) {
                let previous = empty();
                const keys = extractAllKeys(m);
                const frObs:Observable<string[]> = from(keys)
                    .pipe(
                        switchMap(k=>{
                            translateService.use('fr');
                            return zip(of('fr'),of(k),translateService.get(k));
                        })
                    );
                const enObs:Observable<string[]> = from(keys)
                    .pipe(
                        switchMap(k=>{
                            translateService.use('en');
                            return zip(of('en'),of(k),translateService.get(k));
                        })
                    );
                merge(
                    frObs,
                    enObs
                ).subscribe(array=>
                    expect(array[2]).toBe(_.get(i18n,`${array[0]}.${array[1]}`)),
                    undefined,
                    ()=>done());
                }
        });
        clock().tick(5000);
            let i18nMenuCalls = httpMock.match(req => exp.test(req.url));
            expect(i18nMenuCalls.length).toBe(2 * menu.length);
            for (let i in i18nMenuCalls) {
                let matchedRequest = i18nMenuCalls[i];
                let name = exp.exec(matchedRequest.request.url)[1];
                let version = matchedRequest.request.params.get('version');
                flushI18nJson(matchedRequest, i18n, `${name}.${version}`);
            }
            clock().uninstall()
        // setTimeout(() => {
        // }, 4000);
    });
    it('should update translate service upon new card arrival', (done) => {
        console.log('should update translate service upon new card arrival')

        let card = getOneRandomLigthCard();
        let i18n = {}
        _.set(i18n, `en.${card.title.key}`, 'en title');
        _.set(i18n, `en.${card.summary.key}`, 'en summary');
        _.set(i18n, `fr.${card.title.key}`, 'titre fr');
        _.set(i18n, `fr.${card.summary.key}`, 'résumé fr');
        const setTranslationSpy = spyOn(translateService, "setTranslation").and.callThrough();
        const getLangsSpy = spyOn(translateService, "getLangs").and.callThrough();
        store.dispatch(new LoadLightCardsSuccess({lightCards: [card]}));
        let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/testPublisher/i18n`);
        expect(calls.length).toEqual(2);

        expect(calls[0].request.method).toBe('GET');
        flushI18nJson(calls[0], i18n);
        expect(calls[1].request.method).toBe('GET');
        flushI18nJson(calls[1], i18n);
        setTimeout(() => {
            expect(setTranslationSpy.calls.count()).toEqual(2);
            translateService.use('fr')
            translateService.get(cardPrefix(card) + card.title.key)
                .subscribe(value => expect(value).toEqual('titre fr'))
            translateService.get(cardPrefix(card) + card.summary.key)
                .subscribe(value => expect(value).toEqual('résumé fr'))
            translateService.use('en')
            translateService.get(cardPrefix(card) + card.title.key)
                .subscribe(value => expect(value).toEqual('en title'))
            translateService.get(cardPrefix(card) + card.summary.key)
                .subscribe(value => expect(value).toEqual('en summary'))
            done();
        }, 1000);
    });
    it('should update translate service upon new card arrival only if new publisher detected', (done) => {
        console.log('spec log: created');
        let card = getOneRandomLigthCard();
        let i18n = {}
        _.set(i18n, `en.${card.title.key}`, 'en title');
        _.set(i18n, `en.${card.summary.key}`, 'en summary');
        _.set(i18n, `fr.${card.title.key}`, 'titre fr');
        _.set(i18n, `fr.${card.summary.key}`, 'résumé fr');
        const setTranslationSpy = spyOn(translateService, "setTranslation").and.callThrough();
        const getLangsSpy = spyOn(translateService, "getLangs").and.callThrough();
        store.dispatch(new LoadLightCardsSuccess({lightCards: [card]}));
        let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/testPublisher/i18n`);
        expect(calls.length).toEqual(2);

        expect(calls[0].request.method).toBe('GET');
        flushI18nJson(calls[0], i18n);
        expect(calls[1].request.method).toBe('GET');
        flushI18nJson(calls[1], i18n);
        store.dispatch(new LoadLightCardsSuccess({lightCards: [card]}));
        httpMock.expectNone(`${environment.urls.thirds}/testPublisher/i18n`);
        setTimeout(() => {
            expect(setTranslationSpy.calls.count()).toEqual(2);
            translateService.use('fr')
            translateService.get(cardPrefix(card) + card.title.key)
                .subscribe(value => expect(value).toEqual('titre fr'))
            translateService.get(cardPrefix(card) + card.summary.key)
                .subscribe(value => expect(value).toEqual('résumé fr'))
            translateService.use('en')
            translateService.get(cardPrefix(card) + card.title.key)
                .subscribe(value => expect(value).toEqual('en title'))
            translateService.get(cardPrefix(card) + card.summary.key)
                .subscribe(value => expect(value).toEqual('en summary'))
            done();
        }, 1000);
    });

});

function flushI18nJson(request: TestRequest, json: any, prefix?: string) {
    const locale = request.request.params.get('locale');
    console.log(`flushing ${request.request.urlWithParams}`);
    console.log(`request is ${request.cancelled ? '' : 'not'} canceled`);
    request.flush(_.get(json, prefix ? `${locale}.${prefix}` : locale));
}

function cardPrefix(card: LightCard) {
    return card.publisher + '.' + card.publisherVersion + '.';
}

function thirdPrefix(menu: ThirdMenu) {
    return menu.id + '.' + menu.version + '.';
}