# Intentionally break the 80 chars limit for easy code reading

__author__  = "https://github.com/dialectic-chaos/gnome-shell-extensions-evergnome"
__version__ = "1"

# http://arstechnica.com/information-technology/2009/07/how-to-build-a-desktop-wysiwyg-editor-with-webkit-and-html-5/2/

import os
import sys
import time
import gtk
import gio
import webkit
import glib

from optparse import OptionParser

class PyEvergnomeEditor(gtk.Window):

  def __init__(self, filepath, title):

    gtk.Window.__init__(self)

    self.filename = filepath
    self.window_title = title
    self.last_update = None
    self.saved = False

    self.connect("destroy", gtk.main_quit)
    self.resize(800, 500)

    self.editor = webkit.WebView()
    self.editor.set_editable(True)

    self.status_bar = gtk.Statusbar()

    scroll = gtk.ScrolledWindow()
    scroll.add(self.editor)
    scroll.set_policy(gtk.POLICY_AUTOMATIC, gtk.POLICY_AUTOMATIC)

    self.ui = self.generate_ui()
    self.add_accel_group(self.ui.get_accel_group())
    self.toolbar1 = self.ui.get_widget("/toolbar_main")
    self.toolbar2 = self.ui.get_widget("/toolbar_format")
    self.menubar = self.ui.get_widget("/menubar_main")

    self.layout = gtk.VBox()
    self.layout.pack_start(self.menubar, False)
    self.layout.pack_start(self.toolbar1, False)
    self.layout.pack_start(self.toolbar2, False)
    self.layout.pack_start(scroll, True, True)
    self.layout.pack_end(self.status_bar, False, True)
    self.add(self.layout)

    # set file name and to open
    self.set_file_to_open(self.filename, self.window_title)

  def set_file_to_open(self, filepath, title):
    # if exists open it
    if os.path.exists(filepath):
          self.set_status_message(filepath)
          self.filename = filepath
          with open(filepath, "r") as fd:
            self.editor.load_html_string(fd.read(), "file:///")
          # set title
          self.set_title(title)

  def set_status_message(self, filepath, message = ""):
    self.last_update = time.ctime(os.path.getmtime(filepath))
    self.status_bar.push(-1, " " + message +" Last update was at " + self.last_update)

  def generate_ui(self):
    ui_def = """
    <ui>
      <menubar name="menubar_main">
        <menu action="menuFile">
          <menuitem action="save" />
        </menu>
        <menu action="menuEdit">
          <menuitem action="cut" />
          <menuitem action="copy" />
          <menuitem action="paste" />
        </menu>
        <menu action="menuInsert">
        </menu>
        <menu action="menuFormat">
          <menuitem action="bold" />
          <menuitem action="italic" />
          <menuitem action="underline" />
          <menuitem action="strikethrough" />
          <separator />
          <menuitem action="font" />
          <menuitem action="color" />
          <separator />
          <menuitem action="justifyleft" />
          <menuitem action="justifyright" />
          <menuitem action="justifycenter" />
          <menuitem action="justifyfull" />
        </menu>
      </menubar>
      <toolbar name="toolbar_main">
        <toolitem action="save" />
        <separator />
        <toolitem action="undo" />
        <toolitem action="redo" />
        <separator />
        <toolitem action="cut" />
        <toolitem action="copy" />
        <toolitem action="paste" />
      </toolbar>
      <toolbar name="toolbar_format">
        <toolitem action="bold" />
        <toolitem action="italic" />
        <toolitem action="underline" />
        <toolitem action="strikethrough" />
        <separator />
        <toolitem action="font" />
        <toolitem action="color" />
        <separator />
        <toolitem action="justifyleft" />
        <toolitem action="justifyright" />
        <toolitem action="justifycenter" />
        <toolitem action="justifyfull" />
        <separator />
        <toolitem action="insertlink" />
      </toolbar>
    </ui>
    """

    actions = gtk.ActionGroup("Actions")
    actions.add_actions([
      ("menuFile", None, "_File"),
      ("menuEdit", None, "_Edit"),
      ("menuInsert", None, "_Insert"),
      ("menuFormat", None, "_Format"),

      # ("new", gtk.STOCK_NEW, "_New", None, None, self.on_new),
      # ("open", gtk.STOCK_OPEN, "_Open", None, None, self.on_open),
      ("save", gtk.STOCK_SAVE, "_Save", None, None, self.on_save),

      ("undo", gtk.STOCK_UNDO, "_Undo", None, None, self.on_action),
      ("redo", gtk.STOCK_REDO, "_Redo", None, None, self.on_action),

      ("cut", gtk.STOCK_CUT, "_Cut", None, None, self.on_action),
      ("copy", gtk.STOCK_COPY, "_Copy", None, None, self.on_action),
      ("paste", gtk.STOCK_PASTE, "_Paste", None, None, self.on_paste),

      ("bold", gtk.STOCK_BOLD, "_Bold", "<ctrl>B", None, self.on_action),
      ("italic", gtk.STOCK_ITALIC, "_Italic", "<ctrl>I", None, self.on_action),
      ("underline", gtk.STOCK_UNDERLINE, "_Underline", "<ctrl>U", None, self.on_action),
      ("strikethrough", gtk.STOCK_STRIKETHROUGH, "_Strike", "<ctrl>T", None, self.on_action),
      ("font", gtk.STOCK_SELECT_FONT, "Select _Font", "<ctrl>F", None, self.on_select_font),
      ("color", gtk.STOCK_SELECT_COLOR, "Select _Color", None, None, self.on_select_color),

      ("justifyleft", gtk.STOCK_JUSTIFY_LEFT, "Justify _Left", None, None, self.on_action),
      ("justifyright", gtk.STOCK_JUSTIFY_RIGHT, "Justify _Right", None, None, self.on_action),
      ("justifycenter", gtk.STOCK_JUSTIFY_CENTER, "Justify _Center", None, None, self.on_action),
      ("justifyfull", gtk.STOCK_JUSTIFY_FILL, "Justify _Full", None, None, self.on_action),

      ("insertlink", "insert-link", "Insert _Link", None, None, self.on_insert_link),
    ])

    actions.get_action("insertlink").set_property("icon-name", "insert-link")

    ui = gtk.UIManager()
    ui.insert_action_group(actions)
    ui.add_ui_from_string(ui_def)

    return ui

  def on_action(self, action):
    self.editor.execute_script("document.execCommand('%s', false, false);" % action.get_name())

  def on_paste(self, action):
    self.editor.paste_clipboard()

  def on_select_font(self, action):
    dialog = gtk.FontSelectionDialog("Select a font")
    if dialog.run() == gtk.RESPONSE_OK:
      fname, fsize = dialog.fontsel.get_family().get_name(), dialog.fontsel.get_size()
      self.editor.execute_script("document.execCommand('fontname', null, '%s');" % fname)
      self.editor.execute_script("document.execCommand('fontsize', null, '%s');" % fsize)
    dialog.destroy()

  def on_select_color(self, action):
    dialog = gtk.ColorSelectionDialog("Select Color")
    if dialog.run() == gtk.RESPONSE_OK:
      gc = str(dialog.colorsel.get_current_color())
      color = "#" + "".join([gc[1:3], gc[5:7], gc[9:11]])
      self.editor.execute_script("document.execCommand('forecolor', null, '%s');" % color)
    dialog.destroy()

  def on_insert_link(self, action):
    dialog = gtk.Dialog("Enter a URL:", self, 0,(gtk.STOCK_CANCEL, gtk.RESPONSE_CANCEL, gtk.STOCK_OK, gtk.RESPONSE_OK))

    entry = gtk.Entry()
    dialog.vbox.pack_start(entry)
    dialog.show_all()

    if dialog.run() == gtk.RESPONSE_OK:
      self.editor.execute_script("document.execCommand('createLink', true, '%s');" % entry.get_text())
    dialog.destroy()

  def on_save(self, action):
    if self.filename:
      note = open(self.filename,"w")
      html_content = self.get_html()
      # write necessay headers (avoided in the editor)
      note.write('<?xml version="1.0" encoding="UTF-8"?>\n')
      note.write('<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\n')
      # remove content
      try:
        pass
        html_content = html_content.replace("<head>","");
        html_content = html_content.replace("</head>","");
        html_content = html_content.replace("<body>","");
        html_content = html_content.replace("</body>","");
        html_content = html_content.replace("<title>","");
        html_content = html_content.replace("</title>","");
        html_content = html_content.replace('<br clear="none">', '<br clear="none"/>')
        html_content = html_content.replace("<br>","<br/>");
      except Exception, e:
        pass

      note.write(html_content)
      note.close()
      self.set_status_message(self.filename, "[ Saved ]")
      self.saved = True

  def get_html(self):
    self.editor.execute_script('oldtitle=document.title;document.title=document.documentElement.innerHTML;')
    html = self.editor.get_main_frame().get_title()
    self.editor.execute_script('document.title=oldtitle;')
    return html

# # standalone file monitor
# def file_changed(arg1, arg2, arg3, arg4):
#   print "changed"
#   # if not self.saved:
#   #   self.set_file_to_open(self.filename, self.window_title)
#   #   self.set_status_message(self.filename, "[ Synched ]")
#   #   self.saved = False

if __name__ == '__main__':

  parser = OptionParser("\n\t%prog -f {filepath} -t {title}")
  parser.add_option("-f", help = "absolute file path", dest="filepath")
  parser.add_option("-t", help = "title to use in the window", dest="title")

  (options, args) = parser.parse_args()
  # if no argument is passed, exit
  if not options.filepath or not options.title:
    sys.exit(1)

  # file_monitor = gio.File(options.filepath).monitor_file(gio.FILE_MONITOR_NONE, None)
  # file_monitor.connect("changed", file_changed)

  # create the object and open the windows
  pyEvergnomeEditor = PyEvergnomeEditor(options.filepath, options.title)
  pyEvergnomeEditor.show_all()
    # setup the file monitor

  gtk.main()
