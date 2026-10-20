CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  cpf_matricula VARCHAR(50) UNIQUE,
  birth_date DATE,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL DEFAULT 2,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_days INT,
  status VARCHAR(50) DEFAULT 'ACTIVE'
);

CREATE TABLE user_plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);

CREATE TABLE rfid_cards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  uid VARCHAR(100) UNIQUE NOT NULL,
  active TINYINT DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE exercises (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  machine_name VARCHAR(100) NOT NULL,
  default_series INT DEFAULT 3,
  default_repetitions INT DEFAULT 12,
  default_carga DECIMAL(10,2) DEFAULT 30
);

CREATE TABLE workouts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE workout_exercises (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workout_id INT NOT NULL,
  exercise_id INT NOT NULL,
  series INT DEFAULT 3,
  repetitions INT DEFAULT 12,
  carga DECIMAL(10,2) DEFAULT 30,
  rest_seconds INT DEFAULT 60,
  order_num INT DEFAULT 1,
  FOREIGN KEY (workout_id) REFERENCES workouts(id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

CREATE TABLE workout_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  exercise_id INT NOT NULL,
  machine_name VARCHAR(100),
  series_number INT,
  repetitions INT,
  carga DECIMAL(10,2),
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

CREATE TABLE checkins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  checkin_date DATE,
  checkin_time TIME,
  entry_method VARCHAR(100),
  status VARCHAR(100),
  device VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE access_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  reason VARCHAR(255),
  status VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE weight_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  weight DECIMAL(10,2) NOT NULL,
  record_date DATE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE goals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  goal_type VARCHAR(100),
  target_value INT,
  start_date DATE,
  end_date DATE,
  created_by INT,
  status VARCHAR(50) DEFAULT 'ACTIVE'
);

CREATE TABLE user_goals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  goal_id INT NOT NULL,
  current_value INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'IN_PROGRESS',
  achieved_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (goal_id) REFERENCES goals(id)
);

CREATE TABLE rewards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  description TEXT
);

CREATE TABLE goal_rewards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  goal_id INT NOT NULL,
  reward_id INT NOT NULL,
  FOREIGN KEY (goal_id) REFERENCES goals(id),
  FOREIGN KEY (reward_id) REFERENCES rewards(id)
);

CREATE TABLE user_rewards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  goal_id INT NOT NULL,
  reward_id INT NOT NULL,
  unlocked_at TIMESTAMP NULL,
  status VARCHAR(50) DEFAULT 'AVAILABLE',
  redeemed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (goal_id) REFERENCES goals(id),
  FOREIGN KEY (reward_id) REFERENCES rewards(id)
);

CREATE TABLE avatars (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  style VARCHAR(100),
  skin_color VARCHAR(50),
  hair_style VARCHAR(100),
  accessory VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
