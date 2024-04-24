# Ricettario
A self-hosted web database of family recipes.

# The database
The database is simply a JSON file (`./database.json`) stored locally on the
server. The file you can find here is only an example.

# Usage
After cloning the repo and moving to the right folder, install the necessary
dependencies (make sure your node version is $>=18$):
```sh
npm install
```
And run the program with:
```sh
node main.js
```
You could also set up a daemon for this (check out the `./install` directory).