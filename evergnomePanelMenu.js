const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener

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
const EvergnomeUtils = Local.imports.evergnomeUtils;

const EvergnomePanelMenu = new Lang.Class(
{
	Name: 'EvergnomePanelMenu',
	Extends: PanelMenu.SystemStatusButton,
    _extensionPath: null,

    _init: function(extensionPath)
    {
        // set icon
        this._extensionPath = extensionPath;
    	this.parent('emblem-cm-symbolic');
    	let gicon = new Gio.FileIcon({ file: Gio.file_new_for_path(GLib.build_filenamev([this._extensionPath, 'icons/evergnome.png']))});
    	this.setGIcon(gicon);

        // define class member variables
        this._mainloop = null;
        this._title = null;
        this._settings = null;
        this._manual_update = null;
        this._about = null;
        this._about_modal = null;

        // build menu
        this._build_menu_pre();
        this._build_menu_post();
    },

    _build_menu_pre: function()
    {
        this.menu.removeAll();

        // main title
        this._title = new PopupMenu.PopupSwitchMenuItem(_("EverGnome"), { reactive: false });
        this._title.setStatus("");
        this.menu.addMenuItem(this._title);

        // separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

    },

    _build_menu_post: function()
    {
        // separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // settings
        this._settings = new PopupMenu.PopupMenuItem(_("Settings"));
        this._settings.connect("activate", this._settings_callback);
        this.menu.addMenuItem(this._settings);

        // manual update
        this._manual_update = new PopupMenu.PopupMenuItem(_("Manual Update"));
        this.menu.addMenuItem(this._manual_update);

        // separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // about
        this._about = new PopupMenu.PopupMenuItem(_("About"));
        this._about.connect("activate", Lang.bind(this, this._about_callback));
        this.menu.addMenuItem(this._about);
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
        if(!this._about_modal)
        {
            // create modal
            this._about_modal = new ModalDialog.ModalDialog({ styleClass: 'run-dialog-label' });

            // create dialog content
            let about_file = this._extensionPath + '/extension.about';
            let about_data = Shell.get_file_contents_utf8_sync(about_file);
            let label = new St.Label({ style_class: 'about-box-content', text: _(about_data) });

            // create the icon
            let evernote_gicon = new Gio.FileIcon({ file: Gio.file_new_for_path(GLib.build_filenamev([this._extensionPath, 'icons/evergnome.png']))});
            let evernote_icon = new St.Icon({ icon_name: 'emblem-cm-symbolic', icon_size: 16 });
            evernote_icon.set_gicon(evernote_gicon);

            // create the box content
            let content_box = new St.BoxLayout({ style_class: 'about-box-content' });
            let content_message = this._errorMessage = new St.Label({ style_class: 'about-box-content-title', text: _(" Evergnome") });

            // add the stuff to the content box
            content_box.add(evernote_icon, { y_align: St.Align.MIDDLE });
            content_box.add(content_message, { expand: true, y_align: St.Align.MIDDLE, y_fill: false });

            // add it to the modal
            this._about_modal.contentLayout.add(content_box, { expand: true });
            this._about_modal.contentLayout.add(label, { expand: true });

            // make the proper connections
            this.actor.connect('key-press-event', Lang.bind(this, this._about_close_callback));
        }

        this._about_modal.open();
        global.log(Clutter.Escape);
        // auto close it in xx seconds
        let loop = Mainloop.timeout_add(20*1000, Lang.bind(this, function(){
            this._about_modal.close();
            return true;
        }));

    },

    _about_close_callback: function(actor, event)
    {
        let symbol = event.get_key_symbol();
        let modifierState = event.get_state();

        global.log(symbol);

        if (symbol == Clutter.Escape)
        {
            this._about_modal.close();
            //return true;
        }
    },

    _synch_data: function()
    {
        // let command = "python " + this._extensionPath + "/PyEvergnome.py";
        // let stdout = EvergnomeUtils.trySpawnCommandLine(command);

        // let notebooksJsonFile = this._extensionPath + '/data/evernote/notebooks.json';
        // let jsonRawData = Shell.get_file_contents_utf8_sync(notebooksJsonFile)
        // let jsonData = JSON.parse(jsonRawData);
        // let notebooks = jsonData.notebooks;

        // this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        // for (let i = 0; i < notebooks.length; i++)
        // {
        //     let submenu = new PopupMenu.PopupSubMenuMenuItem(_(notebooks[i].name));

        //     for (let x = 0; x < notebooks[i].notes.length; x++)
        //     {
        //         submenu.menu.addMenuItem(new PopupMenu.PopupMenuItem(_(notebooks[i].notes[x].title)));
        //     }

        //     this.menu.addMenuItem(submenu);
        // }

        // this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        // this.menu.addMenuItem(new PopupMenu.PopupMenuItem(_("About")));

        // loop
        Mainloop.source_remove(this._mainloop);
        this._synch_event();
    },

    _synch_event: function()
    {
        // create new main loop
        this._mainloop = Mainloop.timeout_add(360*1000, Lang.bind(this, function(){
            global.log("loop....");
            this._synch_data();
            return true;
        }));
    },

    destroy: function()
    {
    	this.parent();
    }
});

// CHUM this.statusItem
