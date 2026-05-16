async function getLeetcodeProfile(req, res) {
    const username = req.params.username;

    try {
        const response = await fetch("https://leetcode.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://leetcode.com"
            },
            body: JSON.stringify({
                query: `
                    query ($username: String!) {
                        matchedUser(username: $username) {
                            username
                            profile {
                                ranking
                                realName
                            }
                        }
                    }
                `,
                variables: { username }
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch" });
    }
}

async function getRecentSubmission(req, res) {
  console.log(req.query)
  const { username } = req.query; // ✅ from query, not body
  console.log("from backend", username)

  const query = `
    query recentSubmissions($username: String!) {
      recentSubmissionList(username: $username) {
        title
        titleSlug
        timestamp
        statusDisplay
        lang
      }
    }
  `;

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST", // still POST for LeetCode API
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    const data = await response.json();
    res.json(data.data.recentSubmissionList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch LeetCode submissions" });
  }
};

module.exports = { getLeetcodeProfile, getRecentSubmission };