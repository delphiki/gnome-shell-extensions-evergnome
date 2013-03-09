const Lang = imports.lang;
const Gtk = imports.gi.Gtk;

const Local = imports.misc.extensionUtils.getCurrentExtension();

const Convenience = Local.imports.convenience;
const Settings = Local.imports.settings;

const _ = imports.gettext.domain(Local.metadata['gettext-domain']).gettext;

// global local variables
let main_frame = null;

// auth token
let auth_token_box = null;
let auth_token_label = null;
let auth_token_input = null;

// refresh interval
let refresh_box = null;
let refresh_label = null;
let refresh_input = null;

// editor
let editor_box = null;
let editor_label = null;
let editor_input = null;

// save settings box
let save_settings_box = null;
let save_settings_button = null;
let save_settings_spacer = null;

// settings
let settings = null;
let settings_data = null;

// dummy one
function init(){}

function widget_initliaze()
{
    // initilize main frame
    main_frame = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, border_width: 10 });

    // auth
    auth_token_box = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
    auth_token_label = new Gtk.Label({label: "Evernote Auth Token", xalign: 0, margin_right: 30 });
    auth_token_input = new Gtk.Entry({ hexpand: true, text: "" });

    // refresh time
    refresh_box = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
    refresh_label = new Gtk.Label({label: "Refresh every (minutes) ", xalign: 0});
    refresh_input = new Gtk.HScale.new_with_range(5, 90, 5);

    // editor
    editor_box = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
    editor_label = new Gtk.Label({label: "Select Editor ", xalign: 0, margin_right: 76 });
    editor_input = new Gtk.Entry({ hexpand: true, text: "/usr/bin/emacs" })

    // save settings box
    save_settings_box = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL });
    save_settings_spacer = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL, vexpand: true, hexpand: true });
    save_settings_button = new Gtk.Button({label: "Save Settings" });
}

function widget_packaging()
{
    // auth
    auth_token_box.pack_start(auth_token_label, false, false, 15);
    auth_token_box.pack_start(auth_token_input, true, true, 15);

    // reefresh
    refresh_box.pack_start(refresh_label, false, false, 15);
    refresh_box.pack_start(refresh_input, true, true, 15);

    // reefresh
    editor_box.pack_start(editor_label, false, false, 15);
    editor_box.pack_start(editor_input, true, true, 15);

    // save settings
    save_settings_box.pack_start(save_settings_spacer, true, true, 15);
    save_settings_box.pack_start(save_settings_button, false, false, 15);

    main_frame.add(auth_token_box);
    main_frame.add(refresh_box);
    main_frame.add(editor_box);
    main_frame.add(save_settings_box);
}

function widget_connect()
{
    // save settings action
    save_settings_button.connect('clicked', Lang.bind(this, save_settings_button_callback));
}

// callbacks

function save_settings_button_callback()
{
    // get the settings
    settings = Convenience.getSettings();
    settings_data = Settings.getSettings(settings);

    // update the values
    settings_data.evernote_auth_token = auth_token_input.get_text();
    settings_data.refresh_interval = refresh_input.get_value();
    settings_data.editor = editor_input.get_text();

    settings.set_string("settings-json", JSON.stringify(settings_data));
}

// setting init values
function widget_init_values()
{
    // setup settings
    settings = Convenience.getSettings();
    settings_data = Settings.getSettings(settings);

    // set the saved auth token value
    auth_token_input.set_text(settings_data.evernote_auth_token);

    // set the save refresh value
    refresh_input.set_value(settings_data.refresh_interval);
    refresh_input.set_size_request(settings_data.refresh_interval,-1);

    // set the saved editor input
    editor_input.set_text(settings_data.editor);
}

function buildPrefsWidget()
{
    // lifecycle
    widget_initliaze();
    widget_packaging();
    widget_connect();
    widget_init_values();

    // show frame
	main_frame.show_all();
	return main_frame;
}