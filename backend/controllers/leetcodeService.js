const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";
const RECENT_ACCEPTED_LIMIT = 100;

async function postLeetcodeGraphql(query, variables) {
  const response = await fetch(LEETCODE_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Referer": "https://leetcode.com",
      "User-Agent": "Mozilla/5.0",
    },
    body: JSON.stringify({ query, variables }),
  });

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error("LeetCode returned a non-JSON response");
  }

  if (!response.ok || payload.errors) {
    const details = payload.errors?.map((error) => error.message).join("; ");
    throw new Error(details || "LeetCode API request failed");
  }

  return payload.data;
}

function getAcceptedCount(acSubmissionNum = []) {
  const total = acSubmissionNum.find((item) => item.difficulty === "All");
  return Number(total?.count || 0);
}

async function fetchAcceptedLeetcodeProblemSlugs(username) {
  const trimmedUsername = username?.trim();

  if (!trimmedUsername) {
    return {
      username: null,
      slugs: [],
      totalAccepted: 0,
      isPartial: false,
    };
  }

  const query = `
    query acceptedProblems($username: String!, $limit: Int!) {
      matchedUser(username: $username) {
        username
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
      recentAcSubmissionList(username: $username, limit: $limit) {
        titleSlug
      }
      recentSubmissionList(username: $username) {
        titleSlug
        statusDisplay
      }
    }
  `;

  const data = await postLeetcodeGraphql(query, {
    username: trimmedUsername,
    limit: RECENT_ACCEPTED_LIMIT,
  });

  if (!data.matchedUser) {
    return {
      username: trimmedUsername,
      slugs: [],
      totalAccepted: 0,
      isPartial: false,
      profileFound: false,
    };
  }

  const acceptedSlugs = new Set();

  for (const submission of data.recentAcSubmissionList || []) {
    if (submission.titleSlug) {
      acceptedSlugs.add(submission.titleSlug);
    }
  }

  for (const submission of data.recentSubmissionList || []) {
    if (submission.statusDisplay === "Accepted" && submission.titleSlug) {
      acceptedSlugs.add(submission.titleSlug);
    }
  }

  const slugs = [...acceptedSlugs];
  const totalAccepted = getAcceptedCount(data.matchedUser.submitStats?.acSubmissionNum);

  return {
    username: data.matchedUser.username,
    slugs,
    totalAccepted,
    isPartial: totalAccepted > slugs.length,
    profileFound: true,
  };
}

async function syncAcceptedLeetcodeProblems(db, userId, username) {
  const leetcodeResult = await fetchAcceptedLeetcodeProblemSlugs(username);

  if (leetcodeResult.slugs.length === 0) {
    return {
      ...leetcodeResult,
      matchedProblemCount: 0,
      savedProblemCount: 0,
    };
  }

  const [problemRows] = await db.query(
    `
      SELECT id, url_title
      FROM problems
      WHERE url_title = ANY(?::text[])
    `,
    [leetcodeResult.slugs]
  );

  if (problemRows.length === 0) {
    return {
      ...leetcodeResult,
      matchedProblemCount: 0,
      savedProblemCount: 0,
    };
  }

  const placeholders = problemRows.map(() => "(?, ?, ?)").join(", ");
  const values = problemRows.flatMap((problem) => [userId, problem.id, "solved"]);

  const [, result] = await db.query(
    `
      INSERT INTO user_problems (
        user_id,
        problem_id,
        status
      )
      VALUES ${placeholders}
      ON CONFLICT (user_id, problem_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
    `,
    values
  );

  return {
    ...leetcodeResult,
    matchedProblemCount: problemRows.length,
    savedProblemCount: result.affectedRows,
  };
}

module.exports = {
  fetchAcceptedLeetcodeProblemSlugs,
  syncAcceptedLeetcodeProblems,
};
