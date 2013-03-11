const Lang = imports.lang;
const Gio = imports.gi.Gio;
const Shell= imports.gi.Shell;

const PopupMenu = imports.ui.popupMenu;

const Local = imports.misc.extensionUtils.getCurrentExtension();

const _ = imports.gettext.domain(Local.metadata['gettext-domain']).gettext;

const EvergnomeUtils = Local.imports.evergnomeUtils;

const EvergnomePopMenuItem = new Lang.Class(
{
	Name: 'EvergnomePopMenuItem',
	Extends: PopupMenu.PopupMenuItem,
    _extensionPath: null,

    _init: function(notebook_name, title_name, notebook_guid, note_guid)
    {
        // get the extension path
        this._extensionPath = Local.path.toString() + "/";
        // custom variables
        this._notebook_name = notebook_name;
        this._title_name = title_name;
        this._notebook_guid = notebook_guid;
        this._note_guid = note_guid;
        this._note_monitor = null;
        this._note_file_html = this._extensionPath + "data/evernote/" + this._notebook_guid + "/" +  this._note_guid + ".html";
        this._local_content = null;
        // set title
        this.parent(this._title_name);

        // connect actions
        this.connect("activate", Lang.bind(this, this._open_file));

        // setup the file monitor
        this._setup_monitor();

        // setup the local content
        this._set_local_content();
    },

    _set_local_content: function()
    {
        let note_file_html = this._get_note_file_html();
        try
        {
            this._local_content = Shell.get_file_contents_utf8_sync(note_file_html)
        }
        catch(e)
        {
            this._local_content = "";
        }
    },

    _open_file: function()
    {
        let note_file_html = this._get_note_file_html();
        let formatted_name = this._get_formatted_name();
        EvergnomeUtils.openEditorNotebook(note_file_html, formatted_name);
    },

    _get_formatted_name: function()
    {
        let formatted_name = this._notebook_name + " : " + this._title_name;
        return formatted_name;
    },

    _get_note_file_html: function()
    {
        return this._note_file_html;
    },

    _setup_monitor: function()
    {
        // set the notebooks monitor
        if(!this._note_monitor)
        {
            // setup the monitor
            let note_file_html = this._get_note_file_html();
            let note_file = Gio.file_new_for_path(note_file_html);
            this._note_monitor = note_file.monitor(Gio.FileMonitorFlags.NONE, null);
            this._note_monitor.connect('changed', Lang.bind(this, this._note_file_has_changed));
        }
    },

     _note_file_has_changed: function()
    {
        let can_i_update = true;
        let content_new = null;
        let note_file_html = this._get_note_file_html();

        try
        {
            content_new = Shell.get_file_contents_utf8_sync(note_file_html)
        }
        catch(e)
        {
            content_new = "";
        }

        if(this._local_content == content_new)
        {
            can_i_update = false;
        }

        if(can_i_update)
        {
            this._local_content = content_new;
            global.log(EvergnomeUtils.getLocaleDateStringLog() + " data has changed... " + note_file_html + " note");
            EvergnomeUtils.update_note_cmd(this._note_guid);
        }
    },

    destroy: function()
    {
        this.parent();
    }

});