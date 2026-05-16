CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  leetcode_profile_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS theme_profile (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  contest_rating INT DEFAULT 0,
  max_rating INT DEFAULT 0,
  contest_attempt INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_theme_profile_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS problems (
  id INT PRIMARY KEY,
  url_title VARCHAR(255) NOT NULL UNIQUE,
  rating DECIMAL(10, 4) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_problems_rating (rating)
);

CREATE TABLE IF NOT EXISTS contests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  selected_level INT NOT NULL DEFAULT 0,
  problem_id1 INT NOT NULL,
  problem_id2 INT NOT NULL,
  problem_id3 INT NOT NULL,
  problem_id4 INT NOT NULL,
  problem1_status VARCHAR(64) NOT NULL DEFAULT 'unsolved',
  problem2_status VARCHAR(64) NOT NULL DEFAULT 'unsolved',
  problem3_status VARCHAR(64) NOT NULL DEFAULT 'unsolved',
  problem4_status VARCHAR(64) NOT NULL DEFAULT 'unsolved',
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_contests_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_contests_problem1
    FOREIGN KEY (problem_id1) REFERENCES problems(id),
  CONSTRAINT fk_contests_problem2
    FOREIGN KEY (problem_id2) REFERENCES problems(id),
  CONSTRAINT fk_contests_problem3
    FOREIGN KEY (problem_id3) REFERENCES problems(id),
  CONSTRAINT fk_contests_problem4
    FOREIGN KEY (problem_id4) REFERENCES problems(id),
  INDEX idx_contests_user_start_time (user_id, start_time)
);

CREATE TABLE IF NOT EXISTS user_problems (
  user_id INT NOT NULL,
  problem_id INT NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'solved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, problem_id),
  CONSTRAINT fk_user_problems_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_problems_problem
    FOREIGN KEY (problem_id) REFERENCES problems(id)
    ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS update_contest_problem_status;

DELIMITER //

CREATE TRIGGER update_contest_problem_status
AFTER INSERT ON user_problems
FOR EACH ROW
BEGIN
  UPDATE contests
  SET
    problem1_status = IF(problem_id1 = NEW.problem_id, 'solved_during_contest', problem1_status),
    problem2_status = IF(problem_id2 = NEW.problem_id, 'solved_during_contest', problem2_status),
    problem3_status = IF(problem_id3 = NEW.problem_id, 'solved_during_contest', problem3_status),
    problem4_status = IF(problem_id4 = NEW.problem_id, 'solved_during_contest', problem4_status)
  WHERE user_id = NEW.user_id
    AND NEW.status = 'solved'
    AND (problem_id1 = NEW.problem_id
      OR problem_id2 = NEW.problem_id
      OR problem_id3 = NEW.problem_id
      OR problem_id4 = NEW.problem_id);
END//

DELIMITER ;
