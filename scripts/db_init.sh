echo "--- droping database if exsists"
mysql -u root -p -e 'DROP DATABASE IF EXISTS um'
echo "--- creating database"
mysql -u root -p -e 'CREATE DATABASE um DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci'


knex migrate:rollback
knex migrate:latest

node generators/users

knex seed:run


