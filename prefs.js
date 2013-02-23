const Lang = imports.lang;
const Gtk = imports.gi.Gtk;

const Local = imports.misc.extensionUtils.getCurrentExtension();
//const _ = imports.gettext.domain(Local.metadata['gettext-domain']).gettext;

// global local variables
let main_frame = null;
let auth_token_box = null;
let auth_token_label = null;
let auth_token_button = null;

let save_settings_box = null;
let save_settings_button = null;
let save_settings_spacer = null;

function init(){}

function widget_initliaze()
{
    main_frame = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, border_width: 10 });

    // auth
    auth_token_box = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
    auth_token_label = new Gtk.Label({label: "Evernote Auth Token", xalign: 0, margin_right: 30 });
    auth_token_input = new Gtk.Entry({ hexpand: true, text: "default text" });

    // refresh time
    refresh_box = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
    refresh_label = new Gtk.Label({label: "Refresh every (seconds) ", xalign: 0});
    refresh_input = new Gtk.HScale.new_with_range( 1, 1200, 1 );

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

    // save settings
    save_settings_box.pack_start(save_settings_spacer, true, true, 15);
    save_settings_box.pack_start(save_settings_button, false, false, 15);

    main_frame.add(auth_token_box);
    main_frame.add(refresh_box);
    main_frame.add(save_settings_box);
}

function widget_connect()
{
    // auth
    save_settings_button.connect('clicked', Lang.bind(this, auth_token_button_callback));
}

// callbacks

function auth_token_button_callback()
{
    global.log(auth_token_input.get_text());
    global.log(refresh_input.get_value());
}

// setting init values
function widget_init_values()
{

}

function buildPrefsWidget()
{
    // lifecycle
    widget_initliaze();
    widget_packaging();
    widget_connect();
    widget_init_values();

	main_frame.show_all();
	return main_frame;
}

