var DirectoryEntry = require('./DirectoryEntry');
var DirectoryReader = require('./DirectoryReader');
var Entry = require('./Entry');
var File = require('./File');
var FileEntry = require('./FileEntry');
var FileError = require('./FileError');
var FileReader = require('./FileReader');
var FileSystem = require('./FileSystem');
var FileUploadOptions = require('./FileUploadOptions');
var FileUploadResult = require('./FileUploadResult');
var FileWriter = require('./FileWriter');
var Flags = require('./Flags');
var LocalFileSystem = require('./LocalFileSystem');
var Metadata = require('./Metadata');
var ProgressEvent = require('./ProgressEvent');
var requestFileSystem = require('./requestFileSystem');
var resolveLocalFileSystemURI = require('./resolveLocalFileSystemURI');

var FileMock = {
    attachToWindow: function() {
        window.DirectoryEntry = DirectoryEntry;
        window.DirectoryReader = DirectoryReader;
        window.Entry = Entry;
        window.File = File;
        window.FileEntry = FileEntry;
        window.FileError = FileError;
        window.FileReader = FileReader;
        window.FileSystem = FileSystem;
        window.FileUploadOptions = FileUploadOptions;
        window.FileUploadResult = FileUploadResult;
        window.FileWriter = FileWriter;
        window.Flags = Flags;
        window.LocalFileSystem = LocalFileSystem;
        window.Metadata = Metadata;
        window.ProgressEvent = ProgressEvent;
        window.requestFileSystem = requestFileSystem;
        window.resolveLocalFileSystemURI = resolveLocalFileSystemURI.resolveLocalFileSystemURI;
        window.resolveLocalFileSystemURL = resolveLocalFileSystemURI.resolveLocalFileSystemURL;
    }
};


module.exports = FileMock;