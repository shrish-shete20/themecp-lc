async function getLeetcodeProfile(req, res) {
    const username = req.params.username || req.query.username;

    if (!username) {
        return res.status(400).json({ error: "username is required" });
    }

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

async function getLeetcodeProfileStats(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }

  const query = `
    query profileStats($username: String!) {
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        username
        profile {
          ranking
          realName
          userAvatar
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
          totalSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        problemsSolvedBeatsStats {
          difficulty
          percentage
        }
      }
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        totalParticipants
        topPercentage
      }
      userContestRankingHistory(username: $username) {
        attended
        rating
        ranking
        trendDirection
        problemsSolved
        totalProblems
        finishTimeInSeconds
        contest {
          title
          startTime
        }
      }
    }
  `;

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
      },
      body: JSON.stringify({
        query,
        variables: { username: username.trim() },
      }),
    });

    const data = await response.json();

    if (!response.ok || data.errors) {
      return res.status(502).json({
        error: "Failed to fetch LeetCode profile stats",
        details: data.errors?.map((error) => error.message),
      });
    }

    return res.json(data.data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch LeetCode profile stats" });
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

module.exports = { getLeetcodeProfile, getLeetcodeProfileStats, getRecentSubmission };