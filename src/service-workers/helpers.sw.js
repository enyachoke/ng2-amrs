function getUrlQueryParams(search) {
  let hashes = search.slice(search.indexOf('?') + 1).split('&')
  let params = {}
  hashes.map(hash => {
    let [key, val] = hash.split('=')
    params[key] = decodeURIComponent(val)
  })
  return params
}

function getCredentialsFromAuthHeader(authHeader) {
  if (authHeader != null && authHeader.toLowerCase().startsWith('basic')) {
    // Authorization: Basic base64credentials
    let base64Credentials = authHeader.substring("Basic".length).trim();
    let credDecoded = atob(base64Credentials);
    // credentials = username:password
    let credArray = credDecoded.split(":", 2);
    let username = credArray[0];
    let password = credArray[1];
    let credentials = {
      username,
      password
    };
    return credentials;
  }
  return null;
}

function sendMessagetoClient(client, msg) {
  return new Promise(function (resolve, reject) {
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = function (event) {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };

    client.postMessage(msg, [messageChannel.port2]);
  });
}


function sendMessagetoAllClients(msg) {
  clients.matchAll().then(clients => {
    clients.forEach(client => {
      sendMessagetoClient(client, msg);
    })
  })
}

function sendRecordNotFound(msg) {
  let message = {
    type: 'recordNotFound',
    details: msg
  }
  sendMessagetoAllClients(message);
}

function sendRecordFound(msg) {
  let message = {
    type: 'recordFound',
    details: msg
  }
  sendMessagetoAllClients(message);
}

function sendSyncSuccessfull(msg) {
  let message = {
    type: 'syncSuccessfull',
    details: msg
  }
  sendMessagetoAllClients(message);
}

function sendSyncFailure(msg) {
  let message = {
    type: 'syncFailure',
    details: msg
  }
  sendMessagetoAllClients(message);
}

