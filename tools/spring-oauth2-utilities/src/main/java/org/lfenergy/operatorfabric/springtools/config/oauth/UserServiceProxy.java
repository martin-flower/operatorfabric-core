/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.springtools.config.oauth;

import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * <p></p>
 * Created on 17/09/18
 *
 * @author davibind
 */
@FeignClient(value = "users")
public interface UserServiceProxy {
    @RequestMapping(value = "/users/{login}",
       produces = { "application/json" },
       method = RequestMethod.GET)
    //
    User fetchUser(@PathVariable("login") String login) ;

}