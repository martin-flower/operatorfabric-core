/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.repositories;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.cards.Application;
import org.lfenergy.operatorfabric.cards.model.CardData;
import org.lfenergy.operatorfabric.cards.model.I18nData;
import org.lfenergy.operatorfabric.cards.model.SeverityEnum;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import javax.validation.Valid;
import java.time.Instant;

/**
 * <p></p>
 * Created on 24/07/18
 *
 * @author davibind
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = Application.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles(profiles = {"native","test"})
//@Disabled
@Tag("end-to-end")
@Tag("mongo")
public class CardRepositoryShould {

    @Autowired
    private CardRepository repository;

    @AfterEach
    public void clean(){
        repository.deleteAll().subscribe();
    }

    @Test
    public void persistCard(){
        CardData card =
           CardData.builder()
              .processId("PROCESS")
              .publisher("PUBLISHER")
              .startDate(Instant.now().toEpochMilli())
              .severity(SeverityEnum.ALARM)
              .title(I18nData.builder().key("title").build())
              .summary(I18nData.builder().key("summary").build())
              .build();
        repository.save(card).subscribe();
        Mono<CardData> result = repository.findById("PUBLISHER_PROCESS");
        StepVerifier.create(result)
           .expectNextMatches(c->card.getId().equals(c.getId()));
    }

}