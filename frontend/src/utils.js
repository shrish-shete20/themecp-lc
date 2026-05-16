import axios from "axios";

export async function makeEntry(user) {
    try {
        console.log("sending info for user entry")
        console.log(user)
        const result = await axios.post(`${import.meta.env.VITE_API_URL}/users/add_user`, user);
        return result.data; 
    } catch (err) {
        console.error("Error in makeEntry:", err);
        throw err;
    }
}

export async function getProfileName(email) {
    try {
        console.log("trying to get the leetcode profile name based on login id");

        const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/users/get_profile_name`,
            {
                params: { email: email }   // ✅ correct way
            }
        );
        console.log("***** inside gettting profile name ", result)
        return result.data.leetcode_profile_name; // better to return only data
    }
    catch (err) {
        console.log("problem while getting the leetcode profile name from users table");
        console.log(err);
    }
}

export async function removeEntry(sub){
    try {
        console.log("Sending info for user removal")
        const result = await axios.delete(`https://localhost:3002/remove_user/${sub}`);
        return result.data; 
    } catch (err) {
        console.error("Error in makeEntry:", err);
        throw err;
    }
}

export async function getContestHistory(email) {
    console.log("&&&&&&", email)
    try {
        const result = await axios.get(
            `${import.meta.env.VITE_API_URL}/contest/contest_history`,
            {
                params: { email }
            }
        );
        console.log("insdie get contest history")
        console.log(result.data);
        return result.data.data;
    } catch (err) {
        console.log("some error getting the contest history");
        console.log(err);
    }
}