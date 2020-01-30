git add -u
git add -A
echo Updated file index!
echo What should the commit message be?
$varname = Read-Host
git commit -m "$varname"
echo Commited!
git push -u origin master
echo Pushed!
echo Done!
