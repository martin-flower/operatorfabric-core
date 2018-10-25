/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.time.config;

import org.springframework.amqp.core.ExchangeBuilder;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * <p></p>
 * Created on 29/06/18
 *
 * @author davibind
 */
@Configuration
public class AmqpConfig {

    static final String EXCHANGE_NAME = "timeExchange";

    @Bean
    public FanoutExchange timeExchange(){
        return (FanoutExchange) ExchangeBuilder.fanoutExchange(EXCHANGE_NAME).build();
    }
}