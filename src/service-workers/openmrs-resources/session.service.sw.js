function decryptAuth(username, password) {
    var dbName = `users`
    var db = new PouchDB(dbName);
    return db.get(username).then((data) => {
        // decrypt response using the password
        let encryptedResponse = data['userdata'];
        return decrypt(password, encryptedResponse).then((decryptedResponse) => {
            // successfully authenticated
            return JSON.parse(decryptedResponse);
        }).catch((error) => {
            // authentication error
            throw new Error('Unable to decrypt response given the passphrase');
        });
    });
}

function interceptAuthRequest({ request, params }) {
    return fetch(request).then((response) => {
        if (!response.ok) {
            throw Error('Error occured with response status ' + response.status);
        }
        return response;
    }).catch((error) => {
        let authHeader = request.headers.get('Authorization');
        let credentials = getCredentialsFromAuthHeader(authHeader);
        if (credentials !== null) {
            return decryptAuth(credentials.username, credentials.password)
                .then((response) => {
                    return new Response(JSON.stringify(response), {
                        headers: { 'Content-Type': 'application/json' }, status: 200
                    })
                }).catch((error) => {
                    return new Response(JSON.stringify({ "authenticated": false }, {
                        headers: { 'Content-Type': 'application/json' }, status: 401
                    }));
                });
        }
    });
}