#!/bin/bash

url=http://localhost:2102/cards

card='{
  "uid": null,
  "id": null,
  "publisher": "TEST",
  "publisherVersion": "1",
  "process": "process",
  "processId": "processId",
  "state": "state",
  "publishDate": 1589376144000,
  "deletionDate": null,
  "lttd": null,
  "startDate": 1589580000000,
  "endDate": 1590184800000,
  "severity": "ACTION",
  "media": null,
  "tags": [
    "tag1"
  ],
  "timeSpans": [
    {
      "start": 1589376144000,
      "end": 1590184800000,
      "display": null
    }
  ],
  "details": null,
  "title": {
    "key": "cardFeed.title",
    "parameters": {
      "title": "Test action"
    }
  },
  "summary": {
    "key": "cardFeed.summary",
    "parameters": {
      "summary": "Test the action process"
    }
  },
  "recipient": {
    "type": "UNION",
    "recipients": [
      {
        "type": "GROUP",
        "recipients": null,
        "identity": "RTE",
        "preserveMain": null
      }
    ],
    "identity": null,
    "preserveMain": null
  },
  "mainRecipient": null,
  "userRecipients": null,
  "groupRecipients": null,
  "data": {
    "data1": "data1 content"
  }
}'

echo -e $card > /tmp/tmpCard.json

curl --header "Content-Type: application/json" \
      --request POST \
      --data @/tmp/tmpCard.json \
      $url
