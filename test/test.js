/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const assert = require('assert');
const eslint = require('eslint');
const conf = require('../');

// The source files to lint.
const repoFiles = [
  'index.js',
  'test/test.js',
];

// Use the rules defined in this repo to test against.
const eslintOpts = {
  useEslintrc: false,
  envs: ['node', 'es6'],
  parserOptions: {ecmaVersion: 2018},
  rules: conf.rules,
};

// Runs the linter on the repo files and asserts no errors were found.
const report = new eslint.CLIEngine(eslintOpts).executeOnFiles(repoFiles);
assert.equal(report.errorCount, 0);
assert.equal(report.warningCount, 0);
repoFiles.forEach((file, index) => {
  assert(report.results[index].filePath.endsWith(file));
});

const getNewAccessToken = () => {
  return new Promise((resolve, reject) => {
    const params = querystring.stringify({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      redirect_uri: 'http://localhost:3003/signin',
      scope: 'read_homecoach',
    });

    const options = {
      hostname: 'api.atom.com',
      path: '/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    };

    const callback = function(response) {
      console.log('in call back ' + response);
      response.on('error', function(e) {
        console.log('error', e);
      });
      let resp = '';

      response.on('data', function(chunk) {
        resp += chunk;
      });

      response.on('end', function() {
        resp = JSON.parse(resp);
        if (response.statusCode == '200') {
          firebase
              .ref('/system/setting/')
              .once('value')
              .then(function(snapshot) {
                fbConfig = snapshot.val();
                fbConfig.accessToken = resp.access_token;
                fbConfig.refreshToken = resp.refresh_token;
                firebase.ref('/system/setting/').set(fbConfig);
                accessToken = resp.access_token;
                resolve(resp.access_token);
              });
        } else {
          reject(response);
        }
      });
    };
    const request = https.request(options, callback);
    request.on('error', function(e) {
      console.log('There is a problem with your request:', e.message);
    });

    request.write(params);
    request.end();
  });
};
