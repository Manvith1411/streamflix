CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE genres (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  year INT,
  popularity NUMERIC DEFAULT 0,
  poster_url TEXT
);

CREATE TABLE movie_genres (
  movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
  genre_id INT REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY(movie_id,genre_id)
);

CREATE TABLE favorites (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  movie_id INT REFERENCES movies(id) ON DELETE CASCADE,
  PRIMARY KEY(user_id,movie_id)
);

INSERT INTO genres(name) VALUES
('Action'),('Drama'),('Comedy'),('Sci-Fi'),('Thriller'),('Romance'),('Documentary'),('Animation'),('Horror'),('Crime');

INSERT INTO movies(title,description,year,popularity,poster_url) VALUES
('The Silent Sea','A tense lunar mission.',2021,95,'https://via.placeholder.com/300x450?text=Silent+Sea'),
('Neon Chase','Futuristic action-thriller.',2023,88,'https://via.placeholder.com/300x450?text=Neon+Chase'),
('Laugh Out','A contemporary comedy.',2020,70,'https://via.placeholder.com/300x450?text=Laugh+Out'),
('Deep Code','A programmer thriller.',2019,60,'https://via.placeholder.com/300x450?text=Deep+Code'),
('Space Between','Sci-fi romance.',2018,72,'https://via.placeholder.com/300x450?text=Space+Between'),
('Hidden Truth','Crime investigation.',2022,78,'https://via.placeholder.com/300x450?text=Hidden+Truth'),
('The Painter','Drama about an artist.',2017,50,'https://via.placeholder.com/300x450?text=The+Painter'),
('Runaway Train','Action packed ride.',2015,65,'https://via.placeholder.com/300x450?text=Runaway+Train'),
('Midnight Tales','Horror anthology.',2016,55,'https://via.placeholder.com/300x450?text=Midnight+Tales'),
('Ocean Secrets','Documentary about seas.',2014,40,'https://via.placeholder.com/300x450?text=Ocean+Secrets'),
('Animated Dreams','Family animation.',2021,67,'https://via.placeholder.com/300x450?text=Animated+Dreams'),
('City Lights','Romantic drama.',2013,45,'https://via.placeholder.com/300x450?text=City+Lights');

INSERT INTO movie_genres(movie_id,genre_id) VALUES
(1,4),(1,2),
(2,1),(2,5),
(3,3),
(4,5),(4,1),
(5,4),(5,6),
(6,10),(6,5),
(7,2),
(8,1),
(9,9),
(10,7),
(11,8),(11,3),
(12,6),(12,2);