async function doesProfileExist(profileName) {
    const query = `
        query userPublicProfile($username: String!) {
            matchedUser(username: $username) {
                username
            }
        }
    `;

    const response = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Referer": "https://leetcode.com"
        },
        body: JSON.stringify({
            query,
            variables: {
                username: profileName.trim(),
            },
        }),
    });

    if (!response.ok) {
        throw new Error("LeetCode API failed");
    }

    const data = await response.json();

    return data?.data?.matchedUser !== null;
}

module.exports = { doesProfileExist };