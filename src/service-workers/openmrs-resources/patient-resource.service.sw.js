function interceptPatientSearchRequest({ request, params }) {
  return fetch(request).then((response) => {
    if (!response.ok) {
      throw Error('Error occured with response status ' + response.status);
    }
    return response;
  }).catch((error) => {
    self.console.warn('Constructing a fallback response due to an error', error);
    // perform patient search from pouch
    let url = request.url;
    let queryParams = getUrlQueryParams(url);
    self.console.log(queryParams.q, 'identifier');

    return patients_db.query('identifier_indexyz/by_identifier', {
      key: queryParams.q,
      include_docs: true
    }).then((results) => {
      if (results.rows.length > 0) {
        sendRecordFound({ resourceType: 'patientSearch' });
      } else {
        sendRecordNotFound({ resourceType: 'patientSearch' });
      }
      let arr = [];
      if (results.rows) {
        for (result of results.rows) {
          arr.push(result.doc.patient);
        }
      }
      let response = {
        results: arr
      };
      return new Response(JSON.stringify(response), { status: 200 });
    }).catch(error => {
      console.log('Error while querying the database with an index', error);
      return new Response(JSON.stringify({}), { status: 500 });
    });
  });
}

function interceptPatientRequest({ request, params }) {
  return fetch(request).then((response) => {
    if (!response.ok) {
      throw Error('Error occured with response status ' + response.status);
    }
    self.console.log(response, 'from patient service worker');
    return response;
  }).catch((error) => {
    return patients_db.find({
      selector: {
        'patient.uuid': { $eq: params['patient_uuid'] }
      }
    }).then((result) => {
      let patient = {};
      if(result.docs.length > 0){
        patient = result.docs[0].patient;
      }else{
        return  new Response(JSON.stringify(patient), { status: 400 });
      }
      return  new Response(JSON.stringify(patient), { status: 200 });
    })
  });


}
