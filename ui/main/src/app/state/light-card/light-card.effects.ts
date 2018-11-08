import {Injectable} from '@angular/core';
import {Actions, Effect} from '@ngrx/effects';
import {Action, select, Store} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {
    LightCardActionTypes,
    LoadLightCard,
    LoadLightCardFail,
    LoadLightCardsFail,
    LoadLightCardsSuccess,
    LoadLightCardSuccess
} from '@state/light-card/light-card.actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {CardService} from '@core/services/card.service';
import {LightCard} from '@state/light-card/light-card.model';
import {AppState} from '@state/app.interface';
import * as fromStore from '@state/light-card/index';


@Injectable()
export class LightCardEffects {

    constructor(private actions$: Actions,
                private service: CardService,
                private store: Store<AppState>
    ) {
    }

    @Effect()
    load: Observable<Action> = this.actions$
        .ofType(LightCardActionTypes.LoadLightCards).pipe(
            switchMap(() => this.service.getLightCards()),
            // switchMap(() => this.store.pipe(select(fromStore.getAllLightCards))),
            map((lightCards: LightCard[]) => new LoadLightCardsSuccess({lightCards: lightCards})),
            catchError(err => of(new LoadLightCardsFail()))
        );

    @Effect()
    loadById: Observable<Action> = this.actions$
        .ofType<LoadLightCard>(LightCardActionTypes.LoadLightCard).pipe(
            switchMap(action => this.service.getLightCard(action.payload.id)),
            map((lightCard: LightCard) => new LoadLightCardSuccess({lightCard: lightCard})),
            catchError(err => of(new LoadLightCardFail()))
        );
}
