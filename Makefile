# to remove

# variables
EXTENSION="evergnome@dialectic-chaos.github.com"

# files to ignore in the zip
IGNORE="data Makefile README.md schemas/* thirdparty .ignore .git"

evernotesdk:
	@rm -rf thirdparty
	@sh extension_setup.sh

schemma:
	glib-compile-schemas schemas

package:
	rm -rf $(EXTENSION)
	mkdir  /tmp/$(EXTENSION)/
	cp -r * /tmp/$(EXTENSION)/
	$(foreach file,$(IGNORE), rm -rf /tmp/$(EXTENSION)/$(file))

