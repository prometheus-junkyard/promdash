# PromDash

Dashboards for Prometheus.

![promdash](http://prometheus.io/assets/promdash_event_processor.png)

## Testing

[![Build Status](https://travis-ci.org/prometheus/promdash.svg?branch=master)](https://travis-ci.org/prometheus/promdash)

### Ruby

```bash
$ bundle exec rake
```

### Javascript

```bash
$ RAILS_ENV=test bundle exec rake karma:run
```

### JSHint
JSHint is run against all pull requests. To shorten the feedback loop, it is recommended that you run JSHint locally.
With [NPM installed](https://docs.npmjs.com/getting-started/installing-node), install and run JSHint:

```bash
$ npm install jshint -g
$ jshint app/assets/javascripts
```

## Deployment

### Development Mode
Install gems:

    bundle

Set up your database:

    cp config/database.yml.example config/database.yml
    RAILS_ENV=development bundle exec rake db:setup

Start the Rails server:

    bundle exec rails s

### Production Mode
In production mode, you need to define a number of environment variables to
configure the database parameters:

    DATABASE_URL="mysql2://username:password@host/database"
    RAILS_ENV="production"

Create a self-contained Ruby environment and precompile assets:

    make build

Run the production server from the bundled environment:

    bin/env bin/bundle exec bin/thin -p $PORT start

### Deploy with Docker
To deploy PromDash with Docker, use the [prom/promdash](https://registry.hub.docker.com/u/prom/promdash/) Docker image.
By default, the image will start the [thin webserver](http://code.macournoyer.com/thin/)
webserver in production mode. To run rake tasks like migrations, you
can specify any kind of command as parameter to the Docker image.  

#### Super easy quickstart deployment with Docker

The following is a quick-start example for running PromDash with a file-based local database.

First, create the SQLite3 database in a shared local Docker volume on the host:

    docker run -v /tmp/prom:/tmp/prom -e DATABASE_URL=sqlite3:/tmp/prom/file.sqlite3 prom/promdash ./bin/rake db:migrate

Now, we launch PromDash with the database we've just created:

    docker run -p 3000:3000 -v /tmp/prom:/tmp/prom -e DATABASE_URL=sqlite3:/tmp/prom/file.sqlite3 prom/promdash

### Deploy behind a reverse proxy

To deploy PromDash behind a reverse proxy you can set a global path prefix
using the environment variable `PROMDASH_PATH_PREFIX`. Once set all URLs will
start with the given prefix.

### Deployment Checklist

*Before* deploying a new version of PromDash, follow this checklist:

- Study what has changed since the last deployment:
  - Do any migrations need to be performed (`bundle exec rake db:migrate`)?
  - Do any new environment variables need to be set?
  - Did any of the stored dashboard JSON formats change in a backwards-incompatible way?
- To be safe, create a backup of the current PromDash database.
- Do tests pass for the new revision?
- Are there any other particularly risky changes?

*After* deploying a new version:

- Perform a hard refresh in the browser to ensure all loaded assets are up-to-date.
- Test basic functionality as appropriate (Prometheus and Graphite graph settings, etc.).

### Security Considerations

Since we frequently need to display various PromDash views in inline frames, we
disabled Rails' default header `X-Frame-Options: SAMEORIGIN` for all views:

https://github.com/prometheus/promdash/commit/5b1da215296b5316568ad7c8449652f0d7f74ebe

If you are worried about [clickjacking attacks](http://en.wikipedia.org/wiki/Clickjacking),
it is safe to revert this commit as long as you don't need to display dashboards in iframes.
