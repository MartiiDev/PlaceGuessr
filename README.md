# What is PlaceGuessr?
PlaceGuessr is a script made to run in TamperMonkey, GreaseMonkey, or any UserScript extension!

If you're here, you probably know what is Geoguessr, that popular geography game where you have to guess where in the world you're located. And you probably also know that you have to pay if you want to play more than once a day, due to Google's high API fees.

This script turns Google Maps' website into a game just like Geoguessr, so no more API fees! The only problem is that whenever Google Maps will change its interface, most of this script won't work anymore.

# How to play?
1. You have to install an extension to handle this script. The script has only been tested on [TamperMonkey](https://www.tampermonkey.net/) (Chrome version), so don't hesitate to return any feedback. You need one of the following:  
[Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo), [Firefox](https://addons.mozilla.org/fr/firefox/addon/tampermonkey/), [Safari](https://apps.apple.com/us/app/tampermonkey/id1482490089), Microsoft Edge ([Legacy](https://www.microsoft.com/fr-fr/p/tampermonkey/9nblggh5162s?rtc=1&activetab=pivot:overviewtab), [Chromium](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)), [Opera](https://addons.opera.com/en/extensions/details/tampermonkey-beta/), [Android](https://play.google.com/store/apps/details?id=net.tampermonkey.dolphin) (not recommended)

2. [Download the game script](https://raw.githubusercontent.com/MartiiDev/PlaceGuessr/master/placeguessr.user.js) and install it.

3. Go to [maps.google.com/play](https://maps.google.com/play)  
Note that this URL will only work if the game is installed.  
You can add it to your favorites to access it quicker.

# Known problems
- The script has few chances to run correctly on Android, it is better to run it using a computer.
- If Google Maps changes its interface, the game may not work anymore  
- The mouse cursor glitches really often  
	- *Due to `window.history.replaceState()`, if you know an alternative to add parameter to URL without refreshing, please let me know.*  
- The POI (Points Of Interest) are still displayed.  
	- *Workaround: If you hover them, the informations are not shown. If you click on them, the left pane will be toggled but without any informations shown.*  

# Author
This game was entirely created by Martii (Edgar Caudron), based on Geoguessr's original game.  
This game and the entirety of this Github repository is distributed under the GNU General Public License v3.0 (view LICENSE file in the repository for more informations).
