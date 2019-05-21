function interceptHIVSummaryRequest({ request, params }) {
  return fetch(request).then((response) => {
    if (!response.ok) {
      throw Error('Error occured with response status ' + response.status);
    }
    self.console.log(response, 'from hiv summary service worker');
    return response;
  }).catch((error) => {
    return patients_db.find({
      selector: {
        "type": {
          "$eq": "hiv_summary"
        },
        "uuid": {
          "$eq": params['patient_uuid']
        }
      }
    }).then((result) => {
      let results = {};
      if (result.docs.length > 0) {
        sendRecordFound({ resourceType: 'hivSummary' });
      } else {
        sendRecordNotFound({ resourceType: 'hivSummary' });
      }
      results.result = result.docs;
      return new Response(JSON.stringify(results), { status: 200 });
    });
  });
}