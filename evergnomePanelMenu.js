const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener

const MessageTray = imports.ui.messageTray;

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Shell= imports.gi.Shell;
const Clutter = imports.gi.Clutter;
const Mainloop = imports.mainloop;

const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ModalDialog = imports.ui.modalDialog;

const Local = imports.misc.extensionUtils.getCurrentExtension();

const _ = imports.gettext.domain(Local.metadata['gettext-domain']).gettext;

const EvergnomeUtils = Local.imports.evergnomeUtils;
const EvergnomePopMenuItem = Local.imports.evergnomePopMenuItem.EvergnomePopMenuItem;

const EvergnomePanelMenu = new Lang.Class(
{
	Name: 'EvergnomePanelMenu',
	Extends: PanelMenu.SystemStatusButton,
    _extensionPath: null,

    _init: function()
    {
        // set icon
        this._extensionPath = Local.path.toString() + "/";
    	this.parent('emblem-cm-symbolic');
    	let gicon = new Gio.FileIcon({ file: Gio.file_new_for_path(GLib.build_filenamev([this._extensionPath, 'icons/evergnome.png']))});
    	this.setGIcon(gicon);

        // define class member variables
        // define mainloop
        this._mainloop = null;
        // stuff
        this._title = null;
        this._show_notifications = null;
        this._settings = null;
        this._manual_update = null;
        this._about = null;

        // set data vars
        this._data_notebooks = EvergnomeUtils.getNotebookJsonData();
        this._last_synch_date = "";

        // setup file monitor
        this._notebooks_monitor = null;
        this._setup_file_monitor();

        // build menu and synch data
        this._notebooks_file_changed();
        this._sync_data_notebooks();
    },

    _build_menu_pre: function()
    {
        this.menu.removeAll();
        // main title
        this._title = new PopupMenu.PopupSwitchMenuItem(_("EverGnome"), { reactive: false });
        this._title.setStatus("");
        this.menu.addMenuItem(this._title);
    },

    _build_menu_post: function()
    {
        // separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // show notifications on/off
        let show_notifications = EvergnomeUtils.settings_data().show_notifications;
        this._show_notifications = new PopupMenu.PopupSwitchMenuItem(_("Show Notifications"), show_notifications);
        this._show_notifications.connect("toggled", Lang.bind(this, this._show_notifications_set_callback));
        this.menu.addMenuItem(this._show_notifications);

        // settings
        this._settings = new PopupMenu.PopupMenuItem(_("Settings"));
        this._settings.connect("activate", this._settings_callback);
        this.menu.addMenuItem(this._settings);

        // manual update
        this._manual_update = new PopupMenu.PopupMenuItem(_("Manual Update"));
        this._manual_update.connect("activate", Lang.bind(this, this._manual_update_synch));
        this.menu.addMenuItem(this._manual_update);

        // separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // about
        this._about = new PopupMenu.PopupMenuItem(_("About"));
        this._about.connect("activate", Lang.bind(this, this._about_callback));
        this.menu.addMenuItem(this._about);
    },

    _build_menu: function()
    {
        // build menu
        this._build_menu_pre();
        this._build_menu_notebooks();
        this._build_menu_post();
    },

    _destroy_menu: function()
    {
        for (let i = 0; i < this.menu.numMenuItems; i++)
        {
            this.menu._getMenuItems()[i].destroy();
        }
        this.menu.removeAll();
    },

    _show_notifications_set_callback: function(item, state)
    {
        EvergnomeUtils.settings_save_show_notifications(state);
    },

    _settings_callback: function()
    {
        let app = Shell.AppSystem.get_default().lookup_app("gnome-shell-extension-prefs.desktop");
        if(app != null)
        {
            app.launch(global.display.get_current_time_roundtrip(), ['extension:///' + Local.uuid], -1, null);
        }
    },

    _about_callback: function()
    {
        //open https://github.com/dialectic-chaos/gnome-shell-extensions-evergnome
        let extension_github_uri = "https://github.com/dialectic-chaos/gnome-shell-extensions-evergnome";
        Gio.app_info_launch_default_for_uri(extension_github_uri, global.create_app_launch_context());
    },

    _sync_data_notebooks: function()
    {
        // give space, to keep the same width as "last synch at..."
        this._set_status_message("                               wait a few, synch in progress...", false);
        // get and write the data
        EvergnomeUtils.getNotesAsJsonCmd();
        // loop
        Mainloop.source_remove(this._mainloop);
        this._synch_event();
    },

    _build_menu_notebooks: function()
    {
        let can_i_buld_it = true;
        try
        {
            if(!this._data_notebooks)
            {
                can_i_buld_it = false;
            }
            if(this._data_notebooks.length <= 0)
            {
                can_i_buld_it = false;
            }
        }
        catch(e)
        {
            global.log(EvergnomeUtils.getLocaleDateStringLog() + "_build_menu_notebooks : I cannot build the menu... yet: " + e.message);
            can_i_buld_it = false;
        }

        if(can_i_buld_it)
        {
            // add a separator
            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

            // create the menu for the notes
            for (let i = 0; i < this._data_notebooks.length; i++)
            {
                let submenu = new PopupMenu.PopupSubMenuMenuItem(_(this._data_notebooks[i].name));

                for (let x = 0; x < this._data_notebooks[i].notes.length; x++)
                {
                    let popMenuItem = new EvergnomePopMenuItem(
                        _(this._data_notebooks[i].name),
                        _(this._data_notebooks[i].notes[x].title),
                        _(this._data_notebooks[i].guid),
                        _(this._data_notebooks[i].notes[x].guid))

                    submenu.menu.addMenuItem(popMenuItem);
                }
                this.menu.addMenuItem(submenu);
            }
        }

        this._last_synch_date = EvergnomeUtils.getLocaleDateString();
        this._set_status_message("last synch at " + this._last_synch_date, true);
    },

    _set_status_message: function(message, is_synched)
    {
        // check if the title isn't null
        if(this._title)
        {
            this._title.setStatus(message);
        }

        let show_notifications = EvergnomeUtils.settings_data().show_notifications;

        if(is_synched && show_notifications)
        {
            let notification_source = new MessageTray.Source(_("evergnome"), 'evergnome');
            Main.messageTray.add(notification_source);
            notification_source.notify(new MessageTray.Notification(notification_source, _("EverGnome"), _(message), { body: _("'%s'").format("synched") }));
        }
    },

    _synch_event: function()
    {
        // create new main loop
        let seconds = 1000;
        let minutes = 60*seconds;

        // get interval refresh from settings
        let refresh = EvergnomeUtils.settings_data().refresh_interval;

        this._mainloop = Mainloop.timeout_add(refresh*minutes, Lang.bind(this, function(){
            global.log(EvergnomeUtils.getLocaleDateStringLog() + "_synch_event about to synch the data...");
            this._sync_data_notebooks();
            return true;
        }));
    },

    _manual_update_synch: function()
    {
        // synch the notebook data
        this._sync_data_notebooks();
    },

    _setup_file_monitor: function()
    {
        // set the notebooks monitor
        if(!this._notebooks_monitor)
        {
            // setup the monitor
            let notebooks_file = Gio.file_new_for_path(EvergnomeUtils.getNotebookJsonFile());
            this._notebooks_monitor = notebooks_file.monitor(Gio.FileMonitorFlags.NONE, null);
            this._notebooks_monitor.connect('changed', Lang.bind(this, this._notebooks_file_changed));
        }
    },

    _notebooks_file_changed: function()
    {
        // update the notebooks json data, whithout executing the cmd

        let can_i_synch = true;

        // control the file monitor updater
        if(JSON.stringify(this._data_notebooks) == JSON.stringify(EvergnomeUtils.getNotesAsJson()))
        {
            can_i_synch = false;
        }

        if(can_i_synch)
        {
            this._data_notebooks = EvergnomeUtils.getNotesAsJson();

            // rebuild the menu if exists more than 1 element in the array
            if(this._data_notebooks.length > 1)
            {
                this._destroy_menu();
                this._build_menu();
                // register the change
                global.log(EvergnomeUtils.getLocaleDateStringLog() + " data has changed... " + this._data_notebooks.length + " notebooks");
            }
        }
    },

    destroy: function()
    {
        // disconnect all callbacks
        this._show_notifications.disconnect(this._show_notifications_set_callback);
        this._settings.disconnect(this._settings_callback);
        this._manual_update.disconnect(this._manual_update_synch);
        this._about.disconnect(this._about_callback);
        this._notebooks_monitor.disconnect(this._notebooks_file_changed);

        // destroy all ui elements
        this._mainloop.destroy();
        this._title.destroy();
        this._show_notifications.destroy();
        this._settings.destroy();
        this._manual_update.destroy();
        this._about.destroy();
        this._notebooks_monitor.destroy();
        // set them to null
        this._mainloop =  null;
        this._title =  null;
        this._show_notifications =  null;
        this._settings =  null;
        this._manual_update =  null;
        this._about =  null;
        this._notebooks_monitor =  null;

        this.parent();
    }

});