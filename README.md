# EverGnome, the (unofficial) Evernote extension for Gnome-shell / Gnome3 #

## For the impatient ##

### Install System Packages  ###

*   e.g.: for Fedora : sudo yum install -y python-httplib2 python-oauth2

## License ##

*   The gray elephant logo and Evernote SDK are copyrigth of Evernote, more info at http://dev.evernote.com/documentation/reference/api_license.php
*   The EverGnome extension is licensed under GPLv3, more info at http://www.gnu.org/licenses/gpl.txt.
*   More info of this extension, how to use it, install, at https://github.com/dialectic-chaos/gnome-shell-extensions-evergnome
*   convenience.js licensed by Giovanni Campagna scampa-dot-giovanni-at-gmail-dot-com.

The EverGnome name has nothing related to Evernote, the extension was named like this in order to play with both worlds.

## Installation ##

### Automated via extensions.gnome.org ###
Go to https://extensions.gnome.org/.

### Manual ###
*   Install the python-httplib2 python-oauth2 packages (via yum, synaptic, etc..).
*   git clone https://github.com/dialectic-chaos/gnome-shell-extensions-evergnome.git
*   mv gnome-shell-extensions-evergnome ~/.local/share/gnome-shell/extensions/evergnome@dialectic-chaos.github.com
*   Enable it using Gnome tweek tool

## Update the extension ##
In order to update the extension, go to https://extensions.gnome.org/local/ and press the blue icon of EverGnome extension.

### Compatibility  ###
As first release, the extension in compatible with Gnome-shell "3.4", "3.6", "3.7", "3.8" fully tested in Fedora 18 3.7.2-204.fc18.i686.PAE #1 SMP Wed Jan 16 16:31:26 UTC 2013 i686 i686 i386 GNU/Linux.

## Extension Settings ##
*   Evernote Auth Token: This can be accessed in via extension settings, to get your auth token go to https://www.evernote.com/api/DeveloperToken.action, you can manually update/synch the notebooks or wait "Refresh every" minutes.
*   Refresh Time: This can be accessed in via extension settings, how long the extension will wait to update and synch the data.
*   Editor: This can be accessed in via extension settings, if the HTML Mode is set OFF, it will use this editor to show the note in raw data.
*   Show Notifications: This can be accessed in the extension menu, enable/disable show Gnome notifications when the data is synched.
*   HTML Mode: This can be accessed in the extension menu, enable/disable show the notes in a local web page.

## Not yet and to be implemented ##
*   Formatted note edition (same as Evernote webpage).
*   Save modified notes.

## Bugs and issues ##
Please, refer to https://github.com/dialectic-chaos/gnome-shell-extensions-evergnome/issues.

## Screenshots ##

<div align="center">
<img src="http://s22.postimg.org/7p1radq4h/Screenshot_from_2013_03_11_10_44_10.png />
<br/>
<img src="http://s22.postimg.org/7dkaxm9oh/Screenshot_from_2013_03_11_10_44_25.png />
<br/>
<img src="http://s22.postimg.org/bnyyt7erl/Screenshot_from_2013_03_11_10_45_41.png />
<br/>
<img src="http://s22.postimg.org/981qt3m2p/Screenshot_from_2013_03_11_10_46_52.png />
<br/>
<img src="http://s22.postimg.org/wnjnyg5tt/Screenshot_from_2013_03_11_10_49_11.png />
<br/>
<img src="http://s22.postimg.org/i5mgqgeip/Screenshot_from_2013_03_11_10_51_05.png />
</div>
