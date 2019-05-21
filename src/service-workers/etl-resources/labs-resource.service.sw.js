function interceptPatientLabOrdersRequest({ request, params }) {
  return fetch(request).then((response) => {
    if (!response.ok) {
      throw Error('Error occured with response status ' + response.status);
    }
    return response;
  }).catch((error) => {
    let url = request.url;
    let queryParams = getUrlQueryParams(url);
    console.log('Patient Lab order',queryParams['patientUuid']);
    return patients_db.find({
      selector: {
        "type": {
          "$eq": "lab_orders"
        },
        "person_uuid": {
          "$eq": queryParams['patientUuid']
        }
      }
    }).then((result) => {
      let response = {};
      if (result.docs.length > 0) {
        sendRecordFound({ resourceType: 'labOrders' });
      } else {
        sendRecordNotFound({ resourceType: 'labOrders' });
      }
      response.result = result.docs;
      return new Response(JSON.stringify(response), { status: 200 });
    });
  });
}


function interceptPatientLabDataRequest({ request, params }) {
  return fetch(request).then((response) => {
    if (!response.ok) {
      throw Error('Error occured with response status ' + response.status);
    }
    return response;
  }).catch((error) => {
    console.log('Patient Lab data',params['patient_uuid']);
    return patients_db.find({
      selector: {
        "type": {
          "$eq": "labs"
        },
        "person_uuid": {
          "$eq": params['patient_uuid']
        }
      }
    }).then((result) => {
      let response = {};
      response.result = result.docs;
      return new Response(JSON.stringify(response), { status: 200 });
    });
  });
}