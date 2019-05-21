importScripts('./service-workers/helpers.sw.js')
importScripts('./assets/pouchdb-7.0.0.min.js');
importScripts('./assets/pouchdb.find.min.js')
importScripts('./assets/aes-helper.js');
importScripts('./assets/service-worker-router.js');
importScripts('./service-workers/offline-db-sw.js');
importScripts('./service-workers/openmrs-resources/session.service.sw.js')
importScripts('./service-workers/openmrs-resources/patient-resource.service.sw.js')
importScripts('./service-workers/openmrs-resources/encounter-resource.service.sw.js')
importScripts('./service-workers/openmrs-resources/form-resource.service.sw.js')
importScripts('./service-workers/openmrs-resources/location-resource.service.sw.js')
importScripts('./service-workers/openmrs-resources/program-resource.service.sw.js')


importScripts('./service-workers/etl-resources/program-config-resource.service.sw.js')
importScripts('./service-workers/etl-resources/reminders-resource.service.sw.js')
importScripts('./service-workers/etl-resources/labs-resource.service.sw.js')
importScripts('./service-workers/etl-resources/hiv-summary-resource.service.sw.js')
importScripts('./service-workers/etl-resources/cdm-summary-resource.service.sw.js')
importScripts('./service-workers/etl-resources/patient-referral-details.resource.sw.js')
importScripts('./service-workers/etl-resources/vitals.resource.service.sw.js')

const Router = self.ServiceWorkerRouter.Router
const router = new Router();
const baseOpenmrsRoute = '/amrs/ws/rest/v1/';
const baseETLRoute = '/etl-latest/etl/';
router.get(`${baseOpenmrsRoute}session`, interceptAuthRequest);
router.get(`${baseOpenmrsRoute}patient`, interceptPatientSearchRequest);
router.get(`${baseOpenmrsRoute}patient/:patient_uuid`, interceptPatientRequest)
router.get(`${baseOpenmrsRoute}program`, interceptProgramRequest)
router.get(`${baseOpenmrsRoute}encounter`, interceptEncountersRequest)
router.get(`${baseOpenmrsRoute}encounter/:encounter_uuid`, interceptEncounterRequest)
router.get(`${baseOpenmrsRoute}location`, interceptLocationsRequest)
router.get(`${baseOpenmrsRoute}forms`, interceptLocationsRequest)
router.get(`${baseOpenmrsRoute}location/:location_uuid`, interceptLocationsRequest)
router.get(`${baseOpenmrsRoute}programenrollment`, interceptProgramEnrollMentsRequest)
router.get(`${baseETLRoute}lab-orders-by-patient`, interceptPatientLabOrdersRequest)
router.get(`${baseETLRoute}sync-patient-labs`, interceptPatientLabOrdersRequest)
router.get(`${baseETLRoute}patient/:patient_uuid/hiv-clinical-reminder/:date`, interceptReminderRequest)
router.get(`${baseETLRoute}patient-program-config`, interceptProgramConfigRequest)
router.get(`${baseETLRoute}patient/:patient_uuid/cdm-summary`, interceptCDMSummaryRequest)
router.get(`${baseETLRoute}patient/:patient_uuid/hiv-summary`, interceptHIVSummaryRequest)
router.get(`${baseETLRoute}patient-referral-details/:location_uuid/:enrollment_uuid`, interceptPatientReferralDetailsRequest)
router.get(`${baseETLRoute}patient/:patient_uuid/vitals`, interceptVitalsRequest)
router.get(`${baseETLRoute}patient/:patient_uuid/data`, interceptPatientLabDataRequest)
self.addEventListener('fetch', (event) => {
    router.handleEvent(event);
});