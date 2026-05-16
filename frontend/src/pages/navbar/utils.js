export async function removeEntry(name){
    try {
        console.log("Sending info for user removal")
        const result = await axios.delete(`${import.meta.env.VITE_API_URL}/remove_user/${name}`);
        return result.data; 
    } catch (err) {
        console.error("Error in makeEntry:", err);
        throw err;
    }
}