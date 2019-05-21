import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
declare global {
    interface StorageEstimate {
        quota: number;
        usage: number;
    }
    interface Navigator {
        storage: {
            estimate: () => Promise<StorageEstimate>;
            persist: () => boolean;
            persisted: () => boolean;
        };
    }
}
@Injectable()
export class OfflineSyncMetricsService {
    isOnline() {
        const onlineSubject = new BehaviorSubject(true);
        return onlineSubject;
    }

    offlineResourceMissedListener() {
        const resourceMissiedSubject = new BehaviorSubject(null);
        navigator.serviceWorker.onmessage = (event) => {
            console.log('Missed===', event.data);
            if (event.data && event.data.type === 'recordNotFound') {
                console.log('recordNotFound');
                resourceMissiedSubject.next(event.data);
            }
        };
        return resourceMissiedSubject;
    }

    offlineResourceFoundListener() {
        const resourceFoundSubject = new BehaviorSubject(null);
        navigator.serviceWorker.onmessage = (event) => {
            if (event.data && event.data.type === 'recordFound') {
                console.log('recordFound');
                resourceFoundSubject.next(event.data);
            }
        };
        return resourceFoundSubject;
    }

    syncSuccessfullListerner() {
        const syncSuccessfullSubject = new BehaviorSubject(null);
        navigator.serviceWorker.onmessage = (event) => {
            if (event.data && event.data.type === 'syncSuccessfull') {
                syncSuccessfullSubject.next(event.data);
            }
        };
        return syncSuccessfullSubject;
    }

    messageListener() {
        const messageSubject = new BehaviorSubject(null);
        const blackListedTypes = ['UPDATE_AVAILABLE', 'syncFailure', 'syncSuccessfull'];
        navigator.serviceWorker.onmessage = (event) => {
            if (event.data && !blackListedTypes.includes(event.data.type)) {
                messageSubject.next(event.data);
            }
        };
        return messageSubject;
    }

    storageUsage() {
        const storageEstimateSubject = new BehaviorSubject(null);
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            navigator.storage.estimate().then(({ usage, quota }) => {
                console.log(`Using ${usage} out of ${quota} bytes.`);
                const percentUsed = Math.round(usage / quota * 100);
                const usageInMib = Math.round(usage / (1024 * 1024));
                const quotaInMib = Math.round(quota / (1024 * 1024));
                storageEstimateSubject.next({ type: 'storage', percentUsed, usageInMib, quotaInMib });
            });
        }
        return storageEstimateSubject;
    }

}
