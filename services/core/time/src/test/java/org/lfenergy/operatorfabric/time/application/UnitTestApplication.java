/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.time.application;

import org.lfenergy.operatorfabric.time.config.AmqpConfig;
import org.lfenergy.operatorfabric.time.config.CoreConfig;
import org.lfenergy.operatorfabric.time.config.json.JacksonConfig;
import org.lfenergy.operatorfabric.time.controllers.TimeController;
import org.lfenergy.operatorfabric.time.services.TimeService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Import({TimeService.class,AmqpConfig.class,JacksonConfig.class,
   TimeController.class, CoreConfig.class})
public class UnitTestApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = SpringApplication.run(UnitTestApplication.class, args);
        assert (ctx != null);
    }

}