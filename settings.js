const Params = imports.misc.params;

let default_settings = {
	"evernote_auth_token": "get the token at https://www.evernote.com/api/DeveloperToken.action",
	"refresh_interval": 15,
	"editor": "emacs",
	"html_mode": 0
}

function getSettings(settings)
{
	// returne the json data settins
	return JSON.parse(settings.get_string("settings-json"));
}
