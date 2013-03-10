#
# Global variables
#
CURRENT_DIR=`pwd`

#
# Download evernote python sdk and setup the thirdparty directory
#
rm -rf thirdparty
mkdir -p thirdparty
curl -LO https://github.com/evernote/evernote-sdk-python/archive/master.zip
unzip master.zip
mv evernote-sdk-python-master thirdparty/evernote-sdk-python