const Util = imports.misc.util;
const GLib = imports.gi.GLib;

const Shell = imports.gi.Shell;

const Local = imports.misc.extensionUtils.getCurrentExtension();

const Convenience = Local.imports.convenience;
const Settings = Local.imports.settings;

const _ = imports.gettext.domain(Local.metadata['gettext-domain']).gettext;

let extensionPath = Local.path.toString() + "/";
let extensionName = "EverGnome";

// trySpawn:
// @argv: an argv array
//
// Runs @argv in the background. If launching @argv fails,
// this will throw an error.
//
// Refactored to return stdout (ATEJEDA)
//
function trySpawnDue(argv)
{
    var success, pid, stdout;

    try
    {
        [success, pid] = GLib.spawn_async(null, argv, null,
                                          GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
                                          null, null, stdout);
    }
    catch (err)
    {
        if (err.code == GLib.SpawnError.G_SPAWN_ERROR_NOENT)
        {
            err.message = _("Command not found");
        }
        else
        {
            // The exception from gjs contains an error string like:
            // Error invoking GLib.spawn_command_line_async: Failed to
            // execute child process "foo" (No such file or directory)
            // We are only interested in the part in the parentheses. (And
            // we can't pattern match the text, since it gets localized.)
            err.message = err.message.replace(/.*\((.+)\)/, '$1');
        }

        throw err;
    }
    // Dummy child watch; we don't want to double-fork internally
    // because then we lose the parent-child relationship, which
    // can break polkit. See https://bugzilla.redhat.com//show_bug.cgi?id=819275
    GLib.child_watch_add(GLib.PRIORITY_DEFAULT, pid, function () {}, null);

    return stdout;
}

// trySpawnCommandLine:
// @command_line: a command line
//
// Runs @command_line in the background. If launching @command_line
// fails, this will throw an error.
//
// Refactored to return stdout (ATEJEDA)
//
function trySpawnCommandLine(command_line)
{
    let success, argv;

    try
    {
        [success, argv] = GLib.shell_parse_argv(command_line);
    }
    catch (err)
    {
        // Replace "Error invoking GLib.shell_parse_argv: " with
        // something nicer
        err.message = err.message.replace(/[^:]*: /, _("Could not parse command:") + "\n");
        throw err;
    }

    return trySpawnDue(argv);
}

function settings_data()
{
    let settings = Convenience.getSettings();
    let settings_data = Settings.getSettings(settings);
    return settings_data
}

function settings_data_save(jsondata)
{
    let settings = Convenience.getSettings();
    settings.set_string("settings-json", JSON.stringify(jsondata));
}

function settings_save_auth_token(value)
{
    let jsondata = settings_data();
    jsondata.evernote_auth_token = value;
    settings_data_save(jsondata);
}

function settings_save_refresh_interval(value)
{
    let jsondata = settings_data();
    jsondata.refresh_interval = value;
    settings_data_save(jsondata);
}

function settings_save_editor(value)
{
    let jsondata = settings_data();
    jsondata.editor = value;
    settings_data_save(jsondata);
}

function settings_html_mode(value)
{
    let jsondata = settings_data();
    jsondata.html_mode = value;
    settings_data_save(jsondata);
}

function settings_save_show_notifications(value)
{
    let jsondata = settings_data();
    jsondata.show_notifications = value;
    settings_data_save(jsondata);
}

function getConfigurationJsonFile()
{
    // return the path
    return extensionPath + '/data/configuration.json';
}

function getNotebookJsonData()
{
    // return the path
    return JSON.parse('{ "notebooks" : [] }').notebooks;
}

function getNotebookJsonFile()
{
    // return the path
    return extensionPath + '/data/evernote/notebooks.json';
}

function getLocaleDateString()
{
    try
    {
        return new Date().toLocaleString();
    }
    catch(e)
    {
        global.log("Error executing getLocaleDateString: " + e.message);
        return "";
    }
}

function getLocaleDateStringLog()
{
    return getLocaleDateString() + " :: " + extensionName + " :: ";
}

function getNotesAsJsonCmd()
{
    try
    {
        let command = "python " + extensionPath + "/PyEvergnome.py -a '" + settings_data().evernote_auth_token + "'";
        let stdout = trySpawnCommandLine(command);
        // if is not empty, register the output
        if(stdout)
        {
            global.log(getLocaleDateString() + " Error executing getNotesAsJsonCmd: " + stdout);
        }
    }
    catch(e)
    {
        global.log(getLocaleDateString() + " Error executing getNotesAsJsonCmd: " + e.message);
    }
}

function getNotesAsJson()
{
    try
    {
        let jsonRawData = Shell.get_file_contents_utf8_sync(getNotebookJsonFile())
        let jsonData = JSON.parse(jsonRawData);
        let notebooks = jsonData.notebooks;
        return notebooks;
    }
    catch(e)
    {
        global.log(getLocaleDateString() + " Error reading the notebooks.json file: " + e.message);
        return getNotebookJsonData();
    }
}