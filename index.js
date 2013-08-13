// ## Load S3Stream
//
// Loads the base S3Stream class, which extends `stream.Writable`.
var S3Stream = require('./lib/Stream');

// ## CreateWriteStream
//
// Usage:
//
// ```
// var AWS = require('aws-sdk');
// var s3 = new AWS.S3(configParams);
// var createS3WriteStream = require('s3-write-stream');
// var targetFile = {Bucket: 'random-access-memories', Key: 'to-get-lucky.log'};
// var s3stream = createS3WriteStream(s3, targetFile);;
// fs.createReadStream('./for-good-fun.log').pipe(s3stream);
// ```
//
// Arguments:
//
// * `s3`: Authenticated `AWS.S3` instance
// * `params`: same params object as `AWS.S3.createMultipartUpload()`
// * `callback`: Optional, called with `(err, writeableStream)`
//
// A writeable stream will be immediately returned, but the stream will not
// be ready yet. An upload ID must be retrieved from S3 before the stream
// will be ready. You can handle this in a few ways:
//
// * Wait for the stream to emit a `writable` event
// * Provide a callback, which will be called with `(err, writeableStream)`
//   when the stream is ready
// * Start writing immediately and respect `false` return values. This is how
//   Node's `stream.pipe()` behaves
module.exports = function(s3, params, callback) {
  var s3stream = new S3Stream(params, s3);

  s3.createMultipartUpload(params, function(err, data) {
    // Default callback to a noop
    callback = callback || function(){};

    // Pass errors to the callback and emit them from the stream
    if (err) {
      s3stream.emit('error', err);
      return callback(err);
    }

    // Set the `UploadId` from S3
    s3stream.params.UploadId = data.UploadId;

    // Run the callback
    callback(null, s3stream);

    // Fire the 'writable' event after the callback, in case the callback is
    // mistakenly waiting for the event.
    s3stream.emit('writable');
  });

  // Return the write stream
  return s3stream;
};