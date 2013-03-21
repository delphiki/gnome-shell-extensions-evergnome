__author__  = "https://github.com/dialectic-chaos/gnome-shell-extensions-evergnome"
__version__ = "1"

__all__     = ['PyEvergnome']

import os
import sys
import time
import math
import hashlib
import binascii
import json

from optparse import OptionParser

try:
	from evernote.api.client import EvernoteClient
	from evernote.api.client import EvernoteClient
	from evernote.api.client import NoteStore
	import evernote.edam.userstore.constants as UserStoreConstants
	import evernote.edam.type.ttypes as Types
	import evernote.edam.limits.constants as Limit
except:
	sys.path.insert(0, os.path.join(os.path.dirname(__file__), "thirdparty/evernote-sdk-python/lib/"))
	from evernote.api.client import EvernoteClient
	from evernote.api.client import NoteStore
	import evernote.edam.userstore.constants as UserStoreConstants
	import evernote.edam.type.ttypes as Types
	import evernote.edam.limits.constants as Limit

class PyEvergnome(object):

	def __init__(self, auth_token):
		self.__base_path = os.path.join(os.path.dirname(__file__))
		self.__auth_token = auth_token
		self.__sandbox = False
		self.__client = None
		self.__user_store = None
		self.__note_store = None
		self.__notebooks = None
		self.__evernote_data_path = None
		self.__notebooks_list = None
		self.__error_list = None
		self.__notebooks_notes = None
		# default initialization
		self.default()

	def checkapi(self):
		status = self.__user_store.checkVersion("Evernote EDAMTest (Python)", UserStoreConstants.EDAM_VERSION_MAJOR, UserStoreConstants.EDAM_VERSION_MINOR)
		return status

	def connect(self):
		self.__client = EvernoteClient(token=self.__auth_token, sandbox = self.__sandbox)
		self.__user_store = self.__client.get_user_store()
		self.__note_store = self.__client.get_note_store()

	def default(self):
		self.__evernote_data_path = os.path.join(os.path.dirname(__file__), "data/evernote/")
		self.__notebooks_list = []
		self.__error_list = []

		self.notebooks_write_json()
		self.error_write_json()

	def error_register(self, error_message, error_filter):
		self.__error_list.append({ "message" :  error_message, "filter" :  error_filter })
		self.error_write_json()

	def error_write_json(self):
		error_data = json.dumps({ "errors" : self.__error_list }, sort_keys = True, indent = 4, separators = (',', ': '))
		config_file_path = os.path.join(os.path.dirname(__file__), "data/errors.json")
		data_file = open(config_file_path, "w")
		data_file.write(error_data)
		data_file.close()

	def notebooks_get(self):
		self.__note_store =  self.__client.get_note_store()
		self.__notebooks_list = self.__note_store.listNotebooks()

	def notebooks_get_json(self):
		notebooks = self.__notebooks_list
		toJsonNotebooks = []

		for notebook in notebooks:
			toJsonNotebooks.append(
				{
					"name" : notebook.name,
					"guid" : notebook.guid,
					"notes" : self.notes_get_json_raw(notebook.guid)
				})

		self.__notebooks_notes = json.dumps({ "notebooks" : toJsonNotebooks }, sort_keys = True, indent = 4, separators = (',', ': '))
		return self.__notebooks_notes

	def notebooks_write_json(self):
		if not os.path.exists(self.__evernote_data_path):
				os.makedirs(self.__evernote_data_path)

		jsonNotebooks = self.notebooks_get_json()
		filename = "notebooks.json"
		filepath = os.path.join(self.__evernote_data_path, filename)
		data_file = open(filepath, "w")
		data_file.write(jsonNotebooks)
		data_file.close()

	def notebooks_write_dirs(self):
		notebooks = self.__notebooks_list
		for notebook in notebooks:
			notebook_path = os.path.join(self.__evernote_data_path, notebook.guid)
			if not os.path.exists(notebook_path):
				os.makedirs(notebook_path)

	def notes_write_json(self):
		notebooks = self.__notebooks_list
		for notebook in notebooks:
			notebook_path = os.path.join(self.__evernote_data_path, notebook.guid)
			temp_notes_json = None
			if os.path.exists(notebook_path):
				filename = notebook.guid + ".json"
				filepath = os.path.join(self.__evernote_data_path, filename)
				data_file = open(filepath, "w")
				data_file.write(self.notes_get_json(notebook.guid))
				data_file.close()

	def notes_get(self, guid):
		note_filter = NoteStore.NoteFilter (None)
		note_filter.notebookGuid = guid
		note_list = self.__note_store.findNotes(note_filter, 0, Limit.EDAM_USER_NOTES_MAX)
		return note_list.notes

	def notes_get_json_raw(self, guid):
		notes = self.notes_get(guid)
		toJsonNotes = []

		for note in notes:
			toJsonNotes.append(
				{
					"title" : note.title,
					"guid" : note.guid,
					"updated" : note.updated
				})

		return toJsonNotes

	def notes_get_json(self, guid):
		return json.dumps({ "notes" : self.notes_get_json_raw(guid) }, sort_keys = True, indent = 4, separators = (',', ': '))

	def notebooks_notes_write_data(self):
		jdata = json.loads(self.__notebooks_notes)
		for notebook in jdata['notebooks']:
			notebook_guid = notebook['guid']
			for note in notebook['notes']:
				note_guid = note['guid']
				content = self.__note_store.getNoteContent(note_guid)
				filepath = os.path.join(self.__evernote_data_path, notebook_guid, note_guid + ".html")
				# write the content
				data_file = open(filepath, "w")
				data_file.write(content)
				data_file.close()

	def update_note(self, note_guid):
		note = self.__note_store.getNote(note_guid, True, True, True, True)
		notebook_guid = note.notebookGuid

		note_file = os.path.join(self.__evernote_data_path, notebook_guid, note_guid + ".html")

		updated_at = (math.trunc(os.path.getmtime(note_file))) * 1000

		# if has same and equal timestamps, end the execution of the method
		if(updated_at <= note.updated):
			return

		# get the note content
		note_filepath = open(note_file,"r")
		note_content = note_filepath.read();
		note_filepath.close()

		# update the note
		try:
			note.content = note_content
			note.updated = updated_at
			#self.__note_store.updateNote(note)
		except Exception, e:
			print e

if __name__ == '__main__':

	parser = OptionParser("\n\t%prog -a {auth_token} ")
	parser.add_option("-a", help = "Auth token", dest="auth_token")
	parser.add_option("-u", help = "guid of the note to update", dest="update_note")

	(options, args) = parser.parse_args()
	# if no argument is passed, exit
	if not options.auth_token:
		pyEvergnome.error_register("no auth token")
		sys.exit(1)

	try:
		pyEvergnome = PyEvergnome(options.auth_token)
	except:
		print "Fatal error! post this in github right away!"
		exit(1)

	try:
		pyEvergnome.connect()

		if not pyEvergnome.checkapi():
			pyEvergnome.error_register("Evernote API not up to date","evernote-api")
			exit(1)


		if not options.update_note:
			# synch the notebook and his notes
			# get notebokos
			pyEvergnome.notebooks_get()
			# get notes and create the json data
			pyEvergnome.notebooks_write_json()
			# create the directories for notes
			pyEvergnome.notebooks_write_dirs()
			# write/re-write the notes
			pyEvergnome.notebooks_notes_write_data()
		else:
			# update the note
			pyEvergnome.update_note(options.update_note)

	except Exception, e:
		pyEvergnome.error_register("No internet access","network-no-internet")
		print e
		exit(1)

