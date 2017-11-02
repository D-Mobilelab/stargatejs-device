var Promise = require('promise-polyfill');

var File = {};

/**
 * _transform utils function
 * @private
 * @param {Array} entries - an array of Entry type object
 * @returns {Array.<Object>} - an array of Object
 * */
function _transform(entries){
    var arr = entries.map(function(entry){
        return {
            fullPath: entry.fullPath,
            path: entry.toURL(),
            internalURL: entry.toInternalURL(),
            isFile: entry.isFile,
            isDirectory: entry.isDirectory
        };
    });
    return (arr.length === 1) ? arr[0] : arr;
}

/**
 *  File.fileExists
 *
 *  @param {String} url - the toURL path to check
 *  @returns {Promise<boolean|void>}
 * */
File.fileExists = function(url) {
    return new Promise(function(resolve){
        window.resolveLocalFileSystemURL(url, function(entry){
            resolve(entry.isFile);
        }, function(fileError){
            resolve(fileError.code !== 1);
        });
    });
};

/**
 * File.resolveFS
 *
 * @param {String} url - the path to load see cordova.file.*
 * @returns {Promise<Entry|FileError>}
 * */
File.resolveFS = function(url){
    return new Promise(function(resolve, reject){
        window.resolveLocalFileSystemURL(url, resolve, reject);
    });
};

/**
 * File.readFile
 *
 * @param {String} filePath - the file entry to readAsText
 * @returns {Promise<String|FileError>}
 */
File.readFile = function(filePath) {
    return File.resolveFS(filePath)
        .then(function(fileEntry){
            return new Promise(function(resolve, reject){
                fileEntry.file(function(file) {
                    var reader = new FileReader();
                    reader.onerror = reject;
                    reader.onabort = reject;

                    reader.onloadend = function() {
                        var textToParse = this.result;
                        resolve(textToParse);
                    };
                    reader.readAsText(file);
                });
            });
        });
};

/**
 * File.readFileAsJSON
 * @param {String} indexPath - the path to the file to read
 * @returns {Promise<Object|FileError>}
 */
File.readFileAsJSON = function(indexPath){
    return File.readFile(indexPath)
        .then(function(documentAsString){
            try{
                return Promise.resolve(window.JSON.parse(documentAsString));
            }catch(e){
                return Promise.reject(e);
            }
        });
};

/**
 *  File.removeFile
 *
 *  @param {String} filePath - file://
 *  @returns {Promise<String|FileError>}
 * */
File.removeFile = function(filePath){
    return File.resolveFS(filePath)
        .then(function(fileEntry){
            return new Promise(function(resolve, reject){
                fileEntry.remove(function(result){
                    resolve(result === null || result === 'OK');
                }, reject);
            });
        });
};

/**
 * File.createFile
 *
 * @param {String} directory - filepath file:// like string
 * @param {String} filename - the filename including the .txt
 * @returns {Promise<FileEntry|FileError>}
 * */
File.createFile = function(directory, filename){
    return File.resolveFS(directory)
        .then(function(dirEntry){
            return new Promise(function(resolve, reject){
                dirEntry.getFile(filename, { create: true }, function(entry){
                    resolve(_transform([entry]));
                }, reject);
            });
        });
};

/**
 * File.appendToFile
 *
 * @param {String} filePath - the filepath file:// url like
 * @param {String|Blob} data - the string to write into the file
 * @param {String} [overwrite=false] - overwrite
 * @param {String} mimeType: text/plain | image/jpeg | image/png
 * @returns {Promise<String|FileError>} where string is a filepath
 */
File.appendToFile = function(filePath, data, overwrite, mimeType){
    // Default
    overwrite = arguments[2] === undefined ? false : arguments[2];// eslint-disable-line prefer-rest-params
    mimeType = arguments[3] === undefined ? 'text/plain' : arguments[3];// eslint-disable-line prefer-rest-params
    return File.resolveFS(filePath)
        .then(function(fileEntry){

            return new Promise(function(resolve, reject){
                fileEntry.createWriter(function(fileWriter) {
                    if(!overwrite){
                        fileWriter.seek(fileWriter.length);
                    }

                    var blob;
                    if(!(data instanceof Blob)){
                        blob = new Blob([data], { type: mimeType });
                    }else{
                        blob = data;
                    }

                    fileWriter.write(blob);
                    fileWriter.onerror = reject;
                    fileWriter.onabort = reject;
                    fileWriter.onwriteend = function(){
                        resolve(_transform([fileEntry]));
                    };
                }, reject);
            });

        });
};

/**
 * write a file in the specified path and if not exists creates it
 *
 * @param {String} filepath - file:// path-like
 * @param {String|Blob} content
 * @returns {Promise<Object|FileError>}
 * */
File.write = function(filepath, content){
    return File.fileExists(filepath).then(function(exists){
        if(!exists){
            var splitted = filepath.split('/');
            
            // this returns a new array and rejoin the path with /
            var folder = splitted.slice(0, splitted.length - 1).join('/');
            var filename = splitted[splitted.length - 1];

            return File.createFile(folder, filename).then(function(entry){
                return File.appendToFile(entry.path, content, true);                 
            });
        }
        return File.appendToFile(filepath, content, true);
    });
};

/**
 * getMetadata from FileEntry or DirectoryEntry
 * @param path {String} - the path string
 * @returns {Promise<Object|FileError>}
 */
File.getMetadata = function(path){
    return File.resolveFS(path)
                .then(function(entry){
                    return new Promise(function(resolve, reject){
                        entry.getMetadata(resolve, reject);
                    });                        
                });
};

module.exports = File;
