
# Zoomer2Boomer
![Logo](./public/img/logo.png "A beautiful logo")

Zoomer2Boomer is an online translation tool that aims to fill the generational gap that is made evident by modern day slang.

## Setup Instructions
1. Download the Zoomer2Boomer project.

2. Install [Node.js](https://nodejs.org/en/) version 14.15.0 onto your machine.
3. Install [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) version 8.0.22 onto your machine.
4. Install [MySQL Community Server] (https://dev.mysql.com/downloads/mysql/) version 8.0.22 onto your machine.
5. When installing MySQL Server, 
	* Select the add option on the right
	* Expand the MySQL Servers tab by clicking on the + icon
	* Keep expanding the tabs until you can see "MySQL Server 8.0.22 - X64"
	* Select "MySQL Server 8.0.22 - X64" then between the two boxes, click the green arrow that is pointing to the right
	* Then click next
	* Then click Execute
	* Follow through the setup leaving everything as default until you get to the screen where you set the root password
	* Set the password as "root"
	* Follow through the setup again until finished.
5. Start the MySQL server one of two ways:
   * Search "Services" in the start menu. Look for "MySQL80", double click it, and click on start.
6. Open MySQL Workbench and setup a new connection with the following information and connect:
   * IP - localhost
   * port - 3306
   * user - root
   * password - root
7. Select File > Open SQL Script...
8. Navigate to the Zoomer2Boomer folder, open the MySQL folder, and select `createSchemaAndTables.sql`
9. Execute the script by pressing `Ctrl+Shift+Enter`
10. Open a new Query Tab by pressing `Ctrl+T`
11. Copy and paste the following queries into the new tab:
    * `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';`
    * `flush privileges;`
12. Execute the queries by pressing `Ctrl+Shift+Enter`
13. Open the command prompt and navigate to the Zoomer2Boomer folder.
14. Type `node index.js` and press `Enter` to start the website.
15. To see the website, visit [localhost:3000](http://localhost:3000) in your web browser.

## The Dictionary
The non-slang terms found in the Zoomer2Boomer dictionary are sourced from the words file found on most UNIX systems. All characters have been made lowercase and any word containing characters that are not English have been removed. After these alterations, all repeat words were also removed.

The dictionary used by Zoomer2Boomer is a MySQL database. There is only one table. It has the following columns:
| Column        | Description                                                                           |
| ------        | ------                                                                                |
| term          | The word in question. Part of the composite key. `varchar(48)`                        |
| translation   | The translation into conventional language. Part of the composite key. `varchar(512)` |
| isSlang       | Whether or not the entry is of a slang word. `tinyint`                                |
| noDisputes    | The number of disputes for the translation. Default value of 0. `int unsigned`        |

Naming conventions
* The schema name is z2b.
* The table name is word.

The following specifications must be followed to allow for proper use of the database.
* The only valid characters are lowercase letters, numbers, apostrophes, and spaces.
* If an entry __is not__ slang, then the term and translation should be equal.
* The translation column may be left empty, but cannot be null; it is part of the composite key.
* Integer overflow of isSlang and noDisputes must be taken into account.
* Buffer overflow of term and translation must be taken into account.
