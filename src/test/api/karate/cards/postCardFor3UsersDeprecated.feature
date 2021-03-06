Feature: Cards


Background: 

  * def signIn = call read('../common/getToken.feature') { username: 'tso1-operator'}
  * def authToken = signIn.authToken

Scenario: Post Card


    * def getCard = 
    """
    function() {

      startDate = new Date().valueOf() + 2*60*60*1000;

		var card = {
				"publisher" : "api_test",
				"processVersion" : "1",
				"process"  :"api_test",
				"processInstanceId" : "process3usersDep",
				"state": "messageState",
				"recipient": {
							"type":"UNION",
							"recipients":[
								{ "type": "USER", "identity":"tso1-operator"},
								{ "type": "USER", "identity":"tso2-operator"},
								{ "type": "USER", "identity":"admin"}
							]
					},
				"severity" : "INFORMATION",
				"startDate" : startDate,
				"summary" : {"key" : "defaultProcess.summary"},
				"title" : {"key" : "defaultProcess.title"},
				"data" : {"message":"a message for 3 users (tso1-operator, tso2-operator and admin)"}
			}
	return JSON.stringify(card);

      }
    """
    * def card = call getCard 




# Push card 
Given url opfabPublishCardUrl + 'cards' 

And request card  
And header Content-Type = 'application/json'
When method post
Then status 201
And match response.count == 1

#get card with user tso1-operator
Given url opfabUrl + 'cards/cards/api_test.process3usersDep' 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.card.data.message == 'a message for 3 users (tso1-operator, tso2-operator and admin)'
And def cardUid = response.card.uid


#get card from archives with user tso1-operator
Given url opfabUrl + 'cards/archives/' + cardUid 
And header Authorization = 'Bearer ' + authToken 
When method get
Then status 200
And match response.data.message == 'a message for 3 users (tso1-operator, tso2-operator and admin)'

