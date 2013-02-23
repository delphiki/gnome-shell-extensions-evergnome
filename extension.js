const Main = imports.ui.main;

const Local = imports.misc.extensionUtils.getCurrentExtension();
const EvergnomePanelMenu = Local.imports.evergnomePanelMenu.EvergnomePanelMenu;

let _evergnomePanelMenu;
let _extensionPath;

function init(metadata)
{
	_extensionPath = metadata.path;
}

function enable()
{
	try
	{
		_evergnomePanelMenu = new EvergnomePanelMenu(_extensionPath);
		_evergnomePanelMenu._synch_data();
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
	_evergnomePanelMenu.destroy();
}
