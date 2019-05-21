function interceptProviderRequest({ request, params }) {
    return fetch(request).then((response) => {
      if (!response.ok) {
        throw Error('Error occured with response status ' + response.status);
      }
      self.console.log(response, 'from provider service worker');
      return response;
    }).catch((error) => {
      const response = {
        results: []
      };
      return new Response(JSON.stringify(response), { status: 200 });
    });
  }