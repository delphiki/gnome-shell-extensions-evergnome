const Main = imports.ui.main;

const Local = imports.misc.extensionUtils.getCurrentExtension();
const _ = imports.gettext.domain(Local.metadata['gettext-domain']).gettext;
const EvergnomePanelMenu = Local.imports.evergnomePanelMenu.EvergnomePanelMenu;

let _evergnomePanelMenu;

// dummy one
function init(){}

function enable()
{
	try
	{
		_evergnomePanelMenu = new EvergnomePanelMenu();
		Main.panel.addToStatusArea("evergnome", _evergnomePanelMenu, 0, "right");
	}
	catch(e)
	{
		global.log("Error enabling Evergnome Panel extension: " + e.message);
		_evergnomePanelMenu.destroy();
		_evergnomePanelMenu = null;
	}
}

function disable()
{
	//destroy it
	_evergnomePanelMenu.destroy();
}
