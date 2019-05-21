//Listen for fetch here and decide where to get or store the data
const patients_db = new PouchDB('new_patient_db');
const metadata_db = new PouchDB('metadata_db');
const metrics_db = new PouchDB('metrics_db');

function decodeAuth(base64Credentials) {
  let credDecoded = atob(base64Credentials);
  let credArray = credDecoded.split(":", 2);
  let username = credArray[0];
  let password = credArray[1];
  let credentials = {
    username,
    password
  };
  return credentials;
}

self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting()); // Activate worker immediately
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim()); // Become available to all pages
});

function pullRemoteData(auth, location) {
  const credentials = decodeAuth(auth);
  const remoteDB = new PouchDB(`https://${credentials.username}:${credentials.password}@couchdb.ampath.or.ke/${location}`);

  return patients_db.replicate.from(remoteDB).on('complete', function (metrics) {
    sendSyncSuccessfull({
      type: 'patientsSync',
      username: credentials.username,
      location,
      metrics
    });
  }).on('error', function (err) {

  });
}

function pullRemoteMetaData(auth) {
  const credentials = decodeAuth(auth);
  const remoteMetaDataDB = new PouchDB(`https://${credentials.username}:${credentials.password}@couchdb.ampath.or.ke/openmrs-metadata`);
  return metadata_db.replicate.from(remoteMetaDataDB).on('complete', function (metrics) {
    sendSyncSuccessfull({
      type: 'patientsSync',
      username: credentials.username,
      metrics
    });
  }).on('error', function (err) {
  });
}

function pushMetrics(auth) {
  const credentials = decodeAuth(auth);
  const remoteMetricsDB = new PouchDB(`https://${credentials.username}:${credentials.password}@couchdb.ampath.or.ke/sync-metrics`);
  return metrics_db.replicate.to(remoteMetricsDB).on('complete', function (metrics) {
  }).on('error', function (err) {
    console.log(err);
  });
}

self.addEventListener('message', function (event) {
  const data = event.data;
  if (data.type === 'normalPatientSync') {
    event.waitUntil(pullRemoteData(data.auth, data.location).then(res => {
      buildPatientDBIndexes();
    })
      .catch(e => {
        self.console.log(e)
      }));
  } else if (data.type === 'normalMetaDataSync') {
    event.waitUntil(pullRemoteMetaData(data.auth).then(res => {
      buildMetaDataDBIndexes();
    })
      .catch(e => {
        self.console.log(e)
      }));
  } else if (data.type === 'pushMetrics') {
    event.waitUntil(pushMetrics(data.auth).then(res => {
    })
      .catch(e => {
       // self.console.log(e)
      }));
  }
});

// self.addEventListener('sync', function (event) {
//   if (event.tag == 'firstPatientSync') {
//     self.console.log('Doing some stuff', event);
//     event.waitUntil(pullRemoteData().then(res => {
//       self.console.log(res);
//       buildPatientDBIndexes();
//     })
//       .catch(e => {
//         self.console.log(e)
//       }));
//   } else if (event.tag == 'normalPatientSync') {
//     self.console.log('Doing some other stuff');
//     event.waitUntil(pullRemoteData().then(res => {
//       self.console.log(res);
//     })
//       .catch(e => {
//         self.console.log(e)
//       }));
//   } else if (event.tag == 'firstMetaDataSync') {
//     self.console.log('Getting initial metadata');
//     event.waitUntil(pullRemoteMetaData().then(res => {
//       self.console.log(res);
//       buildMetaDataDBIndexes();
//     })
//       .catch(e => {
//         self.console.log(e)
//       }));
//   } else if (event.tag == 'normalMetaDataSync') {
//     self.console.log('Upadte metadata');
//     event.waitUntil(pullRemoteMetaData().then(res => {
//       self.console.log(res);
//     })
//       .catch(e => {
//         self.console.log(e)
//       }));
//   }
// });

// patients_db.changes({
//   since: 'now',
//   include_docs: true
// })
//   .on('change', function (change) { return handleChange(change) })
//   .on('error', function () { console.log(error); })



// function handleChange(change) {
//   console.log(change, 'changes saved!');
// }



function dummyInterceptor({ request, params }) {
  return fetch(request).then((response) => {
    return new Response(JSON.stringify(response), { status: 200, statusText: 'OK' });
  });
}
function buildMetaDataDBIndexes() {
  patients_db.createIndex({
    index: { fields: ['type'] }
  });

  patients_db.createIndex({
    index: { fields: ['uuid'] }
  });

}

function buildPatientDBIndexes() {
  let start = new Date().getTime();
  // design document, which describes the map function
  var ddoc = {
    _id: '_design/identifier_indexyz',
    views: {
      by_identifier: {
        map: function (doc) {
          if (doc.type === 'patient') {
            for (let identifierObj of doc.patient.identifiers) {

              emit(identifierObj.identifier);
            }
          }
        }.toString()
      }
    }
  };

  patients_db.put(ddoc).then(() => {
    self.console.log('Successfully saved index and map function!');
  }).catch((err) => {
    self.console.log('Unable to save index and map function!', err);
  });

  // empty query to kick off a new build
  patients_db.query('identifier_indexyz/by_identifier', {
    limit: 0
  }).then(function (res) {
    self.console.log('Successfully built patient identifier index', res);
    self.console.log('Took ' + (new Date().getTime() - start) / 1000 + ' Seconds');
  }).catch(function (err) {
    self.console.log('An error occurred while building identifier index.');
  });

  patients_db.createIndex({
    index: { fields: ['patient.uuid'] }
  });
}