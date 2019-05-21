function interceptVitalsRequest({ request, params }) {
    return fetch(request).then((response) => {
      if (!response.ok) {
        throw Error('Error occured with response status ' + response.status);
      }
      self.console.log(response, 'from vitals service worker');
      return response;
    }).catch((error) => {
      return patients_db.find({
        selector: {
          "type": {
            "$eq": "vitals"
          },
          "uuid": {
            "$eq": params['patient_uuid']
          }
        }
      }).then((result) => {
        let response = {};
        if (result.docs.length > 0) {
          sendRecordFound({ resourceType: 'vitals' });
        } else {
          sendRecordNotFound({ resourceType: 'vitals' });
        }
        response.result = result.docs;
        return new Response(JSON.stringify(response), { status: 200 });
      });
    });
  }