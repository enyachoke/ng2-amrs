function parseObsValues(obsArray) {
  let parsedObs = [];
  for (let obs of obsArray) {
    if (obs.groupMembers) {
      obs.groupMembers = parseObsValues(obs.groupMembers);
    }
    obs.value = parseValue(obs);
    parsedObs.push(obs);
  }
  return parsedObs;
}

function parseValue(obs) {
  let value = ''
  if (obs.value && obs.value.type) {
    switch (obs.value.type) {
      case 'coded':
        value = JSON.parse(obs.value.value);
        break;
      case 'numeric':
        value = obs.value.value;
        break;
      case 'datetime':
        value = obs.value.value;
        break;
      default:
        value = obs.value.value;
    }
  }
  return value;
}

function parseEncounters(result) {
  return result.docs.map((encounter) => {

    if (encounter.obs) {
      encounter.obs = encounter.obs.map((obs) => {
        if (obs.groupMembers) {
          obs.groupMembers = JSON.parse(obs.groupMembers);
        }
        return obs;
      });
      encounter.obs = parseObsValues(encounter.obs);
    }
    return encounter;
  });
}

function interceptEncountersRequest({ request, params }) {
  return fetch(request).then((response) => {
    if (!response.ok) {
      throw Error('Error occured with response status ' + response.status);
    }
    return response;
  }).catch((error) => {
    let url = request.url;
    let queryParams = getUrlQueryParams(url);
    return patients_db.find({
      selector: {
        "type": {
          "$eq": "encounter"
        },
        "person_uuid": {
          "$eq": queryParams['patient']
        }
      }
    }).then((result) => {
      let response = {};
      let encounters = parseEncounters(result);
      response.results = encounters;
      return new Response(JSON.stringify(response), { status: 200 });
    });
  });


}

function interceptEncounterRequest({ request, params }) {
  return fetch(request).then((response) => {
    if (!response.ok) {
      throw Error('Error occured with response status ' + response.status);
    }
    return response;
  }).catch((error) => {
    let url = request.url;
    let queryParams = getUrlQueryParams(url);
    return patients_db.find({
      selector: {
        "type": {
          "$eq": "encounter"
        },
        "uuid": {
          "$eq": params['encounter_uuid']
        }
      }
    }).then((result) => {
      let response = {};
      if (result.docs.length > 0) {
        sendRecordFound({ resourceType: 'vitals' });
      } else {
        sendRecordNotFound({ resourceType: 'vitals' });
      }
      let encounters = parseEncounters(result);
      if (encounters.length > 0) {
        response = encounters[0];
      }
      return new Response(JSON.stringify(response), { status: 200 });
    });
  });


}