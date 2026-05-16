import axios from "axios";

export async function makeEntry(user) {
    try {
        console.log("sending info for user entry")
        const result = await axios.post(`${import.meta.env.VITE_API_URL}/add_user`, user);
        return result.data; 
    } catch (err) {
        console.error("Error in makeEntry:", err);
        throw err;
    }
}

export async function removeEntry(sub){
    try {
        console.log("Sending info for user removal")
        const result = await axios.delete(`${import.meta.env.VITE_API_URL}/remove_user/${sub}`);
        return result.data; 
    } catch (err) {
        console.error("Error in makeEntry:", err);
        throw err;
    }
}