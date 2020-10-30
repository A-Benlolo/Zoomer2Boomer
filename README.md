# Zoomer2Boomer
Zoomer2Boomer is an online translation tool that aims to fill the generational gap that is made evident by modern day slang.

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