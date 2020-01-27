# Try000001

----
## Dead Simple o365 Credential Spraying

Simple node script to enumerate valid users and password spray Office365. It will not perform a password attempt for invalid user accounts.

----
## Install
```
git clone https://git.issgs.net/fkasler/try000001.git
cd try000001
npm install
```

----
## usage
```node try000001.js email_list.txt 'Password1'```

OR

```node try000001.js user@domain.com 'Password1'```

OR for a userpass file with entries like 'john.doe@example.com:Johndoepassword123' on each line:

```node userPassFileTry.js user_pass_file.txt```

If you want to just perform step one (username validation) or step two (authentication attempt) in isolation just specify the step as your last argument:

```node try000001.js email_list.txt 1```

OR

```node try000001.js email_list.txt 'JustCheckThisPassword123!' 2```

----
## Credits

Oliver Morton (@grimhacker):
[office365userenum](https://bitbucket.org/grimhacker/office365userenum/src/master/)

Korey McKinley (@Korey_K2):
[o365creeper](https://github.com/LMGsec/o365creeper)
