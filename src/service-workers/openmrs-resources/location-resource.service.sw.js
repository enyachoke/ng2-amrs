function interceptLocationsRequest({ request, params }) {
    return fetch(request).then((response) => {
      if (!response.ok) {
        throw Error('Error occured with response status ' + response.status);
      }
      self.console.log(response, 'from location service worker');
      return response;
    }).catch((error) => {
      return metadata_db.find({
        selector: {
          'type': { $eq: 'location' }
        }
      }).then((result) => {
        if (result.docs.length > 0) {
          sendRecordFound({ resourceType: 'location' });
        } else {
          sendRecordNotFound({ resourceType: 'location' });
        }
        let results = {};
        results.results = result.docs;
        return  new Response(JSON.stringify(results), { status: 200 });
      })
     
    });
  }

  function interceptLocationRequest({ request, params }) {
    return fetch(request).then((response) => {
      if (!response.ok) {
        throw Error('Error occured with response status ' + response.status);
      }
      self.console.log(response, 'from location summary service worker');
      return response;
    }).catch((error) => {
      const response = {
        results: []
      };
      return new Response(JSON.stringify(response), { status: 200 });
    });
  }