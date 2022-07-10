import { initializeApp } from 'firebase/app';
import { getDatabase, ref, child, get } from 'firebase/database';
import APP_CONFIG from "../static/app_config.json";

// Singleton
export const CitizenScienceAPI = (function() {

    // Initialize Firebase
    const firebase_config = APP_CONFIG.firebase.config;
    const app = initializeApp(firebase_config);
    const database = getDatabase(app);
    console.log(database);

    let keys = ["beach", "algae", "water"];

    const dbRef = ref(getDatabase());

    keys.forEach(key => 
        get(child(dbRef, key)).then((snapshot) => {
        if (snapshot.exists()) {
            let data = snapshot.val()
            console.log(key, data);

            let unique_keys = {};
            Object.values(data).forEach((o) => {
                Object.keys(o).forEach((key) => {
                    if (o[key] === "")
                        return;
                    if (!(key in unique_keys))
                        unique_keys[key] = 0
                    unique_keys[key] += 1;
                })
            })
            console.log(unique_keys);

            let intersection = Object.entries(unique_keys)
                .filter(([key, count]) => count === Object.values(data).length)
                .map(([key, count]) => key);

            console.log(intersection);

            let max_date = Math.max(...Object.values(data)
                .map((o) => new Date(o["createdAt"])));

            console.log(new Date(max_date))

        } else {
            console.log("No data available");
        }
        }).catch((error) => {
            console.error(error);
        })
    )


    // Return firebase interface
    return {
        
    }
})();