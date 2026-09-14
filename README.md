# ⚽ Calcetto Presidenziale

**Calcetto Presidenziale** is a web application designed to manage a recurring 5-a-side football group, keeping track of players, matches, results, individual statistics and the overall ranking.

The application provides a simple interface for both players and administrators, with persistent cloud storage and automatic calculation of player scores.

---

## ✨ Features

### 👥 Player Management

* Add and remove players
* Individual player profiles
* Optional password for each player
* Administrator account with dedicated access
* Change player and administrator credentials
* View the complete list of registered players

### 📅 Match Management

Administrators can create and manage matches by specifying:

* Date and time
* Team captains
* Goalkeepers
* Match status
* Final score
* Individual player statistics

The application prevents invalid configurations such as selecting the same captain or goalkeeper for both teams.

### 🗳️ Match Workflow

Matches follow a predefined workflow that allows the group to manage upcoming games and player selections.

The home page highlights:

* The next scheduled match
* Matches currently awaiting player interaction
* The latest completed matches

### 📊 Player Statistics

For every completed match, the application records:

* ⚽ Goals
* 🅰️ Assists
* ⭐ Player rating
* 🧤 Goalkeeper role
* 🏆 Match result

Individual statistics are aggregated across all completed matches.

### 🏆 Overall Ranking

Players are ranked according to a weighted scoring system.

The default scoring formula is:

```text
Points =
    Goals × 2
  + Assists × 1
  + Rating × 3
  + Win × 1.5
  + Goalkeeper × 2
```

The ranking also provides an expandable match-by-match history for every player, including results, statistics and points earned in each game.

The scoring weights are stored in Firebase and can therefore be adjusted without changing the ranking component itself.

### 📜 Match History

Completed matches are stored in the application history and can be reviewed or edited by the administrator.

For each match it is possible to update:

* Final score
* Goals
* Assists
* Player ratings

Changes are immediately reflected in the player statistics and overall ranking.

### 💾 Backup & Restore

The application includes a built-in backup system.

Administrators can:

* Export players, matches and statistics to a JSON file
* Import a previously created backup
* Preview the data before restoring it

This provides a simple way to preserve the league data independently of the database.

---

## 🛠️ Tech Stack

* **React 18** — frontend UI
* **Vite** — development server and build tool
* **Firebase Realtime Database** — persistent cloud data storage
* **JavaScript / JSX** — application logic
* **CSS-in-JS** — application styling
* **gh-pages** — deployment to GitHub Pages

The project uses a lightweight component-based architecture, with separate components for authentication, layout, players, matches, ranking, history and UI elements.

---

## 📁 Project Structure

```text
calcetto-presidenziale/
│
├── assets/
├── public/
├── src/
│   ├── components/
│   │   ├── Games.jsx
│   │   ├── History.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Players.jsx
│   │   ├── Rank.jsx
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── firebase.js
│   │   └── utils.js
│   │
│   └── ...
│
├── App.jsx
├── index.html
├── manifest.json
├── package.json
├── vite.config.js
└── README.md
```

The main application component manages the global application state and connects the different sections of the interface: Home, Ranking, Matches, Players and History.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/massimoparlanti2/calcetto-presidenziale.git
cd calcetto-presidenziale
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The application will be available at the local address provided by Vite.

### 4. Create a production build

```bash
npm run build
```

### 5. Preview the production build

```bash
npm run preview
```

---

## 🔥 Firebase

The application uses **Firebase Realtime Database** as its primary data store.

The main collections used by the application include:

```text
cp_players
cp_matches
cp_weights
cp_admin_pin
cp_pin_<player_id>
```

Firebase is accessed through a small database abstraction layer that provides `get` and `set` operations.

If Firebase is unavailable, the application falls back to `localStorage`, allowing the application to continue working locally and preserving the most recent data available in the browser.

---

## 🔐 Authentication

The application implements a lightweight role-based login system with two types of users:

### Player

Players can:

* Log into their personal profile
* View the other registered players
* Change their own password
* Access the player-facing sections of the application

### Administrator

The administrator has additional privileges, including:

* Creating matches
* Managing players
* Changing player passwords
* Managing the administrator PIN
* Editing completed matches
* Creating and restoring backups

> **Note:** This authentication system is designed for a private football group rather than for production-grade security. It should not be considered a replacement for a dedicated authentication service.

---

## 📈 Ranking System

The ranking is calculated dynamically from completed matches.

For each player, the application aggregates:

| Statistic | Description            |
| --------- | ---------------------- |
| Goals     | Total goals scored     |
| Assists   | Total assists          |
| Rating    | Average player rating  |
| Wins      | Matches won            |
| Draws     | Matches drawn          |
| Losses    | Matches lost           |
| Matches   | Total matches played   |
| Points    | Weighted ranking score |

The ranking score is calculated independently for every completed match and then summed across the player's history.

This approach makes the ranking transparent and allows the application to display exactly how each player's total score was generated.

---

## 🎯 Project Goals

The project was created to replace the manual management of a recurring football group with a single application.

The main goals are:

* Centralize match organization
* Keep player statistics automatically updated
* Make the ranking transparent
* Reduce manual calculations
* Provide an accessible interface for the entire group
* Maintain a persistent history of the league

Rather than being a generic football management platform, the application is intentionally designed around the specific workflow and rules of a private football group.

---

## 🔮 Possible Future Improvements

Potential future developments include:

* 📱 Improved mobile-first responsive design
* 🔔 Match and voting notifications
* 📊 More advanced player statistics
* 📈 Performance charts and trends
* 🧠 Automatic team balancing
* ⚖️ Player skill ratings for more balanced teams
* 📅 Calendar integration
* 🏅 Seasonal competitions and trophies
* 📸 Player avatars
* 🔐 Firebase Authentication
* 👤 More granular user permissions
* 🌐 Progressive Web App (PWA) improvements

---

## 👨‍💻 Author

**Massimo Parlanti**

MSc Artificial Intelligence student at the University of Pisa.

GitHub: [@massimoparlanti2](https://github.com/massimoparlanti2)

---

## 📄 License

This project is intended primarily for personal use and experimentation.

No specific open-source license has currently been defined.
