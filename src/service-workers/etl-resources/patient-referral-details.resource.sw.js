function interceptPatientReferralDetailsRequest({ request, params }) {
    return fetch(request).then((response) => {
      if (!response.ok) {
        throw Error('Error occured with response status ' + response.status);
      }
      self.console.log(response, 'from location service worker');
      return response;
    }).catch((error) => {
      const response = {
      };
      return new Response(JSON.stringify(response), { status: 200 });
    });
  }