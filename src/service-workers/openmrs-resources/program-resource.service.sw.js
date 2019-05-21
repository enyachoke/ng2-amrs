function interceptProgramRequest({ request, params }) {
  return fetch(request).then((response) => {
    if (!response.ok) {
      throw Error('Error occured with response status ' + response.status);
    }
    self.console.log(response, 'from program service worker');
    return response;
  }).catch((error) => {
    return metadata_db.find({
      selector: {
        "type": {
          "$eq": "program"
        }
      }
    }).then((result) => {
      let response = {};
      if (result.docs.length > 0) {
        sendRecordFound({ resourceType: 'programs' });
      } else {
        sendRecordNotFound({ resourceType: 'programs' });
      }
      response.results = result.docs;
      self.console.log(response, 'from program service worker', result.docs);
      return new Response(JSON.stringify(response), { status: 200 });
    });
  });
}

function interceptProgramEnrollMentsRequest({ request, params }) {
  return fetch(request).then((response) => {
    if (!response.ok) {
      throw Error('Error occured with response status ' + response.status);
    }
    return response;
  }).catch((error) => {
    let url = request.url;
    let queryParams = getUrlQueryParams(url);
    self.console.log('queryParams', queryParams);
    return patients_db.find({
      selector: {
        "type": {
          "$eq": "program_enrollment"
        },
        "person_uuid": {
          "$eq": queryParams['patient']
        }
      }
    }).then((result) => {
      if (result.docs.length > 0) {
        sendRecordFound({ resourceType: 'programEnrollments' });
      } else {
        sendRecordNotFound({ resourceType: 'programEnrollments' });
      }
      let response = {};
      response.results = result.docs.map(function (el) {
        let o = Object.assign({}, el);
        if (!('dateCompleted' in o)) {
          o.dateCompleted = null;
          o.voided = false;
        }
        return o;
      });
      self.console.log(response, 'from program service worker', result.docs);
      return new Response(JSON.stringify(response), { status: 200 });
    });
  });
}
