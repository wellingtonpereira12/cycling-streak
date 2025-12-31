import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK_NAME = 'background-location-task';

// Store subscribers to update UI
let updateCallback = null;
let timerInterval = null;
let currentRideData = {
    distance: 0,
    startTime: null,
    locations: []
};


// ... Task Definition ...
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    // ... existing logic ...
    if (data) {
        const { locations } = data;
        if (locations && locations.length > 0) {
            handleNewLocations(locations);
        }
    }
});


const handleNewLocations = (newLocations) => {
    // If not recording, ignore
    if (!currentRideData.startTime) return;

    for (const loc of newLocations) {
        // ... (distance calc) ...
        const lastLoc = currentRideData.locations[currentRideData.locations.length - 1];

        if (lastLoc) {
            const dist = calculateDistance(
                lastLoc.latitude,
                lastLoc.longitude,
                loc.coords.latitude,
                loc.coords.longitude
            );
            currentRideData.distance += dist;
        }

        currentRideData.locations.push({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            timestamp: loc.timestamp
        });
    }

    // We do NOT call updateCallback here anymore for everything, 
    // relying on the timer interval for UI updates helps consistency?
    // Actually, we should update distance immediately on new location
    // AND update time every second. 
    // Let's call emitUpdate here too to catch distance changes instantly.
    emitUpdate();
};

const emitUpdate = () => {
    if (updateCallback && currentRideData.startTime) {
        updateCallback({
            distance: currentRideData.distance, // in km
            duration: (Date.now() - currentRideData.startTime) / 1000, // seconds
            path: [...currentRideData.locations]
        });
    }
}


// Haversine Formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};


export const startTracking = async (callback) => {
    // 1. Reset Data
    currentRideData = {
        distance: 0,
        startTime: Date.now(),
        locations: []
    };
    updateCallback = callback;

    // Start Timer Interval (every 1s)
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        emitUpdate();
    }, 1000);

    // 2. Request Permissions
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') {
        throw new Error('Permissão de localização negada');
    }

    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    if (bgStatus !== 'granted') {
        console.warn("Background permission not granted - tracking might stop when app is closed");
    }

    // 2.5 Ensure cleanup of previous tasks to avoid configuration conflicts
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 2500,
        distanceInterval: 10,
    });

    return true;
};

export const stopTracking = async () => {
    // Clear Timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    try {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    } catch (e) {
        // Ignore if not running
    }

    // Capture final state
    const endTime = Date.now();
    const durationMin = Math.round((endTime - currentRideData.startTime) / 1000 / 60);
    const distanceKm = parseFloat(currentRideData.distance.toFixed(2));

    const result = {
        distance: distanceKm,
        duration: durationMin,
        locations: currentRideData.locations
    };

    // Cleanup
    currentRideData = { distance: 0, startTime: null, locations: [] };
    updateCallback = null;

    return result;
};

export const isTracking = async () => {
    return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
};

export const getCurrentStats = () => {
    if (!currentRideData.startTime) return { distance: 0, duration: 0 };
    return {
        distance: currentRideData.distance,
        duration: (Date.now() - currentRideData.startTime) / 1000
    };
};
