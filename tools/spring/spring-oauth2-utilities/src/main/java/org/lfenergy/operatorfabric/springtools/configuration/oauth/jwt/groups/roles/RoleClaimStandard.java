package org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups.roles;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Define the structure of the RoleClaimStandard, the most common use case, which is a key/value system.
 * @author chengyli
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper=true)
public class RoleClaimStandard extends RoleClaim {
	
	public RoleClaimStandard(String path) {
		super(path);
	}

	/**
	 * Retrieve the value of the node element
	 */	
	@Override
	public List<String> computeNodeElementRole(JsonNode jsonNodeElement) {
		List<String> listGroupsResult = new ArrayList<>();
		listGroupsResult.add(jsonNodeElement.asText());	
		return listGroupsResult;
	}
	
	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append("RoleClaimStandard(path="+path+")");
		return sb.toString();
	}
	 
}