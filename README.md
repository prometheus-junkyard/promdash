**NOTE**: PromDash is **deprecated**. We recommend
[**Grafana**](https://prometheus.io/docs/visualization/grafana/) for
visualization of Prometheus metrics nowadays, as it has native Prometheus
support and is widely adopted and powerful.

# PromDash

Dashboards for Prometheus.

![promdash](https://prometheus.io/assets/promdash_event_processor-cba2ecbeb64.png)

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

You need need to install multiple dependencies for the full development cycle.
Here is the rundown for Ubuntu 14.04 LTS as a reference. If you run into errors
with `bundle`, the most likely reason is that the database servers are not
properly installed with dev headers/libs.

* Node.js
 * `sudo apt-get install nodejs nodejs-legacy npm`
* Ruby
 * `sudo apt-get install ruby-full` ([details](https://www.ruby-lang.org/en/documentation/installation/))
* MySQL
 * `sudo apt-get install libmysqlclient-dev` ([details](https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/index.html#apt-repo-fresh-install))
* PostgreSQL
 * `sudo apt-get install postgresql-9.{3|4} postgresql-server-dev-9.{3|4}` ([details](http://www.postgresql.org/download/linux/))
* SQLite
 * `sudo apt-get install sqlite3 libsqlite3-dev` ([details](https://www.sqlite.org/download.html))

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

**Note**: Besides MySQL, you may also use any other Rails-compatible relational
database like PostgreSQL or SQLite3. See also
http://edgeguides.rubyonrails.org/configuring.html.

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

    docker run --rm -v /tmp/prom:/tmp/prom \
           -e DATABASE_URL=sqlite3:/tmp/prom/file.sqlite3 \
           prom/promdash ./bin/rake db:migrate

Now, we launch PromDash with the database we've just created:

    docker run -p 3000:3000 -v /tmp/prom:/tmp/prom \
           -e DATABASE_URL=sqlite3:/tmp/prom/file.sqlite3 \
           prom/promdash

You can pass parameters directly to the thin server with:

    docker run -p 3000:4000 -v /tmp/prom:/tmp/prom \
           -e DATABASE_URL=sqlite3:/tmp/prom/file.sqlite3 \
           prom/promdash ./bin/thin -a localhost -p 4000 start

### Deploy behind a reverse proxy

To deploy PromDash behind a reverse proxy you can set a global path prefix
using both environment variables `PROMDASH_PATH_PREFIX` and `RAILS_RELATIVE_URL_ROOT`.
Once set all URLs will start with the given prefix.

One simple way to secure your Prometheus deployment with authentication is
running a reverse proxy, Prometheus, and PromDash on the same machine. The goal
is to have a publicly available deployment for authenticated users via your
reverse proxy while restricting raw `IP:PORT` access. We won't cover any
details on how to configure your reverse proxy, as it depends on what you are
using.

As PromDash executes Prometheus queries directly from the client it is simpler
to use a single domain. This makes the server side ACL management simpler and
the client requests already authenticated. 

**Reverse proxy** (e.g. [nginx](http://nginx.org/), [HAProxy](http://www.haproxy.org/))
* Set up single domain.
 * Route `http(s)://dash.example.com/dash` to backend `localhost:3000`
 * Route `http(s)://dash.example.com/prom` to backend `localhost:9090`
* Configure the same ACL, e.g. HTTP basic auth for both backends.

**Run Prometheus** with binding only to localhost to restrict direct external
access over the network that would circumvent your authentication. Remember to
pass the path portion in `-web.external-url`. Example for Docker:
([full reference](http://prometheus.io/docs/introduction/install/#using-docker))

    docker run -p 127.0.0.1:9090:9090 -v /prometheus-data \
           prom/prometheus -config.file=/prometheus-data/prometheus.yml \
                           -web.external-url "http://dash.example.com/prom"

**Run PromDash** in a similar fashion. Once PromDash is running add a
Prometheus server with `http://dash.example.com/prom/` in the web UI at
`http://dash.example.com/dash`.

    docker run -p 127.0.0.1:3000:3000 -v /tmp/prom:/tmp/prom \
           -e DATABASE_URL=sqlite3:/tmp/prom/file.sqlite3 \
           -e PROMDASH_PATH_PREFIX=/dash \
           -e RAILS_RELATIVE_URL_ROOT=/dash \
           prom/promdash

Finally check that your reverse proxy is working as expected by visiting
`dash.example.com/dash` and `dash.example.com/prom`. Both should prompt you for
credentials, e.g. HTTP basic auth. You can use a Chrome incognito tab to force
authentication. Next visit the public facing IP address on the ports
`<IP>:3000/dash` and `<IP>:9090/prom` to verify they are in fact giving a page
load error.

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
